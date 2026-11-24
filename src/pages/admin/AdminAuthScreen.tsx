import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { api, ApiError, setAuthToken } from '../../lib/api';
import type { SetupStatus } from '../../types/api';

interface AdminAuthScreenProps {
  onAuthenticated: () => void;
  navigate: (path: string) => void;
}

export function AdminAuthScreen({ onAuthenticated, navigate }: AdminAuthScreenProps) {
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [username, setUsername] = useState('admin');
  const [fullName, setFullName] = useState('مدير منصة مَنيع');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    api
      .getAuthSetupStatus()
      .then((res) => {
        setSetupStatus(res);
        setUsername(res.defaultUsername || 'admin');
      })
      .catch(() => {
        setSetupStatus({ needsSetup: false, envPasswordConfigured: false, defaultUsername: 'admin' });
      })
      .finally(() => setLoadingStatus(false));
  }, []);

  const handleBootstrap = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: ['تأكيد كلمة المرور غير مطابق.'] });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.bootstrapAdmin({ username, fullName, password });
      setAuthToken(res.accessToken, res.expiresAtUtc);
      onAuthenticated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.problem.errors) setFieldErrors(err.problem.errors);
      } else {
        setError('تعذّر إتمام إعداد الحساب.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await api.login({ username, password });
      setAuthToken(res.accessToken, res.expiresAtUtc);
      onAuthenticated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.problem.errors) setFieldErrors(err.problem.errors);
      } else {
        setError('تعذّر تسجيل الدخول. يرجى المحاولة مجدداً.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#0E1116] flex items-center justify-center p-6">
        <div className="w-full max-w-md h-80 rounded-lg bg-[#151A22] border border-white/10 animate-pulse" />
      </div>
    );
  }

  const isSetup = setupStatus?.needsSetup === true;

  return (
    <div className="min-h-screen bg-[#0E1116] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-lg font-bold text-white tracking-tight cursor-pointer"
          >
            MANEE | مَنيع
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الموقع العام</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-7 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B45309]">
              {isSetup ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isSetup ? 'التهيئة الأولية لمرة واحدة' : 'بوابة إدارة المحتوى'}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {isSetup ? 'إعداد حساب المدير الأول' : 'تسجيل الدخول للوحة التحكم'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isSetup
                ? 'لم يتم ضبط كلمة مرور مدير في متغيرات البيئة بعد. عيّن بيانات المدير الآن لتأمين لوحة التحكم.'
                : 'أدخل اسم المستخدم وكلمة المرور للوصول إلى إدارة المشاريع والصور والرسائل.'}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {isSetup ? (
            <form onSubmit={handleBootstrap} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-right border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.username[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.fullName[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="10 أحرف فأكثر (حرف كبير وصغير ورقم)"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.password[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  dir="ltr"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-700">{fieldErrors.confirmPassword[0]}</p>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                سياسة كلمة المرور المعتمدة: 10 أحرف على الأقل تتضمن حرفاً إنجليزياً كبيراً، حرفاً صغيراً، ورقماً.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 rounded-md transition-colors cursor-pointer"
              >
                {submitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب المدير والدخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  dir="ltr"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-right border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 rounded-md transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{submitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
