import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ApplicantCard } from './ApplicantCard';
import { Input, Button, PageLoader } from '../ui';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';
import { useUsers } from '../../hooks/useUsers';
import type { Applicant } from '../../types/applicant';

export type ApplicantStatus = 'in_progress' | 'post_move_in' | 'completed' | 'cancelled';

interface ApplicantListProps {
  applicants: Applicant[];
  loading: boolean;
  activeStatus: ApplicantStatus;
}

type SortOption = 'dateApplied' | 'moveInDate' | 'name';

export const ApplicantList = ({ applicants, loading, activeStatus }: ApplicantListProps) => {
  const navigate = useNavigate();
  const { users, loading: usersLoading } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('moveInDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc'); // Default to asc (^) for new sort
    }
  };

  const filteredAndSortedApplicants = useMemo(() => {
    let result = [...applicants];

    // Filter by Tab
    if (activeStatus === 'in_progress') {
      result = result.filter(app => {
        // Show if strict status is in_progress
        if (app["2_Tracking"].status === 'in_progress' || app["2_Tracking"].status === 'approved') return true;

        // Also show 'finalize_move_in' IF they haven't finished step 5 yet? 
        // User said "Post Move-In" is "finished with steps 1-5". 
        // So "In Progress" should be everything BEFORE that.
        // Let's check step completion.
        const workflow = app.workflow || {};
        const steps1to5 = ['1', '2', '3', '4', '5'];
        const finishedSteps1to5 = steps1to5.every(stepId => workflow[stepId]?.isCompleted);

        // If status is 'finalize_move_in' but NOT finished steps 1-5, it's still "In Progress" (or technically pre-move-in)
        if (app["2_Tracking"].status === 'finalize_move_in' && !finishedSteps1to5) return true;

        return false;
      });
    } else if (activeStatus === 'post_move_in') {
      // "finished with steps 1-5 but not fully complete"
      result = result.filter(app => {
        // Must be in finalize_move_in status (or potentially approved if they finished steps early?)
        // Usually "Post Move-In" implies they moved in or are about to, and have follow-up tasks.

        if (app["2_Tracking"].status === 'completed' || app["2_Tracking"].status === 'cancelled') return false;

        const workflow = app.workflow || {};
        const steps1to5 = ['1', '2', '3', '4', '5'];
        const finishedSteps1to5 = steps1to5.every(stepId => workflow[stepId]?.isCompleted);

        return finishedSteps1to5;
      });
    } else if (activeStatus === 'completed') {
      result = result.filter(app => app["2_Tracking"].status === 'completed');
    } else if (activeStatus === 'cancelled') {
      result = result.filter(app => app["2_Tracking"].status === 'cancelled');
    }

    // Filter by Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app["1_Profile"].name.toLowerCase().includes(term) ||
          app["1_Profile"].unit.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dateApplied':
          comparison = (a["1_Profile"].dateApplied?.toMillis() || 0) - (b["1_Profile"].dateApplied?.toMillis() || 0);
          break;
        case 'moveInDate':
          comparison = (a["1_Profile"].moveInDate?.toMillis() || 0) - (b["1_Profile"].moveInDate?.toMillis() || 0);
          break;
        case 'name':
          comparison = a["1_Profile"].name.localeCompare(b["1_Profile"].name);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [applicants, searchTerm, sortBy, sortDirection, activeStatus]);

  const combinedLoading = loading || usersLoading;
  // showLoader is debounced — only shows spinner if loading takes >150ms (prevents flicker)
  // But we ALWAYS block card rendering on combinedLoading directly, so users are never empty
  const showLoader = useDelayedLoading(combinedLoading);

  if (showLoader) {
    return <PageLoader />;
  }

  // Hard block: don't render cards until both fetches are done, even if debounced loader didn't show
  if (combinedLoading) {
    return null;
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center py-12 bg-white/10 border-[3px] border-black/20 backdrop-blur-sm">
        <p className="text-xl font-bold mb-2">No Applicants Found</p>
        <p className="text-black/60 mb-6">Get started by adding a new applicant.</p>
        <Button onClick={() => navigate('/applicants/new')}>
          + Add Applicant
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center neu-flat p-4 -mx-4 md:mx-0">
        <div className="w-full md:w-64">
          <Input
            label=""
            placeholder="Search name or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-neuro-pressed border-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-bold uppercase text-neutral-500 whitespace-nowrap">Sort by:</span>

          <button
            onClick={() => handleSort('moveInDate')}
            className={`px-3 py-1 text-xs font-mono rounded-neuro-sm transition-all whitespace-nowrap ${sortBy === 'moveInDate' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed font-bold' : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary hover:shadow-neuro-raised'
              }`}
          >
            Move-In {sortBy === 'moveInDate' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => handleSort('dateApplied')}
            className={`px-3 py-1 text-xs font-mono rounded-neuro-sm transition-all whitespace-nowrap ${sortBy === 'dateApplied' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed font-bold' : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary hover:shadow-neuro-raised'
              }`}
          >
            Applied {sortBy === 'dateApplied' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 text-xs font-mono rounded-neuro-sm transition-all whitespace-nowrap ${sortBy === 'name' ? 'bg-neuro-base text-neuro-primary shadow-neuro-pressed font-bold' : 'bg-neuro-base text-neuro-secondary shadow-neuro-flat hover:text-neuro-primary hover:shadow-neuro-raised'
              }`}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* List View */}
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedApplicants.map((applicant, index) => (
            <motion.div
              key={applicant.id}
            >
              <ApplicantCard
                applicant={applicant}
                users={users}
                onClick={() => navigate(`/applicants/${applicant.id}`)}
              />
              {index < filteredAndSortedApplicants.length - 1 && (
                <div
                  className="my-3 h-px py-2"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.01) 20%, rgba(0,0,0,0.01) 80%, transparent)' }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAndSortedApplicants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-black/60">No applicants match your search.</p>
        </div>
      )}
    </div>
  );
};
