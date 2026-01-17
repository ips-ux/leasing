import { useState } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import { useUsers } from '../hooks/useUsers';
import { extractFirstName } from '../utils/user';
import { Card } from '../components/ui';
import { format, subMonths, setDate, isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

type ReportType = 'move-in' | 'eod';

export const Reports = () => {
  const { applicants, loading } = useApplicants();
  const { users } = useUsers();
  const [selectedReport, setSelectedReport] = useState<ReportType>('move-in');

  // Calculate date range for Move-In Report
  // 25th of previous month to 25th of current month
  const today = new Date();
  const currentMonth25th = endOfDay(setDate(today, 25));
  const prevMonth25th = startOfDay(setDate(subMonths(today, 1), 25));

  const filteredApplicants = applicants.filter(app => {
    if (!app['1_Profile'].moveInDate) return false;

    const moveInDate = app['1_Profile'].moveInDate instanceof Timestamp
      ? app['1_Profile'].moveInDate.toDate()
      : new Date(app['1_Profile'].moveInDate);

    return (isAfter(moveInDate, prevMonth25th) || isEqual(moveInDate, prevMonth25th)) &&
      (isBefore(moveInDate, currentMonth25th) || isEqual(moveInDate, currentMonth25th));
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reports</h1>
          <p className="text-black/60">Generate and view property reports</p>
        </div>

        <div className="w-64">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
            className="w-full px-4 py-2 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans focus:outline-none focus:ring-4 focus:ring-lavender/40 cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='square' stroke-linejoin='miter'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em'
            }}
          >
            <option value="move-in">Move-In Report</option>
            <option value="eod">EOD Report</option>
          </select>
        </div>
      </div>

      <Card>
        {selectedReport === 'move-in' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6 border-b-3 border-black pb-4">
              <h2 className="text-2xl font-bold">Move-In Report</h2>
              <span className="font-mono font-bold text-sm bg-lavender px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {format(prevMonth25th, 'MMM do')} - {format(currentMonth25th, 'MMM do')}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading data...</p>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-12 bg-black/5 border-2 border-dashed border-black/20">
                <p className="text-black/60 font-medium">No move-ins found for this period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-3 border-black bg-black/5">
                      <th className="py-3 px-4 font-bold border-r-2 border-black last:border-r-0">Resident Name</th>
                      <th className="py-3 px-4 font-bold border-r-2 border-black last:border-r-0">Leasing Professional</th>
                      <th className="py-3 px-4 font-bold border-r-2 border-black last:border-r-0">Concession Received</th>
                      <th className="py-3 px-4 font-bold">Move-In Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((app, index) => (
                      <tr
                        key={app.id}
                        className={`border-b-2 border-black/10 hover:bg-lavender/10 transition-colors ${index % 2 === 0 ? 'bg-white/30' : 'bg-transparent'}`}
                      >
                        <td className="py-3 px-4 border-r-2 border-black/10 font-medium">{app['1_Profile'].name || 'N/A'}</td>
                        <td className="py-3 px-4 border-r-2 border-black/10">
                          {(() => {
                            const agentId = app['2_Tracking'].assignedTo;
                            if (!agentId) return 'N/A';
                            const agent = users.find(u => u.uid === agentId);
                            return agent ? extractFirstName(agent.email) : 'Unknown';
                          })()}
                        </td>
                        <td className="py-3 px-4 border-r-2 border-black/10">
                          {app['1_Profile'].concessionApplied ? (
                            <span className="inline-block px-2 py-0.5 bg-mint/50 border border-black text-xs font-bold">
                              {app['1_Profile'].concessionApplied}
                            </span>
                          ) : (
                            <span className="text-black/40">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {app['1_Profile'].moveInDate
                            ? format(app['1_Profile'].moveInDate instanceof Timestamp ? app['1_Profile'].moveInDate.toDate() : new Date(app['1_Profile'].moveInDate), 'MMM do, yyyy')
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedReport === 'eod' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
            <div className="text-8xl animate-bounce">🚧</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Coming Soon</h2>
              <p className="text-black/60 max-w-md mx-auto">
                The End of Day (EOD) Report is currently under construction. Check back later for updates.
              </p>
            </div>
            <div className="px-4 py-2 bg-peach/20 border-2 border-peach text-peach-dark font-bold text-sm">
              FEATURE LOCKED
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
