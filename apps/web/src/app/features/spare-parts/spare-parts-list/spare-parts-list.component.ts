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
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>قطع الغيار</h1>
          <p>إدارة مخزون قطع الغيار</p>
        </div>
        <button routerLink="/spare-parts/new" class="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          إضافة قطعة غيار
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="statistics">
        <div class="stat-card border-blue">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div class="stat-value">{{ statistics.totalParts | number }}</div>
          <div class="stat-label">إجمالي الأصناف</div>
        </div>
        <div class="stat-card border-red">
          <div class="stat-icon red">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="stat-value red">{{ statistics.criticalParts | number }}</div>
          <div class="stat-label">أصناف حرجة</div>
        </div>
        <div class="stat-card border-orange">
          <div class="stat-icon orange">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
            </svg>
          </div>
          <div class="stat-value orange">{{ statistics.lowStockParts | number }}</div>
          <div class="stat-label">نقص في المخزون</div>
        </div>
        <div class="stat-card border-green">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value green">{{ statistics.stockValue?.totalValue | number:'1.2-2' }}</div>
          <div class="stat-label">قيمة المخزون</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label>بحث</label>
            <input type="text" [(ngModel)]="filters.search" (ngModelChange)="onSearch()" placeholder="كود القطعة، الاسم..." class="form-control">
          </div>
          <div class="filter-group">
            <label>التصنيف</label>
            <select [(ngModel)]="filters.categoryId" (ngModelChange)="loadParts()" class="form-control">
              <option value="">جميع التصنيفات</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>حرجة فقط</label>
            <select [(ngModel)]="filters.isCritical" (ngModelChange)="loadParts()" class="form-control">
              <option value="">الكل</option>
              <option value="true">حرجة</option>
              <option value="false">غير حرجة</option>
            </select>
          </div>
          <div class="filter-group">
            <label>نقص المخزون</label>
            <select [(ngModel)]="filters.lowStock" (ngModelChange)="loadParts()" class="form-control">
              <option value="">الكل</option>
              <option value="true">نقص في المخزون</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Parts Table -->
      <div class="table-card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>كود القطعة</th>
                <th>الاسم</th>
                <th>التصنيف</th>
                <th>الوحدة</th>
                <th>المخزون الحالي</th>
                <th>حد إعادة الطلب</th>
                <th>سعر الوحدة</th>
                <th>حرجة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let part of parts" [class.low-stock-row]="isLowStock(part)">
                <td class="font-medium part-code">{{ getPartCode(part) }}</td>
                <td>{{ part.name }}</td>
                <td class="text-muted">{{ part.category?.name || '-' }}</td>
                <td class="text-muted">{{ part.unit }}</td>
                <td [class.low-stock]="isLowStock(part)">{{ getCurrentStock(part) | number }}</td>
                <td class="text-muted">{{ getReorderPoint(part) | number }}</td>
                <td class="number">{{ getUnitCost(part) | number:'1.2-2' }}</td>
                <td>
                  <span *ngIf="getIsCritical(part)" class="badge badge-danger">حرجة</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button [routerLink]="['/spare-parts', part.id]" class="action-btn view">عرض</button>
                    <button (click)="openMovementDialog(part, 'receipt')" class="action-btn edit">استلام</button>
                    <button (click)="openMovementDialog(part, 'issue')" class="action-btn warning">صرف</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="parts.length === 0">
                <td colspan="9" class="empty-state">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p>لا توجد قطع غيار مسجلة</p>
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
      border-right: 4px solid transparent;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    
    .stat-card.border-blue { border-right-color: #3b82f6; }
    .stat-card.border-red { border-right-color: #ef4444; }
    .stat-card.border-orange { border-right-color: #f97316; }
    .stat-card.border-green { border-right-color: #22c55e; }
    
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
    .stat-icon.red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .stat-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    
    .stat-value.red { color: #ef4444; }
    .stat-value.orange { color: #f97316; }
    .stat-value.green { color: #22c55e; }
    
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
    
    .low-stock-row { background: rgba(239, 68, 68, 0.05) !important; }
    .low-stock-row:hover { background: rgba(239, 68, 68, 0.1) !important; }
    
    .font-medium { font-weight: 600; color: #1e3a5f; }
    .text-muted { color: #6b7280; }
    .number { font-family: 'Courier New', monospace; font-weight: 500; }
    .low-stock { color: #dc2626 !important; font-weight: 700 !important; }
    
    .badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
    
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
    .action-btn.warning { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
    .action-btn:hover { transform: scale(1.05); }
    
    .part-code {
      background: rgba(59, 130, 246, 0.08);
      padding: 4px 10px !important;
      border-radius: 6px;
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #3b82f6;
    }
    
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

  isLowStock(part: any): boolean {
    return this.getCurrentStock(part) <= this.getReorderPoint(part);
  }

  openMovementDialog(part: any, type: 'receipt' | 'issue') {
    const quantity = prompt(`أدخل الكمية للـ${type === 'receipt' ? 'استلام' : 'صرف'}:`);
    if (quantity && !isNaN(Number(quantity))) {
      this.sparePartsService.createMovement({
        partId: part.id,
        movementType: type,
        quantity: Number(quantity),
        unitCost: this.getUnitCost(part),
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

  // Helper methods to handle both snake_case and camelCase
  getPartCode(part: any): string {
    return part.part_code || part.partCode || '-';
  }

  getCurrentStock(part: any): number {
    return part.current_stock !== undefined ? part.current_stock : (part.currentStock || 0);
  }

  getReorderPoint(part: any): number {
    return part.reorder_point !== undefined ? part.reorder_point : (part.reorderPoint || 0);
  }

  getUnitCost(part: any): number {
    const cost = part.unit_cost || part.unitCost;
    return cost ? Number(cost) : 0;
  }

  getIsCritical(part: any): boolean {
    return part.is_critical !== undefined ? part.is_critical : (part.isCritical || false);
  }
}
