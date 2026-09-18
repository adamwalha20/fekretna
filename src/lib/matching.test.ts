import { describe, it, expect } from 'vitest';
import { calculateMatchScore, rankCandidates } from './matching';
import { Profile, Skill, Interest } from '@/types/database';

describe('Deterministic Matching Engine', () => {
  const baseUser: Profile & { skills: Skill[]; interests: Interest[] } = {
    id: 'user-tech',
    display_name: 'Ahmed Tech',
    username: 'ahmed_tech',
    avatar_url: null,
    bio: 'Software engineer building web apps',
    city: 'Sfax',
    university: 'ENIS (École Nationale d’Ingénieurs de Sfax)',
    experience_level: 'Intermediate',
    collaboration_goals: ['I have an idea and need a team'],
    availability: 'Part-time',
    collaboration_format: 'Hybrid',
    discoverable: true,
    profile_visibility: 'public',
    is_interested_in_business: 'Yes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: [
      { id: '1', name: 'Web development', category: 'Technology', created_at: '' },
      { id: '2', name: 'Python', category: 'Technology', created_at: '' },
    ],
    interests: [
      { id: '1', name: 'AI & Machine Learning', category: 'Tech', created_at: '' },
      { id: '2', name: 'SaaS', category: 'Tech', created_at: '' },
    ],
  };

  const businessCandidate: Profile & { skills: Skill[]; interests: Interest[] } = {
    id: 'user-biz',
    display_name: 'Sarra Business',
    username: 'sarra_biz',
    avatar_url: null,
    bio: 'Marketing and growth specialist',
    city: 'Sfax',
    university: 'FSEG Sfax',
    experience_level: 'Experienced',
    collaboration_goals: ['I want to join a project'],
    availability: 'Part-time',
    collaboration_format: 'Hybrid',
    discoverable: true,
    profile_visibility: 'public',
    is_interested_in_business: 'Yes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: [
      { id: '3', name: 'Marketing', category: 'Business', created_at: '' },
      { id: '4', name: 'Sales', category: 'Business', created_at: '' },
    ],
    interests: [
      { id: '1', name: 'AI & Machine Learning', category: 'Tech', created_at: '' },
    ],
  };

  const unrelatedCandidate: Profile & { skills: Skill[]; interests: Interest[] } = {
    id: 'user-unrelated',
    display_name: 'Farouk Solo',
    username: 'farouk_solo',
    avatar_url: null,
    bio: 'Casual hobbies',
    city: 'Bizerte',
    university: null,
    experience_level: 'Beginner',
    collaboration_goals: ['I want to explore business ideas'],
    availability: 'Few hours per week',
    collaboration_format: 'In person',
    discoverable: true,
    profile_visibility: 'public',
    is_interested_in_business: 'Maybe',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: [],
    interests: [],
  };

  it('calculates higher score for complementary Tech + Business pair in same city', () => {
    const bizScore = calculateMatchScore(baseUser, businessCandidate);
    const unrelatedScore = calculateMatchScore(baseUser, unrelatedCandidate);

    expect(bizScore).toBeGreaterThan(unrelatedScore);
    // Complementary skills (20) + shared interests (5) + goals match (20) + city Sfax (15) + format (10) + availability (10) = 80
    expect(bizScore).toBeGreaterThanOrEqual(70);
  });

  it('correctly ranks candidates in descending match score', () => {
    const ranked = rankCandidates(baseUser, [unrelatedCandidate, businessCandidate]);
    expect(ranked[0].id).toBe(businessCandidate.id);
    expect(ranked[1].id).toBe(unrelatedCandidate.id);
  });
});
