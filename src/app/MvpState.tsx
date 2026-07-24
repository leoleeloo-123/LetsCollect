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
import {
  colorAnimalsSeries,
  isActiveCollectible
} from "../features/toys/activeSeries";
import { normalizeStoredCollectible } from "../features/toys/compatibility";
import { generateCollectible } from "../features/toys/generator";
import type {
  ColorMoodId,
  MaterialPreference,
  TastePreferences
} from "../types/taste";
import type { Collectible, DrawRecord, ToyModelId } from "../types/toy";

const STORAGE_KEY = "lets-collect-mvp-state-v12";
export const DRAW_COST = 3;
export const DEFAULT_TASTE_PREFERENCES: TastePreferences = {
  modelIds: [],
  colorMood: "open",
  material: "open"
};

const COLOR_MOOD_IDS = new Set<ColorMoodId>([
  "open",
  "calm",
  "warm",
  "fresh",
  "dreamy",
  "bold"
]);
const MATERIAL_PREFERENCES = new Set<MaterialPreference>([
  "open",
  "matte",
  "crystal"
]);
const AVAILABLE_TASTE_MODEL_IDS = new Set<ToyModelId>(
  colorAnimalsSeries.modelIds
);

type MvpSnapshot = {
  tickets: number;
  interactedActivityIds: string[];
  collection: Collectible[];
  friendIds: string[];
  pendingFriendIds: string[];
  recentDraws: DrawRecord[];
  favoriteIds: string[];
  representativeIds: string[];
  tastePreferences: TastePreferences;
};

type MvpStateValue = MvpSnapshot & {
  interactAndEarn: (activityId: string, reward: number) => void;
  drawCollectible: () => Collectible | null;
  toggleFavorite: (collectibleId: string) => void;
  toggleRepresentative: (collectibleId: string) => void;
  updateTastePreferences: (partial: Partial<TastePreferences>) => void;
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
  recentDraws: [],
  favoriteIds: [],
  representativeIds: [],
  tastePreferences: { ...DEFAULT_TASTE_PREFERENCES, modelIds: [] }
};

function normalizeStoredIds(
  value: unknown,
  validCollectionIds: ReadonlySet<string>,
  limit = Number.POSITIVE_INFINITY
) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value.filter(
      (id): id is string =>
        typeof id === "string" && validCollectionIds.has(id)
    )
  )].slice(0, limit);
}

function normalizeTastePreferences(value: unknown): TastePreferences {
  const stored = value && typeof value === "object"
    ? value as Partial<TastePreferences>
    : {};
  const modelIds = Array.isArray(stored.modelIds)
    ? [...new Set(stored.modelIds.filter(
        (modelId): modelId is ToyModelId =>
          typeof modelId === "string"
          && AVAILABLE_TASTE_MODEL_IDS.has(modelId as ToyModelId)
      ))].slice(0, 3)
    : [];
  const colorMood = typeof stored.colorMood === "string"
    && COLOR_MOOD_IDS.has(stored.colorMood as ColorMoodId)
    ? stored.colorMood as ColorMoodId
    : DEFAULT_TASTE_PREFERENCES.colorMood;
  const material = typeof stored.material === "string"
    && MATERIAL_PREFERENCES.has(stored.material as MaterialPreference)
    ? stored.material as MaterialPreference
    : DEFAULT_TASTE_PREFERENCES.material;

  return { modelIds, colorMood, material };
}

function loadSnapshot(): MvpSnapshot {
  try {
    const currentStored = window.localStorage.getItem(STORAGE_KEY);
    if (!currentStored) return initialSnapshot;

    const parsed = JSON.parse(currentStored) as Partial<MvpSnapshot>;
    const storedCollection = Array.isArray(parsed.collection)
      ? parsed.collection
          .map((toy) => normalizeStoredCollectible(toy))
          .filter((toy) => isActiveCollectible(toy))
      : initialSnapshot.collection;
    const storedModelIds = new Set(storedCollection.map((toy) => toy.modelId));
    const missingStarterToys = starterCollectionToys.filter(
      (toy) => !storedModelIds.has(toy.modelId)
    );
    const migratedCollection = [...storedCollection, ...missingStarterToys];
    const validCollectionIds = new Set(
      migratedCollection.map((toy) => toy.id)
    );

    return {
      ...initialSnapshot,
      ...parsed,
      collection: migratedCollection,
      recentDraws: Array.isArray(parsed.recentDraws) ? parsed.recentDraws : [],
      favoriteIds: normalizeStoredIds(parsed.favoriteIds, validCollectionIds),
      representativeIds: normalizeStoredIds(
        parsed.representativeIds,
        validCollectionIds,
        3
      ),
      tastePreferences: normalizeTastePreferences(parsed.tastePreferences)
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

    const usedSeeds = new Set(
      snapshot.collection.map((item) => item.appearanceSeed)
    );
    let result = generateCollectible();
    for (
      let attempt = 0;
      attempt < 4 && usedSeeds.has(result.appearanceSeed);
      attempt += 1
    ) {
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

  const toggleFavorite = useCallback((collectibleId: string) => {
    setSnapshot((current) => {
      if (!current.collection.some((toy) => toy.id === collectibleId)) {
        return current;
      }
      const isFavorite = current.favoriteIds.includes(collectibleId);
      return {
        ...current,
        favoriteIds: isFavorite
          ? current.favoriteIds.filter((id) => id !== collectibleId)
          : [...current.favoriteIds, collectibleId]
      };
    });
  }, []);

  const toggleRepresentative = useCallback((collectibleId: string) => {
    setSnapshot((current) => {
      if (!current.collection.some((toy) => toy.id === collectibleId)) {
        return current;
      }
      if (current.representativeIds.includes(collectibleId)) {
        return {
          ...current,
          representativeIds: current.representativeIds.filter(
            (id) => id !== collectibleId
          )
        };
      }
      if (current.representativeIds.length >= 3) return current;
      return {
        ...current,
        representativeIds: [...current.representativeIds, collectibleId]
      };
    });
  }, []);

  const updateTastePreferences = useCallback((
    partial: Partial<TastePreferences>
  ) => {
    setSnapshot((current) => ({
      ...current,
      tastePreferences: normalizeTastePreferences({
        ...current.tastePreferences,
        ...partial
      })
    }));
  }, []);

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
      toggleFavorite,
      toggleRepresentative,
      updateTastePreferences,
      addFriend,
      acceptFriend,
      resetDemo
    }),
    [
      snapshot,
      interactAndEarn,
      drawCollectible,
      toggleFavorite,
      toggleRepresentative,
      updateTastePreferences,
      addFriend,
      acceptFriend,
      resetDemo
    ]
  );

  return (
    <MvpStateContext.Provider value={value}>
      {children}
    </MvpStateContext.Provider>
  );
}

export function useMvpState() {
  const context = useContext(MvpStateContext);
  if (!context) {
    throw new Error("useMvpState 必须在 MvpStateProvider 内使用");
  }
  return context;
}
