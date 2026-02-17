import type { WelcomeHomeFormData, ComputedValues } from '../../types/welcomeHomeTypes';
import {
    formatCurrency,
    formatDate,
    formatDateShort,
    getMonthlyFees,
    getOneTimeFees,
    calculateProratedAmount,
} from '../../utils/welcomeHomeCalculations';

interface MoveInCostSheetProps {
    formData: WelcomeHomeFormData;
    computed: ComputedValues;
}

export const MoveInCostSheet = ({ formData, computed }: MoveInCostSheetProps) => {
    const { prospect, unit, rent, concessions, deposits, propertySettings, petRent } = formData;
    const ps = propertySettings;
    const basePath = `${import.meta.env.BASE_URL}images/welcome-home`;

    const monthlyFees = getMonthlyFees(formData.fees);
    const oneTimeFees = getOneTimeFees(formData.fees);

    // Build the prorated charges rows
    const chargeRows: { name: string; monthly: number; prorated: number }[] = [
        { name: 'Base Rent', monthly: rent, prorated: computed.proratedRent },
    ];
    if (petRent > 0) {
        chargeRows.push({
            name: 'Pet Rent',
            monthly: petRent,
            prorated: calculateProratedAmount(petRent, computed.prorateFraction),
        });
    }
    monthlyFees.forEach(fee => {
        chargeRows.push({
            name: fee.name,
            monthly: fee.amount,
            prorated: calculateProratedAmount(fee.amount, computed.prorateFraction),
        });
    });

    // "Know Before You Move-In" items
    const moveInNotes = [
        `Your rent is due on the 1st of every month. Late fees may apply after the grace period.`,
        `Please establish utility services in your name prior to move-in. See utility provider information on your rent quote.`,
        `Renters insurance or the property's renters liability/content program is required throughout your lease.`,
        `All keys, access devices, and parking permits must be returned at move-out to avoid replacement charges.`,
        `Please review your lease agreement carefully — it contains important information about your rights and responsibilities.`,
        `Maintenance requests can be submitted through the resident portal or by contacting the leasing office.`,
        `Please refer to your community policies for information about noise hours, pet policies, and common area usage.`,
    ];

    return (
        <div style={{
            width: '8.5in',
            minHeight: '11in',
            margin: '0 auto',
            padding: '0.4in 0.5in',
            fontFamily: 'Calibri, Arial, sans-serif',
            fontSize: '9pt',
            color: '#333',
            background: '#fff',
            boxSizing: 'border-box',
        }}>
            {/* Header */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '60%', verticalAlign: 'top' }}>
                            <img
                                src={`${basePath}/home-starts-here.png`}
                                alt="Home Starts Here"
                                style={{ height: '24px', marginBottom: '4px' }}
                            />
                            <div style={{ fontSize: '14pt', fontWeight: 700, color: '#3d4f5f', letterSpacing: '1px' }}>
                                MOVE-IN COST SHEET
                            </div>
                        </td>
                        <td style={{ width: '40%', textAlign: 'right', verticalAlign: 'top', fontSize: '8pt', color: '#666' }}>
                            <div style={{ fontWeight: 700 }}>{ps.propertyName}</div>
                            <div>{ps.propertyAddress}</div>
                            <div>{ps.propertyCityStateZip}</div>
                            <div>{ps.propertyPhone}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ borderBottom: '2px solid #3d4f5f', marginBottom: '10px' }} />

            {/* Apartment Details */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <td colSpan={4} style={sectionHeader}>
                            <img src={`${basePath}/icon-payment.png`} alt="" style={{ height: '14px', verticalAlign: 'middle', marginRight: '6px' }} />
                            APARTMENT DETAILS
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={labelCell}>Resident</td>
                        <td style={valueCell}>{prospect.residentName1}{prospect.residentName2 && `, ${prospect.residentName2}`}</td>
                        <td style={labelCell}>Apartment #</td>
                        <td style={valueCell}>{unit.apartmentNumber}</td>
                    </tr>
                    <tr>
                        <td style={labelCell}>Building</td>
                        <td style={valueCell}>{unit.buildingNumber}</td>
                        <td style={labelCell}>Mailbox</td>
                        <td style={valueCell}>{unit.mailboxNumber}</td>
                    </tr>
                    <tr>
                        <td style={labelCell}>Parking</td>
                        <td style={valueCell}>{unit.parkingNumber}</td>
                        <td style={labelCell}>Garage</td>
                        <td style={valueCell}>{unit.garageNumber}</td>
                    </tr>
                    <tr>
                        <td style={labelCell}>Storage</td>
                        <td style={valueCell}>{unit.storageUnitNumber}</td>
                        <td style={labelCell}>Floor Plan</td>
                        <td style={valueCell}>{unit.floorPlanName} ({unit.bedroomsBaths})</td>
                    </tr>
                    <tr>
                        <td style={labelCell}>Move-In Date</td>
                        <td style={valueCell}>{formatDate(unit.moveInDate)}</td>
                        <td style={labelCell}>Lease End</td>
                        <td style={valueCell}>{formatDate(unit.leaseEndDate)}</td>
                    </tr>
                    <tr>
                        <td style={labelCell}>Lease Term</td>
                        <td style={valueCell} colSpan={3}>{computed.leaseTermMonths} months, {computed.leaseTermDays} days</td>
                    </tr>
                </tbody>
            </table>

            {/* Monthly Charges with Prorated */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <td colSpan={3} style={sectionHeader}>MONTHLY CHARGES</td>
                    </tr>
                    <tr style={{ background: '#eef2f5' }}>
                        <td style={{ ...thCell, width: '50%' }}>Description</td>
                        <td style={{ ...thCell, width: '25%', textAlign: 'right' }}>Monthly</td>
                        <td style={{ ...thCell, width: '25%', textAlign: 'right' }}>Prorated</td>
                    </tr>
                </thead>
                <tbody>
                    {chargeRows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                            <td style={dataCell}>{row.name}</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(row.monthly)}</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(row.prorated)}</td>
                        </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #3d4f5f', fontWeight: 700 }}>
                        <td style={dataCell}>Total Monthly Charges</td>
                        <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.totalMonthlyCharges)}</td>
                        <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.proratedTotal)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Concessions */}
            {concessions.hasConcessions && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <thead>
                        <tr>
                            <td colSpan={2} style={sectionHeader}>CONCESSIONS</td>
                        </tr>
                    </thead>
                    <tbody>
                        {computed.recurringConcessionAmount > 0 && (
                            <tr>
                                <td style={dataCell}>Recurring Concession{concessions.recurringPercentage > 0 ? ` (${concessions.recurringPercentage}%)` : ''}</td>
                                <td style={{ ...dataCell, textAlign: 'right', color: '#c0392b' }}>-{formatCurrency(calculateProratedAmount(computed.recurringConcessionAmount, computed.prorateFraction))}</td>
                            </tr>
                        )}
                        {concessions.upfrontAmount > 0 && (
                            <tr>
                                <td style={dataCell}>One-Time Move-In Concession</td>
                                <td style={{ ...dataCell, textAlign: 'right', color: '#c0392b' }}>-{formatCurrency(concessions.upfrontAmount)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* One-Time Fees */}
            {oneTimeFees.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                    <thead>
                        <tr>
                            <td colSpan={2} style={sectionHeader}>ONE-TIME FEES</td>
                        </tr>
                    </thead>
                    <tbody>
                        {oneTimeFees.map((fee, i) => (
                            <tr key={i}>
                                <td style={dataCell}>{fee.name}</td>
                                <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(fee.amount)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 700, borderTop: '1px solid #ccc' }}>
                            <td style={dataCell}>Total Fees</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.totalNonRefundableFees)}</td>
                        </tr>
                    </tbody>
                </table>
            )}

            {/* Deposits */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <td colSpan={2} style={sectionHeader}>
                            <img src={`${basePath}/icon-deposit.png`} alt="" style={{ height: '14px', verticalAlign: 'middle', marginRight: '6px' }} />
                            DEPOSITS
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {deposits.securityDeposit > 0 && (
                        <tr>
                            <td style={dataCell}>Security Deposit (Refundable)</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(deposits.securityDeposit)}</td>
                        </tr>
                    )}
                    {deposits.petDeposit > 0 && (
                        <tr>
                            <td style={dataCell}>Pet Deposit (Refundable)</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(deposits.petDeposit)}</td>
                        </tr>
                    )}
                    <tr style={{ fontWeight: 700, borderTop: '1px solid #ccc' }}>
                        <td style={dataCell}>Total Deposits</td>
                        <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.totalDeposits)}</td>
                    </tr>
                </tbody>
            </table>

            {/* SUMMARY / TOTAL DUE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <td colSpan={2} style={sectionHeader}>
                            <img src={`${basePath}/icon-money.png`} alt="" style={{ height: '14px', verticalAlign: 'middle', marginRight: '6px' }} />
                            MOVE-IN SUMMARY
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={dataCell}>Prorated Rent & Monthly Charges</td>
                        <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.proratedTotal)}</td>
                    </tr>
                    {computed.chargeNextMonth && (
                        <tr>
                            <td style={dataCell}>Next Month's Rent (Move-in after 25th)</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.nextMonthRent)}</td>
                        </tr>
                    )}
                    <tr>
                        <td style={dataCell}>Total Deposits</td>
                        <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.totalDeposits)}</td>
                    </tr>
                    {computed.totalNonRefundableFees > 0 && (
                        <tr>
                            <td style={dataCell}>Total One-Time Fees</td>
                            <td style={{ ...dataCell, textAlign: 'right' }}>{formatCurrency(computed.totalNonRefundableFees)}</td>
                        </tr>
                    )}
                    <tr style={{ fontWeight: 700 }}>
                        <td style={{ ...dataCell, borderTop: '1px solid #ccc' }}>Subtotal</td>
                        <td style={{ ...dataCell, textAlign: 'right', borderTop: '1px solid #ccc' }}>{formatCurrency(computed.subtotalMoveIn)}</td>
                    </tr>
                    {computed.moveInConcessionDeduction > 0 && (
                        <tr>
                            <td style={{ ...dataCell, color: '#c0392b' }}>Less: Concessions</td>
                            <td style={{ ...dataCell, textAlign: 'right', color: '#c0392b' }}>-{formatCurrency(computed.moveInConcessionDeduction)}</td>
                        </tr>
                    )}
                    {deposits.holdingDeposit > 0 && deposits.holdingDepositDeductedFromMoveIn && (
                        <tr>
                            <td style={{ ...dataCell, color: '#c0392b' }}>Less: Holding Deposit Already Paid</td>
                            <td style={{ ...dataCell, textAlign: 'right', color: '#c0392b' }}>-{formatCurrency(deposits.holdingDeposit)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* TOTAL DUE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                <tbody>
                    <tr style={{ background: '#3d4f5f' }}>
                        <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: '12pt' }}>
                            TOTAL DUE AT MOVE-IN
                        </td>
                        <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: '12pt', textAlign: 'right' }}>
                            {formatCurrency(computed.totalDueAtMoveIn)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Payment Method */}
            <div style={{ fontSize: '8pt', color: '#444', marginBottom: '12px', padding: '6px 10px', background: '#f5f7fa', border: '1px solid #e0e5ea', borderRadius: '2px' }}>
                <strong>Accepted at Move-In:</strong> {ps.paymentType}
            </div>

            {/* Know Before You Move-In */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                <thead>
                    <tr>
                        <td style={sectionHeader}>KNOW BEFORE YOU MOVE IN</td>
                    </tr>
                </thead>
                <tbody>
                    {moveInNotes.map((note, i) => (
                        <tr key={i}>
                            <td style={{ padding: '3px 10px', fontSize: '7.5pt', color: '#555', borderBottom: '1px solid #f0f0f0' }}>
                                {i + 1}. {note}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Signature Lines */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', paddingRight: '20px' }}>
                            <div style={{ borderBottom: '1px solid #333', marginBottom: '4px', paddingBottom: '20px' }} />
                            <div style={{ fontSize: '8pt', color: '#666' }}>Applicant Signature / Date</div>
                        </td>
                        <td style={{ width: '50%', paddingLeft: '20px' }}>
                            <div style={{ borderBottom: '1px solid #333', marginBottom: '4px', paddingBottom: '20px' }} />
                            <div style={{ fontSize: '8pt', color: '#666' }}>Property Representative / Date</div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ paddingRight: '20px', paddingTop: '16px' }}>
                            <div style={{ borderBottom: '1px solid #333', marginBottom: '4px', paddingBottom: '20px' }} />
                            <div style={{ fontSize: '8pt', color: '#666' }}>Community Manager / Date</div>
                        </td>
                        <td />
                    </tr>
                </tbody>
            </table>

            {/* Equal Housing Logo */}
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <img
                    src={`${basePath}/equal-housing.jpeg`}
                    alt="Equal Housing Opportunity"
                    style={{ height: '30px' }}
                />
            </div>
        </div>
    );
};

// ── Shared inline styles ──
const sectionHeader: React.CSSProperties = {
    background: '#3d4f5f',
    color: '#fff',
    fontWeight: 700,
    fontSize: '8.5pt',
    padding: '5px 10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
};

const labelCell: React.CSSProperties = {
    padding: '3px 8px',
    fontSize: '8pt',
    color: '#666',
    borderBottom: '1px solid #eee',
    width: '15%',
};

const valueCell: React.CSSProperties = {
    padding: '3px 8px',
    fontSize: '8.5pt',
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #eee',
    width: '35%',
};

const thCell: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '7.5pt',
    fontWeight: 700,
    color: '#3d4f5f',
    borderBottom: '1px solid #ccc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const dataCell: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '8.5pt',
    borderBottom: '1px solid #eee',
};
