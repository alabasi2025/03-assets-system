import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AssetsService } from '../../../core/services/assets.service';
import { AssetCategory, AssetQueryParams } from '../../../core/models/asset.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CardModule,
    TagModule,
    SkeletonModule,
    ToastModule,
    ProgressSpinnerModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in">
      <!-- زر الإضافة في أقصى اليسار -->
      <div class="flex justify-start mb-4">
        <a routerLink="/assets/new" class="btn-add-primary">
          <i class="pi pi-plus"></i>
          <span>إضافة أصل جديد</span>
        </a>
      </div>
      
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>إدارة الأصول</h2>
          <p>عرض وإدارة جميع الأصول المسجلة في النظام</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <!-- Loading Skeleton for Stats -->
        <ng-container *ngIf="loadingStats">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4]">
            <div class="skeleton-icon"></div>
            <div class="skeleton-value"></div>
            <div class="skeleton-label"></div>
          </div>
        </ng-container>
        
        <!-- Actual Stats -->
        <ng-container *ngIf="!loadingStats && statistics">
          <div class="stat-card">
            <div class="stat-icon blue">
              <i class="pi pi-box"></i>
            </div>
            <div class="stat-value">{{ statistics.summary?.totalAssets || 0 | number }}</div>
            <div class="stat-label">إجمالي الأصول</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon green">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-value">{{ statistics.summary?.activeAssets || 0 | number }}</div>
            <div class="stat-label">الأصول النشطة</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon purple">
              <i class="pi pi-wallet"></i>
            </div>
            <div class="stat-value">{{ statistics.summary?.totalBookValue || 0 | number:'1.2-2' }}</div>
            <div class="stat-label">القيمة الدفترية</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon orange">
              <i class="pi pi-chart-line"></i>
            </div>
            <div class="stat-value">{{ statistics.summary?.totalDepreciation || 0 | number:'1.2-2' }}</div>
            <div class="stat-label">إجمالي الإهلاك</div>
          </div>
        </ng-container>
      </div>

      <!-- Filters Card -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="flex flex-col">
              <label class="form-label">التصنيف</label>
              <p-select [options]="categoryOptions" [(ngModel)]="filters.categoryId" 
                        (onChange)="loadAssets()" placeholder="جميع التصنيفات"
                        [showClear]="true" styleClass="w-full" appendTo="body"></p-select>
            </div>
            
            <div class="flex flex-col">
              <label class="form-label">الحالة</label>
              <p-select [options]="statusOptions" [(ngModel)]="filters.status" 
                        (onChange)="loadAssets()" placeholder="جميع الحالات"
                        [showClear]="true" styleClass="w-full" appendTo="body"></p-select>
            </div>
            
            <div class="flex flex-col">
              <label class="form-label">الحالة الفنية</label>
              <p-select [options]="conditionOptions" [(ngModel)]="filters.condition" 
                        (onChange)="loadAssets()" placeholder="جميع الحالات الفنية"
                        [showClear]="true" styleClass="w-full" appendTo="body"></p-select>
            </div>
            
            <div class="flex flex-col">
              <label class="form-label">بحث</label>
              <input pInputText type="text" [(ngModel)]="filters.search" 
                     (input)="onSearch()" placeholder="رقم الأصل، الاسم..." class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Assets Table -->
      <div class="card">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
          <p class="loading-text">جاري تحميل الأصول...</p>
        </div>
        
        <!-- Table -->
        <p-table *ngIf="!loading" [value]="assets" [paginator]="true" [rows]="10"
                 [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} أصل"
                 styleClass="p-datatable-sm p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 120px">رقم الأصل</th>
              <th>الاسم</th>
              <th>التصنيف</th>
              <th style="width: 140px">تكلفة الاقتناء</th>
              <th style="width: 140px">القيمة الدفترية</th>
              <th style="width: 100px">الحالة</th>
              <th style="width: 100px">الحالة الفنية</th>
              <th style="width: 140px">إجراءات</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-asset>
            <tr>
              <td>
                <span class="asset-number">{{ getAssetNumber(asset) }}</span>
              </td>
              <td>
                <div class="font-semibold text-slate-800">{{ asset.name }}</div>
                <div class="text-xs text-slate-400" *ngIf="getAssetModel(asset)">{{ getAssetModel(asset) }}</div>
              </td>
              <td class="text-slate-500">{{ getCategoryName(asset) }}</td>
              <td class="font-mono">{{ getAcquisitionCost(asset) | number:'1.2-2' }}</td>
              <td class="font-mono text-green-600 font-semibold">{{ getBookValue(asset) | number:'1.2-2' }}</td>
              <td>
                <p-tag [value]="getStatusLabel(getStatus(asset))" [severity]="getStatusSeverity(getStatus(asset))"></p-tag>
              </td>
              <td>
                <p-tag [value]="getConditionLabel(getCondition(asset))" [severity]="getConditionSeverity(getCondition(asset))"></p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-eye" [text]="true" severity="info" size="small"
                            pTooltip="عرض" [routerLink]="['/assets', asset.id]"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" severity="warn" size="small"
                            pTooltip="تعديل" [routerLink]="['/assets', asset.id, 'edit']"></p-button>
                  <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small"
                            pTooltip="حذف" (click)="confirmDelete(asset)"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8">
                <div class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <h4>لا توجد أصول مسجلة</h4>
                  <p>ابدأ بإضافة أصل جديد</p>
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
    .asset-number {
      background: rgba(59, 130, 246, 0.08);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #1d4ed8;
    }
  `]
})
export class AssetsListComponent implements OnInit {
  private assetsService = inject(AssetsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  assets: any[] = [];
  categories: AssetCategory[] = [];
  statistics: any = null;
  
  loading = true;
  loadingStats = true;
  
  filters: AssetQueryParams = {
    businessId: environment.defaultBusinessId,
    page: 1,
    limit: 20,
  };
  
  categoryOptions: any[] = [];
  
  statusOptions = [
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' },
    { label: 'تحت الصيانة', value: 'under_maintenance' },
    { label: 'مستبعد', value: 'disposed' }
  ];
  
  conditionOptions = [
    { label: 'ممتاز', value: 'excellent' },
    { label: 'جيد', value: 'good' },
    { label: 'مقبول', value: 'fair' },
    { label: 'ضعيف', value: 'poor' },
    { label: 'تالف', value: 'damaged' }
  ];

  private searchTimeout: any;

  ngOnInit() {
    this.loadCategories();
    this.loadAssets();
    this.loadStatistics();
  }

  loadCategories() {
    this.assetsService.getCategories({ businessId: environment.defaultBusinessId }).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.categories = response.data;
          this.categoryOptions = this.categories.map(c => ({
            label: c.name,
            value: c.id
          }));
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل التصنيفات'
        });
      }
    });
  }

  loadAssets() {
    this.loading = true;
    this.assetsService.getAssets(this.filters).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.assets = response.data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل الأصول'
        });
      }
    });
  }

  loadStatistics() {
    this.loadingStats = true;
    this.assetsService.getAssetStatistics(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.statistics = response.data;
          this.loadingStats = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.ngZone.run(() => {
          this.loadingStats = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.page = 1;
      this.loadAssets();
    }, 300);
  }

  confirmDelete(asset: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الأصل "${asset.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteAsset(asset);
      }
    });
  }

  deleteAsset(asset: any) {
    this.assetsService.deleteAsset(asset.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم',
          detail: 'تم حذف الأصل بنجاح'
        });
        this.loadAssets();
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Error deleting asset:', error);
        
        let errorMessage = 'فشل في حذف الأصل';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'الأصل غير موجود';
        } else if (error.status === 409) {
          errorMessage = 'لا يمكن حذف الأصل لوجود عمليات مرتبطة به';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: errorMessage
        });
      }
    });
  }

  // Helper methods
  getAssetNumber(asset: any): string {
    return asset.asset_number || asset.assetNumber || '-';
  }

  getAssetModel(asset: any): string {
    return asset.model || '';
  }

  getCategoryName(asset: any): string {
    return asset.category?.name || '-';
  }

  getAcquisitionCost(asset: any): number {
    const cost = asset.acquisition_cost || asset.acquisitionCost;
    return cost ? Number(cost) : 0;
  }

  getBookValue(asset: any): number {
    const value = asset.book_value || asset.bookValue;
    return value ? Number(value) : this.getAcquisitionCost(asset);
  }

  getStatus(asset: any): string {
    return asset.status || 'active';
  }

  getCondition(asset: any): string {
    return asset.condition || 'good';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'نشط',
      inactive: 'غير نشط',
      under_maintenance: 'تحت الصيانة',
      disposed: 'مستبعد'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger"> = {
      active: 'success',
      inactive: 'secondary',
      under_maintenance: 'warn',
      disposed: 'danger'
    };
    return severities[status] || 'info';
  }

  getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
      excellent: 'ممتاز',
      good: 'جيد',
      fair: 'مقبول',
      poor: 'ضعيف',
      damaged: 'تالف'
    };
    return labels[condition] || condition;
  }

  getConditionSeverity(condition: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger"> = {
      excellent: 'success',
      good: 'info',
      fair: 'warn',
      poor: 'warn',
      damaged: 'danger'
    };
    return severities[condition] || 'secondary';
  }
}
