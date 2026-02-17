import type {
    PropertySettings,
    WelcomeHomeFormData,
    FeeItem,
    FeeFrequency,
    FeeCategory,
} from '../types/welcomeHomeTypes';

// ── Beacon 85 Default Property Settings ──

export const DEFAULT_PROPERTY_SETTINGS: PropertySettings = {
    propertyName: 'Beacon 85',
    propertyAddress: '85 S Union Blvd',
    propertyCityStateZip: 'Lakewood, CO, 80237',
    propertyPhone: '720-699-0091',
    propertyEmail: 'beacon85@greystar.com',
    propertyContact: 'Robert Barron',

    prorationMethod: 'By 30-Day Month',
    paymentType: 'CHECK, eMONEY ORDER, CREDIT, OR DEBIT',
    holdingDepositTimeFrame: '48 hours',
    chargeNextMonthRent: true,
    underConstruction: false,
    hasDifferentAptAddress: false,
    useYieldstar: true,

    propertyTax: false,
    taxRate: 0,

    utilityProviders: [
        { type: 'Electricity', provider: 'Xcel Energy', phone: '1 (800) 895-4999' },
        { type: 'Phone/Other', provider: 'CenturyLink/Comcast', phone: 'Ask For Details' },
        { type: 'Water & Sewer', provider: 'Conservice Resident Support', phone: '1 (888) 260-7736' },
        { type: 'Renters Insurance', provider: 'Assurant Renters Support', phone: '1 (844) 832-2550' },
    ],

    utilitiesUpFrontOrFirstMonth: 'Up-front',
    adminFeeUpFrontOrFirstMonth: 'Up-front',

    apartmentAmenities: [
        'Stainless Steel Appliances*',
        'Plank Flooring*',
    ],
    communityAmenities: [
        'Sparkling Resort Style Pool',
        'Outdoor Entertainment',
        'Shopping & Restaurants within Walking Distance',
        'Easy Freeway Access',
    ],

    leasingTeam: [
        { name: 'Robert Barron' },
        { name: 'Shari Stengel' },
        { name: 'Miriam Munoz' },
        { name: 'Edgar Valenzuela' },
        { name: 'Anna Noble' },
    ],

    revisionDate: '02/06/2026',
};

// ── Fee Catalog ──
// Complete list of all fee types from the spreadsheet shared strings

export const FEE_CATALOG: { name: string; defaultFrequency: FeeFrequency; category: FeeCategory }[] = [
    // Essentials
    { name: 'Renters Liability/Content - Property Program', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Trash Services - Doorstep', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Pest Control Services', defaultFrequency: 'Per Month', category: 'Essentials' },

    // Personal Add-Ons
    { name: 'Pet Rent', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Pet Rent - Additional Pet', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Parking', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Parking - Covered', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Parking - EV', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Parking - Garage', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Parking - Reserved', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Storage Space Rental', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Storage Space - Bicycle', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Washer/Dryer Rental', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Cable TV and Internet Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Cable TV Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Internet Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Smart Home Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Furniture Rental', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Ceiling Fan', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Additional Occupant Fee', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Alarm Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Concierge Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Media Package', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },
    { name: 'Positive Credit Reporting Services', defaultFrequency: 'Per Month', category: 'Personal Add-Ons' },

    // Move-In Basics
    { name: 'Application Fee', defaultFrequency: 'One Time', category: 'Move-In Basics' },
    { name: 'Administrative Fee', defaultFrequency: 'One Time', category: 'Move-In Basics' },
    { name: 'Pet Fee', defaultFrequency: 'One Time', category: 'Move-In Basics' },
    { name: 'Pet Fee - Additional Pet', defaultFrequency: 'One Time', category: 'Move-In Basics' },
    { name: 'Access Device - Additional', defaultFrequency: 'One Time', category: 'Move-In Basics' },
    { name: 'Access Device Deposit (Refundable)', defaultFrequency: 'One Time', category: 'Move-In Basics' },

    // Situational Fees
    { name: 'Late Fee', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Returned Payment Fee (NSF)', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Early Lease Termination/Cancellation', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Reletting Fee', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Insufficient Move-out Notice Fee', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Lease Violation', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Month-to-Month Fee', defaultFrequency: 'Per Month', category: 'Situational Fees' },
    { name: 'Intra-Community Transfer Fee', defaultFrequency: 'One Time', category: 'Situational Fees' },
    { name: 'Resident Change Fee', defaultFrequency: 'One Time', category: 'Situational Fees' },
    { name: 'Access/Lock Change Fee', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Access Device - Replacement', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Access Device - Deactivation', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },
    { name: 'Express Move Out', defaultFrequency: 'Per Occurrence', category: 'Situational Fees' },

    // Utility Related
    { name: 'Utility - Electric', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Utility - Gas', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Utility - Water', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Utility - Sewer', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Utility - Water/Sewer', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Utility - Billing Administrative Fee', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Utility Billing Bundle', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Common Area - Electric', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Common Area - Gas', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Common Area - Water/Sewer', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Community Amenity Fee', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Drainage Fee', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Environmental Fee', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Trash Services - CA', defaultFrequency: 'Per Month', category: 'Essentials' },
    { name: 'Trash Administrative Fee', defaultFrequency: 'Per Month', category: 'Essentials' },
];

// ── Default form data factory ──

let _feeIdCounter = 0;
export function createFeeId(): string {
    return `fee_${++_feeIdCounter}_${Date.now()}`;
}

export function createDefaultFeeItem(
    name: string,
    amount: number,
    frequency: FeeFrequency = 'Per Month',
    category: FeeCategory = 'Essentials'
): FeeItem {
    return {
        id: createFeeId(),
        name,
        amount,
        frequency,
        category,
    };
}

export function createDefaultFormData(): WelcomeHomeFormData {
    const today = new Date();
    const sixMonthsLater = new Date(today);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    return {
        prospect: {
            residentName1: '',
            residentName2: '',
            residentName3: '',
            residentName4: '',
            phone: '',
            email: '',
            leasingAgent: '',
        },
        unit: {
            apartmentNumber: '',
            buildingNumber: '',
            parkingNumber: '',
            floorPlanName: '',
            bedroomsBaths: '',
            squareFeet: '',
            garageNumber: '',
            mailboxNumber: '',
            storageUnitNumber: '',
            moveInDate: today.toISOString().split('T')[0],
            leaseEndDate: sixMonthsLater.toISOString().split('T')[0],
        },
        rent: 0,
        concessions: {
            hasConcessions: false,
            recurringPercentage: 0,
            recurringDollarAmount: 0,
            upfrontAmount: 0,
            upfrontType: 'Dollar Amount',
        },
        deposits: {
            securityDeposit: 0,
            petDeposit: 0,
            holdingDeposit: 0,
            holdingDepositDeductedFromMoveIn: true,
        },
        fees: [
            createDefaultFeeItem('Renters Liability/Content - Property Program', 6.06, 'Per Month', 'Essentials'),
            createDefaultFeeItem('Trash Services - Doorstep', 0, 'Per Month', 'Essentials'),
            createDefaultFeeItem('Pest Control Services', 0, 'Per Month', 'Essentials'),
        ],
        monthlyCharges: [],
        petRent: 0,
        propertySettings: { ...DEFAULT_PROPERTY_SETTINGS },
    };
}
