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

import { SparePartsService } from '../../../core/services/spare-parts.service';
import { SparePartCategory, CreateSparePartDto } from '../../../core/models/spare-part.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-spare-part-form',
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
      <div *ngIf="loadingPart" class="loading-overlay">
        <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
        <p>جاري تحميل بيانات قطعة الغيار...</p>
      </div>
      
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>{{ isEditMode ? 'تعديل قطعة غيار' : 'إضافة قطعة غيار جديدة' }}</h2>
          <p>{{ isEditMode ? 'تعديل بيانات قطعة الغيار' : 'تسجيل قطعة غيار جديدة في المخزون' }}</p>
        </div>
        <p-button label="العودة للقائمة" icon="pi pi-arrow-right" 
                  severity="secondary" [outlined]="true" routerLink="/spare-parts"></p-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Basic Information -->
        <p-card header="البيانات الأساسية" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="partCode">كود القطعة <span class="required">*</span></label>
              <input pInputText id="partCode" formControlName="partCode" 
                     placeholder="مثال: SP-001" class="w-full" />
              <small *ngIf="form.get('partCode')?.invalid && form.get('partCode')?.touched" class="error-text">
                كود القطعة مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="name">اسم القطعة <span class="required">*</span></label>
              <input pInputText id="name" formControlName="name" 
                     placeholder="اسم قطعة الغيار" class="w-full" />
              <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="error-text">
                اسم القطعة مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="nameEn">الاسم بالإنجليزية</label>
              <input pInputText id="nameEn" formControlName="nameEn" 
                     placeholder="Part name in English" class="w-full" />
            </div>
            
            <div class="form-field">
              <label for="categoryId">التصنيف</label>
              <p-select id="categoryId" formControlName="categoryId" 
                        [options]="categoryOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر التصنيف" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="unit">وحدة القياس <span class="required">*</span></label>
              <p-select id="unit" formControlName="unit" 
                        [options]="unitOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الوحدة" styleClass="w-full">
              </p-select>
              <small *ngIf="form.get('unit')?.invalid && form.get('unit')?.touched" class="error-text">
                وحدة القياس مطلوبة
              </small>
            </div>
            
            <div class="form-field">
              <label for="manufacturer">الشركة المصنعة</label>
              <input pInputText id="manufacturer" formControlName="manufacturer" 
                     placeholder="اسم الشركة المصنعة" class="w-full" />
            </div>
            
            <div class="form-field md:col-span-3">
              <label for="description">الوصف</label>
              <textarea pTextarea id="description" formControlName="description" 
                        rows="3" placeholder="وصف تفصيلي لقطعة الغيار" class="w-full"></textarea>
            </div>
          </div>
        </p-card>

        <!-- Stock Information -->
        <p-card header="بيانات المخزون" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="form-field">
              <label for="minStock">الحد الأدنى للمخزون</label>
              <p-inputNumber id="minStock" formControlName="minStock" 
                             [min]="0" placeholder="0" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field">
              <label for="maxStock">الحد الأقصى للمخزون</label>
              <p-inputNumber id="maxStock" formControlName="maxStock" 
                             [min]="0" placeholder="0" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field">
              <label for="reorderPoint">نقطة إعادة الطلب</label>
              <p-inputNumber id="reorderPoint" formControlName="reorderPoint" 
                             [min]="0" placeholder="0" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field">
              <label for="unitCost">سعر الوحدة</label>
              <p-inputNumber id="unitCost" formControlName="unitCost" 
                             mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2"
                             [min]="0" placeholder="0.00" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field">
              <label for="location">موقع التخزين</label>
              <input pInputText id="location" formControlName="location" 
                     placeholder="مثال: رف A-01" class="w-full" />
            </div>
            
            <div class="form-field">
              <label for="leadTimeDays">مدة التوريد (أيام)</label>
              <p-inputNumber id="leadTimeDays" formControlName="leadTimeDays" 
                             [min]="0" placeholder="0" styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <div class="form-field flex items-end">
              <div class="flex items-center gap-2">
                <p-checkbox formControlName="isCritical" [binary]="true" inputId="isCritical"></p-checkbox>
                <label for="isCritical">قطعة حرجة</label>
              </div>
            </div>
          </div>
        </p-card>

        <!-- Notes -->
        <p-card header="ملاحظات" styleClass="mb-4">
          <div class="form-field">
            <textarea pTextarea formControlName="notes" 
                      rows="3" placeholder="ملاحظات إضافية" class="w-full"></textarea>
          </div>
        </p-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <p-button label="إلغاء" severity="secondary" [outlined]="true" 
                    routerLink="/spare-parts"></p-button>
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
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .md\\:col-span-3 { grid-column: span 3 / span 3; }
    }
    .w-full { width: 100%; }
  `]
})
export class SparePartFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sparePartsService = inject(SparePartsService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  isEditMode = false;
  partId: string | null = null;
  isSubmitting = false;
  loadingPart = false;
  
  categories: SparePartCategory[] = [];
  categoryOptions: { label: string; value: string }[] = [];
  
  unitOptions = [
    { label: 'قطعة', value: 'piece' },
    { label: 'متر', value: 'meter' },
    { label: 'كيلوغرام', value: 'kg' },
    { label: 'لتر', value: 'liter' },
    { label: 'علبة', value: 'box' },
    { label: 'مجموعة', value: 'set' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    this.partId = this.route.snapshot.paramMap.get('id');
    if (this.partId && this.partId !== 'new') {
      this.isEditMode = true;
      this.loadPart(this.partId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      partCode: ['', Validators.required],
      name: ['', Validators.required],
      nameEn: [''],
      categoryId: [''],
      unit: ['piece', Validators.required],
      manufacturer: [''],
      description: [''],
      minStock: [0],
      maxStock: [null],
      reorderPoint: [0],
      unitCost: [0],
      location: [''],
      leadTimeDays: [null],
      isCritical: [false],
      notes: ['']
    });
  }

  loadCategories() {
    this.sparePartsService.getCategories(environment.defaultBusinessId).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.categoryOptions = this.categories.map(c => ({ label: c.name, value: c.id }));
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadPart(id: string) {
    this.loadingPart = true;
    this.sparePartsService.getSparePart(id).subscribe({
      next: (response) => {
        const part: any = response.data;
        this.form.patchValue({
          partCode: part.part_code || part.partCode,
          name: part.name,
          nameEn: part.name_en || part.nameEn,
          categoryId: part.category_id || part.categoryId,
          unit: part.unit || 'piece',
          manufacturer: part.manufacturer,
          description: part.description,
          minStock: part.min_stock || part.minStock || 0,
          maxStock: part.max_stock || part.maxStock,
          reorderPoint: part.reorder_point || part.reorderPoint || 0,
          unitCost: Number(part.unit_cost || part.unitCost) || 0,
          location: part.location,
          leadTimeDays: part.lead_time_days || part.leadTimeDays,
          isCritical: part.is_critical !== undefined ? part.is_critical : part.isCritical,
          notes: part.notes
        });
        this.loadingPart = false;
      },
      error: (error) => {
        console.error('Error loading part:', error);
        this.loadingPart = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات قطعة الغيار'
        });
        this.router.navigate(['/spare-parts']);
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
        partCode: formValue.partCode,
        name: formValue.name,
        nameEn: formValue.nameEn || undefined,
        categoryId: formValue.categoryId || undefined,
        unit: formValue.unit,
        manufacturer: formValue.manufacturer || undefined,
        description: formValue.description || undefined,
        minStock: formValue.minStock || 0,
        maxStock: formValue.maxStock || undefined,
        reorderPoint: formValue.reorderPoint || 0,
        unitCost: formValue.unitCost || 0,
        location: formValue.location || undefined,
        leadTimeDays: formValue.leadTimeDays || undefined,
        isCritical: formValue.isCritical || false,
        notes: formValue.notes || undefined
      };

      this.sparePartsService.updateSparePart(this.partId!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تحديث قطعة الغيار بنجاح'
          });
          setTimeout(() => this.router.navigate(['/spare-parts']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    } else {
      // Create - with businessId
      const createData: CreateSparePartDto = {
        businessId: environment.defaultBusinessId,
        partCode: formValue.partCode,
        name: formValue.name,
        nameEn: formValue.nameEn || undefined,
        categoryId: formValue.categoryId || undefined,
        unit: formValue.unit,
        manufacturer: formValue.manufacturer || undefined,
        description: formValue.description || undefined,
        minStock: formValue.minStock || 0,
        maxStock: formValue.maxStock || undefined,
        reorderPoint: formValue.reorderPoint || 0,
        unitCost: formValue.unitCost || 0,
        location: formValue.location || undefined,
        leadTimeDays: formValue.leadTimeDays || undefined,
        isCritical: formValue.isCritical || false,
        notes: formValue.notes || undefined
      };

      this.sparePartsService.createSparePart(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم إضافة قطعة الغيار بنجاح'
          });
          setTimeout(() => this.router.navigate(['/spare-parts']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    }
  }

  private handleError(error: any) {
    let errorMessage = 'فشل في حفظ قطعة الغيار';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'بيانات غير صالحة، يرجى التحقق من الحقول';
    } else if (error.status === 409) {
      errorMessage = 'كود القطعة موجود مسبقاً';
    }
    
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: errorMessage
    });
  }
}
