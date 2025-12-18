import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ReadingsService, MeterReading } from '../../../core/services/readings.service';

@Component({
  selector: 'app-meter-readings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    CardModule,
    TagModule,
    FileUploadModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="grid">
      <!-- Statistics Cards -->
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">إجمالي القراءات</span>
              <div class="text-900 font-bold text-2xl">{{ stats.meters?.total || 0 }}</div>
            </div>
            <div class="bg-blue-100 border-round p-3">
              <i class="pi pi-chart-bar text-blue-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">قراءات اليوم</span>
              <div class="text-900 font-bold text-2xl">{{ stats.meters?.today || 0 }}</div>
            </div>
            <div class="bg-green-100 border-round p-3">
              <i class="pi pi-calendar text-green-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Main Content -->
      <div class="col-12">
        <p-card>
          <div class="flex justify-content-between align-items-center mb-4">
            <h2 class="m-0">قراءات العدادات</h2>
            <button pButton label="إضافة قراءة" icon="pi pi-plus" (click)="showDialog()"></button>
          </div>

          <!-- Filters -->
          <div class="grid mb-4">
            <div class="col-12 md:col-3">
              <p-dropdown
                [options]="typeOptions"
                [(ngModel)]="filters.reading_type"
                placeholder="نوع القراءة"
                [showClear]="true"
                (onChange)="loadData()"
                styleClass="w-full">
              </p-dropdown>
            </div>
            <div class="col-12 md:col-3">
              <p-dropdown
                [options]="sourceOptions"
                [(ngModel)]="filters.source"
                placeholder="مصدر القراءة"
                [showClear]="true"
                (onChange)="loadData()"
                styleClass="w-full">
              </p-dropdown>
            </div>
            <div class="col-12 md:col-3">
              <p-calendar
                [(ngModel)]="filters.fromDate"
                placeholder="من تاريخ"
                dateFormat="yy-mm-dd"
                [showClear]="true"
                (onSelect)="loadData()"
                styleClass="w-full">
              </p-calendar>
            </div>
            <div class="col-12 md:col-3">
              <p-calendar
                [(ngModel)]="filters.toDate"
                placeholder="إلى تاريخ"
                dateFormat="yy-mm-dd"
                [showClear]="true"
                (onSelect)="loadData()"
                styleClass="w-full">
              </p-calendar>
            </div>
          </div>

          <!-- Table -->
          <p-table
            [value]="readings"
            [loading]="loading"
            [paginator]="true"
            [rows]="10"
            [totalRecords]="totalRecords"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            styleClass="p-datatable-sm p-datatable-striped">
            
            <ng-template pTemplate="header">
              <tr>
                <th>العداد</th>
                <th>وقت القراءة</th>
                <th>القراءة الحالية</th>
                <th>القراءة السابقة</th>
                <th>الاستهلاك</th>
                <th>نوع القراءة</th>
                <th>المصدر</th>
                <th>التحقق</th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.meter?.meter_number || '-' }}</td>
                <td>{{ item.reading_time | date:'yyyy-MM-dd HH:mm' }}</td>
                <td class="font-bold">{{ item.reading_value | number:'1.3-3' }}</td>
                <td>{{ item.previous_value | number:'1.3-3' }}</td>
                <td class="text-green-600 font-bold">{{ item.consumption | number:'1.3-3' }}</td>
                <td>
                  <p-tag [value]="getTypeLabel(item.reading_type)" [severity]="getTypeSeverity(item.reading_type)"></p-tag>
                </td>
                <td>
                  <p-tag [value]="getSourceLabel(item.source)" [severity]="getSourceSeverity(item.source)"></p-tag>
                </td>
                <td>
                  <i *ngIf="item.verified_at" class="pi pi-check-circle text-green-500" pTooltip="تم التحقق"></i>
                  <button *ngIf="!item.verified_at" pButton icon="pi pi-check" class="p-button-text p-button-sm p-button-success" (click)="verifyReading(item)" pTooltip="تحقق"></button>
                </td>
                <td>
                  <button pButton icon="pi pi-image" class="p-button-text p-button-sm" *ngIf="item.image_url" (click)="viewImage(item)" pTooltip="عرض الصورة"></button>
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editReading(item)"></button>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="deleteReading(item)"></button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="9" class="text-center p-4">لا توجد قراءات</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog
      [(visible)]="dialogVisible"
      [header]="editMode ? 'تعديل قراءة' : 'إضافة قراءة جديدة'"
      [modal]="true"
      [style]="{ width: '500px' }">
      
      <div class="grid">
        <div class="col-12">
          <label class="block mb-2">العداد *</label>
          <p-dropdown
            [options]="meters"
            [(ngModel)]="formData.meter_id"
            optionLabel="meter_number"
            optionValue="id"
            placeholder="اختر العداد"
            styleClass="w-full">
          </p-dropdown>
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">وقت القراءة</label>
          <p-calendar
            [(ngModel)]="formData.reading_time"
            [showTime]="true"
            dateFormat="yy-mm-dd"
            styleClass="w-full">
          </p-calendar>
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">نوع القراءة</label>
          <p-dropdown
            [options]="typeOptions"
            [(ngModel)]="formData.reading_type"
            placeholder="اختر النوع"
            styleClass="w-full">
          </p-dropdown>
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">قيمة القراءة *</label>
          <p-inputNumber [(ngModel)]="formData.reading_value" [min]="0" [minFractionDigits]="3" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">القراءة السابقة</label>
          <p-inputNumber [(ngModel)]="formData.previous_value" [min]="0" [minFractionDigits]="3" styleClass="w-full" [disabled]="true"></p-inputNumber>
        </div>
        <div class="col-12">
          <label class="block mb-2">صورة القراءة</label>
          <input type="text" pInputText [(ngModel)]="formData.image_url" placeholder="رابط الصورة" class="w-full">
        </div>
        <div class="col-12">
          <label class="block mb-2">ملاحظات</label>
          <textarea pInputText [(ngModel)]="formData.notes" rows="3" class="w-full"></textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveReading()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>

    <!-- Image Dialog -->
    <p-dialog [(visible)]="imageDialogVisible" header="صورة القراءة" [modal]="true" [style]="{ width: '600px' }">
      <img [src]="selectedImageUrl" class="w-full" *ngIf="selectedImageUrl">
    </p-dialog>
  `
})
export class MeterReadingsComponent implements OnInit {
  readings: MeterReading[] = [];
  meters: any[] = [];
  loading = false;
  saving = false;
  totalRecords = 0;
  stats: any = {};

  dialogVisible = false;
  imageDialogVisible = false;
  editMode = false;
  editId = '';
  selectedImageUrl = '';

  filters = {
    reading_type: null as string | null,
    source: null as string | null,
    fromDate: null as Date | null,
    toDate: null as Date | null
  };

  formData: Partial<MeterReading> = {};

  typeOptions = [
    { label: 'عادية', value: 'regular' },
    { label: 'افتتاحية', value: 'initial' },
    { label: 'ختامية', value: 'final' },
    { label: 'تصحيحية', value: 'correction' }
  ];

  sourceOptions = [
    { label: 'يدوي', value: 'manual' },
    { label: 'IoT', value: 'iot' },
    { label: 'استيراد', value: 'import' }
  ];

  constructor(
    private readingsService: ReadingsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadMeters();
  }

  loadData() {
    this.loading = true;
    const params: any = { page: 1, limit: 10 };
    if (this.filters.reading_type) params.reading_type = this.filters.reading_type;
    if (this.filters.source) params.source = this.filters.source;
    if (this.filters.fromDate) params.from_date = this.filters.fromDate.toISOString();
    if (this.filters.toDate) params.to_date = this.filters.toDate.toISOString();

    this.readingsService.getMeterReadings(params).subscribe({
      next: (res) => {
        this.readings = res.data;
        this.totalRecords = res.meta.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل البيانات' });
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.readingsService.getDashboardStats().subscribe({
      next: (res) => this.stats = res,
      error: () => {}
    });
    this.loadData();
  }

  loadMeters() {
    // TODO: Load from meters service
    this.meters = [];
  }

  onLazyLoad(event: any) {
    const page = (event.first / event.rows) + 1;
    const params: any = { page, limit: event.rows };
    if (this.filters.reading_type) params.reading_type = this.filters.reading_type;
    if (this.filters.source) params.source = this.filters.source;

    this.loading = true;
    this.readingsService.getMeterReadings(params).subscribe({
      next: (res) => {
        this.readings = res.data;
        this.totalRecords = res.meta.total;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  showDialog() {
    this.editMode = false;
    this.editId = '';
    this.formData = {
      reading_time: new Date().toISOString(),
      reading_type: 'regular',
      source: 'manual'
    };
    this.dialogVisible = true;
  }

  editReading(item: MeterReading) {
    this.editMode = true;
    this.editId = item.id;
    this.formData = { ...item };
    this.dialogVisible = true;
  }

  saveReading() {
    if (!this.formData.meter_id || !this.formData.reading_value) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    this.saving = true;
    const data = {
      ...this.formData,
      business_id: 'default-business-id' // TODO: Get from auth
    };

    const request = this.editMode
      ? this.readingsService.updateMeterReading(this.editId, data)
      : this.readingsService.createMeterReading(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editMode ? 'تم تحديث القراءة' : 'تم إضافة القراءة' });
        this.dialogVisible = false;
        this.loadData();
        this.loadStats();
        this.saving = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل في حفظ القراءة' });
        this.saving = false;
      }
    });
  }

  deleteReading(item: MeterReading) {
    this.readingsService.deleteMeterReading(item.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف القراءة' });
        this.loadData();
        this.loadStats();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف القراءة' })
    });
  }

  verifyReading(item: MeterReading) {
    // TODO: Get actual user ID
    this.readingsService.verifyMeterReading(item.id, 'user-id').subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم التحقق من القراءة' });
        this.loadData();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في التحقق' })
    });
  }

  viewImage(item: MeterReading) {
    this.selectedImageUrl = item.image_url || '';
    this.imageDialogVisible = true;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      regular: 'عادية',
      initial: 'افتتاحية',
      final: 'ختامية',
      correction: 'تصحيحية'
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger" | "contrast"> = {
      regular: 'info',
      initial: 'success',
      final: 'warn',
      correction: 'danger'
    };
    return severities[type];
  }

  getSourceLabel(source: string): string {
    const labels: Record<string, string> = { manual: 'يدوي', iot: 'IoT', import: 'استيراد' };
    return labels[source] || source;
  }

  getSourceSeverity(source: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger" | "contrast"> = {
      manual: 'info',
      iot: 'success',
      import: 'secondary'
    };
    return severities[source];
  }
}
