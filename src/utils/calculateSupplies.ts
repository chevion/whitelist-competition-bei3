import type { CalculatedSupply, FamilyInfo, SupplyItem } from '@/types';
import { supplyDB } from '@/data/supplyDB';

function getGroups(familyInfo: FamilyInfo): string[] {
  const groups: string[] = ['all'];
  if (familyInfo.elderly > 0) groups.push('elderly');
  if (familyInfo.children > 0) groups.push('children');
  if (familyInfo.infants > 0) groups.push('infants');
  return groups;
}

function isGroupMatch(item: SupplyItem, groups: string[]): boolean {
  if (!item.forGroups) return true;
  if (item.forGroups.includes('all')) return true;
  return item.forGroups.some((g) => groups.includes(g));
}

function calculateQuantity(item: SupplyItem, familyInfo: FamilyInfo): number {
  if (item.basePerPersonPerDay === undefined) {
    return 1;
  }

  let base = item.basePerPersonPerDay * familyInfo.totalPeople * item.minDays;

  if (item.name === '饮用水' && familyInfo.infants > 0) {
    base += 1 * familyInfo.infants * item.minDays;
  }

  if (item.name === '婴儿奶粉') {
    base = item.basePerPersonPerDay * familyInfo.infants * item.minDays;
  }

  return Math.ceil(base);
}

function buildNote(item: SupplyItem, familyInfo: FamilyInfo): string | undefined {
  const notes: string[] = [];

  if (item.forGroups && !item.forGroups.includes('all')) {
    const groupNames: string[] = [];
    if (item.forGroups.includes('elderly') && familyInfo.elderly > 0) groupNames.push('老人');
    if (item.forGroups.includes('children') && familyInfo.children > 0) groupNames.push('儿童');
    if (item.forGroups.includes('infants') && familyInfo.infants > 0) groupNames.push('婴儿');
    if (groupNames.length > 0) notes.push(`针对${groupNames.join('、')}群体`);
  }

  if (item.name === '饮用水' && familyInfo.infants > 0) {
    notes.push('含婴儿冲泡用水');
  }

  if (familyInfo.hasChronicDisease && item.category === '医疗' && item.name !== '退烧药') {
    notes.push('请备足慢性病用药');
  }

  return notes.length > 0 ? notes.join('；') : undefined;
}

export function calculateSupplies(familyInfo: FamilyInfo): CalculatedSupply[] {
  const groups = getGroups(familyInfo);
  const selectedDisasters = familyInfo.disasters;

  const matched = supplyDB.filter(
    (item) =>
      item.forDisasters.some((d) => selectedDisasters.includes(d)) &&
      isGroupMatch(item, groups)
  );

  const results: CalculatedSupply[] = matched.map((item) => ({
    name: item.name,
    category: item.category,
    quantity: calculateQuantity(item, familyInfo),
    unit: item.unit,
    note: buildNote(item, familyInfo),
  }));

  if (familyInfo.hasChronicDisease && familyInfo.chronicDetails) {
    const hasChronicMed = results.some((r) => r.name === '慢性病常用药');
    if (!hasChronicMed) {
      results.push({
        name: '慢性病常用药',
        category: '医疗',
        quantity: 1,
        unit: '份',
        note: `${familyInfo.chronicDetails}，建议储备7天以上用量`,
      });
    }
  }

  const categoryOrder: CalculatedSupply['category'][] = ['饮水', '食品', '医疗', '工具', '文档', '衣物', '卫生'];
  results.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  return results;
}
