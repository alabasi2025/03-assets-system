# نظام إدارة الأصول والصيانة

## نظرة عامة

نظام متكامل لإدارة الأصول والصيانة الوقائية والطارئة وقطع الغيار، مبني باستخدام:
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Angular 19
- **قاعدة البيانات**: PostgreSQL

## الوحدات المنفذة

### 1. وحدة إدارة الأصول
- تسجيل الأصول مع جميع البيانات الفنية والمالية
- نظام ترقيم تلقائي للأصول
- تصنيفات هرمية للأصول
- حساب الإهلاك (القسط الثابت والقسط المتناقص)
- تتبع حركات الأصول (اقتناء، نقل، استبعاد)
- تقارير إحصائية شاملة

### 2. وحدة الصيانة الوقائية (PM)
- خطط صيانة قابلة للتخصيص
- جدولة تلقائية حسب التكرار (يومي، أسبوعي، شهري، ربع سنوي، سنوي)
- قوائم فحص مخصصة
- تتبع قطع الغيار المطلوبة

### 3. وحدة الصيانة الطارئة (CM)
- طلبات صيانة مع نظام أولويات
- أوامر عمل متكاملة
- سجلات صيانة تفصيلية
- تتبع حالة الطلبات والموافقات

### 4. وحدة قطع الغيار
- إدارة مخزون قطع الغيار
- تصنيفات قطع الغيار
- حركات المخزون (استلام، صرف، تحويل، تعديل)
- تنبيهات الحد الأدنى للمخزون
- تقارير قيمة المخزون

## نقاط النهاية (API Endpoints)

### تصنيفات الأصول
```
POST   /api/v1/asset-categories          - إنشاء تصنيف
GET    /api/v1/asset-categories          - جلب التصنيفات
GET    /api/v1/asset-categories/tree/:id - جلب شجرة التصنيفات
GET    /api/v1/asset-categories/:id      - جلب تصنيف محدد
PUT    /api/v1/asset-categories/:id      - تحديث تصنيف
DELETE /api/v1/asset-categories/:id      - حذف تصنيف
```

### الأصول
```
POST   /api/v1/assets                    - إنشاء أصل
GET    /api/v1/assets                    - جلب الأصول
GET    /api/v1/assets/statistics/:id     - إحصائيات الأصول
GET    /api/v1/assets/:id                - جلب أصل محدد
GET    /api/v1/assets/:id/depreciation   - جدول إهلاك الأصل
PUT    /api/v1/assets/:id                - تحديث أصل
POST   /api/v1/assets/:id/dispose        - استبعاد أصل
DELETE /api/v1/assets/:id                - حذف أصل
```

### الإهلاك
```
POST   /api/v1/depreciation/run          - تشغيل الإهلاك
GET    /api/v1/depreciation/period/:id   - قيود فترة محددة
POST   /api/v1/depreciation/post/:id     - ترحيل الإهلاك
POST   /api/v1/depreciation/reverse/:id  - عكس الإهلاك
GET    /api/v1/depreciation/summary/:id  - ملخص حسب التصنيف
```

### خطط الصيانة
```
POST   /api/v1/maintenance-plans         - إنشاء خطة
GET    /api/v1/maintenance-plans         - جلب الخطط
GET    /api/v1/maintenance-plans/:id     - جلب خطة محددة
PUT    /api/v1/maintenance-plans/:id     - تحديث خطة
DELETE /api/v1/maintenance-plans/:id     - حذف خطة
POST   /api/v1/maintenance-plans/:id/generate - توليد جداول الصيانة
```

### طلبات الصيانة
```
POST   /api/v1/maintenance-requests      - إنشاء طلب
GET    /api/v1/maintenance-requests      - جلب الطلبات
GET    /api/v1/maintenance-requests/statistics/:id - إحصائيات
GET    /api/v1/maintenance-requests/:id  - جلب طلب محدد
PUT    /api/v1/maintenance-requests/:id  - تحديث طلب
POST   /api/v1/maintenance-requests/:id/assign - تعيين الطلب
POST   /api/v1/maintenance-requests/:id/complete - إكمال الطلب
```

