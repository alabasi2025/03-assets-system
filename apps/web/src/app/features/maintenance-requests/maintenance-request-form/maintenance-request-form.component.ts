import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { MaintenanceService } from '../../../core/services/maintenance.service';
import { AssetsService } from '../../../core/services/assets.service';
import { CreateMaintenanceRequestDto, RequestType, Priority } from '../../../core/models/maintenance.model';
import { Asset } from '../../../core/models/asset.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-maintenance-request-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-left"></p-toast>
    
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="loadingRequest" class="loading-overlay">
        <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
        <p>جاري تحميل بيانات الطلب...</p>
      </div>
      
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>{{ isEditMode ? 'تعديل طلب صيانة' : 'إنشاء طلب صيانة جديد' }}</h2>
          <p>{{ isEditMode ? 'تعديل بيانات طلب الصيانة' : 'تسجيل طلب صيانة طارئة أو تصحيحية' }}</p>
        </div>
        <p-button label="العودة للقائمة" icon="pi pi-arrow-right" 
                  severity="secondary" [outlined]="true" routerLink="/maintenance-requests"></p-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Basic Information -->
        <p-card header="بيانات الطلب" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
              <label for="title">عنوان الطلب <span class="required">*</span></label>
              <input pInputText id="title" formControlName="title" 
                     placeholder="وصف مختصر للمشكلة" class="w-full" />
              <small *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="error-text">
                عنوان الطلب مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="assetId">الأصل المعني</label>
              <p-select id="assetId" formControlName="assetId" 
                        [options]="assetOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الأصل" [showClear]="true" [filter]="true"
                        styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="requestType">نوع الطلب <span class="required">*</span></label>
              <p-select id="requestType" formControlName="requestType" 
                        [options]="requestTypeOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر نوع الطلب" styleClass="w-full">
              </p-select>
              <small *ngIf="form.get('requestType')?.invalid && form.get('requestType')?.touched" class="error-text">
                نوع الطلب مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="priority">الأولوية <span class="required">*</span></label>
              <p-select id="priority" formControlName="priority" 
                        [options]="priorityOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الأولوية" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field">
              <label for="location">الموقع</label>
              <input pInputText id="location" formControlName="location" 
                     placeholder="موقع المشكلة" class="w-full" />
            </div>
            
            <div class="form-field md:col-span-2">
              <label for="description">وصف المشكلة</label>
              <textarea pTextarea id="description" formControlName="description" 
                        rows="4" placeholder="وصف تفصيلي للمشكلة أو العطل" class="w-full"></textarea>
            </div>
          </div>
        </p-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <p-button label="إلغاء" severity="secondary" [outlined]="true" 
                    routerLink="/maintenance-requests"></p-button>
          <p-button [label]="isEditMode ? 'تحديث' : 'إرسال الطلب'" 
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
    .justify-end { justify-content: flex-end; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:col-span-2 { grid-column: span 2 / span 2; }
    }
    .w-full { width: 100%; }
  `]
})
export class MaintenanceRequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private maintenanceService = inject(MaintenanceService);
  private assetsService = inject(AssetsService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  isEditMode = false;
  requestId: string | null = null;
  isSubmitting = false;
  loadingRequest = false;
  
  assets: Asset[] = [];
  assetOptions: { label: string; value: string }[] = [];
  
  requestTypeOptions = [
    { label: 'عطل', value: 'breakdown' },
    { label: 'خلل', value: 'malfunction' },
    { label: 'تلف', value: 'damage' },
    { label: 'أخرى', value: 'other' }
  ];
  
  priorityOptions = [
    { label: 'منخفضة', value: 'low' },
    { label: 'متوسطة', value: 'medium' },
    { label: 'عالية', value: 'high' },
    { label: 'حرجة', value: 'critical' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadAssets();
    
    this.requestId = this.route.snapshot.paramMap.get('id');
    if (this.requestId && this.requestId !== 'new') {
      this.isEditMode = true;
      this.loadRequest(this.requestId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      assetId: [''],
      requestType: ['breakdown', Validators.required],
      priority: ['medium', Validators.required],
      location: [''],
      description: ['']
    });
  }

  loadAssets() {
    this.assetsService.getAssets({ businessId: environment.defaultBusinessId }).subscribe({
      next: (response) => {
        this.assets = response.data;
        this.assetOptions = this.assets.map(a => ({
          label: `${(a as any).asset_code || (a as any).assetCode || ''} - ${a.name}`,
          value: a.id
        }));
      },
      error: (error) => console.error('Error loading assets:', error)
    });
  }

  loadRequest(id: string) {
    this.loadingRequest = true;
    this.maintenanceService.getRequest(id).subscribe({
      next: (response) => {
        const request: any = response.data;
        this.form.patchValue({
          title: request.title,
          assetId: request.asset_id || request.assetId,
          requestType: request.request_type || request.requestType,
          priority: request.priority,
          location: request.location,
          description: request.description
        });
        this.loadingRequest = false;
      },
      error: (error) => {
        console.error('Error loading request:', error);
        this.loadingRequest = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الطلب'
        });
        this.router.navigate(['/maintenance-requests']);
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
        title: formValue.title,
        assetId: formValue.assetId || undefined,
        requestType: formValue.requestType,
        priority: formValue.priority,
        location: formValue.location || undefined,
        description: formValue.description || undefined
      };

      this.maintenanceService.updateRequest(this.requestId!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تحديث طلب الصيانة بنجاح'
          });
          setTimeout(() => this.router.navigate(['/maintenance-requests']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    } else {
      // Create - with businessId
      const createData: CreateMaintenanceRequestDto = {
        businessId: environment.defaultBusinessId,
        title: formValue.title,
        assetId: formValue.assetId || undefined,
        requestType: formValue.requestType as RequestType,
        priority: formValue.priority as Priority,
        location: formValue.location || undefined,
        description: formValue.description || undefined
      };

      this.maintenanceService.createRequest(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم إنشاء طلب الصيانة بنجاح'
          });
          setTimeout(() => this.router.navigate(['/maintenance-requests']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    }
  }

  private handleError(error: any) {
    let errorMessage = 'فشل في حفظ طلب الصيانة';
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
