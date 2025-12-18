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
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { AssetsService } from '../../../core/services/assets.service';
import { AssetCategory, CreateAssetDto } from '../../../core/models/asset.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-asset-form',
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
    DatePickerModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="loadingAsset" class="loading-overlay">
        <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
        <p>جاري تحميل بيانات الأصل...</p>
      </div>
      
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>{{ isEditMode ? 'تعديل الأصل' : 'إضافة أصل جديد' }}</h2>
          <p>{{ isEditMode ? 'تعديل بيانات الأصل المسجل' : 'تسجيل أصل جديد في النظام' }}</p>
        </div>
        <p-button label="العودة للقائمة" icon="pi pi-arrow-right" 
                  severity="secondary" [outlined]="true" routerLink="/assets"></p-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Basic Information -->
        <p-card header="البيانات الأساسية" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="assetNumber">رقم الأصل <span class="required">*</span></label>
              <input pInputText id="assetNumber" formControlName="assetNumber" 
                     placeholder="مثال: AST-001" class="w-full"
                     [class.ng-invalid]="form.get('assetNumber')?.invalid && form.get('assetNumber')?.touched" />
              <small *ngIf="form.get('assetNumber')?.invalid && form.get('assetNumber')?.touched" class="error-text">
                رقم الأصل مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="name">اسم الأصل <span class="required">*</span></label>
              <input pInputText id="name" formControlName="name" 
                     placeholder="اسم الأصل بالعربية" class="w-full"
                     [class.ng-invalid]="form.get('name')?.invalid && form.get('name')?.touched" />
              <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="error-text">
                اسم الأصل مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="nameEn">الاسم بالإنجليزية</label>
              <input pInputText id="nameEn" formControlName="nameEn" 
                     placeholder="Asset name in English" class="w-full" />
            </div>
            
            <div class="form-field">
              <label for="categoryId">التصنيف <span class="required">*</span></label>
              <p-select id="categoryId" formControlName="categoryId" 
                        [options]="categoryOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر التصنيف" styleClass="w-full"
                        [class.ng-invalid]="form.get('categoryId')?.invalid && form.get('categoryId')?.touched">
              </p-select>
              <small *ngIf="form.get('categoryId')?.invalid && form.get('categoryId')?.touched" class="error-text">
                التصنيف مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="barcode">الباركود</label>
              <input pInputText id="barcode" formControlName="barcode" 
                     placeholder="رقم الباركود" class="w-full" />
            </div>
            
            <div class="form-field">
              <label for="location">الموقع</label>
              <input pInputText id="location" formControlName="location" 
                     placeholder="موقع الأصل" class="w-full" />
            </div>
            
            <div class="form-field md:col-span-3">
              <label for="description">الوصف</label>
              <textarea pTextarea id="description" formControlName="description" 
                        rows="3" placeholder="وصف تفصيلي للأصل" class="w-full"></textarea>
            </div>
          </div>
        </p-card>

        <!-- Technical Data -->
        <p-card header="البيانات الفنية" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="manufacturer">الشركة المصنعة</label>
              <input pInputText id="manufacturer" formControlName="manufacturer" 
                     placeholder="اسم الشركة المصنعة" class="w-full" />
            </div>
            
            <div class="form-field">
              <label for="model">الموديل</label>
              <input pInputText id="model" formControlName="model" 
                     placeholder="رقم الموديل" class="w-full" />
            </div>
            
            <div class="form-field">
              <label for="serialNumber">الرقم التسلسلي</label>
              <input pInputText id="serialNumber" formControlName="serialNumber" 
                     placeholder="الرقم التسلسلي للأصل" class="w-full" />
            </div>
          </div>
        </p-card>

        <!-- Financial Data -->
        <p-card header="البيانات المالية" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="acquisitionDate">تاريخ الاقتناء <span class="required">*</span></label>
              <p-datepicker id="acquisitionDate" formControlName="acquisitionDate" 
                            dateFormat="yy-mm-dd" [showIcon]="true" styleClass="w-full"
                            placeholder="اختر التاريخ"
                            [class.ng-invalid]="form.get('acquisitionDate')?.invalid && form.get('acquisitionDate')?.touched">
              </p-datepicker>
              <small *ngIf="form.get('acquisitionDate')?.invalid && form.get('acquisitionDate')?.touched" class="error-text">
                تاريخ الاقتناء مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="acquisitionCost">تكلفة الاقتناء <span class="required">*</span></label>
              <p-inputNumber id="acquisitionCost" formControlName="acquisitionCost" 
                             mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2"
                             [min]="0" placeholder="0.00" styleClass="w-full"
                             [class.ng-invalid]="form.get('acquisitionCost')?.invalid && form.get('acquisitionCost')?.touched">
              </p-inputNumber>
              <small *ngIf="form.get('acquisitionCost')?.invalid && form.get('acquisitionCost')?.touched" class="error-text">
                تكلفة الاقتناء مطلوبة
              </small>
            </div>
            
            <div class="form-field">
              <label for="acquisitionMethod">طريقة الاقتناء</label>
              <p-select id="acquisitionMethod" formControlName="acquisitionMethod" 
                        [options]="acquisitionMethodOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر طريقة الاقتناء" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="invoiceNumber">رقم الفاتورة</label>
              <input pInputText id="invoiceNumber" formControlName="invoiceNumber" 
                     placeholder="رقم فاتورة الشراء" class="w-full" />
            </div>
          </div>
        </p-card>

        <!-- Depreciation -->
        <p-card header="الإهلاك" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="depreciationMethod">طريقة الإهلاك</label>
              <p-select id="depreciationMethod" formControlName="depreciationMethod" 
                        [options]="depreciationMethodOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر طريقة الإهلاك" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="usefulLifeYears">العمر الإنتاجي (سنوات) <span class="required">*</span></label>
              <p-inputNumber id="usefulLifeYears" formControlName="usefulLifeYears" 
                             [min]="1" [max]="100" placeholder="5" styleClass="w-full"
                             [class.ng-invalid]="form.get('usefulLifeYears')?.invalid && form.get('usefulLifeYears')?.touched">
              </p-inputNumber>
              <small *ngIf="form.get('usefulLifeYears')?.invalid && form.get('usefulLifeYears')?.touched" class="error-text">
                العمر الإنتاجي مطلوب (1 سنة على الأقل)
              </small>
            </div>
            
            <div class="form-field">
              <label for="salvageValue">قيمة الخردة</label>
              <p-inputNumber id="salvageValue" formControlName="salvageValue" 
                             mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2"
                             [min]="0" placeholder="0.00" styleClass="w-full">
              </p-inputNumber>
            </div>
          </div>
        </p-card>

        <!-- Warranty -->
        <p-card header="الضمان" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="warrantyStart">بداية الضمان</label>
              <p-datepicker id="warrantyStart" formControlName="warrantyStart" 
                            dateFormat="yy-mm-dd" [showIcon]="true" styleClass="w-full"
                            placeholder="اختر التاريخ">
              </p-datepicker>
            </div>
            
            <div class="form-field">
              <label for="warrantyEnd">نهاية الضمان</label>
              <p-datepicker id="warrantyEnd" formControlName="warrantyEnd" 
                            dateFormat="yy-mm-dd" [showIcon]="true" styleClass="w-full"
                            placeholder="اختر التاريخ">
              </p-datepicker>
            </div>
            
            <div class="form-field">
              <label for="warrantyProvider">مزود الضمان</label>
              <input pInputText id="warrantyProvider" formControlName="warrantyProvider" 
                     placeholder="اسم مزود الضمان" class="w-full" />
            </div>
          </div>
        </p-card>

        <!-- Status -->
        <p-card header="الحالة" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
              <label for="status">حالة الأصل</label>
              <p-select id="status" formControlName="status" 
                        [options]="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الحالة" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="condition">الحالة الفنية</label>
              <p-select id="condition" formControlName="condition" 
                        [options]="conditionOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الحالة الفنية" styleClass="w-full">
              </p-select>
            </div>
          </div>
        </p-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-4">
          <p-button label="إلغاء" icon="pi pi-times" severity="secondary" 
                    [outlined]="true" routerLink="/assets"></p-button>
          <p-button [label]="isSubmitting ? 'جاري الحفظ...' : (isEditMode ? 'تحديث' : 'حفظ')" 
                    icon="pi pi-check" type="submit"
                    [disabled]="form.invalid || isSubmitting" [loading]="isSubmitting">
          </p-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page-container { padding: 1.5rem; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .page-header p {
      color: #64748b;
      margin: 0.25rem 0 0;
    }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-field label {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }
    .required { color: #ef4444; }
    .error-text {
      color: #ef4444;
      font-size: 0.75rem;
    }
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .loading-overlay p {
      margin-top: 1rem;
      color: #64748b;
    }
    :host ::ng-deep .p-card {
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    :host ::ng-deep .p-card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }
    :host ::ng-deep .ng-invalid.ng-touched {
      border-color: #ef4444 !important;
    }
  `]
})
export class AssetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private assetsService = inject(AssetsService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  categories: AssetCategory[] = [];
  categoryOptions: { label: string; value: string }[] = [];
  
  isEditMode = false;
  isSubmitting = false;
  loadingAsset = false;
  assetId: string | null = null;

  // Options
  acquisitionMethodOptions = [
    { label: 'شراء', value: 'purchase' },
    { label: 'تبرع', value: 'donation' },
    { label: 'تحويل', value: 'transfer' },
    { label: 'إنشاء', value: 'construction' }
  ];

  depreciationMethodOptions = [
    { label: 'القسط الثابت', value: 'straight_line' },
    { label: 'القسط المتناقص', value: 'declining_balance' }
  ];

  statusOptions = [
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' },
    { label: 'تحت الصيانة', value: 'under_maintenance' }
  ];

  conditionOptions = [
    { label: 'ممتاز', value: 'excellent' },
    { label: 'جيد', value: 'good' },
    { label: 'مقبول', value: 'fair' },
    { label: 'ضعيف', value: 'poor' },
    { label: 'تالف', value: 'damaged' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    // Check if edit mode
    this.assetId = this.route.snapshot.paramMap.get('id');
    const url = this.router.url;
    
    if (this.assetId && this.assetId !== 'new') {
      // Check if it's edit or view mode
      if (url.includes('/edit')) {
        this.isEditMode = true;
        this.loadAsset(this.assetId);
      } else {
        // View mode - also load asset but in read-only
        this.isEditMode = true;
        this.loadAsset(this.assetId);
      }
    }
  }

  initForm() {
    this.form = this.fb.group({
      assetNumber: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      nameEn: ['', Validators.maxLength(255)],
      categoryId: ['', Validators.required],
      barcode: ['', Validators.maxLength(100)],
      location: ['', Validators.maxLength(255)],
      description: [''],
      manufacturer: ['', Validators.maxLength(255)],
      model: ['', Validators.maxLength(255)],
      serialNumber: ['', Validators.maxLength(100)],
      acquisitionDate: [null, Validators.required],
      acquisitionCost: [0, [Validators.required, Validators.min(0)]],
      acquisitionMethod: ['purchase'],
      invoiceNumber: ['', Validators.maxLength(100)],
      depreciationMethod: ['straight_line'],
      usefulLifeYears: [5, [Validators.required, Validators.min(1)]],
      salvageValue: [0, Validators.min(0)],
      warrantyStart: [null],
      warrantyEnd: [null],
      warrantyProvider: ['', Validators.maxLength(255)],
      status: ['active'],
      condition: ['good'],
    });
  }

  loadCategories() {
    this.assetsService.getCategories({ businessId: environment.defaultBusinessId }).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.categoryOptions = this.categories.map(c => ({
          label: c.name,
          value: c.id
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل التصنيفات'
        });
      }
    });
  }

  loadAsset(id: string) {
    this.loadingAsset = true;
    this.assetsService.getAsset(id).subscribe({
      next: (response) => {
        const asset: any = response.data;
        
        // Convert dates and map field names (handle both camelCase and snake_case)
        this.form.patchValue({
          assetNumber: asset.asset_number || asset.assetNumber,
          name: asset.name,
          nameEn: asset.name_en || asset.nameEn,
          categoryId: asset.category_id || asset.categoryId,
          barcode: asset.barcode,
          location: asset.location,
          description: asset.description,
          manufacturer: asset.manufacturer,
          model: asset.model,
          serialNumber: asset.serial_number || asset.serialNumber,
          acquisitionDate: asset.acquisition_date ? new Date(asset.acquisition_date) : null,
          acquisitionCost: Number(asset.acquisition_cost || asset.acquisitionCost) || 0,
          acquisitionMethod: asset.acquisition_method || asset.acquisitionMethod || 'purchase',
          invoiceNumber: asset.invoice_number || asset.invoiceNumber,
          depreciationMethod: asset.depreciation_method || asset.depreciationMethod || 'straight_line',
          usefulLifeYears: asset.useful_life_years || asset.usefulLifeYears || 5,
          salvageValue: Number(asset.salvage_value || asset.salvageValue) || 0,
          warrantyStart: asset.warranty_start ? new Date(asset.warranty_start) : null,
          warrantyEnd: asset.warranty_end ? new Date(asset.warranty_end) : null,
          warrantyProvider: asset.warranty_provider || asset.warrantyProvider,
          status: asset.status || 'active',
          condition: asset.condition || 'good',
        });
        
        this.loadingAsset = false;
      },
      error: (error) => {
        console.error('Error loading asset:', error);
        this.loadingAsset = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الأصل'
        });
        this.router.navigate(['/assets']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
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
    
    // Prepare data
    const formValue = this.form.value;
    
    // For create, include businessId; for update, exclude it
    if (this.isEditMode) {
      // Update DTO - without businessId
      const updateData = {
        assetNumber: formValue.assetNumber,
        name: formValue.name,
        nameEn: formValue.nameEn || undefined,
        categoryId: formValue.categoryId,
        barcode: formValue.barcode || undefined,
        location: formValue.location || undefined,
        description: formValue.description || undefined,
        manufacturer: formValue.manufacturer || undefined,
        model: formValue.model || undefined,
        serialNumber: formValue.serialNumber || undefined,
        acquisitionDate: formValue.acquisitionDate ? this.formatDate(formValue.acquisitionDate) : undefined,
        acquisitionCost: formValue.acquisitionCost || 0,
        acquisitionMethod: formValue.acquisitionMethod || 'purchase',
        invoiceNumber: formValue.invoiceNumber || undefined,
        depreciationMethod: formValue.depreciationMethod || 'straight_line',
        usefulLifeYears: formValue.usefulLifeYears || 5,
        salvageValue: formValue.salvageValue || 0,
        warrantyStart: formValue.warrantyStart ? this.formatDate(formValue.warrantyStart) : undefined,
        warrantyEnd: formValue.warrantyEnd ? this.formatDate(formValue.warrantyEnd) : undefined,
        warrantyProvider: formValue.warrantyProvider || undefined,
        status: formValue.status || 'active',
        condition: formValue.condition || 'good',
      };
      
      this.assetsService.updateAsset(this.assetId!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تحديث الأصل بنجاح'
          });
          setTimeout(() => {
            this.router.navigate(['/assets']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating asset:', error);
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
      return;
    }
    
    // Create DTO - with businessId
    const createData: CreateAssetDto = {
      businessId: environment.defaultBusinessId,
      assetNumber: formValue.assetNumber,
      name: formValue.name,
      nameEn: formValue.nameEn || undefined,
      categoryId: formValue.categoryId,
      barcode: formValue.barcode || undefined,
      location: formValue.location || undefined,
      description: formValue.description || undefined,
      manufacturer: formValue.manufacturer || undefined,
      model: formValue.model || undefined,
      serialNumber: formValue.serialNumber || undefined,
      acquisitionDate: formValue.acquisitionDate ? this.formatDate(formValue.acquisitionDate) : '',
      acquisitionCost: formValue.acquisitionCost || 0,
      acquisitionMethod: formValue.acquisitionMethod || 'purchase',
      invoiceNumber: formValue.invoiceNumber || undefined,
      depreciationMethod: formValue.depreciationMethod || 'straight_line',
      usefulLifeYears: formValue.usefulLifeYears || 5,
      salvageValue: formValue.salvageValue || 0,
      warrantyStart: formValue.warrantyStart ? this.formatDate(formValue.warrantyStart) : undefined,
      warrantyEnd: formValue.warrantyEnd ? this.formatDate(formValue.warrantyEnd) : undefined,
      warrantyProvider: formValue.warrantyProvider || undefined,
      status: formValue.status || 'active',
      condition: formValue.condition || 'good',
    };

    const request = this.assetsService.createAsset(createData);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم',
          detail: this.isEditMode ? 'تم تحديث الأصل بنجاح' : 'تم إضافة الأصل بنجاح'
        });
        
        // Navigate after short delay to show message
        setTimeout(() => {
          this.router.navigate(['/assets']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error saving asset:', error);
        this.isSubmitting = false;
        
        let errorMessage = 'فشل في حفظ الأصل';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'بيانات غير صالحة، يرجى التحقق من الحقول';
        } else if (error.status === 409) {
          errorMessage = 'رقم الأصل موجود مسبقاً';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: errorMessage
        });
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private handleError(error: any) {
    let errorMessage = 'فشل في حفظ الأصل';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'بيانات غير صالحة، يرجى التحقق من الحقول';
    } else if (error.status === 409) {
      errorMessage = 'رقم الأصل موجود مسبقاً';
    }
    
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: errorMessage
    });
  }
}
