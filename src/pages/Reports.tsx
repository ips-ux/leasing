import { useState } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import { useUsers } from '../hooks/useUsers';
import { extractAgentName } from '../utils/user';
import { timestampToLocalDate } from '../utils/date';
import { Card, Button } from '../components/ui';
import { format, subMonths, setDate, isAfter, isBefore, isEqual, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

type ReportType = 'move-in' | 'concession' | 'eod';

export const Reports = () => {
  const { applicants, loading } = useApplicants();
  const { users } = useUsers();
  const [selectedReport, setSelectedReport] = useState<ReportType>('move-in');
  const [copySuccess, setCopySuccess] = useState(false);

  // Calculate date range for Concession Report (25th to 25th)
  const today = new Date();
  const concessionEnd = endOfDay(setDate(today, 25));
  const concessionStart = startOfDay(setDate(subMonths(today, 1), 25));

  // Calculate date range for Move-In Report (1st to End of Month)
  const moveInStart = startOfDay(startOfMonth(today));
  const moveInEnd = endOfDay(endOfMonth(today));

  const startDate = selectedReport === 'concession' ? concessionStart : moveInStart;
  const endDate = selectedReport === 'concession' ? concessionEnd : moveInEnd;

  const filteredApplicants = applicants
    .filter(app => {
      // Exclude cancelled applicants
      if (app['2_Tracking'].status === 'cancelled') return false;
      if (!app['1_Profile'].moveInDate) return false;

      const moveInDate = timestampToLocalDate(app['1_Profile'].moveInDate);

      return (isAfter(moveInDate, startDate) || isEqual(moveInDate, startDate)) &&
        (isBefore(moveInDate, endDate) || isEqual(moveInDate, endDate));
    })
    .sort((a, b) => {
      const dateA = timestampToLocalDate(a['1_Profile'].moveInDate);
      const dateB = timestampToLocalDate(b['1_Profile'].moveInDate);

      return dateA.getTime() - dateB.getTime(); // Earliest first
    });

  // Get agent name helper
  const getAgentName = (agentId: string | undefined) => {
    if (!agentId) return 'N/A';
    const agent = users.find(u => u.uid === agentId);
    return agent ? (agent.Agent_Name || extractAgentName(agent.email)) : 'Unknown';
  };

  // Copy table to clipboard as rich text
  const copyTableToClipboard = async () => {
    const reportTitle = selectedReport === 'concession' ? 'Concession Report' : 'Move-In Report';
    const dateRange = `${format(startDate, 'MMM do')} - ${format(endDate, 'MMM do')}`;

    // Colors for alternating rows
    const headerBg = '#4472C4';
    const headerText = '#FFFFFF';
    const evenRowBg = '#D6DCE5';
    const oddRowBg = '#FFFFFF';

    // Build HTML table for rich text clipboard
    const html = `
      <table style="width: 500px; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px;">
        <caption style="font-weight: bold; font-size: 12px; padding: 6px; text-align: left;">
          ${reportTitle} (${dateRange})
        </caption>
        <thead>
          <tr style="background-color: ${headerBg}; color: ${headerText};">
            <th style="border: 1px solid #8EA9DB; padding: 5px 8px; text-align: left; font-weight: bold;">Resident Name</th>
            <th style="border: 1px solid #8EA9DB; padding: 5px 8px; text-align: left; font-weight: bold;">Unit</th>
            <th style="border: 1px solid #8EA9DB; padding: 5px 8px; text-align: left; font-weight: bold;">Leasing Prof.</th>
            <th style="border: 1px solid #8EA9DB; padding: 5px 8px; text-align: left; font-weight: bold;">Concession</th>
            <th style="border: 1px solid #8EA9DB; padding: 5px 8px; text-align: left; font-weight: bold;">Move-In Date</th>
          </tr>
        </thead>
        <tbody>
          ${filteredApplicants.map((app, index) => `
            <tr style="background-color: ${index % 2 === 0 ? evenRowBg : oddRowBg};">
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px;">${app['1_Profile'].name || 'N/A'}</td>
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px;">${app['1_Profile'].unit || 'N/A'}</td>
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px;">${getAgentName(app['2_Tracking'].assignedTo)}</td>
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px;">${app['1_Profile'].concessionApplied || 'N/A'}</td>
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px;">${app['1_Profile'].moveInDate ? format(timestampToLocalDate(app['1_Profile'].moveInDate), 'MMM do, yyyy') : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Plain text fallback
    const plainText = [
      `${reportTitle} (${dateRange})`,
      '',
      'Resident Name\tUnit\tLeasing Professional\tConcession\tMove-In Date',
      ...filteredApplicants.map(app =>
        `${app['1_Profile'].name || 'N/A'}\t${app['1_Profile'].unit || 'N/A'}\t${getAgentName(app['2_Tracking'].assignedTo)}\t${app['1_Profile'].concessionApplied || 'N/A'}\t${app['1_Profile'].moveInDate ? format(timestampToLocalDate(app['1_Profile'].moveInDate), 'MMM do, yyyy') : 'N/A'}`
      )
    ].join('\n');

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback to plain text if clipboard API fails
      await navigator.clipboard.writeText(plainText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neuro-primary mb-1">Reports</h1>
          <p className="text-neuro-muted">Generate and view property reports</p>
        </div>

        <div className="w-64">
          <div
            className="relative w-full px-4 py-2.5 rounded-neuro-md shadow-neuro-pressed bg-white/50 font-sans text-neuro-primary cursor-pointer"
          >
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="w-full bg-transparent focus:outline-none cursor-pointer appearance-none pr-8 font-medium"
            >
              <option value="move-in">Move-In Report</option>
              <option value="concession">Concession Report</option>
              <option value="eod">EOD Report</option>
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-neuro-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <Card className="p-5">
        {(selectedReport === 'move-in' || selectedReport === 'concession') && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neuro-base/30">
              <h2 className="text-xl font-bold text-neuro-primary">
                {selectedReport === 'concession' ? 'Concession Report' : 'Move-In Report'}
              </h2>
              <div className="flex items-center gap-3">
                <span className="inline-block font-mono font-bold text-xs px-3 py-1.5 rounded-neuro-sm shadow-neuro-pressed bg-neuro-lavender text-neuro-primary">
                  {format(startDate, 'MMM do')} - {format(endDate, 'MMM do')}
                </span>
                {filteredApplicants.length > 0 && (
                  <Button
                    variant="secondary"
                    onClick={copyTableToClipboard}
                    className="text-sm"
                  >
                    {copySuccess ? 'Copied!' : 'Copy Table'}
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-neuro-lavender border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neuro-muted">Loading data...</p>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-12 rounded-neuro-md bg-neuro-base/30">
                <p className="text-neuro-muted font-medium">No move-ins found for this period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-neuro-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neuro-lavender/40">
                      <th className="py-3 px-4 font-bold text-neuro-primary text-sm">Resident Name</th>
                      <th className="py-3 px-4 font-bold text-neuro-primary text-sm">Unit</th>
                      <th className="py-3 px-4 font-bold text-neuro-primary text-sm">Leasing Professional</th>
                      <th className="py-3 px-4 font-bold text-neuro-primary text-sm">Concession Received</th>
                      <th className="py-3 px-4 font-bold text-neuro-primary text-sm">Move-In Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((app, index) => (
                      <tr
                        key={app.id}
                        className={`border-b border-neuro-base/20 hover:bg-neuro-lavender/10 transition-colors ${index % 2 === 0 ? 'bg-white/40' : 'bg-transparent'}`}
                      >
                        <td className="py-3 px-4 font-medium text-neuro-primary">{app['1_Profile'].name || 'N/A'}</td>
                        <td className="py-3 px-4 text-neuro-secondary">{app['1_Profile'].unit || 'N/A'}</td>
                        <td className="py-3 px-4 text-neuro-secondary">
                          {getAgentName(app['2_Tracking'].assignedTo)}
                        </td>
                        <td className="py-3 px-4">
                          {app['1_Profile'].concessionApplied && app['1_Profile'].concessionApplied !== 'N/A' ? (
                            <span className="inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-neuro-sm shadow-neuro-pressed bg-neuro-mint text-neuro-primary">
                              {app['1_Profile'].concessionApplied}
                            </span>
                          ) : (
                            <span className="text-neuro-muted">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-neuro-secondary">
                          {app['1_Profile'].moveInDate
                            ? format(timestampToLocalDate(app['1_Profile'].moveInDate), 'MMM do, yyyy')
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
              <h2 className="text-2xl font-bold text-neuro-primary">Coming Soon</h2>
              <p className="text-neuro-muted max-w-md mx-auto">
                The End of Day (EOD) Report is currently under construction. Check back later for updates.
              </p>
            </div>
            <span className="inline-block font-mono font-bold text-xs px-3 py-1.5 rounded-neuro-sm shadow-neuro-pressed bg-neuro-peach text-neuro-primary">
              FEATURE LOCKED
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};
