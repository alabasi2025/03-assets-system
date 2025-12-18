import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  template: `
    <div class="app-container" dir="rtl">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>نظام الأصول والصيانة</h1>
          <p>Assets & Maintenance System</p>
        </div>
        
        <nav class="sidebar-nav">
          <!-- Assets Management -->
          <div class="nav-section">
            <span class="nav-section-title">إدارة الأصول</span>
            <a routerLink="/assets" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span>الأصول</span>
            </a>
          </div>
          
          <!-- Preventive Maintenance -->
          <div class="nav-section">
            <span class="nav-section-title">الصيانة الوقائية</span>
            <a routerLink="/maintenance-plans" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              <span>خطط الصيانة</span>
            </a>
          </div>
          
          <!-- Corrective Maintenance -->
          <div class="nav-section">
            <span class="nav-section-title">الصيانة الطارئة</span>
            <a routerLink="/maintenance-requests" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span>طلبات الصيانة</span>
            </a>
            <a routerLink="/work-orders" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>أوامر العمل</span>
            </a>
          </div>
          
          <!-- Spare Parts -->
          <div class="nav-section">
            <span class="nav-section-title">المخزون</span>
            <a routerLink="/spare-parts" routerLinkActive="active" class="nav-link">
              <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span>قطع الغيار</span>
            </a>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .app-container {
      display: flex;
      min-height: 100vh;
      background: #f5f7fa;
    }
    
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e3a5f 0%, #0d2137 100%);
      color: white;
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      overflow-y: auto;
      box-shadow: -2px 0 15px rgba(0,0,0,0.1);
    }
    
    .sidebar-header {
      padding: 24px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .sidebar-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: #fff;
    }
    
    .sidebar-header p {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.6);
    }
    
    .sidebar-nav {
      padding: 16px 0;
    }
    
    .nav-section {
      margin-bottom: 8px;
    }
    
    .nav-section-title {
      display: block;
      padding: 12px 20px 8px;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.4);
      font-weight: 600;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      border-right: 3px solid transparent;
      gap: 12px;
    }
    
    .nav-link:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }
    
    .nav-link.active {
      background: rgba(79, 195, 247, 0.15);
      color: #4fc3f7;
      border-right-color: #4fc3f7;
    }
    
    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    
    .main-content {
      flex: 1;
      margin-right: 260px;
      padding: 24px 32px;
      min-height: 100vh;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        position: relative;
      }
      .main-content {
        margin-right: 0;
      }
      .app-container {
        flex-direction: column;
      }
    }
  `]
})
export class App {
  protected title = 'نظام الأصول والصيانة';
}
