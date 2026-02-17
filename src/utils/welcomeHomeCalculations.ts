import type { WelcomeHomeFormData, ComputedValues, FeeItem } from '../types/welcomeHomeTypes';

// ── Lease Term Calculations ──
// Replicates: DATEDIF($E$22,$E$23,"M") and remainder days

export function calculateLeaseTermMonths(moveIn: string, leaseEnd: string): number {
    if (!moveIn || !leaseEnd) return 0;
    const d1 = new Date(moveIn);
    const d2 = new Date(leaseEnd);
    if (d2 <= d1) return 0;

    let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    // If the day of leaseEnd is before moveIn's day, subtract 1 month
    if (d2.getDate() < d1.getDate()) {
        months--;
    }
    return Math.max(0, months);
}

export function calculateLeaseTermDays(moveIn: string, leaseEnd: string, months: number): number {
    if (!moveIn || !leaseEnd) return 0;
    const d1 = new Date(moveIn);
    // Add months to moveIn date
    const afterMonths = new Date(d1.getFullYear(), d1.getMonth() + months, d1.getDate());
    const d2 = new Date(leaseEnd);
    const diffTime = d2.getTime() - afterMonths.getTime();
    return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
}

// ── Proration Calculations ──
// Replicates: DAYS360 formula for "By 30-Day Month"
// prorate = DAYS360(moveInDate-1, endOfMonth(moveInDate)) / 30

export function calculateProrateFraction(moveInDate: string, method: string): number {
    if (!moveInDate) return 0;
    const d = new Date(moveInDate);
    const dayOfMonth = d.getDate();

    if (dayOfMonth === 1) {
        // Move-in on the 1st = no proration needed (full month)
        return 1;
    }

    if (method === 'By 30-Day Month') {
        // DAYS360 logic: remaining days in month / 30
        // Day 1 = 30/30 = 1, Day 2 = 29/30, ... Day 28 = 2/30
        const remaining = 30 - (dayOfMonth - 1);
        return remaining / 30;
    } else {
        // By Calendar Month: remaining days / total days in month
        const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const remaining = daysInMonth - dayOfMonth + 1;
        return remaining / daysInMonth;
    }
}

export function calculateProratedAmount(amount: number, prorateFraction: number): number {
    if (prorateFraction >= 1) return amount;
    return Math.round(amount * prorateFraction * 100) / 100;
}

// ── Concession Calculations ──

export function calculateRecurringConcession(
    rent: number,
    percentage: number,
    dollarAmount: number
): number {
    if (dollarAmount > 0) {
        return dollarAmount;
    }
    if (percentage > 0) {
        return Math.round(rent * (percentage / 100) * 100) / 100;
    }
    return 0;
}

// ── Fee Helpers ──

export function getMonthlyFees(fees: FeeItem[]): FeeItem[] {
    return fees.filter(f => f.amount > 0 && f.frequency === 'Per Month');
}

export function getOneTimeFees(fees: FeeItem[]): FeeItem[] {
    return fees.filter(f =>
        f.amount > 0 && (f.frequency === 'One Time' || f.frequency === 'At Move-In Only')
    );
}

export function getRefundableDeposits(fees: FeeItem[]): FeeItem[] {
    return fees.filter(f => f.amount > 0 && f.name.toLowerCase().includes('refundable'));
}

// ── Whether to Charge Next Month's Rent ──
// Spreadsheet logic: if move-in is after the 25th, charge next month

export function shouldChargeNextMonth(moveInDate: string, chargeNextMonthSetting: boolean): boolean {
    if (!chargeNextMonthSetting || !moveInDate) return false;
    const d = new Date(moveInDate);
    return d.getDate() > 25;
}

// ── Holding Deposit Expiry ──
// 48 or 72 business hours from today

