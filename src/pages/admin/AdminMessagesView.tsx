import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Mail, Phone, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import {
  MESSAGE_STATUS_AR,
  NOTIFICATION_STATUS_AR,
  type ContactMessageItem,
  type MessageStatus,
  type PagedResult,
} from '../../types/api';

interface AdminMessagesViewProps {
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
  onUnreadChanged: () => void;
}

export function AdminMessagesView({ onNotify, onUnreadChanged }: AdminMessagesViewProps) {
  const [statusFilter, setStatusFilter] = useState<MessageStatus | ''>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PagedResult<ContactMessageItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessageItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMessages({ page, pageSize: 15, status: statusFilter });
      setData(res);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذّر تحميل الرسائل.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, [page, statusFilter]);

  const openMessage = async (id: number) => {
    setDeleteConfirm(false);
    try {
      // GET detail intentionally does NOT mutate status per SOP section 9.3
      const detail = await api.getAdminMessageById(id);
      setSelected(detail);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذّر فتح الرسالة.', 'error');
    }
  };

  const changeStatus = async (id: number, newStatus: MessageStatus) => {
    try {
      await api.updateMessageStatus(id, newStatus);
      onNotify(`تم تحديث حالة الرسالة إلى: ${MESSAGE_STATUS_AR[newStatus]}`);
      const refreshed = await api.getAdminMessageById(id);
      setSelected(refreshed);
      await loadMessages();
      onUnreadChanged();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذّر تحديث الحالة.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMessage(id);
      onNotify('تم حذف الرسالة نهائياً.');
      setSelected(null);
      setDeleteConfirm(false);
      await loadMessages();
      onUnreadChanged();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'تعذّر حذف الرسالة.', 'error');
    }
  };

  const filterTabs: Array<{ value: MessageStatus | ''; label: string }> = [
    { value: '', label: 'كل الرسائل' },
    { value: 'New', label: 'جديدة' },
    { value: 'Read', label: 'مقروءة' },
    { value: 'Handled', label: 'تمت المعالجة' },
  ];

  return (
    <div className="space-y-5">
      {/* Status Segmented Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          {filterTabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setStatusFilter(t.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === t.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {data && (
          <span className="text-xs font-mono tabular-nums text-slate-500">
            الإجمالي: {data.totalCount}
          </span>
        )}
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">جاري التحميل...</div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              لا توجد رسائل ضمن هذا التصنيف حالياً.
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {data.items.map((msg) => {
                  const isActive = selected?.id === msg.id;
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => openMessage(msg.id)}
                      className={`w-full text-right p-4 transition-colors cursor-pointer block ${
                        isActive ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {msg.fullName}
                        </span>
                        <span
                          className={`text-[11px] font-semibold shrink-0 ${
                            msg.status === 'New'
                              ? 'text-[#B45309]'
                              : msg.status === 'Handled'
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                          }`}
                        >
                          {MESSAGE_STATUS_AR[msg.status]}
                        </span>
                      </div>
                      {msg.subject && (
                        <div className="text-xs font-medium text-slate-700 truncate mb-1">
                          {msg.subject}
                        </div>
                      )}
                      <p className="text-xs text-slate-500 line-clamp-2">{msg.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                        <span dir="ltr">{msg.phone}</span>
                        <span>{new Date(msg.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {data.totalPages > 1 && (
                <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-300 rounded disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>السابق</span>
                  </button>
                  <span className="font-mono tabular-nums text-slate-600">
                    {data.page} / {data.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-300 rounded disabled:opacity-40 cursor-pointer"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Pane */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6">
          {!selected ? (
            <div className="py-16 text-center text-sm text-slate-500">
              اختر رسالة من القائمة لعرض تفاصيلها وتحديث حالتها.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">{selected.fullName}</h3>
                  {selected.subject && (
                    <p className="text-sm font-medium text-slate-700">{selected.subject}</p>
                  )}
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 pt-1">
                    <span>الحالة: {MESSAGE_STATUS_AR[selected.status]}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      إشعار البريد: {NOTIFICATION_STATUS_AR[selected.notificationStatus]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums" dir="ltr">
                      {new Date(selected.createdAt).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>

                {deleteConfirm ? (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDelete(selected.id)}
                      className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded cursor-pointer"
                    >
                      تأكيد الحذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              {/* Contact Info Strip */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#B45309]" />
                  <a
                    href={`tel:${selected.phone.replace(/\s+/g, '')}`}
                    dir="ltr"
                    className="font-mono tabular-nums font-semibold hover:text-[#B45309]"
                  >
                    {selected.phone}
                  </a>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#B45309]" />
                    <a
                      href={`mailto:${selected.email}`}
                      dir="ltr"
                      className="font-mono hover:text-[#B45309]"
                    >
                      {selected.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500">محتوى الرسالة</div>
                <div className="text-sm text-slate-800 leading-[1.85] whitespace-pre-wrap bg-white border border-slate-200 rounded-md p-4">
                  {selected.message}
                </div>
              </div>

              {/* Explicit Status Transition Controls */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-semibold text-slate-500">تغيير حالة المعالجة</div>
                <div className="flex flex-wrap items-center gap-2">
                  {(['New', 'Read', 'Handled'] as MessageStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => changeStatus(selected.id, st)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        selected.status === st
                          ? 'bg-[#0E1116] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {selected.status === st && <Check className="w-3.5 h-3.5" />}
                      <span>{MESSAGE_STATUS_AR[st]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
