export interface ProvinceData {
  name: string;
  commonDisasters: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  tags: {
    provinces: string[];
    disasterTypes: string[];
    knowledgePoints: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SupplyItem {
  name: string;
  category: '食品' | '饮水' | '医疗' | '工具' | '文档' | '衣物' | '卫生';
  basePerPersonPerDay?: number;
  unit: string;
  forDisasters: string[];
  forGroups?: string[];
  minDays: number;
}

export interface MapCell {
  x: number;
  y: number;
}

export interface MapItem {
  position: MapCell;
  type: 'key' | 'flashlight' | 'mask' | 'firstaid' | 'phone' | 'exit-sign' | 'bandage' | 'cotton';
  name: string;
}

export interface MapObstacle {
  position: MapCell;
  type: 'wall' | 'fire' | 'debris' | 'flood' | 'locked-door' | 'door' | 'desk' | 'bed' | 'seat';
  name?: string;
}

export interface MapTemplate {
  id: string;
  name: string;
  gridSize: { cols: number; rows: number };
  cellSize: number;
  startPoint: MapCell;
  endPoint: MapCell;
  obstacles: MapObstacle[];
  items: MapItem[];
  disasterType: string;
  layout?: string[];
}

export interface GameState {
  playerPosition: MapCell;
  playerDirection: 'up' | 'down' | 'left' | 'right';
  health: number;
  timeRemaining: number;
  collectedItems: string[];
  path: MapCell[];
  errors: string[];
  isComplete: boolean;
  burning: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalCardData {
  name: string;
  birthDate: string;
  emergencyContacts: EmergencyContact[];
  bloodType: string;
  severeAllergies: string;
  majorDiseases: string;
  dailyMedications: string;
  surgeryHistory: string;
  aiAlertText: string;
  aiRescueText: string;
}

export interface FamilyInfo {
  totalPeople: number;
  elderly: number;
  children: number;
  infants: number;
  hasChronicDisease: boolean;
  chronicDetails: string;
  housingType: 'apartment' | 'house' | 'dormitory' | 'other';
  disasters: string[];
}

export interface CalculatedSupply {
  name: string;
  category: '食品' | '饮水' | '医疗' | '工具' | '文档' | '衣物' | '卫生';
  quantity: number;
  unit: string;
  note?: string;
}

export interface AICallConfig {
  prompt: string;
  expectJSON?: boolean;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  parsedJSON?: Record<string, unknown>;
}
