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
import { GeneratorsService } from '../../../core/services/generators.service';
import { StationsService } from '../../../core/services/stations.service';

@Component({
  selector: 'app-generator-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="mb-4">
        <h2 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'تعديل المولد' : 'إضافة مولد جديد' }}</h2>
      </div>
      <p-card>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field"><label>رقم المولد *</label><input pInputText formControlName="code" class="w-full" /></div>
            <div class="field"><label>الاسم *</label><input pInputText formControlName="name" class="w-full" /></div>
            <div class="field"><label>المحطة</label><p-select [options]="stations" formControlName="station_id" optionLabel="name" optionValue="id" placeholder="اختر المحطة" class="w-full" appendTo="body"></p-select></div>
            <div class="field"><label>النوع</label><p-select [options]="types" formControlName="type" optionLabel="label" optionValue="value" placeholder="اختر النوع" class="w-full" appendTo="body"></p-select></div>
            <div class="field"><label>الشركة المصنعة</label><input pInputText formControlName="manufacturer" class="w-full" /></div>
            <div class="field"><label>الموديل</label><input pInputText formControlName="model" class="w-full" /></div>
            <div class="field"><label>السعة (كيلوواط)</label><p-inputNumber formControlName="capacity_kw" class="w-full"></p-inputNumber></div>
            <div class="field"><label>نوع الوقود</label><p-select [options]="fuelTypes" formControlName="fuel_type" optionLabel="label" optionValue="value" placeholder="اختر نوع الوقود" class="w-full" appendTo="body"></p-select></div>
            <div class="field"><label>الحالة</label><p-select [options]="statuses" formControlName="status" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
          </div>
          <div class="flex gap-2 mt-4">
            <button pButton type="submit" [label]="isEditMode ? 'تحديث' : 'حفظ'" icon="pi pi-check" [disabled]="form.invalid || loading"></button>
            <a routerLink="/generators" pButton label="إلغاء" icon="pi pi-times" class="p-button-secondary"></a>
          </div>
        </form>
      </p-card>
    </div>
  `
})
export class GeneratorFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  generatorId: string | null = null;
  stations: any[] = [];
  types = [{ label: 'ديزل', value: 'diesel' }, { label: 'غاز', value: 'gas' }, { label: 'هجين', value: 'hybrid' }];
  fuelTypes = [{ label: 'ديزل', value: 'diesel' }, { label: 'بنزين', value: 'petrol' }, { label: 'غاز طبيعي', value: 'natural_gas' }];
  statuses = [{ label: 'نشط', value: 'active' }, { label: 'غير نشط', value: 'inactive' }, { label: 'صيانة', value: 'maintenance' }];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private generatorsService: GeneratorsService, private stationsService: StationsService, private messageService: MessageService) {}

  ngOnInit() {
    this.form = this.fb.group({
      code: ['', Validators.required], name: ['', Validators.required], station_id: [''], type: ['diesel'],
      manufacturer: [''], model: [''], capacity_kw: [null], fuel_type: ['diesel'], status: ['active']
    });
    this.stationsService.getAll().subscribe(data => this.stations = data);
    this.generatorId = this.route.snapshot.paramMap.get('id');
    if (this.generatorId) {
      this.isEditMode = true;
      this.loadGenerator();
    }
  }

  loadGenerator() {
    this.generatorsService.getById(this.generatorId!).subscribe({
      next: (data: any) => this.form.patchValue(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل بيانات المولد' })
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const formValue = this.form.value;
    const data: any = { code: formValue.code, name: formValue.name, status: formValue.status };
    if (formValue.station_id) data.station_id = formValue.station_id;

    if (formValue.manufacturer) data.manufacturer = formValue.manufacturer;
    if (formValue.model) data.model = formValue.model;
    if (formValue.capacity_kw) data.capacity_kw = formValue.capacity_kw;
    if (formValue.fuel_type) data.fuel_type = formValue.fuel_type;
    const request = this.isEditMode ? this.generatorsService.update(this.generatorId!, data) : this.generatorsService.create(data);
    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.isEditMode ? 'تم تحديث المولد' : 'تم إضافة المولد' });
        setTimeout(() => this.router.navigate(['/generators']), 1000);
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ البيانات' }); this.loading = false; }
    });
  }
}
