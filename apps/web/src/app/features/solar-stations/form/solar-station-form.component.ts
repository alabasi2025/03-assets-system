import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SolarStationsService } from '../../../core/services/solar-stations.service';

@Component({
  selector: 'app-solar-station-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, TextareaModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="mb-4"><h2 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'تعديل المحطة الشمسية' : 'إضافة محطة شمسية جديدة' }}</h2></div>
      <p-card>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field"><label>رقم المحطة *</label><input pInputText formControlName="code" class="w-full" /></div>
            <div class="field"><label>الاسم *</label><input pInputText formControlName="name" class="w-full" /></div>
            <div class="field"><label>الموقع</label><input pInputText formControlName="location" class="w-full" /></div>
            <div class="field"><label>السعة الكلية (كيلوواط)</label><p-inputNumber formControlName="total_capacity_kw" class="w-full"></p-inputNumber></div>
            <div class="field"><label>تاريخ التشغيل</label><input pInputText type="date" formControlName="commissioning_date" class="w-full" /></div>
            <div class="field"><label>الحالة</label><p-select [options]="statuses" formControlName="status" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
            <div class="field md:col-span-2"><label>ملاحظات</label><textarea pTextarea formControlName="notes" rows="3" class="w-full"></textarea></div>
          </div>
          <div class="flex gap-2 mt-4">
            <button pButton type="submit" [label]="isEditMode ? 'تحديث' : 'حفظ'" icon="pi pi-check" [disabled]="form.invalid || loading"></button>
            <a routerLink="/solar-stations" pButton label="إلغاء" icon="pi pi-times" class="p-button-secondary"></a>
          </div>
        </form>
      </p-card>
    </div>
  `
})
export class SolarStationFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  stationId: string | null = null;
  statuses = [{ label: 'نشط', value: 'active' }, { label: 'غير نشط', value: 'inactive' }, { label: 'صيانة', value: 'maintenance' }];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private solarStationsService: SolarStationsService, private messageService: MessageService) {}

  ngOnInit() {
    this.form = this.fb.group({
      code: ['', Validators.required], name: ['', Validators.required], location: [''],
      total_capacity_kw: [null], commissioning_date: [''], status: ['active'], notes: ['']
    });
    this.stationId = this.route.snapshot.paramMap.get('id');
    if (this.stationId) { this.isEditMode = true; this.loadStation(); }
  }

  loadStation() {
    this.solarStationsService.getById(this.stationId!).subscribe({
      next: (data: any) => {
        if (data.commissioning_date) data.commissioning_date = data.commissioning_date.split('T')[0];
        this.form.patchValue(data);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل بيانات المحطة' })
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const formValue = this.form.value;
    const data: any = { code: formValue.code, name: formValue.name, status: formValue.status };
    if (formValue.location) data.location = formValue.location;
    if (formValue.total_capacity_kw) data.total_capacity_kw = formValue.total_capacity_kw;
    if (formValue.commissioning_date) data.commissioning_date = formValue.commissioning_date;
    if (formValue.notes) data.notes = formValue.notes;
    const request = this.isEditMode ? this.solarStationsService.update(this.stationId!, data) : this.solarStationsService.create(data);
    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.isEditMode ? 'تم تحديث المحطة' : 'تم إضافة المحطة' });
        setTimeout(() => this.router.navigate(['/solar-stations']), 1000);
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ البيانات' }); this.loading = false; }
    });
  }
}
