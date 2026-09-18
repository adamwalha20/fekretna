'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  UserPlus,
  Sparkles,
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';
import { Notification } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

export default function NotificationsPage() {
  const { t, isRtl } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data as Notification[]);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'connection_request':
        return <UserPlus className="h-4 w-4 text-cyan-400" />;
      case 'connection_accepted':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      case 'project_application':
        return <Send className="h-4 w-4 text-indigo-400" />;
      case 'application_accepted':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'application_rejected':
        return <XCircle className="h-4 w-4 text-rose-400" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4 text-teal-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTargetHref = (notif: Notification) => {
    if (notif.type === 'connection_request' || notif.type === 'connection_accepted') {
      return '/app/connections';
    }
    if (notif.type === 'project_application' && notif.related_entity_id) {
      return `/app/projects/${notif.related_entity_id}`;
    }
    if (notif.type === 'application_accepted' || notif.type === 'application_rejected') {
      return '/app/projects';
    }
    if (notif.type === 'new_message' && notif.related_entity_id) {
      return `/app/messages/${notif.related_entity_id}`;
    }
    return '/app/discover';
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('notifications.title') || 'Notifications'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('notifications.subtitle') || 'Restez informé de l’activité sur vos projets et demandes'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-xl transition"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>{t('notifications.markAllRead') || 'Tout marquer comme lu'}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={getTargetHref(notif)}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition block backdrop-blur-xl ${
                !notif.read_at
                  ? 'border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-950/60 shadow-lg shadow-cyan-950/20'
                  : 'border-slate-800/90 bg-[#0c1322]/90 hover:bg-[#0f172a]'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#080e1e] border border-slate-800 shadow-xs shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      !notif.read_at ? 'text-white font-bold' : 'text-slate-300'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {notif.body}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={t('notifications.emptyTitle') || 'Aucune notification'}
          description={t('notifications.emptyDesc') || 'Vous êtes à jour ! Vos notifications apparaîtront ici dès que vous aurez des interactions.'}
        />
      )}
    </div>
  );
}
