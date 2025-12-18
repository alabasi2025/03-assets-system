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

import { SparePartsService } from '../../../core/services/spare-parts.service';
import { SparePart, SparePartCategory, SparePartStatistics } from '../../../core/models/spare-part.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-spare-parts-list',
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
        <a routerLink="/spare-parts/new" class="btn-add-primary">
          <i class="pi pi-plus"></i>
          <span>إضافة قطعة غيار</span>
        </a>
        <div>
          <h2>قطع الغيار</h2>
          <p>إدارة مخزون قطع الغيار</p>
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
            <div class="stat-icon blue"><i class="pi pi-box"></i></div>
            <div class="stat-value">{{ statistics?.totalParts || 0 }}</div>
            <div class="stat-label">إجمالي الأصناف</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="pi pi-exclamation-circle"></i></div>
            <div class="stat-value">{{ statistics?.criticalParts || 0 }}</div>
            <div class="stat-label">أصناف حرجة</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="stat-value">{{ statistics?.lowStockParts || 0 }}</div>
            <div class="stat-label">نقص في المخزون</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="pi pi-dollar"></i></div>
            <div class="stat-value">{{ statistics?.stockValue?.totalValue || 0 | number:'1.0-0' }}</div>
            <div class="stat-label">قيمة المخزون</div>
          </div>
        </ng-container>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="flex flex-col">
              <label class="form-label">بحث</label>
              <input pInputText type="text" [(ngModel)]="filters.search" 
                     (input)="onSearch()" placeholder="كود القطعة، الاسم..." class="w-full" />
            </div>
            <div class="flex flex-col">
              <label class="form-label">التصنيف</label>
              <p-select [options]="categoryOptions" [(ngModel)]="filters.categoryId" 
                        (onChange)="loadParts()" placeholder="جميع التصنيفات"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">حرجة فقط</label>
              <p-select [options]="criticalOptions" [(ngModel)]="filters.isCritical" 
                        (onChange)="loadParts()" placeholder="الكل"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col">
              <label class="form-label">نقص المخزون</label>
              <p-select [options]="stockOptions" [(ngModel)]="filters.lowStock" 
                        (onChange)="loadParts()" placeholder="الكل"
                        [showClear]="true" styleClass="w-full"></p-select>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
          <p class="loading-text">جاري تحميل قطع الغيار...</p>
        </div>
        
        <p-table *ngIf="!loading" [value]="parts" [paginator]="true" [rows]="10"
                 [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} قطعة"
                 styleClass="p-datatable-sm p-datatable-striped">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 120px">كود القطعة</th>
              <th>الاسم</th>
              <th>التصنيف</th>
              <th style="width: 80px">الوحدة</th>
              <th style="width: 100px">المخزون</th>
              <th style="width: 100px">حد الطلب</th>
              <th style="width: 110px">سعر الوحدة</th>
              <th style="width: 80px">حرجة</th>
              <th style="width: 140px">إجراءات</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-part>
            <tr [class.low-stock-row]="isLowStock(part)">
              <td><span class="part-code">{{ getPartCode(part) }}</span></td>
              <td class="font-semibold">{{ part.name }}</td>
              <td class="text-slate-500">{{ part.category?.name || '-' }}</td>
              <td class="text-slate-500">{{ part.unit || '-' }}</td>
              <td class="text-center font-semibold" [class.text-red-600]="isLowStock(part)">{{ getCurrentStock(part) | number }}</td>
              <td class="text-center text-slate-500">{{ getReorderPoint(part) | number }}</td>
              <td class="font-mono">{{ getUnitCost(part) | number:'1.2-2' }}</td>
              <td>
                <p-tag *ngIf="getIsCritical(part)" value="حرجة" severity="danger"></p-tag>
              </td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-trash" [text]="true" severity="danger" size="small"
                            pTooltip="حذف" (click)="deletePart(part)"></p-button>
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" size="small"
                            pTooltip="تعديل" [routerLink]="['/spare-parts', part.id, 'edit']"></p-button>
                  <p-button icon="pi pi-eye" [text]="true" severity="info" size="small"
                            pTooltip="عرض" [routerLink]="['/spare-parts', part.id]"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9">
                <div class="empty-state">
                  <i class="pi pi-box"></i>
                  <h4>لا توجد قطع غيار</h4>
                  <p>ابدأ بإضافة قطع غيار جديدة</p>
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
    .text-red-600 { color: #dc2626 !important; }
    .low-stock-row { background: rgba(239, 68, 68, 0.05) !important; }
    .low-stock-row:hover { background: rgba(239, 68, 68, 0.1) !important; }
    .part-code {
      background: rgba(59, 130, 246, 0.08);
      padding: 4px 10px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #3b82f6;
    }
  `]
})
export class SparePartsListComponent implements OnInit {
  private sparePartsService = inject(SparePartsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  
  parts: SparePart[] = [];
  categories: SparePartCategory[] = [];
  statistics: SparePartStatistics | null = null;
  loading = true;
  loadingStats = true;
  
  filters: any = { search: '', categoryId: '', isCritical: '', lowStock: '', page: 1, limit: 20 };
  private searchTimeout: any;
  
  categoryOptions: any[] = [];
  criticalOptions = [
    { label: 'حرجة', value: 'true' },
    { label: 'غير حرجة', value: 'false' }
  ];
  stockOptions = [
    { label: 'نقص في المخزون', value: 'true' }
  ];

  ngOnInit() {
    this.loadCategories();
    this.loadParts();
    this.loadStatistics();
  }

  loadCategories() {
    this.sparePartsService.getCategories(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.categoryOptions = this.categories.map(c => ({ label: c.name, value: c.id }));
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadParts() {
    this.loading = true;
    const params: any = { businessId: environment.defaultBusinessId, page: this.filters.page, limit: this.filters.limit };
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.categoryId) params.categoryId = this.filters.categoryId;
    if (this.filters.isCritical) params.isCritical = this.filters.isCritical === 'true';
    if (this.filters.lowStock === 'true') params.lowStock = true;

    this.sparePartsService.getSpareParts(params).subscribe({
      next: (response) => { this.parts = response.data; this.loading = false; },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل قطع الغيار' });
      }
    });
  }

  loadStatistics() {
    this.loadingStats = true;
    this.sparePartsService.getStatistics(environment.defaultBusinessId).subscribe({
      next: (response) => { this.statistics = response.data; this.loadingStats = false; },
      error: () => { this.loadingStats = false; }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.filters.page = 1; this.loadParts(); }, 300);
  }

  openMovementDialog(part: SparePart, type: 'receipt' | 'issue') {
    this.messageService.add({ severity: 'info', summary: 'قريباً', detail: 'سيتم إضافة هذه الميزة' });
  }

  deletePart(part: SparePart) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف قطعة الغيار "${part.name}"?`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.sparePartsService.deleteSparePart(part.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'تم',
              detail: 'تم حذف قطعة الغيار بنجاح'
            });
            this.loadParts();
            this.loadStatistics();
          },
          error: (error: any) => {
            console.error('Error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في حذف قطعة الغيار'
            });
          }
        });
      }
    });
  }

  isLowStock(part: any): boolean {
    return this.getCurrentStock(part) <= this.getReorderPoint(part);
  }

  getPartCode(part: any): string {
    return part.part_code || part.partCode || part.part_number || part.partNumber || '-';
  }

  getCurrentStock(part: any): number {
    return part.current_stock || part.currentStock || part.quantity_on_hand || part.quantityOnHand || 0;
  }

  getReorderPoint(part: any): number {
    return part.reorder_point || part.reorderPoint || part.reorder_level || part.reorderLevel || part.minimum_stock || part.minimumStock || 0;
  }

  getUnitCost(part: any): number {
    const cost = part.unit_cost || part.unitCost || part.unit_price || part.unitPrice;
    return cost ? Number(cost) : 0;
  }

  getIsCritical(part: any): boolean {
    return part.is_critical !== undefined ? part.is_critical : (part.isCritical !== undefined ? part.isCritical : false);
  }
}
