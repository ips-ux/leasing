import { useState, useEffect } from 'react';
import { WORKFLOW_STEPS } from '../../lib/workflow-steps';
import type { SubStepConfig } from '../../lib/workflow-steps';
import type { Applicant } from '../../types/applicant';
import { updateSubStep, updateApplicant } from '../../firebase/firestore';
import { Button, Checkbox } from '../ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { EmailCopyButtons } from './EmailCopyButtons';
import requestIncomeEmail from '../../content/request-income.html?raw';
import applicationApprovedEmail from '../../content/application-approved-email.html?raw';
import finalStepsEmail from '../../content/final-steps-email.html?raw';

interface QuickActionSubStepProps {
    applicant: Applicant;
}

export const QuickActionSubStep = ({ applicant }: QuickActionSubStepProps) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [textValue, setTextValue] = useState('');
    const [multiValues, setMultiValues] = useState<Record<string, string>>({});

    // Reset local state when sub-step changes
    useEffect(() => {
        setTextValue('');
        setMultiValues({});
    }, [applicant.id, applicant["2_Tracking"].currentStep]);

    const tracking = applicant["2_Tracking"];

    if (tracking.status === 'cancelled' || (tracking.status === 'completed' && tracking.promotedToResident)) {
        return null;
    }

    // Find the current sub-step to show
    const getCurrentSubStep = () => {
        // Scan all steps (1-6) to find the first incomplete sub-step (even optional ones)
        for (let stepNum = 1; stepNum <= 6; stepNum++) {
            const stepConfig = WORKFLOW_STEPS.find(s => s.step === stepNum);
            if (!stepConfig) continue;

            const stepData = applicant.workflow[stepNum.toString()];
            if (!stepData) continue;

            const subSteps = stepConfig.subSteps;
            const firstIncomplete = subSteps.find(ss => {
                const data = stepData.subSteps[ss.id];
                return !data?.isCompleted && !data?.isNA;
            });

            if (firstIncomplete) {
                return { stepNumber: stepNum, config: firstIncomplete as SubStepConfig };
            }
        }
        return null;
    };

    const current = getCurrentSubStep();

    const handleToggleCheckbox = async () => {
        if (!current || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                isCompleted: true
            });
            toast.success('Step updated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveText = async () => {
        if (!current || isUpdating) return;
        let finalValue = textValue.trim();

        // Handle special multi-input for parking/storage/pets
        if (current?.config.id === '3a' || current?.config.id === '3b') {
            const parts = Object.entries(multiValues)
                .filter(([_, val]) => val.trim() !== '' && val.trim() !== '0')
                .map(([price, val]) => `${val}x$${price}`);

            if (parts.length === 0) return;
            finalValue = parts.join(', ');
        } else if (current?.config.id === '3c') {
            const parts = Object.entries(multiValues)
                .filter(([key, val]) => val.trim() !== '' && val.trim() !== '0' && key !== 'ESA' && key !== 'ESA_count')
                .map(([type, val]) => `${val}x${type}`);

            if (multiValues['ESA']) {
                parts.push(`ESA:${multiValues['ESA_count'] || '1'}`);
            }

            if (parts.length === 0) return;
            finalValue = parts.join(', ');
        }

        if (!finalValue && current?.config.id !== '3e') return;

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
                status: 'completed'
            });
            toast.success('Promoted to resident!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to promote');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!current) {
        // If no more sub-steps but not promoted yet
        if (tracking.currentStep === 6 && !tracking.promotedToResident) {
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
                        Promote to Resident
                    </Button>
                    <span className="text-sm font-bold text-mint">All steps complete!</span>
                </div>
            );
        }
        return null;
    }

    const hasLeftButton = current.config.type !== 'textbox';

    return (
        <div className="pt-4 border-t-2 border-black/10">
            <div className="flex flex-col" id="apps-quickstep-container">
                {/* Header Row: Button + Text */}
                <div className="flex gap-4 items-stretch">
                    {/* Left Action Button (Checkmark) - Only for non-textbox */}
                    {hasLeftButton && (
                        <Button
                            variant="secondary"
                            onClick={(e) => {
                                e?.stopPropagation();
                                handleToggleCheckbox();
                            }}
                            disabled={isUpdating}
                            className="flex-shrink-0 w-12 !p-0 flex items-center justify-center bg-lavender/20 hover:bg-lavender/40 border-lavender/50 rounded-neuro-md transition-colors"
                        >
                            <FontAwesomeIcon icon={faCheck} className="text-xl text-neuro-primary" />
                        </Button>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-black/40 block">
                                Next Action (Step {current.stepNumber})
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-black/80 leading-tight mb-2">
                            {current.config.label}
                        </p>

                        {/* Inputs and Secondary Actions - Moved here to align with text */}
                        <div className="flex flex-col gap-2 items-start">
                            {current.config.type === 'textbox' ? (
                                <div className="flex flex-col gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                    {current.config.id === '3a' ? (
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
                                        </>
                                    ) : current.config.id === '3b' ? (
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
                                        </>
                                    ) : current.config.id === '3c' ? (
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
                                        </>
                                    ) : current.config.id === '3e' ? (
                                        <div className="flex items-center gap-2">
                                            {['Yes', 'No'].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={async () => {
                                                        setIsUpdating(true);
                                                        try {
                                                            await updateSubStep(applicant.id, current.stepNumber, current.config.id, {
                                                                isCompleted: true,
                                                                textValue: val
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
                                                        ${textValue === val
                                                            ? 'bg-neuro-lavender text-neuro-primary shadow-neuro-pressed'
                                                            : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary'}
                                                    `}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
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
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* N/A Option for checkbox-na */}
                                    {current.config.type === 'checkbox-na' && (
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
                                    )}

                                    {/* Email copy buttons for specific sub-steps */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        {current.config.id === '1a' && (
                                            <EmailCopyButtons
                                                emailHtml={requestIncomeEmail}
                                                emailType="request-income"
                                                buttonPrefix="Copy"
                                                compact
                                                applicant={applicant}
                                            />
                                        )}
                                        {current.config.id === '2d' && (
                                            <EmailCopyButtons
                                                emailHtml={applicationApprovedEmail}
                                                emailType="application-approved"
                                                compact
                                                applicant={applicant}
                                            />
                                        )}
                                        {current.config.id === '4c' && (
                                            <EmailCopyButtons
                                                emailHtml={finalStepsEmail}
                                                emailType="final-steps"
                                                compact
                                                applicant={applicant}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
