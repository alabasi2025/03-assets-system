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
  // Preventive Maintenance Plans
  {
    path: 'maintenance-plans',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/maintenance-plans/maintenance-plans-list/maintenance-plans-list.component').then(m => m.MaintenancePlansListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/maintenance-plans/maintenance-plan-form/maintenance-plan-form.component').then(m => m.MaintenancePlanFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/maintenance-plans/maintenance-plan-form/maintenance-plan-form.component').then(m => m.MaintenancePlanFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/maintenance-plans/maintenance-plan-form/maintenance-plan-form.component').then(m => m.MaintenancePlanFormComponent)
      }
    ]
  },
  // Corrective/Emergency Maintenance Requests
  {
    path: 'maintenance-requests',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/maintenance-requests/maintenance-requests-list/maintenance-requests-list.component').then(m => m.MaintenanceRequestsListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/maintenance-requests/maintenance-request-form/maintenance-request-form.component').then(m => m.MaintenanceRequestFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/maintenance-requests/maintenance-request-form/maintenance-request-form.component').then(m => m.MaintenanceRequestFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/maintenance-requests/maintenance-request-form/maintenance-request-form.component').then(m => m.MaintenanceRequestFormComponent)
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
      },
      {
        path: 'new',
        loadComponent: () => import('./features/work-orders/work-order-form/work-order-form.component').then(m => m.WorkOrderFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/work-orders/work-order-form/work-order-form.component').then(m => m.WorkOrderFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/work-orders/work-order-form/work-order-form.component').then(m => m.WorkOrderFormComponent)
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
      },
      {
        path: 'new',
        loadComponent: () => import('./features/spare-parts/spare-part-form/spare-part-form.component').then(m => m.SparePartFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/spare-parts/spare-part-form/spare-part-form.component').then(m => m.SparePartFormComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/spare-parts/spare-part-form/spare-part-form.component').then(m => m.SparePartFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'assets'
  }
];
