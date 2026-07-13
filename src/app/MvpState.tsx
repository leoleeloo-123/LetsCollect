import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { initialFriendIds, initialPendingFriendIds } from "../data/mock/social";
import { mockToys } from "../data/mock/toys";
import type { Toy } from "../types/toy";

const STORAGE_KEY = "lets-collect-mvp-state-v1";
export const DRAW_COST = 3;

type MvpSnapshot = {
  tickets: number;
  interactedActivityIds: string[];
  collectionCounts: Record<string, number>;
  friendIds: string[];
  pendingFriendIds: string[];
  recentDrawIds: string[];
};

type MvpStateValue = MvpSnapshot & {
  interactAndEarn: (activityId: string, reward: number) => void;
  drawToy: () => Toy | null;
  addFriend: (friendId: string) => void;
  acceptFriend: (friendId: string) => void;
  resetDemo: () => void;
};

const initialSnapshot: MvpSnapshot = {
  tickets: 4,
  interactedActivityIds: [],
  collectionCounts: { toy_001: 1 },
  friendIds: initialFriendIds,
  pendingFriendIds: initialPendingFriendIds,
  recentDrawIds: []
};

function loadSnapshot(): MvpSnapshot {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...initialSnapshot, ...JSON.parse(stored) } : initialSnapshot;
  } catch {
    return initialSnapshot;
  }
}

function chooseWeightedToy(): Toy {
  const totalWeight = mockToys.reduce((sum, toy) => sum + toy.drawWeight, 0);
  let cursor = Math.random() * totalWeight;

  for (const toy of mockToys) {
    cursor -= toy.drawWeight;
    if (cursor <= 0) return toy;
  }

  return mockToys[mockToys.length - 1];
}

const MvpStateContext = createContext<MvpStateValue | null>(null);

type MvpStateProviderProps = {
  children: ReactNode;
};

export function MvpStateProvider({ children }: MvpStateProviderProps) {
  const [snapshot, setSnapshot] = useState<MvpSnapshot>(loadSnapshot);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [snapshot]);

  const interactAndEarn = useCallback((activityId: string, reward: number) => {
    setSnapshot((current) => {
      if (current.interactedActivityIds.includes(activityId)) return current;
      return {
        ...current,
        tickets: current.tickets + reward,
        interactedActivityIds: [...current.interactedActivityIds, activityId]
      };
    });
  }, []);

  const drawToy = useCallback(() => {
    if (snapshot.tickets < DRAW_COST) return null;
    const result = chooseWeightedToy();
    setSnapshot((current) => {
      if (current.tickets < DRAW_COST) return current;
      return {
        ...current,
        tickets: current.tickets - DRAW_COST,
        collectionCounts: {
          ...current.collectionCounts,
          [result.id]: (current.collectionCounts[result.id] ?? 0) + 1
        },
        recentDrawIds: [result.id, ...current.recentDrawIds].slice(0, 3)
      };
    });
    return result;
  }, [snapshot.tickets]);

  const addFriend = useCallback((friendId: string) => {
    setSnapshot((current) =>
      current.friendIds.includes(friendId)
        ? current
        : { ...current, friendIds: [...current.friendIds, friendId] }
    );
  }, []);

  const acceptFriend = useCallback((friendId: string) => {
    setSnapshot((current) => ({
      ...current,
      friendIds: current.friendIds.includes(friendId)
        ? current.friendIds
        : [...current.friendIds, friendId],
      pendingFriendIds: current.pendingFriendIds.filter((id) => id !== friendId)
    }));
  }, []);

  const resetDemo = useCallback(() => setSnapshot(initialSnapshot), []);

  const value = useMemo(
    () => ({
      ...snapshot,
      interactAndEarn,
      drawToy,
      addFriend,
      acceptFriend,
      resetDemo
    }),
    [snapshot, interactAndEarn, drawToy, addFriend, acceptFriend, resetDemo]
  );

  return <MvpStateContext.Provider value={value}>{children}</MvpStateContext.Provider>;
}

export function useMvpState() {
  const context = useContext(MvpStateContext);
  if (!context) throw new Error("useMvpState 必须在 MvpStateProvider 内使用");
  return context;
}
