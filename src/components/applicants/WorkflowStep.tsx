import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui';
import { SubStepItem } from './SubStepItem';
import type { WorkflowStepData, SubStepData } from '../../types/applicant';
import type { WorkflowStepConfig } from '../../lib/workflow-steps';
import { isStepComplete } from '../../lib/workflow-steps';

interface WorkflowStepProps {
    stepConfig: WorkflowStepConfig;
    stepData: WorkflowStepData;
    isEnabled: boolean;
    isLocked?: boolean;
    onSubStepUpdate: (subStepId: string, updates: Partial<SubStepData>) => void;
    onSubStepDateChange: (subStepId: string, date: Date | null) => void;
    onNotesChange: (notes: string) => void;
}

export const WorkflowStep = ({
    stepConfig,
    stepData,
    isEnabled,
    isLocked = false,
    onSubStepUpdate,
    onSubStepDateChange,
    onNotesChange,
}: WorkflowStepProps) => {
    const [showNotes, setShowNotes] = useState(!!stepData.notes);
    const [localNotes, setLocalNotes] = useState(stepData.notes || '');
    const [isExpanded, setIsExpanded] = useState(true);

    const stepComplete = isStepComplete(stepData, stepConfig);

    // Count completed sub-steps
    const completedCount = stepConfig.subSteps.filter((ss) => {
        const subStepData = stepData.subSteps?.[ss.id];
        if (!subStepData) return false;
        if (ss.type === 'textbox') {
            return subStepData.isNA || (subStepData.textValue && subStepData.textValue.trim() !== '');
        }
        return subStepData.isCompleted || subStepData.isNA;
    }).length;

    const totalCount = stepConfig.subSteps.length;

    // Determine border color
    const getBorderClass = () => {
        if (stepComplete) return 'border-l-mint';
        if (isEnabled) return 'border-l-lavender';
        return 'border-l-black/30';
    };

    // Determine badge variant
    const getBadgeVariant = (): 'success' | 'info' | 'low' => {
        if (stepComplete) return 'success';
        if (isEnabled) return 'info';
        return 'low';
    };

    const handleNotesBlur = () => {
        if (localNotes !== stepData.notes) {
            onNotesChange(localNotes);
        }
    };

    return (
        <motion.div
            id={`workflow-step-${stepConfig.step}`}
            className={`
        relative bg-white/10 backdrop-blur-sm border-[3px] border-black
        border-l-[6px] ${getBorderClass()}
        ${!isEnabled ? 'opacity-40 grayscale-[0.7]' : ''}
        ${isLocked ? 'opacity-70 bg-black/5' : ''}
        transition-all duration-200
      `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            layout
        >
            {/* Locked Indicator */}
            {isLocked && (
                <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-xs font-mono border border-white/20">
                    🔒 LOCKED
                </div>
            )}
            {/* Step Header */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
            >
                {/* Step Number Badge */}
                <Badge variant={getBadgeVariant()} className="flex-shrink-0 min-w-[2.5rem] text-center">
                    {stepConfig.step}
                </Badge>

                {/* Step Name & Progress */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${stepComplete ? 'line-through text-black/60' : 'text-black'}`}>
                            {stepConfig.name}
                        </h3>
                        {stepComplete && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-mint text-xl"
                            >
                                ✓
                            </motion.span>
                        )}
                    </div>

                    {stepConfig.subtext && (
                        <p className="text-xs font-mono text-black/50 mt-1">{stepConfig.subtext}</p>
                    )}

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-black/10 max-w-[150px]">
                            <motion.div
                                className="h-full bg-mint"
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <span className="text-xs font-mono text-black/50">
                            {completedCount}/{totalCount}
                        </span>
                    </div>
                </div>

                {/* Expand/Collapse Indicator */}
                <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-black/50 text-lg"
                >
                    ▼
                </motion.span>
            </button>

            {/* Sub-Steps */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-1">
                            {stepConfig.subSteps.map((subStepConfig) => {
                                const subStepData = stepData.subSteps?.[subStepConfig.id] || {
                                    isCompleted: false,
                                    isNA: false,
                                    completedAt: null,
                                    completedBy: null,
                                    textValue: '',
                                };

                                return (
                                    <SubStepItem
                                        key={subStepConfig.id}
                                        config={subStepConfig}
                                        data={subStepData}
                                        isEnabled={isEnabled && !isLocked}
                                        onUpdate={(updates) => onSubStepUpdate(subStepConfig.id, updates)}
                                        onDateChange={(date) => onSubStepDateChange(subStepConfig.id, date)}
                                    />
                                );
                            })}

                            {/* Notes Section */}
                            <div className="mt-4 pt-3 border-t border-black/10">
                                <button
                                    type="button"
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="text-xs font-semibold text-black/60 hover:text-black underline"
                                >
                                    {showNotes ? '▲ Hide Notes' : '▼ Step Notes'}
                                </button>

                                <AnimatePresence>
                                    {showNotes && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2"
                                        >
                                            <textarea
                                                value={localNotes}
                                                onChange={(e) => setLocalNotes(e.target.value)}
                                                onBlur={handleNotesBlur}
                                                placeholder="Add notes about this step..."
                                                className="w-full p-2 border-[2px] border-black bg-white/10 backdrop-blur-sm text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-lavender/40"
                                                rows={3}
                                                disabled={isLocked}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
