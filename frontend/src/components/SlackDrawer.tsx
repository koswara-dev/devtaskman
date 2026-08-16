import React, { useState } from 'react';
import { useDevTask } from '../context/DevTaskContext';
import { X, MessageSquare, Terminal, Clock, ShieldCheck, CheckCheck } from 'lucide-react';

interface SlackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlackDrawer: React.FC<SlackDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsRead } = useDevTask();
  const [activeTab, setActiveTab] = useState<'slack' | 'system'>('slack');

  const hasUnread = notifications.some(n => !n.read);

  const filteredNotifications = notifications.filter(n => n.type === activeTab);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#4a154b] p-1.5 rounded text-white font-black text-sm">#</div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Slack & System Logs</h3>
            <span className="text-[10px] text-slate-500">Notifikasi API & Audit Trail</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => markNotificationsRead()}
            disabled={!hasUnread}
            title="Tandai Semua Dibaca"
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-default rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('slack')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'slack'
              ? 'border-b-2 border-[#e01e5a] text-slate-800 bg-slate-100/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Slack Webhooks
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'system'
              ? 'border-b-2 border-brand-500 text-slate-800 bg-slate-100/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          System Audit Logs
        </button>
      </div>

      {/* Info Badge */}
      <div className="p-3 bg-brand-50/50 border-b border-slate-200 text-[10px] text-slate-600 leading-normal flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
        <span>
          {activeTab === 'slack'
            ? 'Mensimulasikan pesan API Slack (FR-005) saat developer melakukan handover ke QA (Ready for QA) atau saat QA menemukan bug (Rework).'
            : 'Mencatat riwayat aktivitas database internal, perubahan status tugas (Kanban), serta otentikasi peran pengguna.'}
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
            <Clock className="w-10 h-10 mb-2 opacity-30 text-slate-300" />
            <p className="text-xs">Belum ada riwayat aktivitas log</p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                activeTab === 'slack'
                  ? 'bg-[#4a154b]/5 border-[#4a154b]/15'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Slack Header */}
              {activeTab === 'slack' && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 bg-[#e01e5a] rounded-sm flex items-center justify-center text-[9px] text-white font-bold">S</div>
                  <span className="font-extrabold text-slate-700">Slack Webhook API</span>
                  <span className="text-[9px] text-slate-500 font-normal ml-auto">{formatTime(notif.timestamp)}</span>
                </div>
              )}

              {/* System Header */}
              {activeTab === 'system' && (
                <div className="flex items-center gap-2 mb-1.5 text-brand-600">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="font-bold text-slate-700">Audit Engine</span>
                  <span className="text-[9px] text-slate-500 font-normal ml-auto">{formatTime(notif.timestamp)}</span>
                </div>
              )}

              {/* Message Content */}
              <p className="text-slate-600 font-medium m-0 whitespace-pre-line leading-normal">
                {notif.message}
              </p>

              {/* Task Link */}
              {notif.taskId && notif.taskId !== 'ADMIN' && notif.taskId !== 'DELETE' && (
                <div className="mt-2 text-[10px] text-brand-600 font-semibold uppercase tracking-wider">
                  Tiket Ref: {notif.taskId}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 text-center bg-slate-50">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">DevTaskMan Mock System</span>
      </div>
    </div>
  );
};
