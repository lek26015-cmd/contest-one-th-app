'use server';
/**
 * @fileOverview An AI flow to check for duplicate competitions.
 *
 * - checkDuplicateCompetition - A function that handles the duplicate check process.
 * - CheckDuplicateInput - The input type for the checkDuplicateCompetition function.
 * - CheckDuplicateOutput - The return type for the checkDuplicateCompetition function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExistingCompetitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const CheckDuplicateInputSchema = z.object({
  newCompetition: z.object({
    title: z.string(),
    description: z.string(),
  }),
  existingCompetitions: z.array(ExistingCompetitionSchema),
});

export type CheckDuplicateInput = z.infer<typeof CheckDuplicateInputSchema>;

const CheckDuplicateOutputSchema = z.object({
  isDuplicate: z
    .boolean()
    .describe('Whether the new competition is a potential duplicate.'),
  reason: z
    .string()
    .nullish()
    .describe('A brief explanation of why it is considered a duplicate.'),
  duplicateId: z
    .string()
    .nullish()
    .describe(
      'The ID of the most similar existing competition if isDuplicate is true.'
    ),
});
export type CheckDuplicateOutput = z.infer<typeof CheckDuplicateOutputSchema>;

export async function checkDuplicateCompetition(
  input: CheckDuplicateInput
): Promise<CheckDuplicateOutput> {
  return checkDuplicateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkDuplicatePrompt',
  input: { schema: CheckDuplicateInputSchema },
  output: { schema: CheckDuplicateOutputSchema },
  prompt: `You are an expert admin responsible for maintaining a clean database of competitions.
Your task is to determine if a new competition submission is a potential duplicate of an existing one.

A competition is considered a duplicate if its title and description are substantially similar to an existing one. Minor differences in wording do not make it unique. Focus on the core topic and goal of the competition.

New Submission:
Title: {{{newCompetition.title}}}
Description: {{{newCompetition.description}}}

Here is a list of existing competitions:
{{#each existingCompetitions}}
- ID: {{id}}
  Title: {{title}}
  Description: {{description}}
---
{{/each}}

Analyze the new submission against the existing list.
If you find a likely duplicate, set isDuplicate to true, provide a short reason (e.g., "Very similar to '...'"), and return the ID of the duplicate.
If it is not a duplicate, set isDuplicate to false.`,
});

const checkDuplicateFlow = ai.defineFlow(
  {
    name: 'checkDuplicateFlow',
    inputSchema: CheckDuplicateInputSchema,
    outputSchema: CheckDuplicateOutputSchema,
  },
  async (input) => {
    // If title or description is very short, it's unlikely to be a real check.
    if (input.newCompetition.title.length < 5 && input.newCompetition.description.length < 5) {
        return { isDuplicate: false };
    }
    // If there are no existing competitions, it can't be a duplicate.
    if (input.existingCompetitions.length === 0) {
        return { isDuplicate: false };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
