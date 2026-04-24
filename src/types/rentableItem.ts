export type RentableItemType =
  | 'assigned_parking'
  | 'premium_parking'
  | 'uncovered_parking'
  | 'disabled_access'
  | 'large_storage'
  | 'medium_plus_storage'
  | 'medium_storage'
  | 'small_storage'
  | 'wine_storage';

export const RENTABLE_TYPE_LABELS: Record<RentableItemType, string> = {
  assigned_parking: 'Assigned Parking',
  premium_parking: 'Premium Parking',
  uncovered_parking: 'Uncovered Parking',
  disabled_access: 'Disabled Access',
  large_storage: 'Large Storage',
  medium_plus_storage: 'Medium Plus Storage',
  medium_storage: 'Medium Storage',
  small_storage: 'Small Storage',
  wine_storage: 'Wine Storage',
};

export const PARKING_TYPES: RentableItemType[] = [
  'assigned_parking',
  'premium_parking',
  'uncovered_parking',
  'disabled_access',
];

export const STORAGE_TYPES: RentableItemType[] = [
  'large_storage',
  'medium_plus_storage',
  'medium_storage',
  'small_storage',
  'wine_storage',
];

export type RentableItemStatus = 'occupied' | 'vacant';

export type RentableItemSource = 'seed' | 'manual';

export interface RentableItem {
  code: string;           // document ID in Firestore
  description: string;
  itemType: RentableItemType;
  group: string;          // e.g. 'park1', 'stor3'
  marketRent: number;
  status: RentableItemStatus;
  unit: string | null;
  lesseeId: string | null;
  lesseeName: string | null;
  leaseFrom: string | null;
  leaseTo: string | null;
  currentRent: number;
  source: RentableItemSource;  // 'seed' = from Yardi export, 'manual' = added in app
  lastSeededAt: string;        // ISO timestamp (or creation time for manual items)
}

export type WaitlistStatus = 'waiting' | 'fulfilled' | 'cancelled';

export interface WaitlistEntry {
  id: string;
  priceTier: 35 | 75;
  itemType?: RentableItemType;
  specificCode?: string;
  residentName: string;
  residentUnit: string;
  contact?: string;
  notes?: string;
  requestedAt: string;    // ISO timestamp
  addedBy: string;        // user UID
  addedByName: string;
  status: WaitlistStatus;
}
