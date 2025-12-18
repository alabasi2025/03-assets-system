import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { MaintenanceRequest, MaintenanceStatistics } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-maintenance-requests-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">طلبات الصيانة الطارئة</h1>
          <p class="text-gray-600">إدارة طلبات الصيانة التصحيحية والطارئة</p>
        </div>
        <button 
          routerLink="/maintenance-requests/new"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          طلب صيانة جديد
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="statistics">
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-red-500">
          <div class="text-sm text-gray-500">طلبات جديدة</div>
          <div class="text-2xl font-bold text-red-600">{{ getStatusCount('new') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-yellow-500">
          <div class="text-sm text-gray-500">قيد التنفيذ</div>
          <div class="text-2xl font-bold text-yellow-600">{{ getStatusCount('in_progress') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-blue-500">
          <div class="text-sm text-gray-500">معينة</div>
          <div class="text-2xl font-bold text-blue-600">{{ getStatusCount('assigned') }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-green-500">
          <div class="text-sm text-gray-500">مكتملة</div>
          <div class="text-2xl font-bold text-green-600">{{ getStatusCount('completed') }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select 
              [(ngModel)]="filters.status"
              (ngModelChange)="loadRequests()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع الحالات</option>
              <option value="new">جديد</option>
              <option value="assigned">معين</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="pending_parts">بانتظار قطع غيار</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
            <select 
              [(ngModel)]="filters.priority"
              (ngModelChange)="loadRequests()"
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

      <!-- Requests Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأصل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإبلاغ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let request of requests" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ request.requestNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ request.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ request.asset?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getTypeLabel(request.requestType) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getPriorityClass(request.priority)">
                    {{ getPriorityLabel(request.priority) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(request.status)">
                    {{ getStatusLabel(request.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ request.reportedAt | date:'yyyy-MM-dd HH:mm' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      [routerLink]="['/maintenance-requests', request.id]"
                      class="text-blue-600 hover:text-blue-800">
                      عرض
                    </button>
                    <button 
                      *ngIf="request.status === 'new'"
                      (click)="createWorkOrder(request)"
                      class="text-green-600 hover:text-green-800">
                      إنشاء أمر عمل
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="requests.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                  لا توجد طلبات صيانة
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
export class MaintenanceRequestsListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  
  requests: MaintenanceRequest[] = [];
  statistics: MaintenanceStatistics | null = null;
  meta: any = null;
  
  filters: any = {
    status: '',
    priority: '',
    page: 1,
    limit: 20,
  };

  Math = Math;

  ngOnInit() {
    this.loadRequests();
    this.loadStatistics();
  }

  loadRequests() {
    this.maintenanceService.getRequests(environment.defaultBusinessId, this.filters).subscribe({
      next: (response) => {
        this.requests = response.data;
        this.meta = response.meta;
      },
      error: (error) => console.error('Error loading requests:', error)
    });
  }

  loadStatistics() {
    this.maintenanceService.getRequestStatistics(environment.defaultBusinessId).subscribe({
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
    this.loadRequests();
  }

  createWorkOrder(request: MaintenanceRequest) {
    // Navigate to work order creation with request ID
    // router.navigate(['/work-orders/new'], { queryParams: { requestId: request.id } });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      breakdown: 'عطل',
      malfunction: 'خلل',
      damage: 'تلف',
      other: 'أخرى',
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
      new: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
      assigned: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      in_progress: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      pending_parts: 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      completed: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      cancelled: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
    };
    return classes[status] || classes['new'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      new: 'جديد',
      assigned: 'معين',
      in_progress: 'قيد التنفيذ',
      pending_parts: 'بانتظار قطع غيار',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  }
}
