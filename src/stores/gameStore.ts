import { create } from 'zustand';
import type { GameState, MapCell, MapTemplate } from '@/types';

interface GameStore extends GameState {
  currentMap: MapTemplate | null;
  setCurrentMap: (map: MapTemplate) => void;
  setPlayerPosition: (position: MapCell) => void;
  setPlayerDirection: (direction: GameState['playerDirection']) => void;
  setHealth: (health: number) => void;
  setTimeRemaining: (time: number) => void;
  setCollectedItems: (items: string[]) => void;
  setPath: (path: MapCell[]) => void;
  setErrors: (errors: string[]) => void;
  setIsComplete: (complete: boolean) => void;
  resetGame: () => void;
  movePlayer: (direction: GameState['playerDirection']) => void;
  collectItem: (item: string) => void;
  addError: (error: string) => void;
  completeGame: () => void;
}

const initialState: GameState = {
  playerPosition: { x: 0, y: 0 },
  playerDirection: 'up',
  health: 100,
  timeRemaining: 120,
  collectedItems: [],
  path: [{ x: 0, y: 0 }],
  errors: [],
  isComplete: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  currentMap: null,

  setCurrentMap: (currentMap) => set({ currentMap }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),
  setPlayerDirection: (playerDirection) => set({ playerDirection }),
  setHealth: (health) => set({ health }),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  setCollectedItems: (collectedItems) => set({ collectedItems }),
  setPath: (path) => set({ path }),
  setErrors: (errors) => set({ errors }),
  setIsComplete: (isComplete) => set({ isComplete }),

  resetGame: () => set({ ...initialState, path: [{ x: 0, y: 0 }], collectedItems: [], errors: [], currentMap: null }),

  movePlayer: (direction) => {
    const { playerPosition, path } = get();
    const delta: Record<string, { dx: number; dy: number }> = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    };
    const d = delta[direction];
    if (!d) return;
    const newPosition = {
      x: playerPosition.x + d.dx,
      y: playerPosition.y + d.dy,
    };
    set({
      playerPosition: newPosition,
      playerDirection: direction,
      path: [...path, newPosition],
    });
  },

  collectItem: (item) => {
    const { collectedItems } = get();
    if (!collectedItems.includes(item)) {
      set({ collectedItems: [...collectedItems, item] });
    }
  },

  addError: (error) => {
    const { errors, health } = get();
    set({
      errors: [...errors, error],
      health: Math.max(0, health - 10),
    });
  },

  completeGame: () => set({ isComplete: true }),
}));
