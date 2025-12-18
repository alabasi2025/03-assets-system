import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetsService } from '../../../core/services/assets.service';
import { AssetCategory, Asset, CreateAssetDto } from '../../../core/models/asset.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'تعديل الأصل' : 'إضافة أصل جديد' }}</h1>
          <p class="text-gray-600">{{ isEditMode ? 'تعديل بيانات الأصل' : 'تسجيل أصل جديد في النظام' }}</p>
        </div>
        <button 
          routerLink="/assets"
          class="text-gray-600 hover:text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          العودة للقائمة
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">البيانات الأساسية</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رقم الأصل *</label>
              <input 
                type="text" 
                formControlName="assetNumber"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="form.get('assetNumber')?.invalid && form.get('assetNumber')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">اسم الأصل *</label>
              <input 
                type="text" 
                formControlName="name"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
              <input 
                type="text" 
                formControlName="nameEn"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">التصنيف *</label>
              <select 
                formControlName="categoryId"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="form.get('categoryId')?.invalid && form.get('categoryId')?.touched">
                <option value="">اختر التصنيف</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
              <input 
                type="text" 
                formControlName="barcode"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
              <input 
                type="text" 
                formControlName="location"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea 
                formControlName="description"
                rows="3"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          </div>
        </div>

        <!-- Technical Data -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">البيانات الفنية</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الشركة المصنعة</label>
              <input 
                type="text" 
                formControlName="manufacturer"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الموديل</label>
              <input 
                type="text" 
                formControlName="model"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الرقم التسلسلي</label>
              <input 
                type="text" 
                formControlName="serialNumber"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Financial Data -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">البيانات المالية</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الاقتناء *</label>
              <input 
                type="date" 
                formControlName="acquisitionDate"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="form.get('acquisitionDate')?.invalid && form.get('acquisitionDate')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تكلفة الاقتناء *</label>
              <input 
                type="number" 
                formControlName="acquisitionCost"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="form.get('acquisitionCost')?.invalid && form.get('acquisitionCost')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الاقتناء</label>
              <select 
                formControlName="acquisitionMethod"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="purchase">شراء</option>
                <option value="donation">تبرع</option>
                <option value="transfer">تحويل</option>
                <option value="construction">إنشاء</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
              <input 
                type="text" 
                formControlName="invoiceNumber"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Depreciation -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">الإهلاك</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الإهلاك</label>
              <select 
                formControlName="depreciationMethod"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="straight_line">القسط الثابت</option>
                <option value="declining_balance">القسط المتناقص</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">العمر الإنتاجي (سنوات) *</label>
              <input 
                type="number" 
                formControlName="usefulLifeYears"
                min="1"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="form.get('usefulLifeYears')?.invalid && form.get('usefulLifeYears')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">قيمة الخردة</label>
              <input 
                type="number" 
                formControlName="salvageValue"
                min="0"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Warranty -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">الضمان</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">بداية الضمان</label>
              <input 
                type="date" 
                formControlName="warrantyStart"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">نهاية الضمان</label>
              <input 
                type="date" 
                formControlName="warrantyEnd"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">مزود الضمان</label>
              <input 
                type="text" 
                formControlName="warrantyProvider"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">الحالة</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">حالة الأصل</label>
              <select 
                formControlName="status"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="under_maintenance">تحت الصيانة</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الحالة الفنية</label>
              <select 
                formControlName="condition"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="excellent">ممتاز</option>
                <option value="good">جيد</option>
                <option value="fair">مقبول</option>
                <option value="poor">ضعيف</option>
                <option value="damaged">تالف</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4">
          <button 
            type="button"
            routerLink="/assets"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            إلغاء
          </button>
          <button 
            type="submit"
            [disabled]="form.invalid || isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {{ isSubmitting ? 'جاري الحفظ...' : (isEditMode ? 'تحديث' : 'حفظ') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class AssetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private assetsService = inject(AssetsService);

  form!: FormGroup;
  categories: AssetCategory[] = [];
  isEditMode = false;
  isSubmitting = false;
  assetId: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    this.assetId = this.route.snapshot.paramMap.get('id');
    if (this.assetId && this.assetId !== 'new') {
      this.isEditMode = true;
      this.loadAsset(this.assetId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      assetNumber: ['', Validators.required],
      name: ['', Validators.required],
      nameEn: [''],
      categoryId: ['', Validators.required],
      barcode: [''],
      location: [''],
      description: [''],
      manufacturer: [''],
      model: [''],
      serialNumber: [''],
      acquisitionDate: ['', Validators.required],
      acquisitionCost: [0, [Validators.required, Validators.min(0)]],
      acquisitionMethod: ['purchase'],
      invoiceNumber: [''],
      depreciationMethod: ['straight_line'],
      usefulLifeYears: [5, [Validators.required, Validators.min(1)]],
      salvageValue: [0, Validators.min(0)],
      warrantyStart: [''],
      warrantyEnd: [''],
      warrantyProvider: [''],
      status: ['active'],
      condition: ['good'],
    });
  }

  loadCategories() {
    this.assetsService.getCategories({ businessId: environment.defaultBusinessId }).subscribe({
      next: (response) => {
        this.categories = response.data;
      }
    });
  }

  loadAsset(id: string) {
    this.assetsService.getAsset(id).subscribe({
      next: (response) => {
        const asset = response.data;
        this.form.patchValue({
          ...asset,
          acquisitionDate: asset.acquisitionDate ? new Date(asset.acquisitionDate).toISOString().split('T')[0] : '',
          warrantyStart: asset.warrantyStart ? new Date(asset.warrantyStart).toISOString().split('T')[0] : '',
          warrantyEnd: asset.warrantyEnd ? new Date(asset.warrantyEnd).toISOString().split('T')[0] : '',
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const data: CreateAssetDto = {
      ...this.form.value,
      businessId: environment.defaultBusinessId,
    };

    const request = this.isEditMode
      ? this.assetsService.updateAsset(this.assetId!, data)
      : this.assetsService.createAsset(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/assets']);
      },
      error: (error) => {
        console.error('Error saving asset:', error);
        this.isSubmitting = false;
      }
    });
  }
}
