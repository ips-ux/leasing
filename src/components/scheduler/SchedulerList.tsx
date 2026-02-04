/**
 * SchedulerList Component
 * Sortable table with filtering and search
 */

import { useState, useMemo } from 'react';
import type { Reservation, ReservationStatus, ResourceType } from '../../types/scheduler';
import { formatPrice } from '../../services/scheduler/pricingService';
import { Button } from '../ui';

interface SchedulerListProps {
  reservations: Reservation[];
  onEditReservation: (reservation: Reservation) => void;
  currentDate: Date;
}

type SortField =
  | 'rented_to'
  | 'item'
  | 'start_time'
  | 'end_time'
  | 'total_cost'
  | 'status';
type SortDirection = 'asc' | 'desc';

const getResourceColor = (resourceType: ResourceType): string => {
  switch (resourceType) {
    case 'GUEST_SUITE':
      return 'bg-neuro-yellow';
    case 'SKY_LOUNGE':
      return 'bg-neuro-blue';
    case 'GEAR_SHED':
      return 'bg-neuro-mint';
    default:
      return 'bg-neuro-lavender';
  }
};

const getStatusBadgeClass = (status: ReservationStatus): string => {
  switch (status) {
    case 'Scheduled':
      return 'bg-neuro-mint text-green-800';
    case 'Complete':
      return 'bg-neuro-blue text-blue-800';
    case 'Cancelled':
      return 'bg-neuro-peach text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

export const SchedulerList = ({
  reservations,
  onEditReservation,
  currentDate,
}: SchedulerListProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('start_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // Apply date filter (show reservations that overlap with the current month)
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    filtered = filtered.filter((res) => {
      const resStart = new Date(res.start_time);
      const resEnd = new Date(res.end_time);
      return resStart <= endOfMonth && resEnd >= startOfMonth;
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (res) =>
          res.rented_to.toLowerCase().includes(searchLower) ||
          res.item.toLowerCase().includes(searchLower) ||
          res.scheduled_by.toLowerCase().includes(searchLower) ||
          res.rental_notes?.toLowerCase().includes(searchLower) ||
          res.return_notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((res) => res.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle dates
      if (sortField === 'start_time' || sortField === 'end_time') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Handle numbers
      if (sortField === 'total_cost') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [reservations, search, statusFilter, sortField, sortDirection, currentDate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-neuro-secondary/50 ml-1">⇅</span>;
    }
    return (
      <span className="text-neuro-primary ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by unit, item, staff, or notes..."
          className="flex-1 px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ReservationStatus | 'all')
          }
          className="px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-flat border-none focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Complete">Complete</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-neuro-lg shadow-neuro-flat bg-neuro-element">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20 text-left text-sm font-semibold text-neuro-secondary">
              <th
                className="p-4 cursor-pointer hover:text-neuro-primary transition-colors"
                onClick={() => handleSort('rented_to')}
              >
                Unit <SortIcon field="rented_to" />
              </th>
              <th
                className="p-4 cursor-pointer hover:text-neuro-primary transition-colors"
                onClick={() => handleSort('item')}
              >
                Item <SortIcon field="item" />
              </th>
              <th
                className="p-4 cursor-pointer hover:text-neuro-primary transition-colors"
                onClick={() => handleSort('start_time')}
              >
                Start <SortIcon field="start_time" />
              </th>
              <th
                className="p-4 cursor-pointer hover:text-neuro-primary transition-colors"
                onClick={() => handleSort('end_time')}
              >
                End <SortIcon field="end_time" />
              </th>
              <th
                className="p-4 cursor-pointer hover:text-neuro-primary transition-colors"
                onClick={() => handleSort('total_cost')}
              >
                Price <SortIcon field="total_cost" />
              </th>
              <th
                className="p-4 cursor-pointer hover:text-neuro-primary transition-colors"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th className="p-4">Scheduled By</th>
              <th className="p-4">Completed By</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-neuro-secondary">
                  No reservations found
                </td>
              </tr>
            ) : (
              filteredReservations.map((res) => (
                <tr
                  key={res.tx_id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 font-medium text-neuro-primary">
                    {res.rented_to}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${getResourceColor(
                          res.resource_type
                        )}`}
                      />
                      <span className="text-neuro-primary">{res.item}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-neuro-secondary">
                    {formatDateTime(res.start_time)}
                  </td>
                  <td className="p-4 text-sm text-neuro-secondary">
                    {formatDateTime(res.end_time)}
                  </td>
                  <td className="p-4 font-medium text-neuro-primary">
                    {formatPrice(res.total_cost)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        res.status
                      )}`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neuro-secondary">
                    {res.scheduled_by}
                  </td>
                  <td className="p-4 text-sm text-neuro-secondary">
                    {res.completed_by || '-'}
                  </td>
                  <td className="p-4 text-sm text-neuro-secondary max-w-xs truncate">
                    <div className="space-y-1">
                      {res.rental_notes && (
                        <div title={res.rental_notes}>
                          <span className="font-medium">Rental:</span>{' '}
                          {res.rental_notes}
                        </div>
                      )}
                      {res.return_notes && (
                        <div title={res.return_notes}>
                          <span className="font-medium">Return:</span>{' '}
                          {res.return_notes}
                        </div>
                      )}
                      {!res.rental_notes && !res.return_notes && '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="secondary"
                      onClick={() => onEditReservation(res)}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="text-sm text-neuro-secondary text-center">
        Showing {filteredReservations.length} of {reservations.length}{' '}
        reservation(s)
      </div>
    </div>
  );
};
