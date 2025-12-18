import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { MaintenanceService } from '../../../core/services/maintenance.service';
import { WorkOrder, WorkOrderStatistics } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-work-orders-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, SelectModule,
    TagModule, SkeletonModule, ToastModule, ProgressSpinnerModule, TooltipModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>أوامر العمل</h2>
          <p>إدارة أوامر العمل والصيانة</p>
        </div>
        <a routerLink="/work-orders/new" class="btn-add-purple">
          <i class="pi pi-file-edit"></i>
          <span>أمر عمل جديد</span>
        </a>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <ng-container *ngIf="loadingStats">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5]">
            <div class="skeleton-icon"></div>
            <div class="skeleton-value"></div>
            <div class="skeleton-label"></div>
          </div>
        </ng-container>
        
        <ng-container *ngIf="!loadingStats">
          <div class="stat-card">
            <div class="stat-icon gray"><i class="pi pi-file"></i></div>
            <div class="stat-value">{{ getStatusCount('draft') }}</div>
            <div class="stat-label">مسودة</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><i class="pi pi-check"></i></div>
            <div class="stat-value">{{ getStatusCount('approved') }}</div>
            <div class="stat-label">معتمد</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="pi pi-clock"></i></div>
            <div class="stat-value">{{ getStatusCount('in_progress') }}</div>
            <div class="stat-label">قيد التنفيذ</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="pi pi-check-circle"></i></div>
            <div class="stat-value">{{ getStatusCount('completed') }}</div>
            <div class="stat-label">مكتمل</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><i class="pi pi-dollar"></i></div>
            <div class="stat-value">{{ statistics?.costs?.totalActual || 0 | number:'1.0-0' }}</div>
            <div class="stat-label">التكلفة الفعلية</div>
          </div>
        </ng-container>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="flex flex-col">
              <label class="form-label">الحالة</label>
              <p-select [options]="statusOptions" [(ngModel)]="filters.status" 
                        (onChange)="loadWorkOrders()" placeholder="جميع الحالات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">النوع</label>
              <p-select [options]="typeOptions" [(ngModel)]="filters.orderType" 
                        (onChange)="loadWorkOrders()" placeholder="جميع الأنواع"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">الأولوية</label>
              <p-select [options]="priorityOptions" [(ngModel)]="filters.priority" 
                        (onChange)="loadWorkOrders()" placeholder="جميع الأولويات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">بحث</label>
              <input pInputText type="text" [(ngModel)]="filters.search" 
                     (input)="onSearch()" placeholder="رقم الأمر..." class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
          <p class="loading-text">جاري تحميل أوامر العمل...</p>
        </div>
        
        <p-table *ngIf="!loading" [value]="workOrders" [paginator]="true" [rows]="10"
                 [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} أمر"
                 styleClass="p-datatable-sm p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 120px">رقم الأمر</th>
              <th>العنوان</th>
              <th>الأصل</th>
              <th style="width: 100px">النوع</th>
              <th style="width: 100px">الأولوية</th>
              <th style="width: 100px">الحالة</th>
              <th style="width: 110px">التكلفة</th>
              <th style="width: 160px">إجراءات</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-order>
            <tr>
              <td><span class="order-number">{{ order.workOrderNumber || order.work_order_number || '-' }}</span></td>
              <td class="font-semibold">{{ order.title }}</td>
              <td class="text-slate-500">{{ order.asset?.name || '-' }}</td>
              <td><p-tag [value]="getTypeLabel(order.orderType || order.order_type)" severity="info"></p-tag></td>
              <td><p-tag [value]="getPriorityLabel(order.priority)" [severity]="getPrioritySeverity(order.priority)"></p-tag></td>
              <td><p-tag [value]="getStatusLabel(order.status)" [severity]="getStatusSeverity(order.status)"></p-tag></td>
              <td class="font-mono">{{ order.actualCost || order.actual_cost || order.estimatedCost || order.estimated_cost || 0 | number:'1.2-2' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small"
                            pTooltip="حذف" (click)="deleteOrder(order)"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"
                            pTooltip="تعديل" [routerLink]="['/work-orders', order.id, 'edit']"></p-button>
                  <p-button icon="pi pi-eye" [text]="true" severity="info" size="small"
                            pTooltip="عرض" [routerLink]="['/work-orders', order.id]"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8">
                <div class="empty-state">
                  <i class="pi pi-file-edit"></i>
                  <h4>لا توجد أوامر عمل</h4>
                  <p>لم يتم إنشاء أي أوامر عمل بعد</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { padding: 1.5rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .font-mono { font-family: 'Courier New', monospace; }
    .order-number {
      background: rgba(59, 130, 246, 0.08);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #2563eb;
    }
  `]
})
export class WorkOrdersListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  workOrders: WorkOrder[] = [];
  statistics: WorkOrderStatistics | null = null;
  loading = true;
  loadingStats = true;
  
  filters: any = { status: '', orderType: '', priority: '', search: '', page: 1, limit: 20 };
  private searchTimeout: any;
  
  statusOptions = [
    { label: 'مسودة', value: 'draft' },
    { label: 'معتمد', value: 'approved' },
    { label: 'معين', value: 'assigned' },
    { label: 'قيد التنفيذ', value: 'in_progress' },
    { label: 'مكتمل', value: 'completed' },
    { label: 'مغلق', value: 'closed' },
    { label: 'ملغي', value: 'cancelled' }
  ];
  
  typeOptions = [
    { label: 'إصلاح', value: 'repair' },
    { label: 'استبدال', value: 'replacement' },
    { label: 'فحص', value: 'inspection' },
    { label: 'ترقية', value: 'upgrade' }
  ];
  
  priorityOptions = [
    { label: 'حرجة', value: 'critical' },
    { label: 'عالية', value: 'high' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'منخفضة', value: 'low' }
  ];

  ngOnInit() {
    this.loadWorkOrders();
    this.loadStatistics();
  }

  loadWorkOrders() {
    this.loading = true;
    this.maintenanceService.getWorkOrders(environment.defaultBusinessId, this.filters).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.workOrders = response.data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error:', error);
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل أوامر العمل' });
      }
    });
  }

  loadStatistics() {
    this.loadingStats = true;
    this.maintenanceService.getWorkOrderStatistics(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.statistics = response.data;
          this.loadingStats = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.loadingStats = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadWorkOrders(), 300);
  }

  getStatusCount(status: string): number {
    if (!this.statistics?.byStatus) return 0;
    const found = this.statistics.byStatus.find((s: any) => s.status === status);
    return found?._count || 0;
  }

  approveOrder(order: WorkOrder) {
    this.maintenanceService.updateWorkOrderStatus(order.id, 'approved').subscribe({
      next: () => {
        this.loadWorkOrders();
        this.loadStatistics();
        this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم اعتماد أمر العمل' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في اعتماد الأمر' })
    });
  }

  startOrder(order: WorkOrder) {
    this.maintenanceService.updateWorkOrderStatus(order.id, 'in_progress').subscribe({
      next: () => {
        this.loadWorkOrders();
        this.loadStatistics();
        this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم بدء أمر العمل' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في بدء الأمر' })
    });
  }

  completeOrder(order: WorkOrder) {
    this.maintenanceService.updateWorkOrderStatus(order.id, 'completed').subscribe({
      next: () => {
        this.loadWorkOrders();
        this.loadStatistics();
        this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنهاء أمر العمل' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في إنهاء الأمر' })
    });
  }

  deleteOrder(order: WorkOrder) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف أمر العمل "${order.title}"?`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.maintenanceService.deleteWorkOrder(order.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم',
              detail: 'تم حذف أمر العمل بنجاح'
            });
            this.loadWorkOrders();
            this.loadStatistics();
          },
          error: (error: any) => {
            console.error('Error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في حذف أمر العمل'
            });
          }
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { repair: 'إصلاح', replacement: 'استبدال', inspection: 'فحص', upgrade: 'ترقية' };
    return labels[type] || type || '-';
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = { critical: 'حرجة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    return labels[priority] || priority;
  }

  getPrioritySeverity(priority: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const map: Record<string, "danger" | "warn" | "info" | "success"> = { critical: 'danger', high: 'warn', medium: 'info', low: 'success' };
    return map[priority] || 'info';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { draft: 'مسودة', approved: 'معتمد', assigned: 'معين', in_progress: 'قيد التنفيذ', completed: 'مكتمل', closed: 'مغلق', cancelled: 'ملغي' };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const map: Record<string, "secondary" | "info" | "warn" | "success" | "danger"> = { draft: 'secondary', approved: 'info', assigned: 'info', in_progress: 'warn', completed: 'success', closed: 'secondary', cancelled: 'danger' };
    return map[status] || 'secondary';
  }
}
