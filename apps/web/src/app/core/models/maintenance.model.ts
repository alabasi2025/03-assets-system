import { Asset } from './asset.model';

// Maintenance Plan Model
export interface MaintenancePlan {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  assetCategoryId: string | null;
  frequencyType: FrequencyType;
  frequencyValue: number;
  frequencyUnit: string | null;
  estimatedDuration: number | null;
  estimatedCost: number | null;
  checklist: ChecklistItem[] | null;
  requiredParts: RequiredPart[] | null;
  requiredSkills: string[] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { schedules: number };
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'hours_based';

export interface ChecklistItem {
  id: string;
  task: string;
  required: boolean;
}

export interface RequiredPart {
  partId: string;
  partCode: string;
  partName: string;
  quantity: number;
}

// Maintenance Schedule Model
export interface MaintenanceSchedule {
  id: string;
  businessId: string;
  planId: string;
  assetId: string;
  scheduleNumber: string;
  scheduledDate: Date;
  dueDate: Date;
  status: ScheduleStatus;
  priority: Priority;
  assignedTo: string | null;
  teamId: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  actualDuration: number | null;
  actualCost: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  plan?: MaintenancePlan;
  asset?: Asset;
}

export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Maintenance Request Model (Corrective/Emergency)
export interface MaintenanceRequest {
  id: string;
  businessId: string;
  requestNumber: string;
  assetId: string | null;
  stationId: string | null;
  requestType: RequestType;
  priority: Priority;
  title: string;
  description: string | null;
  reportedBy: string | null;
  reportedAt: Date;
  location: string | null;
  status: RequestStatus;
  assignedTo: string | null;
  teamId: string | null;
  estimatedCompletion: Date | null;
  actualCompletion: Date | null;
  resolution: string | null;
  rootCause: string | null;
  attachments: Attachment[] | null;
  createdAt: Date;
  updatedAt: Date;
  asset?: Asset;
  workOrders?: WorkOrder[];
}

export type RequestType = 'breakdown' | 'malfunction' | 'damage' | 'other';
export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'pending_parts' | 'completed' | 'cancelled';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

// Work Order Model
export interface WorkOrder {
  id: string;
  businessId: string;
  workOrderNumber: string;
  requestId: string | null;
  assetId: string | null;
  customerId: string | null;
  orderType: OrderType;
  priority: Priority;
  title: string;
  description: string | null;
  instructions: string | null;
  status: WorkOrderStatus;
  assignedTo: string | null;
  teamId: string | null;
  contractorId: string | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  actualStart: Date | null;
  actualEnd: Date | null;
  estimatedCost: number | null;
  actualCost: number | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  closedBy: string | null;
  closedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  request?: MaintenanceRequest;
  asset?: Asset;
  records?: MaintenanceRecord[];
}

export type OrderType = 'repair' | 'replacement' | 'inspection' | 'upgrade';
export type WorkOrderStatus = 'draft' | 'approved' | 'assigned' | 'in_progress' | 'completed' | 'closed' | 'cancelled';

// Maintenance Record Model
export interface MaintenanceRecord {
  id: string;
  scheduleId: string | null;
  workOrderId: string | null;
  assetId: string;
  maintenanceType: MaintenanceType;
  recordNumber: string;
  performedDate: Date;
  performedBy: string | null;
  description: string | null;
  findings: string | null;
  actionsTaken: string | null;
  partsUsed: PartUsed[] | null;
  laborHours: number | null;
  laborCost: number | null;
  partsCost: number | null;
  otherCost: number | null;
  totalCost: number | null;
  conditionBefore: string | null;
  conditionAfter: string | null;
  nextMaintenanceDate: Date | null;
  attachments: Attachment[] | null;
  createdAt: Date;
}

export type MaintenanceType = 'preventive' | 'corrective' | 'emergency';

export interface PartUsed {
  partId: string;
  partCode: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

// DTOs
export interface CreateMaintenancePlanDto {
  businessId: string;
  name: string;
  description?: string;
  assetCategoryId?: string;
  frequencyType: FrequencyType;
  frequencyValue?: number;
  frequencyUnit?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  checklist?: ChecklistItem[];
  requiredParts?: RequiredPart[];
  requiredSkills?: string[];
  isActive?: boolean;
}

export interface CreateMaintenanceRequestDto {
  businessId: string;
  assetId?: string;
  stationId?: string;
  requestType: RequestType;
  priority?: Priority;
  title: string;
  description?: string;
  location?: string;
  attachments?: Attachment[];
}

export interface CreateWorkOrderDto {
  businessId: string;
  requestId?: string;
  assetId?: string;
  customerId?: string;
  orderType: OrderType;
  priority?: Priority;
  title: string;
  description?: string;
  instructions?: string;
  assignedTo?: string;
  teamId?: string;
  contractorId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedCost?: number;
}

export interface MaintenanceStatistics {
  byStatus: Array<{ status: string; _count: number }>;
  byPriority: Array<{ priority: string; _count: number }>;
  byType: Array<{ requestType: string; _count: number }>;
  recentRequests: MaintenanceRequest[];
}

export interface WorkOrderStatistics {
  byStatus: Array<{ status: string; _count: number }>;
  byType: Array<{ orderType: string; _count: number }>;
  byPriority: Array<{ priority: string; _count: number }>;
  costs: {
    totalEstimated: number;
    totalActual: number;
  };
}
