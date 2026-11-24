import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react';
import { api } from '../lib/api';
import {
  PROJECT_STATUS_AR,
  type PagedResult,
  type ProjectStatus,
  type PublicCategory,
  type PublicMaterial,
  type PublicProjectListItem,
  type PublicService,
} from '../types/api';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface ProjectsPageProps {
  navigate: (path: string) => void;
  initialServiceId?: number | null;
}

export function ProjectsPage({ navigate, initialServiceId = null }: ProjectsPageProps) {
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [materials, setMaterials] = useState<PublicMaterial[]>([]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(initialServiceId);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<PagedResult<PublicProjectListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getPublicCategories(),
      api.getPublicServices(),
      api.getPublicMaterials(),
    ]).then(([cats, svcs, mats]) => {
      setCategories(cats);
      setServices(svcs);
      setMaterials(mats);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getPublicProjects({
        page,
        pageSize: 9,
        categoryId,
        serviceId,
        materialId,
        status,
        search: searchQuery || undefined,
      })
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err.message || 'تعذّر تحميل قائمة المشاريع.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, categoryId, serviceId, materialId, status, searchQuery]);

  const hasFilters = Boolean(categoryId || serviceId || materialId || status || searchQuery);

  const resetFilters = () => {
    setCategoryId(null);
    setServiceId(null);
    setMaterialId(null);
    setStatus('');
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-[75vh] bg-[#F4F5F6]">
      {/* Header Band */}
      <section className="bg-[#0E1116] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-3">
          <p className="text-xs font-semibold text-[#F59E0B]">سجل الأعمال الهندسية الموثّق</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">معرض مشاريع العزل</h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            تصفّح المشاريع المنفّذة وقيد التنفيذ حسب نوع المنشأة والخدمة والمواد المعتمدة مع توثيق مراحل العمل.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Interactive Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          {/* Category Segmented Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="التصنيف">
              <button
                type="button"
                onClick={() => {
                  setCategoryId(null);
                  setPage(1);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  categoryId === null
                    ? 'bg-[#0E1116] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                جميع المنشآت
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    setPage(1);
                  }}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    categoryId === cat.id
                      ? 'bg-[#0E1116] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {data && (
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                إجمالي النتائج: {data.totalCount}
              </span>
            )}
          </div>

          {/* Search & Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ابحث في العنوان أو الوصف..."
                className="w-full pr-9 pl-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <select
              aria-label="تصفية حسب الخدمة"
              value={serviceId ?? ''}
              onChange={(e) => {
                setServiceId(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#D97706]"
            >
              <option value="">كل الخدمات</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              aria-label="تصفية حسب المادة"
              value={materialId ?? ''}
              onChange={(e) => {
                setMaterialId(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#D97706]"
            >
              <option value="">كل مواد العزل</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                aria-label="تصفية حسب الحالة"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ProjectStatus | '');
                  setPage(1);
                }}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#D97706]"
              >
                <option value="">كل الحالات</option>
                <option value="Completed">{PROJECT_STATUS_AR.Completed}</option>
                <option value="InProgress">{PROJECT_STATUS_AR.InProgress}</option>
                <option value="Planned">{PROJECT_STATUS_AR.Planned}</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  title="إعادة ضبط الفلاتر"
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-84 rounded-lg border border-slate-200 bg-white animate-pulse"
              />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-14 text-center space-y-4">
            <p className="text-base font-semibold text-slate-900">
              لا توجد مشاريع مطابقة لمعايير البحث الحالية
            </p>
            <p className="text-sm text-slate-500">
              جرّب تغيير الفلاتر أو مسح البحث لعرض جميع المشاريع المنشورة.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-md cursor-pointer"
              >
                عرض جميع المشاريع
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((project) => (
                <article
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.urlSegment}`)}
                  className="group bg-white border border-slate-200 hover:border-slate-400 rounded-lg overflow-hidden transition-colors cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/3] bg-slate-900 overflow-hidden">
                    <ImageWithFallback
                      src={project.coverImage?.thumbnailUrl || project.coverImage?.url}
                      alt={project.coverImage?.altText || project.title}
                      fallbackTitle={project.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="font-semibold text-[#B45309]">{project.category.name}</span>
                        {project.city && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{project.city}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{PROJECT_STATUS_AR[project.status]}</span>
                        {project.executionDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{project.executionDate}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#B45309] transition-colors leading-snug">
                        {project.title}
                      </h2>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {project.shortDescription}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>تفاصيل المشروع ومراحل العزل</span>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#B45309]" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-md disabled:opacity-40 hover:border-slate-900 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <span className="text-sm font-mono tabular-nums text-slate-700 px-3">
                  صفحة {data.page} من {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-md disabled:opacity-40 hover:border-slate-900 cursor-pointer"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
