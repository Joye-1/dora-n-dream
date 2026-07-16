import { create } from "zustand";

const STORAGE_KEY = "dora-n-dream-profile";

interface ProfileState {
  profileName: string;
  profiles: string[];
  setProfile: (name: string) => void;
  addProfile: (name: string) => void;
  removeProfile: (name: string) => void;
  loadProfiles: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profileName: "",
  profiles: [],

  setProfile: (name) => {
    localStorage.setItem(STORAGE_KEY, name);
    set({ profileName: name });
  },

  addProfile: (name) => {
    const profiles = [...new Set([...get().profiles, name])];
    localStorage.setItem(STORAGE_KEY + "-list", JSON.stringify(profiles));
    set({ profiles });
  },

  removeProfile: (name) => {
    const profiles = get().profiles.filter((p) => p !== name);
    localStorage.setItem(STORAGE_KEY + "-list", JSON.stringify(profiles));
    set({ profiles });
  },

  loadProfiles: () => {
    const saved = localStorage.getItem(STORAGE_KEY + "-list");
    const current = localStorage.getItem(STORAGE_KEY) || "";
    const profiles: string[] = saved ? JSON.parse(saved) : [];
    if (current && !profiles.includes(current)) profiles.push(current);
    set({ profiles, profileName: current });
  },
}));
