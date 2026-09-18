'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setUsers(data as Profile[]);
      } catch (err) {
        console.error('Error loading admin users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Gestion des utilisateurs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Liste de l’ensemble des profils enregistrés sur Fekretna
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Membre</th>
                  <th className="px-5 py-3">Ville</th>
                  <th className="px-5 py-3">Université / Parcours</th>
                  <th className="px-5 py-3">Niveau</th>
                  <th className="px-5 py-3">Visibilité</th>
                  <th className="px-5 py-3">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">
                        {user.display_name.charAt(0)}
                      </div>
                      <span>{user.display_name}</span>
                    </td>
                    <td className="px-5 py-3.5">{user.city}</td>
                    <td className="px-5 py-3.5 text-slate-400">{user.university || '—'}</td>
                    <td className="px-5 py-3.5">{user.experience_level || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.discoverable ? 'success' : 'secondary'} size="sm">
                        {user.discoverable ? 'Découvrable' : 'Masqué'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
