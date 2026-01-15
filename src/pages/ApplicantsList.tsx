import { useNavigate } from 'react-router-dom';
import { useApplicants } from '../hooks/useApplicants';
import { ApplicantList } from '../components/applicants/ApplicantList';
import { Button, Card } from '../components/ui';

export const ApplicantsList = () => {
  const navigate = useNavigate();
  const { applicants, loading, error } = useApplicants();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card>
          <div className="text-center py-8 px-12">
            <div className="text-xl font-semibold">Loading applicants...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Error Loading Applicants</h2>
            <p className="text-black/60">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Applicants</h1>
          <p className="text-black/60">Manage and track applicant processing</p>
        </div>

        <Button variant="primary" onClick={() => navigate('/applicants/new')}>
          + New Applicant
        </Button>
      </div>

      <ApplicantList applicants={applicants} loading={loading} />
    </div>
  );
};
