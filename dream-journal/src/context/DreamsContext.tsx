import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Dream, NewDreamInput } from "@/types/dream";
import { loadDreams, saveDreams } from "@/services/storage/dreamStorage";

interface DreamsContextValue {
  dreams: Dream[];
  isLoading: boolean;
  addDream: (input: NewDreamInput) => Promise<Dream>;
  removeDream: (id: string) => Promise<void>;
  getDream: (id: string) => Dream | undefined;
  clearAllDreams: () => Promise<void>;
}

const DreamsContext = createContext<DreamsContextValue | undefined>(undefined);

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function DreamsProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDreams().then((loaded) => {
      setDreams(loaded);
      setIsLoading(false);
    });
  }, []);

  const addDream = useCallback(async (input: NewDreamInput) => {
    const dream: Dream = {
      ...input,
      id: makeId(),
      createdAt: new Date().toISOString(),
      visualizationSeed: makeId(),
    };
    setDreams((prev) => {
      const next = [dream, ...prev];
      saveDreams(next);
      return next;
    });
    return dream;
  }, []);

  const removeDream = useCallback(async (id: string) => {
    setDreams((prev) => {
      const next = prev.filter((dream) => dream.id !== id);
      saveDreams(next);
      return next;
    });
  }, []);

  const getDream = useCallback(
    (id: string) => dreams.find((dream) => dream.id === id),
    [dreams]
  );

  const clearAllDreams = useCallback(async () => {
    setDreams([]);
    await saveDreams([]);
  }, []);

  const value = useMemo(
    () => ({
      dreams,
      isLoading,
      addDream,
      removeDream,
      getDream,
      clearAllDreams,
    }),
    [dreams, isLoading, addDream, removeDream, getDream, clearAllDreams]
  );

  return (
    <DreamsContext.Provider value={value}>{children}</DreamsContext.Provider>
  );
}

export function useDreamsContext(): DreamsContextValue {
  const ctx = useContext(DreamsContext);
  if (!ctx) {
    throw new Error("useDreamsContext must be used within a DreamsProvider");
  }
  return ctx;
}
