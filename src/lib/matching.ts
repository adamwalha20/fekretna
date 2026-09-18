import { Profile, Skill, Interest } from '@/types/database';

export interface MatchingFactors {
  targetUser: Profile & { skills?: Skill[]; interests?: Interest[] };
  candidateUser: Profile & { skills?: Skill[]; interests?: Interest[] };
}

export interface MatchBreakdown {
  totalPercentage: number;
  skillsScore: number; // 0 - 100 %
  interestsScore: number; // 0 - 100 %
  goalsScore: number; // 0 - 100 %
  locationScore: number; // 0 - 100 %
  sharedInterests: string[];
  isLocalMatch: boolean;
}

/**
 * Deterministic Matching Engine for Fekretna
 * 
 * Scores compatibility between two profiles based on:
 * 1. Complementary skills (+30 points)
 * 2. Shared interests (+25 points)
 * 3. Shared collaboration goals (+20 points)
 * 4. Location preference (+15 points)
 * 5. Compatible collaboration format (+10 points)
 * 6. Compatible availability (+10 points)
 */
export function calculateMatchScore(
  userA: Profile & { skills?: Skill[]; interests?: Interest[] },
  userB: Profile & { skills?: Skill[]; interests?: Interest[] }
): number {
  let score = 0;

  // 1. Complementary Skills (Different skill categories encourage founding teams)
  const skillsA = userA.skills || [];
  const skillsB = userB.skills || [];

  const categoriesA = new Set(skillsA.map((s) => s.category));
  const categoriesB = new Set(skillsB.map((s) => s.category));

  const hasTechA = categoriesA.has('Technology');
  const hasBusinessA = categoriesA.has('Business');
  const hasCreativeA = categoriesA.has('Creative');

  const hasTechB = categoriesB.has('Technology');
  const hasBusinessB = categoriesB.has('Business');
  const hasCreativeB = categoriesB.has('Creative');

  // Tech + Business pairing
  if ((hasTechA && hasBusinessB) || (hasBusinessA && hasTechB)) {
    score += 20;
  }
  // Tech + Creative (Design) pairing
  if ((hasTechA && hasCreativeB) || (hasCreativeA && hasTechB)) {
    score += 15;
  }
  // Business + Creative pairing
  if ((hasBusinessA && hasCreativeB) || (hasCreativeA && hasBusinessB)) {
    score += 10;
  }

  // 2. Shared Interests
  const interestsA = new Set((userA.interests || []).map((i) => i.name.toLowerCase()));
  const interestsB = new Set((userB.interests || []).map((i) => i.name.toLowerCase()));
  let sharedInterestCount = 0;
  for (const name of interestsA) {
    if (interestsB.has(name)) {
      sharedInterestCount++;
    }
  }
  score += Math.min(sharedInterestCount * 5, 25);

  // 3. Complementary or Shared Collaboration Goals
  const goalsA = userA.collaboration_goals || [];
  const goalsB = userB.collaboration_goals || [];
  const hasIdeaA = goalsA.some((g) => g.toLowerCase().includes('idea'));
  const wantsToJoinB = goalsB.some((g) => g.toLowerCase().includes('join') || g.toLowerCase().includes('co-founder'));
  const hasIdeaB = goalsB.some((g) => g.toLowerCase().includes('idea'));
  const wantsToJoinA = goalsA.some((g) => g.toLowerCase().includes('join') || g.toLowerCase().includes('co-founder'));

  if ((hasIdeaA && wantsToJoinB) || (hasIdeaB && wantsToJoinA)) {
    score += 20;
  } else if (
    goalsA.some((g) => goalsB.includes(g))
  ) {
    score += 10;
  }

  // 4. Location Matching (Local focus e.g. Sfax)
  if (userA.city && userB.city && userA.city.toLowerCase() === userB.city.toLowerCase()) {
    score += 15;
  }

  // 5. Compatible Collaboration Format
  if (userA.collaboration_format && userB.collaboration_format) {
    if (userA.collaboration_format === userB.collaboration_format) {
      score += 10;
    } else if (
      userA.collaboration_format === 'Hybrid' ||
      userB.collaboration_format === 'Hybrid' ||
      userA.collaboration_format === 'Remote' ||
      userB.collaboration_format === 'Remote'
    ) {
      score += 5;
    }
  }

  // 6. Compatible Availability
  if (userA.availability && userB.availability) {
    if (userA.availability === userB.availability) {
      score += 10;
    } else if (userA.availability === 'Flexible' || userB.availability === 'Flexible') {
      score += 5;
    }
  }

  return score;
}

