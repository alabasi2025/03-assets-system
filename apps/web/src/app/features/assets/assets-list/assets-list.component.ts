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
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>إدارة الأصول</h1>
          <p>قائمة الأصول المسجلة في النظام</p>
        </div>
        <button routerLink="/assets/new" class="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          إضافة أصل جديد
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label>بحث</label>
            <input 
              type="text" 
              [(ngModel)]="filters.search"
              (ngModelChange)="onSearch()"
              placeholder="رقم الأصل، الاسم، الباركود..."
              class="form-control">
          </div>
          <div class="filter-group">
            <label>التصنيف</label>
            <select [(ngModel)]="filters.categoryId" (ngModelChange)="loadAssets()" class="form-control">
              <option value="">جميع التصنيفات</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>الحالة</label>
            <select [(ngModel)]="filters.status" (ngModelChange)="loadAssets()" class="form-control">
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="under_maintenance">تحت الصيانة</option>
              <option value="disposed">مستبعد</option>
            </select>
          </div>
          <div class="filter-group">
            <label>الحالة الفنية</label>
            <select [(ngModel)]="filters.condition" (ngModelChange)="loadAssets()" class="form-control">
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
      <div class="stats-grid" *ngIf="statistics">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="stat-value">{{ statistics.summary?.totalAssets || 0 | number }}</div>
          <div class="stat-label">إجمالي الأصول</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value green">{{ statistics.summary?.activeAssets || 0 | number }}</div>
          <div class="stat-label">الأصول النشطة</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value purple">{{ statistics.summary?.totalBookValue || 0 | number:'1.2-2' }}</div>
          <div class="stat-label">القيمة الدفترية</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
            </svg>
          </div>
          <div class="stat-value orange">{{ statistics.summary?.totalDepreciation || 0 | number:'1.2-2' }}</div>
          <div class="stat-label">إجمالي الإهلاك</div>
        </div>
      </div>

      <!-- Assets Table -->
      <div class="table-card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>رقم الأصل</th>
                <th>الاسم</th>
                <th>التصنيف</th>
                <th>تكلفة الاقتناء</th>
                <th>القيمة الدفترية</th>
                <th>الحالة</th>
                <th>الحالة الفنية</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let asset of assets">
                <td class="font-medium asset-number">{{ getAssetNumber(asset) }}</td>
                <td>
                  <div class="asset-name">{{ asset.name }}</div>
                  <div class="asset-desc" *ngIf="getAssetModel(asset)">{{ getAssetModel(asset) }}</div>
                </td>
                <td class="text-muted">{{ getCategoryName(asset) }}</td>
                <td class="number">{{ getAcquisitionCost(asset) | number:'1.2-2' }}</td>
                <td class="number book-value">{{ getBookValue(asset) | number:'1.2-2' }}</td>
                <td>
                  <span [class]="'badge ' + getStatusClass(getStatus(asset))">
                    {{ getStatusLabel(getStatus(asset)) }}
                  </span>
                </td>
                <td>
                  <span [class]="'badge ' + getConditionClass(getCondition(asset))">
                    {{ getConditionLabel(getCondition(asset)) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button [routerLink]="['/assets', asset.id]" class="action-btn view">عرض</button>
                    <button [routerLink]="['/assets', asset.id, 'edit']" class="action-btn edit">تعديل</button>
                    <button (click)="deleteAsset(asset)" class="action-btn delete">حذف</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="assets.length === 0">
                <td colspan="8" class="empty-state">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <p>لا توجد أصول مسجلة</p>
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
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .stat-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
    .stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    
    .stat-value.green { color: #22c55e; }
    .stat-value.purple { color: #a855f7; }
    .stat-value.orange { color: #f97316; }
    
    .stat-label { font-size: 0.85rem; color: #6b7280; }
    
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
    
    .asset-number {
      background: rgba(59, 130, 246, 0.08);
      padding: 4px 10px !important;
      border-radius: 6px;
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #1d4ed8;
    }
    
    .asset-name { font-weight: 600; color: #1e3a5f; }
    .asset-desc { font-size: 0.8rem; color: #9ca3af; margin-top: 2px; }
    
    .book-value { color: #16a34a; font-weight: 600; }
    
    .badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-success { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .badge-secondary { background: rgba(107, 114, 128, 0.1); color: #4b5563; }
    .badge-warning { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .badge-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
    .badge-info { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    .badge-excellent { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .badge-good { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    .badge-fair { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .badge-poor { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
    .badge-damaged { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
    
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
    .action-btn.edit { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
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
export class AssetsListComponent implements OnInit {
  private assetsService = inject(AssetsService);
  
  assets: any[] = [];
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

  deleteAsset(asset: any) {
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

  // Helper methods to handle both snake_case and camelCase
  getAssetNumber(asset: any): string {
    return asset.asset_number || asset.assetNumber || '-';
  }

  getAcquisitionCost(asset: any): number {
    return Number(asset.acquisition_cost || asset.acquisitionCost || 0);
  }

  getBookValue(asset: any): number {
    return Number(asset.book_value || asset.bookValue || 0);
  }

  getStatus(asset: any): string {
    return asset.status || 'active';
  }

  getCondition(asset: any): string {
    return asset.condition || 'good';
  }

  getCategoryName(asset: any): string {
    return asset.category?.name || '-';
  }

  getAssetModel(asset: any): string {
    const model = asset.model;
    const manufacturer = asset.manufacturer;
    if (manufacturer && model) return `${manufacturer} - ${model}`;
    return model || manufacturer || '';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'badge-success',
      inactive: 'badge-secondary',
      under_maintenance: 'badge-warning',
      disposed: 'badge-danger',
      sold: 'badge-info',
    };
    return classes[status] || 'badge-secondary';
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

  getConditionClass(condition: string): string {
    const classes: Record<string, string> = {
      excellent: 'badge-excellent',
      good: 'badge-good',
      fair: 'badge-fair',
      poor: 'badge-poor',
      damaged: 'badge-damaged',
    };
    return classes[condition] || 'badge-secondary';
  }

  getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
      excellent: 'ممتاز',
      good: 'جيد',
      fair: 'مقبول',
      poor: 'ضعيف',
      damaged: 'تالف',
    };
    return labels[condition] || condition;
  }
}
