import type { WelcomeHomeFormData, ComputedValues } from '../../types/welcomeHomeTypes';
import { formatCurrency, formatDate, formatDateShort, getMonthlyFees, calculateProratedAmount } from '../../utils/welcomeHomeCalculations';

interface RentQuotePage1Props {
    formData: WelcomeHomeFormData;
    computed: ComputedValues;
}

export const RentQuotePage1 = ({ formData, computed }: RentQuotePage1Props) => {
    const { prospect, unit, rent, concessions, propertySettings, petRent } = formData;
    const monthlyFees = getMonthlyFees(formData.fees);

    // Build monthly charges rows
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

    const ps = propertySettings;

    return (
        <div style={{
            width: '8.5in',
            minHeight: '11in',
            margin: '0 auto',
            padding: '0.5in 0.6in',
            fontFamily: 'Calibri, Arial, sans-serif',
            fontSize: '10pt',
            color: '#333',
            background: '#fff',
            boxSizing: 'border-box',
        }}>
            {/* Header */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '60%', verticalAlign: 'top' }}>
                            <img
                                src={`${import.meta.env.BASE_URL}images/welcome-home/home-starts-here.png`}
                                alt="Home Starts Here"
                                style={{ height: '28px', marginBottom: '4px' }}
                            />
                            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#3d4f5f', letterSpacing: '1px' }}>
                                {ps.propertyName}
                            </div>
                            <div style={{ fontSize: '9pt', color: '#666', marginTop: '2px' }}>
                                {ps.propertyAddress}, {ps.propertyCityStateZip}
                            </div>
                        </td>
                        <td style={{ width: '40%', textAlign: 'right', verticalAlign: 'top', fontSize: '8pt', color: '#888' }}>
                            <div>{ps.propertyPhone}</div>
                            <div>{ps.propertyEmail}</div>
                            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Revision: {ps.revisionDate}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ borderBottom: '2px solid #3d4f5f', marginBottom: '12px' }} />

            {/* RENT QUOTE Title */}
            <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 700, color: '#3d4f5f', marginBottom: '12px', letterSpacing: '2px' }}>
                RENT QUOTE
            </div>

            {/* Guest & Apartment Info */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '12px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <td colSpan={2} style={{ ...sectionHeader }}>GUEST INFORMATION</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={labelCell}>Guest Name</td>
                                        <td style={valueCell}>{prospect.residentName1}</td>
                                    </tr>
                                    {prospect.residentName2 && (
                                        <tr>
                                            <td style={labelCell}>Guest Name 2</td>
                                            <td style={valueCell}>{prospect.residentName2}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={labelCell}>Phone</td>
                                        <td style={valueCell}>{prospect.phone}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Email</td>
                                        <td style={valueCell}>{prospect.email}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Leasing Agent</td>
                                        <td style={valueCell}>{prospect.leasingAgent}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '12px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <td colSpan={2} style={{ ...sectionHeader }}>APARTMENT INFORMATION</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={labelCell}>Apartment #</td>
                                        <td style={valueCell}>{unit.apartmentNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Floor Plan</td>
                                        <td style={valueCell}>{unit.floorPlanName}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Beds / Baths</td>
                                        <td style={valueCell}>{unit.bedroomsBaths}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Sq Ft</td>
                                        <td style={valueCell}>{unit.squareFeet}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Ready Date</td>
                                        <td style={valueCell}>{formatDate(unit.moveInDate)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Lease Details */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <thead>
                    <tr>
                        <td colSpan={4} style={{ ...sectionHeader }}>LEASE DETAILS</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={labelCell}>Move-In Date</td>
                        <td style={valueCell}>{formatDate(unit.moveInDate)}</td>
                        <td style={labelCell}>Lease Term</td>
                        <td style={valueCell}>{computed.leaseTermMonths} months, {computed.leaseTermDays} days</td>
                    </tr>
                    <tr>
                        <td style={labelCell}>Lease End Date</td>
                        <td style={valueCell}>{formatDate(unit.leaseEndDate)}</td>
                        <td style={labelCell}>Security Deposit</td>
                        <td style={valueCell}>{formatCurrency(formData.deposits.securityDeposit)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Monthly Charges */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <thead>
                    <tr>
                        <td colSpan={3} style={{ ...sectionHeader }}>MONTHLY CHARGES</td>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                    <thead>
                        <tr>
                            <td colSpan={2} style={{ ...sectionHeader }}>CONCESSIONS</td>
                        </tr>
                    </thead>
                    <tbody>
                        {computed.recurringConcessionAmount > 0 && (
                            <tr>
                                <td style={dataCell}>
                                    Recurring Concession
                                    {concessions.recurringPercentage > 0 && ` (${concessions.recurringPercentage}%)`}
                                </td>
                                <td style={{ ...dataCell, textAlign: 'right', color: '#c0392b' }}>
                                    -{formatCurrency(computed.recurringConcessionAmount)}/mo
                                </td>
                            </tr>
                        )}
                        {concessions.upfrontAmount > 0 && (
                            <tr>
                                <td style={dataCell}>One-Time Concession</td>
                                <td style={{ ...dataCell, textAlign: 'right', color: '#c0392b' }}>
                                    -{formatCurrency(concessions.upfrontAmount)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Total Monthly Leasing Price */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <tbody>
                    <tr style={{ background: '#3d4f5f' }}>
                        <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: '11pt' }}>
                            *TOTAL MONTHLY LEASING PRICE
                        </td>
                        <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 700, fontSize: '11pt', textAlign: 'right' }}>
                            {formatCurrency(computed.totalMonthlyLeasingPrice)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Summary */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8.5pt' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '2px 0', color: '#666' }}>
                            Summary of monthly rent charges: {formatCurrency(computed.totalMonthlyCharges)}
                            {computed.recurringConcessionAmount > 0 && (
                                <> less concession of {formatCurrency(computed.recurringConcessionAmount)} = {formatCurrency(computed.totalMonthlyLeasingPrice)}</>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Disclaimers */}
            <div style={{ fontSize: '7pt', color: '#888', lineHeight: '1.5', marginTop: '16px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                <p>*This is a quote and is subject to change. This is not a guarantee of pricing. Pricing may vary based on availability, lease term, and other factors. Please contact the leasing office for the most current pricing and availability.</p>
                <p style={{ marginTop: '4px' }}>*Quoted pricing valid for {formatDateShort(unit.moveInDate)} move-in date only. Pricing for alternative move-in dates may vary.</p>
                <p style={{ marginTop: '4px' }}>*All fees, deposits, and charges are subject to the terms and conditions outlined in the lease agreement.</p>
            </div>

            {/* Equal Housing Logo */}
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <img
                    src={`${import.meta.env.BASE_URL}images/welcome-home/equal-housing.jpeg`}
                    alt="Equal Housing Opportunity"
                    style={{ height: '36px' }}
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
    fontSize: '9pt',
    padding: '6px 10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
};

const labelCell: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '9pt',
    color: '#666',
    borderBottom: '1px solid #eee',
    width: '35%',
};

const valueCell: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '9pt',
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #eee',
};

const thCell: React.CSSProperties = {
    padding: '5px 8px',
    fontSize: '8pt',
    fontWeight: 700,
    color: '#3d4f5f',
    borderBottom: '1px solid #ccc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const dataCell: React.CSSProperties = {
    padding: '5px 8px',
    fontSize: '9pt',
    borderBottom: '1px solid #eee',
};
