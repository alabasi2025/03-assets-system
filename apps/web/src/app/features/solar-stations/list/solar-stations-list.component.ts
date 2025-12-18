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
import { SolarStationsService, SolarStation } from '../../../core/services/solar-stations.service';

@Component({
  selector: 'app-solar-stations-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, CardModule, TagModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>إدارة محطات الطاقة الشمسية</h2>
          <p>عرض وإدارة محطات الطاقة الشمسية والألواح والعاكسات</p>
        </div>
        <a routerLink="/solar-stations/new" class="btn-add-success">
          <i class="pi pi-sun"></i>
          <span>إضافة محطة شمسية</span>
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-sun text-4xl text-yellow-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ stations.length }}</h3>
            <p class="text-gray-600">إجمالي المحطات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-th-large text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalPanels }}</h3>
            <p class="text-gray-600">إجمالي الألواح</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-sync text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ totalInverters }}</h3>
            <p class="text-gray-600">إجمالي العاكسات</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-bolt text-4xl text-orange-500 mb-2"></i>
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
              <th>الألواح</th>
              <th>العاكسات</th>
              <th>السعة (كيلوواط)</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-station>
            <tr>
              <td><span class="font-mono text-yellow-600">{{ station.code }}</span></td>
              <td>{{ station.name }}</td>
              <td>{{ station._count?.panels || station.panels_count || 0 }}</td>
              <td>{{ station._count?.inverters || station.inverters_count || 0 }}</td>
              <td>{{ station.total_capacity_kw | number:'1.0-2' }}</td>
              <td>
                <p-tag [value]="getStatusLabel(station.status)" 
                       [severity]="getStatusSeverity(station.status)"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <a [routerLink]="['/solar-stations', station.id, 'edit']" class="p-button p-button-warning p-button-sm p-button-text">
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
            <tr><td colspan="7" class="text-center py-8">لا توجد محطات شمسية مسجلة</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class SolarStationsListComponent implements OnInit {
  stations: SolarStation[] = [];
  loading = false;

  constructor(
    private solarStationsService: SolarStationsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loading = true;
    this.solarStationsService.getAll().subscribe({
      next: (data) => {
        this.stations = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل المحطات الشمسية' });
        this.loading = false;
      }
    });
  }

  get totalPanels(): number {
    return this.stations.reduce((sum, s) => sum + (s._count?.panels || s.panels_count || 0), 0);
  }

  get totalInverters(): number {
    return this.stations.reduce((sum, s) => sum + (s._count?.inverters || s.inverters_count || 0), 0);
  }

  get totalCapacity(): number {
    return this.stations.reduce((sum, s) => sum + (Number(s.total_capacity_kw) || 0), 0);
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'active': 'نشط', 'inactive': 'غير نشط', 'maintenance': 'صيانة'
    };
    return statuses[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'active': 'success', 'inactive': 'secondary', 'maintenance': 'warn'
    };
    return severities[status] || 'info';
  }

  deleteStation(station: SolarStation) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المحطة الشمسية "${station.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.solarStationsService.delete(station.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف المحطة الشمسية بنجاح' });
            this.loadStations();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف المحطة الشمسية' });
          }
        });
      }
    });
  }
}
