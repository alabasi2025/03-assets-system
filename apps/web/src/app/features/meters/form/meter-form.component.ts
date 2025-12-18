import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MetersService } from '../../../core/services/meters.service';

@Component({
  selector: 'app-meter-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="mb-4"><h2 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'تعديل العداد' : 'إضافة عداد جديد' }}</h2></div>
      <p-card>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field"><label>رقم العداد *</label><input pInputText formControlName="code" class="w-full" /></div>
            <div class="field"><label>الرقم التسلسلي</label><input pInputText formControlName="serial_number" class="w-full" /></div>
            <div class="field"><label>النوع</label><p-select [options]="types" formControlName="type" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
            <div class="field"><label>الشركة المصنعة</label><input pInputText formControlName="manufacturer" class="w-full" /></div>
            <div class="field"><label>الموديل</label><input pInputText formControlName="model" class="w-full" /></div>
            <div class="field"><label>السعة (أمبير)</label><p-inputNumber formControlName="capacity_amp" class="w-full"></p-inputNumber></div>
            <div class="field"><label>الحالة</label><p-select [options]="statuses" formControlName="status" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
          </div>
          <div class="flex gap-2 mt-4">
            <button pButton type="submit" [label]="isEditMode ? 'تحديث' : 'حفظ'" icon="pi pi-check" [disabled]="form.invalid || loading"></button>
            <a routerLink="/meters" pButton label="إلغاء" icon="pi pi-times" class="p-button-secondary"></a>
          </div>
        </form>
      </p-card>
    </div>
  `
})
export class MeterFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  meterId: string | null = null;
  types = [{ label: 'أحادي الطور', value: 'single_phase' }, { label: 'ثلاثي الطور', value: 'three_phase' }, { label: 'ذكي', value: 'smart' }, { label: 'مسبق الدفع', value: 'prepaid' }];
  statuses = [{ label: 'نشط', value: 'active' }, { label: 'غير نشط', value: 'inactive' }, { label: 'معطل', value: 'faulty' }];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private metersService: MetersService, private messageService: MessageService) {}

  ngOnInit() {
    this.form = this.fb.group({
      code: ['', Validators.required], serial_number: [''], type: ['single_phase'],
      manufacturer: [''], model: [''], capacity_amp: [null], status: ['active']
    });
    this.meterId = this.route.snapshot.paramMap.get('id');
    if (this.meterId) { this.isEditMode = true; this.loadMeter(); }
  }

  loadMeter() {
    this.metersService.getById(this.meterId!).subscribe({
      next: (data: any) => this.form.patchValue(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل بيانات العداد' })
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const formValue = this.form.value;
    const data: any = { code: formValue.code, status: formValue.status };
    if (formValue.serial_number) data.serial_number = formValue.serial_number;
    if (formValue.type) data.type = formValue.type;
    if (formValue.manufacturer) data.manufacturer = formValue.manufacturer;
    if (formValue.model) data.model = formValue.model;
    if (formValue.capacity_amp) data.capacity_amp = formValue.capacity_amp;
    const request = this.isEditMode ? this.metersService.update(this.meterId!, data) : this.metersService.create(data);
    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.isEditMode ? 'تم تحديث العداد' : 'تم إضافة العداد' });
        setTimeout(() => this.router.navigate(['/meters']), 1000);
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ البيانات' }); this.loading = false; }
    });
  }
}
