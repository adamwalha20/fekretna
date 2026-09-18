'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  X, 
  Sparkles, 
  User, 
  Trash2 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ProjectComment } from '@/types/database';
import { formatRelativeTime } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface ReelsCommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  ownerId: string;
  currentUserId?: string | null;
  currentUserName?: string;
  currentUserAvatar?: string | null;
  onCommentAdded?: (newCount: number) => void;
}

export function ReelsCommentsPanel({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  ownerId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onCommentAdded,
}: ReelsCommentsPanelProps) {
  const { t, isRtl } = useI18n();
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when opened or projectId changes
  useEffect(() => {
    if (!isOpen || !projectId) return;

    let mounted = true;
    async function loadComments() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchErr } = await supabase
          .from('project_comments')
          .select(`
            id,
            project_id,
            user_id,
            content,
            created_at,
            updated_at,
            author:profiles!project_comments_user_id_fkey(
              id,
              display_name,
              avatar_url,
              city,
              university
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (fetchErr) throw fetchErr;
        if (mounted && data) {
          setComments(data as unknown as ProjectComment[]);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadComments();
    return () => {
      mounted = false;
    };
  }, [isOpen, projectId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;
    if (!currentUserId) {
      setError(t('errors.unauthorized') || 'Veuillez vous connecter pour commenter.');
      return;
    }

    const content = newCommentText.trim();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: insertErr } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: currentUserId,
          content,
        })
        .select(`
          id,
          project_id,
          user_id,
          content,
          created_at,
          updated_at,
          author:profiles!project_comments_user_id_fkey(
            id,
            display_name,
            avatar_url,
            city,
            university
          )
        `)
        .single();

      if (insertErr) throw insertErr;

      // Notify project owner if someone else comments
      if (ownerId && ownerId !== currentUserId) {
        await supabase.from('notifications').insert({
          user_id: ownerId,
          type: 'project_comment',
          title: 'Nouveau commentaire sur votre projet',
          body: `${currentUserName || 'Un membre'} a commenté "${projectTitle}": "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
          related_entity_id: projectId,
        });
      }

      const updatedComments = [...comments, data as unknown as ProjectComment];
      setComments(updatedComments);
      setNewCommentText('');
      if (onCommentAdded) {
        onCommentAdded(updatedComments.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const supabase = createClient();
      const { error: delErr } = await supabase
        .from('project_comments')
        .delete()
        .eq('id', commentId);

      if (delErr) throw delErr;

      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      if (onCommentAdded) {
        onCommentAdded(updated.length);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de suppression');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-end bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose} 
      />

      {/* Drawer / Bottom Sheet Container */}
      <div className="w-full md:w-[420px] max-h-[85vh] md:h-[88vh] flex flex-col rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0b101e] shadow-2xl shadow-slate-900/10 dark:shadow-cyan-950/30 md:m-4 text-slate-900 dark:text-white overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-5 py-4 bg-slate-50/90 dark:bg-[#080d19]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('reels.comments') || 'Commentaires'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300">
                  {comments.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {projectTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-800/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="text-xs">Chargement des idées...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                {t('reels.noComments') || 'Aucun commentaire pour le moment.'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                {t('reels.noCommentsSub') ||
                  'Soyez le premier à partager une idée ou une suggestion constructive !'}
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = comment.user_id === ownerId;
              const isAuthor = comment.user_id === currentUserId;
              const authorProfile = comment.author;

              return (
                <div key={comment.id} className="pt-3 first:pt-0 group flex items-start gap-3">
                  {/* Avatar */}
                  <Link
                    href={`/app/profile/${comment.user_id}`}
                    className="shrink-0 block"
                    onClick={onClose}
                  >
                    {authorProfile?.avatar_url ? (
                      <img
                        src={authorProfile.avatar_url}
                        alt={authorProfile.display_name || 'Utilisateur'}
                        className="h-8 w-8 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
                        {(authorProfile?.display_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </Link>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/app/profile/${comment.user_id}`}
                          onClick={onClose}
                          className="text-xs font-bold text-white hover:text-cyan-300 transition truncate"
                        >
                          {authorProfile?.display_name || 'Membre Fekretna'}
                        </Link>
                        {isOwner && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                            Fondateur
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                        {isAuthor && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Supprimer mon commentaire"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input Footer */}
        <form onSubmit={handlePostComment} className="border-t border-slate-200 dark:border-slate-800/90 p-3 bg-slate-50/90 dark:bg-[#080d19]/90">
          {error && (
            <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-xl mb-2 border border-rose-200 dark:border-rose-500/30">
              {error}
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={t('reels.commentPlaceholder') || 'Partagez une idée ou un retour constructif...'}
              maxLength={400}
              className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050811] px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="inline-flex items-center justify-center h-9 w-9 rounded-2xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 transition disabled:opacity-40 shrink-0 shadow-md shadow-cyan-500/20"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center px-1 pt-1.5 text-[10px] text-slate-500">
            <span>Privilégiez les retours bienveillants et constructifs</span>
            <span>{newCommentText.length}/400</span>
          </div>
        </form>
      </div>
    </div>
  );
}
