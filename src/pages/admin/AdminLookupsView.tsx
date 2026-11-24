import { useEffect, useState, type FormEvent } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { AdminCategory, AdminMaterial, AdminService } from '../../types/api';

type LookupTab = 'categories' | 'services' | 'materials';

interface AdminLookupsViewProps {
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
}

export function AdminLookupsView({ onNotify }: AdminLookupsViewProps) {
  const [tab, setTab] = useState<LookupTab>('categories');
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Shared form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, svcs, mats] = await Promise.all([
        api.getAdminCategories(),
        api.getAdminServices(),
        api.getAdminMaterials(),
      ]);
      setCategories(cats);
      setServices(svcs);
      setMaterials(mats);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذّر تحميل القوائم المرجعية.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setDisplayOrder(0);
    setIsActive(true);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditCategory = (c: AdminCategory) => {
    resetForm();
    setEditingId(c.id);
    setName(c.name);
    setDisplayOrder(c.displayOrder);
    setIsActive(c.isActive);
    setShowForm(true);
  };

  const openEditService = (s: AdminService) => {
    resetForm();
    setEditingId(s.id);
    setName(s.name);
    setSlug(s.slug || '');
    setShortDescription(s.shortDescription);
    setDescription(s.description || '');
    setDisplayOrder(s.displayOrder);
    setIsActive(s.isActive);
    setShowForm(true);
  };

  const openEditMaterial = (m: AdminMaterial) => {
    resetForm();
    setEditingId(m.id);
    setName(m.name);
    setIsActive(m.isActive);
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (tab === 'categories') {
        const payload = { name, displayOrder: Number(displayOrder) || 0, isActive };
        if (editingId) await api.updateCategory(editingId, payload);
        else await api.createCategory(payload);
      } else if (tab === 'services') {
        const payload = {
          name,
          slug: slug.trim() || null,
          shortDescription,
          description: description.trim() || null,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        };
        if (editingId) await api.updateService(editingId, payload);
        else await api.createService(payload);
      } else {
        const payload = { name, isActive };
        if (editingId) await api.updateMaterial(editingId, payload);
        else await api.createMaterial(payload);
      }
      onNotify(editingId ? 'تم تحديث العنصر بنجاح.' : 'تمت الإضافة بنجاح.');
      resetForm();
      await loadAll();
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldErr = err.problem.errors
          ? Object.values(err.problem.errors).flat()[0]
          : null;
        setFormError(firstFieldErr || err.message);
      } else {
        setFormError('حدث خطأ أثناء الحفظ.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (tab === 'categories') await api.deleteCategory(id);
      else if (tab === 'services') await api.deleteService(id);
      else await api.deleteMaterial(id);
      setDeleteConfirmId(null);
      onNotify('تم الحذف بنجاح.');
      await loadAll();
    } catch (err) {
      setDeleteConfirmId(null);
      onNotify(err instanceof Error ? err.message : 'تعذّر الحذف.', 'error');
    }
  };

  const tabLabels: Array<{ id: LookupTab; label: string; count: number }> = [
    { id: 'categories', label: 'التصنيفات (أنواع المنشآت)', count: categories.length },
    { id: 'services', label: 'الخدمات', count: services.length },
    { id: 'materials', label: 'مواد العزل', count: materials.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs & Add CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          {tabLabels.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                resetForm();
                setDeleteConfirmId(null);
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label} <span className="font-mono tabular-nums text-xs opacity-70">({t.count})</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            {tab === 'categories'
              ? 'إضافة تصنيف'
              : tab === 'services'
                ? 'إضافة خدمة'
                : 'إضافة مادة'}
          </span>
        </button>
      </div>

      {/* Inline Editor Card */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-300 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'تعديل البيانات' : 'إضافة عنصر جديد'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الاسم <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
              />
            </div>

            {tab === 'services' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug لاتيني اختياري (مثال: roof-insulation)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono text-right border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
              </div>
            )}

            {tab !== 'materials' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-5">
              <input
                id="lookup_isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#D97706]"
              />
              <label htmlFor="lookup_isActive" className="text-sm font-medium text-slate-800">
                فعّال ويظهر في الموقع العام
              </label>
            </div>
          </div>

          {tab === 'services' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف المختصر <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف التفصيلي (اختياري)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0E1116] hover:bg-slate-800 disabled:opacity-50 rounded-md cursor-pointer"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">الاسم</th>
                  {tab === 'services' && <th className="py-3 px-4 font-semibold">الرابط / الوصف</th>}
                  {tab !== 'materials' && <th className="py-3 px-4 font-semibold">الترتيب</th>}
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tab === 'categories' &&
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600">
                        {c.displayOrder}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className={c.isActive ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {c.isActive ? 'فعّال' : 'موقوف'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditCategory(c)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deleteConfirmId === c.id ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleDelete(c.id)}
                                className="px-2 py-1 bg-red-600 text-white rounded cursor-pointer"
                              >
                                تأكيد الحذف
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(c.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {tab === 'services' &&
                  services.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {s.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-600 line-clamp-1">{s.shortDescription}</div>
                        <div className="text-[11px] font-mono text-slate-400" dir="ltr">
                          /services/{s.urlSegment}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-600">
                        {s.displayOrder}
                      </td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap">
                        <span className={s.isActive ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {s.isActive ? 'فعّال' : 'موقوف'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditService(s)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deleteConfirmId === s.id ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleDelete(s.id)}
                                className="px-2 py-1 bg-red-600 text-white rounded cursor-pointer"
                              >
                                تأكيد
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(s.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {tab === 'materials' &&
                  materials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className={m.isActive ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                          {m.isActive ? 'فعّال' : 'موقوف'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditMaterial(m)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deleteConfirmId === m.id ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => handleDelete(m.id)}
                                className="px-2 py-1 bg-red-600 text-white rounded cursor-pointer"
                              >
                                تأكيد
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(m.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
