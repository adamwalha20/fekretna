'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Loader2, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Message } from '@/types/database';
import { formatTime } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface ConversationItem {
  id: string;
  partner: Profile;
  lastMessage?: Message;
  updatedAt: string;
}

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, isRtl } = useI18n();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadConversations = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get my conversation IDs
      const { data: myConvs } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id);

      const convIds = myConvs?.map((c) => c.conversation_id) || [];
      if (convIds.length === 0) {
        setConversations([]);
        return;
      }

      // 2. Get other members for these conversations
      const { data: partners } = await supabase
        .from('conversation_members')
        .select('conversation_id, user:profiles!conversation_members_user_id_fkey(*)')
        .in('conversation_id', convIds)
        .neq('user_id', user.id);

      // 3. Get last message for each conversation
      const items: ConversationItem[] = [];
      for (const convId of convIds) {
        const partnerEntry = partners?.find((p) => p.conversation_id === convId);
        const partnerProfile = (partnerEntry?.user as unknown as Profile) || {
          id: 'unknown',
          display_name: 'Partenaire Fekretna',
          avatar_url: null,
          city: 'Tunisie',
        };

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        items.push({
          id: convId,
          partner: partnerProfile,
          lastMessage: lastMsg || undefined,
          updatedAt: lastMsg?.created_at || new Date().toISOString(),
        });
      }

      items.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setConversations(items);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [pathname]);

  const filteredConversations = conversations.filter((c) =>
    c.partner.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const isInConversationView = pathname !== '/app/messages';

  return (
    <div className="h-[calc(100vh-8.5rem)] flex rounded-3xl border border-slate-800/80 bg-[#070a13] overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Left Sidebar: Conversations list */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800/80 bg-[#090e1c]/90 shrink-0 ${
          isInConversationView ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-slate-800/80">
          <h2 className="text-lg font-bold text-white mb-3">
            {t('messages.title') || 'Messages & Discussions'}
          </h2>
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('messages.searchPlaceholder') || 'Rechercher une conversation...'}
              className={`w-full rounded-xl border border-slate-800 bg-[#070a13] py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const active = pathname === `/app/messages/${conv.id}`;
              return (
                <Link
                  key={conv.id}
                  href={`/app/messages/${conv.id}`}
                  className={`flex items-center gap-3 p-4 hover:bg-slate-800/50 transition duration-150 ${
                    active ? 'bg-cyan-950/60 border-s-2 border-cyan-400 text-cyan-300' : ''
                  }`}
                >
                  {conv.partner.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conv.partner.avatar_url}
                      alt={conv.partner.display_name}
                      className="h-11 w-11 rounded-full object-cover border border-cyan-500/30"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-sm shrink-0">
                      {conv.partner.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {conv.partner.display_name}
                      </h4>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatTime(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.body || t('messages.newConversation') || 'Nouvelle conversation'}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              {t('messages.noConversations') || 'Aucune conversation trouvée.'}
            </div>
          )}
        </div>
      </div>

      {/* Right Content Panel */}
      <div
        className={`flex-1 flex flex-col bg-[#070a13] ${
          isInConversationView ? 'flex' : 'hidden md:flex'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
