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
import { MessageService } from 'primeng/api';
import { ReadingsService, GeneratorReading } from '../../../core/services/readings.service';

@Component({
  selector: 'app-generator-readings',
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
    TagModule
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
              <div class="text-900 font-bold text-2xl">{{ stats.generators?.total || 0 }}</div>
            </div>
            <div class="bg-blue-100 border-round p-3">
              <i class="pi pi-chart-line text-blue-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">قراءات اليوم</span>
              <div class="text-900 font-bold text-2xl">{{ stats.generators?.today || 0 }}</div>
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
            <h2 class="m-0">قراءات المولدات</h2>
            <button pButton label="إضافة قراءة" icon="pi pi-plus" (click)="showDialog()"></button>
          </div>

          <!-- Filters -->
          <div class="grid mb-4">
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
                <th>المولد</th>
                <th>وقت القراءة</th>
                <th>ساعات التشغيل</th>
                <th>استهلاك الوقود (لتر)</th>
                <th>الجهد (V)</th>
                <th>التيار (A)</th>
                <th>الطاقة (kW)</th>
                <th>درجة الحرارة</th>
                <th>المصدر</th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.generator?.name || '-' }}</td>
                <td>{{ item.reading_time | date:'yyyy-MM-dd HH:mm' }}</td>
                <td>{{ item.running_hours || '-' }}</td>
                <td>{{ item.fuel_consumption || '-' }}</td>
                <td>{{ item.voltage || '-' }}</td>
                <td>{{ item.current || '-' }}</td>
                <td>{{ item.power_output || '-' }}</td>
                <td>{{ item.temperature ? item.temperature + '°C' : '-' }}</td>
                <td>
                  <p-tag [value]="getSourceLabel(item.source)" [severity]="getSourceSeverity(item.source)"></p-tag>
                </td>
                <td>
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editReading(item)"></button>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="deleteReading(item)"></button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="10" class="text-center p-4">لا توجد قراءات</td>
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
      [style]="{ width: '600px' }">
      
      <div class="grid">
        <div class="col-12 md:col-6">
          <label class="block mb-2">المولد *</label>
          <p-dropdown
            [options]="generators"
            [(ngModel)]="formData.generator_id"
            optionLabel="name"
            optionValue="id"
            placeholder="اختر المولد"
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
          <label class="block mb-2">ساعات التشغيل</label>
          <p-inputNumber [(ngModel)]="formData.running_hours" [min]="0" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">استهلاك الوقود (لتر)</label>
          <p-inputNumber [(ngModel)]="formData.fuel_consumption" [min]="0" [minFractionDigits]="2" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-4">
          <label class="block mb-2">الجهد (V)</label>
          <p-inputNumber [(ngModel)]="formData.voltage" [min]="0" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-4">
          <label class="block mb-2">التيار (A)</label>
          <p-inputNumber [(ngModel)]="formData.current" [min]="0" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-4">
          <label class="block mb-2">التردد (Hz)</label>
          <p-inputNumber [(ngModel)]="formData.frequency" [min]="0" [max]="100" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-4">
          <label class="block mb-2">درجة الحرارة (°C)</label>
          <p-inputNumber [(ngModel)]="formData.temperature" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-4">
          <label class="block mb-2">ضغط الزيت (بار)</label>
          <p-inputNumber [(ngModel)]="formData.oil_pressure" [min]="0" styleClass="w-full"></p-inputNumber>
        </div>
        <div class="col-12 md:col-4">
          <label class="block mb-2">الطاقة المنتجة (kW)</label>
          <p-inputNumber [(ngModel)]="formData.power_output" [min]="0" styleClass="w-full"></p-inputNumber>
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
  `
})
export class GeneratorReadingsComponent implements OnInit {
  readings: GeneratorReading[] = [];
  generators: any[] = [];
  loading = false;
  saving = false;
  totalRecords = 0;
  stats: any = {};

  dialogVisible = false;
  editMode = false;
  editId = '';

  filters = {
    source: null as string | null,
    fromDate: null as Date | null,
    toDate: null as Date | null
  };

  formData: Partial<GeneratorReading> = {};

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
    this.loadGenerators();
  }

  loadData() {
    this.loading = true;
    const params: any = { page: 1, limit: 10 };
    if (this.filters.source) params.source = this.filters.source;
    if (this.filters.fromDate) params.from_date = this.filters.fromDate.toISOString();
    if (this.filters.toDate) params.to_date = this.filters.toDate.toISOString();

    this.readingsService.getGeneratorReadings(params).subscribe({
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

  loadGenerators() {
    // TODO: Load from generators service
    this.generators = [];
  }

  onLazyLoad(event: any) {
    const page = (event.first / event.rows) + 1;
    const params: any = { page, limit: event.rows };
    if (this.filters.source) params.source = this.filters.source;

    this.loading = true;
    this.readingsService.getGeneratorReadings(params).subscribe({
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
      source: 'manual'
    };
    this.dialogVisible = true;
  }

  editReading(item: GeneratorReading) {
    this.editMode = true;
    this.editId = item.id;
    this.formData = { ...item };
    this.dialogVisible = true;
  }

  saveReading() {
    if (!this.formData.generator_id) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار المولد' });
      return;
    }

    this.saving = true;
    const data = {
      ...this.formData,
      business_id: 'default-business-id' // TODO: Get from auth
    };

    const request = this.editMode
      ? this.readingsService.updateGeneratorReading(this.editId, data)
      : this.readingsService.createGeneratorReading(data);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editMode ? 'تم تحديث القراءة' : 'تم إضافة القراءة' });
        this.dialogVisible = false;
        this.loadData();
        this.loadStats();
        this.saving = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حفظ القراءة' });
        this.saving = false;
      }
    });
  }

  deleteReading(item: GeneratorReading) {
    this.readingsService.deleteGeneratorReading(item.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف القراءة' });
        this.loadData();
        this.loadStats();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف القراءة' })
    });
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
