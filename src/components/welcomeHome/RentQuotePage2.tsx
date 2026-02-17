import type { WelcomeHomeFormData } from '../../types/welcomeHomeTypes';

interface RentQuotePage2Props {
    formData: WelcomeHomeFormData;
}

export const RentQuotePage2 = ({ formData }: RentQuotePage2Props) => {
    const ps = formData.propertySettings;
    const basePath = `${import.meta.env.BASE_URL}images/welcome-home`;

    const photos = [
        { src: `${basePath}/photo-pool.jpeg`, alt: 'Resort Style Pool' },
        { src: `${basePath}/photo-gym.jpeg`, alt: 'Fitness Center' },
        { src: `${basePath}/photo-business.jpeg`, alt: 'Business Center' },
        { src: `${basePath}/photo-kitchen.jpeg`, alt: 'Kitchen' },
        { src: `${basePath}/photo-bedroom.jpeg`, alt: 'Bedroom' },
        { src: `${basePath}/photo-patio.jpeg`, alt: 'Outdoor Entertainment' },
    ];

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
            {/* Page 2 Header */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                <tbody>
                    <tr>
                        <td style={{ verticalAlign: 'top' }}>
                            <img
                                src={`${basePath}/home-starts-here.png`}
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
                        <td style={{ textAlign: 'right', verticalAlign: 'top', fontSize: '8pt', color: '#888' }}>
                            <div>RENT QUOTE — PAGE 2</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ borderBottom: '2px solid #3d4f5f', marginBottom: '16px' }} />

            {/* Property Photos Grid */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', padding: '3px', verticalAlign: 'top' }}>
                            <img src={photos[0].src} alt={photos[0].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }} />
                        </td>
                        <td style={{ width: '50%', padding: '3px', verticalAlign: 'top' }}>
                            <img src={photos[1].src} alt={photos[1].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }} />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '3px', verticalAlign: 'top' }}>
                            <img src={photos[2].src} alt={photos[2].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }} />
                        </td>
                        <td style={{ padding: '3px', verticalAlign: 'top' }}>
                            <img src={photos[3].src} alt={photos[3].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }} />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '3px', verticalAlign: 'top' }}>
                            <img src={photos[4].src} alt={photos[4].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }} />
                        </td>
                        <td style={{ padding: '3px', verticalAlign: 'top' }}>
                            <img src={photos[5].src} alt={photos[5].alt} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px' }} />
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Amenities */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '12px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <td style={sectionHeader}>APARTMENT AMENITIES</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ps.apartmentAmenities.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: '4px 10px', fontSize: '9pt', borderBottom: '1px solid #eee' }}>
                                                • {item}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                        <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '12px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <td style={sectionHeader}>COMMUNITY AMENITIES</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ps.communityAmenities.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ padding: '4px 10px', fontSize: '9pt', borderBottom: '1px solid #eee' }}>
                                                • {item}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Legal Disclaimers */}
            <div style={{ fontSize: '7.5pt', color: '#666', lineHeight: '1.6', borderTop: '1px solid #ddd', paddingTop: '12px' }}>
                <p style={{ marginBottom: '6px' }}>
                    <strong>Security Deposit:</strong> The security deposit is refundable, subject to the terms of the lease agreement. The deposit amount is determined based on screening criteria and may vary by apartment.
                </p>
                <p style={{ marginBottom: '6px' }}>
                    <strong>Renters Insurance:</strong> Residents are required to maintain renters insurance throughout the term of the lease. If proof of insurance is not provided, the community's renters liability/content program will be added to the monthly charges.
                </p>
                <p style={{ marginBottom: '6px' }}>
                    <strong>Disclaimer:</strong> All pricing, fees, and concessions are subject to change without notice and are not guaranteed until a lease agreement is fully executed. Apartment availability and pricing may vary.
                </p>
                <p style={{ marginBottom: '6px' }}>
                    *Where applicable. Amenities and features may vary by apartment and floor plan.
                </p>
            </div>

            {/* Equal Housing Logo */}
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <img
                    src={`${basePath}/equal-housing.jpeg`}
                    alt="Equal Housing Opportunity"
                    style={{ height: '36px' }}
                />
            </div>
        </div>
    );
};

const sectionHeader: React.CSSProperties = {
    background: '#3d4f5f',
    color: '#fff',
    fontWeight: 700,
    fontSize: '9pt',
    padding: '6px 10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
};
