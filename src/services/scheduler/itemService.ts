/**
 * Item Service
 * CRUD operations for scheduler items (inventory)
 */

import { db } from '../../firebase/config';
import { collection, addDoc, updateDoc, doc, writeBatch } from 'firebase/firestore';
import type { SchedulerItem, ResourceType, ServiceStatus } from '../../types/scheduler';

export interface CreateItemData {
  item_id: string;
  item: string;
  resource_type: ResourceType;
  description?: string;
  service_status: ServiceStatus;
  service_notes?: string;
}

/**
 * Create a new item
 */
export async function createItem(data: CreateItemData): Promise<string> {
  const itemData = {
    ...data,
    created_at: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'items'), itemData);
  return docRef.id;
}

/**
 * Update an existing item
 */
export async function updateItem(
  docId: string,
  data: Partial<SchedulerItem>
): Promise<void> {
  const { _docId, ...updateData } = data as any;
  await updateDoc(doc(db, 'items', docId), updateData);
}

/**
 * Seed initial items if collection is empty
 */
export async function seedInitialItems(): Promise<void> {
  const initialItems: CreateItemData[] = [
    {
      item_id: 'gs-1',
      item: 'Guest Suite',
      resource_type: 'GUEST_SUITE',
      description: 'Book a suite for your guests. 2-night minimum.',
      service_status: 'In Service',
    },
    {
      item_id: 'sl-1',
      item: 'Sky Lounge',
      resource_type: 'SKY_LOUNGE',
      description: 'Reserve the lounge for events. 4-hour limit.',
      service_status: 'In Service',
    },
    {
      item_id: 'kayak-1',
      item: 'Kayak 1',
      resource_type: 'GEAR_SHED',
      description: 'Single kayak',
      service_status: 'In Service',
    },
    {
      item_id: 'kayak-2',
      item: 'Kayak 2',
      resource_type: 'GEAR_SHED',
      description: 'Single kayak',
      service_status: 'In Service',
    },
    {
      item_id: 'bike-1',
      item: 'Mountain Bike 1',
      resource_type: 'GEAR_SHED',
      description: 'Mountain bike',
      service_status: 'In Service',
    },
    {
      item_id: 'bike-2',
      item: 'Mountain Bike 2',
      resource_type: 'GEAR_SHED',
      description: 'Mountain bike',
      service_status: 'In Service',
    },
  ];

  const batch = writeBatch(db);
  const itemsRef = collection(db, 'items');

  initialItems.forEach((item) => {
    const docRef = doc(itemsRef);
    batch.set(docRef, {
      ...item,
      created_at: new Date().toISOString(),
    });
  });

  await batch.commit();
}
