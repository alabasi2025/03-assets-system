import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SparePartsService } from '../../../core/services/spare-parts.service';
import { SparePart, SparePartCategory, SparePartStatistics } from '../../../core/models/spare-part.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-spare-parts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">قطع الغيار</h1>
          <p class="text-gray-600">إدارة مخزون قطع الغيار</p>
        </div>
        <button 
          routerLink="/spare-parts/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          إضافة قطعة غيار
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="statistics">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">إجمالي الأصناف</div>
          <div class="text-2xl font-bold text-gray-800">{{ statistics.totalParts | number }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">أصناف حرجة</div>
          <div class="text-2xl font-bold text-red-600">{{ statistics.criticalParts | number }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">نقص في المخزون</div>
          <div class="text-2xl font-bold text-orange-600">{{ statistics.lowStockParts | number }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">قيمة المخزون</div>
          <div class="text-2xl font-bold text-green-600">{{ statistics.stockValue?.totalValue | number:'1.2-2' }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <input 
              type="text" 
              [(ngModel)]="filters.search"
              (ngModelChange)="onSearch()"
              placeholder="كود القطعة، الاسم..."
              class="w-full border rounded-lg px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
            <select 
              [(ngModel)]="filters.categoryId"
              (ngModelChange)="loadParts()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع التصنيفات</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">حرجة فقط</label>
            <select 
              [(ngModel)]="filters.isCritical"
              (ngModelChange)="loadParts()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">الكل</option>
              <option value="true">حرجة</option>
              <option value="false">غير حرجة</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">نقص المخزون</label>
            <select 
              [(ngModel)]="filters.lowStock"
              (ngModelChange)="loadParts()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">الكل</option>
              <option value="true">نقص في المخزون</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Parts Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">كود القطعة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون الحالي</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حد إعادة الطلب</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر الوحدة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حرجة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let part of parts" class="hover:bg-gray-50" [class.bg-red-50]="isLowStock(part)">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ part.partCode }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ part.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ part.category?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ part.unit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" [class.text-red-600]="isLowStock(part)" [class.font-bold]="isLowStock(part)">
                  {{ part.currentStock | number }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ part.reorderPoint | number }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ part.unitCost | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span *ngIf="part.isCritical" class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                    حرجة
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      [routerLink]="['/spare-parts', part.id]"
                      class="text-blue-600 hover:text-blue-800">
                      عرض
                    </button>
                    <button 
                      (click)="openMovementDialog(part, 'receipt')"
                      class="text-green-600 hover:text-green-800">
                      استلام
                    </button>
                    <button 
                      (click)="openMovementDialog(part, 'issue')"
                      class="text-orange-600 hover:text-orange-800">
                      صرف
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="parts.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  لا توجد قطع غيار مسجلة
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
export class SparePartsListComponent implements OnInit {
  private sparePartsService = inject(SparePartsService);
  
  parts: SparePart[] = [];
  categories: SparePartCategory[] = [];
  statistics: SparePartStatistics | null = null;
  meta: any = null;
  
  filters: any = {
    search: '',
    categoryId: '',
    isCritical: '',
    lowStock: '',
    page: 1,
    limit: 20,
  };

  Math = Math;
  private searchTimeout: any;

  ngOnInit() {
    this.loadCategories();
    this.loadParts();
    this.loadStatistics();
  }

  loadCategories() {
    this.sparePartsService.getCategories(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadParts() {
    const params: any = {
      businessId: environment.defaultBusinessId,
      page: this.filters.page,
      limit: this.filters.limit,
    };
    
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.categoryId) params.categoryId = this.filters.categoryId;
    if (this.filters.isCritical) params.isCritical = this.filters.isCritical === 'true';
    if (this.filters.lowStock === 'true') params.lowStock = true;

    this.sparePartsService.getSpareParts(params).subscribe({
      next: (response) => {
        this.parts = response.data;
        this.meta = response.meta;
      },
      error: (error) => console.error('Error loading parts:', error)
    });
  }

  loadStatistics() {
    this.sparePartsService.getStatistics(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.statistics = response.data;
      },
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.page = 1;
      this.loadParts();
    }, 300);
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.loadParts();
  }

  isLowStock(part: SparePart): boolean {
    return part.currentStock <= part.reorderPoint;
  }

  openMovementDialog(part: SparePart, type: 'receipt' | 'issue') {
    const quantity = prompt(`أدخل الكمية للـ${type === 'receipt' ? 'استلام' : 'صرف'}:`);
    if (quantity && !isNaN(Number(quantity))) {
      this.sparePartsService.createMovement({
        partId: part.id,
        movementType: type,
        quantity: Number(quantity),
        unitCost: part.unitCost,
      }).subscribe({
        next: () => {
          this.loadParts();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error creating movement:', error);
          alert('حدث خطأ أثناء تسجيل الحركة');
        }
      });
    }
  }
}
