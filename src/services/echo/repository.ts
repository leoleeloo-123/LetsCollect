import type { EchoDecision } from "../../types/echo";

export type PersistedEchoDecision = Exclude<EchoDecision, "pending">;

export type EchoRepositoryState = {
  dateKey: string;
  decisions: Record<string, PersistedEchoDecision>;
  taskProgress: Record<string, number>;
  updatedAt: string;
};

export interface EchoRepository {
  load(dateKey: string): Promise<EchoRepositoryState>;
  save(state: EchoRepositoryState): Promise<void>;
}

export function createEmptyEchoState(dateKey: string): EchoRepositoryState {
  return {
    dateKey,
    decisions: {},
    taskProgress: {},
    updatedAt: new Date().toISOString()
  };
}
