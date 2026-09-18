import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Veuillez saisir une adresse email valide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});

export const signupSchema = z.object({
  displayName: z.string().min(2, 'Le nom complet doit comporter au moins 2 caractères'),
  email: z.string().email('Veuillez saisir une adresse email valide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});

export const onboardingStep1Schema = z.object({
  displayName: z.string().min(2, 'Le nom complet doit comporter au moins 2 caractères'),
  city: z.string().min(2, 'Veuillez sélectionner ou indiquer votre ville'),
  university: z.string().optional(),
  bio: z.string().max(500, 'La biographie ne peut dépasser 500 caractères').optional(),
});

export const onboardingStep2Schema = z.object({
  skills: z.array(z.string()).min(1, 'Sélectionnez au moins une compétence'),
});

export const onboardingStep3Schema = z.object({
  interests: z.array(z.string()).min(1, 'Sélectionnez au moins un centre d’intérêt'),
});

export const onboardingStep4Schema = z.object({
  collaborationGoal: z.string().min(1, 'Veuillez choisir votre objectif principal'),
  collaborationFormat: z.enum(['In person', 'Remote', 'Hybrid']),
  availability: z.enum(['Few hours per week', 'Weekends', 'Part-time', 'Flexible', 'Full-time']),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Experienced']),
  isInterestedInBusiness: z.enum(['Yes', 'Maybe', 'Exploring']),
});

export const projectSchema = z.object({
  title: z.string().min(3, 'Le titre doit comporter au moins 3 caractères').max(100),
  description: z.string().min(10, 'La description doit comporter au moins 10 caractères'),
  problemDescription: z.string().min(10, 'Le problème résolu doit comporter au moins 10 caractères'),
  solutionDescription: z.string().optional(),
  category: z.string().min(2, 'Veuillez sélectionner une catégorie'),
  stage: z.enum(['Idea', 'Validation', 'Prototype', 'MVP', 'Early launch', 'Growing']),
  city: z.string().min(2, 'Indiquez la ville ou zone géographique'),
  collaborationFormat: z.enum(['In person', 'Remote', 'Hybrid']),
  commitmentExpectation: z.string().min(2, 'Précisez l’engagement attendu'),
  visibility: z.enum(['public', 'unlisted']).default('public'),
  rolesNeeded: z.array(z.string()).min(1, 'Précisez au moins un rôle recherché'),
  skillsNeeded: z.array(z.string()).min(1, 'Précisez au moins une compétence recherchée'),
});

export const connectionRequestSchema = z.object({
  receiverId: z.string().uuid('ID utilisateur invalide'),
  projectId: z.string().uuid().optional().nullable(),
  message: z.string().min(5, 'Le message d’introduction doit comporter au moins 5 caractères').max(500),
});

export const projectApplicationSchema = z.object({
  projectId: z.string().uuid(),
  message: z.string().min(10, 'Votre message de candidature doit comporter au moins 10 caractères'),
  availabilityNote: z.string().optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1, 'Le message ne peut pas être vide').max(2000),
});

export const reportSchema = z.object({
  reason: z.enum(['Spam', 'Harassment', 'Fake identity', 'Inappropriate content', 'Fraud or suspicious activity', 'Other']),
  description: z.string().min(5, 'Veuillez fournir quelques détails sur ce problème'),
  reportedUserId: z.string().uuid().optional().nullable(),
  reportedProjectId: z.string().uuid().optional().nullable(),
  reportedMessageId: z.string().uuid().optional().nullable(),
});
