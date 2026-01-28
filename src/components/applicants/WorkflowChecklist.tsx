import { motion } from 'framer-motion';
import { WorkflowStep } from './WorkflowStep';
import { WORKFLOW_STEPS, isStepComplete } from '../../lib/workflow-steps';
import type { Applicant, SubStepData } from '../../types/applicant';
import { Button } from '../ui';

interface WorkflowChecklistProps {
    applicant: Applicant;
    onSubStepUpdate: (stepNumber: number, subStepId: string, updates: Partial<SubStepData>) => Promise<void>;
    onSubStepDateChange: (stepNumber: number, subStepId: string, date: Date | null) => Promise<void>;
    onNotesChange: (stepNumber: number, notes: string) => Promise<void>;
    onPromoteToResident?: () => Promise<void>;
}

export const WorkflowChecklist = ({
    applicant,
    onSubStepUpdate,
    onSubStepDateChange,
    onNotesChange,
    onPromoteToResident,
}: WorkflowChecklistProps) => {
    const { workflow } = applicant;
    const tracking = applicant["2_Tracking"];
    const promotedToResident = tracking.promotedToResident;

    // Sequential logic: step N is only enabled if step N-1 is completed
    const isStepEnabled = (stepNumber: number): boolean => {
        // Step 6 (Post Move-In) requires promotion
        if (stepNumber === 6) {
            return promotedToResident;
        }

        if (stepNumber === 1) return true;
        const prevStepConfig = WORKFLOW_STEPS.find((s) => s.step === stepNumber - 1);
        const prevStepData = workflow[String(stepNumber - 1)];
        if (!prevStepConfig || !prevStepData) return false;
        return isStepComplete(prevStepData, prevStepConfig);
    };

    // Check if steps 1-5 are all complete (needed for promotion)
    const canPromote = !promotedToResident && WORKFLOW_STEPS
        .filter(s => s.step <= 5)
        .every(step => {
            const stepData = workflow[String(step.step)];
            return stepData && isStepComplete(stepData, step);
        });

    // Calculate overall progress
    const completedSteps = WORKFLOW_STEPS.filter((step) => {
        const stepData = workflow[String(step.step)];
        return stepData && isStepComplete(stepData, step);
    }).length;

    // Calculate total sub-steps progress
    let totalSubSteps = 0;
    let completedSubSteps = 0;
    WORKFLOW_STEPS.forEach((step) => {
        totalSubSteps += step.subSteps.length;
        const stepData = workflow[String(step.step)];
        if (stepData?.subSteps) {
            step.subSteps.forEach((ss) => {
                const subStepData = stepData.subSteps[ss.id];
                if (subStepData) {
                    if (ss.type === 'textbox') {
                        if (subStepData.isNA || (subStepData.textValue && subStepData.textValue.trim() !== '')) {
                            completedSubSteps++;
                        }
                    } else if (subStepData.isCompleted || subStepData.isNA) {
                        completedSubSteps++;
                    }
                }
            });
        }
    });

    const progressPercentage = totalSubSteps > 0 ? (completedSubSteps / totalSubSteps) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="rounded-neuro-md bg-white/60 shadow-neuro-pressed p-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Workflow Progress</h3>
                    <div className="text-right">
                        <span className="font-mono font-bold text-sm block">
                            {completedSteps} / {WORKFLOW_STEPS.length} Steps
                        </span>
                        <span className="font-mono text-xs text-black/50">
                            {completedSubSteps} / {totalSubSteps} items
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-neuro-base rounded-full shadow-neuro-pressed p-1 mb-2">
                    <motion.div
                        className="h-full bg-neuro-primary rounded-full transition-all duration-500 shadow-neuro-flat"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{ background: 'orange' }}
                    />
                </div>

                {/* Status Text */}
                <p className="mt-2 text-sm font-mono text-black/60">
                    {completedSteps === 0 && 'Ready to begin workflow'}
                    {completedSteps > 0 && completedSteps < WORKFLOW_STEPS.length && (
                        <>Currently on Step {tracking.currentStep}: {WORKFLOW_STEPS[tracking.currentStep - 1]?.name || 'Next Step'}</>
                    )}
                    {completedSteps === WORKFLOW_STEPS.length && '🎉 All steps completed!'}
                </p>
            </div>

            {/* Workflow Steps */}
            <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.08,
                        },
                    },
                }}
            >
                {WORKFLOW_STEPS.map((stepConfig) => {
                    const stepData = workflow[String(stepConfig.step)] || {
                        stepName: stepConfig.name,
                        isCompleted: false,
                        subSteps: {},
                        notes: '',
                    };

                    return (
                        <>
                            <motion.div
                                key={stepConfig.step}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                            >
                                <WorkflowStep
                                    stepConfig={stepConfig}
                                    stepData={stepData}
                                    isEnabled={isStepEnabled(stepConfig.step)}
                                    isLocked={promotedToResident && stepConfig.step <= 5}
                                    onSubStepUpdate={(subStepId, updates) =>
                                        onSubStepUpdate(stepConfig.step, subStepId, updates)
                                    }
                                    onSubStepDateChange={(subStepId, date) =>
                                        onSubStepDateChange(stepConfig.step, subStepId, date)
                                    }
                                    onNotesChange={(notes) => onNotesChange(stepConfig.step, notes)}
                                />
                            </motion.div>

                            {/* Promote to Resident button between Step 5 and 6 */}
                            {stepConfig.step === 5 && (
                                <motion.div
                                    key="promote-button"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 },
                                    }}
                                    className="flex justify-center my-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {promotedToResident ? (
                                        <div className="p-4 text-center">
                                            <p className="font-bold text-lg">✓ Promoted to Resident</p>
                                            <p className="text-sm font-mono text-black/60 mt-1">
                                                Previous steps are now locked
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            onClick={onPromoteToResident}
                                            disabled={!canPromote}
                                            className="!px-12 !py-4 text-lg"
                                        >
                                            {canPromote ? '🎉 Promote to Resident' : '⏳ Complete Steps 1-5 to Promote'}
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </>
                    );
                })}
            </motion.div>

            {/* Completion Banner */}
            {completedSteps === WORKFLOW_STEPS.length && (
                <motion.div
                    className="bg-mint border-[3px] border-black p-6 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <p className="font-bold text-xl mb-2">🎉 Workflow Complete!</p>
                    <p className="text-sm font-mono">
                        All processing steps have been completed for this applicant.
                    </p>
                </motion.div>
            )}
        </div>
    );
};
