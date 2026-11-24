import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { api, ApiError } from '../lib/api';

interface ContactFormCardProps {
  defaultSubject?: string;
}

export function ContactFormCard({ defaultSubject = '' }: ContactFormCardProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot hidden field per SOP 9.5

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneralError(null);
    setFieldErrors({});
    setSuccessMsg(null);

    try {
      const res = await api.submitContactMessage({
        fullName,
        phone,
        email: email.trim() || undefined,
        subject: subject.trim() || undefined,
        message,
        website,
      });
      setSuccessMsg(res.message);
      setFullName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
      setWebsite('');
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.problem.errors) {
          setFieldErrors(err.problem.errors);
        }
      } else {
        setGeneralError('تعذّر إرسال الرسالة. يرجى المحاولة مجدداً.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-4">
        <div className="flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <h3 className="text-lg font-bold text-slate-900">تم استلام استفسارك بنجاح</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{successMsg}</p>
        <button
          type="button"
          onClick={() => setSuccessMsg(null)}
          className="px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
        >
          إرسال استفسار آخر
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-5"
      noValidate
    >
      {/* Hidden Honeypot field (must remain empty for human visitors) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="hp_website">Website</label>
        <input
          id="hp_website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {generalError && (
        <div
          role="alert"
          className="p-3.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-800"
        >
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="c_fullName" className="block text-sm font-semibold text-slate-800 mb-1.5">
            الاسم الكامل <span className="text-red-600">*</span>
          </label>
          <input
            id="c_fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: م. خالد العتيبي"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20"
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.fullName[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="c_phone" className="block text-sm font-semibold text-slate-800 mb-1.5">
            رقم الهاتف / الواتساب <span className="text-red-600">*</span>
          </label>
          <input
            id="c_phone"
            type="tel"
            dir="ltr"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+966 5X XXX XXXX"
            className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-right bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20"
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.phone[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="c_email" className="block text-sm font-semibold text-slate-800 mb-1.5">
            البريد الإلكتروني (اختياري)
          </label>
          <input
            id="c_email"
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.sa"
            className="w-full px-3.5 py-2.5 text-sm font-mono text-right bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="c_subject" className="block text-sm font-semibold text-slate-800 mb-1.5">
            نوع المشروع أو الخدمة (اختياري)
          </label>
          <input
            id="c_subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثال: عزل سطح تجاري أو خزان مياه"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20"
          />
          {fieldErrors.subject && (
            <p className="mt-1 text-xs text-red-700">{fieldErrors.subject[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="c_message" className="block text-sm font-semibold text-slate-800 mb-1.5">
          تفاصيل الطلب أو الموقع <span className="text-red-600">*</span>
        </label>
        <textarea
          id="c_message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اذكر المساحة التقريبية، المدينة، ونوع العزل المطلوب أو مشكلة التسرب..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 resize-y"
        />
        {fieldErrors.message && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 rounded-md transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب المعاينة'}</span>
      </button>
    </form>
  );
}
