import {
  db,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
} from './firebase';
import { SavingsGoal } from '../types/financial';

const LOCAL_GOALS_KEY_PREFIX = 'upay_local_goals_';
const LOCAL_SIMULATIONS_KEY = 'upay_local_simulations';

/**
 * Get goals cached locally in browser storage
 */
export function getLocalStoredGoals(customerId: string): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_GOALS_KEY_PREFIX}${customerId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Save a goal to local browser storage
 */
export function saveLocalStoredGoal(goal: SavingsGoal): void {
  try {
    const existing = getLocalStoredGoals(goal.customer_id);
    const updated = [goal, ...existing.filter((g) => g.goal_id !== goal.goal_id)];
    localStorage.setItem(`${LOCAL_GOALS_KEY_PREFIX}${goal.customer_id}`, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Listen for savings goals from Firestore or fall back seamlessly to local cache
 */
export function subscribeToFirebaseGoals(
  customerId: string,
  onUpdate: (goals: SavingsGoal[]) => void,
  onError?: (error: Error) => void
) {
  // 1. Immediately provide local goals
  const localGoals = getLocalStoredGoals(customerId);
  if (localGoals.length > 0) {
    onUpdate(localGoals);
  }

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
            priority:
              data.priority === 'HIGH' || data.priority === 'MEDIUM' || data.priority === 'LOW'
                ? data.priority
                : 'HIGH',
          });
        });

        // Merge with local goals if needed
        const combined = [...liveGoals];
        localGoals.forEach((lg) => {
          if (!combined.some((cg) => cg.goal_id === lg.goal_id)) {
            combined.push(lg);
          }
        });

        onUpdate(combined);
      },
      (err) => {
        // Handled silently: Cloud Firestore operates in offline mode
        onError?.(err);
        onUpdate(getLocalStoredGoals(customerId));
      }
    );

    return unsubscribe;
  } catch (err: any) {
    onError?.(err);
    return () => {};
  }
}

/**
 * Add a savings goal to local storage and sync with Firestore if reachable
 */
export async function addGoalToFirebase(goal: SavingsGoal): Promise<string | null> {
  const localId = goal.goal_id || `goal_local_${Date.now()}`;
  const fullGoal = { ...goal, goal_id: localId };

  // Always save locally first for instant offline responsiveness
  saveLocalStoredGoal(fullGoal);

  try {
    const goalsRef = collection(db, 'savings_goals');
    const docRef = await addDoc(goalsRef, {
      ...fullGoal,
      timestamp: serverTimestamp(),
      syncedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch {
    // Return localId if offline / network disabled
    return localId;
  }
}

/**
 * Log What-If simulation results to local storage and Firestore if reachable
 */
export async function saveSimulationToFirebase(
  simulationRecord: Record<string, any>
): Promise<string | null> {
  const localSimId = `sim_${Date.now()}`;

  // Save to local storage
  try {
    const raw = localStorage.getItem(LOCAL_SIMULATIONS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({ ...simulationRecord, id: localSimId, timestamp: new Date().toISOString() });
    localStorage.setItem(LOCAL_SIMULATIONS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore
  }

  // Attempt Firestore write
  try {
    const simRef = collection(db, 'simulations');
    const docRef = await addDoc(simRef, {
      ...simulationRecord,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch {
    return localSimId;
  }
}
