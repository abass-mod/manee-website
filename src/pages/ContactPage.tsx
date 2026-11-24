import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { PublicSiteSettings } from '../types/api';
import { ContactFormCard } from '../components/ContactFormCard';

interface ContactPageProps {
  settings: PublicSiteSettings | null;
}

export function ContactPage({ settings }: ContactPageProps) {
  const cleanWhatsappDigits = settings?.whatsAppNumber?.replace(/[^\d]/g, '') || '';

  return (
    <div className="bg-[#F4F5F6] min-h-[80vh]">
      <section className="bg-[#0E1116] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-3">
          <p className="text-xs font-semibold text-[#F59E0B]">تواصل مباشر مع الفريق الهندسي</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">اطلب معاينة أو عرض سعر</h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            أرسل تفاصيل مشروعك أو مشكلة التسرب وسنقوم بدراسة الحالة والتواصل معك لتحديد موعد الفحص الميداني.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {settings?.phone && (
              <div className="p-5 flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">رقم الهاتف المباشر</div>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    dir="ltr"
                    className="inline-block text-base font-bold font-mono tabular-nums text-slate-900 hover:text-[#B45309]"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>
            )}

            {cleanWhatsappDigits && (
              <div className="p-5 flex items-start gap-4">
                <MessageCircle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">محادثة واتساب سريعة</div>
                  <a
                    href={`https://wa.me/${cleanWhatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="inline-block text-base font-bold font-mono tabular-nums text-slate-900 hover:text-[#B45309]"
                  >
                    {settings?.whatsAppNumber}
                  </a>
                </div>
              </div>
            )}

            {settings?.email && (
              <div className="p-5 flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">البريد الإلكتروني</div>
                  <a
                    href={`mailto:${settings.email}`}
                    dir="ltr"
                    className="inline-block text-sm font-semibold font-mono text-slate-900 hover:text-[#B45309]"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            )}

            {settings?.address && (
              <div className="p-5 flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">العنوان</div>
                  <p className="text-sm font-medium text-slate-900">{settings.address}</p>
                </div>
              </div>
            )}

            {settings?.workingHours && (
              <div className="p-5 flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">ساعات العمل</div>
                  <p className="text-sm font-medium text-slate-900">{settings.workingHours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactFormCard />
        </div>
      </div>
    </div>
  );
}
