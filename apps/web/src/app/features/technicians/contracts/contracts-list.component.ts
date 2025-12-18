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
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TechniciansService, MaintenanceContract, Contractor } from '../../../core/services/technicians.service';

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, CardModule, TagModule, ToastModule, 
    ConfirmDialogModule, DialogModule, InputTextModule, TextareaModule,
    InputNumberModule, DropdownModule, CalendarModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in" style="padding: 2rem 2.5rem;">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>عقود الصيانة</h2>
          <p>إدارة عقود الصيانة مع المقاولين</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/technicians" class="p-button p-button-outlined">
            <i class="pi pi-arrow-right"></i>
            <span class="mr-2">العودة للفنيين</span>
          </a>
          <button pButton class="btn-add-primary" (click)="openDialog()">
            <i class="pi pi-plus"></i>
            <span>إضافة عقد جديد</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-file text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ contracts.length }}</h3>
            <p class="text-gray-600">إجمالي العقود</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ activeContracts }}</h3>
            <p class="text-gray-600">عقود نشطة</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-clock text-4xl text-yellow-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ expiringContracts }}</h3>
            <p class="text-gray-600">تنتهي قريباً</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-dollar text-4xl text-purple-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalValue | number:'1.0-0' }}</h3>
            <p class="text-gray-600">إجمالي القيمة</p>
          </div>
        </p-card>
      </div>

      <!-- Contracts Table -->
      <p-card>
        <p-table [value]="contracts" [paginator]="true" [rows]="10" [loading]="loading"
                 styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم العقد</th>
              <th>العنوان</th>
              <th>المقاول</th>
              <th>النوع</th>
              <th>تاريخ البدء</th>
              <th>تاريخ الانتهاء</th>
              <th>القيمة</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-contract>
            <tr>
              <td><span class="font-mono text-blue-600">{{ contract.contract_number }}</span></td>
              <td>{{ contract.title }}</td>
              <td>{{ contract.contractor?.name || '-' }}</td>
              <td>{{ getTypeLabel(contract.contract_type) }}</td>
              <td>{{ contract.start_date | date:'yyyy/MM/dd' }}</td>
              <td>{{ contract.end_date | date:'yyyy/MM/dd' }}</td>
              <td>{{ contract.value | number:'1.0-2' }} ر.س</td>
              <td>
                <p-tag [value]="getStatusLabel(contract.status)" 
                       [severity]="getStatusSeverity(contract.status)"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <button pButton class="p-button-warning p-button-sm p-button-text" 
                          (click)="openDialog(contract)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button pButton class="p-button-danger p-button-sm p-button-text" 
                          (click)="deleteContract(contract)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="9" class="text-center py-8">لا توجد عقود مسجلة</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="dialogVisible" [header]="editingContract ? 'تعديل العقد' : 'إضافة عقد جديد'" 
              [modal]="true" [style]="{width: '600px'}">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-2 font-semibold">رقم العقد *</label>
          <input type="text" pInputText [(ngModel)]="contractForm.contractNumber" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">المقاول *</label>
          <p-dropdown [options]="contractors" [(ngModel)]="contractForm.contractorId" 
                      optionLabel="name" optionValue="id"
                      placeholder="اختر المقاول" class="w-full"></p-dropdown>
        </div>
        <div class="col-span-2">
          <label class="block mb-2 font-semibold">عنوان العقد *</label>
          <input type="text" pInputText [(ngModel)]="contractForm.title" class="w-full">
        </div>
        <div>
          <label class="block mb-2 font-semibold">نوع العقد</label>
          <p-dropdown [options]="typeOptions" [(ngModel)]="contractForm.contractType" class="w-full"></p-dropdown>
        </div>
        <div>
          <label class="block mb-2 font-semibold">قيمة العقد *</label>
          <p-inputNumber [(ngModel)]="contractForm.value" mode="currency" currency="SAR" 
                         locale="ar-SA" class="w-full"></p-inputNumber>
        </div>
        <div>
          <label class="block mb-2 font-semibold">تاريخ البدء *</label>
          <p-calendar [(ngModel)]="contractForm.startDate" dateFormat="yy/mm/dd" class="w-full"></p-calendar>
        </div>
        <div>
          <label class="block mb-2 font-semibold">تاريخ الانتهاء *</label>
          <p-calendar [(ngModel)]="contractForm.endDate" dateFormat="yy/mm/dd" class="w-full"></p-calendar>
        </div>
        <div class="col-span-2">
          <label class="block mb-2 font-semibold">الوصف</label>
          <textarea pTextarea [(ngModel)]="contractForm.description" rows="2" class="w-full"></textarea>
        </div>
        <div class="col-span-2">
          <label class="block mb-2 font-semibold">نطاق العمل</label>
          <textarea pTextarea [(ngModel)]="contractForm.scope" rows="2" class="w-full"></textarea>
        </div>
        <div class="col-span-2" *ngIf="editingContract">
          <label class="block mb-2 font-semibold">الحالة</label>
          <p-dropdown [options]="statusOptions" [(ngModel)]="contractForm.status" class="w-full"></p-dropdown>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton class="p-button-outlined" (click)="dialogVisible = false">إلغاء</button>
        <button pButton [loading]="saving" (click)="saveContract()">
          {{ editingContract ? 'حفظ التعديلات' : 'إضافة' }}
        </button>
      </ng-template>
    </p-dialog>
  `
})
export class ContractsListComponent implements OnInit {
  contracts: MaintenanceContract[] = [];
  contractors: Contractor[] = [];
  loading = false;
  saving = false;
  dialogVisible = false;
  editingContract: MaintenanceContract | null = null;

  contractForm = {
    contractNumber: '',
    contractorId: '',
    title: '',
    description: '',
    contractType: 'annual',
    startDate: new Date(),
    endDate: new Date(),
    value: 0,
    scope: '',
    status: 'draft'
  };

  typeOptions = [
    { label: 'سنوي', value: 'annual' },
    { label: 'مشروع', value: 'project' },
    { label: 'عند الطلب', value: 'on_call' }
  ];

  statusOptions = [
    { label: 'مسودة', value: 'draft' },
    { label: 'نشط', value: 'active' },
    { label: 'منتهي', value: 'expired' },
    { label: 'ملغي', value: 'terminated' }
  ];

  constructor(
    private techniciansService: TechniciansService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadContracts();
    this.loadContractors();
  }

  loadContracts() {
    this.loading = true;
    this.techniciansService.getContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل العقود' });
        this.loading = false;
      }
    });
  }

  loadContractors() {
    this.techniciansService.getContractors({ status: 'active' }).subscribe({
      next: (data) => this.contractors = data,
      error: () => console.error('Failed to load contractors')
    });
  }

  get activeContracts(): number {
    return this.contracts.filter(c => c.status === 'active').length;
  }

  get expiringContracts(): number {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.contracts.filter(c => 
      c.status === 'active' && new Date(c.end_date) <= thirtyDaysFromNow
    ).length;
  }

  get totalValue(): number {
    return this.contracts.filter(c => c.status === 'active')
      .reduce((sum, c) => sum + Number(c.value), 0);
  }

  openDialog(contract?: MaintenanceContract) {
    if (contract) {
      this.editingContract = contract;
      this.contractForm = {
        contractNumber: contract.contract_number,
        contractorId: contract.contractor_id,
        title: contract.title,
        description: contract.description || '',
        contractType: contract.contract_type,
        startDate: new Date(contract.start_date),
        endDate: new Date(contract.end_date),
        value: Number(contract.value),
        scope: contract.scope || '',
        status: contract.status
      };
    } else {
      this.editingContract = null;
      this.contractForm = {
        contractNumber: '',
        contractorId: '',
        title: '',
        description: '',
        contractType: 'annual',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        value: 0,
        scope: '',
        status: 'draft'
      };
    }
    this.dialogVisible = true;
  }

  saveContract() {
    if (!this.contractForm.contractNumber || !this.contractForm.title || !this.contractForm.contractorId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    this.saving = true;
    const data = {
      ...this.contractForm,
      startDate: this.contractForm.startDate.toISOString().split('T')[0],
      endDate: this.contractForm.endDate.toISOString().split('T')[0]
    };

    const request = this.editingContract
      ? this.techniciansService.updateContract(this.editingContract.id, data)
      : this.techniciansService.createContract(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editingContract ? 'تم تحديث العقد' : 'تم إضافة العقد' 
        });
        this.dialogVisible = false;
        this.saving = false;
        this.loadContracts();
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

  deleteContract(contract: MaintenanceContract) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف العقد "${contract.title}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.techniciansService.deleteContract(contract.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف العقد بنجاح' });
            this.loadContracts();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف العقد' });
          }
        });
      }
    });
  }

  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'annual': 'سنوي',
      'project': 'مشروع',
      'on_call': 'عند الطلب'
    };
    return types[type] || type;
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'draft': 'مسودة',
      'active': 'نشط',
      'expired': 'منتهي',
      'terminated': 'ملغي'
    };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'danger' | 'info' | 'warn' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'danger' | 'info' | 'warn' | 'contrast'> = {
      'draft': 'secondary',
      'active': 'success',
      'expired': 'warn',
      'terminated': 'danger'
    };
    return severities[status] || 'info';
  }
}
