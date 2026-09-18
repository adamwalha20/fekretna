'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Check,
  X,
  MessageSquare,
  Send,
  UserCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';
import { ConnectionRequest, Profile } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';
import confetti from 'canvas-confetti';

type ConnectionTab = 'received' | 'active' | 'sent';

export default function ConnectionsPage() {
  const router = useRouter();
  const { t, isRtl } = useI18n();
  const [tab, setTab] = useState<ConnectionTab>('received');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [receivedRequests, setReceivedRequests] = useState<
    (ConnectionRequest & { sender: Profile })[]
  >([]);
  const [sentRequests, setSentRequests] = useState<
    (ConnectionRequest & { receiver: Profile })[]
  >([]);
  const [activeConnections, setActiveConnections] = useState<
    { profile: Profile; conversationId?: string }[]
  >([]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadConnections = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // 1. Fetch received pending requests
      const { data: received } = await supabase
        .from('connection_requests')
        .select('*, sender:profiles!connection_requests_sender_id_fkey(*)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (received) setReceivedRequests(received as unknown as typeof receivedRequests);

      // 2. Fetch sent pending requests
      const { data: sent } = await supabase
        .from('connection_requests')
        .select('*, receiver:profiles!connection_requests_receiver_id_fkey(*)')
        .eq('sender_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (sent) setSentRequests(sent as unknown as typeof sentRequests);

      // 3. Fetch active connections (accepted in either direction)
      const { data: accepted } = await supabase
        .from('connection_requests')
        .select('*, sender:profiles!connection_requests_sender_id_fkey(*), receiver:profiles!connection_requests_receiver_id_fkey(*)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (accepted) {
        const partners: { profile: Profile }[] = [];
        accepted.forEach((req) => {
          const partnerProfile = req.sender_id === user.id ? req.receiver : req.sender;
          if (partnerProfile && !partners.some((p) => p.profile.id === partnerProfile.id)) {
            partners.push({ profile: partnerProfile });
          }
        });
        setActiveConnections(partners);
      }
    } catch (err) {
      console.error('Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleAccept = async (requestId: string, senderId: string, senderName: string) => {
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateErr) throw updateErr;

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();

      if (newConv && currentUserId) {
        await supabase.from('conversation_members').insert([
          { conversation_id: newConv.id, user_id: currentUserId },
          { conversation_id: newConv.id, user_id: senderId },
        ]);
      }

      await supabase.from('notifications').insert({
        user_id: senderId,
        type: 'connection_accepted',
        title: 'Demande de connexion acceptée ! 🎉',
        body: `Votre demande de connexion a été acceptée. Vous pouvez maintenant échanger des messages.`,
        related_entity_id: requestId,
      });

      try {
        confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
      } catch {
        // fallback
      }

      showToast(`Connexion acceptée avec ${senderName} !`);
      loadConnections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('Demande refusée.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('Demande annulée.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleStartMessage = async (partnerId: string) => {
    const supabase = createClient();
    try {
      const { data: myConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      const convIds = myConvs?.map((c) => c.conversation_id) || [];
      if (convIds.length > 0) {
        const { data: shared } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('user_id', partnerId)
          .limit(1)
          .maybeSingle();

        if (shared) {
          router.push(`/app/messages/${shared.conversation_id}`);
          return;
        }
      }

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();

      if (newConv && currentUserId) {
        await supabase.from('conversation_members').insert([
          { conversation_id: newConv.id, user_id: currentUserId },
          { conversation_id: newConv.id, user_id: partnerId },
        ]);
        router.push(`/app/messages/${newConv.id}`);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      router.push('/app/messages');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-3 shadow-2xl flex items-center gap-2 text-sm font-semibold border border-cyan-400/40 animate-bounce">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('connections.title') || 'Réseau & Connexions'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('connections.subtitle') || 'Gérez votre réseau de cofondateurs et vos demandes de mise en relation'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-6 text-sm font-semibold">
        <button
          onClick={() => setTab('received')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            tab === 'received'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4 text-cyan-400" />
          <span>{t('connections.receivedRequests') || 'Demandes reçues'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setTab('active')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            tab === 'active'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="h-4 w-4 text-emerald-400" />
          <span>{t('connections.activeConnections') || 'Connexions actives'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
            {activeConnections.length}
          </span>
        </button>

        <button
          onClick={() => setTab('sent')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            tab === 'sent'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="h-4 w-4 text-indigo-400" />
          <span>{t('connections.sentRequests') || 'Demandes envoyées'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300">
            {sentRequests.length}
          </span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      )}

      {/* TAB 1: RECEIVED REQUESTS */}
      {!loading && tab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length > 0 ? (
            <div className="space-y-3">
              {receivedRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-5 shadow-xl space-y-3 backdrop-blur-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {req.sender?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={req.sender.avatar_url}
                          alt={req.sender.display_name}
                          className="h-12 w-12 rounded-2xl object-cover border border-cyan-500/30"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-lg">
                          {req.sender?.display_name?.charAt(0) || 'U'}
                        </div>
                      )}

                      <div>
                        <Link
                          href={`/app/profile/${req.sender_id}`}
                          className="text-base font-bold text-white hover:text-cyan-300 transition"
                        >
                          {req.sender?.display_name}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {req.sender?.city} • {req.sender?.university || 'Étudiant / Entrepreneur'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(req.id)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <X className="h-3.5 w-3.5" />
                        {t('connections.reject') || 'Refuser'}
                      </button>

                      <button
                        onClick={() =>
                          handleAccept(req.id, req.sender_id, req.sender?.display_name || '')
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl shadow-md shadow-cyan-500/20 transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {t('connections.accept') || 'Accepter'}
                      </button>
                    </div>
                  </div>

                  {/* Introductory Message */}
                  {req.message && (
                    <div className="rounded-2xl bg-[#080e1e] p-3 text-xs text-slate-300 border border-slate-800 italic">
                      &ldquo;{req.message}&rdquo;
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500">
                    Reçue le {formatDate(req.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title={t('connections.emptyReceivedTitle') || 'Aucune demande de connexion en attente'}
              description={t('connections.emptyReceivedDesc') || 'Lorsque d’autres étudiants ou entrepreneurs souhaiteront se connecter avec vous, leurs demandes apparaîtront ici.'}
              actionText={t('navigation.discover') || 'Découvrir des profils'}
              actionHref="/app/discover"
            />
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE CONNECTIONS */}
      {!loading && tab === 'active' && (
        <div className="space-y-4">
          {activeConnections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeConnections.map((conn) => (
                <div
                  key={conn.profile.id}
                  className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-5 shadow-xl flex flex-col justify-between backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {conn.profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conn.profile.avatar_url}
                        alt={conn.profile.display_name}
                        className="h-12 w-12 rounded-2xl object-cover border border-cyan-500/30"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold">
                        {conn.profile.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        href={`/app/profile/${conn.profile.id}`}
                        className="text-sm font-bold text-white hover:text-cyan-300 transition truncate block"
                      >
                        {conn.profile.display_name}
                      </Link>
                      <p className="text-xs text-slate-400 truncate">{conn.profile.city}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <Link
                      href={`/app/profile/${conn.profile.id}`}
                      className="text-xs text-slate-400 hover:text-white font-medium"
                    >
                      {t('discovery.viewProfile') || 'Voir profil'}
                    </Link>

                    <button
                      onClick={() => handleStartMessage(conn.profile.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-md transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t('messages.chat') || 'Discuter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UserCheck}
              title={t('connections.emptyActiveTitle') || 'Aucune connexion active pour le moment'}
              description={t('connections.emptyActiveDesc') || 'Explorez les profils sur la page Découvrir et envoyez vos premières demandes de connexion.'}
              actionText={t('discovery.findPartners') || 'Trouver des partenaires'}
              actionHref="/app/discover"
            />
          )}
        </div>
      )}

      {/* TAB 3: SENT REQUESTS */}
      {!loading && tab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length > 0 ? (
            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-3xl border border-slate-800/90 bg-[#0c1322]/90 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700">
                      {req.receiver?.display_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <Link
                        href={`/app/profile/${req.receiver_id}`}
                        className="text-sm font-bold text-white hover:text-cyan-300 transition"
                      >
                        {req.receiver?.display_name}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {req.receiver?.city} • Envoyée le {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(req.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition self-end sm:self-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t('connections.cancel') || 'Annuler'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title={t('connections.emptySentTitle') || 'Aucune demande envoyée en attente'}
              description={t('connections.emptySentDesc') || 'Vous n’avez pas de demande de connexion en cours d’attente.'}
              actionText={t('navigation.discover') || 'Explorer les membres'}
              actionHref="/app/discover"
            />
          )}
        </div>
      )}
    </div>
  );
}
