import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetsService } from '../../../core/services/assets.service';
import { Asset, AssetCategory, AssetQueryParams } from '../../../core/models/asset.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assets-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">إدارة الأصول</h1>
          <p class="text-gray-600">قائمة الأصول المسجلة في النظام</p>
        </div>
        <button 
          routerLink="/assets/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          إضافة أصل جديد
        </button>
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
              placeholder="رقم الأصل، الاسم، الباركود..."
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
            <select 
              [(ngModel)]="filters.categoryId"
              (ngModelChange)="loadAssets()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع التصنيفات</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select 
              [(ngModel)]="filters.status"
              (ngModelChange)="loadAssets()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="under_maintenance">تحت الصيانة</option>
              <option value="disposed">مستبعد</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة الفنية</label>
            <select 
              [(ngModel)]="filters.condition"
              (ngModelChange)="loadAssets()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">جميع الحالات</option>
              <option value="excellent">ممتاز</option>
              <option value="good">جيد</option>
              <option value="fair">مقبول</option>
              <option value="poor">ضعيف</option>
              <option value="damaged">تالف</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="statistics">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">إجمالي الأصول</div>
          <div class="text-2xl font-bold text-gray-800">{{ statistics.summary.totalAssets | number }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">الأصول النشطة</div>
          <div class="text-2xl font-bold text-green-600">{{ statistics.summary.activeAssets | number }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">القيمة الدفترية</div>
          <div class="text-2xl font-bold text-blue-600">{{ statistics.summary.totalBookValue | number:'1.2-2' }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-500">إجمالي الإهلاك</div>
          <div class="text-2xl font-bold text-orange-600">{{ statistics.summary.totalDepreciation | number:'1.2-2' }}</div>
        </div>
      </div>

      <!-- Assets Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الأصل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تكلفة الاقتناء</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة الدفترية</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let asset of assets" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ asset.assetNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asset.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ asset.category?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asset.acquisitionCost | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ asset.bookValue | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(asset.status)">
                    {{ getStatusLabel(asset.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      [routerLink]="['/assets', asset.id]"
                      class="text-blue-600 hover:text-blue-800">
                      عرض
                    </button>
                    <button 
                      [routerLink]="['/assets', asset.id, 'edit']"
                      class="text-green-600 hover:text-green-800">
                      تعديل
                    </button>
                    <button 
                      (click)="deleteAsset(asset)"
                      class="text-red-600 hover:text-red-800">
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="assets.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  لا توجد أصول مسجلة
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AssetsListComponent implements OnInit {
  private assetsService = inject(AssetsService);
  
  assets: Asset[] = [];
  categories: AssetCategory[] = [];
  statistics: any = null;
  meta: any = null;
  
  filters: AssetQueryParams = {
    businessId: environment.defaultBusinessId,
    page: 1,
    limit: 20,
  };

  Math = Math;
  private searchTimeout: any;

  ngOnInit() {
    this.loadCategories();
    this.loadAssets();
    this.loadStatistics();
  }

  loadCategories() {
    this.assetsService.getCategories({ businessId: environment.defaultBusinessId }).subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadAssets() {
    this.assetsService.getAssets(this.filters).subscribe({
      next: (response) => {
        this.assets = response.data;
        this.meta = response.meta;
      },
      error: (error) => console.error('Error loading assets:', error)
    });
  }

  loadStatistics() {
    this.assetsService.getAssetStatistics(environment.defaultBusinessId).subscribe({
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
      this.loadAssets();
    }, 300);
  }

  goToPage(page: number) {
    this.filters.page = page;
    this.loadAssets();
  }

  deleteAsset(asset: Asset) {
    if (confirm(`هل أنت متأكد من حذف الأصل "${asset.name}"؟`)) {
      this.assetsService.deleteAsset(asset.id).subscribe({
        next: () => {
          this.loadAssets();
          this.loadStatistics();
        },
        error: (error) => console.error('Error deleting asset:', error)
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      inactive: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
      under_maintenance: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      disposed: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
      sold: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
    };
    return classes[status] || classes['inactive'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'نشط',
      inactive: 'غير نشط',
      under_maintenance: 'تحت الصيانة',
      disposed: 'مستبعد',
      sold: 'مباع',
    };
    return labels[status] || status;
  }
}
