import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipsModule } from 'primeng/chips';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TechniciansService, Contractor } from '../../../core/services/technicians.service';

@Component({
  selector: 'app-technician-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    CardModule, ButtonModule, InputTextModule, InputNumberModule,
    DropdownModule, InputSwitchModule, ChipsModule, TextareaModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="page-container animate-fade-in" style="padding: 2rem 2.5rem;">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>{{ isEdit ? 'تعديل بيانات الفني' : 'إضافة فني جديد' }}</h2>
          <p>{{ isEdit ? 'تعديل بيانات الفني المسجل' : 'إضافة فني جديد للنظام' }}</p>
        </div>
        <a routerLink="/technicians" class="p-button p-button-outlined">
          <i class="pi pi-arrow-right"></i>
          <span class="mr-2">العودة للقائمة</span>
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Basic Info -->
          <p-card header="المعلومات الأساسية">
            <div class="flex flex-col gap-4">
              <div>
                <label class="block mb-2 font-semibold">كود الفني *</label>
                <input type="text" pInputText formControlName="technicianCode" class="w-full">
              </div>
              <div>
                <label class="block mb-2 font-semibold">الاسم بالعربية *</label>
                <input type="text" pInputText formControlName="name" class="w-full">
              </div>
              <div>
                <label class="block mb-2 font-semibold">الاسم بالإنجليزية</label>
                <input type="text" pInputText formControlName="nameEn" class="w-full">
              </div>
              <div>
                <label class="block mb-2 font-semibold">رقم الهاتف</label>
                <input type="text" pInputText formControlName="phone" class="w-full">
              </div>
              <div>
                <label class="block mb-2 font-semibold">البريد الإلكتروني</label>
                <input type="email" pInputText formControlName="email" class="w-full">
              </div>
            </div>
          </p-card>

          <!-- Work Info -->
          <p-card header="معلومات العمل">
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <label class="font-semibold">فني داخلي</label>
                <p-inputSwitch formControlName="isInternal" (onChange)="onTypeChange()"></p-inputSwitch>
              </div>
              
              <div *ngIf="!form.get('isInternal')?.value">
                <label class="block mb-2 font-semibold">المقاول *</label>
                <p-dropdown [options]="contractors" formControlName="contractorId" 
                            optionLabel="name" optionValue="id"
                            placeholder="اختر المقاول" class="w-full"></p-dropdown>
              </div>

              <div>
                <label class="block mb-2 font-semibold">مستوى المهارة *</label>
                <p-dropdown [options]="skillLevelOptions" formControlName="skillsLevel" 
                            placeholder="اختر المستوى" class="w-full"></p-dropdown>
              </div>

              <div>
                <label class="block mb-2 font-semibold">سعر الساعة</label>
                <p-inputNumber formControlName="hourlyRate" mode="currency" currency="SAR" 
                               locale="ar-SA" class="w-full"></p-inputNumber>
              </div>

              <div class="flex items-center gap-4">
                <label class="font-semibold">متاح للعمل</label>
                <p-inputSwitch formControlName="isAvailable"></p-inputSwitch>
              </div>
            </div>
          </p-card>

          <!-- Skills & Certifications -->
          <p-card header="التخصصات والشهادات">
            <div class="flex flex-col gap-4">
              <div>
                <label class="block mb-2 font-semibold">التخصصات</label>
                <p-chips formControlName="specializations" placeholder="أضف تخصص واضغط Enter"></p-chips>
              </div>
              <div>
                <label class="block mb-2 font-semibold">الشهادات</label>
                <p-chips formControlName="certifications" placeholder="أضف شهادة واضغط Enter"></p-chips>
              </div>
            </div>
          </p-card>

          <!-- Notes -->
          <p-card header="ملاحظات">
            <div>
              <label class="block mb-2 font-semibold">ملاحظات إضافية</label>
              <textarea pTextarea formControlName="notes" rows="5" class="w-full"></textarea>
            </div>
          </p-card>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" pButton class="p-button-outlined" routerLink="/technicians">إلغاء</button>
          <button type="submit" pButton [loading]="saving" [disabled]="form.invalid">
            {{ isEdit ? 'حفظ التعديلات' : 'إضافة الفني' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class TechnicianFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  saving = false;
  technicianId: string | null = null;
  contractors: Contractor[] = [];

  skillLevelOptions = [
    { label: 'مبتدئ', value: 'junior' },
    { label: 'متوسط', value: 'mid' },
    { label: 'متقدم', value: 'senior' },
    { label: 'خبير', value: 'expert' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private techniciansService: TechniciansService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadContractors();
    
    this.technicianId = this.route.snapshot.paramMap.get('id');
    if (this.technicianId && this.technicianId !== 'new') {
      this.isEdit = true;
      this.loadTechnician();
    }
  }

  initForm() {
    this.form = this.fb.group({
      technicianCode: ['', Validators.required],
      name: ['', Validators.required],
      nameEn: [''],
      phone: [''],
      email: ['', Validators.email],
      isInternal: [true],
      contractorId: [null],
      skillsLevel: ['mid', Validators.required],
      hourlyRate: [0],
      isAvailable: [true],
      specializations: [[]],
      certifications: [[]],
      notes: ['']
    });
  }

  loadContractors() {
    this.techniciansService.getContractors({ status: 'active' }).subscribe({
      next: (data) => this.contractors = data,
      error: () => console.error('Failed to load contractors')
    });
  }

  loadTechnician() {
    if (!this.technicianId) return;
    
    this.techniciansService.getTechnician(this.technicianId).subscribe({
      next: (tech) => {
        this.form.patchValue({
          technicianCode: tech.technician_code,
          name: tech.name,
          nameEn: tech.name_en,
          phone: tech.phone,
          email: tech.email,
          isInternal: tech.is_internal,
          contractorId: tech.contractor_id,
          skillsLevel: tech.skills_level,
          hourlyRate: tech.hourly_rate,
          isAvailable: tech.is_available,
          specializations: tech.specializations || [],
          certifications: tech.certifications?.map((c: any) => c.name || c) || [],
          notes: tech.notes
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل بيانات الفني' });
        this.router.navigate(['/technicians']);
      }
    });
  }

  onTypeChange() {
    if (this.form.get('isInternal')?.value) {
      this.form.patchValue({ contractorId: null });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.saving = true;
    const formValue = this.form.value;
    
    const data = {
      technicianCode: formValue.technicianCode,
      name: formValue.name,
      nameEn: formValue.nameEn,
      phone: formValue.phone,
      email: formValue.email,
      isInternal: formValue.isInternal,
      contractorId: formValue.isInternal ? null : formValue.contractorId,
      skillsLevel: formValue.skillsLevel,
      hourlyRate: formValue.hourlyRate,
      isAvailable: formValue.isAvailable,
      specializations: formValue.specializations,
      certifications: formValue.certifications?.map((c: string) => ({ name: c })),
      notes: formValue.notes
    };

    const request = this.isEdit
      ? this.techniciansService.updateTechnician(this.technicianId!, data)
      : this.techniciansService.createTechnician(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.isEdit ? 'تم تحديث بيانات الفني' : 'تم إضافة الفني بنجاح' 
        });
        setTimeout(() => this.router.navigate(['/technicians']), 1000);
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: err.error?.message || 'فشل في حفظ البيانات' 
        });
      }
    });
  }
}
