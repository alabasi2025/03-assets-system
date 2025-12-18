import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { MaintenanceService } from '../../../core/services/maintenance.service';
import { AssetsService } from '../../../core/services/assets.service';
import { CreateMaintenancePlanDto, FrequencyType } from '../../../core/models/maintenance.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-maintenance-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule,
    CheckboxModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-left"></p-toast>
    
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="loadingPlan" class="loading-overlay">
        <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
        <p>جاري تحميل بيانات خطة الصيانة...</p>
      </div>
      
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>{{ isEditMode ? 'تعديل خطة صيانة' : 'إنشاء خطة صيانة جديدة' }}</h2>
          <p>{{ isEditMode ? 'تعديل بيانات خطة الصيانة الوقائية' : 'إنشاء خطة صيانة وقائية جديدة' }}</p>
        </div>
        <p-button label="العودة للقائمة" icon="pi pi-arrow-right" 
                  severity="secondary" [outlined]="true" routerLink="/maintenance-plans"></p-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Basic Information -->
        <p-card header="بيانات الخطة" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
              <label for="name">اسم الخطة <span class="required">*</span></label>
              <input pInputText id="name" formControlName="name" 
                     placeholder="مثال: صيانة شهرية للمحولات" class="w-full" />
              <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="error-text">
                اسم الخطة مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="assetCategoryId">تصنيف الأصول</label>
              <p-select id="assetCategoryId" formControlName="assetCategoryId" 
                        [options]="categoryOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر تصنيف الأصول" [showClear]="true"
                        styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field md:col-span-2">
              <label for="description">وصف الخطة</label>
              <textarea pTextarea id="description" formControlName="description" 
                        rows="3" placeholder="وصف تفصيلي لخطة الصيانة" class="w-full"></textarea>
            </div>
          </div>
        </p-card>

        <!-- Frequency Settings -->
        <p-card header="إعدادات التكرار" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="frequencyType">نوع التكرار <span class="required">*</span></label>
              <p-select id="frequencyType" formControlName="frequencyType" 
                        [options]="frequencyTypeOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر نوع التكرار" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="frequencyValue">قيمة التكرار</label>
              <p-inputNumber id="frequencyValue" formControlName="frequencyValue" 
                             [min]="1" placeholder="1" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field">
              <label for="frequencyUnit">وحدة التكرار</label>
              <p-select id="frequencyUnit" formControlName="frequencyUnit" 
                        [options]="frequencyUnitOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الوحدة" styleClass="w-full">
              </p-select>
            </div>
          </div>
        </p-card>

        <!-- Cost & Duration -->
        <p-card header="التكلفة والمدة" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="estimatedDuration">المدة المتوقعة (ساعات)</label>
              <p-inputNumber id="estimatedDuration" formControlName="estimatedDuration" 
                             [min]="0" mode="decimal" [minFractionDigits]="1" 
                             placeholder="0" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field">
              <label for="estimatedCost">التكلفة المتوقعة</label>
              <p-inputNumber id="estimatedCost" formControlName="estimatedCost" 
                             mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2"
                             [min]="0" placeholder="0.00" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field flex items-end">
              <div class="flex items-center gap-2">
                <p-checkbox formControlName="isActive" [binary]="true" inputId="isActive"></p-checkbox>
                <label for="isActive">خطة نشطة</label>
              </div>
            </div>
          </div>
        </p-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <p-button label="إلغاء" severity="secondary" [outlined]="true" 
                    routerLink="/maintenance-plans"></p-button>
          <p-button [label]="isEditMode ? 'تحديث' : 'حفظ'" 
                    [icon]="isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
                    [disabled]="form.invalid || isSubmitting"
                    type="submit"></p-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h2 { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0; }
    .page-header p { color: #64748b; margin: 0.25rem 0 0; }
    .mb-4 { margin-bottom: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field label { font-weight: 500; color: #334155; font-size: 0.875rem; }
    .required { color: #ef4444; }
    .error-text { color: #ef4444; font-size: 0.75rem; }
    .loading-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.8); display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 1000;
    }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .items-end { align-items: flex-end; }
    .justify-end { justify-content: flex-end; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:col-span-2 { grid-column: span 2 / span 2; }
    }
    .w-full { width: 100%; }
  `]
})
export class MaintenancePlanFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private maintenanceService = inject(MaintenanceService);
  private assetsService = inject(AssetsService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  isEditMode = false;
  planId: string | null = null;
  isSubmitting = false;
  loadingPlan = false;
  
  categoryOptions: { label: string; value: string }[] = [];
  
  frequencyTypeOptions = [
    { label: 'يومي', value: 'daily' },
    { label: 'أسبوعي', value: 'weekly' },
    { label: 'شهري', value: 'monthly' },
    { label: 'ربع سنوي', value: 'quarterly' },
    { label: 'سنوي', value: 'yearly' },
    { label: 'بناءً على ساعات التشغيل', value: 'hours_based' }
  ];
  
  frequencyUnitOptions = [
    { label: 'يوم', value: 'day' },
    { label: 'أسبوع', value: 'week' },
    { label: 'شهر', value: 'month' },
    { label: 'سنة', value: 'year' },
    { label: 'ساعة', value: 'hour' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    this.planId = this.route.snapshot.paramMap.get('id');
    if (this.planId && this.planId !== 'new') {
      this.isEditMode = true;
      this.loadPlan(this.planId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      assetCategoryId: [''],
      frequencyType: ['monthly', Validators.required],
      frequencyValue: [1],
      frequencyUnit: ['month'],
      estimatedDuration: [null],
      estimatedCost: [null],
      isActive: [true]
    });
  }

  loadCategories() {
    this.assetsService.getCategories({ businessId: environment.defaultBusinessId }).subscribe({
      next: (response) => {
        this.categoryOptions = response.data.map((c: any) => ({ label: c.name, value: c.id }));
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadPlan(id: string) {
    this.loadingPlan = true;
    this.maintenanceService.getPlan(id).subscribe({
      next: (response) => {
        const plan: any = response.data;
        this.form.patchValue({
          name: plan.name,
          description: plan.description,
          assetCategoryId: plan.asset_category_id || plan.assetCategoryId,
          frequencyType: plan.frequency_type || plan.frequencyType,
          frequencyValue: plan.frequency_value || plan.frequencyValue || 1,
          frequencyUnit: plan.frequency_unit || plan.frequencyUnit,
          estimatedDuration: plan.estimated_duration || plan.estimatedDuration,
          estimatedCost: Number(plan.estimated_cost || plan.estimatedCost) || null,
          isActive: plan.is_active !== undefined ? plan.is_active : plan.isActive
        });
        this.loadingPlan = false;
      },
      error: (error) => {
        console.error('Error loading plan:', error);
        this.loadingPlan = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات خطة الصيانة'
        });
        this.router.navigate(['/maintenance-plans']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى ملء جميع الحقول المطلوبة'
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    if (this.isEditMode) {
      // Update - without businessId
      const updateData = {
        name: formValue.name,
        description: formValue.description || undefined,
        assetCategoryId: formValue.assetCategoryId || undefined,
        frequencyType: formValue.frequencyType,
        frequencyValue: formValue.frequencyValue || 1,
        frequencyUnit: formValue.frequencyUnit || undefined,
        estimatedDuration: formValue.estimatedDuration || undefined,
        estimatedCost: formValue.estimatedCost || undefined,
        isActive: formValue.isActive
      };

      this.maintenanceService.updatePlan(this.planId!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تحديث خطة الصيانة بنجاح'
          });
          setTimeout(() => this.router.navigate(['/maintenance-plans']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    } else {
      // Create - with businessId
      const createData: CreateMaintenancePlanDto = {
        businessId: environment.defaultBusinessId,
        name: formValue.name,
        description: formValue.description || undefined,
        assetCategoryId: formValue.assetCategoryId || undefined,
        frequencyType: formValue.frequencyType as FrequencyType,
        frequencyValue: formValue.frequencyValue || 1,
        frequencyUnit: formValue.frequencyUnit || undefined,
        estimatedDuration: formValue.estimatedDuration || undefined,
        estimatedCost: formValue.estimatedCost || undefined,
        isActive: formValue.isActive
      };

      this.maintenanceService.createPlan(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم إنشاء خطة الصيانة بنجاح'
          });
          setTimeout(() => this.router.navigate(['/maintenance-plans']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    }
  }

  private handleError(error: any) {
    let errorMessage = 'فشل في حفظ خطة الصيانة';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'بيانات غير صالحة، يرجى التحقق من الحقول';
    }
    
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: errorMessage
    });
  }
}
