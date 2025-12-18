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
import { MaintenanceRequest, MaintenanceStatistics } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-maintenance-requests-list',
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
          <h2>طلبات الصيانة الطارئة</h2>
          <p>إدارة طلبات الصيانة التصحيحية والطارئة</p>
        </div>
        <p-button label="طلب صيانة جديد" icon="pi pi-plus" 
                  severity="danger" [routerLink]="['/maintenance-requests/new']"></p-button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <ng-container *ngIf="loadingStats">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4]">
            <div class="skeleton-icon"></div>
            <div class="skeleton-value"></div>
            <div class="skeleton-label"></div>
          </div>
        </ng-container>
        
        <ng-container *ngIf="!loadingStats">
          <div class="stat-card">
            <div class="stat-icon red"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="stat-value">{{ getStatusCount('new') + getStatusCount('pending') }}</div>
            <div class="stat-label">طلبات جديدة</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="pi pi-clock"></i></div>
            <div class="stat-value">{{ getStatusCount('in_progress') }}</div>
            <div class="stat-label">قيد التنفيذ</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><i class="pi pi-user"></i></div>
            <div class="stat-value">{{ getStatusCount('assigned') }}</div>
            <div class="stat-label">معينة</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="pi pi-check-circle"></i></div>
            <div class="stat-value">{{ getStatusCount('completed') }}</div>
            <div class="stat-label">مكتملة</div>
          </div>
        </ng-container>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="form-label">الحالة</label>
              <p-select [options]="statusOptions" [(ngModel)]="filters.status" 
                        (onChange)="loadRequests()" placeholder="جميع الحالات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">الأولوية</label>
              <p-select [options]="priorityOptions" [(ngModel)]="filters.priority" 
                        (onChange)="loadRequests()" placeholder="جميع الأولويات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">بحث</label>
              <input pInputText type="text" [(ngModel)]="filters.search" 
                     (input)="onSearch()" placeholder="رقم الطلب، الوصف..." class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
          <p class="loading-text">جاري تحميل طلبات الصيانة...</p>
        </div>
        
        <p-table *ngIf="!loading" [value]="requests" [paginator]="true" [rows]="10"
                 [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} طلب"
                 styleClass="p-datatable-sm p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 120px">رقم الطلب</th>
              <th>العنوان</th>
              <th>الأصل</th>
              <th style="width: 100px">النوع</th>
              <th style="width: 100px">الأولوية</th>
              <th style="width: 100px">الحالة</th>
              <th style="width: 120px">تاريخ الإبلاغ</th>
              <th style="width: 140px">إجراءات</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-request>
            <tr>
              <td><span class="request-number">{{ getRequestNumber(request) }}</span></td>
              <td class="font-semibold">{{ request.title }}</td>
              <td class="text-slate-500">{{ request.asset?.name || '-' }}</td>
              <td><p-tag [value]="getTypeLabel(getRequestType(request))" [severity]="getTypeSeverity(getRequestType(request))"></p-tag></td>
              <td><p-tag [value]="getPriorityLabel(request.priority)" [severity]="getPrioritySeverity(request.priority)"></p-tag></td>
              <td><p-tag [value]="getStatusLabel(request.status)" [severity]="getStatusSeverity(request.status)"></p-tag></td>
              <td class="text-slate-500">{{ getReportedAt(request) | date:'yyyy-MM-dd' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small"
                            pTooltip="حذف" (click)="deleteRequest(request)"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"
                            pTooltip="تعديل" [routerLink]="['/maintenance-requests', request.id, 'edit']"></p-button>
                  <p-button icon="pi pi-eye" [text]="true" severity="info" size="small"
                            pTooltip="عرض" [routerLink]="['/maintenance-requests', request.id]"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8">
                <div class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <h4>لا توجد طلبات صيانة</h4>
                  <p>ابدأ بإنشاء طلب صيانة جديد</p>
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
    .request-number {
      background: rgba(239, 68, 68, 0.08);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #dc2626;
    }
  `]
})
export class MaintenanceRequestsListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  requests: MaintenanceRequest[] = [];
  statistics: MaintenanceStatistics | null = null;
  loading = true;
  loadingStats = true;
  
  filters: any = { status: '', priority: '', search: '', page: 1, limit: 20 };
  private searchTimeout: any;
  
  statusOptions = [
    { label: 'جديد', value: 'new' },
    { label: 'معين', value: 'assigned' },
    { label: 'قيد التنفيذ', value: 'in_progress' },
    { label: 'بانتظار قطع غيار', value: 'pending_parts' },
    { label: 'مكتمل', value: 'completed' },
    { label: 'ملغي', value: 'cancelled' }
  ];
  
  priorityOptions = [
    { label: 'حرجة', value: 'critical' },
    { label: 'عالية', value: 'high' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'منخفضة', value: 'low' }
  ];

  ngOnInit() {
    this.loadRequests();
    this.loadStatistics();
  }

  loadRequests() {
    this.loading = true;
    this.maintenanceService.getRequests(environment.defaultBusinessId, this.filters).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.requests = response.data;
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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل الطلبات' });
      }
    });
  }

  loadStatistics() {
    this.loadingStats = true;
    this.maintenanceService.getRequestStatistics(environment.defaultBusinessId).subscribe({
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
    this.searchTimeout = setTimeout(() => this.loadRequests(), 300);
  }

  getStatusCount(status: string): number {
    if (!this.statistics) return 0;
    const found = this.statistics.byStatus?.find((s: any) => s.status === status);
    return found?._count || 0;
  }

  createWorkOrder(request: MaintenanceRequest) {
    this.messageService.add({ severity: 'info', summary: 'قريباً', detail: 'سيتم إضافة هذه الميزة' });
  }

  deleteRequest(request: MaintenanceRequest) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف طلب الصيانة "${request.title}"?`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.maintenanceService.deleteRequest(request.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم',
              detail: 'تم حذف طلب الصيانة بنجاح'
            });
            this.loadRequests();
            this.loadStatistics();
          },
          error: (error: any) => {
            console.error('Error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في حذف طلب الصيانة'
            });
          }
        });
      }
    });
  }

  getRequestNumber(request: any): string {
    return request.request_number || request.requestNumber || '-';
  }

  getReportedAt(request: any): string {
    return request.reported_at || request.reportedAt || request.created_at || request.createdAt;
  }

  getRequestType(request: any): string {
    return request.request_type || request.requestType || 'corrective';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { breakdown: 'عطل', malfunction: 'خلل', damage: 'تلف', corrective: 'تصحيحية', preventive: 'وقائية', emergency: 'طارئة', other: 'أخرى' };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const map: Record<string, "warn" | "info" | "danger" | "secondary"> = { breakdown: 'danger', malfunction: 'warn', damage: 'danger', corrective: 'warn', preventive: 'info', emergency: 'danger', other: 'secondary' };
    return map[type] || 'secondary';
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
    const labels: Record<string, string> = { new: 'جديد', pending: 'جديد', assigned: 'معين', in_progress: 'قيد التنفيذ', pending_parts: 'بانتظار قطع غيار', completed: 'مكتمل', cancelled: 'ملغي' };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const map: Record<string, "danger" | "warn" | "info" | "success" | "secondary"> = { new: 'danger', pending: 'danger', assigned: 'info', in_progress: 'warn', pending_parts: 'warn', completed: 'success', cancelled: 'secondary' };
    return map[status] || 'secondary';
  }
}
