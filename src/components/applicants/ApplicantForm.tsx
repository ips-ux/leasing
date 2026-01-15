import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, DatePicker, Card } from '../ui';
import { useApplicants } from '../../hooks/useApplicants';
import type { ApplicantFormData } from '../../types/applicant';

export const ApplicantForm = () => {
  const navigate = useNavigate();
  const { createApplicant } = useApplicants();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ApplicantFormData>({
    name: '',
    unit: '',
    dateApplied: new Date(),
    moveInDate: new Date(),
    concessionApplied: '',
    leasingProfessional: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string) => (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const id = await createApplicant(formData);
      if (id) {
        navigate('/applicants');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="text-2xl font-bold mb-6 transition-all duration-200 cursor-pointer">New Applicant</h2>

        <div className="space-y-4">
          <Input
            label="Applicant Name"
            name="name"
            type="text"
            placeholder="Applicant Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Unit Number"
            name="unit"
            type="text"
            placeholder="Unit Number"
            value={formData.unit}
            onChange={handleChange}
            required
          />

          <DatePicker
            label="Date Applied"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleDateChange('dateApplied')}
            required
          />

          <DatePicker
            label="Move-In Date"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleDateChange('moveInDate')}
            required
          />

          <Input
            label="Concession Applied"
            name="concessionApplied"
            type="text"
            placeholder="None, 1 month free, etc."
            value={formData.concessionApplied}
            onChange={handleChange}
          />

          <Input
            label="Leasing Professional"
            name="leasingProfessional"
            type="text"
            placeholder="Leasing Professional Name"
            value={formData.leasingProfessional}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Applicant'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/applicants')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </form>
  );
};
