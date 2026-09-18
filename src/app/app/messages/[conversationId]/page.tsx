'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Loader2,
  ShieldAlert,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Message, Profile } from '@/types/database';
import { formatTime } from '@/lib/utils';
import { ReportModal } from '@/components/modals/ReportModal';
import { ReportReason } from '@/types/database';
import { useI18n } from '@/lib/i18n/context';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ActiveConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = use(params);
  const router = useRouter();
  const { t, isRtl } = useI18n();

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const supabase = createClient();

    async function init() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        // 1. Verify user is in this conversation
        const { data: memberCheck } = await supabase
          .from('conversation_members')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!memberCheck) {
          router.push('/app/messages');
          return;
        }

        // 2. Fetch partner profile
        const { data: partnerMember } = await supabase
          .from('conversation_members')
          .select('user:profiles!conversation_members_user_id_fkey(*)')
          .eq('conversation_id', conversationId)
          .neq('user_id', user.id)
          .maybeSingle();

        if (partnerMember) {
          setPartner(partnerMember.user as unknown as Profile);
        }

        // 3. Fetch past messages
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs);
        }

        // 4. Set up Supabase Realtime subscription
        channel = supabase
          .channel(`conversation:${conversationId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              const newMsg = payload.new as Message;
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              scrollToBottom();
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error initializing conversation:', err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    }

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUserId || sending) return;

    const body = inputText.trim();
    setInputText('');
    setSending(true);

    const supabase = createClient();
    try {
      const { data: sentMsg, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          body,
        })
        .select()
        .single();

      if (error) throw error;

      if (sentMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
        scrollToBottom();
      }

      if (partner?.id) {
        await supabase.from('notifications').insert({
          user_id: partner.id,
          type: 'new_message',
          title: 'Nouveau message reçu',
          body: `Vous avez reçu un nouveau message sur Fekretna.`,
          related_entity_id: conversationId,
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Impossible d’envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const handleReport = async (reason: ReportReason, description: string) => {
    if (!currentUserId || !partner) return;
    const supabase = createClient();
    const { error } = await supabase.from('reports').insert({
      reporter_id: currentUserId,
      reported_user_id: partner.id,
      reason,
      description,
      status: 'pending',
    });
    if (error) throw error;
    alert('Signalement transmis à la modération.');
  };

  return (
    <div className="flex flex-col h-full bg-[#070a13] text-slate-100">
      {/* Top Conversation Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-[#090e1c]/95 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/app/messages"
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5 rtl-flip" />
          </Link>

          {partner?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partner.avatar_url}
              alt={partner.display_name}
              className="h-10 w-10 rounded-2xl object-cover border border-cyan-500/40"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-sm">
              {partner?.display_name?.charAt(0) || 'P'}
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-white">
              {partner?.display_name || 'Partenaire'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {partner?.city || 'Tunisie'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {partner?.id && (
            <Link
              href={`/app/profile/${partner.id}`}
              className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-slate-800/80 transition"
              title="Voir profil"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition"
            title="Signaler la conversation"
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border border-cyan-400/30'
                      : 'bg-[#0c1322] text-slate-100 border border-slate-800/90'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.body}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-xs text-slate-500">
            {t('messages.noMessagesYet') || 'Aucun message dans cette conversation. Engagez l’échange pour débuter votre collaboration !'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#090e1c] border-t border-slate-800/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('messages.inputPlaceholder') || 'Écrivez votre message...'}
          className="flex-1 rounded-xl border border-slate-800 bg-[#070a13] px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 transition shadow-md shadow-cyan-500/20 border border-cyan-400/30 disabled:opacity-50"
          aria-label="Envoyer"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 rtl-flip" />
          )}
        </button>
      </form>

      {/* Report Modal */}
      {partner && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="utilisateur"
          targetId={partner.id}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
}
