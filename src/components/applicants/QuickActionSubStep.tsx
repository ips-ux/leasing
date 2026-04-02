import { useState, useEffect } from 'react';
import { getNextIncompleteSubStep, getWorkflowSteps } from '../../lib/workflow-steps';
import type { NextSubStepResult } from '../../lib/workflow-steps';
import type { Applicant } from '../../types/applicant';
import { updateSubStep, updateApplicant } from '../../firebase/firestore';
import { Button, Checkbox } from '../ui';
import toast from 'react-hot-toast';
import { getEmailTemplates } from '../../firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import type { EmailTemplate } from '../../types/emailTemplate';
import { TemplateCopyButton } from './TemplateCopyButton';

interface QuickActionSubStepProps {
    applicant: Applicant;
}

export const QuickActionSubStep = ({ applicant }: QuickActionSubStepProps) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [textValue, setTextValue] = useState('');
    const [multiValues, setMultiValues] = useState<Record<string, string>>({});
    const [isCompleting, setIsCompleting] = useState(false);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);

    useEffect(() => {
        const q = getEmailTemplates();
        const unsub = onSnapshot(q, (snap) => {
            setEmailTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailTemplate)));
        });
        return unsub;
    }, []);

    const tracking = applicant["2_Tracking"];
    const applicantType = applicant["1_Profile"]?.applicantType || 'new';
    const steps = getWorkflowSteps(applicantType);
    const lastStep = steps[steps.length - 1];
    const prePromotionSteps = steps.filter(s => s.step !== lastStep.step);

    // Use shared helper to find next action (enforces promotion gate)
    const nextAction: NextSubStepResult = getNextIncompleteSubStep(
        applicant.workflow,
        tracking.promotedToResident,
        applicantType
    );

    const current = nextAction?.type === 'substep' ? nextAction : null;

    // Reset local state when sub-step changes
    useEffect(() => {
        setTextValue('');
        setMultiValues({});
        setIsCompleting(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicant.id, current?.stepNumber, current?.config?.id]);

    if (tracking.status === 'cancelled' || (tracking.status === 'completed' && tracking.promotedToResident)) {
        return null;
    }

    const handleToggleCheckbox = async () => {
        if (!current || isUpdating || isCompleting) return;

        setIsCompleting(true);

        // Wait for animation to play
        await new Promise(resolve => setTimeout(resolve, 800));

        setIsUpdating(true);
        try {
            await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                isCompleted: true
            });
            toast.success('Step updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update');
            setIsCompleting(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveText = async () => {
        if (!current || isUpdating) return;
        let finalValue = textValue.trim();
        const variant = current.config.uiVariant;

        // Handle special multi-input for parking/storage
        if (variant === 'parking' || variant === 'storage') {
            const parts = Object.entries(multiValues)
                .filter(([_, val]) => val.trim() !== '' && val.trim() !== '0')
                .map(([price, val]) => `${val}x$${price}`);

            if (parts.length === 0) return;
            finalValue = parts.join(', ');
        } else if (variant === 'pets') {
            const parts = Object.entries(multiValues)
                .filter(([key, val]) => val.trim() !== '' && val.trim() !== '0' && key !== 'ESA' && key !== 'ESA_count')
                .map(([type, val]) => `${val}x${type}`);

            if (multiValues['ESA']) {
                parts.push(`ESA:${multiValues['ESA_count'] || '1'}`);
            }

            if (parts.length === 0) return;
            finalValue = parts.join(', ');
        }

        if (!finalValue && variant !== 'reasonable_acc') return;

        setIsUpdating(true);
        try {
            await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                isCompleted: true,
                textValue: finalValue
            });
            setTextValue('');
            setMultiValues({});
            toast.success('Step updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSkip = async () => {
        if (!current || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                isNA: true,
                isCompleted: false,
                completedAt: new Date() as any
            });
            toast.success('Step skipped');
        } catch (err) {
            console.error(err);
            toast.error('Failed to skip');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePromote = async () => {
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            await updateApplicant(applicant.id, {
                promotedToResident: true,
                promotedToResidentAt: new Date() as any,
                status: 'finalize_move_in'
            });
            toast.success('Promoted to resident!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to promote');
        } finally {
            setIsUpdating(false);
        }
    };

    // Promotion gate
    if (nextAction?.type === 'needs_promotion') {
        const lastPreStep = prePromotionSteps[prePromotionSteps.length - 1]?.step || 5;
        return (
            <div className="mt-4 pt-4 border-t-2 border-black/10 flex items-center gap-4">
                <Button
                    variant="primary"
                    onClick={(e) => {
                        e?.stopPropagation();
                        handlePromote();
                    }}
                    className="!py-1 !px-4 !text-sm flex-shrink-0"
                    disabled={isUpdating}
                >
                    🎉 Promote to Resident
                </Button>
                <span className="text-sm font-bold text-mint">Steps 1-{lastPreStep} complete!</span>
            </div>
        );
    }

    if (!current) {
        return null;
    }

    const isPaymentMethod = current.config.uiVariant === 'payment_method';
    const hasLeftButton = current.config.type !== 'textbox' && !isPaymentMethod;
    const variant = current.config.uiVariant;

    // Render save/N/A buttons for textbox variants
    const renderSaveNAButtons = () => (
        <div className="flex items-center gap-2">
            <Button
                variant="primary"
                onClick={(e) => {
                    e?.stopPropagation();
                    handleSaveText();
                }}
                disabled={isUpdating}
                className="!py-1 !px-3 !text-xs"
            >
                Save
            </Button>
            <Button
                variant="secondary"
                onClick={(e) => {
                    e?.stopPropagation();
                    handleSkip();
                }}
                disabled={isUpdating}
                className="!py-1 !px-2 !text-[10px] bg-peach/10 hover:bg-peach/20 border-peach/40 text-black/60 uppercase font-bold"
            >
                N/A
            </Button>
        </div>
    );

    // Render the textbox input based on uiVariant
    const renderTextboxInput = () => {
        if (variant === 'parking') {
            return (
                <>
                    <div className="flex items-center gap-2">
                        {['20', '35', '75'].map(price => (
                            <div key={price} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={multiValues[price] || ''}
                                    onChange={(e) => setMultiValues(prev => ({ ...prev, [price]: e.target.value }))}
                                    className="w-8 h-8 text-center text-xs rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                                    placeholder="0"
                                />
                                <span className="text-[10px] font-bold text-black/60">${price}</span>
                            </div>
                        ))}
                    </div>
                    {renderSaveNAButtons()}
                </>
            );
        }

        if (variant === 'storage') {
            return (
                <>
                    <div className="flex items-center gap-2">
                        {['75', '85', '100', '125'].map(price => (
                            <div key={price} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={multiValues[price] || ''}
                                    onChange={(e) => setMultiValues(prev => ({ ...prev, [price]: e.target.value }))}
                                    className="w-8 h-8 text-center text-xs rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                                    placeholder="0"
                                />
                                <span className="text-[10px] font-bold text-black/60">${price}</span>
                            </div>
                        ))}
                    </div>
                    {renderSaveNAButtons()}
                </>
            );
        }

        if (variant === 'pets') {
            return (
                <>
                    <div className="flex items-center gap-3">
                        {['Dog', 'Cat', 'Other'].map(type => (
                            <div key={type} className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={multiValues[type] || ''}
                                    onChange={(e) => setMultiValues(prev => ({ ...prev, [type]: e.target.value }))}
                                    className="w-8 h-8 text-center text-xs rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                                    placeholder="0"
                                />
                                <span className="text-[10px] font-bold text-black/60">{type}(s)</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1 border-l border-black/20 pl-2">
                            <div className="flex items-center">
                                <Checkbox
                                    label="ESA?"
                                    name="esa-quick"
                                    checked={!!multiValues['ESA']}
                                    onChange={(e) => setMultiValues(prev => ({ ...prev, ESA: e.target.checked ? '1' : '' }))}
                                    className="scale-75 origin-left"
                                />
                            </div>
                            {multiValues['ESA'] && (
                                <input
                                    type="text"
                                    value={multiValues['ESA_count'] || '1'}
                                    onChange={(e) => setMultiValues(prev => ({ ...prev, ESA_count: e.target.value }))}
                                    className="w-8 h-8 text-center text-xs rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                                    placeholder="1"
                                />
                            )}
                        </div>
                    </div>
                    {renderSaveNAButtons()}
                </>
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
                            onClick={async () => {
                                setIsUpdating(true);
                                try {
                                    await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                                        isCompleted: true,
                                        textValue: opt.value
                                    });
                                    toast.success('Step updated');
                                } catch (err) {
                                    toast.error('Failed to update');
                                } finally {
                                    setIsUpdating(false);
                                }
                            }}
                            disabled={isUpdating}
                            className={`
                                px-3 py-1 text-xs font-bold rounded-neuro-sm transition-all
                                ${textValue === opt.value
                                    ? 'bg-neuro-lavender text-neuro-primary shadow-neuro-pressed'
                                    : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary'}
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            );
        }

        if (variant === 'reasonable_acc') {
            // Check if ESA is active in sibling pets substep
            const petsId = current.config.id === '3e' ? '3c' : current.config.id === 't4g' ? 't4f' : null;
            let esaActive = false;
            if (petsId) {
                const wf = applicant.workflow;
                for (const stepKey of Object.keys(wf)) {
                    const petsData = wf[stepKey]?.subSteps?.[petsId];
                    if (petsData?.textValue?.includes('ESA:')) {
                        esaActive = true;
                        break;
                    }
                }
            }

            return (
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        label="Yes"
                        name={`quick-ra-yes-${applicant.id}`}
                        checked={false}
                        onChange={async () => {
                            if (isUpdating) return;
                            setIsUpdating(true);
                            try {
                                await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                                    isCompleted: true,
                                    textValue: 'Yes'
                                });
                                toast.success('Step updated');
                            } catch (err) {
                                toast.error('Failed to update');
                            } finally {
                                setIsUpdating(false);
                            }
                        }}
                        disabled={isUpdating}
                    />
                    <span className="text-xs font-mono text-black/30 font-bold">OR</span>
                    <Checkbox
                        label="No"
                        name={`quick-ra-no-${applicant.id}`}
                        checked={false}
                        onChange={async () => {
                            if (isUpdating || esaActive) return;
                            setIsUpdating(true);
                            try {
                                await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                                    isCompleted: true,
                                    textValue: 'No'
                                });
                                toast.success('Step updated');
                            } catch (err) {
                                toast.error('Failed to update');
                            } finally {
                                setIsUpdating(false);
                            }
                        }}
                        disabled={isUpdating || esaActive}
                    />
                    {esaActive && (
                        <span className="text-[10px] font-mono text-red-600 font-bold">ESA on file</span>
                    )}
                </div>
            );
        }

        // Default textbox
        return (
            <>
                <input
                    type="text"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Enter value..."
                    className="text-xs p-2 rounded-neuro-sm bg-neuro-base shadow-neuro-pressed focus:outline-none focus:ring-2 focus:ring-neuro-lavender w-32"
                />
                <div className="flex items-center gap-2">
                    <Button
                        variant="primary"
                        onClick={(e) => {
                            e?.stopPropagation();
                            handleSaveText();
                        }}
                        disabled={isUpdating || !textValue.trim()}
                        className="!py-1 !px-3 !text-xs"
                    >
                        Save
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            e?.stopPropagation();
                            handleSkip();
                        }}
                        disabled={isUpdating}
                        className="!py-1 !px-2 !text-[10px] bg-peach/10 hover:bg-peach/20 border-peach/40 text-black/60 uppercase font-bold"
                    >
                        N/A
                    </Button>
                </div>
            </>
        );
    };

    // Render email copy button if this substep has an email template
    const renderEmailButton = () => {
        const substepTemplates = emailTemplates.filter(t => t.linkedSubStepIds.includes(current.config.id));
        if (substepTemplates.length === 0) return null;

        return (
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                {substepTemplates.map(tmpl => (
                    <TemplateCopyButton
                        key={tmpl.id}
                        template={tmpl}
                        applicant={applicant}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="pt-4">
            <div className="flex flex-col" id="apps-quickstep-container">
                {/* Header Row: Button + Text */}
                <div className="flex gap-4 items-stretch">
                    {/* Left Action Button (Checkmark) - Only for non-textbox */}
                    {hasLeftButton && (
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                            <Checkbox
                                label=""
                                name={`quick-action-${applicant.id}`}
                                checked={isCompleting}
                                onChange={handleToggleCheckbox}
                                disabled={isUpdating || isCompleting}
                                className="scale-125"
                            />
                        </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-black/40 block">
                                Next Action (Step {current.stepNumber})
                            </span>
                        </div>
                        {/* Text and Actions inline */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            {/* Payment method — radio-style checkboxes, no label */}
                            {isPaymentMethod ? (
                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        label="Scan Cashier's Check to Files"
                                        name={`quick-payment-cashier-${applicant.id}`}
                                        checked={false}
                                        onChange={async () => {
                                            if (isUpdating) return;
                                            setIsUpdating(true);
                                            try {
                                                await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                                                    isCompleted: true,
                                                    textValue: 'cashiers_check'
                                                });
                                                toast.success('Step updated');
                                            } catch (err) {
                                                toast.error('Failed to update');
                                            } finally {
                                                setIsUpdating(false);
                                            }
                                        }}
                                        disabled={isUpdating}
                                    />
                                    <span className="text-xs font-mono text-black/30 font-bold">OR</span>
                                    <Checkbox
                                        label="Resident Paid Online"
                                        name={`quick-payment-online-${applicant.id}`}
                                        checked={false}
                                        onChange={async () => {
                                            if (isUpdating) return;
                                            setIsUpdating(true);
                                            try {
                                                await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                                                    isCompleted: true,
                                                    textValue: 'paid_online'
                                                });
                                                toast.success('Step updated');
                                            } catch (err) {
                                                toast.error('Failed to update');
                                            } finally {
                                                setIsUpdating(false);
                                            }
                                        }}
                                        disabled={isUpdating}
                                    />
                                </div>
                            ) : (
                                <>
                                    {(() => {
                                        const parenMatch = current.config.label.match(/^(.+?)\s*(\(.*\))$/);
                                        const mainLabel = parenMatch ? parenMatch[1] : current.config.label;
                                        const hintText = parenMatch ? parenMatch[2] : null;
                                        return (
                                            <>
                                                <p className="text-sm font-semibold text-black/80 leading-tight">
                                                    {mainLabel}
                                                </p>
                                                {hintText && (
                                                    <p className="text-[11px] text-black/40 font-mono w-full -mt-1">{hintText}</p>
                                                )}
                                            </>
                                        );
                                    })()}

                                    {/* Inputs and Secondary Actions */}
                                    {current.config.type === 'textbox' ? (
                                        <div className="flex items-center flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                            {renderTextboxInput()}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* N/A Option for checkbox-na */}
                                            {current.config.type === 'checkbox-na' && (
                                                <>
                                                    <span className="text-xs font-mono text-black/30 font-bold">OR</span>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox
                                                            label="N/A"
                                                            name={`quick-na-${applicant.id}`}
                                                            checked={false}
                                                            onChange={() => handleSkip()}
                                                            disabled={isUpdating}
                                                            className="scale-90"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Email copy buttons */}
                                            {renderEmailButton()}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
