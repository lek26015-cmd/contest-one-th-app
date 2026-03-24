'use server';

import { adminDb as db } from './admin-config';
import { 
  JudgingCriteria, 
  JudgeAssignment, 
  JudgingScore, 
  Competition 
} from './types';
import { revalidatePath } from 'next/cache';

/**
 * Get competition data on the server
 */
export async function getServerCompetition(id: string): Promise<Competition | null> {
  try {
    const docSnap = await db.collection('competitions').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Competition;
    }
    return null;
  } catch (error) {
    console.error('Error fetching competition on server:', error);
    return null;
  }
}

/**
 * Initialize or update judging configuration for a competition
 */
export async function updateJudgingConfig(
  competitionId: string, 
  criteria: JudgingCriteria[]
) {
  try {
    await db.collection('competitions').doc(competitionId).update({
      judgingConfig: {
        criteria,
        updatedAt: new Date().toISOString()
      }
    });
    revalidatePath(`/dashboard/organizer/competitions/${competitionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating judging config:', error);
    return { success: false, error: 'Failed to update judging configuration' };
  }
}

/**
 * Invite a judge to a competition
 */
export async function inviteJudge(competitionId: string, email: string) {
  try {
    const inviteId = `${competitionId}_${email.replace(/\./g, '_')}`;
    const invite: JudgeAssignment = {
      id: inviteId,
      competitionId,
      userId: '', // To be filled when they accept
      userEmail: email,
      status: 'pending',
      invitedAt: new Date().toISOString()
    };

    await db.collection('judge_assignments').doc(inviteId).set(invite);
    // In a real app, send an email here
    return { success: true, inviteId };
  } catch (error) {
    console.error('Error inviting judge:', error);
    return { success: false, error: 'Failed to invite judge' };
  }
}

/**
 * Submit scoring for a submission by a judge
 */
export async function submitScore(score: Omit<JudgingScore, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const scoreId = `${score.submissionId}_${score.judgeId}`;
    const now = new Date().toISOString();
    
    const finalScore: JudgingScore = {
      ...score,
      id: scoreId,
      createdAt: now,
      updatedAt: now
    };

    await db.collection('judging_scores').doc(scoreId).set(finalScore);
    
    // Trigger revalidation for results
    revalidatePath(`/dashboard/organizer/competitions/${score.competitionId}/judging`);
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, error: 'Failed to submit score' };
  }
}

/**
 * Get results summary for a competition (Auto Summary feature)
 */
export async function getJudgingSummary(competitionId: string) {
  try {
    const scoresSnapshot = await db.collection('judging_scores')
      .where('competitionId', '==', competitionId)
      .get();
    
    const scores = scoresSnapshot.docs.map(doc => doc.data() as JudgingScore);
    
    // Group by submission
    const summary = scores.reduce((acc: Record<string, any>, score: JudgingScore) => {
      if (!acc[score.submissionId]) {
        acc[score.submissionId] = {
          submissionId: score.submissionId,
          totalWeightedScore: 0,
          judgeCount: 0,
          comments: []
        };
      }
      
      acc[score.submissionId].totalWeightedScore += score.weightedTotalScore;
      acc[score.submissionId].judgeCount += 1;
      if (score.comment) acc[score.submissionId].comments.push(score.comment);
      
      return acc;
    }, {});

    // Calculate averages
    const finalResults = Object.values(summary).map((item: any) => ({
      ...item,
      averageScore: item.totalWeightedScore / item.judgeCount
    })).sort((a: any, b: any) => b.averageScore - a.averageScore);

    return { success: true, results: finalResults };
  } catch (error) {
    console.error('Error getting judging summary:', error);
    return { success: false, error: 'Failed to generate results summary' };
  }
}
