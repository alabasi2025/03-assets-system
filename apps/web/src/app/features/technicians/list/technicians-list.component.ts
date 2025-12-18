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
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TechniciansService, Technician, TechniciansStatistics } from '../../../core/services/technicians.service';

@Component({
  selector: 'app-technicians-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, CardModule, TagModule, ToastModule, 
    ConfirmDialogModule, DropdownModule, InputTextModule, RatingModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="page-container animate-fade-in" style="padding: 2rem 2.5rem;">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h2>إدارة الفنيين</h2>
          <p>عرض وإدارة الفنيين الداخليين والخارجيين</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/technicians/contractors" class="p-button p-button-outlined">
            <i class="pi pi-building"></i>
            <span class="mr-2">المقاولين</span>
          </a>
          <a routerLink="/technicians/contracts" class="p-button p-button-outlined">
            <i class="pi pi-file"></i>
            <span class="mr-2">العقود</span>
          </a>
          <a routerLink="/technicians/new" class="btn-add-primary">
            <i class="pi pi-plus"></i>
            <span>إضافة فني جديد</span>
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-users text-4xl text-blue-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ statistics?.summary?.techniciansCount || 0 }}</h3>
            <p class="text-gray-600">إجمالي الفنيين</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-user text-4xl text-green-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ statistics?.summary?.internalTechnicians || 0 }}</h3>
            <p class="text-gray-600">فنيين داخليين</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-user-plus text-4xl text-purple-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ statistics?.summary?.externalTechnicians || 0 }}</h3>
            <p class="text-gray-600">فنيين خارجيين</p>
          </div>
        </p-card>
        <p-card styleClass="shadow-sm">
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-teal-500 mb-2"></i>
            <h3 class="text-3xl font-bold">{{ statistics?.summary?.availableTechnicians || 0 }}</h3>
            <p class="text-gray-600">متاحين حالياً</p>
          </div>
        </p-card>
      </div>

      <!-- Filters -->
      <p-card styleClass="mb-4">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1">
            <span class="p-input-icon-right w-full">
              <i class="pi pi-search"></i>
              <input type="text" pInputText [(ngModel)]="searchTerm" 
                     placeholder="بحث بالاسم أو الكود..." 
                     class="w-full" (input)="onSearch()">
            </span>
          </div>
          <p-dropdown [options]="typeOptions" [(ngModel)]="selectedType" 
                      placeholder="نوع الفني" (onChange)="loadTechnicians()"
                      [showClear]="true"></p-dropdown>
          <p-dropdown [options]="availabilityOptions" [(ngModel)]="selectedAvailability" 
                      placeholder="الحالة" (onChange)="loadTechnicians()"
                      [showClear]="true"></p-dropdown>
          <p-dropdown [options]="skillLevelOptions" [(ngModel)]="selectedSkillLevel" 
                      placeholder="مستوى المهارة" (onChange)="loadTechnicians()"
                      [showClear]="true"></p-dropdown>
        </div>
      </p-card>

      <!-- Technicians Table -->
      <p-card>
        <p-table [value]="technicians" [paginator]="true" [rows]="10" [loading]="loading"
                 styleClass="p-datatable-sm" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>كود الفني</th>
              <th>الاسم</th>
              <th>النوع</th>
              <th>مستوى المهارة</th>
              <th>التقييم</th>
              <th>المهام المكتملة</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tech>
            <tr>
              <td><span class="font-mono text-blue-600">{{ tech.technician_code }}</span></td>
              <td>
                <div>
                  <span class="font-semibold">{{ tech.name }}</span>
                  <br *ngIf="tech.contractor">
                  <small class="text-gray-500" *ngIf="tech.contractor">{{ tech.contractor.name }}</small>
                </div>
              </td>
              <td>
                <p-tag [value]="tech.is_internal ? 'داخلي' : 'خارجي'" 
                       [severity]="tech.is_internal ? 'info' : 'warn'"></p-tag>
              </td>
              <td>{{ getSkillLevelLabel(tech.skills_level) }}</td>
              <td>
                <p-rating [(ngModel)]="tech.rating" [readonly]="true" [stars]="5"></p-rating>
              </td>
              <td>
                <span class="text-green-600 font-semibold">{{ tech.completed_jobs }}</span>
                <span class="text-gray-400"> / {{ tech.total_jobs }}</span>
              </td>
              <td>
                <p-tag [value]="tech.is_available ? 'متاح' : 'مشغول'" 
                       [severity]="tech.is_available ? 'success' : 'secondary'"></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <a [routerLink]="['/technicians', tech.id, 'edit']" 
                     class="p-button p-button-warning p-button-sm p-button-text">
                    <i class="pi pi-pencil"></i>
                  </a>
                  <button pButton class="p-button-info p-button-sm p-button-text" 
                          [routerLink]="['/technicians', tech.id, 'performance']">
                    <i class="pi pi-chart-line"></i>
                  </button>
                  <button pButton class="p-button-danger p-button-sm p-button-text" 
                          (click)="deleteTechnician(tech)">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="8" class="text-center py-8">لا يوجد فنيين مسجلين</td></tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `
})
export class TechniciansListComponent implements OnInit {
  technicians: Technician[] = [];
  statistics: TechniciansStatistics | null = null;
  loading = false;
  searchTerm = '';
  selectedType: boolean | null = null;
  selectedAvailability: boolean | null = null;
  selectedSkillLevel: string | null = null;

  typeOptions = [
    { label: 'داخلي', value: true },
    { label: 'خارجي', value: false }
  ];

  availabilityOptions = [
    { label: 'متاح', value: true },
    { label: 'مشغول', value: false }
  ];

  skillLevelOptions = [
    { label: 'مبتدئ', value: 'junior' },
    { label: 'متوسط', value: 'mid' },
    { label: 'متقدم', value: 'senior' },
    { label: 'خبير', value: 'expert' }
  ];

  constructor(
    private techniciansService: TechniciansService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadTechnicians();
    this.loadStatistics();
  }

  loadTechnicians() {
    this.loading = true;
    this.techniciansService.getTechnicians({
      isInternal: this.selectedType ?? undefined,
      isAvailable: this.selectedAvailability ?? undefined,
      skillsLevel: this.selectedSkillLevel ?? undefined,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (data) => {
        this.technicians = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في تحميل الفنيين' });
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.techniciansService.getStatistics().subscribe({
      next: (data) => this.statistics = data,
      error: () => console.error('Failed to load statistics')
    });
  }

  onSearch() {
    this.loadTechnicians();
  }

  getSkillLevelLabel(level: string): string {
    const levels: Record<string, string> = {
      'junior': 'مبتدئ',
      'mid': 'متوسط',
      'senior': 'متقدم',
      'expert': 'خبير'
    };
    return levels[level] || level;
  }

  deleteTechnician(tech: Technician) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الفني "${tech.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.techniciansService.deleteTechnician(tech.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الفني بنجاح' });
            this.loadTechnicians();
            this.loadStatistics();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل في حذف الفني' });
          }
        });
      }
    });
  }
}
