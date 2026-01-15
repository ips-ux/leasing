import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../components/ui';
import { useInquiries } from '../hooks/useInquiries';
import type { InquiryFormData } from '../types/inquiry';

export const NewInquiry = () => {
  const navigate = useNavigate();
  const { addInquiry } = useInquiries();

  const [formData, setFormData] = useState<InquiryFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    unitNumber: '',
    notes: '',
  });

  const [isResident, setIsResident] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResidentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsResident(checked);
    if (!checked) {
      // Clear unit when unchecked
      setFormData((prev) => ({ ...prev, unitNumber: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await addInquiry(formData);

    if (success) {
      navigate('/inquiries');
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          New Inquiry
        </motion.h1>

        <Button variant="secondary" onClick={() => navigate('/inquiries')}>
          Cancel
        </Button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field with Resident checkbox, Priority, and Open/Closed toggle */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Input
                  label="Name"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Inquiry name or title"
                />
              </div>

              <label className="flex items-center gap-2 py-3 px-4 border-[3px] border-black bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={isResident}
                  onChange={handleResidentToggle}
                  className="w-5 h-5 border-2 border-black"
                />
                <span className="text-sm font-semibold whitespace-nowrap">Resident?</span>
              </label>

              <div>
                <label className="block text-sm font-semibold mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans focus:outline-none focus:ring-4 focus:ring-lavender/40"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="pt-3">
                <div className="flex border-[3px] border-black bg-white/10">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: 'open' }))}
                    className={`px-4 py-3 text-sm font-semibold transition-colors ${formData.status === 'open'
                      ? 'bg-peach text-black'
                      : 'bg-white/10 text-black/60 hover:bg-white/20'
                      }`}
                  >
                    Open
                  </button>
                  <div className="w-[3px] bg-black" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: 'completed' }))}
                    className={`px-4 py-3 text-sm font-semibold transition-colors ${formData.status === 'completed'
                      ? 'bg-mint text-black'
                      : 'bg-white/10 text-black/60 hover:bg-white/20'
                      }`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            </div>

            {/* Unit field - only show if Resident is checked */}
            {isResident && (
              <Input
                label="Unit"
                name="unitNumber"
                type="text"
                value={formData.unitNumber || ''}
                onChange={handleChange}
                placeholder="e.g., 101"
              />
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Detailed description of the inquiry"
                className="w-full p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans resize-none focus:outline-none focus:ring-4 focus:ring-lavender/40"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Additional notes"
                className="w-full p-3 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans resize-none focus:outline-none focus:ring-4 focus:ring-lavender/40"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t-2 border-black/20">
              <Button type="button" variant="secondary" onClick={() => navigate('/inquiries')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Inquiry'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
