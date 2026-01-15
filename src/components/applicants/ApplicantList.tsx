import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ApplicantCard } from './ApplicantCard';
import { Input, Button } from '../ui';
import type { Applicant } from '../../types/applicant';

interface ApplicantListProps {
  applicants: Applicant[];
  loading: boolean;
}

type SortOption = 'dateApplied' | 'moveInDate' | 'name';

export const ApplicantList = ({ applicants, loading }: ApplicantListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('moveInDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed' | 'cancelled'>('in_progress');

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
    if (activeTab === 'in_progress') {
      result = result.filter(app => app["2_Tracking"].status === 'in_progress' || app["2_Tracking"].status === 'approved');
    } else if (activeTab === 'completed') {
      result = result.filter(app => app["2_Tracking"].status === 'completed');
    } else if (activeTab === 'cancelled') {
      result = result.filter(app => app["2_Tracking"].status === 'cancelled');
    }

    // Filter by Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app["1_Profile"].name.toLowerCase().includes(term) ||
          app["1_Profile"].unit.toLowerCase().includes(term) ||
          (app["1_Profile"].leasingProfessional && app["1_Profile"].leasingProfessional.toLowerCase().includes(term))
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
  }, [applicants, searchTerm, sortBy, sortDirection, activeTab]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white/10 border-[3px] border-black/20 animate-pulse" />
        ))}
      </div>
    );
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
      {/* Status Tabs */}
      <div className="flex gap-2 border-b-[3px] border-black pb-2">
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-6 py-2 font-bold border-[3px] border-black transition-all ${activeTab === 'in_progress' ? 'bg-lavender text-black shadow-brutal-sm' : 'bg-white/10 text-black/70 hover:bg-white/20'
            }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2 font-bold border-[3px] border-black transition-all ${activeTab === 'completed' ? 'bg-mint text-black shadow-brutal-sm' : 'bg-white/10 text-black/70 hover:bg-white/20'
            }`}
        >
          Complete
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-2 font-bold border-[3px] border-black transition-all ${activeTab === 'cancelled' ? 'bg-peach text-black shadow-brutal-sm' : 'bg-white/10 text-black/70 hover:bg-white/20'
            }`}
        >
          Cancelled
        </button>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-white/5 p-4 border-b-2 border-black/10 -mx-4 md:mx-0 md:rounded-lg">
        <div className="w-full md:w-64">
          <Input
            label=""
            placeholder="Search name or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-bold uppercase text-black/50 whitespace-nowrap">Sort by:</span>

          <button
            onClick={() => handleSort('moveInDate')}
            className={`px-3 py-1 text-xs font-mono border border-black transition-colors whitespace-nowrap ${sortBy === 'moveInDate' ? 'bg-lavender font-bold' : 'bg-white/20 hover:bg-white/40'
              }`}
          >
            Move-In {sortBy === 'moveInDate' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => handleSort('dateApplied')}
            className={`px-3 py-1 text-xs font-mono border border-black transition-colors whitespace-nowrap ${sortBy === 'dateApplied' ? 'bg-lavender font-bold' : 'bg-white/20 hover:bg-white/40'
              }`}
          >
            Applied {sortBy === 'dateApplied' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 text-xs font-mono border border-black transition-colors whitespace-nowrap ${sortBy === 'name' ? 'bg-lavender font-bold' : 'bg-white/20 hover:bg-white/40'
              }`}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* List View */}
      <div className="flex flex-col space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedApplicants.map((applicant) => (
            <motion.div
              key={applicant.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.2,
                layout: { duration: 0.3 }
              }}
            >
              <ApplicantCard
                applicant={applicant}
                onClick={() => navigate(`/applicants/${applicant.id}`)}
              />
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
