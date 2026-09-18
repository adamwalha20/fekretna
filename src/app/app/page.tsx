import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Profile, Project, Skill, Interest, ConnectionRequest } from '@/types/database';
import { rankCandidates, getMatchBreakdown } from '@/lib/matching';
import { DashboardClientView } from '@/components/dashboard/DashboardClientView';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Dynamic data for user dashboard

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch current user profile with skills and interests
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*, profile_skills(skills(*)), profile_interests(interests(*))')
    .eq('id', user.id)
    .maybeSingle();

  // If onboarding not completed, redirect to onboarding
  if (!currentProfile?.onboarding_completed) {
    redirect('/app/onboarding');
  }

  // Format current profile
  const userSkills: Skill[] = (currentProfile?.profile_skills || [])
    // @ts-expect-error PostgREST nested types
    .map((ps) => ps.skills)
    .filter(Boolean);
  const userInterests: Interest[] = (currentProfile?.profile_interests || [])
    // @ts-expect-error PostgREST nested types
    .map((pi) => pi.interests)
    .filter(Boolean);

  const fullCurrentProfile = {
    ...currentProfile,
    skills: userSkills,
    interests: userInterests,
  } as Profile & { skills: Skill[]; interests: Interest[] };

  // 2. Fetch pending incoming connection requests
  const { data: pendingRequests } = await supabase
    .from('connection_requests')
    .select('*, sender:profiles!connection_requests_sender_id_fkey(*)')
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. Count total active connections
  const { count: activeConnectionsCount } = await supabase
    .from('connection_requests')
    .select('id', { count: 'exact', head: true })
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'accepted');

  // 4. Fetch your projects
  const { data: myProjects } = await supabase
    .from('projects')
    .select('*, project_roles(*), project_skills(skills(*))')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // 5. Fetch other public projects matching or active
  const { data: publicProjects } = await supabase
    .from('projects')
    .select('*, project_roles(*), project_skills(skills(*))')
    .neq('owner_id', user.id)
    .eq('visibility', 'public')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  // 6. Fetch candidate profiles for "People you may want to meet"
  const { data: candidateProfilesRaw } = await supabase
    .from('profiles')
    .select('*, profile_skills(skills(*)), profile_interests(interests(*))')
    .neq('id', user.id)
    .eq('is_profile_visible', true)
    .limit(20);

  const formattedCandidates = (candidateProfilesRaw || []).map((cp) => ({
    ...cp,
    // @ts-expect-error PostgREST nested types
    skills: (cp.profile_skills || []).map((ps) => ps.skills).filter(Boolean),
    // @ts-expect-error PostgREST nested types
    interests: (cp.profile_interests || []).map((pi) => pi.interests).filter(Boolean),
  })) as (Profile & { skills: Skill[]; interests: Interest[] })[];

  // Rank candidate profiles relative to current user using matching engine
  const rankedProfiles = rankCandidates(fullCurrentProfile, formattedCandidates).slice(0, 4);

  // Compute breakdown for each recommended profile
  const rankedWithBreakdown = rankedProfiles.map((candidate) => ({
    profile: candidate,
    breakdown: getMatchBreakdown(fullCurrentProfile, candidate),
  }));

  return (
    <DashboardClientView
      currentProfile={fullCurrentProfile}
      pendingRequests={(pendingRequests as unknown as (ConnectionRequest & { sender: Profile })[]) || []}
      activeConnectionsCount={activeConnectionsCount || 0}
      myProjects={(myProjects as unknown as Project[]) || []}
      publicProjects={(publicProjects as unknown as Project[]) || []}
      recommendedPeople={rankedWithBreakdown}
    />
  );
}
