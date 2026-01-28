import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Select, Textarea, Toggle } from '../ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard as faClipboardRegular } from '@fortawesome/free-regular-svg-icons';
import { faClipboardCheck, faHouseChimneyUser } from '@fortawesome/free-solid-svg-icons';
import { useUsers } from '../../hooks/useUsers';
import { extractAgentName } from '../../utils/user';
import type { InquiryFormData } from '../../types/inquiry';

interface InquiryFormProps {
    initialData: InquiryFormData;
    onSubmit: (data: InquiryFormData) => Promise<void>;
    onChange?: (data: InquiryFormData) => void;
    mode: 'new' | 'edit';
}

export const InquiryForm = ({ initialData, onSubmit, onChange, mode }: InquiryFormProps) => {
    const { users, loading: usersLoading } = useUsers();
    const [formData, setFormData] = useState<InquiryFormData>(initialData);
    const [isResident, setIsResident] = useState(mode === 'new' || !!initialData.unitNumber);

    useEffect(() => {
        setFormData(initialData);
        setIsResident(mode === 'new' ? true : !!initialData.unitNumber);
    }, [initialData, mode]);

    const agentOptions = useMemo(() => {
        return users.map((u) => ({
            label: u.Agent_Name || extractAgentName(u.email),
            value: u.uid,
        }));
    }, [users]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        onChange?.(newData);
    };

    const handleResidentToggle = () => {
        const nextValue = !isResident;
        setIsResident(nextValue);
        const newData = { ...formData, unitNumber: nextValue ? formData.unitNumber : '' };
        setFormData(newData);
        onChange?.(newData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Row: Resident, Name, Unit, Priority, Status */}
            <div className="flex items-end gap-3">
                {/* Resident Toggle Button */}
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={handleResidentToggle}
                        className={`
                            w-12 h-12 rounded-neuro-md transition-all flex items-center justify-center
                            ${isResident
                                ? 'bg-neuro-base shadow-neuro-pressed text-neuro-primary'
                                : 'bg-neuro-base shadow-neuro-flat text-neuro-muted hover:shadow-neuro-raised'
                            }
                        `}
                        title="Resident Inquiry"
                    >
                        <FontAwesomeIcon icon={faHouseChimneyUser} className="text-xl" />
                    </button>
                </div>

                {/* Animated Name & Unit Container */}
                <div className="flex-1 flex gap-3">
                    <motion.div
                        layout
                        className="flex-1"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <Input
                            label="Name"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Inquiry name or title"
                            className="w-full"
                        />
                    </motion.div>

                    <AnimatePresence mode="popLayout">
                        {isResident && (
                            <motion.div
                                initial={{ width: 0, opacity: 0, x: 20 }}
                                animate={{ width: '80px', opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: 20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="flex-shrink-0"
                            >
                                <Input
                                    label="Unit"
                                    name="unitNumber"
                                    type="text"
                                    value={formData.unitNumber || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Priority */}
                <div className="w-32">
                    <Select
                        label="Priority"
                        options={[
                            { label: 'Low', value: 'low' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'High', value: 'high' }
                        ]}
                        value={formData.priority}
                        onChange={(value) => {
                            const newData = { ...formData, priority: value as any };
                            setFormData(newData);
                            onChange?.(newData);
                        }}
                        required
                    />
                </div>

                {/* Status Toggle */}
                {mode === 'edit' && (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase text-neuro-muted ml-1">Status</span>
                        <Toggle
                            value={formData.status !== 'completed'}
                            onChange={(val) => {
                                const newData = { ...formData, status: (val ? 'open' : 'completed') as any };
                                setFormData(newData);
                                onChange?.(newData);
                            }}
                            leftIcon={<FontAwesomeIcon icon={faClipboardRegular} />}
                            rightIcon={<FontAwesomeIcon icon={faClipboardCheck} />}
                        />
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Detailed description of the inquiry"
                    rows={4}
                />
            </div>

            {/* Notes */}
            <div>
                <Textarea
                    label="Notes (Optional)"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    placeholder="Additional notes"
                    rows={3}
                />
            </div>

            {/* Assignment */}
            <Select
                label="Assigned To"
                options={agentOptions}
                value={formData.assignedTo}
                onChange={(value) => {
                    const newData = { ...formData, assignedTo: value };
                    setFormData(newData);
                    onChange?.(newData);
                }}
                placeholder={usersLoading ? 'Loading agents...' : 'Select Agent'}
                required
            />

            {/* Submit Button is handled by parent modals to keep their specific actions (Delete, Cancel, etc.) */}
            <button type="submit" id="inquiry-form-submit" className="hidden" />
        </form>
    );
};
