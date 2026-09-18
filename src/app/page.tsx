import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Project } from '@/types/database';
import { LandingClientView } from '@/components/landing/LandingClientView';

export const revalidate = 60; // ISR cache revalidation

export default async function LandingPage() {
  let featuredProjects: Project[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .select('*, project_roles(*), project_skills(skills(*))')
      .eq('visibility', 'public')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      featuredProjects = data as unknown as Project[];
    }
  } catch {
    featuredProjects = [];
  }

  return <LandingClientView featuredProjects={featuredProjects} />;
}
