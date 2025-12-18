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
import { MetersService, Meter } from '../../../core/services/meters.service';

@Component({
  selector: 'app-meters-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, TagModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="page-container animate-fade-in" style="padding: 2rem 2.5rem;">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>إدارة العدادات</h2>
          <p>عرض وإدارة عدادات الكهرباء</p>
        </div>
        <a routerLink="/meters/new" class="btn-add-cyan">
          <i class="pi pi-plus"></i>
          <span>إضافة عداد جديد</span>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-gauge text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ meters.length }}</h3>
            <p class="text-gray-600">إجمالي العدادات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ activeMeters }}</h3>
            <p class="text-gray-600">عدادات نشطة</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-chart-line text-4xl text-purple-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalReadings }}</h3>
            <p class="text-gray-600">إجمالي القراءات</p>
          </div>
        </p-card>
      </div>

      <p-card>
        <p-table [value]="meters" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم العداد</th><th>الرقم التسلسلي</th><th>النوع</th><th>الشركة المصنعة</th><th>القراءات</th><th>الحالة</th><th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-meter>
            <tr>
              <td><span class="font-mono text-blue-600">{{ meter.code }}</span></td>
              <td>{{ meter.serial_number || '-' }}</td>
              <td>{{ getMeterTypeLabel(meter.type) }}</td>
              <td>{{ meter.manufacturer || '-' }}</td>
              <td>{{ meter._count?.readings || 0 }}</td>
              <td><p-tag [value]="getStatusLabel(meter.status)" [severity]="getStatusSeverity(meter.status)"></p-tag></td>
              <td>
                <div class="flex gap-2">
                  <a [routerLink]="['/meters', meter.id, 'edit']" class="p-button p-button-warning p-button-sm p-button-text"><i class="pi pi-pencil"></i></a>
                  <button pButton class="p-button-danger p-button-sm p-button-text" (click)="deleteMeter(meter)"><i class="pi pi-trash"></i></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="7" class="text-center py-8">لا توجد عدادات مسجلة</td></tr></ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class MetersListComponent implements OnInit {
  meters: Meter[] = [];
  loading = false;

  constructor(private metersService: MetersService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() { this.loadMeters(); }

  loadMeters() {
    this.loading = true;
    this.metersService.getAll().subscribe({
      next: (data) => { this.meters = data; this.loading = false; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل العدادات' }); this.loading = false; }
    });
  }

  get activeMeters(): number { return this.meters.filter(m => m.status === 'active').length; }
  get totalReadings(): number { return this.meters.reduce((sum, m) => sum + (m._count?.readings || 0), 0); }

  getMeterTypeLabel(type: string): string {
    const types: Record<string, string> = { 'single_phase': 'أحادي الطور', 'three_phase': 'ثلاثي الطور', 'smart': 'ذكي', 'prepaid': 'مسبق الدفع' };
    return types[type] || type;
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = { 'active': 'نشط', 'inactive': 'غير نشط', 'faulty': 'معطل' };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'danger' | 'info' {
    const severities: Record<string, 'success' | 'secondary' | 'danger' | 'info'> = { 'active': 'success', 'inactive': 'secondary', 'faulty': 'danger' };
    return severities[status] || 'info';
  }

  deleteMeter(meter: Meter) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف العداد "${meter.code}"؟`,
      header: 'تأكيد الحذف', icon: 'pi pi-exclamation-triangle', acceptLabel: 'نعم، احذف', rejectLabel: 'إلغاء',
      accept: () => {
        this.metersService.delete(meter.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف العداد بنجاح' }); this.loadMeters(); },
          error: () => { this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف العداد' }); }
        });
      }
    });
  }
}
