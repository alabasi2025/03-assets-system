import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CablesService, Cable } from '../../../core/services/cables.service';

@Component({
  selector: 'app-cables-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, TagModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <a routerLink="/cables/new" class="btn-add-warning">
          <i class="pi pi-plus"></i>
          <span>إضافة كابل جديد</span>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">إدارة الكابلات</h2>
          <p class="text-gray-600">عرض وإدارة كابلات الشبكة الكهربائية</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-share-alt text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ cables.length }}</h3>
            <p class="text-gray-600">إجمالي الكابلات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-arrows-h text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalLength | number:'1.0-0' }}</h3>
            <p class="text-gray-600">الطول الكلي (متر)</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-purple-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ activeCables }}</h3>
            <p class="text-gray-600">كابلات نشطة</p>
          </div>
        </p-card>
      </div>

      <p-card>
        <p-table [value]="cables" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم الكابل</th><th>الاسم</th><th>النوع</th><th>الطول (م)</th><th>السعة (أمبير)</th><th>الحالة</th><th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-cable>
            <tr>
              <td><span class="font-mono text-blue-600">{{ cable.code }}</span></td>
              <td>{{ cable.name }}</td>
              <td>{{ cable.type }}</td>
              <td>{{ cable.length_meters | number:'1.0-0' }}</td>
              <td>{{ cable.capacity_amp | number:'1.0-0' }}</td>
              <td><p-tag [value]="getStatusLabel(cable.status)" [severity]="getStatusSeverity(cable.status)"></p-tag></td>
              <td>
                <div class="flex gap-2">
                  <a [routerLink]="['/cables', cable.id, 'edit']" class="p-button p-button-warning p-button-sm p-button-text"><i class="pi pi-pencil"></i></a>
                  <button pButton class="p-button-danger p-button-sm p-button-text" (click)="deleteCable(cable)"><i class="pi pi-trash"></i></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="7" class="text-center py-8">لا توجد كابلات مسجلة</td></tr></ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class CablesListComponent implements OnInit {
  cables: Cable[] = [];
  loading = false;

  constructor(private cablesService: CablesService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() { this.loadCables(); }

  loadCables() {
    this.loading = true;
    this.cablesService.getAll().subscribe({
      next: (data) => { this.cables = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل الكابلات' }); this.loading = false; }
    });
  }

  get totalLength(): number { return this.cables.reduce((sum, c) => sum + (Number(c.length_meters) || 0), 0); }
  get activeCables(): number { return this.cables.filter(c => c.status === 'active').length; }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = { 'active': 'نشط', 'inactive': 'غير نشط', 'faulty': 'معطل' };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'danger' | 'info' {
    const severities: Record<string, 'success' | 'secondary' | 'danger' | 'info'> = { 'active': 'success', 'inactive': 'secondary', 'faulty': 'danger' };
    return severities[status] || 'info';
  }

  deleteCable(cable: Cable) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الكابل "${cable.name}"؟`,
      header: 'تأكيد الحذف', icon: 'pi pi-exclamation-triangle', acceptLabel: 'نعم، احذف', rejectLabel: 'إلغاء',
      accept: () => {
        this.cablesService.delete(cable.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الكابل بنجاح' }); this.loadCables(); },
          error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف الكابل' }); }
        });
      }
    });
  }
}
