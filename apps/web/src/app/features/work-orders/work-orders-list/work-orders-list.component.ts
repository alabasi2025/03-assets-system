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
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>أوامر العمل</h1>
          <p>إدارة أوامر العمل والصيانة</p>
        </div>
        <button routerLink="/work-orders/new" class="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          أمر عمل جديد
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="statistics">
        <div class="stat-card border-gray">
          <div class="stat-icon gray">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="stat-value">{{ getStatusCount('draft') }}</div>
          <div class="stat-label">مسودة</div>
        </div>
        <div class="stat-card border-blue">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value blue">{{ getStatusCount('approved') }}</div>
          <div class="stat-label">معتمد</div>
        </div>
        <div class="stat-card border-yellow">
          <div class="stat-icon yellow">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value yellow">{{ getStatusCount('in_progress') }}</div>
          <div class="stat-label">قيد التنفيذ</div>
        </div>
        <div class="stat-card border-green">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div class="stat-value green">{{ getStatusCount('completed') }}</div>
          <div class="stat-label">مكتمل</div>
        </div>
        <div class="stat-card border-purple">
          <div class="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value purple">{{ statistics.costs?.totalActual || 0 | number:'1.2-2' }}</div>
          <div class="stat-label">التكلفة الفعلية</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label>الحالة</label>
            <select [(ngModel)]="filters.status" (ngModelChange)="loadWorkOrders()" class="form-control">
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
          <div class="filter-group">
            <label>النوع</label>
            <select [(ngModel)]="filters.orderType" (ngModelChange)="loadWorkOrders()" class="form-control">
              <option value="">جميع الأنواع</option>
              <option value="repair">إصلاح</option>
              <option value="replacement">استبدال</option>
              <option value="inspection">فحص</option>
              <option value="upgrade">ترقية</option>
            </select>
          </div>
          <div class="filter-group">
            <label>الأولوية</label>
            <select [(ngModel)]="filters.priority" (ngModelChange)="loadWorkOrders()" class="form-control">
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
      <div class="table-card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>رقم الأمر</th>
                <th>العنوان</th>
                <th>الأصل</th>
                <th>النوع</th>
                <th>الأولوية</th>
                <th>الحالة</th>
                <th>التكلفة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of workOrders">
                <td class="font-medium">{{ order.workOrderNumber }}</td>
                <td>{{ order.title }}</td>
                <td class="text-muted">{{ order.asset?.name || '-' }}</td>
                <td>{{ getTypeLabel(order.orderType) }}</td>
                <td>
                  <span [class]="'badge ' + getPriorityClass(order.priority)">
                    {{ getPriorityLabel(order.priority) }}
                  </span>
                </td>
                <td>
                  <span [class]="'badge ' + getStatusClass(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="number">{{ order.actualCost ? (order.actualCost | number:'1.2-2') : (order.estimatedCost | number:'1.2-2') }}</td>
                <td>
                  <div class="action-buttons">
                    <button [routerLink]="['/work-orders', order.id]" class="action-btn view">عرض</button>
                    <button *ngIf="order.status === 'draft'" (click)="approveOrder(order)" class="action-btn edit">اعتماد</button>
                    <button *ngIf="order.status === 'approved' || order.status === 'assigned'" (click)="startOrder(order)" class="action-btn warning">بدء</button>
                    <button *ngIf="order.status === 'in_progress'" (click)="completeOrder(order)" class="action-btn edit">إنهاء</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="workOrders.length === 0">
                <td colspan="8" class="empty-state">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p>لا توجد أوامر عمل</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="meta && meta.total > 0">
          <div class="pagination-info">
            عرض {{ (meta.page - 1) * meta.limit + 1 }} - {{ Math.min(meta.page * meta.limit, meta.total) }} من {{ meta.total }}
          </div>
          <div class="pagination-buttons">
            <button (click)="goToPage(meta.page - 1)" [disabled]="meta.page <= 1" class="btn btn-secondary btn-sm">السابق</button>
            <button (click)="goToPage(meta.page + 1)" [disabled]="meta.page >= meta.totalPages" class="btn btn-secondary btn-sm">التالي</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    
    .page-header p { color: #6b7280; font-size: 0.95rem; }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm { padding: 6px 14px; font-size: 0.85rem; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      border-right: 4px solid transparent;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    
    .stat-card.border-gray { border-right-color: #6b7280; }
    .stat-card.border-blue { border-right-color: #3b82f6; }
    .stat-card.border-yellow { border-right-color: #f59e0b; }
    .stat-card.border-green { border-right-color: #22c55e; }
    .stat-card.border-purple { border-right-color: #a855f7; }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .stat-icon.gray { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
    .stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-icon.yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .stat-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .stat-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    
    .stat-value.blue { color: #3b82f6; }
    .stat-value.yellow { color: #f59e0b; }
    .stat-value.green { color: #22c55e; }
    .stat-value.purple { color: #a855f7; }
    
    .stat-label { font-size: 0.85rem; color: #6b7280; }
    
    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .filter-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }
    
    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .table-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .table-container { overflow-x: auto; }
    
    table { width: 100%; border-collapse: collapse; }
    
    table th {
      background: #f8fafc;
      padding: 14px 16px;
      text-align: right;
      font-weight: 600;
      color: #475569;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    table td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      font-size: 0.9rem;
    }
    
    table tr:hover { background: #f8fafc; }
    table tr:last-child td { border-bottom: none; }
    
    .font-medium { font-weight: 600; color: #1e3a5f; }
    .text-muted { color: #6b7280; }
    .number { font-family: 'Courier New', monospace; font-weight: 500; }
    
    .badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
    .badge-warning { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .badge-info { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    .badge-success { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .badge-secondary { background: rgba(107, 114, 128, 0.1); color: #4b5563; }
    .badge-purple { background: rgba(168, 85, 247, 0.1); color: #9333ea; }
    .badge-orange { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
    
    .action-buttons { display: flex; gap: 8px; }
    
    .action-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    
    .action-btn.view { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .action-btn.edit { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .action-btn.warning { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .action-btn:hover { transform: scale(1.05); }
    
    .empty-state {
      text-align: center;
      padding: 48px 20px !important;
      color: #9ca3af;
    }
    
    .empty-state svg { margin: 0 auto 16px; color: #d1d5db; }
    .empty-state p { font-size: 1rem; color: #6b7280; }
    
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    
    .pagination-info { color: #6b7280; font-size: 0.85rem; }
    .pagination-buttons { display: flex; gap: 8px; }
  `]
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
      critical: 'badge-danger',
      high: 'badge-orange',
      medium: 'badge-warning',
      low: 'badge-success',
    };
    return classes[priority] || 'badge-warning';
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
      draft: 'badge-secondary',
      approved: 'badge-info',
      assigned: 'badge-purple',
      in_progress: 'badge-warning',
      completed: 'badge-success',
      closed: 'badge-purple',
      cancelled: 'badge-danger',
    };
    return classes[status] || 'badge-secondary';
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
