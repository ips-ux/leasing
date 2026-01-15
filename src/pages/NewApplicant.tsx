import { ApplicantForm } from '../components/applicants/ApplicantForm';

export const NewApplicant = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">New Applicant</h1>
        <p className="text-black/60">Start the application processing workflow</p>
      </div>

      <ApplicantForm />
    </div>
  );
};
