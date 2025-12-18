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
import { MaintenancePlan } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-maintenance-plans-list',
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
      <!-- زر الإضافة في أقصى اليسار -->
      <div class="flex justify-start mb-4">
        <a routerLink="/maintenance-plans/new" class="btn-add-success">
          <i class="pi pi-calendar-plus"></i>
          <span>إضافة خطة صيانة</span>
        </a>
      </div>
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>خطط الصيانة الوقائية</h2>
          <p>إدارة جداول الصيانة الدورية للأصول</p>
        </div>
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
            <div class="stat-icon green"><i class="pi pi-list-check"></i></div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">إجمالي الخطط</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><i class="pi pi-check-circle"></i></div>
            <div class="stat-value">{{ stats.active }}</div>
            <div class="stat-label">خطط نشطة</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="pi pi-calendar-clock"></i></div>
            <div class="stat-value">{{ stats.schedules }}</div>
            <div class="stat-label">جداول مجدولة</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><i class="pi pi-box"></i></div>
            <div class="stat-value">{{ stats.assetsCount }}</div>
            <div class="stat-label">أصول مشمولة</div>
          </div>
        </ng-container>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="form-label">الحالة</label>
              <p-select [options]="statusOptions" [(ngModel)]="filterActive" 
                        (onChange)="loadPlans()" placeholder="جميع الحالات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">التكرار</label>
              <p-select [options]="frequencyOptions" [(ngModel)]="filterFrequency" 
                        (onChange)="loadPlans()" placeholder="جميع التكرارات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">بحث</label>
              <input pInputText type="text" [(ngModel)]="searchTerm" 
                     (input)="onSearch()" placeholder="اسم الخطة..." class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
          <p class="loading-text">جاري تحميل خطط الصيانة...</p>
        </div>
        
        <p-table *ngIf="!loading" [value]="plans" [paginator]="true" [rows]="10"
                 [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} خطة"
                 styleClass="p-datatable-sm p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th>اسم الخطة</th>
              <th style="width: 100px">التكرار</th>
              <th style="width: 100px">المدة المقدرة</th>
              <th style="width: 120px">التكلفة المقدرة</th>
              <th style="width: 80px">الجداول</th>
              <th style="width: 80px">الحالة</th>
              <th style="width: 160px">إجراءات</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-plan>
            <tr>
              <td>
                <div class="font-semibold">{{ plan.name }}</div>
                <div class="text-slate-400 text-sm">{{ plan.description | slice:0:40 }}{{ plan.description?.length > 40 ? '...' : '' }}</div>
              </td>
              <td><p-tag [value]="getFrequencyLabel(getFrequencyType(plan), getFrequencyValue(plan))" severity="info"></p-tag></td>
              <td>{{ getEstimatedDuration(plan) ? getEstimatedDuration(plan) + ' ساعة' : '-' }}</td>
              <td class="font-mono">{{ getEstimatedCost(plan) ? (getEstimatedCost(plan) | number:'1.2-2') : '-' }}</td>
              <td class="text-center">{{ plan._count?.schedules || 0 }}</td>
              <td>
                <p-tag [value]="getIsActive(plan) ? 'نشط' : 'متوقف'" 
                       [severity]="getIsActive(plan) ? 'success' : 'secondary'"></p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small"
                            pTooltip="حذف" (click)="deletePlan(plan)"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"
                            pTooltip="تعديل" [routerLink]="['/maintenance-plans', plan.id, 'edit']"></p-button>
                  <p-button icon="pi pi-eye" [text]="true" severity="info" size="small"
                            pTooltip="عرض" [routerLink]="['/maintenance-plans', plan.id]"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7">
                <div class="empty-state">
                  <i class="pi pi-calendar"></i>
                  <h4>لا توجد خطط صيانة</h4>
                  <p>ابدأ بإنشاء خطة صيانة وقائية جديدة</p>
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
    .text-sm { font-size: 0.8rem; }
  `]
})
export class MaintenancePlansListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  plans: MaintenancePlan[] = [];
  loading = true;
  loadingStats = true;
  
  stats = { total: 0, active: 0, schedules: 0, assetsCount: 0 };
  filterActive: string | null = null;
  filterFrequency: string | null = null;
  searchTerm = '';
  private searchTimeout: any;
  
  statusOptions = [
    { label: 'نشط', value: 'true' },
    { label: 'متوقف', value: 'false' }
  ];
  
  frequencyOptions = [
    { label: 'يومي', value: 'daily' },
    { label: 'أسبوعي', value: 'weekly' },
    { label: 'شهري', value: 'monthly' },
    { label: 'ربع سنوي', value: 'quarterly' },
    { label: 'سنوي', value: 'yearly' }
  ];

  ngOnInit() {
    this.loadPlans();
    this.loadStats();
  }

  loadPlans() {
    this.loading = true;
    const isActive = this.filterActive === null ? undefined : this.filterActive === 'true';
    this.maintenanceService.getPlans(environment.defaultBusinessId, isActive).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.plans = response.data;
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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل الخطط' });
      }
    });
  }

  loadStats() {
    this.loadingStats = true;
    this.maintenanceService.getPlans(environment.defaultBusinessId, undefined).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          const plans = response.data;
          this.stats = {
            total: plans.length,
            active: plans.filter((p: any) => this.getIsActive(p)).length,
            schedules: plans.reduce((sum: number, p: any) => sum + (p._count?.schedules || 0), 0),
            assetsCount: new Set(plans.filter((p: any) => p.asset_id || p.assetId).map((p: any) => p.asset_id || p.assetId)).size
          };
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
    this.searchTimeout = setTimeout(() => this.loadPlans(), 300);
  }

  generateSchedules(plan: MaintenancePlan) {
    this.messageService.add({ severity: 'info', summary: 'قريباً', detail: 'سيتم إضافة هذه الميزة' });
  }

  deletePlan(plan: MaintenancePlan) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف خطة الصيانة "${plan.name}"?`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.maintenanceService.deletePlan(plan.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم',
              detail: 'تم حذف خطة الصيانة بنجاح'
            });
            this.loadPlans();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في حذف خطة الصيانة'
            });
          }
        });
      }
    });
  }

  toggleActive(plan: MaintenancePlan) {
    this.maintenanceService.updatePlan(plan.id, { isActive: !this.getIsActive(plan) }).subscribe({
      next: () => {
        this.loadPlans();
        this.loadStats();
        this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث حالة الخطة' });
      },
      error: (error) => {
        console.error('Error:', error);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحديث الحالة' });
      }
    });
  }

  getFrequencyLabel(type: string, value?: number): string {
    const labels: Record<string, string> = { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', quarterly: 'ربع سنوي', yearly: 'سنوي', hours_based: `كل ${value || 0} ساعة` };
    return labels[type] || type;
  }

  getFrequencyType(plan: any): string {
    return plan.frequency_type || plan.frequencyType || plan.frequency || 'monthly';
  }

  getFrequencyValue(plan: any): number {
    return plan.frequency_value || plan.frequencyValue || 1;
  }

  getEstimatedDuration(plan: any): number | null {
    return plan.estimated_duration || plan.estimatedDuration || null;
  }

  getEstimatedCost(plan: any): number | null {
    const cost = plan.estimated_cost || plan.estimatedCost;
    return cost ? Number(cost) : null;
  }

  getIsActive(plan: any): boolean {
    return plan.is_active !== undefined ? plan.is_active : (plan.isActive !== undefined ? plan.isActive : true);
  }
}
