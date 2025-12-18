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
import { StationsService, Station } from '../../../core/services/stations.service';

@Component({
  selector: 'app-stations-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, CardModule, TagModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in p-6">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>إدارة المحطات</h2>
          <p>عرض وإدارة محطات التوليد والتوزيع</p>
        </div>
        <a routerLink="/stations/new" class="btn-add-primary">
          <i class="pi pi-plus"></i>
          <span>إضافة محطة جديدة</span>
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-building text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ stations.length }}</h3>
            <p class="text-gray-600">إجمالي المحطات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ activeStations }}</h3>
            <p class="text-gray-600">محطات نشطة</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-cog text-4xl text-purple-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalGenerators }}</h3>
            <p class="text-gray-600">إجمالي المولدات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-bolt text-4xl text-yellow-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalCapacity | number:'1.0-0' }}</h3>
            <p class="text-gray-600">السعة الكلية (كيلوواط)</p>
          </div>
        </p-card>
      </div>

      <!-- Stations Table -->
      <p-card>
        <p-table [value]="stations" [paginator]="true" [rows]="10" [loading]="loading"
                 styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>رقم المحطة</th>
              <th>الاسم</th>
              <th>النوع</th>
              <th>المولدات</th>
              <th>السعة (كيلوواط)</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-station>
            <tr>
              <td><span class="font-mono text-blue-600">{{ station.code }}</span></td>
              <td>{{ station.name }}</td>
              <td>{{ getTypeLabel(station.type) }}</td>
              <td>{{ station._count?.generators || 0 }}</td>
              <td>{{ station.total_capacity_kw | number:'1.0-2' }}</td>
              <td>
                <p-tag [value]="getStatusLabel(station.status)" 
                       [severity]="getStatusSeverity(station.status)"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <a [routerLink]="['/stations', station.id, 'edit']" class="p-button p-button-warning p-button-sm p-button-text">
                    <i class="pi pi-pencil"></i>
                  </a>
                  <button pButton class="p-button-danger p-button-sm p-button-text" (click)="deleteStation(station)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="7" class="text-center py-8">لا توجد محطات مسجلة</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class StationsListComponent implements OnInit {
  stations: Station[] = [];
  loading = false;

  constructor(
    private stationsService: StationsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loading = true;
    this.stationsService.getAll().subscribe({
      next: (data) => {
        this.stations = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل المحطات' });
        this.loading = false;
      }
    });
  }

  get activeStations(): number {
    return this.stations.filter(s => s.status === 'active').length;
  }

  get totalGenerators(): number {
    return this.stations.reduce((sum, s) => sum + (s._count?.generators || 0), 0);
  }

  get totalCapacity(): number {
    return this.stations.reduce((sum, s) => sum + (Number(s.total_capacity_kw) || 0), 0);
  }

  getTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'generation_distribution': 'توليد وتوزيع',
      'distribution_only': 'توزيع فقط'
    };
    return types[type] || type;
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'maintenance': 'صيانة'
    };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'active': 'success',
      'inactive': 'secondary',
      'maintenance': 'warn'
    };
    return severities[status] || 'info';
  }

  deleteStation(station: Station) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المحطة "${station.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.stationsService.delete(station.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف المحطة بنجاح' });
            this.loadStations();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف المحطة' });
          }
        });
      }
    });
  }
}
