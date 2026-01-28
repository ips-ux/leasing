/**
 * Pricing Service
 * Calculates reservation costs based on resource type and duration
 */

import type { ResourceType, PriceBreakdown } from '../../types/scheduler';

// Pricing constants
const PRICING = {
  GUEST_SUITE: {
    WEEKDAY: 125,    // Sun-Thu
    WEEKEND: 175,    // Fri-Sat
  },
  SKY_LOUNGE: {
    FLAT: 300,
  },
  GEAR_SHED: {
    FREE: 0,
  },
  CANCELLATION_FEES: {
    GUEST_SUITE: 75,
    SKY_LOUNGE: 150,
    GEAR_SHED: 0,
  },
};

/**
 * Calculate reservation cost based on type and dates
 */
export function getReservationCost(
  type: ResourceType,
  startDate: Date,
  endDate: Date
): PriceBreakdown {
  if (type === 'GUEST_SUITE') {
    return calculateGuestSuiteCost(startDate, endDate);
  } else if (type === 'SKY_LOUNGE') {
    return {
      total: PRICING.SKY_LOUNGE.FLAT,
      breakdown: 'Flat rate: $300',
    };
  } else {
    // GEAR_SHED
    return {
      total: PRICING.GEAR_SHED.FREE,
      breakdown: 'Free rental',
    };
  }
}

/**
 * Calculate Guest Suite cost (varies by day of week)
 * $125/night Sun-Thu, $175/night Fri-Sat
 */
function calculateGuestSuiteCost(startDate: Date, endDate: Date): PriceBreakdown {
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  let totalCost = 0;
  const nightBreakdown: string[] = [];

  const currentDate = new Date(startDate);

  for (let i = 0; i < nights; i++) {
    const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday

    const nightCost = isWeekend ? PRICING.GUEST_SUITE.WEEKEND : PRICING.GUEST_SUITE.WEEKDAY;
    totalCost += nightCost;

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
    nightBreakdown.push(`${dayName}: $${nightCost}`);

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    total: totalCost,
    nights,
    breakdown: nightBreakdown.join(', '),
  };
}

/**
 * Get cancellation fee for a reservation
 */
export function getCancellationFee(
  type: ResourceType,
  startTime: string
): number {
  const now = new Date();
  const startDate = new Date(startTime);
  const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // If less than 72 hours until start, apply cancellation fee
  if (hoursUntilStart < 72) {
    return PRICING.CANCELLATION_FEES[type];
  }

  return 0;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
