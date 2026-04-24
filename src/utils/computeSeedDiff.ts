import type { RentableItem } from '../types/rentableItem';

export type ChangeType = 'occupancy' | 'resident' | 'rent' | 'lease' | 'other';

export interface ItemChange {
  prev: RentableItem;
  next: RentableItem;
  changeType: ChangeType;
}

export interface SeedDiff {
  unchanged: number;
  added: RentableItem[];
  /** In DB but not in XLS — split by source so manual items are flagged differently */
  removedFromYardi: RentableItem[];   // source='seed', not in export → genuinely gone from Yardi
  removedManual: RentableItem[];      // source='manual', not in export → expected, user-added
  changes: ItemChange[];
}

export function computeSeedDiff(
  current: RentableItem[],
  incoming: RentableItem[]
): SeedDiff {
  const currentMap = new Map(current.map((i) => [i.code, i]));
  const incomingSet = new Set(incoming.map((i) => i.code));

  const added: RentableItem[] = [];
  const removedFromYardi: RentableItem[] = [];
  const removedManual: RentableItem[] = [];
  const changes: ItemChange[] = [];
  let unchanged = 0;

  // Scan incoming to find new + changed
  for (const next of incoming) {
    const prev = currentMap.get(next.code);
    if (!prev) {
      added.push(next);
      continue;
    }

    const statusChanged = prev.status !== next.status;
    const unitOrNameChanged =
      prev.lesseeName !== next.lesseeName || prev.unit !== next.unit;
    const rentChanged =
      prev.currentRent !== next.currentRent || prev.marketRent !== next.marketRent;
    const leaseChanged =
      prev.leaseFrom !== next.leaseFrom || prev.leaseTo !== next.leaseTo;

    if (statusChanged) {
      changes.push({ prev, next, changeType: 'occupancy' });
    } else if (next.status === 'occupied' && unitOrNameChanged) {
      // Same spot, different resident — no recorded move-out/in, suspicious
      changes.push({ prev, next, changeType: 'resident' });
    } else if (rentChanged) {
      changes.push({ prev, next, changeType: 'rent' });
    } else if (leaseChanged) {
      changes.push({ prev, next, changeType: 'lease' });
    } else {
      unchanged++;
    }
  }

  // Scan DB for items not in XLS
  for (const prev of current) {
    if (!incomingSet.has(prev.code)) {
      if (prev.source === 'manual') {
        removedManual.push(prev);
      } else {
        removedFromYardi.push(prev);
      }
    }
  }

  return { unchanged, added, removedFromYardi, removedManual, changes };
}

export function totalChanges(diff: SeedDiff): number {
  return (
    diff.added.length +
    diff.removedFromYardi.length +
    diff.removedManual.length +
    diff.changes.length
  );
}
