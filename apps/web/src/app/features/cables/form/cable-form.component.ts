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
import { CablesService } from '../../../core/services/cables.service';

@Component({
  selector: 'app-cable-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="mb-4"><h2 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'تعديل الكابل' : 'إضافة كابل جديد' }}</h2></div>
      <p-card>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field"><label>رقم الكابل *</label><input pInputText formControlName="code" class="w-full" /></div>
            <div class="field"><label>الاسم *</label><input pInputText formControlName="name" class="w-full" /></div>
            <div class="field"><label>النوع</label><p-select [options]="types" formControlName="type" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
            <div class="field"><label>المادة</label><p-select [options]="materials" formControlName="material" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
            <div class="field"><label>المقطع العرضي (مم²)</label><p-inputNumber formControlName="cross_section" class="w-full"></p-inputNumber></div>
            <div class="field"><label>الطول (متر)</label><p-inputNumber formControlName="length_meters" class="w-full"></p-inputNumber></div>
            <div class="field"><label>السعة (أمبير)</label><p-inputNumber formControlName="capacity_amp" class="w-full"></p-inputNumber></div>
            <div class="field"><label>الحالة</label><p-select [options]="statuses" formControlName="status" optionLabel="label" optionValue="value" class="w-full" appendTo="body"></p-select></div>
          </div>
          <div class="flex gap-2 mt-4">
            <button pButton type="submit" [label]="isEditMode ? 'تحديث' : 'حفظ'" icon="pi pi-check" [disabled]="form.invalid || loading"></button>
            <a routerLink="/cables" pButton label="إلغاء" icon="pi pi-times" class="p-button-secondary"></a>
          </div>
        </form>
      </p-card>
    </div>
  `
})
export class CableFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  cableId: string | null = null;
  types = [{ label: 'أرضي', value: 'underground' }, { label: 'هوائي', value: 'overhead' }, { label: 'بحري', value: 'submarine' }];
  materials = [{ label: 'نحاس', value: 'copper' }, { label: 'ألمنيوم', value: 'aluminum' }];
  statuses = [{ label: 'نشط', value: 'active' }, { label: 'غير نشط', value: 'inactive' }, { label: 'معطل', value: 'faulty' }];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private cablesService: CablesService, private messageService: MessageService) {}

  ngOnInit() {
    this.form = this.fb.group({
      code: ['', Validators.required], name: ['', Validators.required], type: ['underground'],
      material: ['copper'], cross_section: [null], length_meters: [null], capacity_amp: [null], status: ['active']
    });
    this.cableId = this.route.snapshot.paramMap.get('id');
    if (this.cableId) { this.isEditMode = true; this.loadCable(); }
  }

  loadCable() {
    this.cablesService.getById(this.cableId!).subscribe({
      next: (data: any) => this.form.patchValue(data),
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل بيانات الكابل' })
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const formValue = this.form.value;
    const data: any = { code: formValue.code, name: formValue.name, status: formValue.status };
    if (formValue.type) data.type = formValue.type;
    if (formValue.material) data.material = formValue.material;
    if (formValue.cross_section) data.cross_section = formValue.cross_section;
    if (formValue.length_meters) data.length_meters = formValue.length_meters;
    if (formValue.capacity_amp) data.capacity_amp = formValue.capacity_amp;
    const request = this.isEditMode ? this.cablesService.update(this.cableId!, data) : this.cablesService.create(data);
    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.isEditMode ? 'تم تحديث الكابل' : 'تم إضافة الكابل' });
        setTimeout(() => this.router.navigate(['/cables']), 1000);
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ البيانات' }); this.loading = false; }
    });
  }
}