export function calculateHoldingDepositExpiry(timeFrame: string): string {
    const today = new Date();
    const hours = timeFrame === '72 hours' ? 72 : 48;
    const businessDays = Math.ceil(hours / 24);

    let count = 0;
    const result = new Date(today);
    while (count < businessDays) {
        result.setDate(result.getDate() + 1);
        const dow = result.getDay();
        if (dow !== 0 && dow !== 6) {
            count++;
        }
    }

    return result.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Master Calculation ──
// Computes all derived values from the form data

export function computeAll(data: WelcomeHomeFormData): ComputedValues {
    const { unit, rent, concessions, deposits, fees, petRent, propertySettings } = data;

    // Lease term
    const leaseTermMonths = calculateLeaseTermMonths(unit.moveInDate, unit.leaseEndDate);
    const leaseTermDays = calculateLeaseTermDays(unit.moveInDate, unit.leaseEndDate, leaseTermMonths);

    // Proration
    const prorateFraction = calculateProrateFraction(unit.moveInDate, propertySettings.prorationMethod);
    const proratedRent = calculateProratedAmount(rent, prorateFraction);

    // Monthly fees
    const monthlyFees = getMonthlyFees(fees);
    const monthlyFeesTotal = monthlyFees.reduce((sum, f) => sum + f.amount, 0);

    // Total monthly charges = rent + pet rent + recurring monthly fees (before concession)
    const totalMonthlyCharges = rent + petRent + monthlyFeesTotal;

    // Recurring concession
    const recurringConcessionAmount = concessions.hasConcessions
        ? calculateRecurringConcession(rent, concessions.recurringPercentage, concessions.recurringDollarAmount)
        : 0;

    // Total monthly leasing price = monthly charges - recurring concession
    const totalMonthlyLeasingPrice = totalMonthlyCharges - recurringConcessionAmount;

    // Prorated total for all monthly charges
    const proratedPetRent = calculateProratedAmount(petRent, prorateFraction);
    const proratedMonthlyFees = monthlyFees.reduce(
        (sum, f) => sum + calculateProratedAmount(f.amount, prorateFraction), 0
    );
    const proratedTotal = proratedRent + proratedPetRent + proratedMonthlyFees;

    // Prorated concession
    const proratedConcession = calculateProratedAmount(recurringConcessionAmount, prorateFraction);

    // Next month rent
    const chargeNextMonth = shouldChargeNextMonth(unit.moveInDate, propertySettings.chargeNextMonthRent);
    const nextMonthRent = chargeNextMonth ? totalMonthlyLeasingPrice : 0;

    // Deposits
    const totalDeposits = deposits.securityDeposit + deposits.petDeposit;
    const holdingDepositCredit = deposits.holdingDepositDeductedFromMoveIn ? deposits.holdingDeposit : 0;

    // One-time fees
    const oneTimeFees = getOneTimeFees(fees);
    const totalNonRefundableFees = oneTimeFees.reduce((sum, f) => sum + f.amount, 0);

    // Subtotal move-in = prorated charges + next month + deposits + one-time fees
    const subtotalMoveIn = proratedTotal + nextMonthRent + totalDeposits + totalNonRefundableFees;

    // Move-in concession deduction
    const moveInConcessionDeduction = concessions.hasConcessions
        ? proratedConcession + (concessions.upfrontAmount || 0)
        : 0;

    // Total due at move-in
    const totalDueAtMoveIn = Math.max(0, subtotalMoveIn - moveInConcessionDeduction - holdingDepositCredit);

    // Holding deposit expiry
    const holdingDepositExpiry = calculateHoldingDepositExpiry(
        propertySettings.holdingDepositTimeFrame
    );

    // Paid to date (holding deposit if applicable)
    const paidToDate = deposits.holdingDeposit;

    return {
        leaseTermMonths,
        leaseTermDays,
        prorateFraction,
        proratedRent,
        totalMonthlyCharges,
        recurringConcessionAmount,
        totalMonthlyLeasingPrice,
        proratedTotal,
        totalDeposits,
        totalNonRefundableFees,
        subtotalMoveIn,
        moveInConcessionDeduction,
        totalDueAtMoveIn,
        chargeNextMonth,
        nextMonthRent,
        holdingDepositExpiry,
        paidToDate,
    };
}

// ── Currency Formatter ──

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}
