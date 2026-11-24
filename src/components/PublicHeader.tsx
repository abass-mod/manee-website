import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface PublicHeaderProps {
  siteName: string;
  currentPath: string;
  navigate: (path: string) => void;
}

export function PublicHeader({ siteName, currentPath, navigate }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'الرئيسية', path: '/' },
    { label: 'خدماتنا', path: '/#services' },
    { label: 'معرض الأعمال', path: '/projects' },
    { label: 'تواصل معنا', path: '/contact' },
    { label: 'لوحة التحكم', path: '/admin' },
  ];

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    if (path === '/#services') {
      if (currentPath !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E1116]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single clean wordmark */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D97706]"
        >
          {siteName || 'MANEE | مَنيع'}
        </button>

        {/* Zone 2: Clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? currentPath === '/'
                : item.path !== '/#services' && currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item.path)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-white border-[#D97706]'
                    : 'border-transparent hover:text-white hover:border-white/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]"
          >
            اطلب معاينة
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="القائمة الرئيسية"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-200 hover:text-white rounded-md border border-white/15 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0E1116] border-t border-white/10 px-6 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className="block w-full text-right py-2.5 text-sm font-medium text-slate-200 hover:text-white border-b border-white/5 last:border-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              navigate('/contact');
            }}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-md cursor-pointer"
          >
            اطلب معاينة
          </button>
        </div>
      )}
    </header>
  );
}
