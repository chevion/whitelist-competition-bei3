import type { CalculatedSupply, FamilyInfo, MedicalCardData } from '@/types';

const KEYS = {
  province: 'safety-elephant-province',
  apiKey: 'safety-elephant-api-key',
  baseUrl: 'safety-elephant-base-url',
  familyInfo: 'safety-elephant-family-info',
  medicalCardData: 'safety-elephant-medical-card',
  calculatedSupplies: 'safety-elephant-calculated-supplies',
} as const;

export function getProvince(): string {
  return localStorage.getItem(KEYS.province) || '';
}

export function setProvince(province: string): void {
  localStorage.setItem(KEYS.province, province);
}

export function getApiKey(): string {
  return localStorage.getItem(KEYS.apiKey) || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEYS.apiKey, key);
}

export function getBaseUrl(): string {
  return localStorage.getItem(KEYS.baseUrl) || '';
}

export function setBaseUrl(url: string): void {
  localStorage.setItem(KEYS.baseUrl, url);
}

export function getFamilyInfo(): FamilyInfo | null {
  const data = localStorage.getItem(KEYS.familyInfo);
  if (!data) return null;
  try {
    return JSON.parse(data) as FamilyInfo;
  } catch {
    return null;
  }
}

export function setFamilyInfo(info: FamilyInfo): void {
  localStorage.setItem(KEYS.familyInfo, JSON.stringify(info));
}

export function getMedicalCardData(): MedicalCardData | null {
  const data = localStorage.getItem(KEYS.medicalCardData);
  if (!data) return null;
  try {
    return JSON.parse(data) as MedicalCardData;
  } catch {
    return null;
  }
}

export function setMedicalCardData(data: MedicalCardData): void {
  localStorage.setItem(KEYS.medicalCardData, JSON.stringify(data));
}

export function getCalculatedSupplies(): CalculatedSupply[] | null {
  const data = localStorage.getItem(KEYS.calculatedSupplies);
  if (!data) return null;
  try {
    return JSON.parse(data) as CalculatedSupply[];
  } catch {
    return null;
  }
}

export function setCalculatedSupplies(supplies: CalculatedSupply[]): void {
  localStorage.setItem(KEYS.calculatedSupplies, JSON.stringify(supplies));
}

export function clearAll(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