### أوامر العمل
```
POST   /api/v1/work-orders               - إنشاء أمر عمل
GET    /api/v1/work-orders               - جلب أوامر العمل
GET    /api/v1/work-orders/statistics/:id - إحصائيات
GET    /api/v1/work-orders/:id           - جلب أمر عمل محدد
PUT    /api/v1/work-orders/:id           - تحديث أمر عمل
POST   /api/v1/work-orders/:id/approve   - اعتماد
POST   /api/v1/work-orders/:id/start     - بدء التنفيذ
POST   /api/v1/work-orders/:id/complete  - إكمال
POST   /api/v1/work-orders/:id/close     - إغلاق
POST   /api/v1/work-orders/:id/records   - إضافة سجل صيانة
```

### قطع الغيار
```
POST   /api/v1/spare-parts/categories    - إنشاء تصنيف
GET    /api/v1/spare-parts/categories    - جلب التصنيفات
POST   /api/v1/spare-parts               - إنشاء قطعة غيار
GET    /api/v1/spare-parts               - جلب قطع الغيار
GET    /api/v1/spare-parts/statistics/:id - إحصائيات
GET    /api/v1/spare-parts/low-stock/:id - قطع تحت الحد الأدنى
GET    /api/v1/spare-parts/stock-value/:id - قيمة المخزون
GET    /api/v1/spare-parts/:id           - جلب قطعة محددة
PUT    /api/v1/spare-parts/:id           - تحديث قطعة
POST   /api/v1/spare-parts/movements     - تسجيل حركة مخزون
GET    /api/v1/spare-parts/:id/movements - حركات قطعة محددة
```

## التشغيل

### المتطلبات
- Node.js 22+
- PostgreSQL 15+
- pnpm

### إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
sudo -u postgres createdb assets_system
sudo -u postgres createuser assets_user
sudo -u postgres psql -c "ALTER USER assets_user WITH PASSWORD 'assets_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE assets_system TO assets_user;"

# تطبيق المخطط
npx prisma db push
```

### تشغيل API
```bash
# تثبيت الحزم
pnpm install

# بناء API
pnpm nx build api

# تشغيل API
DATABASE_URL="postgresql://assets_user:assets_pass@localhost:5432/assets_system" node dist/apps/api/main.js
```

### تشغيل الواجهة
```bash
# بناء الواجهة
pnpm nx build web

# تشغيل الواجهة (للتطوير)
pnpm nx serve web
```

## الهيكل البرمجي

```
apps/
├── api/                          # Backend NestJS
│   └── src/
│       ├── common/
│       │   └── prisma/           # Prisma Service
│       ├── modules/
│       │   ├── asset-categories/ # تصنيفات الأصول
│       │   ├── assets/           # الأصول
│       │   ├── depreciation/     # الإهلاك
│       │   ├── maintenance-plans/# خطط الصيانة
│       │   ├── maintenance-requests/ # طلبات الصيانة
│       │   ├── work-orders/      # أوامر العمل
│       │   └── spare-parts/      # قطع الغيار
│       └── main.ts
├── web/                          # Frontend Angular
│   └── src/
│       └── app/
│           ├── core/
│           │   ├── models/       # نماذج البيانات
│           │   └── services/     # خدمات API
│           └── features/
│               ├── assets/       # شاشات الأصول
│               ├── maintenance-plans/
│               ├── maintenance-requests/
│               ├── work-orders/
│               └── spare-parts/
prisma/
└── schema.prisma                 # مخطط قاعدة البيانات
```

## القواعد المتبعة

- ✅ لا شاشة بدون Backend متصل بقاعدة البيانات
- ✅ لا بيانات وهمية
- ✅ UUID لجميع المفاتيح الأساسية
- ✅ snake_case لأسماء الجداول والأعمدة
- ✅ Decimal للقيم المالية
- ✅ التحقق من البيانات في Backend و Frontend
