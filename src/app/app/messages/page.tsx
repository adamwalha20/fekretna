'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function MessagesPlaceholderPage() {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070a13] text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-4 shadow-xl shadow-cyan-950/40">
        <MessageSquare className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">
        {t('messages.yourConversations') || 'Vos conversations privées'}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
        {t('messages.emptySelect') || 'Sélectionnez une discussion dans la liste de gauche pour échanger avec vos partenaires.'}
      </p>
    </div>
  );
}
