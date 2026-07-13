import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dream } from "@/types/dream";

const STORAGE_KEY = "sleeplocked.dreams.v1";

export async function loadDreams(): Promise<Dream[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDreams(dreams: Dream[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
}
