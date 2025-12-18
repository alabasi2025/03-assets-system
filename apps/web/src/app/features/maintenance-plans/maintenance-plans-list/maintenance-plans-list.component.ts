import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { MaintenancePlan } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-maintenance-plans-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>خطط الصيانة الوقائية</h1>
          <p>إدارة جداول الصيانة الدورية للأصول</p>
        </div>
        <button routerLink="/maintenance-plans/new" class="btn btn-success">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          إضافة خطة صيانة
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card border-green">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div class="stat-value">{{ plans.length }}</div>
          <div class="stat-label">إجمالي الخطط</div>
        </div>
        <div class="stat-card border-blue">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stat-value blue">{{ getActivePlansCount() }}</div>
          <div class="stat-label">خطط نشطة</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label>الحالة</label>
            <select [(ngModel)]="filterActive" (ngModelChange)="loadPlans()" class="form-control">
              <option value="">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Plans Table -->
      <div class="table-card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم الخطة</th>
                <th>التكرار</th>
                <th>المدة المقدرة</th>
                <th>التكلفة المقدرة</th>
                <th>الجداول</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let plan of plans">
                <td>
                  <div class="font-medium">{{ plan.name }}</div>
                  <div class="text-muted text-sm">{{ plan.description }}</div>
                </td>
                <td class="text-muted">{{ getFrequencyLabel(getFrequencyType(plan), getFrequencyValue(plan)) }}</td>
                <td class="text-muted">{{ getEstimatedDuration(plan) ? getEstimatedDuration(plan) + ' ساعة' : '-' }}</td>
                <td class="number">{{ getEstimatedCost(plan) ? (getEstimatedCost(plan) | number:'1.2-2') : '-' }}</td>
                <td class="text-muted">{{ plan._count?.schedules || 0 }}</td>
                <td>
                  <span [class]="'badge ' + (getIsActive(plan) ? 'badge-success' : 'badge-secondary')">
                    {{ getIsActive(plan) ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button [routerLink]="['/maintenance-plans', plan.id]" class="action-btn view">عرض</button>
                    <button (click)="generateSchedules(plan)" class="action-btn edit">توليد جداول</button>
                    <button (click)="toggleActive(plan)" class="action-btn" [class.delete]="getIsActive(plan)" [class.view]="!getIsActive(plan)">
                      {{ getIsActive(plan) ? 'تعطيل' : 'تفعيل' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="plans.length === 0">
                <td colspan="7" class="empty-state">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                  <p>لا توجد خطط صيانة مسجلة</p>
                </td>
              </tr>
            </tbody>
          </table>
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
    
    .btn-success {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
    }
    
    .btn-success:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
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
      border-right: 4px solid transparent;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    
    .stat-card.border-green { border-right-color: #22c55e; }
    .stat-card.border-blue { border-right-color: #3b82f6; }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .stat-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    
    .stat-value.blue { color: #3b82f6; }
    
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
    
    .font-medium { font-weight: 600; color: #1e3a5f; }
    .text-muted { color: #6b7280; }
    .text-sm { font-size: 0.8rem; }
    .number { font-family: 'Courier New', monospace; font-weight: 500; }
    
    .badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-success { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
    .badge-secondary { background: rgba(107, 114, 128, 0.1); color: #4b5563; }
    
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
    .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
    .action-btn:hover { transform: scale(1.05); }
    
    .empty-state {
      text-align: center;
      padding: 48px 20px !important;
      color: #9ca3af;
    }
    
    .empty-state svg { margin: 0 auto 16px; color: #d1d5db; }
    .empty-state p { font-size: 1rem; color: #6b7280; }
  `]
})
export class MaintenancePlansListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  
  plans: MaintenancePlan[] = [];
  filterActive: string = '';

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    const isActive = this.filterActive === '' ? undefined : this.filterActive === 'true';
    this.maintenanceService.getPlans(environment.defaultBusinessId, isActive).subscribe({
      next: (response) => {
        this.plans = response.data;
      },
      error: (error) => console.error('Error loading plans:', error)
    });
  }

  getActivePlansCount(): number {
    return this.plans.filter(p => this.getIsActive(p)).length;
  }

  getFrequencyLabel(type: string, value?: number): string {
    const labels: Record<string, string> = {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي',
      hours_based: `كل ${value || 0} ساعة`,
    };
    return labels[type] || type;
  }

  generateSchedules(plan: MaintenancePlan) {
    const assetIds = prompt('أدخل معرفات الأصول (مفصولة بفاصلة):');
    if (assetIds) {
      const startDate = prompt('تاريخ البداية (YYYY-MM-DD):');
      const endDate = prompt('تاريخ النهاية (YYYY-MM-DD):');
      
      if (startDate && endDate) {
        this.maintenanceService.generateSchedules(
          plan.id,
          assetIds.split(',').map(id => id.trim()),
          startDate,
          endDate
        ).subscribe({
          next: (response) => {
            alert(`تم إنشاء ${response.data.created} جدول صيانة`);
            this.loadPlans();
          },
          error: (error) => {
            console.error('Error generating schedules:', error);
            alert('حدث خطأ أثناء توليد الجداول');
          }
        });
      }
    }
  }

  toggleActive(plan: MaintenancePlan) {
    this.maintenanceService.updatePlan(plan.id, { isActive: !this.getIsActive(plan) }).subscribe({
      next: () => {
        this.loadPlans();
      },
      error: (error) => console.error('Error updating plan:', error)
    });
  }

  // Helper methods to handle both snake_case and camelCase
  getFrequencyType(plan: any): string {
    return plan.frequency_type || plan.frequencyType || 'monthly';
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
