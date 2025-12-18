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
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import { MaintenanceService } from '../../../core/services/maintenance.service';
import { AssetsService } from '../../../core/services/assets.service';
import { CreateWorkOrderDto, OrderType, Priority } from '../../../core/models/maintenance.model';
import { Asset } from '../../../core/models/asset.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-work-order-form',
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
    DatePickerModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-left"></p-toast>
    
    <div class="page-container">
      <!-- Loading State -->
      <div *ngIf="loadingOrder" class="loading-overlay">
        <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
        <p>جاري تحميل بيانات أمر العمل...</p>
      </div>
      
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>{{ isEditMode ? 'تعديل أمر عمل' : 'إنشاء أمر عمل جديد' }}</h2>
          <p>{{ isEditMode ? 'تعديل بيانات أمر العمل' : 'إنشاء أمر عمل جديد للصيانة' }}</p>
        </div>
        <p-button label="العودة للقائمة" icon="pi pi-arrow-right" 
                  severity="secondary" [outlined]="true" routerLink="/work-orders"></p-button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Basic Information -->
        <p-card header="بيانات أمر العمل" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
              <label for="title">عنوان أمر العمل <span class="required">*</span></label>
              <input pInputText id="title" formControlName="title" 
                     placeholder="وصف مختصر للعمل المطلوب" class="w-full" />
              <small *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="error-text">
                عنوان أمر العمل مطلوب
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
              <label for="orderType">نوع أمر العمل <span class="required">*</span></label>
              <p-select id="orderType" formControlName="orderType" 
                        [options]="orderTypeOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر نوع العمل" styleClass="w-full">
              </p-select>
              <small *ngIf="form.get('orderType')?.invalid && form.get('orderType')?.touched" class="error-text">
                نوع أمر العمل مطلوب
              </small>
            </div>
            
            <div class="form-field">
              <label for="priority">الأولوية <span class="required">*</span></label>
              <p-select id="priority" formControlName="priority" 
                        [options]="priorityOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الأولوية" styleClass="w-full">
              </p-select>
            </div>
            
            <div class="form-field md:col-span-2">
              <label for="description">وصف العمل</label>
              <textarea pTextarea id="description" formControlName="description" 
                        rows="3" placeholder="وصف تفصيلي للعمل المطلوب" class="w-full"></textarea>
            </div>
            
            <div class="form-field md:col-span-2">
              <label for="instructions">تعليمات التنفيذ</label>
              <textarea pTextarea id="instructions" formControlName="instructions" 
                        rows="3" placeholder="تعليمات وإرشادات للفني" class="w-full"></textarea>
            </div>
          </div>
        </p-card>

        <!-- Schedule & Cost -->
        <p-card header="الجدولة والتكلفة" styleClass="mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label for="scheduledStart">تاريخ البدء المجدول</label>
              <p-datepicker id="scheduledStart" formControlName="scheduledStart" 
                            [showTime]="true" dateFormat="yy-mm-dd"
                            placeholder="اختر تاريخ البدء" styleClass="w-full">
              </p-datepicker>
            </div>
            
            <div class="form-field">
              <label for="scheduledEnd">تاريخ الانتهاء المجدول</label>
              <p-datepicker id="scheduledEnd" formControlName="scheduledEnd" 
                            [showTime]="true" dateFormat="yy-mm-dd"
                            placeholder="اختر تاريخ الانتهاء" styleClass="w-full">
              </p-datepicker>
            </div>
            
            <div class="form-field">
              <label for="estimatedCost">التكلفة المقدرة</label>
              <p-inputNumber id="estimatedCost" formControlName="estimatedCost" 
                             mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2"
                             [min]="0" placeholder="0.00" styleClass="w-full">
              </p-inputNumber>
            </div>
          </div>
        </p-card>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <p-button label="إلغاء" severity="secondary" [outlined]="true" 
                    routerLink="/work-orders"></p-button>
          <p-button [label]="isEditMode ? 'تحديث' : 'إنشاء أمر العمل'" 
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
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:col-span-2 { grid-column: span 2 / span 2; }
    }
    .w-full { width: 100%; }
  `]
})
export class WorkOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private maintenanceService = inject(MaintenanceService);
  private assetsService = inject(AssetsService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  isEditMode = false;
  orderId: string | null = null;
  isSubmitting = false;
  loadingOrder = false;
  
  assets: Asset[] = [];
  assetOptions: { label: string; value: string }[] = [];
  
  orderTypeOptions = [
    { label: 'إصلاح', value: 'repair' },
    { label: 'استبدال', value: 'replacement' },
    { label: 'فحص', value: 'inspection' },
    { label: 'ترقية', value: 'upgrade' }
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
    
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId && this.orderId !== 'new') {
      this.isEditMode = true;
      this.loadOrder(this.orderId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      assetId: [''],
      orderType: ['repair', Validators.required],
      priority: ['medium', Validators.required],
      description: [''],
      instructions: [''],
      scheduledStart: [null],
      scheduledEnd: [null],
      estimatedCost: [null]
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

  loadOrder(id: string) {
    this.loadingOrder = true;
    this.maintenanceService.getWorkOrder(id).subscribe({
      next: (response) => {
        const order: any = response.data;
        this.form.patchValue({
          title: order.title,
          assetId: order.asset_id || order.assetId,
          orderType: order.order_type || order.orderType,
          priority: order.priority,
          description: order.description,
          instructions: order.instructions,
          scheduledStart: order.scheduled_start || order.scheduledStart ? new Date(order.scheduled_start || order.scheduledStart) : null,
          scheduledEnd: order.scheduled_end || order.scheduledEnd ? new Date(order.scheduled_end || order.scheduledEnd) : null,
          estimatedCost: Number(order.estimated_cost || order.estimatedCost) || null
        });
        this.loadingOrder = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loadingOrder = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات أمر العمل'
        });
        this.router.navigate(['/work-orders']);
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
        orderType: formValue.orderType,
        priority: formValue.priority,
        description: formValue.description || undefined,
        instructions: formValue.instructions || undefined,
        scheduledStart: formValue.scheduledStart ? formValue.scheduledStart.toISOString() : undefined,
        scheduledEnd: formValue.scheduledEnd ? formValue.scheduledEnd.toISOString() : undefined,
        estimatedCost: formValue.estimatedCost || undefined
      };

      this.maintenanceService.updateWorkOrder(this.orderId!, updateData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تحديث أمر العمل بنجاح'
          });
          setTimeout(() => this.router.navigate(['/work-orders']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    } else {
      // Create - with businessId
      const createData: CreateWorkOrderDto = {
        businessId: environment.defaultBusinessId,
        title: formValue.title,
        assetId: formValue.assetId || undefined,
        orderType: formValue.orderType as OrderType,
        priority: formValue.priority as Priority,
        description: formValue.description || undefined,
        instructions: formValue.instructions || undefined,
        scheduledStart: formValue.scheduledStart ? formValue.scheduledStart.toISOString() : undefined,
        scheduledEnd: formValue.scheduledEnd ? formValue.scheduledEnd.toISOString() : undefined,
        estimatedCost: formValue.estimatedCost || undefined
      };

      this.maintenanceService.createWorkOrder(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم إنشاء أمر العمل بنجاح'
          });
          setTimeout(() => this.router.navigate(['/work-orders']), 1000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
    }
  }

  private handleError(error: any) {
    let errorMessage = 'فشل في حفظ أمر العمل';
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
