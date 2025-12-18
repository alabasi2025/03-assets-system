import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryService, Inventory } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="grid">
      <!-- Statistics Cards -->
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">إجمالي الجرد</span>
              <div class="text-900 font-bold text-2xl">{{ stats.total || 0 }}</div>
            </div>
            <div class="bg-blue-100 border-round p-3">
              <i class="pi pi-list text-blue-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">مسودة</span>
              <div class="text-900 font-bold text-2xl">{{ stats.byStatus?.draft || 0 }}</div>
            </div>
            <div class="bg-gray-100 border-round p-3">
              <i class="pi pi-file text-gray-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">قيد التنفيذ</span>
              <div class="text-900 font-bold text-2xl">{{ stats.byStatus?.in_progress || 0 }}</div>
            </div>
            <div class="bg-orange-100 border-round p-3">
              <i class="pi pi-spin pi-spinner text-orange-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>
      <div class="col-12 md:col-3">
        <p-card styleClass="h-full">
          <div class="flex align-items-center justify-content-between">
            <div>
              <span class="block text-500 font-medium mb-2">معتمد</span>
              <div class="text-900 font-bold text-2xl">{{ stats.byStatus?.approved || 0 }}</div>
            </div>
            <div class="bg-green-100 border-round p-3">
              <i class="pi pi-check-circle text-green-500 text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Main Content -->
      <div class="col-12">
        <p-card>
          <div class="flex justify-content-between align-items-center mb-4">
            <h2 class="m-0">إدارة الجرد والمطابقة</h2>
            <button pButton label="جرد جديد" icon="pi pi-plus" routerLink="/inventory/new"></button>
          </div>

          <!-- Filters -->
          <div class="grid mb-4">
            <div class="col-12 md:col-3">
              <p-dropdown
                [options]="statusOptions"
                [(ngModel)]="filters.status"
                placeholder="الحالة"
                [showClear]="true"
                (onChange)="loadData()"
                styleClass="w-full">
              </p-dropdown>
            </div>
            <div class="col-12 md:col-3">
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search"></i>
                <input type="text" pInputText [(ngModel)]="filters.search" placeholder="بحث..." class="w-full" (keyup.enter)="loadData()">
              </span>
            </div>
          </div>

          <!-- Table -->
          <p-table
            [value]="inventories"
            [loading]="loading"
            [paginator]="true"
            [rows]="10"
            [totalRecords]="totalRecords"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            styleClass="p-datatable-sm p-datatable-striped">
            
            <ng-template pTemplate="header">
              <tr>
                <th>رقم الجرد</th>
                <th>التاريخ</th>
                <th>المحطة</th>
                <th>الحالة</th>
                <th>إجمالي الأصول</th>
                <th>الموجودة</th>
                <th>المفقودة</th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.inventory_number }}</td>
                <td>{{ item.inventory_date | date:'yyyy-MM-dd' }}</td>
                <td>{{ item.station?.name || '-' }}</td>
                <td>
                  <p-tag [value]="getStatusLabel(item.status)" [severity]="getStatusSeverity(item.status)"></p-tag>
                </td>
                <td>{{ item.total_assets || 0 }}</td>
                <td class="text-green-500">{{ item.found_assets || 0 }}</td>
                <td class="text-red-500">{{ item.missing_assets || 0 }}</td>
                <td>
                  <button pButton icon="pi pi-eye" class="p-button-text p-button-sm" [routerLink]="['/inventory', item.id]"></button>
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" [routerLink]="['/inventory', item.id, 'edit']" *ngIf="item.status !== 'approved'"></button>
                  <button pButton icon="pi pi-play" class="p-button-text p-button-sm p-button-success" (click)="startInventory(item)" *ngIf="item.status === 'draft'" pTooltip="بدء الجرد"></button>
                  <button pButton icon="pi pi-check" class="p-button-text p-button-sm p-button-warning" (click)="completeInventory(item)" *ngIf="item.status === 'in_progress'" pTooltip="إكمال الجرد"></button>
                  <button pButton icon="pi pi-verified" class="p-button-text p-button-sm p-button-info" (click)="approveInventory(item)" *ngIf="item.status === 'completed'" pTooltip="اعتماد الجرد"></button>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="confirmDelete(item)" *ngIf="item.status !== 'approved'"></button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center p-4">لا يوجد سجلات جرد</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  inventories: Inventory[] = [];
  loading = false;
  totalRecords = 0;
  stats: any = {};

  filters = {
    status: null as string | null,
    search: ''
  };

  statusOptions = [
    { label: 'مسودة', value: 'draft' },
    { label: 'قيد التنفيذ', value: 'in_progress' },
    { label: 'مكتمل', value: 'completed' },
    { label: 'معتمد', value: 'approved' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadData() {
    this.loading = true;
    const params: any = { page: 1, limit: 10 };
    if (this.filters.status) params.status = this.filters.status;

    this.inventoryService.getAll(params).subscribe({
      next: (res) => {
        this.inventories = res.data;
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
    this.inventoryService.getStatistics().subscribe({
      next: (res) => this.stats = res,
      error: () => {}
    });
    this.loadData();
  }

  onLazyLoad(event: any) {
    const page = (event.first / event.rows) + 1;
    const params: any = { page, limit: event.rows };
    if (this.filters.status) params.status = this.filters.status;

    this.loading = true;
    this.inventoryService.getAll(params).subscribe({
      next: (res) => {
        this.inventories = res.data;
        this.totalRecords = res.meta.total;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      approved: 'معتمد'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger" | "contrast"> = {
      draft: 'secondary',
      in_progress: 'warn',
      completed: 'info',
      approved: 'success'
    };
    return severities[status];
  }

  startInventory(item: Inventory) {
    this.inventoryService.start(item.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم بدء الجرد' });
        this.loadData();
        this.loadStats();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في بدء الجرد' })
    });
  }

  completeInventory(item: Inventory) {
    this.inventoryService.complete(item.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إكمال الجرد' });
        this.loadData();
        this.loadStats();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في إكمال الجرد' })
    });
  }

  approveInventory(item: Inventory) {
    // TODO: Get actual user ID
    this.inventoryService.approve(item.id, 'user-id').subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اعتماد الجرد' });
        this.loadData();
        this.loadStats();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في اعتماد الجرد' })
    });
  }

  confirmDelete(item: Inventory) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الجرد؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.inventoryService.delete(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الجرد' });
            this.loadData();
            this.loadStats();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف الجرد' })
        });
      }
    });
  }
}
