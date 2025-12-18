import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TechniciansService, Contractor } from '../../../core/services/technicians.service';

@Component({
  selector: 'app-contractors-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, CardModule, TagModule, ToastModule, 
    ConfirmDialogModule, DialogModule, InputTextModule, TextareaModule,
    DropdownModule, RatingModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in" style="padding: 2rem 2.5rem;">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>إدارة المقاولين</h2>
          <p>عرض وإدارة المقاولين الخارجيين</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/technicians" class="p-button p-button-outlined">
            <i class="pi pi-arrow-right"></i>
            <span class="mr-2">العودة للفنيين</span>
          </a>
          <button pButton class="btn-add-primary" (click)="openDialog()">
            <i class="pi pi-plus"></i>
            <span>إضافة مقاول جديد</span>
          </button>
        </div>
      </div>

      <!-- Contractors Table -->
      <p-card>
        <p-table [value]="contractors" [paginator]="true" [rows]="10" [loading]="loading"
                 styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>كود المقاول</th>
              <th>الاسم</th>
              <th>جهة الاتصال</th>
              <th>الهاتف</th>
              <th>التقييم</th>
              <th>الفنيين</th>
              <th>العقود</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-contractor>
            <tr>
              <td><span class="font-mono text-blue-600">{{ contractor.contractor_code }}</span></td>
              <td>{{ contractor.name }}</td>
              <td>{{ contractor.contact_person || '-' }}</td>
              <td>{{ contractor.phone || '-' }}</td>
              <td>
                <p-rating [(ngModel)]="contractor.rating" [readonly]="true" [stars]="5"></p-rating>
              </td>
              <td>{{ contractor._count?.technicians || 0 }}</td>
              <td>{{ contractor._count?.contracts || 0 }}</td>
              <td>
                <p-tag [value]="getStatusLabel(contractor.status)" 
                       [severity]="getStatusSeverity(contractor.status)"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <button pButton class="p-button-warning p-button-sm p-button-text" 
                          (click)="openDialog(contractor)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button pButton class="p-button-danger p-button-sm p-button-text" 
                          (click)="deleteContractor(contractor)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="9" class="text-center py-8">لا يوجد مقاولين مسجلين</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="dialogVisible" [header]="editingContractor ? 'تعديل المقاول' : 'إضافة مقاول جديد'" 
              [modal]="true" [style]="{width: '500px'}">
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-2 font-semibold">كود المقاول *</label>
          <input type="text" pInputText [(ngModel)]="contractorForm.contractorCode" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">اسم المقاول *</label>
          <input type="text" pInputText [(ngModel)]="contractorForm.name" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">جهة الاتصال</label>
          <input type="text" pInputText [(ngModel)]="contractorForm.contactPerson" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">رقم الهاتف</label>
          <input type="text" pInputText [(ngModel)]="contractorForm.phone" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">البريد الإلكتروني</label>
          <input type="email" pInputText [(ngModel)]="contractorForm.email" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">العنوان</label>
          <textarea pTextarea [(ngModel)]="contractorForm.address" rows="2" class="w-full"></textarea>
        </div>
        <div *ngIf="editingContractor">
          <label class="block mb-2 font-semibold">الحالة</label>
          <p-dropdown [options]="statusOptions" [(ngModel)]="contractorForm.status" class="w-full"></p-dropdown>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton class="p-button-outlined" (click)="dialogVisible = false">إلغاء</button>
        <button pButton [loading]="saving" (click)="saveContractor()">
          {{ editingContractor ? 'حفظ التعديلات' : 'إضافة' }}
        </button>
      </ng-template>
    </p-dialog>
  `
})
export class ContractorsListComponent implements OnInit {
  contractors: Contractor[] = [];
  loading = false;
  saving = false;
  dialogVisible = false;
  editingContractor: Contractor | null = null;

  contractorForm = {
    contractorCode: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  };

  statusOptions = [
    { label: 'نشط', value: 'active' },
    { label: 'غير نشط', value: 'inactive' },
    { label: 'محظور', value: 'blacklisted' }
  ];

  constructor(
    private techniciansService: TechniciansService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadContractors();
  }

  loadContractors() {
    this.loading = true;
    this.techniciansService.getContractors().subscribe({
      next: (data) => {
        this.contractors = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل المقاولين' });
        this.loading = false;
      }
    });
  }

  openDialog(contractor?: Contractor) {
    if (contractor) {
      this.editingContractor = contractor;
      this.contractorForm = {
        contractorCode: contractor.contractor_code,
        name: contractor.name,
        contactPerson: contractor.contact_person || '',
        phone: contractor.phone || '',
        email: contractor.email || '',
        address: contractor.address || '',
        status: contractor.status
      };
    } else {
      this.editingContractor = null;
      this.contractorForm = {
        contractorCode: '',
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        status: 'active'
      };
    }
    this.dialogVisible = true;
  }

  saveContractor() {
    if (!this.contractorForm.contractorCode || !this.contractorForm.name) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    this.saving = true;
    const request = this.editingContractor
      ? this.techniciansService.updateContractor(this.editingContractor.id, this.contractorForm)
      : this.techniciansService.createContractor(this.contractorForm);

    request.subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editingContractor ? 'تم تحديث المقاول' : 'تم إضافة المقاول' 
        });
        this.dialogVisible = false;
        this.saving = false;
        this.loadContractors();
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

  deleteContractor(contractor: Contractor) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المقاول "${contractor.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.techniciansService.deleteContractor(contractor.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف المقاول بنجاح' });
            this.loadContractors();
          },
          error: (err) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: err.error?.message || 'فشل في حذف المقاول' 
            });
          }
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'blacklisted': 'محظور'
    };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'danger' | 'info' | 'warn' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'danger' | 'info' | 'warn' | 'contrast'> = {
      'active': 'success',
      'inactive': 'secondary',
      'blacklisted': 'danger'
    };
    return severities[status] || 'info';
  }
}
