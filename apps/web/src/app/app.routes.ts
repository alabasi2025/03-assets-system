import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'assets',
    pathMatch: 'full'
  },
  // Assets Management
  {
    path: 'assets',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/assets/assets-list/assets-list.component').then(m => m.AssetsListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent)
      }
    ]
  },
  // Preventive Maintenance
  {
    path: 'maintenance-plans',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/maintenance-plans/maintenance-plans-list/maintenance-plans-list.component').then(m => m.MaintenancePlansListComponent)
      }
    ]
  },
  // Corrective/Emergency Maintenance
  {
    path: 'maintenance-requests',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/maintenance-requests/maintenance-requests-list/maintenance-requests-list.component').then(m => m.MaintenanceRequestsListComponent)
      }
    ]
  },
  // Work Orders
  {
    path: 'work-orders',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/work-orders/work-orders-list/work-orders-list.component').then(m => m.WorkOrdersListComponent)
      }
    ]
  },
  // Spare Parts
  {
    path: 'spare-parts',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/spare-parts/spare-parts-list/spare-parts-list.component').then(m => m.SparePartsListComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'assets'
  }
];
