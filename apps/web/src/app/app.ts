import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, RippleModule, TooltipModule],
  template: `
    <div class="app-layout" dir="rtl">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <i class="pi pi-bolt"></i>
          </div>
          <h1>نظام الأصول</h1>
          <span class="subtitle">والصيانة</span>
        </div>
        
        <nav class="sidebar-nav">
          <!-- Dashboard -->
          <div class="nav-section">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-home"></i>
              <span>لوحة التحكم</span>
            </a>
          </div>

          <!-- Technical Assets -->
          <div class="nav-section">
            <span class="nav-section-title">الأصول الفنية</span>
            <a routerLink="/stations" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-building"></i>
              <span>المحطات</span>
            </a>
            <a routerLink="/generators" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-cog"></i>
              <span>المولدات</span>
            </a>
            <a routerLink="/cables" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-share-alt"></i>
              <span>الكابلات</span>
            </a>
            <a routerLink="/meters" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-gauge"></i>
              <span>العدادات</span>
            </a>
            <a routerLink="/solar-stations" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-sun"></i>
              <span>الطاقة الشمسية</span>
            </a>
          </div>

          <!-- Accounting Assets -->
          <div class="nav-section">
            <span class="nav-section-title">الأصول المحاسبية</span>
            <a routerLink="/assets" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-server"></i>
              <span>الأصول</span>
            </a>
          </div>
          
          <!-- Preventive Maintenance -->
          <div class="nav-section">
            <span class="nav-section-title">الصيانة الوقائية</span>
            <a routerLink="/maintenance-plans" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-calendar"></i>
              <span>خطط الصيانة</span>
            </a>
          </div>
          
          <!-- Emergency Maintenance -->
          <div class="nav-section">
            <span class="nav-section-title">الصيانة الطارئة</span>
            <a routerLink="/maintenance-requests" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-exclamation-triangle"></i>
              <span>طلبات الصيانة</span>
            </a>
            <a routerLink="/work-orders" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-file-edit"></i>
              <span>أوامر العمل</span>
            </a>
          </div>
          
          <!-- Inventory -->
          <div class="nav-section">
            <span class="nav-section-title">المخزون</span>
            <a routerLink="/spare-parts" routerLinkActive="active" class="nav-item" pRipple>
              <i class="pi pi-box"></i>
              <span>قطع الغيار</span>
            </a>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <span class="version">الإصدار 2.0.0</span>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    
    .app-layout {
      display: flex;
      height: 100%;
      background: #f1f5f9;
    }
    
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e3a5f 0%, #0f2744 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 1000;
    }
    
    .sidebar-header {
      padding: 24px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .logo {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
    
    .logo i { font-size: 1.75rem; color: white; }
    
    .sidebar-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.6);
    }
    
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
    }
    
    .nav-section {
      margin-bottom: 16px;
    }
    
    .nav-section-title {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.4);
      padding: 0 12px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      border-radius: 10px;
      margin-bottom: 2px;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      position: relative;
      overflow: hidden;
    }
    
    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    
    .nav-item.active {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .nav-item i {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }
    
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }
    
    .version {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
    }
    
    .main-content {
      flex: 1;
      margin-right: 260px;
      overflow-y: auto;
      min-height: 100vh;
    }
    
    @media (max-width: 768px) {
      .sidebar { width: 70px; }
      .sidebar-header h1, .sidebar-header .subtitle, .nav-section-title, .nav-item span { display: none; }
      .sidebar-header { padding: 16px 10px; }
      .logo { width: 44px; height: 44px; margin-bottom: 0; }
      .nav-item { justify-content: center; padding: 14px; }
      .nav-item i { margin: 0; }
      .main-content { margin-right: 70px; }
      .sidebar-footer { display: none; }
    }
  `]
})
export class App {
  title = 'نظام إدارة الأصول والصيانة';
}