/**
 * Calculates a detailed compatibility breakdown based on real profile comparison factors.
 */
export function getMatchBreakdown(
  userA: Profile & { skills?: Skill[]; interests?: Interest[] },
  userB: Profile & { skills?: Skill[]; interests?: Interest[] }
): MatchBreakdown {
  const totalScore = calculateMatchScore(userA, userB);
  // Max possible score: ~100 points
  const totalPercentage = Math.min(100, Math.round((totalScore / 95) * 100));

  // Skills subscore
  const skillsA = userA.skills || [];
  const skillsB = userB.skills || [];
  const categoriesA = new Set(skillsA.map((s) => s.category));
  const categoriesB = new Set(skillsB.map((s) => s.category));
  let rawSkills = 0;
  if ((categoriesA.has('Technology') && categoriesB.has('Business')) || (categoriesA.has('Business') && categoriesB.has('Technology'))) {
    rawSkills += 20;
  }
  if ((categoriesA.has('Technology') && categoriesB.has('Creative')) || (categoriesA.has('Creative') && categoriesB.has('Technology'))) {
    rawSkills += 15;
  }
  if ((categoriesA.has('Business') && categoriesB.has('Creative')) || (categoriesA.has('Creative') && categoriesB.has('Business'))) {
    rawSkills += 10;
  }
  const skillsScore = Math.min(100, Math.round((rawSkills / 30) * 100));

  // Interests subscore
  const interestsA = new Set((userA.interests || []).map((i) => i.name.toLowerCase()));
  const shared: string[] = [];
  for (const item of (userB.interests || [])) {
    if (interestsA.has(item.name.toLowerCase())) {
      shared.push(item.name);
    }
  }
  const interestsScore = Math.min(100, Math.round((shared.length * 5 / 25) * 100));

  // Goals subscore
  const goalsA = userA.collaboration_goals || [];
  const goalsB = userB.collaboration_goals || [];
  const hasIdeaA = goalsA.some((g) => g.toLowerCase().includes('idea'));
  const wantsToJoinB = goalsB.some((g) => g.toLowerCase().includes('join') || g.toLowerCase().includes('co-founder'));
  const hasIdeaB = goalsB.some((g) => g.toLowerCase().includes('idea'));
  const wantsToJoinA = goalsA.some((g) => g.toLowerCase().includes('join') || g.toLowerCase().includes('co-founder'));
  let rawGoals = 0;
  if ((hasIdeaA && wantsToJoinB) || (hasIdeaB && wantsToJoinA)) {
    rawGoals = 20;
  } else if (goalsA.some((g) => goalsB.includes(g))) {
    rawGoals = 10;
  }
  const goalsScore = Math.min(100, Math.round((rawGoals / 20) * 100));

  // Location subscore
  const isLocalMatch = Boolean(userA.city && userB.city && userA.city.toLowerCase() === userB.city.toLowerCase());
  const locationScore = isLocalMatch ? 100 : (userA.collaboration_format === 'Remote' || userB.collaboration_format === 'Remote' ? 60 : 20);

  return {
    totalPercentage,
    skillsScore,
    interestsScore,
    goalsScore,
    locationScore,
    sharedInterests: shared,
    isLocalMatch,
  };
}

/**
 * Sorts an array of candidate profiles relative to a target user
 */
export function rankCandidates(
  targetUser: Profile & { skills?: Skill[]; interests?: Interest[] },
  candidates: (Profile & { skills?: Skill[]; interests?: Interest[] })[]
): (Profile & { skills?: Skill[]; interests?: Interest[] })[] {
  return [...candidates].sort((a, b) => {
    const scoreA = calculateMatchScore(targetUser, a);
    const scoreB = calculateMatchScore(targetUser, b);
    return scoreB - scoreA;
  });
}
