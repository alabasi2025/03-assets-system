import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  // Categories
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/list/categories-list.component').then(m => m.CategoriesListComponent)
  },
  // Assets Management (Accounting)
  {
    path: 'assets',
    children: [
      { path: '', loadComponent: () => import('./features/assets/assets-list/assets-list.component').then(m => m.AssetsListComponent) },
      { path: 'new', loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent) },
      { path: ':id', loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent) }
    ]
  },
  // Stations (Technical Assets)
  {
    path: 'stations',
    children: [
      { path: '', loadComponent: () => import('./features/stations/list/stations-list.component').then(m => m.StationsListComponent) },
      { path: 'new', loadComponent: () => import('./features/stations/form/station-form.component').then(m => m.StationFormComponent) },
      { path: ':id', loadComponent: () => import('./features/stations/form/station-form.component').then(m => m.StationFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/stations/form/station-form.component').then(m => m.StationFormComponent) }
    ]
  },
  // Generators
  {
    path: 'generators',
    children: [
      { path: '', loadComponent: () => import('./features/generators/list/generators-list.component').then(m => m.GeneratorsListComponent) },
      { path: 'new', loadComponent: () => import('./features/generators/form/generator-form.component').then(m => m.GeneratorFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/generators/form/generator-form.component').then(m => m.GeneratorFormComponent) }
    ]
  },
  // Cables (Electrical Network)
  {
    path: 'cables',
    children: [
      { path: '', loadComponent: () => import('./features/cables/list/cables-list.component').then(m => m.CablesListComponent) },
      { path: 'new', loadComponent: () => import('./features/cables/form/cable-form.component').then(m => m.CableFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/cables/form/cable-form.component').then(m => m.CableFormComponent) }
    ]
  },
  // Meters
  {
    path: 'meters',
    children: [
      { path: '', loadComponent: () => import('./features/meters/list/meters-list.component').then(m => m.MetersListComponent) },
      { path: 'new', loadComponent: () => import('./features/meters/form/meter-form.component').then(m => m.MeterFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/meters/form/meter-form.component').then(m => m.MeterFormComponent) }
    ]
  },
  // Solar Stations
  {
    path: 'solar-stations',
    children: [
      { path: '', loadComponent: () => import('./features/solar-stations/list/solar-stations-list.component').then(m => m.SolarStationsListComponent) },
      { path: 'new', loadComponent: () => import('./features/solar-stations/form/solar-station-form.component').then(m => m.SolarStationFormComponent) },
      { path: ':id', loadComponent: () => import('./features/solar-stations/form/solar-station-form.component').then(m => m.SolarStationFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/solar-stations/form/solar-station-form.component').then(m => m.SolarStationFormComponent) }
    ]
  },
  // Maintenance Plans
  {
    path: 'maintenance-plans',
    children: [
      { path: '', loadComponent: () => import('./features/maintenance-plans/maintenance-plans-list/maintenance-plans-list.component').then(m => m.MaintenancePlansListComponent) },
      { path: 'new', loadComponent: () => import('./features/maintenance-plans/maintenance-plan-form/maintenance-plan-form.component').then(m => m.MaintenancePlanFormComponent) },
      { path: ':id', loadComponent: () => import('./features/maintenance-plans/maintenance-plan-form/maintenance-plan-form.component').then(m => m.MaintenancePlanFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/maintenance-plans/maintenance-plan-form/maintenance-plan-form.component').then(m => m.MaintenancePlanFormComponent) }
    ]
  },
  // Maintenance Requests
  {
    path: 'maintenance-requests',
    children: [
      { path: '', loadComponent: () => import('./features/maintenance-requests/maintenance-requests-list/maintenance-requests-list.component').then(m => m.MaintenanceRequestsListComponent) },
      { path: 'new', loadComponent: () => import('./features/maintenance-requests/maintenance-request-form/maintenance-request-form.component').then(m => m.MaintenanceRequestFormComponent) },
      { path: ':id', loadComponent: () => import('./features/maintenance-requests/maintenance-request-form/maintenance-request-form.component').then(m => m.MaintenanceRequestFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/maintenance-requests/maintenance-request-form/maintenance-request-form.component').then(m => m.MaintenanceRequestFormComponent) }
    ]
  },
  // Work Orders
  {
    path: 'work-orders',
    children: [
      { path: '', loadComponent: () => import('./features/work-orders/work-orders-list/work-orders-list.component').then(m => m.WorkOrdersListComponent) },
      { path: 'new', loadComponent: () => import('./features/work-orders/work-order-form/work-order-form.component').then(m => m.WorkOrderFormComponent) },
      { path: ':id', loadComponent: () => import('./features/work-orders/work-order-form/work-order-form.component').then(m => m.WorkOrderFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/work-orders/work-order-form/work-order-form.component').then(m => m.WorkOrderFormComponent) }
    ]
  },
  // Technicians & Contractors
  {
    path: 'technicians',
    children: [
      { path: '', loadComponent: () => import('./features/technicians/list/technicians-list.component').then(m => m.TechniciansListComponent) },
      { path: 'new', loadComponent: () => import('./features/technicians/form/technician-form.component').then(m => m.TechnicianFormComponent) },
      { path: 'contractors', loadComponent: () => import('./features/technicians/contractors/contractors-list.component').then(m => m.ContractorsListComponent) },
      { path: 'contracts', loadComponent: () => import('./features/technicians/contracts/contracts-list.component').then(m => m.ContractsListComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/technicians/form/technician-form.component').then(m => m.TechnicianFormComponent) }
    ]
  },
  // Inventory & Reconciliation
  {
    path: 'inventory',
    children: [
      { path: '', loadComponent: () => import('./features/inventory/list/inventory-list.component').then(m => m.InventoryListComponent) },
      { path: 'new', loadComponent: () => import('./features/inventory/list/inventory-list.component').then(m => m.InventoryListComponent) },
      { path: ':id', loadComponent: () => import('./features/inventory/list/inventory-list.component').then(m => m.InventoryListComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/inventory/list/inventory-list.component').then(m => m.InventoryListComponent) }
    ]
  },
  // Readings
  {
    path: 'readings',
    children: [
      { path: '', redirectTo: 'generators', pathMatch: 'full' },
      { path: 'generators', loadComponent: () => import('./features/readings/generators/generator-readings.component').then(m => m.GeneratorReadingsComponent) },
      { path: 'meters', loadComponent: () => import('./features/readings/meters/meter-readings.component').then(m => m.MeterReadingsComponent) }
    ]
  },
  // Spare Parts
  {
    path: 'spare-parts',
    children: [
      { path: '', loadComponent: () => import('./features/spare-parts/spare-parts-list/spare-parts-list.component').then(m => m.SparePartsListComponent) },
      { path: 'new', loadComponent: () => import('./features/spare-parts/spare-part-form/spare-part-form.component').then(m => m.SparePartFormComponent) },
      { path: ':id', loadComponent: () => import('./features/spare-parts/spare-part-form/spare-part-form.component').then(m => m.SparePartFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./features/spare-parts/spare-part-form/spare-part-form.component').then(m => m.SparePartFormComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
