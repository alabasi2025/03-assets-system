import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { WorkOrder, WorkOrderStatistics } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-work-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">أوامر العمل</h1>
          <p class="text-gray-600">إدارة أوامر العمل والصيانة</p>
        </div>
        <button 
          routerLink="/work-orders/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          أمر عمل جديد
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6" *ngIf="statistics">
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-gray-500">
          <div class="text-sm text-gray-500">مسودة</div>
          <div class="text-2xl font-bold text-gray-600">{{ getStatusCount('draft') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-blue-500">
          <div class="text-sm text-gray-500">معتمد</div>
          <div class="text-2xl font-bold text-blue-600">{{ getStatusCount('approved') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-yellow-500">
          <div class="text-sm text-gray-500">قيد التنفيذ</div>
          <div class="text-2xl font-bold text-yellow-600">{{ getStatusCount('in_progress') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-green-500">
          <div class="text-sm text-gray-500">مكتمل</div>
          <div class="text-2xl font-bold text-green-600">{{ getStatusCount('completed') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-purple-500">
          <div class="text-sm text-gray-500">التكلفة الفعلية</div>
          <div class="text-2xl font-bold text-purple-600">{{ statistics.costs?.totalActual | number:'1.2-2' }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select 
              [(ngModel)]="filters.status"
              (ngModelChange)="loadWorkOrders()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="approved">معتمد</option>
              <option value="assigned">معين</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="closed">مغلق</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">النوع</label>
            <select 
              [(ngModel)]="filters.orderType"
              (ngModelChange)="loadWorkOrders()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع الأنواع</option>
              <option value="repair">إصلاح</option>
              <option value="replacement">استبدال</option>
              <option value="inspection">فحص</option>
              <option value="upgrade">ترقية</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
            <select 
              [(ngModel)]="filters.priority"
              (ngModelChange)="loadWorkOrders()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع الأولويات</option>
              <option value="critical">حرجة</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Work Orders Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الأمر</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأصل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let order of workOrders" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ order.workOrderNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ order.asset?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getTypeLabel(order.orderType) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getPriorityClass(order.priority)">
                    {{ getPriorityLabel(order.priority) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.actualCost ? (order.actualCost | number:'1.2-2') : (order.estimatedCost | number:'1.2-2') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      [routerLink]="['/work-orders', order.id]"
                      class="text-blue-600 hover:text-blue-800">
                      عرض
                    </button>
                    <button 
                      *ngIf="order.status === 'draft'"
                      (click)="approveOrder(order)"
                      class="text-green-600 hover:text-green-800">
                      اعتماد
                    </button>
                    <button 
                      *ngIf="order.status === 'approved' || order.status === 'assigned'"
                      (click)="startOrder(order)"
                      class="text-yellow-600 hover:text-yellow-800">
                      بدء
                    </button>
                    <button 
                      *ngIf="order.status === 'in_progress'"
                      (click)="completeOrder(order)"
                      class="text-green-600 hover:text-green-800">
                      إنهاء
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="workOrders.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                  لا توجد أوامر عمل
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-3 flex justify-between items-center" *ngIf="meta">
          <div class="text-sm text-gray-500">
            عرض {{ (meta.page - 1) * meta.limit + 1 }} - {{ Math.min(meta.page * meta.limit, meta.total) }} من {{ meta.total }}
          </div>
          <div class="flex gap-2">
            <button 
              (click)="goToPage(meta.page - 1)"
              [disabled]="meta.page <= 1"
              class="px-3 py-1 border rounded disabled:opacity-50">
              السابق
            </button>
            <button 
              (click)="goToPage(meta.page + 1)"
              [disabled]="meta.page >= meta.totalPages"
              class="px-3 py-1 border rounded disabled:opacity-50">
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkOrdersListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  
  workOrders: WorkOrder[] = [];
  statistics: WorkOrderStatistics | null = null;
  meta: any = null;
  
  filters: any = {
    status: '',
    orderType: '',
    priority: '',
    page: 1,
    limit: 20,
  };

  Math = Math;

  ngOnInit() {
    this.loadWorkOrders();
    this.loadStatistics();
  }

  loadWorkOrders() {
    this.maintenanceService.getWorkOrders(environment.defaultBusinessId, this.filters).subscribe({
      next: (response) => {
        this.workOrders = response.data;
        this.meta = response.meta;
      },
      error: (error) => console.error('Error loading work orders:', error)
    });
  }

  loadStatistics() {
    this.maintenanceService.getWorkOrderStatistics(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.statistics = response.data;
      },
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  getStatusCount(status: string): number {
    if (!this.statistics) return 0;
    const found = this.statistics.byStatus.find(s => s.status === status);
    return found?._count || 0;
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.loadWorkOrders();
  }

  approveOrder(order: WorkOrder) {
    this.maintenanceService.approveWorkOrder(order.id, 'current-user').subscribe({
      next: () => {
        this.loadWorkOrders();
        this.loadStatistics();
      },
      error: (error) => console.error('Error approving order:', error)
    });
  }

  startOrder(order: WorkOrder) {
    this.maintenanceService.startWorkOrder(order.id).subscribe({
      next: () => {
        this.loadWorkOrders();
        this.loadStatistics();
      },
      error: (error) => console.error('Error starting order:', error)
    });
  }

  completeOrder(order: WorkOrder) {
    const actualCost = prompt('أدخل التكلفة الفعلية:');
    this.maintenanceService.completeWorkOrder(order.id, actualCost ? Number(actualCost) : undefined).subscribe({
      next: () => {
        this.loadWorkOrders();
        this.loadStatistics();
      },
      error: (error) => console.error('Error completing order:', error)
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      repair: 'إصلاح',
      replacement: 'استبدال',
      inspection: 'فحص',
      upgrade: 'ترقية',
    };
    return labels[type] || type;
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      critical: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
      high: 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      medium: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      low: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    };
    return classes[priority] || classes['medium'];
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      critical: 'حرجة',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
    };
    return labels[priority] || priority;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
      approved: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      assigned: 'px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800',
      in_progress: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      completed: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      closed: 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      cancelled: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
    };
    return classes[status] || classes['draft'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      approved: 'معتمد',
      assigned: 'معين',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      closed: 'مغلق',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  }
}
