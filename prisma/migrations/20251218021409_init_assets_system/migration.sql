-- CreateTable
CREATE TABLE "asset_categories" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "parent_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description" TEXT,
    "depreciation_method" VARCHAR(50) NOT NULL DEFAULT 'straight_line',
    "useful_life_years" INTEGER NOT NULL DEFAULT 5,
    "salvage_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "asset_account_id" UUID,
    "depreciation_account_id" UUID,
    "expense_account_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "asset_number" VARCHAR(50) NOT NULL,
    "barcode" VARCHAR(100),
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description" TEXT,
    "manufacturer" VARCHAR(255),
    "model" VARCHAR(255),
    "serial_number" VARCHAR(100),
    "specifications" JSONB,
    "station_id" UUID,
    "location" VARCHAR(255),
    "location_lat" DECIMAL(10,8),
    "location_lng" DECIMAL(11,8),
    "custodian_id" UUID,
    "acquisition_date" DATE NOT NULL,
    "acquisition_cost" DECIMAL(15,2) NOT NULL,
    "acquisition_method" VARCHAR(50) NOT NULL DEFAULT 'purchase',
    "supplier_id" UUID,
    "invoice_number" VARCHAR(100),
    "depreciation_method" VARCHAR(50) NOT NULL DEFAULT 'straight_line',
    "useful_life_years" INTEGER NOT NULL,
    "salvage_value" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "accumulated_depreciation" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "book_value" DECIMAL(15,2) NOT NULL,
    "last_depreciation_date" DATE,
    "warranty_start" DATE,
    "warranty_end" DATE,
    "warranty_provider" VARCHAR(255),
    "warranty_terms" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "condition" VARCHAR(50) NOT NULL DEFAULT 'good',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_depreciation" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "depreciation_amount" DECIMAL(15,2) NOT NULL,
    "accumulated_before" DECIMAL(15,2) NOT NULL,
    "accumulated_after" DECIMAL(15,2) NOT NULL,
    "book_value_before" DECIMAL(15,2) NOT NULL,
    "book_value_after" DECIMAL(15,2) NOT NULL,
    "journal_entry_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_depreciation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_movements" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "movement_type" VARCHAR(50) NOT NULL,
    "movement_date" DATE NOT NULL,
    "from_location" VARCHAR(255),
    "to_location" VARCHAR(255),
    "from_custodian_id" UUID,
    "to_custodian_id" UUID,
    "value_before" DECIMAL(15,2),
    "value_after" DECIMAL(15,2),
    "reason" TEXT,
    "journal_entry_id" UUID,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_inventory" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "inventory_number" VARCHAR(50) NOT NULL,
    "inventory_date" DATE NOT NULL,
    "station_id" UUID,
    "category_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "total_assets" INTEGER NOT NULL DEFAULT 0,
    "found_assets" INTEGER NOT NULL DEFAULT 0,
    "missing_assets" INTEGER NOT NULL DEFAULT 0,
    "damaged_assets" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "conducted_by" UUID,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_inventory_items" (
    "id" UUID NOT NULL,
    "inventory_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "expected_location" VARCHAR(255),
    "actual_location" VARCHAR(255),
    "condition" VARCHAR(50) NOT NULL DEFAULT 'good',
    "notes" TEXT,
    "checked_by" UUID,
    "checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plans" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "asset_category_id" UUID,
    "frequency_type" VARCHAR(50) NOT NULL,
    "frequency_value" INTEGER NOT NULL DEFAULT 1,
    "frequency_unit" VARCHAR(20),
    "estimated_duration" INTEGER,
    "estimated_cost" DECIMAL(15,2),
    "checklist" JSONB,
    "required_parts" JSONB,
    "required_skills" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "schedule_number" VARCHAR(50) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "assigned_to" UUID,
    "team_id" UUID,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "actual_duration" INTEGER,
    "actual_cost" DECIMAL(15,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "request_number" VARCHAR(50) NOT NULL,
    "asset_id" UUID,
    "station_id" UUID,
    "request_type" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "reported_by" UUID,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'new',
    "assigned_to" UUID,
    "team_id" UUID,
    "estimated_completion" TIMESTAMP(3),
    "actual_completion" TIMESTAMP(3),
    "resolution" TEXT,
    "root_cause" TEXT,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "work_order_number" VARCHAR(50) NOT NULL,
    "request_id" UUID,
    "asset_id" UUID,
    "customer_id" UUID,
    "order_type" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "assigned_to" UUID,
    "team_id" UUID,
    "contractor_id" UUID,
    "scheduled_start" TIMESTAMP(3),
    "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "estimated_cost" DECIMAL(15,2),
    "actual_cost" DECIMAL(15,2),
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "closed_by" UUID,
    "closed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" UUID NOT NULL,
    "schedule_id" UUID,
    "work_order_id" UUID,
    "asset_id" UUID NOT NULL,
    "maintenance_type" VARCHAR(50) NOT NULL,
    "record_number" VARCHAR(50) NOT NULL,
    "performed_date" DATE NOT NULL,
    "performed_by" UUID,
    "description" TEXT,
    "findings" TEXT,
    "actions_taken" TEXT,
    "parts_used" JSONB,
    "labor_hours" DECIMAL(10,2),
    "labor_cost" DECIMAL(15,2),
    "parts_cost" DECIMAL(15,2),
    "other_cost" DECIMAL(15,2),
    "total_cost" DECIMAL(15,2),
    "condition_before" VARCHAR(50),
    "condition_after" VARCHAR(50),
    "next_maintenance_date" DATE,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_replacements" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "customer_id" UUID,
    "technician_id" UUID,
    "component_type" VARCHAR(50) NOT NULL,
    "old_serial_number" VARCHAR(100),
    "old_model" VARCHAR(100),
    "old_condition" VARCHAR(50),
    "old_damage_reason" TEXT,
    "new_serial_number" VARCHAR(100),
    "new_model" VARCHAR(100),
    "warranty_status" VARCHAR(50),
    "warranty_end_date" DATE,
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "component_cost" DECIMAL(15,2),
    "labor_cost" DECIMAL(15,2),
    "total_cost" DECIMAL(15,2),
    "invoice_id" UUID,
    "replacement_date" DATE NOT NULL,
    "replacement_time" TIME,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "component_replacements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "employee_id" UUID,
    "technician_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "specializations" JSONB,
    "certifications" JSONB,
    "skills_level" VARCHAR(20) NOT NULL DEFAULT 'mid',
    "hourly_rate" DECIMAL(10,2),
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "contractor_id" UUID,
    "rating" DECIMAL(3,2),
    "total_jobs" INTEGER NOT NULL DEFAULT 0,
    "completed_jobs" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "contractor_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "specializations" JSONB,
    "tax_number" VARCHAR(50),
    "bank_account" VARCHAR(50),
    "rating" DECIMAL(3,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_contracts" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "contract_number" VARCHAR(50) NOT NULL,
    "contractor_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "contract_type" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "value" DECIMAL(15,2),
    "payment_terms" TEXT,
    "scope" TEXT,
    "sla" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_performance" (
    "id" UUID NOT NULL,
    "technician_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "total_jobs" INTEGER NOT NULL DEFAULT 0,
    "completed_on_time" INTEGER NOT NULL DEFAULT 0,
    "completed_late" INTEGER NOT NULL DEFAULT 0,
    "rework_count" INTEGER NOT NULL DEFAULT 0,
    "customer_complaints" INTEGER NOT NULL DEFAULT 0,
    "quality_score" DECIMAL(3,2),
    "efficiency_score" DECIMAL(3,2),
    "overall_score" DECIMAL(3,2),
    "notes" TEXT,
    "evaluated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_categories" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "parent_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spare_part_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_parts" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "category_id" UUID,
    "part_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "description" TEXT,
    "unit" VARCHAR(20) NOT NULL,
    "manufacturer" VARCHAR(255),
    "model_compatibility" JSONB,
    "asset_categories" JSONB,
    "min_stock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "max_stock" DECIMAL(15,3),
    "reorder_point" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "current_stock" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "location" VARCHAR(255),
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "lead_time_days" INTEGER,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spare_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_part_movements" (
    "id" UUID NOT NULL,
    "part_id" UUID NOT NULL,
    "movement_type" VARCHAR(50) NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit_cost" DECIMAL(15,2),
    "total_cost" DECIMAL(15,2),
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "from_location" VARCHAR(255),
    "to_location" VARCHAR(255),
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spare_part_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_categories_business_id_idx" ON "asset_categories"("business_id");

-- CreateIndex
CREATE INDEX "asset_categories_parent_id_idx" ON "asset_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_categories_business_id_code_key" ON "asset_categories"("business_id", "code");

-- CreateIndex
CREATE INDEX "assets_business_id_idx" ON "assets"("business_id");

-- CreateIndex
CREATE INDEX "assets_category_id_idx" ON "assets"("category_id");

-- CreateIndex
CREATE INDEX "assets_station_id_idx" ON "assets"("station_id");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assets_business_id_asset_number_key" ON "assets"("business_id", "asset_number");

-- CreateIndex
CREATE INDEX "asset_depreciation_asset_id_idx" ON "asset_depreciation"("asset_id");

-- CreateIndex
CREATE INDEX "asset_depreciation_period_end_idx" ON "asset_depreciation"("period_end");

-- CreateIndex
CREATE INDEX "asset_movements_asset_id_idx" ON "asset_movements"("asset_id");

-- CreateIndex
CREATE INDEX "asset_movements_movement_type_idx" ON "asset_movements"("movement_type");

-- CreateIndex
CREATE INDEX "asset_inventory_business_id_idx" ON "asset_inventory"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_inventory_business_id_inventory_number_key" ON "asset_inventory"("business_id", "inventory_number");

-- CreateIndex
CREATE INDEX "asset_inventory_items_inventory_id_idx" ON "asset_inventory_items"("inventory_id");

-- CreateIndex
CREATE INDEX "asset_inventory_items_asset_id_idx" ON "asset_inventory_items"("asset_id");

-- CreateIndex
CREATE INDEX "maintenance_plans_business_id_idx" ON "maintenance_plans"("business_id");

-- CreateIndex
CREATE INDEX "maintenance_plans_asset_category_id_idx" ON "maintenance_plans"("asset_category_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_business_id_idx" ON "maintenance_schedules"("business_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_plan_id_idx" ON "maintenance_schedules"("plan_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_asset_id_idx" ON "maintenance_schedules"("asset_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_status_idx" ON "maintenance_schedules"("status");

-- CreateIndex
CREATE INDEX "maintenance_schedules_scheduled_date_idx" ON "maintenance_schedules"("scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_schedules_business_id_schedule_number_key" ON "maintenance_schedules"("business_id", "schedule_number");

-- CreateIndex
CREATE INDEX "maintenance_requests_business_id_idx" ON "maintenance_requests"("business_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_asset_id_idx" ON "maintenance_requests"("asset_id");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests"("status");

-- CreateIndex
CREATE INDEX "maintenance_requests_priority_idx" ON "maintenance_requests"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_requests_business_id_request_number_key" ON "maintenance_requests"("business_id", "request_number");

-- CreateIndex
CREATE INDEX "work_orders_business_id_idx" ON "work_orders"("business_id");

-- CreateIndex
CREATE INDEX "work_orders_request_id_idx" ON "work_orders"("request_id");

-- CreateIndex
CREATE INDEX "work_orders_asset_id_idx" ON "work_orders"("asset_id");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_business_id_work_order_number_key" ON "work_orders"("business_id", "work_order_number");

-- CreateIndex
CREATE INDEX "maintenance_records_schedule_id_idx" ON "maintenance_records"("schedule_id");

-- CreateIndex
CREATE INDEX "maintenance_records_work_order_id_idx" ON "maintenance_records"("work_order_id");

-- CreateIndex
CREATE INDEX "maintenance_records_asset_id_idx" ON "maintenance_records"("asset_id");

-- CreateIndex
CREATE INDEX "component_replacements_work_order_id_idx" ON "component_replacements"("work_order_id");

-- CreateIndex
CREATE INDEX "component_replacements_customer_id_idx" ON "component_replacements"("customer_id");

-- CreateIndex
CREATE INDEX "technicians_business_id_idx" ON "technicians"("business_id");

-- CreateIndex
CREATE INDEX "technicians_contractor_id_idx" ON "technicians"("contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_business_id_technician_code_key" ON "technicians"("business_id", "technician_code");

-- CreateIndex
CREATE INDEX "contractors_business_id_idx" ON "contractors"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_business_id_contractor_code_key" ON "contractors"("business_id", "contractor_code");

-- CreateIndex
CREATE INDEX "maintenance_contracts_business_id_idx" ON "maintenance_contracts"("business_id");

-- CreateIndex
CREATE INDEX "maintenance_contracts_contractor_id_idx" ON "maintenance_contracts"("contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_contracts_business_id_contract_number_key" ON "maintenance_contracts"("business_id", "contract_number");

-- CreateIndex
CREATE INDEX "technician_performance_technician_id_idx" ON "technician_performance"("technician_id");

-- CreateIndex
CREATE INDEX "spare_part_categories_business_id_idx" ON "spare_part_categories"("business_id");

-- CreateIndex
CREATE INDEX "spare_part_categories_parent_id_idx" ON "spare_part_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "spare_part_categories_business_id_code_key" ON "spare_part_categories"("business_id", "code");

-- CreateIndex
CREATE INDEX "spare_parts_business_id_idx" ON "spare_parts"("business_id");

-- CreateIndex
CREATE INDEX "spare_parts_category_id_idx" ON "spare_parts"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "spare_parts_business_id_part_code_key" ON "spare_parts"("business_id", "part_code");

-- CreateIndex
CREATE INDEX "spare_part_movements_part_id_idx" ON "spare_part_movements"("part_id");

-- CreateIndex
CREATE INDEX "spare_part_movements_movement_type_idx" ON "spare_part_movements"("movement_type");

-- CreateIndex
CREATE INDEX "spare_part_movements_movement_date_idx" ON "spare_part_movements"("movement_date");

-- AddForeignKey
ALTER TABLE "asset_categories" ADD CONSTRAINT "asset_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "asset_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_depreciation" ADD CONSTRAINT "asset_depreciation_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_movements" ADD CONSTRAINT "asset_movements_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_inventory_items" ADD CONSTRAINT "asset_inventory_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "asset_inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_inventory_items" ADD CONSTRAINT "asset_inventory_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "maintenance_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "maintenance_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "maintenance_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_replacements" ADD CONSTRAINT "component_replacements_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_contracts" ADD CONSTRAINT "maintenance_contracts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_performance" ADD CONSTRAINT "technician_performance_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spare_part_categories" ADD CONSTRAINT "spare_part_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "spare_part_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spare_parts" ADD CONSTRAINT "spare_parts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "spare_part_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spare_part_movements" ADD CONSTRAINT "spare_part_movements_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "spare_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
