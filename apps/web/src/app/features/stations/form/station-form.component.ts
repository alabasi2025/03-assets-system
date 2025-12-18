import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { StationsService } from '../../../core/services/stations.service';

@Component({
  selector: 'app-station-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, SelectModule, InputNumberModule, TextareaModule,
    ButtonModule, CardModule, ToastModule, DatePickerModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="mb-4">
        <h2 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'تعديل المحطة' : 'إضافة محطة جديدة' }}</h2>
        <p class="text-gray-600">{{ isEditMode ? 'تعديل بيانات المحطة' : 'إدخال بيانات محطة جديدة' }}</p>
      </div>

      <p-card>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
              <label class="block mb-2 font-medium">رقم المحطة *</label>
              <input pInputText formControlName="code" class="w-full" placeholder="مثال: ST-001" />
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">اسم المحطة *</label>
              <input pInputText formControlName="name" class="w-full" placeholder="اسم المحطة" />
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">الاسم بالإنجليزية</label>
              <input pInputText formControlName="name_en" class="w-full" placeholder="Station Name" />
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">نوع المحطة *</label>
              <p-select formControlName="type" [options]="stationTypes" optionLabel="label" optionValue="value"
                        placeholder="اختر النوع" class="w-full" appendTo="body"></p-select>
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">السعة الكلية (كيلوواط)</label>
              <p-inputNumber formControlName="total_capacity_kw" class="w-full" mode="decimal" [minFractionDigits]="2"></p-inputNumber>
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">الحالة</label>
              <p-select formControlName="status" [options]="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="اختر الحالة" class="w-full" appendTo="body"></p-select>
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">تاريخ التركيب</label>
              <p-datePicker formControlName="installation_date" dateFormat="yy-mm-dd" class="w-full" appendTo="body"></p-datePicker>
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">العنوان</label>
              <input pInputText formControlName="address" class="w-full" placeholder="العنوان" />
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">خط العرض</label>
              <p-inputNumber formControlName="location_lat" class="w-full" mode="decimal" [minFractionDigits]="6"></p-inputNumber>
            </div>
            <div class="field">
              <label class="block mb-2 font-medium">خط الطول</label>
              <p-inputNumber formControlName="location_lng" class="w-full" mode="decimal" [minFractionDigits]="6"></p-inputNumber>
            </div>
            <div class="field md:col-span-2">
              <label class="block mb-2 font-medium">الوصف</label>
              <textarea pTextarea formControlName="description" rows="3" class="w-full" placeholder="وصف المحطة"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <a routerLink="/stations" class="p-button p-button-secondary">إلغاء</a>
            <button pButton type="submit" [label]="isEditMode ? 'تحديث' : 'حفظ'" 
                    [loading]="saving" [disabled]="form.invalid || saving"></button>
          </div>
        </form>
      </p-card>
    </div>
  `
})
export class StationFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  stationId: string | null = null;
  saving = false;

  stationTypes = [
    { label: 'توليد وتوزيع', value: 'generation_distribution' },
    { label: 'توزيع فقط', value: 'distribution_only' }
  ];

  statusOptions = [
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' },
    { label: 'صيانة', value: 'maintenance' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private stationsService: StationsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.stationId = this.route.snapshot.paramMap.get('id');
    if (this.stationId && this.stationId !== 'new') {
      this.isEditMode = true;
      this.loadStation();
    }
  }

  initForm() {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      name_en: [''],
      type: ['generation_distribution', Validators.required],
      total_capacity_kw: [null],
      status: ['active'],
      installation_date: [null],
      address: [''],
      location_lat: [null],
      location_lng: [null],
      description: ['']
    });
  }

  loadStation() {
    this.stationsService.getById(this.stationId!).subscribe({
      next: (station: any) => {
        this.form.patchValue({
          code: station.code,
          name: station.name,
          name_en: station.name_en,
          type: station.type,
          total_capacity_kw: station.total_capacity_kw,
          status: station.status,
          installation_date: station.installation_date ? new Date(station.installation_date) : null,
          address: station.address,
          location_lat: station.location_lat,
          location_lng: station.location_lng,
          description: station.description
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل بيانات المحطة' });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving = true;

    const formValue = this.form.value;
    const data: any = {
      code: formValue.code,
      name: formValue.name,
      type: formValue.type,
      status: formValue.status
    };
    
    // إضافة الحقول الاختيارية فقط إذا كانت لها قيم
    if (formValue.name_en) data.name_en = formValue.name_en;
    if (formValue.total_capacity_kw) data.total_capacity_kw = formValue.total_capacity_kw;
    if (formValue.installation_date) data.installation_date = new Date(formValue.installation_date).toISOString().split('T')[0];
    if (formValue.address) data.address = formValue.address;
    if (formValue.location_lat) data.location_lat = formValue.location_lat;
    if (formValue.location_lng) data.location_lng = formValue.location_lng;
    if (formValue.description) data.description = formValue.description;

    const request = this.isEditMode
      ? this.stationsService.update(this.stationId!, data)
      : this.stationsService.create(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.isEditMode ? 'تم تحديث المحطة بنجاح' : 'تم إضافة المحطة بنجاح' 
        });
        setTimeout(() => this.router.navigate(['/stations']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ المحطة' });
        this.saving = false;
      }
    });
  }
}
