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
import { MessageService, ConfirmationService } from 'primeng/api';
import { GeneratorsService, Generator } from '../../../core/services/generators.service';

@Component({
  selector: 'app-generators-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, CardModule, TagModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">إدارة المولدات</h2>
          <p class="text-gray-600">عرض وإدارة المولدات الكهربائية</p>
        </div>
        <a routerLink="/generators/new" class="btn-add-purple">
          <i class="pi pi-plus"></i>
          <span>إضافة مولد جديد</span>
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-cog text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ generators.length }}</h3>
            <p class="text-gray-600">إجمالي المولدات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ activeGenerators }}</h3>
            <p class="text-gray-600">مولدات نشطة</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-bolt text-4xl text-yellow-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalCapacity | number:'1.0-0' }}</h3>
            <p class="text-gray-600">السعة الكلية (كيلوواط)</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-clock text-4xl text-purple-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalRunningHours | number:'1.0-0' }}</h3>
            <p class="text-gray-600">ساعات التشغيل</p>
          </div>
        </p-card>
      </div>

      <!-- Generators Table -->
      <p-card>
        <p-table [value]="generators" [paginator]="true" [rows]="10" [loading]="loading"
                 styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم المولد</th>
              <th>الاسم</th>
              <th>المحطة</th>
              <th>السعة (كيلوواط)</th>
              <th>ساعات التشغيل</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-generator>
            <tr>
              <td><span class="font-mono text-blue-600">{{ generator.code }}</span></td>
              <td>{{ generator.name }}</td>
              <td>{{ generator.station?.name || '-' }}</td>
              <td>{{ generator.capacity_kw | number:'1.0-2' }}</td>
              <td>{{ generator.running_hours | number:'1.0-0' }}</td>
              <td>
                <p-tag [value]="getStatusLabel(generator.status)" 
                       [severity]="getStatusSeverity(generator.status)"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <a [routerLink]="['/generators', generator.id, 'edit']" class="p-button p-button-warning p-button-sm p-button-text">
                    <i class="pi pi-pencil"></i>
                  </a>
                  <button pButton class="p-button-danger p-button-sm p-button-text" (click)="deleteGenerator(generator)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7" class="text-center py-8">لا توجد مولدات مسجلة</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class GeneratorsListComponent implements OnInit {
  generators: Generator[] = [];
  loading = false;

  constructor(
    private generatorsService: GeneratorsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadGenerators();
  }

  loadGenerators() {
    this.loading = true;
    this.generatorsService.getAll().subscribe({
      next: (data) => {
        this.generators = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل المولدات' });
        this.loading = false;
      }
    });
  }

  get activeGenerators(): number {
    return this.generators.filter(g => g.status === 'active').length;
  }

  get totalCapacity(): number {
    return this.generators.reduce((sum, g) => sum + (Number(g.capacity_kw) || 0), 0);
  }

  get totalRunningHours(): number {
    return this.generators.reduce((sum, g) => sum + (Number(g.running_hours) || 0), 0);
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'active': 'نشط', 'inactive': 'غير نشط', 'maintenance': 'صيانة', 'faulty': 'معطل'
    };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'active': 'success', 'inactive': 'secondary', 'maintenance': 'warn', 'faulty': 'danger'
    };
    return severities[status] || 'info';
  }

  deleteGenerator(generator: Generator) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المولد "${generator.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.generatorsService.delete(generator.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف المولد بنجاح' });
            this.loadGenerators();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف المولد' });
          }
        });
      }
    });
  }
}
