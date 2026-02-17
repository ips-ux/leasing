import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Input, Button, Toggle } from '../components/ui';
import { Select } from '../components/ui/Select';
import { createDefaultFormData, createDefaultFeeItem, FEE_CATALOG } from '../utils/welcomeHomeDefaults';
import { computeAll, formatCurrency, formatDate } from '../utils/welcomeHomeCalculations';
import type {
    WelcomeHomeFormData,
    ProrationMethod,
    PaymentType,
    FeeCategory,
} from '../types/welcomeHomeTypes';
import { RentQuotePage1 } from '../components/welcomeHome/RentQuotePage1';
import { RentQuotePage2 } from '../components/welcomeHome/RentQuotePage2';
import { MoveInCostSheet } from '../components/welcomeHome/MoveInCostSheet';

type OutputView = 'none' | 'rent-quote' | 'move-in-cost';

export const WelcomeHome = () => {
    const [formData, setFormData] = useState<WelcomeHomeFormData>(createDefaultFormData);
    const [outputView, setOutputView] = useState<OutputView>('none');

    const computed = useMemo(() => computeAll(formData), [formData]);

    // ── Field updaters ──
    const updateProspect = useCallback((field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            prospect: { ...prev.prospect, [field]: value },
        }));
    }, []);

    const updateUnit = useCallback((field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            unit: { ...prev.unit, [field]: value },
        }));
    }, []);

    const updateSettings = useCallback((field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            propertySettings: { ...prev.propertySettings, [field]: value },
        }));
    }, []);

    const updateConcessions = useCallback((field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            concessions: { ...prev.concessions, [field]: value },
        }));
    }, []);

    const updateDeposits = useCallback((field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            deposits: { ...prev.deposits, [field]: value },
        }));
    }, []);

    const updateFee = useCallback((id: string, field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            fees: prev.fees.map(f => f.id === id ? { ...f, [field]: value } : f),
        }));
    }, []);

    const removeFee = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            fees: prev.fees.filter(f => f.id !== id),
        }));
    }, []);

    const addFeeFromCatalog = useCallback((catalogName: string) => {
        const catalogItem = FEE_CATALOG.find(c => c.name === catalogName);
        if (!catalogItem) return;
        const newFee = createDefaultFeeItem(catalogItem.name, 0, catalogItem.defaultFrequency, catalogItem.category);
        setFormData(prev => ({
            ...prev,
            fees: [...prev.fees, newFee],
        }));
    }, []);

    // ── Proration method options ──
    const prorationOptions = [
        { value: 'By 30-Day Month', label: 'By 30-Day Month' },
        { value: 'By Calendar Month', label: 'By Calendar Month' },
    ];

    const paymentOptions: { value: PaymentType; label: string }[] = [
        { value: 'CHECK, eMONEY ORDER, CREDIT, OR DEBIT', label: 'Check, eMoney Order, Credit, or Debit' },
        { value: "CASHIER'S CHECK OR eMONEY ORDER ONLY", label: "Cashier's Check or eMoney Order Only" },
        { value: 'CREDIT OR DEBIT ONLY', label: 'Credit or Debit Only' },
        { value: 'CREDIT ONLY', label: 'Credit Only' },
        { value: 'DEBIT ONLY', label: 'Debit Only' },
        { value: 'eMONEY ORDER ONLY', label: 'eMoney Order Only' },
        { value: "CASHIER'S CHECK ONLY", label: "Cashier's Check Only" },
        { value: 'ALL FORMS OF PAYMENT', label: 'All Forms of Payment' },
        { value: 'CERTIFIED FUNDS ONLY', label: 'Certified Funds Only' },
        { value: 'eCHECK OR eMONEY ORDER', label: 'eCheck or eMoney Order' },
    ];

    // Available catalog items (not yet added)
    const availableCatalogItems = FEE_CATALOG.filter(
        c => !formData.fees.some(f => f.name === c.name)
    );

    // Group fees by category for display
    const feesByCategory = formData.fees.reduce((acc, fee) => {
        if (!acc[fee.category]) acc[fee.category] = [];
        acc[fee.category].push(fee);
        return acc;
    }, {} as Record<FeeCategory, typeof formData.fees>);

    // ── Output view ──
    if (outputView !== 'none') {
        return (
            <div className="min-h-screen bg-white">
                {/* Toolbar - hidden when printing */}
                <div className="print:hidden sticky top-0 z-50 bg-main border-b border-tertiary/30 px-6 py-3 flex items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => setOutputView('none')}
                        className="text-sm"
                    >
                        ← Back to Form
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => window.print()}
                        className="text-sm"
                    >
                        🖨️ Print / Save PDF
                    </Button>
                    {outputView === 'rent-quote' && (
                        <span className="text-sm text-secondary font-medium">Rent Quote Preview</span>
                    )}
                    {outputView === 'move-in-cost' && (
                        <span className="text-sm text-secondary font-medium">Move-In Cost Sheet Preview</span>
                    )}
                </div>

                {/* Document Content */}
                {outputView === 'rent-quote' && (
                    <>
                        <RentQuotePage1 formData={formData} computed={computed} />
                        <div className="print:break-before-page" />
                        <RentQuotePage2 formData={formData} />
                    </>
                )}
                {outputView === 'move-in-cost' && (
                    <MoveInCostSheet formData={formData} computed={computed} />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Welcome Home Sheet</h1>
                    <p className="text-secondary mt-1">Generate rent quotes and move-in cost sheets</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        onClick={() => setOutputView('rent-quote')}
                        className="text-sm px-5"
                    >
                        Generate Rent Quote
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setOutputView('move-in-cost')}
                        className="text-sm px-5"
                    >
                        Generate Move-In Cost Sheet
                    </Button>
                </div>
            </div>

            {/* Main Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── LEFT PANEL: Prospect Information ── */}
                <Card className="space-y-6">
                    <h2 className="text-xl font-bold text-primary border-b border-tertiary/30 pb-3">
                        Prospect Information
                    </h2>

                    {/* Resident Names */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Residents</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Resident Name 1" value={formData.prospect.residentName1} onChange={e => updateProspect('residentName1', e.target.value)} placeholder="Primary resident" />
                            <Input label="Resident Name 2" value={formData.prospect.residentName2} onChange={e => updateProspect('residentName2', e.target.value)} placeholder="Optional" />
                            <Input label="Resident Name 3" value={formData.prospect.residentName3} onChange={e => updateProspect('residentName3', e.target.value)} placeholder="Optional" />
                            <Input label="Resident Name 4" value={formData.prospect.residentName4} onChange={e => updateProspect('residentName4', e.target.value)} placeholder="Optional" />
                        </div>
                    </div>

                    {/* Contact & Agent */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Phone" value={formData.prospect.phone} onChange={e => updateProspect('phone', e.target.value)} placeholder="(555) 123-4567" />
                            <Input label="Email" value={formData.prospect.email} onChange={e => updateProspect('email', e.target.value)} placeholder="email@example.com" />
                        </div>
                        <Input label="Leasing Agent" value={formData.prospect.leasingAgent} onChange={e => updateProspect('leasingAgent', e.target.value)} placeholder="Agent name" />
                    </div>

                    {/* Unit Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Unit Details</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Apt #" value={formData.unit.apartmentNumber} onChange={e => updateUnit('apartmentNumber', e.target.value)} />
                            <Input label="Building" value={formData.unit.buildingNumber} onChange={e => updateUnit('buildingNumber', e.target.value)} />
                            <Input label="Parking #" value={formData.unit.parkingNumber} onChange={e => updateUnit('parkingNumber', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Floor Plan" value={formData.unit.floorPlanName} onChange={e => updateUnit('floorPlanName', e.target.value)} />
                            <Input label="Beds/Baths" value={formData.unit.bedroomsBaths} onChange={e => updateUnit('bedroomsBaths', e.target.value)} placeholder="2B/2B" />
                            <Input label="Sq Ft" value={formData.unit.squareFeet} onChange={e => updateUnit('squareFeet', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Garage #" value={formData.unit.garageNumber} onChange={e => updateUnit('garageNumber', e.target.value)} />
                            <Input label="Mailbox #" value={formData.unit.mailboxNumber} onChange={e => updateUnit('mailboxNumber', e.target.value)} />
                            <Input label="Storage #" value={formData.unit.storageUnitNumber} onChange={e => updateUnit('storageUnitNumber', e.target.value)} />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Lease Dates</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Move-In Date" type="date" value={formData.unit.moveInDate} onChange={e => updateUnit('moveInDate', e.target.value)} />
                            <Input label="Lease End Date" type="date" value={formData.unit.leaseEndDate} onChange={e => updateUnit('leaseEndDate', e.target.value)} />
                        </div>
                        <div className="neu-pressed px-4 py-3 text-sm">
                            <span className="text-secondary">Lease Term: </span>
                            <span className="font-bold text-primary">
                                {computed.leaseTermMonths} months, {computed.leaseTermDays} days
                            </span>
                        </div>
                    </div>

                    {/* Rent */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Rent</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Monthly Rent"
                                type="number"
                                value={formData.rent || ''}
                                onChange={e => setFormData(prev => ({ ...prev, rent: parseFloat(e.target.value) || 0 }))}
                                placeholder="0.00"
                            />
                            <Input
                                label="Pet Rent"
                                type="number"
                                value={formData.petRent || ''}
                                onChange={e => setFormData(prev => ({ ...prev, petRent: parseFloat(e.target.value) || 0 }))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </Card>

                {/* ── RIGHT PANEL: Property Settings ── */}
                <div className="space-y-6">
                    {/* Property Info */}
                    <Card className="space-y-4">
                        <h2 className="text-xl font-bold text-primary border-b border-tertiary/30 pb-3">
                            Property Settings
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Property Name" value={formData.propertySettings.propertyName} onChange={e => updateSettings('propertyName', e.target.value)} />
                            <Input label="Contact" value={formData.propertySettings.propertyContact} onChange={e => updateSettings('propertyContact', e.target.value)} />
                        </div>
                        <Input label="Address" value={formData.propertySettings.propertyAddress} onChange={e => updateSettings('propertyAddress', e.target.value)} />
                        <Input label="City, State, Zip" value={formData.propertySettings.propertyCityStateZip} onChange={e => updateSettings('propertyCityStateZip', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Phone" value={formData.propertySettings.propertyPhone} onChange={e => updateSettings('propertyPhone', e.target.value)} />
                            <Input label="Email" value={formData.propertySettings.propertyEmail} onChange={e => updateSettings('propertyEmail', e.target.value)} />
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <Toggle
                                value={formData.propertySettings.useYieldstar}
                                onChange={(v) => updateSettings('useYieldstar', v)}
                                leftLabel="Yieldstar"
                                rightLabel="Manual"
                            />
                        </div>
                    </Card>

                    {/* Concessions */}
                    <Card className="space-y-4">
                        <div className="flex items-center justify-between border-b border-tertiary/30 pb-3">
                            <h3 className="text-lg font-bold text-primary">Concessions</h3>
                            <Toggle
                                value={formData.concessions.hasConcessions}
                                onChange={(v) => updateConcessions('hasConcessions', v)}
                                leftLabel="Yes"
                                rightLabel="No"
                            />
                        </div>
                        <AnimatePresence>
                            {formData.concessions.hasConcessions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Recurring %"
                                            type="number"
                                            value={formData.concessions.recurringPercentage || ''}
                                            onChange={e => updateConcessions('recurringPercentage', parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        <Input
                                            label="Recurring $ Amount"
                                            type="number"
                                            value={formData.concessions.recurringDollarAmount || ''}
                                            onChange={e => updateConcessions('recurringDollarAmount', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <Input
                                        label="Upfront Concession Amount"
                                        type="number"
                                        value={formData.concessions.upfrontAmount || ''}
                                        onChange={e => updateConcessions('upfrontAmount', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Configuration */}
                    <Card className="space-y-4">
                        <h3 className="text-lg font-bold text-primary border-b border-tertiary/30 pb-3">Configuration</h3>
                        <Select
                            label="Proration Method"
                            options={prorationOptions}
                            value={formData.propertySettings.prorationMethod}
                            onChange={(v) => updateSettings('prorationMethod', v as ProrationMethod)}
                        />
                        <Select
                            label="Payment Type"
                            options={paymentOptions}
                            value={formData.propertySettings.paymentType}
                            onChange={(v) => updateSettings('paymentType', v as PaymentType)}
                        />
                    </Card>

                    {/* Deposits */}
                    <Card className="space-y-4">
                        <h3 className="text-lg font-bold text-primary border-b border-tertiary/30 pb-3">Deposits</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="Security Deposit"
                                type="number"
                                value={formData.deposits.securityDeposit || ''}
                                onChange={e => updateDeposits('securityDeposit', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                            <Input
                                label="Pet Deposit"
                                type="number"
                                value={formData.deposits.petDeposit || ''}
                                onChange={e => updateDeposits('petDeposit', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                            <Input
                                label="Holding Deposit"
                                type="number"
                                value={formData.deposits.holdingDeposit || ''}
                                onChange={e => updateDeposits('holdingDeposit', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                        </div>
                    </Card>

                    {/* Fees */}
                    <Card className="space-y-4">
                        <div className="flex items-center justify-between border-b border-tertiary/30 pb-3">
                            <h3 className="text-lg font-bold text-primary">Fees & Charges</h3>
                        </div>

                        {/* Fee list by category */}
                        {Object.entries(feesByCategory).map(([category, fees]) => (
                            <div key={category} className="space-y-2">
                                <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider">{category}</h4>
                                {fees.map(fee => (
                                    <div key={fee.id} className="flex items-center gap-3">
                                        <div className="flex-1 text-sm font-medium text-primary truncate">{fee.name}</div>
                                        <input
                                            type="number"
                                            className="neu-pressed w-24 px-3 py-2 text-sm text-right bg-main text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                                            value={fee.amount || ''}
                                            onChange={e => updateFee(fee.id, 'amount', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                        <button
                                            onClick={() => removeFee(fee.id)}
                                            className="text-error/60 hover:text-error text-lg font-bold w-6 h-6 flex items-center justify-center transition-colors"
                                            title="Remove fee"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Add fee button */}
                        {availableCatalogItems.length > 0 && (
                            <div className="pt-2">
                                <Select
                                    label="Add Fee"
                                    options={availableCatalogItems.map(c => ({ value: c.name, label: `${c.name} (${c.defaultFrequency})` }))}
                                    value=""
                                    onChange={(v) => addFeeFromCatalog(v)}
                                    placeholder="Select a fee to add..."
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* ── BOTTOM SECTION: Computed Summaries ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center space-y-2">
                    <div className="text-sm font-semibold text-secondary uppercase tracking-wider">Total Monthly Charges</div>
                    <div className="text-3xl font-bold text-primary">{formatCurrency(computed.totalMonthlyCharges)}</div>
                    <div className="text-xs text-secondary">Rent + recurring fees (before concession)</div>
                </Card>
                <Card className="text-center space-y-2">
                    <div className="text-sm font-semibold text-secondary uppercase tracking-wider">Prorated Amount</div>
                    <div className="text-3xl font-bold text-accent">{formatCurrency(computed.proratedTotal)}</div>
                    <div className="text-xs text-secondary">
                        {computed.prorateFraction < 1
                            ? `${(computed.prorateFraction * 100).toFixed(1)}% of month (move-in ${formatDate(formData.unit.moveInDate)})`
                            : 'Full month — no proration'}
                    </div>
                </Card>
                <Card className="text-center space-y-2">
                    <div className="text-sm font-semibold text-secondary uppercase tracking-wider">Monthly Leasing Price</div>
                    <div className="text-3xl font-bold text-success">{formatCurrency(computed.totalMonthlyLeasingPrice)}</div>
                    <div className="text-xs text-secondary">After concessions ({formatCurrency(computed.recurringConcessionAmount)}/mo)</div>
                </Card>
            </div>

            {/* Action Buttons (bottom) */}
            <div className="flex justify-center gap-4 pb-8">
                <Button
                    variant="primary"
                    onClick={() => setOutputView('rent-quote')}
                    className="px-8 py-4 text-base font-semibold"
                >
                    📋 Generate Rent Quote
                </Button>
                <Button
                    variant="primary"
                    onClick={() => setOutputView('move-in-cost')}
                    className="px-8 py-4 text-base font-semibold"
                >
                    🏠 Generate Move-In Cost Sheet
                </Button>
            </div>
        </div>
    );
};
