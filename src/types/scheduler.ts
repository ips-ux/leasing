/**
 * Scheduler Type Definitions
 * Data models for amenity reservation system
 */

export type ResourceType = 'GUEST_SUITE' | 'SKY_LOUNGE' | 'GEAR_SHED';
export type ReservationStatus = 'Scheduled' | 'Complete' | 'Cancelled';
export type ServiceStatus = 'In Service' | 'Not In Service';

export interface Reservation {
  tx_id: string;
  rented_to: string;              // Unit number
  item: string;                   // Display name (comma-separated for multi-item)
  items?: string[];               // Array for Gear Shed multi-select
  resource_type: ResourceType;
  status: ReservationStatus;
  start_time: string;             // ISO8601 string
  end_time: string;               // ISO8601 string
  total_cost: number;
  scheduled_by: string;
  edit_by?: string;
  last_update?: string;
  rental_notes?: string;
  return_notes?: string;
  completed_by?: string;
  override_lock?: boolean;        // Sky Lounge 24hr override
  cancellation_fee?: number;
  created_at: string;
}

export interface SchedulerItem {
  _docId: string;                 // Firestore internal ID
  item_id: string;                // Readable ID (e.g., "kayak-1")
  item: string;                   // Display name
  resource_type: ResourceType;
  description?: string;
  service_status: ServiceStatus;
  service_notes?: string;
  created_at: string;
}

export interface Staff {
  name: string;
}

// Form data types for creating/editing reservations
export interface ReservationFormData {
  rented_to: string;
  resource_type: ResourceType;
  start_time: string;             // ISO8601 datetime string
  end_time: string;               // ISO8601 datetime string
  items?: string[];               // For Gear Shed
  item?: string;                  // For Guest Suite/Sky Lounge
  rental_notes?: string;
  override_lock?: boolean;
}

// Calendar event format for FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  classNames: string[];
  extendedProps: Reservation;
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

// Price calculation result
export interface PriceBreakdown {
  total: number;
  nights?: number;              // For Guest Suite
  breakdown?: string;           // Detailed breakdown text
}
