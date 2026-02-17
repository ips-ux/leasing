// ── Welcome Home Sheet Data Model ──

export interface ProspectInfo {
    residentName1: string;
    residentName2: string;
    residentName3: string;
    residentName4: string;
    phone: string;
    email: string;
    leasingAgent: string;
}

export interface UnitDetails {
    apartmentNumber: string;
    buildingNumber: string;
    parkingNumber: string;
    floorPlanName: string;
    bedroomsBaths: string;
    squareFeet: string;
    garageNumber: string;
    mailboxNumber: string;
    storageUnitNumber: string;
    moveInDate: string;      // ISO date string
    leaseEndDate: string;    // ISO date string
}

export type ProrationMethod = 'By 30-Day Month' | 'By Calendar Month';

export type PaymentType =
    | 'CHECK, eMONEY ORDER, CREDIT, OR DEBIT'
    | "CASHIER'S CHECK OR eMONEY ORDER ONLY"
    | 'CREDIT OR DEBIT ONLY'
    | 'CREDIT ONLY'
    | 'DEBIT ONLY'
    | 'eMONEY ORDER ONLY'
    | "CASHIER'S CHECK ONLY"
    | 'ALL FORMS OF PAYMENT'
    | 'CERTIFIED FUNDS ONLY'
    | 'eCHECK OR eMONEY ORDER';

export type HoldingDepositTimeFrame = '48 hours' | '72 hours';

export type ConcessionType = 'Percentage' | 'Dollar Amount';

export type FeeFrequency =
    | 'One Time'
    | 'Per Installment'
    | 'Per Month'
    | 'Per Quarter'
    | 'Per Year'
    | 'Per Lease'
    | 'Per Occurrence'
    | 'At Move-In Only';

export type FeeCategory = 'Essentials' | 'Personal Add-Ons' | 'Situational Fees' | 'Move-In Basics';

export interface FeeItem {
    id: string;
    name: string;
    amount: number;
    frequency: FeeFrequency;
    category: FeeCategory;
}

export interface ConcessionData {
    hasConcessions: boolean;
    recurringPercentage: number;
    recurringDollarAmount: number;
    upfrontAmount: number;
    upfrontType: 'Percentage' | 'Dollar Amount';
}

export interface DepositData {
    securityDeposit: number;
    petDeposit: number;
    holdingDeposit: number;
    holdingDepositDeductedFromMoveIn: boolean;
}

export interface UtilityProvider {
    type: string;       // "Electricity", "Phone/Other", "Cable/Sat", etc.
    provider: string;
    phone: string;
}

export interface PropertySettings {
    propertyName: string;
    propertyAddress: string;
    propertyCityStateZip: string;
    propertyPhone: string;
    propertyEmail: string;
    propertyContact: string;

    prorationMethod: ProrationMethod;
    paymentType: PaymentType;
    holdingDepositTimeFrame: HoldingDepositTimeFrame;
    chargeNextMonthRent: boolean;      // Move-ins after the 25th
    underConstruction: boolean;
    hasDifferentAptAddress: boolean;
    useYieldstar: boolean;

    propertyTax: boolean;
    taxRate: number;

    utilityProviders: UtilityProvider[];

    // Utility billing timing
    utilitiesUpFrontOrFirstMonth: 'Up-front' | 'First full month' | 'Included in rent';
    adminFeeUpFrontOrFirstMonth: 'Up-front' | 'First full month';

    // Apartment & Community amenities (for Rent Quote Page 2)
    apartmentAmenities: string[];
    communityAmenities: string[];

    // Leasing team
    leasingTeam: { name: string }[];

    // Revision date
    revisionDate: string;
}

export interface MonthlyChargeItem {
    name: string;
    amount: number;
    isProrated: boolean;
}

export interface WelcomeHomeFormData {
    prospect: ProspectInfo;
    unit: UnitDetails;
    rent: number;
    concessions: ConcessionData;
    deposits: DepositData;
    fees: FeeItem[];
    monthlyCharges: MonthlyChargeItem[];
    petRent: number;
    propertySettings: PropertySettings;
}

// ── Computed / Derived Values ──

export interface ComputedValues {
    leaseTermMonths: number;
    leaseTermDays: number;
    prorateFraction: number;
    proratedRent: number;
    totalMonthlyCharges: number;         // Rent + recurring add-ons (no concession)
    recurringConcessionAmount: number;   // Monthly concession deduction
    totalMonthlyLeasingPrice: number;    // After concession
    proratedTotal: number;               // All prorated charges
    totalDeposits: number;
    totalNonRefundableFees: number;
    subtotalMoveIn: number;
    moveInConcessionDeduction: number;
    totalDueAtMoveIn: number;
    chargeNextMonth: boolean;            // Whether next month's rent is charged
    nextMonthRent: number;
    holdingDepositExpiry: string;        // Formatted date
    paidToDate: number;
}
