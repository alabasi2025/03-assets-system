import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-100 flex" dir="rtl">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-800 text-white min-h-screen">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-xl font-bold">نظام الأصول والصيانة</h1>
          <p class="text-sm text-gray-400">Assets & Maintenance</p>
        </div>
        
        <nav class="p-4">
          <ul class="space-y-2">
            <!-- Assets Management -->
            <li class="mb-4">
              <span class="text-xs text-gray-400 uppercase tracking-wider">إدارة الأصول</span>
            </li>
            <li>
              <a routerLink="/assets" routerLinkActive="bg-gray-700" 
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                الأصول
              </a>
            </li>
            
            <!-- Preventive Maintenance -->
            <li class="mt-6 mb-4">
              <span class="text-xs text-gray-400 uppercase tracking-wider">الصيانة الوقائية</span>
            </li>
            <li>
              <a routerLink="/maintenance-plans" routerLinkActive="bg-gray-700"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                خطط الصيانة
              </a>
            </li>
            
            <!-- Corrective Maintenance -->
            <li class="mt-6 mb-4">
              <span class="text-xs text-gray-400 uppercase tracking-wider">الصيانة الطارئة</span>
            </li>
            <li>
              <a routerLink="/maintenance-requests" routerLinkActive="bg-gray-700"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                طلبات الصيانة
              </a>
            </li>
            <li>
              <a routerLink="/work-orders" routerLinkActive="bg-gray-700"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                أوامر العمل
              </a>
            </li>
            
            <!-- Spare Parts -->
            <li class="mt-6 mb-4">
              <span class="text-xs text-gray-400 uppercase tracking-wider">المخزون</span>
            </li>
            <li>
              <a routerLink="/spare-parts" routerLinkActive="bg-gray-700"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                قطع الغيار
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class App {
  protected title = 'نظام الأصول والصيانة';
}
