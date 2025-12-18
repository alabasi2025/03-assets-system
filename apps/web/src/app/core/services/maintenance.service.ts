import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/asset.model';
import {
  MaintenancePlan,
  MaintenanceSchedule,
  MaintenanceRequest,
  WorkOrder,
  MaintenanceRecord,
  CreateMaintenancePlanDto,
  CreateMaintenanceRequestDto,
  CreateWorkOrderDto,
  MaintenanceStatistics,
  WorkOrderStatistics,
} from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private plansEndpoint = '/maintenance-plans';
  private requestsEndpoint = '/maintenance-requests';
  private workOrdersEndpoint = '/work-orders';

  constructor(private api: ApiService) {}

  // ═══════════════════════════════════════════════════════════════
  // Maintenance Plans (Preventive Maintenance)
  // ═══════════════════════════════════════════════════════════════

  getPlans(businessId: string, isActive?: boolean): Observable<ApiResponse<MaintenancePlan[]>> {
    return this.api.get<ApiResponse<MaintenancePlan[]>>(this.plansEndpoint, { businessId, isActive });
  }

  getPlan(id: string): Observable<ApiResponse<MaintenancePlan>> {
    return this.api.get<ApiResponse<MaintenancePlan>>(`${this.plansEndpoint}/${id}`);
  }

  createPlan(data: CreateMaintenancePlanDto): Observable<ApiResponse<MaintenancePlan>> {
    return this.api.post<ApiResponse<MaintenancePlan>>(this.plansEndpoint, data);
  }

  updatePlan(id: string, data: Partial<CreateMaintenancePlanDto>): Observable<ApiResponse<MaintenancePlan>> {
    return this.api.put<ApiResponse<MaintenancePlan>>(`${this.plansEndpoint}/${id}`, data);
  }

  deletePlan(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`${this.plansEndpoint}/${id}`);
  }

  generateSchedules(planId: string, assetIds: string[], startDate: string, endDate: string): Observable<ApiResponse<{ created: number; total: number }>> {
    return this.api.post<ApiResponse<{ created: number; total: number }>>(`${this.plansEndpoint}/${planId}/generate-schedules`, {
      assetIds,
      startDate,
      endDate,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Maintenance Requests (Corrective/Emergency Maintenance)
  // ═══════════════════════════════════════════════════════════════

  getRequests(businessId: string, filters?: {
    status?: string;
    priority?: string;
    assetId?: string;
    stationId?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<MaintenanceRequest>> {
    return this.api.get<PaginatedResponse<MaintenanceRequest>>(this.requestsEndpoint, { businessId, ...filters });
  }

  getRequest(id: string): Observable<ApiResponse<MaintenanceRequest>> {
    return this.api.get<ApiResponse<MaintenanceRequest>>(`${this.requestsEndpoint}/${id}`);
  }

  createRequest(data: CreateMaintenanceRequestDto): Observable<ApiResponse<MaintenanceRequest>> {
    return this.api.post<ApiResponse<MaintenanceRequest>>(this.requestsEndpoint, data);
  }

  updateRequest(id: string, data: Partial<MaintenanceRequest>): Observable<ApiResponse<MaintenanceRequest>> {
    return this.api.put<ApiResponse<MaintenanceRequest>>(`${this.requestsEndpoint}/${id}`, data);
  }

  assignRequest(id: string, assignedTo: string, teamId?: string): Observable<ApiResponse<MaintenanceRequest>> {
    return this.api.post<ApiResponse<MaintenanceRequest>>(`${this.requestsEndpoint}/${id}/assign`, { assignedTo, teamId });
  }

  completeRequest(id: string, resolution: string, rootCause?: string): Observable<ApiResponse<MaintenanceRequest>> {
    return this.api.post<ApiResponse<MaintenanceRequest>>(`${this.requestsEndpoint}/${id}/complete`, { resolution, rootCause });
  }

  getRequestStatistics(businessId: string): Observable<ApiResponse<MaintenanceStatistics>> {
    return this.api.get<ApiResponse<MaintenanceStatistics>>(`${this.requestsEndpoint}/statistics/${businessId}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Work Orders
  // ═══════════════════════════════════════════════════════════════

  getWorkOrders(businessId: string, filters?: {
    status?: string;
    priority?: string;
    orderType?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<WorkOrder>> {
    return this.api.get<PaginatedResponse<WorkOrder>>(this.workOrdersEndpoint, { businessId, ...filters });
  }

  getWorkOrder(id: string): Observable<ApiResponse<WorkOrder>> {
    return this.api.get<ApiResponse<WorkOrder>>(`${this.workOrdersEndpoint}/${id}`);
  }

  createWorkOrder(data: CreateWorkOrderDto): Observable<ApiResponse<WorkOrder>> {
    return this.api.post<ApiResponse<WorkOrder>>(this.workOrdersEndpoint, data);
  }

  updateWorkOrder(id: string, data: Partial<WorkOrder>): Observable<ApiResponse<WorkOrder>> {
    return this.api.put<ApiResponse<WorkOrder>>(`${this.workOrdersEndpoint}/${id}`, data);
  }

  approveWorkOrder(id: string, approvedBy: string): Observable<ApiResponse<WorkOrder>> {
    return this.api.post<ApiResponse<WorkOrder>>(`${this.workOrdersEndpoint}/${id}/approve`, { approvedBy });
  }

  startWorkOrder(id: string): Observable<ApiResponse<WorkOrder>> {
    return this.api.post<ApiResponse<WorkOrder>>(`${this.workOrdersEndpoint}/${id}/start`, {});
  }

  completeWorkOrder(id: string, actualCost?: number, notes?: string): Observable<ApiResponse<WorkOrder>> {
    return this.api.post<ApiResponse<WorkOrder>>(`${this.workOrdersEndpoint}/${id}/complete`, { actualCost, notes });
  }

  closeWorkOrder(id: string, closedBy: string): Observable<ApiResponse<WorkOrder>> {
    return this.api.post<ApiResponse<WorkOrder>>(`${this.workOrdersEndpoint}/${id}/close`, { closedBy });
  }

  addMaintenanceRecord(workOrderId: string, record: Partial<MaintenanceRecord>): Observable<ApiResponse<MaintenanceRecord>> {
    return this.api.post<ApiResponse<MaintenanceRecord>>(`${this.workOrdersEndpoint}/${workOrderId}/records`, record);
  }

  getWorkOrderStatistics(businessId: string): Observable<ApiResponse<WorkOrderStatistics>> {
    return this.api.get<ApiResponse<WorkOrderStatistics>>(`${this.workOrdersEndpoint}/statistics/${businessId}`);
  }
}
