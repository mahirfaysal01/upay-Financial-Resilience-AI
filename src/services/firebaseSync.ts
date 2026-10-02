import {
  db,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDocs,
} from './firebase';
import { SavingsGoal } from '../types/financial';

/**
 * Listen for real-time savings goals from Firebase Firestore
 */
export function subscribeToFirebaseGoals(
  customerId: string,
  onUpdate: (goals: SavingsGoal[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const goalsRef = collection(db, 'savings_goals');
    const q = query(goalsRef, where('customer_id', '==', customerId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveGoals: SavingsGoal[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          liveGoals.push({
            goal_id: docSnap.id,
            customer_id: data.customer_id || customerId,
            goal_name: data.goal_name || 'সঞ্চয় লক্ষ্য',
            category: data.category || 'Education',
            target_amount: Number(data.target_amount) || 10000,
            current_amount: Number(data.current_amount) || 0,
            deadline: data.deadline || data.target_date || '2026-12-31',
            priority: (data.priority === 'HIGH' || data.priority === 'MEDIUM' || data.priority === 'LOW') ? data.priority : 'HIGH',
          });
        });
        onUpdate(liveGoals);
      },
      (err) => {
        console.warn('Firebase Firestore subscription error (offline or rules fallback):', err);
        onError?.(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Failed to subscribe to Firebase goals:', err);
    onError?.(err);
    return () => {};
  }
}

/**
 * Add a savings goal to real-time Firebase Firestore
 */
export async function addGoalToFirebase(goal: SavingsGoal): Promise<string | null> {
  try {
    const goalsRef = collection(db, 'savings_goals');
    const docRef = await addDoc(goalsRef, {
      ...goal,
      timestamp: serverTimestamp(),
      syncedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Could not write goal to Firebase Firestore:', err);
    return null;
  }
}

/**
 * Log What-If simulation results to Firebase Firestore
 */
export async function saveSimulationToFirebase(simulationRecord: Record<string, any>): Promise<string | null> {
  try {
    const simRef = collection(db, 'simulations');
    const docRef = await addDoc(simRef, {
      ...simulationRecord,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Could not save simulation to Firebase Firestore:', err);
    return null;
  }
}
