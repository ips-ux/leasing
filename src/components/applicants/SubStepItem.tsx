import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubStepData } from '../../types/applicant';
import type { SubStepConfig } from '../../lib/workflow-steps';
import type { Timestamp } from 'firebase/firestore';
import { EmailCopyButtons } from './EmailCopyButtons';
import requestIncomeEmail from '../../content/request-income.html?raw';
import applicationApprovedEmail from '../../content/application-approved-email.html?raw';
import finalStepsEmail from '../../content/final-steps-email.html?raw';

interface SubStepItemProps {
    config: SubStepConfig;
    data: SubStepData;
    isEnabled: boolean;
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
    isEnabled,
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
                    {(config.type === 'checkbox' || config.type === 'checkbox-na') && (
                        <>
                            <motion.button
                                type="button"
                                onClick={handleCheckboxToggle}
                                disabled={!isEnabled || data.isNA}
                                className={`
                  w-5 h-5 border-[2px] border-black flex items-center justify-center flex-shrink-0
                  ${data.isCompleted ? 'bg-mint' : 'bg-white/20'}
                  ${isEnabled && !data.isNA ? 'cursor-pointer hover:bg-white/40' : 'cursor-not-allowed'}
                  transition-colors duration-100
                `}
                                whileTap={isEnabled && !data.isNA ? { scale: 0.9 } : {}}
                            >
                                <AnimatePresence>
                                    {data.isCompleted && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="text-black font-bold text-sm leading-none"
                                        >
                                            ✓
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <span className={`text-sm ${data.isCompleted || data.isNA ? 'line-through text-black/50' : 'text-black'}`}>
                                {config.label}
                            </span>

                            {/* N/A checkbox for checkbox-na type */}
                            {config.type === 'checkbox-na' && (
                                <label className="flex gap-1 text-xs font-mono mr-4">
                                    <input
                                        type="checkbox"
                                        checked={data.isNA}
                                        onChange={handleNAToggle}
                                        disabled={!isEnabled}
                                        className="w-4 h-4 border-2 border-black"
                                    />
                                    N/A
                                </label>
                            )}
                        </>
                    )}

                    {/* For textbox type */}
                    {config.type === 'textbox' && (
                        <>
                            <span className={`text-sm font-semibold min-w-[100px] ${data.isNA ? 'line-through text-black/50' : 'text-black'}`}>
                                {config.label}:
                            </span>

                            {config.id === '3a' || config.id === '3b' ? (
                                <div className="flex-1 flex items-center gap-3 flex-wrap">
                                    {(config.id === '3a' ? ['20', '35', '75'] : ['75', '85', '100', '125']).map(price => {
                                        // Parse current value to get count for this price
                                        // Format is "1x$20, 2x$35"
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
                                                        if (newCount && newCount !== '0') {
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
                                                    className="w-8 h-8 text-center text-sm border-[2px] border-black bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-lavender/40 disabled:opacity-50"
                                                />
                                                <span className="text-[10px] font-bold text-black/60">${price}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={localTextValue}
                                    onChange={(e) => setLocalTextValue(e.target.value)}
                                    onBlur={handleTextBlur}
                                    disabled={!isEnabled || data.isNA}
                                    placeholder="Enter value..."
                                    className={`
                      flex-1 max-w-[150px] min-w-[100px] px-2 py-1 text-sm border-[2px] border-black
                      bg-white/10 backdrop-blur-sm font-mono
                      focus:outline-none focus:ring-2 focus:ring-lavender/40
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                                />
                            )}

                            {/* N/A checkbox */}
                            <label className="flex items-center gap-1 text-xs font-mono flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={data.isNA}
                                    onChange={handleNAToggle}
                                    disabled={!isEnabled}
                                    className="w-4 h-4 border-2 border-black"
                                />
                                N/A
                            </label>
                        </>
                    )}

                    {/* Optional tag indicator */}
                    {!config.required && (
                        <span className="text-[10px] font-mono bg-soft-yellow/50 px-1 py-0.5 border border-black/30">
                            optional
                        </span>
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

                {/* Email copy buttons for specific sub-steps */}
                {config.id === '1a' && (
                    <EmailCopyButtons
                        emailHtml={requestIncomeEmail}
                        emailType="request-income"
                        buttonPrefix="Copy"
                    />
                )}
                {config.id === '2d' && (
                    <EmailCopyButtons
                        emailHtml={applicationApprovedEmail}
                        emailType="application-approved"
                    />
                )}
                {config.id === '4c' && (
                    <EmailCopyButtons
                        emailHtml={finalStepsEmail}
                        emailType="final-steps"
                    />
                )}
            </div>
        </motion.div>
    );
};
