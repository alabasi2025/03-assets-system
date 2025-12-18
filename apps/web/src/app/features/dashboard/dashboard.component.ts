import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { AssetsService } from '../../core/services/assets.service';
import { StationsService } from '../../core/services/stations.service';
import { GeneratorsService } from '../../core/services/generators.service';
import { SolarStationsService } from '../../core/services/solar-stations.service';
import { MaintenanceService } from '../../core/services/maintenance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ChartModule],
  template: `
    <div class="p-4">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p class="text-gray-600">نظرة عامة على نظام الأصول والصيانة</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="text-center">
            <i class="pi pi-box text-4xl mb-2"></i>
            <h3 class="text-3xl font-bold">{{ stats.totalAssets }}</h3>
            <p class="opacity-90">إجمالي الأصول المحاسبية</p>
            <a routerLink="/assets" class="text-white underline text-sm">عرض التفاصيل</a>
          </div>
        </p-card>

        <p-card styleClass="shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="text-center">
            <i class="pi pi-building text-4xl mb-2"></i>
            <h3 class="text-3xl font-bold">{{ stats.totalStations }}</h3>
            <p class="opacity-90">محطات التوليد والتوزيع</p>
            <a routerLink="/stations" class="text-white underline text-sm">عرض التفاصيل</a>
          </div>
        </p-card>

        <p-card styleClass="shadow-sm bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div class="text-center">
            <i class="pi pi-sun text-4xl mb-2"></i>
            <h3 class="text-3xl font-bold">{{ stats.totalSolarStations }}</h3>
            <p class="opacity-90">محطات الطاقة الشمسية</p>
            <a routerLink="/solar-stations" class="text-white underline text-sm">عرض التفاصيل</a>
          </div>
        </p-card>

        <p-card styleClass="shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="text-center">
            <i class="pi pi-cog text-4xl mb-2"></i>
            <h3 class="text-3xl font-bold">{{ stats.totalGenerators }}</h3>
            <p class="opacity-90">المولدات الكهربائية</p>
            <a routerLink="/generators" class="text-white underline text-sm">عرض التفاصيل</a>
          </div>
        </p-card>
      </div>

      <!-- Second Row Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <p-card styleClass="shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 mb-1">طلبات الصيانة المعلقة</p>
              <h3 class="text-2xl font-bold text-orange-600">{{ stats.pendingRequests }}</h3>
            </div>
            <i class="pi pi-exclamation-circle text-4xl text-orange-500"></i>
          </div>
          <a routerLink="/maintenance-requests" class="text-blue-600 text-sm">عرض الطلبات</a>
        </p-card>

        <p-card styleClass="shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 mb-1">أوامر العمل النشطة</p>
              <h3 class="text-2xl font-bold text-blue-600">{{ stats.activeWorkOrders }}</h3>
            </div>
            <i class="pi pi-wrench text-4xl text-blue-500"></i>
          </div>
          <a routerLink="/work-orders" class="text-blue-600 text-sm">عرض الأوامر</a>
        </p-card>

        <p-card styleClass="shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 mb-1">قطع الغيار الحرجة</p>
              <h3 class="text-2xl font-bold text-red-600">{{ stats.criticalParts }}</h3>
            </div>
            <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
          </div>
          <a routerLink="/spare-parts" class="text-blue-600 text-sm">عرض المخزون</a>
        </p-card>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p-card header="الأصول الفنية" styleClass="shadow-sm">
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/stations" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-building text-blue-600"></i>
              <span>المحطات</span>
            </a>
            <a routerLink="/generators" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-cog text-green-600"></i>
              <span>المولدات</span>
            </a>
            <a routerLink="/cables" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-share-alt text-purple-600"></i>
              <span>الكابلات</span>
            </a>
            <a routerLink="/meters" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-gauge text-orange-600"></i>
              <span>العدادات</span>
            </a>
            <a routerLink="/solar-stations" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-sun text-yellow-600"></i>
              <span>الطاقة الشمسية</span>
            </a>
          </div>
        </p-card>

        <p-card header="الصيانة" styleClass="shadow-sm">
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/maintenance-plans" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-calendar text-blue-600"></i>
              <span>خطط الصيانة</span>
            </a>
            <a routerLink="/maintenance-requests" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-file-edit text-orange-600"></i>
              <span>طلبات الصيانة</span>
            </a>
            <a routerLink="/work-orders" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-wrench text-green-600"></i>
              <span>أوامر العمل</span>
            </a>
            <a routerLink="/spare-parts" class="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <i class="pi pi-cog text-purple-600"></i>
              <span>قطع الغيار</span>
            </a>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = {
    totalAssets: 0,
    totalStations: 0,
    totalSolarStations: 0,
    totalGenerators: 0,
    pendingRequests: 0,
    activeWorkOrders: 0,
    criticalParts: 0
  };

  constructor(
    private assetsService: AssetsService,
    private stationsService: StationsService,
    private generatorsService: GeneratorsService,
    private solarStationsService: SolarStationsService,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.assetsService.getAssets().subscribe({
      next: (response: any) => {
        const assets = response.data || response;
        this.stats.totalAssets = Array.isArray(assets) ? assets.length : 0;
      },
      error: () => {}
    });

    this.stationsService.getAll().subscribe({
      next: (stations) => this.stats.totalStations = stations.length,
      error: () => {}
    });

    this.generatorsService.getAll().subscribe({
      next: (generators) => this.stats.totalGenerators = generators.length,
      error: () => {}
    });

    this.solarStationsService.getAll().subscribe({
      next: (stations) => this.stats.totalSolarStations = stations.length,
      error: () => {}
    });

    this.maintenanceService.getRequests('').subscribe({
      next: (response: any) => {
        const requests = response.data || response;
        this.stats.pendingRequests = Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0;
      },
      error: () => {}
    });

    this.maintenanceService.getWorkOrders().subscribe({
      next: (response: any) => {
        const orders = response.data || response;
        this.stats.activeWorkOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === 'in_progress').length : 0;
      },
      error: () => {}
    });
  }
}
