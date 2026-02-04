import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui';
import { SubStepItem } from './SubStepItem';
import type { WorkflowStepData, SubStepData, Applicant } from '../../types/applicant';
import type { WorkflowStepConfig } from '../../lib/workflow-steps';
import { isStepComplete } from '../../lib/workflow-steps';

interface WorkflowStepProps {
    stepConfig: WorkflowStepConfig;
    stepData: WorkflowStepData;
    applicant: Applicant;
    isEnabled: boolean;
    isLocked?: boolean;
    onSubStepUpdate: (subStepId: string, updates: Partial<SubStepData>) => void;
    onSubStepDateChange: (subStepId: string, date: Date | null) => void;
    onNotesChange: (notes: string) => void;
}

export const WorkflowStep = ({
    stepConfig,
    stepData,
    applicant,
    isEnabled,
    isLocked = false,
    onSubStepUpdate,
    onSubStepDateChange,
    onNotesChange,
}: WorkflowStepProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Notes Editing State
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [localNotes, setLocalNotes] = useState(stepData.notes || '');
    const notesInputRef = useRef<HTMLTextAreaElement>(null);

    // Sync local notes when prop changes (if not editing)
    useEffect(() => {
        if (!isEditingNotes) {
            setLocalNotes(stepData.notes || '');
        }
    }, [stepData.notes, isEditingNotes]);

    // Focus textarea when editing starts
    useEffect(() => {
        if (isEditingNotes && notesInputRef.current) {
            notesInputRef.current.focus();
            // Set cursor to end
            notesInputRef.current.setSelectionRange(notesInputRef.current.value.length, notesInputRef.current.value.length);
        }
    }, [isEditingNotes]);

    const handleSaveNotes = () => {
        if (localNotes !== stepData.notes) {
            onNotesChange(localNotes);
        }
        setIsEditingNotes(false);
    };

    const handleCancelNotes = () => {
        setLocalNotes(stepData.notes || '');
        setIsEditingNotes(false);
    };

    const handleNotesKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveNotes();
        } else if (e.key === 'Escape') {
            handleCancelNotes();
        }
    };

    const stepComplete = isStepComplete(stepData, stepConfig);

    // Auto-collapse when complete
    useEffect(() => {
        if (stepComplete) {
            setIsExpanded(false);
        }
    }, [stepComplete]);

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

    // Determine badge variant
    const getBadgeVariant = (): 'success' | 'info' | 'low' => {
        if (stepComplete) return 'success';
        if (isEnabled) return 'info';
        return 'low';
    };

    return (
        <motion.div
            id={`workflow-step-${stepConfig.step}`}
            className={`
        rounded-neuro-md bg-white/60 shadow-neuro-pressed p-3
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


            {/* Step Header */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors group"
            >
                {/* Step Number Badge */}
                <Badge variant={getBadgeVariant()} className="flex-shrink-0 min-w-[2.5rem] text-center">
                    {stepConfig.step}
                </Badge>

                {/* Step Name & Progress */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
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
                            <div className="flex-1 h-1.5 bg-black/10 max-w-[150px] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-green-500"
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

                    {/* Minimized Notes Preview */}
                    {!isExpanded && stepData.notes && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hidden md:flex items-center justify-start border-l border-black/10 pl-4"
                        >
                            <div className="text-sm text-black/60 font-mono truncate max-w-full">
                                <span className="text-xs font-bold uppercase text-black/40 mr-2">Notes:</span>
                                {stepData.notes}
                            </div>
                        </motion.div>
                    )}
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

            {/* Sub-Steps & Notes Container */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 flex flex-col md:flex-row gap-6">

                            {/* Left Column: Sub-Steps */}
                            <div className="flex-1 space-y-1">
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
                                            applicant={applicant}
                                            isEnabled={isEnabled && !isLocked}
                                            onUpdate={(updates) => onSubStepUpdate(subStepConfig.id, updates)}
                                            onDateChange={(date) => onSubStepDateChange(subStepConfig.id, date)}
                                        />
                                    );
                                })}
                            </div>

                            {/* Right Column: Notes */}
                            <div className="w-full md:w-1/3 min-w-[250px] flex flex-col">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase text-black/40 tracking-wider">
                                        Notes
                                    </span>
                                    <div className="h-[1px] bg-black/10 flex-1" />
                                </div>

                                <div className="flex-1 min-h-[100px] bg-white/30 rounded-neuro-sm border border-black/5 hover:border-black/10 transition-colors">
                                    {isEditingNotes ? (
                                        <textarea
                                            ref={notesInputRef}
                                            value={localNotes}
                                            onChange={(e) => setLocalNotes(e.target.value)}
                                            onBlur={handleSaveNotes}
                                            onKeyDown={handleNotesKeyDown}
                                            placeholder="Add notes about this step..."
                                            className="w-full h-full min-h-[100px] p-3 text-sm bg-transparent border-none focus:ring-0 resize-none font-sans"
                                            disabled={isLocked}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => !isLocked && setIsEditingNotes(true)}
                                            className={`
                                                w-full h-full min-h-[100px] p-3 text-sm cursor-text
                                                ${!localNotes ? 'text-black/40 italic' : 'text-black/80'}
                                                ${isLocked ? 'cursor-default opacity-70' : ''}
                                            `}
                                        >
                                            {localNotes || 'Add notes...'}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
