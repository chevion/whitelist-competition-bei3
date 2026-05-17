import { create } from 'zustand';

interface AppState {
  province: string;
  setProvince: (province: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  province: '',
  setProvince: (province) => set({ province }),
  apiKey: '',
  setApiKey: (apiKey) => set({ apiKey }),
  baseUrl: '',
  setBaseUrl: (baseUrl) => set({ baseUrl }),
  showSettings: false,
  setShowSettings: (showSettings) => set({ showSettings }),
}));
