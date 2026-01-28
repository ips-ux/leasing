import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui';
import type { Inquiry, InquiryPriority } from '../../types/inquiry';
import { formatDistanceToNow } from 'date-fns';

interface InquiryListItemProps {
    inquiry: Inquiry;
    onUpdate: (id: string, data: Partial<Inquiry>) => Promise<void>;
    onClick: () => void;
}

export const InquiryListItem = ({ inquiry, onUpdate, onClick }: InquiryListItemProps) => {
    const [editingField, setEditingField] = useState<'description' | 'notes' | null>(null);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (editingField && inputRef.current) {
            inputRef.current.focus();
            // Set cursor to end
            inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
        }
    }, [editingField]);

    const handleStartEdit = (field: 'description' | 'notes', value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingField(field);
        setEditValue(value || '');
    };

    const handleSave = async () => {
        if (!editingField) return;

        const field = editingField;
        const value = editValue.trim();

        // Optimistic update or wait for parent?
        // For now, just call update. The parent should handle state refresh.
        try {
            if (value !== inquiry[field]) {
                await onUpdate(inquiry.id, { [field]: value });
            }
        } catch (error) {
            console.error('Failed to update inquiry', error);
        } finally {
            setEditingField(null);
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const getPriorityVariant = (priority: InquiryPriority) => {
        switch (priority) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'info';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onClick}
            className="group relative grid grid-cols-12 gap-4 items-center p-4 bg-white/60 rounded-neuro-md shadow-neuro-pressed hover:shadow-neuro-raised transition-all cursor-pointer mb-3"
        >
            {/* Date Box - Col 1 */}
            <div className="col-span-12 md:col-span-1 flex justify-center">
                <div className="w-12 h-12 bg-neuro-base rounded-neuro-md shadow-neuro-pressed flex flex-col items-center justify-center text-neuro-primary">
                    <span className="text-[10px] font-bold uppercase leading-none">
                        {inquiry.createdAt ? inquiry.createdAt.toDate().toLocaleDateString('en-US', { month: 'short' }) : '-'}
                    </span>
                    <span className="text-lg font-bold leading-none mt-1">
                        {inquiry.createdAt ? inquiry.createdAt.toDate().getDate() : '-'}
                    </span>
                </div>
            </div>

            {/* Priority & Unit - Col 2 */}
            <div className="col-span-12 md:col-span-1 flex flex-row md:flex-col gap-2 items-start">
                <Badge variant={getPriorityVariant(inquiry.priority)} className="w-fit">
                    {inquiry.priority.toUpperCase()}
                </Badge>
                {inquiry.unitNumber && (
                    <span className="text-xs font-mono font-bold text-neuro-secondary bg-white/50 px-2 py-1 rounded-neuro-sm">
                        Unit {inquiry.unitNumber}
                    </span>
                )}
            </div>

            {/* Main Info - Col 3 */}
            <div className="col-span-12 md:col-span-1">
                <h3 className="font-bold text-neuro-primary mb-1">{inquiry.title}</h3>
                <div className="text-xs text-neuro-muted font-mono">
                    {inquiry.createdAt ? formatDistanceToNow(inquiry.createdAt.toDate(), { addSuffix: true }) : '-'}
                </div>
            </div>

            {/* Description - Col 4-7 */}
            <div className="col-span-12 md:col-span-4 min-h-[40px] flex items-center">
                {editingField === 'description' ? (
                    <textarea
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full p-2 text-sm bg-neuro-base shadow-neuro-pressed rounded-neuro-sm border-none focus:ring-0 resize-none"
                        rows={2}
                    />
                ) : (
                    <div
                        onClick={(e) => handleStartEdit('description', inquiry.description, e)}
                        className="w-full h-full p-2 rounded-neuro-sm hover:bg-white/30 transition-colors cursor-text group/edit"
                    >
                        <p className="text-sm text-neuro-secondary line-clamp-2">
                            {inquiry.description || <span className="italic text-neuro-muted">No description</span>}
                        </p>
                    </div>
                )}
            </div>

            {/* Notes - Col 8-11 */}
            <div className="col-span-12 md:col-span-4 min-h-[40px] flex items-center">
                {editingField === 'notes' ? (
                    <textarea
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full p-2 text-sm bg-neuro-base shadow-neuro-pressed rounded-neuro-sm border-none focus:ring-0 resize-none"
                        rows={2}
                    />
                ) : (
                    <div
                        onClick={(e) => handleStartEdit('notes', inquiry.notes || '', e)}
                        className="w-full h-full p-2 rounded-neuro-sm hover:bg-white/30 transition-colors cursor-text group/edit"
                    >
                        <p className="text-sm text-neuro-secondary line-clamp-2">
                            {inquiry.notes ? (
                                <span className="italic">{inquiry.notes}</span>
                            ) : (
                                <span className="italic text-neuro-muted">Add notes...</span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Status Indicator - Col 12 */}
            <div className="col-span-12 md:col-span-1 flex justify-end">
                <div className={`w-3 h-3 rounded-full shadow-neuro-flat ${inquiry.status === 'completed' ? 'bg-green-400' :
                    inquiry.status === 'in_progress' ? 'bg-blue-400' :
                        'bg-yellow-400'
                    }`} />
            </div>
        </motion.div>
    );
};
