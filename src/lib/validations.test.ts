import { describe, it, expect } from 'vitest';
import { projectSchema, signupSchema, connectionRequestSchema } from './validations';

describe('Zod Validation Schemas', () => {
  it('validates proper signup data and rejects invalid email', () => {
    const valid = signupSchema.safeParse({
      displayName: 'Amine Ben Salah',
      email: 'amine@example.tn',
      password: 'password123',
    });
    expect(valid.success).toBe(true);

    const invalid = signupSchema.safeParse({
      displayName: 'A',
      email: 'invalid-email',
      password: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates project creation data requiring at least 1 role and 1 skill', () => {
    const validProject = projectSchema.safeParse({
      title: 'TuniAgri IoT',
      description: 'Plateforme IoT pour optimisation de l’eau dans les oliveraies de Sfax',
      problemDescription: 'Le manque d’eau et le gaspillage dans l’irrigation agricole',
      category: 'GreenTech',
      stage: 'Prototype',
      city: 'Sfax',
      collaborationFormat: 'Hybrid',
      commitmentExpectation: '10 heures par semaine',
      visibility: 'public',
      rolesNeeded: ['Développeur IoT / Embedded', 'Agronome'],
      skillsNeeded: ['Python', 'Automation'],
    });
    expect(validProject.success).toBe(true);

    const invalidProject = projectSchema.safeParse({
      title: 'Hi',
      description: 'Too short',
      problemDescription: 'Short',
      category: 'Tech',
      stage: 'Idea',
      city: 'Sfax',
      collaborationFormat: 'Remote',
      commitmentExpectation: 'None',
      rolesNeeded: [],
      skillsNeeded: [],
    });
    expect(invalidProject.success).toBe(false);
  });

  it('validates connection request message length and UUIDs', () => {
    const validReq = connectionRequestSchema.safeParse({
      receiverId: '123e4567-e89b-12d3-a456-426614174000',
      message: 'Bonjour, j’aimerais collaborer sur votre projet.',
    });
    expect(validReq.success).toBe(true);

    const invalidReq = connectionRequestSchema.safeParse({
      receiverId: 'not-a-uuid',
      message: 'Hi',
    });
    expect(invalidReq.success).toBe(false);
  });
});
