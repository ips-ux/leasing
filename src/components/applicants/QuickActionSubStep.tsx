import { useState, useEffect } from 'react';
import { WORKFLOW_STEPS } from '../../lib/workflow-steps';
import type { SubStepConfig } from '../../lib/workflow-steps';
import type { Applicant } from '../../types/applicant';
import { updateSubStep, updateApplicant } from '../../firebase/firestore';
import { Button } from '../ui';
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

        // Handle special multi-input for parking/storage
        if (current?.config.id === '3a' || current?.config.id === '3b') {
            const parts = Object.entries(multiValues)
                .filter(([_, val]) => val.trim() !== '' && val.trim() !== '0')
                .map(([price, val]) => `${val}x$${price}`);

            if (parts.length === 0) return;
            finalValue = parts.join(', ');
        }

        if (!finalValue) return;

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

    return (
        <div className="pt-4 border-t-2 border-black/10">
            <div className="flex items-center gap-4" id="apps-quickstep-container">
                {/* Buttons and info go here */}
                <div className="flex-shrink-0 flex items-center gap-2">
                    {/* Skip Option - only for textbox and checkbox-na */}
                    {(current.config.type === 'textbox' || current.config.type === 'checkbox-na') && (
                        <Button
                            variant="secondary"
                            onClick={(e) => {
                                e?.stopPropagation();
                                handleSkip();
                            }}
                            disabled={isUpdating}
                            className="!py-1 !px-2 !text-[10px] bg-peach/10 hover:bg-peach/20 border-peach/40 text-black/60 uppercase font-bold"
                        >
                            Skip
                        </Button>
                    )}

                    {current.config.type === 'textbox' ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {current.config.id === '3a' ? (
                                <div className="flex items-center gap-2">
                                    {['20', '35', '75'].map(price => (
                                        <div key={price} className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={multiValues[price] || ''}
                                                onChange={(e) => setMultiValues(prev => ({ ...prev, [price]: e.target.value }))}
                                                className="w-7 h-7 text-center text-xs border-2 border-black bg-white/50 focus:outline-none focus:ring-2 focus:ring-lavender"
                                                placeholder="0"
                                            />
                                            <span className="text-[10px] font-bold text-black/60">${price}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : current.config.id === '3b' ? (
                                <div className="flex items-center gap-2">
                                    {['75', '85', '100', '125'].map(price => (
                                        <div key={price} className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={multiValues[price] || ''}
                                                onChange={(e) => setMultiValues(prev => ({ ...prev, [price]: e.target.value }))}
                                                className="w-7 h-7 text-center text-xs border-2 border-black bg-white/50 focus:outline-none focus:ring-2 focus:ring-lavender"
                                                placeholder="0"
                                            />
                                            <span className="text-[10px] font-bold text-black/60">${price}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                    placeholder="Enter value..."
                                    className="text-xs p-1 border-2 border-black bg-white/50 focus:outline-none focus:ring-2 focus:ring-lavender w-32"
                                />
                            )}

                            <Button
                                variant="primary"
                                onClick={(e) => {
                                    e?.stopPropagation();
                                    handleSaveText();
                                }}
                                disabled={isUpdating || (current.config.id !== '3a' && current.config.id !== '3b' && !textValue.trim())}
                                className="!py-1 !px-3 !text-xs"
                            >
                                Save
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={(e) => {
                                e?.stopPropagation();
                                handleToggleCheckbox();
                            }}
                            disabled={isUpdating}
                            className="!py-1 !px-3 !text-xs bg-lavender/20 hover:bg-lavender/40 border-lavender/50"
                        >
                            Mark Complete
                        </Button>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase text-black/40 block">
                            Next Action (Step {current.stepNumber})
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-black/80 leading-tight">
                        {current.config.label}
                    </p>
                </div>
                {/* Email copy buttons for specific sub-steps */}
                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                    {current.config.id === '1a' && (
                        <EmailCopyButtons
                            emailHtml={requestIncomeEmail}
                            emailType="request-income"
                            buttonPrefix="Copy"
                            compact
                        />
                    )}
                    {current.config.id === '2d' && (
                        <EmailCopyButtons
                            emailHtml={applicationApprovedEmail}
                            emailType="application-approved"
                            compact
                        />
                    )}
                    {current.config.id === '4c' && (
                        <EmailCopyButtons
                            emailHtml={finalStepsEmail}
                            emailType="final-steps"
                            compact
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
