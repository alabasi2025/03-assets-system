import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TreeModule } from 'primeng/tree';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { CategoriesService, Category, CategoryStatistics } from '../../../core/services/categories.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TreeModule,
    CardModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="categories-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="pi pi-sitemap"></i>
          </div>
          <div class="header-text">
            <h1>إدارة التصنيفات</h1>
            <p>عرض وإدارة تصنيفات الأصول</p>
          </div>
        </div>
        <button pButton label="إضافة تصنيف جديد" icon="pi pi-plus" (click)="showAddDialog()"></button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <i class="pi pi-list"></i>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.total }}</span>
            <span class="stat-label">إجمالي التصنيفات</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="pi pi-check-circle"></i>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.active }}</span>
            <span class="stat-label">تصنيفات نشطة</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="pi pi-folder"></i>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.rootCategories }}</span>
            <span class="stat-label">تصنيفات رئيسية</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="pi pi-box"></i>
          <div class="stat-info">
            <span class="stat-value">{{ statistics.withAssets }}</span>
            <span class="stat-label">تصنيفات بها أصول</span>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button pButton [outlined]="viewMode !== 'table'" label="عرض جدول" icon="pi pi-table" (click)="viewMode = 'table'"></button>
        <button pButton [outlined]="viewMode !== 'tree'" label="عرض شجري" icon="pi pi-sitemap" (click)="viewMode = 'tree'; loadTree()"></button>
      </div>

      <!-- Filters -->
      <div class="filters-section" *ngIf="viewMode === 'table'">
        <span class="p-input-icon-right">
          <i class="pi pi-search"></i>
          <input type="text" pInputText placeholder="بحث..." [(ngModel)]="searchTerm" (input)="onSearch()" />
        </span>
        <p-dropdown 
          [options]="statusOptions" 
          [(ngModel)]="selectedStatus" 
          placeholder="الحالة"
          (onChange)="loadCategories()"
          [showClear]="true">
        </p-dropdown>
      </div>

      <!-- Table View -->
      <p-table 
        *ngIf="viewMode === 'table'"
        [value]="categories" 
        [loading]="loading"
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} تصنيف"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-sm p-datatable-gridlines">
        
        <ng-template pTemplate="header">
          <tr>
            <th>الكود</th>
            <th>الاسم</th>
            <th>التصنيف الأب</th>
            <th>طريقة الإهلاك</th>
            <th>العمر الافتراضي</th>
            <th>عدد الأصول</th>
            <th>الحالة</th>
            <th>إجراءات</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-category>
          <tr>
            <td>{{ category.code }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.parent?.name || '-' }}</td>
            <td>{{ getDepreciationMethodLabel(category.depreciation_method) }}</td>
            <td>{{ category.useful_life_years }} سنة</td>
            <td>{{ category._count?.assets || 0 }}</td>
            <td>
              <p-tag [severity]="category.is_active ? 'success' : 'danger'" 
                     [value]="category.is_active ? 'نشط' : 'غير نشط'"></p-tag>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editCategory(category)"></button>
              <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="confirmDelete(category)"></button>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="8" class="text-center">لا توجد تصنيفات مسجلة</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Tree View -->
      <p-card *ngIf="viewMode === 'tree'" styleClass="tree-card">
        <p-tree [value]="treeNodes" [loading]="loading" selectionMode="single" (onNodeSelect)="onNodeSelect($event)">
          <ng-template let-node pTemplate="default">
            <div class="tree-node">
              <span class="node-code">{{ node.data.code }}</span>
              <span class="node-name">{{ node.label }}</span>
              <p-tag *ngIf="node.data._count?.assets" [value]="node.data._count.assets + ' أصل'" severity="info" class="node-count"></p-tag>
            </div>
          </ng-template>
        </p-tree>
      </p-card>

      <!-- Add/Edit Dialog -->
      <p-dialog [(visible)]="showDialog" [header]="editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'" [modal]="true" [style]="{width: '500px'}">
        <div class="dialog-content">
          <div class="field">
            <label>الكود *</label>
            <input type="text" pInputText [(ngModel)]="categoryForm.code" class="w-full" />
          </div>
          <div class="field">
            <label>الاسم بالعربي *</label>
            <input type="text" pInputText [(ngModel)]="categoryForm.name" class="w-full" />
          </div>
          <div class="field">
            <label>الاسم بالإنجليزي</label>
            <input type="text" pInputText [(ngModel)]="categoryForm.name_en" class="w-full" />
          </div>
          <div class="field">
            <label>التصنيف الأب</label>
            <p-dropdown [options]="parentOptions" [(ngModel)]="categoryForm.parent_id" placeholder="اختر التصنيف الأب" [showClear]="true" class="w-full"></p-dropdown>
          </div>
          <div class="field">
            <label>طريقة الإهلاك</label>
            <p-dropdown [options]="depreciationMethods" [(ngModel)]="categoryForm.depreciation_method" class="w-full"></p-dropdown>
          </div>
          <div class="field">
            <label>العمر الافتراضي (سنوات)</label>
            <input type="number" pInputText [(ngModel)]="categoryForm.useful_life_years" class="w-full" />
          </div>
          <div class="field">
            <label>نسبة القيمة المتبقية (%)</label>
            <input type="number" pInputText [(ngModel)]="categoryForm.salvage_rate" class="w-full" />
          </div>
          <div class="field">
            <label>الوصف</label>
            <textarea pInputText [(ngModel)]="categoryForm.description" rows="3" class="w-full"></textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="showDialog = false"></button>
          <button pButton label="حفظ" icon="pi pi-check" (click)="saveCategory()" [loading]="saving"></button>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .categories-container {
      padding: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }
    .header-text h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #1e293b;
    }
    .header-text p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1.25rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .stat-card i {
      font-size: 2rem;
      color: #667eea;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }
    .view-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .field label {
      font-weight: 500;
      color: #374151;
    }
    .w-full {
      width: 100%;
    }
    .tree-card {
      margin-top: 1rem;
    }
    .tree-node {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .node-code {
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .node-name {
      font-weight: 500;
    }
    .node-count {
      margin-right: auto;
    }
    .text-center {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
  `]
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  treeNodes: TreeNode[] = [];
  loading = false;
  saving = false;
  showDialog = false;
  editingCategory: Category | null = null;
  viewMode: 'table' | 'tree' = 'table';
  searchTerm = '';
  selectedStatus: boolean | null = null;

  statistics: CategoryStatistics = {
    total: 0,
    active: 0,
    inactive: 0,
    withAssets: 0,
    rootCategories: 0
  };

  categoryForm: any = {
    code: '',
    name: '',
    name_en: '',
    parent_id: null,
    depreciation_method: 'straight_line',
    useful_life_years: 5,
    salvage_rate: 0,
    description: ''
  };

  statusOptions = [
    { label: 'نشط', value: true },
    { label: 'غير نشط', value: false }
  ];

  depreciationMethods = [
    { label: 'القسط الثابت', value: 'straight_line' },
    { label: 'القسط المتناقص', value: 'declining_balance' },
    { label: 'وحدات الإنتاج', value: 'units_of_production' }
  ];

  parentOptions: any[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadStatistics();
  }

  loadCategories() {
    this.loading = true;
    const query: any = {};
    if (this.searchTerm) query.search = this.searchTerm;
    if (this.selectedStatus !== null) query.isActive = this.selectedStatus;

    this.categoriesService.getCategories(query).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.parentOptions = this.categories.map(c => ({ label: c.name, value: c.id }));
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل التصنيفات' });
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.categoriesService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: () => {}
    });
  }

  loadTree() {
    this.loading = true;
    this.categoriesService.getTree().subscribe({
      next: (response) => {
        this.treeNodes = this.convertToTreeNodes(response.data || []);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل شجرة التصنيفات' });
        this.loading = false;
      }
    });
  }

  convertToTreeNodes(categories: Category[]): TreeNode[] {
    return categories.map(cat => ({
      label: cat.name,
      data: cat,
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: cat.children ? this.convertToTreeNodes(cat.children) : []
    }));
  }

  onSearch() {
    this.loadCategories();
  }

  showAddDialog() {
    this.editingCategory = null;
    this.categoryForm = {
      code: '',
      name: '',
      name_en: '',
      parent_id: null,
      depreciation_method: 'straight_line',
      useful_life_years: 5,
      salvage_rate: 0,
      description: ''
    };
    this.showDialog = true;
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm = {
      code: category.code,
      name: category.name,
      name_en: category.name_en || '',
      parent_id: category.parent_id,
      depreciation_method: category.depreciation_method,
      useful_life_years: category.useful_life_years,
      salvage_rate: category.salvage_rate,
      description: category.description || ''
    };
    this.showDialog = true;
  }

  saveCategory() {
    if (!this.categoryForm.code || !this.categoryForm.name) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    this.saving = true;
    const data: any = {
      businessId: environment.defaultBusinessId,
      code: this.categoryForm.code,
      name: this.categoryForm.name,
      nameEn: this.categoryForm.name_en,
      parentId: this.categoryForm.parent_id || undefined,
      depreciationMethod: this.categoryForm.depreciation_method,
      usefulLifeYears: Number(this.categoryForm.useful_life_years) || 5,
      salvageRate: Number(this.categoryForm.salvage_rate) || 0,
      description: this.categoryForm.description
    };

    const request = this.editingCategory
      ? this.categoriesService.updateCategory(this.editingCategory.id, data)
      : this.categoriesService.createCategory(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editingCategory ? 'تم تحديث التصنيف بنجاح' : 'تم إضافة التصنيف بنجاح' 
        });
        this.showDialog = false;
        this.saving = false;
        this.loadCategories();
        this.loadStatistics();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: error.error?.message || 'فشل في حفظ التصنيف' });
        this.saving = false;
      }
    });
  }

  confirmDelete(category: Category) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف التصنيف "${category.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.categoriesService.deleteCategory(category.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف التصنيف بنجاح' });
            this.loadCategories();
            this.loadStatistics();
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: error.error?.message || 'فشل في حذف التصنيف' });
          }
        });
      }
    });
  }

  onNodeSelect(event: any) {
    this.editCategory(event.node.data);
  }

  getDepreciationMethodLabel(method: string): string {
    const methods: any = {
      'straight_line': 'القسط الثابت',
      'declining_balance': 'القسط المتناقص',
      'units_of_production': 'وحدات الإنتاج'
    };
    return methods[method] || method;
  }
}
