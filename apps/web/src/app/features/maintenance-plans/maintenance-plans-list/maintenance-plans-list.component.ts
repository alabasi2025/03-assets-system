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
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">خطط الصيانة الوقائية</h1>
          <p class="text-gray-600">إدارة جداول الصيانة الدورية للأصول</p>
        </div>
        <button 
          routerLink="/maintenance-plans/new"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          إضافة خطة صيانة
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-green-500">
          <div class="text-sm text-gray-500">إجمالي الخطط</div>
          <div class="text-2xl font-bold text-gray-800">{{ plans.length }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 border-r-4 border-blue-500">
          <div class="text-sm text-gray-500">خطط نشطة</div>
          <div class="text-2xl font-bold text-blue-600">{{ getActivePlansCount() }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select 
              [(ngModel)]="filterActive"
              (ngModelChange)="loadPlans()"
              class="w-full border rounded-lg px-3 py-2">
              <option value="">الكل</option>
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Plans Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الخطة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكرار</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدة المقدرة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التكلفة المقدرة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الجداول</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let plan of plans" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ plan.name }}</div>
                  <div class="text-sm text-gray-500">{{ plan.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getFrequencyLabel(plan.frequencyType, plan.frequencyValue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ plan.estimatedDuration ? plan.estimatedDuration + ' ساعة' : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ plan.estimatedCost ? (plan.estimatedCost | number:'1.2-2') : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ plan._count?.schedules || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="plan.isActive ? 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800' : 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'">
                    {{ plan.isActive ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button 
                      [routerLink]="['/maintenance-plans', plan.id]"
                      class="text-blue-600 hover:text-blue-800">
                      عرض
                    </button>
                    <button 
                      (click)="generateSchedules(plan)"
                      class="text-green-600 hover:text-green-800">
                      توليد جداول
                    </button>
                    <button 
                      (click)="toggleActive(plan)"
                      class="text-orange-600 hover:text-orange-800">
                      {{ plan.isActive ? 'تعطيل' : 'تفعيل' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="plans.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  لا توجد خطط صيانة مسجلة
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
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
    return this.plans.filter(p => p.isActive).length;
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
    // Open dialog to select assets and date range
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
    this.maintenanceService.updatePlan(plan.id, { isActive: !plan.isActive }).subscribe({
      next: () => {
        this.loadPlans();
      },
      error: (error) => console.error('Error updating plan:', error)
    });
  }
}
