import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubStepData, Applicant } from '../../types/applicant';
import type { SubStepConfig } from '../../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';
import type { EmailTemplate } from '../../types/emailTemplate';
import { TemplateCopyButton } from './TemplateCopyButton';
import { Checkbox } from '../ui';

interface SubStepItemProps {
    config: SubStepConfig;
    data: SubStepData;
    applicant: Applicant;
    isEnabled: boolean;
    emailTemplates?: EmailTemplate[];
    onUpdate: (updates: Partial<SubStepData>) => void;
    onDateChange: (date: Date | null) => void;
}

const formatDate = (timestamp: Timestamp | Date | null): string => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatDateForInput = (timestamp: Timestamp | Date | null): string => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toISOString().split('T')[0];
};

export const SubStepItem = ({
    config,
    data,
    applicant,
    isEnabled,
    emailTemplates = [],
    onUpdate,
    onDateChange,
}: SubStepItemProps) => {
    const [localTextValue, setLocalTextValue] = useState(data.textValue || '');
    const [isEditingDate, setIsEditingDate] = useState(false);

    // Sync local text value with data
    useEffect(() => {
        setLocalTextValue(data.textValue || '');
    }, [data.textValue]);

    const handleCheckboxToggle = () => {
        if (!isEnabled || data.isNA) return;
        onUpdate({
            isCompleted: !data.isCompleted,
            completedAt: !data.isCompleted ? new Date() : null,
        });
    };

    const handleNAToggle = () => {
        if (!isEnabled) return;
        const newIsNA = !data.isNA;
        onUpdate({
            isNA: newIsNA,
            isCompleted: false,
            completedAt: newIsNA ? new Date() : null,
            textValue: newIsNA ? '' : data.textValue,
        });
    };

    const handleTextBlur = () => {
        if (localTextValue !== data.textValue) {
            onUpdate({
                textValue: localTextValue,
                isCompleted: localTextValue.trim() !== '',
                completedAt: localTextValue.trim() !== '' ? new Date() : null,
            });
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            onDateChange(new Date(value));
        } else {
            onDateChange(null);
        }
        setIsEditingDate(false);
    };

    const isCompleteOrNA = data.isCompleted || data.isNA;
    const showCompletionInfo = isCompleteOrNA && data.completedAt;
    const variant = config.uiVariant;

    // Render the textbox input based on uiVariant
    const renderTextboxInput = () => {
        if (variant === 'parking' || variant === 'storage') {
            const prices = variant === 'parking' ? ['20', '35', '75'] : ['75', '85', '100', '125'];
            return (
                <div className="flex items-center gap-3 flex-wrap">
                    {prices.map(price => {
                        const regex = new RegExp(`(\\d+)x\\$${price}`);
                        const match = data.textValue?.match(regex);
                        const count = match ? match[1] : '';

                        return (
                            <div key={price} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={count}
                                    onChange={(e) => {
                                        const newCount = e.target.value;
                                        const otherParts = (data.textValue || '')
                                            .split(', ')
                                            .filter(p => p && !p.includes(`$${price}`));

                                        let newValue = otherParts.join(', ');
                                        if (newCount && newCount !== '0' && newCount !== '') {
                                            const newPart = `${newCount}x$${price}`;
                                            newValue = newValue ? `${newValue}, ${newPart}` : newPart;
                                        }

                                        onUpdate({
                                            textValue: newValue,
                                            isCompleted: newValue.trim() !== '',
                                            completedAt: newValue.trim() !== '' ? new Date() : null,
                                        });
                                    }}
                                    disabled={!isEnabled || data.isNA}
                                    placeholder="0"
                                    className="w-8 h-8 text-center text-sm rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender disabled:opacity-50"
                                />
                                <span className="text-[10px] font-bold text-black/60">${price}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (variant === 'pets') {
            return (
                <div className="flex items-center gap-4 flex-wrap">
                    {['Dog', 'Cat', 'Other'].map(type => {
                        const regex = new RegExp(`(\\d+)x${type}`);
                        const match = data.textValue?.match(regex);
                        const count = match ? match[1] : '';

                        return (
                            <div key={type} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={count}
                                    onChange={(e) => {
                                        const newCount = e.target.value;
                                        const otherParts = (data.textValue || '')
                                            .split(', ')
                                            .filter(p => p && !p.includes(`x${type}`));

                                        let newValue = otherParts.join(', ');
                                        if (newCount && newCount !== '0' && newCount !== '') {
                                            const newPart = `${newCount}x${type}`;
                                            newValue = newValue ? `${newValue}, ${newPart}` : newPart;
                                        }

                                        onUpdate({
                                            textValue: newValue,
                                            isCompleted: newValue.trim() !== '',
                                            completedAt: newValue.trim() !== '' ? new Date() : null,
                                        });
                                    }}
                                    disabled={!isEnabled || data.isNA}
                                    placeholder="0"
                                    className="w-8 h-8 text-center text-sm rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender disabled:opacity-50"
                                />
                                <span className="text-[10px] font-bold text-black/60">{type}(s)</span>
                            </div>
                        );
                    })}

                    <div className="flex items-center gap-2 border-l border-black/20 pl-4">
                        <div className="flex items-center">
                            <Checkbox
                                label="ESA?"
                                name={`esa-${config.id}`}
                                checked={!!data.textValue?.includes('ESA:')}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    const otherParts = (data.textValue || '')
                                        .split(', ')
                                        .filter(p => p && !p.startsWith('ESA:'));

                                    let newValue = otherParts.join(', ');
                                    if (isChecked) {
                                        newValue = newValue ? `${newValue}, ESA:1` : 'ESA:1';
                                    }

                                    onUpdate({
                                        textValue: newValue,
                                        isCompleted: newValue.trim() !== '',
                                        completedAt: newValue.trim() !== '' ? new Date() : null,
                                    });
                                }}
                                disabled={!isEnabled || data.isNA}
                                className="scale-75 origin-left"
                            />
                        </div>

                        {data.textValue?.includes('ESA:') && (
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-black/60"># of ESA</span>
                                <input
                                    type="text"
                                    value={data.textValue.match(/ESA:(\d+)/)?.[1] || '1'}
                                    onChange={(e) => {
                                        const newCount = e.target.value;
                                        const otherParts = (data.textValue || '')
                                            .split(', ')
                                            .filter(p => p && !p.startsWith('ESA:'));

                                        let newValue = otherParts.join(', ');
                                        const newPart = `ESA:${newCount || '0'}`;
                                        newValue = newValue ? `${newValue}, ${newPart}` : newPart;

                                        onUpdate({
                                            textValue: newValue,
                                            isCompleted: newValue.trim() !== '',
                                            completedAt: newValue.trim() !== '' ? new Date() : null,
                                        });
                                    }}
                                    disabled={!isEnabled || data.isNA}
                                    className="w-8 h-8 text-center text-sm rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (variant === 'payment_method') {
            const options = [
                { label: "Scan Cashier's Check to Files", value: 'cashiers_check' },
                { label: 'Resident Paid Online', value: 'paid_online' },
            ];
            return (
                <div className="flex items-center gap-2">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onUpdate({
                                    textValue: opt.value,
                                    isCompleted: true,
                                    completedAt: new Date(),
                                });
                            }}
                            disabled={!isEnabled || data.isNA}
                            className={`
                                px-3 py-1 text-xs font-bold rounded-neuro-sm transition-all
                                ${data.textValue === opt.value
                                    ? 'bg-neuro-lavender text-neuro-primary shadow-neuro-pressed'
                                    : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary'}
                                disabled:opacity-50
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            );
        }

        if (variant === 'reasonable_acc') {
            // Check if ESA is active in sibling pets substep — if so, lock to Yes
            const petsId = config.id === '3e' ? '3c' : config.id === 't4g' ? 't4f' : null;
            let esaActive = false;
            if (petsId) {
                const steps = applicant.workflow;
                for (const stepKey of Object.keys(steps)) {
                    const petsData = steps[stepKey]?.subSteps?.[petsId];
                    if (petsData?.textValue?.includes('ESA:')) {
                        esaActive = true;
                        break;
                    }
                }
            }

            return (
                <div className="flex items-center gap-3">
                    <Checkbox
                        label="Yes"
                        name={`ra-yes-${config.id}`}
                        checked={data.textValue === 'Yes'}
                        onChange={() => {
                            if (!isEnabled || esaActive) return;
                            const alreadySelected = data.textValue === 'Yes';
                            onUpdate({
                                textValue: alreadySelected ? '' : 'Yes',
                                isCompleted: !alreadySelected,
                                completedAt: !alreadySelected ? new Date() : null,
                            });
                        }}
                        disabled={!isEnabled || (esaActive && data.textValue === 'Yes')}
                        className={data.textValue === 'Yes' ? 'opacity-50' : ''}
                    />
                    <span className="text-xs font-mono text-black/30 font-bold">OR</span>
                    <Checkbox
                        label="No"
                        name={`ra-no-${config.id}`}
                        checked={data.textValue === 'No'}
                        onChange={() => {
                            if (!isEnabled || esaActive) return;
                            const alreadySelected = data.textValue === 'No';
                            onUpdate({
                                textValue: alreadySelected ? '' : 'No',
                                isCompleted: !alreadySelected,
                                completedAt: !alreadySelected ? new Date() : null,
                            });
                        }}
                        disabled={!isEnabled || esaActive}
                        className={data.textValue === 'No' ? 'opacity-50' : ''}
                    />
                    {esaActive && (
                        <span className="text-[10px] font-mono text-red-600 font-bold">ESA on file — locked to Yes</span>
                    )}
                </div>
            );
        }

        // Default textbox
        return (
            <input
                type="text"
                value={localTextValue}
                onChange={(e) => setLocalTextValue(e.target.value)}
                onBlur={handleTextBlur}
                disabled={!isEnabled || data.isNA}
                placeholder="Enter value..."
                className={`
                    flex-1 max-w-[150px] min-w-[100px] px-3 py-1.5 text-sm rounded-neuro-sm
                    bg-neuro-base shadow-neuro-pressed font-mono
                    focus:outline-none focus:ring-2 focus:ring-neuro-lavender
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            />
        );
    };

    return (
        <motion.div
            className={`
        flex items-start gap-3 py-2 px-3 border-l-[3px]
        ${!config.required ? 'border-l-soft-yellow bg-soft-yellow/5' : 'border-l-lavender bg-white/5'}
        ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${isCompleteOrNA ? 'opacity-70' : ''}
        transition-all duration-150
      `}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Checkbox or Textbox */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* For checkbox and checkbox-na types */}
                    {(config.type === 'checkbox' || config.type === 'checkbox-na') && (() => {
                        // Split parenthetical hint text onto its own line
                        const parenMatch = config.label.match(/^(.+?)\s*(\(.*\))$/);
                        const mainLabel = parenMatch ? parenMatch[1] : config.label;
                        const hintText = parenMatch ? parenMatch[2] : null;
                        const hasTemplates = emailTemplates.length > 0;
                        return (
                        <div className="w-full flex flex-col">
                            <div className="flex items-center gap-3 flex-wrap">
                            <Checkbox
                                label={mainLabel}
                                name={`step-${config.id}`}
                                checked={data.isCompleted}
                                onChange={handleCheckboxToggle}
                                disabled={!isEnabled || data.isNA}
                                className={data.isCompleted || data.isNA ? 'opacity-50' : ''}
                            />

                            {/* N/A checkbox for checkbox-na type */}
                            {config.type === 'checkbox-na' && (
                                <>
                                <span className="text-xs font-mono text-black/30 font-bold">OR</span>
                                <Checkbox
                                    label="N/A"
                                    name={`na-${config.id}`}
                                    checked={data.isNA}
                                    onChange={handleNAToggle}
                                    disabled={!isEnabled}
                                    className="scale-90 ml-2"
                                />
                                </>
                            )}
                            </div>
                            {(hintText || hasTemplates) && (
                                <div className="ml-8 mt-0.5 flex items-center gap-3 flex-wrap">
                                    {hintText && (
                                        <p className="text-[11px] text-black/40 font-mono">{hintText}</p>
                                    )}
                                    {emailTemplates.map(tmpl => (
                                        <TemplateCopyButton
                                            key={tmpl.id}
                                            template={tmpl}
                                            applicant={applicant}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        );
                    })()}

                    {/* Payment method — radio-style pair like checkbox-na */}
                    {config.type === 'textbox' && variant === 'payment_method' && (
                        <>
                            <Checkbox
                                label="Scan Cashier's Check to Files"
                                name={`payment-cashier-${config.id}`}
                                checked={data.textValue === 'cashiers_check'}
                                onChange={() => {
                                    if (!isEnabled) return;
                                    const alreadySelected = data.textValue === 'cashiers_check';
                                    onUpdate({
                                        textValue: alreadySelected ? '' : 'cashiers_check',
                                        isCompleted: !alreadySelected,
                                        completedAt: !alreadySelected ? new Date() : null,
                                    });
                                }}
                                disabled={!isEnabled}
                                className={data.textValue === 'cashiers_check' ? 'opacity-50' : ''}
                            />
                            <span className="text-xs font-mono text-black/30 font-bold">OR</span>
                            <Checkbox
                                label="Resident Paid Online"
                                name={`payment-online-${config.id}`}
                                checked={data.textValue === 'paid_online'}
                                onChange={() => {
                                    if (!isEnabled) return;
                                    const alreadySelected = data.textValue === 'paid_online';
                                    onUpdate({
                                        textValue: alreadySelected ? '' : 'paid_online',
                                        isCompleted: !alreadySelected,
                                        completedAt: !alreadySelected ? new Date() : null,
                                    });
                                }}
                                disabled={!isEnabled}
                                className={data.textValue === 'paid_online' ? 'opacity-50' : ''}
                            />
                        </>
                    )}

                    {/* For textbox type (non-payment_method) */}
                    {config.type === 'textbox' && variant !== 'payment_method' && (
                        <>
                            <span className={`text-sm font-semibold min-w-[100px] ${data.isNA ? 'line-through text-black/50' : 'text-black'}`}>
                                {config.label}:
                            </span>

                            {renderTextboxInput()}

                            {/* N/A checkbox for textboxes (except reasonable_acc) */}
                            {variant !== 'reasonable_acc' && (
                                <div className="flex-shrink-0">
                                    <Checkbox
                                        label="N/A"
                                        name={`na-generic-${config.id}`}
                                        checked={data.isNA}
                                        onChange={handleNAToggle}
                                        disabled={!isEnabled}
                                        className={`scale-90 ml-2 ${data.isNA || data.isCompleted ? 'opacity-50' : ''}`}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Tag indicator */}
                    {config.tagOnComplete && data.isCompleted && (
                        <span className="text-[10px] font-mono bg-lavender px-1 py-0.5 border border-black">
                            → {config.tagOnComplete}
                        </span>
                    )}
                </div>

                {/* Completion date display/edit */}
                <AnimatePresence>
                    {showCompletionInfo && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1 ml-8 flex items-center gap-2"
                        >
                            <span className="text-xs font-mono text-black/50">
                                {data.isNA ? 'Marked N/A:' : 'Completed:'}
                            </span>

                            {isEditingDate ? (
                                <input
                                    type="date"
                                    value={formatDateForInput(data.completedAt)}
                                    onChange={handleDateChange}
                                    onBlur={() => setIsEditingDate(false)}
                                    autoFocus
                                    className="text-xs font-mono px-1 border border-black bg-white"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingDate(true)}
                                    className="text-xs font-mono text-black/60 hover:text-black hover:underline"
                                >
                                    {formatDate(data.completedAt)}
                                    <span className="ml-1 text-[10px]">✏️</span>
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
};
