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
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="pi pi-th-large"></i>
          </div>
          <div class="header-text">
            <h1>لوحة التحكم</h1>
            <p>نظرة عامة على نظام الأصول والصيانة</p>
          </div>
        </div>
        <div class="header-date">
          <i class="pi pi-calendar"></i>
          <span>{{ currentDate }}</span>
        </div>
      </div>

      <!-- Main Stats Cards -->
      <div class="stats-section">
        <div class="stats-row">
          <div class="stat-card stat-blue" routerLink="/assets">
            <div class="stat-icon-wrapper blue">
              <i class="pi pi-box"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalAssets }}</span>
              <span class="stat-label">إجمالي الأصول المحاسبية</span>
            </div>
            <div class="stat-arrow">
              <i class="pi pi-arrow-left"></i>
            </div>
          </div>

          <div class="stat-card stat-green" routerLink="/stations">
            <div class="stat-icon-wrapper green">
              <i class="pi pi-building"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalStations }}</span>
              <span class="stat-label">محطات التوليد والتوزيع</span>
            </div>
            <div class="stat-arrow">
              <i class="pi pi-arrow-left"></i>
            </div>
          </div>

          <div class="stat-card stat-yellow" routerLink="/solar-stations">
            <div class="stat-icon-wrapper yellow">
              <i class="pi pi-sun"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalSolarStations }}</span>
              <span class="stat-label">محطات الطاقة الشمسية</span>
            </div>
            <div class="stat-arrow">
              <i class="pi pi-arrow-left"></i>
            </div>
          </div>

          <div class="stat-card stat-purple" routerLink="/generators">
            <div class="stat-icon-wrapper purple">
              <i class="pi pi-cog"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalGenerators }}</span>
              <span class="stat-label">المولدات الكهربائية</span>
            </div>
            <div class="stat-arrow">
              <i class="pi pi-arrow-left"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Cards -->
      <div class="alerts-section">
        <div class="alert-card orange" routerLink="/maintenance-requests">
          <div class="alert-icon">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div class="alert-content">
            <span class="alert-value">{{ stats.pendingRequests }}</span>
            <span class="alert-label">طلبات الصيانة المعلقة</span>
          </div>
          <div class="alert-badge" *ngIf="stats.pendingRequests > 0">تحتاج متابعة</div>
        </div>

        <div class="alert-card blue" routerLink="/work-orders">
          <div class="alert-icon">
            <i class="pi pi-wrench"></i>
          </div>
          <div class="alert-content">
            <span class="alert-value">{{ stats.activeWorkOrders }}</span>
            <span class="alert-label">أوامر العمل النشطة</span>
          </div>
          <div class="alert-badge active" *ngIf="stats.activeWorkOrders > 0">قيد التنفيذ</div>
        </div>

        <div class="alert-card red" routerLink="/spare-parts">
          <div class="alert-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="alert-content">
            <span class="alert-value">{{ stats.criticalParts }}</span>
            <span class="alert-label">قطع الغيار الحرجة</span>
          </div>
          <div class="alert-badge critical" *ngIf="stats.criticalParts > 0">تحذير</div>
        </div>
      </div>

      <!-- Quick Access Section -->
      <div class="quick-access-section">
        <div class="quick-access-card">
          <div class="card-header">
            <i class="pi pi-bolt"></i>
            <h3>الأصول الفنية</h3>
          </div>
          <div class="quick-links">
            <a routerLink="/stations" class="quick-link">
              <div class="link-icon blue"><i class="pi pi-building"></i></div>
              <span>المحطات</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/generators" class="quick-link">
              <div class="link-icon green"><i class="pi pi-cog"></i></div>
              <span>المولدات</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/cables" class="quick-link">
              <div class="link-icon purple"><i class="pi pi-share-alt"></i></div>
              <span>الكابلات</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/meters" class="quick-link">
              <div class="link-icon orange"><i class="pi pi-gauge"></i></div>
              <span>العدادات</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/solar-stations" class="quick-link">
              <div class="link-icon yellow"><i class="pi pi-sun"></i></div>
              <span>الطاقة الشمسية</span>
              <i class="pi pi-chevron-left"></i>
            </a>
          </div>
        </div>

        <div class="quick-access-card">
          <div class="card-header">
            <i class="pi pi-wrench"></i>
            <h3>الصيانة والمخزون</h3>
          </div>
          <div class="quick-links">
            <a routerLink="/maintenance-plans" class="quick-link">
              <div class="link-icon blue"><i class="pi pi-calendar"></i></div>
              <span>خطط الصيانة</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/maintenance-requests" class="quick-link">
              <div class="link-icon orange"><i class="pi pi-file-edit"></i></div>
              <span>طلبات الصيانة</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/work-orders" class="quick-link">
              <div class="link-icon green"><i class="pi pi-clipboard"></i></div>
              <span>أوامر العمل</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/spare-parts" class="quick-link">
              <div class="link-icon purple"><i class="pi pi-box"></i></div>
              <span>قطع الغيار</span>
              <i class="pi pi-chevron-left"></i>
            </a>
            <a routerLink="/assets" class="quick-link">
              <div class="link-icon cyan"><i class="pi pi-database"></i></div>
              <span>الأصول المحاسبية</span>
              <i class="pi pi-chevron-left"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.75rem;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .header-text h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .header-text p {
      color: #64748b;
      margin: 0.25rem 0 0;
      font-size: 0.95rem;
    }

    .header-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #f1f5f9;
      border-radius: 0.75rem;
      color: #475569;
      font-weight: 500;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 1.5rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
      border-radius: 0 1rem 1rem 0;
    }

    .stat-card.stat-blue::before { background: linear-gradient(180deg, #3b82f6, #1d4ed8); }
    .stat-card.stat-green::before { background: linear-gradient(180deg, #22c55e, #16a34a); }
    .stat-card.stat-yellow::before { background: linear-gradient(180deg, #f59e0b, #d97706); }
    .stat-card.stat-purple::before { background: linear-gradient(180deg, #8b5cf6, #7c3aed); }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-icon-wrapper.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .stat-icon-wrapper.yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .stat-icon-wrapper.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.5rem;
    }

    .stat-arrow {
      color: #94a3b8;
      transition: transform 0.3s ease;
    }

    .stat-card:hover .stat-arrow {
      transform: translateX(-4px);
      color: #3b82f6;
    }

    /* Alerts Section */
    .alerts-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .alert-card {
      background: white;
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      position: relative;
    }

    .alert-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    .alert-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .alert-card.orange .alert-icon { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .alert-card.blue .alert-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .alert-card.red .alert-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .alert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .alert-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .alert-label {
      font-size: 0.8rem;
      color: #64748b;
    }

    .alert-badge {
      padding: 0.35rem 0.75rem;
      border-radius: 2rem;
      font-size: 0.7rem;
      font-weight: 600;
      background: #fef3c7;
      color: #d97706;
    }

    .alert-badge.active {
      background: #dbeafe;
      color: #2563eb;
    }

    .alert-badge.critical {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Quick Access Section */
    .quick-access-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .quick-access-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-header i {
      font-size: 1.25rem;
      color: #3b82f6;
    }

    .card-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .quick-links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      background: #f8fafc;
      text-decoration: none;
      color: #334155;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .quick-link:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
      transform: translateX(-4px);
    }

    .quick-link span {
      flex: 1;
      font-weight: 500;
    }

    .quick-link .pi-chevron-left {
      color: #94a3b8;
      font-size: 0.75rem;
      transition: transform 0.2s ease;
    }

    .quick-link:hover .pi-chevron-left {
      transform: translateX(-4px);
      color: #3b82f6;
    }

    .link-icon {
      width: 36px;
      height: 36px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .link-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .link-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .link-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .link-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
    .link-icon.yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .link-icon.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .header-content {
        flex-direction: column;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .alerts-section {
        grid-template-columns: 1fr;
      }

      .quick-access-section {
        grid-template-columns: 1fr;
      }
    }
  `]
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

  currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
