import { useState, useMemo, useRef, useEffect } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import { useUsers } from '../hooks/useUsers';
import { extractAgentName } from '../utils/user';
import { timestampToLocalDate } from '../utils/date';
import { Card, Button } from '../components/ui';
import { format, subMonths, setDate, isAfter, isBefore, isEqual, startOfDay, endOfDay, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { getEODReport, saveEODReport, type EODReportData } from '../services/eodReportService';

type ReportType = 'move-in' | 'concession' | 'eod';

export const Reports = () => {
  const { applicants, loading } = useApplicants();
  const { users } = useUsers();
  const [selectedReport, setSelectedReport] = useState<ReportType>('eod');
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isReportTypeOpen, setIsReportTypeOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const monthParamsRef = useRef<HTMLDivElement>(null);
  const reportParamsRef = useRef<HTMLDivElement>(null);

  // EOD Report state
  const [eodData, setEodData] = useState<Omit<EODReportData, 'lastSubmitted'>>({
    occupancy: '',
    fourWeekTrend: '',
    sixWeekTrend: '',
    traffic: '0',
    leases: '0',
    competition: 'N/A',
    reasonsNotLeasing: 'N/A',
    pendingApplications: 'N/A',
    finalAccountStatements: 'N/A',
    cancellationReason: 'N/A',
  });
  const [eodLoading, setEodLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (monthParamsRef.current && !monthParamsRef.current.contains(target)) {
        setIsMonthOpen(false);
      }
      if (reportParamsRef.current && !reportParamsRef.current.contains(target)) {
        setIsReportTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load EOD report data when switching to EOD report
  useEffect(() => {
    if (selectedReport === 'eod') {
      loadEODData();
    }
  }, [selectedReport]);

  const loadEODData = async () => {
    setEodLoading(true);
    try {
      const data = await getEODReport();
      setEodData({
        occupancy: data.occupancy,
        fourWeekTrend: data.fourWeekTrend,
        sixWeekTrend: data.sixWeekTrend,
        traffic: data.traffic || '0',
        leases: data.leases || '0',
        competition: data.competition || 'N/A',
        reasonsNotLeasing: data.reasonsNotLeasing || 'N/A',
        pendingApplications: data.pendingApplications || 'N/A',
        finalAccountStatements: data.finalAccountStatements || 'N/A',
        cancellationReason: data.cancellationReason || 'N/A',
      });
    } catch (error) {
      console.error('Failed to load EOD data:', error);
    } finally {
      setEodLoading(false);
    }
  };

  // Calculate available months based on data
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const today = new Date();

    // Always include current month
    // We store as string for Set uniqueness, then parse back
    months.add(startOfMonth(today).toISOString());

    applicants.forEach(app => {
      if (app['1_Profile'].moveInDate) {
        const moveInDate = timestampToLocalDate(app['1_Profile'].moveInDate);
        months.add(startOfMonth(moveInDate).toISOString());
      }
    });

    return Array.from(months)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime()) // Newest first
      // Only keep months that are roughly within the "previous 5 months" request or seem reasonable
      // For now, we show all months that have data as requested in point 1 ("starting with the earliest")
      // but we can limit if UI gets too long. Let's stick strictly to data presence.
      .filter((date) => isBefore(date, endOfMonth(today)) || isSameMonth(date, today));
  }, [applicants]);

  // Calculate date range for Concession Report (25th to 25th)
  // For concession report, it typically spans two months. 
  // If we select "Feb 2026", does it mean Jan 25 - Feb 25?
  // Let's assume the selected month is the primary month.
  const concessionEnd = endOfDay(setDate(currentViewDate, 25));
  const concessionStart = startOfDay(setDate(subMonths(currentViewDate, 1), 25));

  // Calculate date range for Move-In Report (1st to End of Month)
  const moveInStart = startOfDay(startOfMonth(currentViewDate));
  const moveInEnd = endOfDay(endOfMonth(currentViewDate));

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



  // Copy EOD table to clipboard
  const copyEODTableToClipboard = async () => {
    // Auto-save before copying
    try {
      await saveEODReport(eodData);
    } catch (error) {
      console.error('Failed to auto-save EOD data:', error);
    }

    // Colors for table
    const headerBg = '#4472C4';
    const headerText = '#FFFFFF';
    const evenRowBg = '#D6DCE5';
    const oddRowBg = '#FFFFFF';

    // Format occupancy values as percentages
    const formatPercentage = (value: string) => {
      if (!value || value === 'N/A') return 'N/A';
      const num = parseFloat(value);
      return isNaN(num) ? value : `${num.toFixed(2)}%`;
    };

    const eodFields = [
      { label: 'Occupancy', value: formatPercentage(eodData.occupancy) },
      { label: '4 Week Occupancy Trend', value: formatPercentage(eodData.fourWeekTrend) },
      { label: '6 Week Occupancy Trend', value: formatPercentage(eodData.sixWeekTrend) },
      { label: 'Traffic (daily)', value: eodData.traffic || 'N/A' },
      { label: 'Leases (daily)', value: eodData.leases || 'N/A' },
      { label: 'Competition', value: eodData.competition || 'N/A' },
      { label: 'Reason(s) for not leasing', value: eodData.reasonsNotLeasing || 'N/A' },
      { label: 'Pending Applications and Status', value: eodData.pendingApplications || 'N/A' },
      { label: 'Open Final Account Statements', value: eodData.finalAccountStatements || 'N/A' },
      { label: 'Cancelation - reason', value: eodData.cancellationReason || 'N/A' },
    ];

    // Build HTML table for rich text clipboard
    const html = `
      <table style="width: 500px; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px;">
        <thead>
          <tr style="background-color: ${headerBg}; color: ${headerText};">
            <th colspan="2" style="border: 1px solid #8EA9DB; padding: 8px; text-align: center; font-weight: bold; font-size: 12px;">Beacon 85 Daily Update</th>
          </tr>
        </thead>
        <tbody>
          ${eodFields.map((field, index) => `
            <tr style="background-color: ${index % 2 === 0 ? evenRowBg : oddRowBg};">
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px; font-weight: bold;">${field.label}</td>
              <td style="border: 1px solid #8EA9DB; padding: 4px 8px;">${field.value}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Plain text fallback
    const plainText = [
      'Beacon 85 Daily Update',
      '',
      'Metric\\tValue',
      ...eodFields.map(field => `${field.label}\\t${field.value}`)
    ].join('\\n');

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

        <div className="flex gap-4">
          {/* Month Selector */}
          {(selectedReport === 'move-in' || selectedReport === 'concession') && (
            <div className="relative w-64" ref={monthParamsRef}>
              <button
                onClick={() => {
                  setIsMonthOpen(!isMonthOpen);
                  setIsReportTypeOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-neuro-md shadow-neuro-pressed bg-white/50 font-sans text-neuro-primary font-medium cursor-pointer focus:outline-none"
              >
                <span>{format(currentViewDate, 'MMMM yyyy')}</span>
                <svg
                  className={`w-5 h-5 text-neuro-secondary transition-transform duration-200 ${isMonthOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMonthOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 py-2 bg-white/95 backdrop-blur-sm rounded-neuro-md shadow-neuro-floating z-50 animate-in fade-in zoom-in-95 duration-200 border border-neuro-white/50">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {availableMonths.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => {
                          setCurrentViewDate(date);
                          setIsMonthOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all ${isSameMonth(date, currentViewDate)
                          ? 'bg-neuro-lavender/30 text-neuro-primary font-bold'
                          : 'text-neuro-muted hover:bg-neuro-lavender/10 hover:text-neuro-primary'
                          }`}
                      >
                        {format(date, 'MMMM yyyy')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Report Type Selector */}
          <div className="relative w-64" ref={reportParamsRef}>
            <button
              onClick={() => {
                setIsReportTypeOpen(!isReportTypeOpen);
                setIsMonthOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-neuro-md shadow-neuro-pressed bg-white/50 font-sans text-neuro-primary font-medium cursor-pointer focus:outline-none"
            >
              <span>
                {selectedReport === 'move-in' && 'Move-In Report'}
                {selectedReport === 'concession' && 'Concession Report'}
                {selectedReport === 'eod' && 'EOD Report'}
              </span>
              <svg
                className={`w-5 h-5 text-neuro-secondary transition-transform duration-200 ${isReportTypeOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isReportTypeOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 py-2 bg-white/95 backdrop-blur-sm rounded-neuro-md shadow-neuro-floating z-50 animate-in fade-in zoom-in-95 duration-200 border border-neuro-white/50">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {[
                    { value: 'eod', label: 'EOD Report' },
                    { value: 'move-in', label: 'Move-In Report' },
                    { value: 'concession', label: 'Concession Report' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedReport(option.value as ReportType);
                        setIsReportTypeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all ${selectedReport === option.value
                        ? 'bg-neuro-lavender/30 text-neuro-primary font-bold'
                        : 'text-neuro-muted hover:bg-neuro-lavender/10 hover:text-neuro-primary'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                <p className="text-neuro-muted font-medium">No move-ins found for {format(currentViewDate, 'MMMM yyyy')}.</p>
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
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neuro-base/30">
              <h2 className="text-xl font-bold text-neuro-primary">
                End of Day Report
              </h2>
              <div className="flex items-center gap-3">
                <span className="inline-block font-mono font-bold text-xs px-3 py-1.5 rounded-neuro-sm shadow-neuro-pressed bg-neuro-lavender text-neuro-primary">
                  {format(new Date(), 'MMM do, yyyy')}
                </span>
                <Button
                  variant="secondary"
                  onClick={copyEODTableToClipboard}
                  className="text-sm"
                >
                  {copySuccess ? 'Copied!' : 'Copy Table'}
                </Button>
              </div>
            </div>

            {eodLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-neuro-lavender border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-neuro-muted">Loading EOD data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-neuro-md">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {/* Combined Metrics Row */}
                    <tr>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary w-[18%]">Occupancy</td>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary w-[18%]">4 Week Trend</td>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary w-[18%]">6 Week Trend</td>
                      <td className="w-[1px] bg-neuro-base/20 p-0"></td>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary w-[22%]">Traffic (daily)</td>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary w-[22%]">Leases (daily)</td>
                    </tr>
                    <tr className="bg-white/40">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={eodData.occupancy}
                          onChange={(e) => setEodData({ ...eodData, occupancy: e.target.value })}
                          placeholder="89.5"
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={eodData.fourWeekTrend}
                          onChange={(e) => setEodData({ ...eodData, fourWeekTrend: e.target.value })}
                          placeholder="88.33"
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={eodData.sixWeekTrend}
                          onChange={(e) => setEodData({ ...eodData, sixWeekTrend: e.target.value })}
                          placeholder="88.04"
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender"
                        />
                      </td>
                      <td className="w-[1px] bg-neuro-base/20 p-0"></td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={eodData.traffic}
                          onChange={(e) => setEodData({ ...eodData, traffic: e.target.value })}
                          placeholder="0"
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={eodData.leases}
                          onChange={(e) => setEodData({ ...eodData, leases: e.target.value })}
                          placeholder="0"
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender"
                        />
                      </td>
                    </tr>

                    {/* Competition Row */}
                    <tr>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary" colSpan={6}>Competition</td>
                    </tr>
                    <tr className="bg-white/40">
                      <td className="py-2 px-3" colSpan={6}>
                        <input
                          type="text"
                          value={eodData.competition}
                          onChange={(e) => setEodData({ ...eodData, competition: e.target.value })}
                          placeholder="N/A"
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender"
                        />
                      </td>
                    </tr>

                    {/* Reason(s) for not leasing Row */}
                    <tr>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary" colSpan={6}>Reason(s) for not leasing</td>
                    </tr>
                    <tr className="bg-transparent">
                      <td className="py-2 px-3" colSpan={6}>
                        <textarea
                          value={eodData.reasonsNotLeasing}
                          onChange={(e) => setEodData({ ...eodData, reasonsNotLeasing: e.target.value })}
                          placeholder="N/A"
                          rows={2}
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender resize-none"
                        />
                      </td>
                    </tr>

                    {/* Pending Applications Row */}
                    <tr>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary" colSpan={6}>Pending Applications and Status</td>
                    </tr>
                    <tr className="bg-white/40">
                      <td className="py-2 px-3" colSpan={6}>
                        <textarea
                          value={eodData.pendingApplications}
                          onChange={(e) => setEodData({ ...eodData, pendingApplications: e.target.value })}
                          placeholder="N/A"
                          rows={2}
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender resize-none"
                        />
                      </td>
                    </tr>

                    {/* Open Final Account Statements Row */}
                    <tr>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary" colSpan={6}>Open Final Account Statements</td>
                    </tr>
                    <tr className="bg-transparent">
                      <td className="py-2 px-3" colSpan={6}>
                        <textarea
                          value={eodData.finalAccountStatements}
                          onChange={(e) => setEodData({ ...eodData, finalAccountStatements: e.target.value })}
                          placeholder="N/A"
                          rows={2}
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender resize-none"
                        />
                      </td>
                    </tr>

                    {/* Cancelation Row */}
                    <tr>
                      <td className="py-2 px-3 text-xs font-medium text-neuro-secondary" colSpan={6}>Cancelation - reason</td>
                    </tr>
                    <tr className="bg-white/40">
                      <td className="py-2 px-3" colSpan={6}>
                        <textarea
                          value={eodData.cancellationReason}
                          onChange={(e) => setEodData({ ...eodData, cancellationReason: e.target.value })}
                          placeholder="N/A"
                          rows={2}
                          className="w-full px-2 py-1 text-sm rounded border border-neuro-base/20 bg-white/50 font-sans text-neuro-primary focus:outline-none focus:border-neuro-lavender resize-none"
                        />
                      </td>
                    </tr>


                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
