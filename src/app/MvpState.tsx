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
import { starterCollectionToys } from "../data/mock/toys";
import { isColorAnimalCollectible } from "../features/toys/activeSeries";
import { normalizeStoredCollectible } from "../features/toys/compatibility";
import { generateCollectible } from "../features/toys/generator";
import type { Collectible, DrawRecord } from "../types/toy";

const STORAGE_KEY = "lets-collect-mvp-state-v12";
export const DRAW_COST = 3;

type MvpSnapshot = {
  tickets: number;
  interactedActivityIds: string[];
  collection: Collectible[];
  friendIds: string[];
  pendingFriendIds: string[];
  recentDraws: DrawRecord[];
};

type MvpStateValue = MvpSnapshot & {
  interactAndEarn: (activityId: string, reward: number) => void;
  drawCollectible: () => Collectible | null;
  addFriend: (friendId: string) => void;
  acceptFriend: (friendId: string) => void;
  resetDemo: () => void;
};

const initialSnapshot: MvpSnapshot = {
  tickets: 100,
  interactedActivityIds: [],
  collection: [...starterCollectionToys],
  friendIds: initialFriendIds,
  pendingFriendIds: initialPendingFriendIds,
  recentDraws: []
};

function loadSnapshot(): MvpSnapshot {
  try {
    const currentStored = window.localStorage.getItem(STORAGE_KEY);
    if (!currentStored) return initialSnapshot;

    const parsed = JSON.parse(currentStored) as Partial<MvpSnapshot>;
    const storedCollection = Array.isArray(parsed.collection)
      ? parsed.collection
          .map((toy) => normalizeStoredCollectible(toy))
          .filter((toy) => isColorAnimalCollectible(toy))
      : initialSnapshot.collection;
    const storedModelIds = new Set(storedCollection.map((toy) => toy.modelId));
    const missingStarterToys = starterCollectionToys.filter((toy) => !storedModelIds.has(toy.modelId));
    const migratedCollection = [...storedCollection, ...missingStarterToys];

    return {
      ...initialSnapshot,
      ...parsed,
      collection: migratedCollection,
      recentDraws: Array.isArray(parsed.recentDraws) ? parsed.recentDraws : []
    };
  } catch {
    return initialSnapshot;
  }
}
function createDrawRecord(collectible: Collectible): DrawRecord {
  return {
    id: globalThis.crypto.randomUUID(),
    collectibleId: collectible.id,
    createdAt: collectible.createdAt
  };
}

const MvpStateContext = createContext<MvpStateValue | null>(null);

type MvpStateProviderProps = {
  children: ReactNode;
};

export function MvpStateProvider({ children }: MvpStateProviderProps) {
  const [snapshot, setSnapshot] = useState<MvpSnapshot>(loadSnapshot);

  // This provider is the current local repository adapter. Page components only
  // consume domain objects, so a Supabase-backed adapter can replace it later.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    // V5 and earlier keys remain untouched so the material showcase can be restored.
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

  const drawCollectible = useCallback(() => {
    if (snapshot.tickets < DRAW_COST) return null;

    const usedSeeds = new Set(snapshot.collection.map((item) => item.appearanceSeed));
    let result = generateCollectible();
    for (let attempt = 0; attempt < 4 && usedSeeds.has(result.appearanceSeed); attempt += 1) {
      result = generateCollectible();
    }
    const draw = createDrawRecord(result);

    setSnapshot((current) => {
      if (current.tickets < DRAW_COST) return current;
      return {
        ...current,
        tickets: current.tickets - DRAW_COST,
        collection: [result, ...current.collection],
        recentDraws: [draw, ...current.recentDraws].slice(0, 3)
      };
    });
    return result;
  }, [snapshot.collection, snapshot.tickets]);

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
      drawCollectible,
      addFriend,
      acceptFriend,
      resetDemo
    }),
    [snapshot, interactAndEarn, drawCollectible, addFriend, acceptFriend, resetDemo]
  );

  return <MvpStateContext.Provider value={value}>{children}</MvpStateContext.Provider>;
}

export function useMvpState() {
  const context = useContext(MvpStateContext);
  if (!context) throw new Error("useMvpState 必须在 MvpStateProvider 内使用");
  return context;
}
