import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faParking,
  faBoxArchive,
  faUpload,
  faPlus,
  faSearch,
  faCheck,
  faTimes,
  faCircleInfo,
  faTrash,
  faClockRotateLeft,
  faUserPlus,
  faUserMinus,
  faChevronDown,
  faChevronRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useRentableItems } from '../hooks/useRentableItems';
import { useApplicants } from '../hooks/useApplicants';
import { extractAgentName } from '../utils/user';
import type { Applicant } from '../types/applicant';
import { parseRentableXls } from '../utils/parseRentableXls';
import { computeSeedDiff, totalChanges } from '../utils/computeSeedDiff';
import type { SeedDiff, ItemChange } from '../utils/computeSeedDiff';
import { useAuth } from '../hooks/useAuth';
import { Button, Badge, Input, Modal, Textarea, PageLoader } from '../components/ui';
import {
  RENTABLE_TYPE_LABELS,
  PARKING_TYPES,
  STORAGE_TYPES,
} from '../types/rentableItem';
import type {
  RentableItem,
  RentableItemType,
  WaitlistEntry,
  WaitlistStatus,
} from '../types/rentableItem';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_TYPES = {
  all: [...PARKING_TYPES, ...STORAGE_TYPES],
  parking: PARKING_TYPES,
  storage: STORAGE_TYPES,
} as const;
type CategoryKey = keyof typeof CATEGORY_TYPES;

const TYPE_COLOR: Record<RentableItemType, string> = {
  assigned_parking:    'bg-lavender/20 text-accent border-accent/30',
  premium_parking:     'bg-peach/20 text-warning border-warning/30',
  uncovered_parking:   'bg-mint/20 text-success border-success/30',
  disabled_access:     'bg-pale-blue/20 text-info border-info/30',
  large_storage:       'bg-lavender/20 text-accent border-accent/30',
  medium_plus_storage: 'bg-peach/20 text-warning border-warning/30',
  medium_storage:      'bg-mint/20 text-success border-success/30',
  small_storage:       'bg-pale-blue/20 text-info border-info/30',
  wine_storage:        'bg-soft-yellow/20 text-secondary border-secondary/30',
};

const WAITLIST_STATUS_LABEL: Record<WaitlistStatus, string> = {
  waiting:   'Waiting',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRent(n: number) {
  return n > 0 ? `$${n.toFixed(0)}/mo` : '—';
}

function TypeChip({ type }: { type: RentableItemType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLOR[type]}`}>
      {RENTABLE_TYPE_LABELS[type]}
    </span>
  );
}

// ─── Seed Diff Modal ──────────────────────────────────────────────────────────

interface SeedDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItems: RentableItem[];
  onApply: (incoming: RentableItem[], removeCodes: string[]) => Promise<void>;
}

const CHANGE_TYPE_META = {
  occupancy: { label: 'Occupancy changes',   icon: '🔄', warning: false },
  resident:  { label: 'Resident swaps',       icon: '⚠️', warning: true  },
  rent:      { label: 'Rent changes',         icon: '💰', warning: false },
  lease:     { label: 'Lease date changes',   icon: '📅', warning: false },
  other:     { label: 'Other changes',        icon: '📝', warning: false },
} as const;

const SeedDiffModal = ({ isOpen, onClose, currentItems, onApply }: SeedDiffModalProps) => {
  const [parsed, setParsed]       = useState<RentableItem[] | null>(null);
  const [diff, setDiff]           = useState<SeedDiff | null>(null);
  const [fileName, setFileName]   = useState('');
  const [applying, setApplying]   = useState(false);
  const [parseError, setParseError] = useState('');
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null); setDiff(null); setFileName('');
    setParseError(''); setExpanded({});
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = async (file: File) => {
    setParseError(''); setParsed(null); setDiff(null);
    setFileName(file.name);
    try {
      const items = await parseRentableXls(file);
      if (!items.length) {
        setParseError('No rentable items found. Check that this is an unmodified Yardi export.');
        return;
      }
      const d = computeSeedDiff(currentItems, items);
      setParsed(items);
      setDiff(d);
      // Auto-expand warning sections
      const autoExpand: Record<string, boolean> = {};
      if (d.removedFromYardi.length) autoExpand['removedFromYardi'] = true;
      if (d.changes.filter(c => c.changeType === 'resident').length) autoExpand['resident'] = true;
      setExpanded(autoExpand);
    } catch {
      setParseError('Failed to parse file. Make sure it is a valid Yardi Rentable Items Directory .xls export.');
    }
  };

  const handleApply = async () => {
    if (!parsed || !diff) return;
    setApplying(true);
    try {
      const removeCodes = [
        ...diff.removedFromYardi.map(i => i.code),
        ...diff.removedManual.map(i => i.code),
      ];
      await onApply(parsed, removeCodes);
      toast.success(`Applied: ${diff.added.length} added, ${removeCodes.length} removed, ${diff.changes.length} updated.`);
      handleClose();
    } catch {
      toast.error('Failed to apply changes. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const toggle = (key: string) =>
    setExpanded(e => ({ ...e, [key]: !e[key] }));

  const noChanges = diff ? totalChanges(diff) === 0 : false;

  // Group changes by type
  const changesByType = useMemo(() => {
    if (!diff) return {} as Record<string, ItemChange[]>;
    const map: Record<string, ItemChange[]> = {};
    for (const c of diff.changes) {
      if (!map[c.changeType]) map[c.changeType] = [];
      map[c.changeType].push(c);
    }
    return map;
  }, [diff]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Seed from Yardi Export">
      <div className="p-6 space-y-5">
        {/* File drop zone */}
        {!diff && (
          <>
            <p className="text-sm text-secondary">
              Upload an unmodified <strong>Rentable Items Directory</strong> .xls from Yardi.
              We'll show you exactly what will change before anything is applied.
            </p>
            <div
              className="border-2 border-dashed border-accent/40 rounded-lg p-8 text-center cursor-pointer hover:border-accent/70 hover:bg-accent/5 transition-all"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef} type="file" accept=".xls,.xlsx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <FontAwesomeIcon icon={faUpload} className="text-accent/60 text-2xl mb-3" />
              {fileName
                ? <p className="text-sm font-semibold text-primary">{fileName}</p>
                : <p className="text-sm text-tertiary">Drag & drop .xls here, or <span className="text-accent font-medium">click to browse</span></p>
              }
            </div>
            {parseError && (
              <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error flex gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </>
        )}

        {/* Diff results */}
        {diff && parsed && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="rounded-lg bg-black/4 border border-black/8 p-3 flex flex-wrap gap-4 text-sm">
              <span className="text-black/50">{fileName}</span>
              <button onClick={reset} className="text-accent text-xs underline ml-auto">Change file</button>
              <div className="w-full grid grid-cols-4 gap-2 mt-1">
                <SummaryPill label="Unchanged" value={diff.unchanged} color="text-black/50" />
                <SummaryPill label="Added"     value={diff.added.length}            color="text-success" />
                <SummaryPill label="Removed"   value={diff.removedFromYardi.length + diff.removedManual.length} color="text-error" />
                <SummaryPill label="Modified"  value={diff.changes.length}          color="text-warning" />
              </div>
            </div>

            {noChanges && (
              <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success flex gap-2">
                <FontAwesomeIcon icon={faCheck} className="mt-0.5 shrink-0" />
                <span>All <strong>{diff.unchanged}</strong> items are already up to date — no changes to apply.</span>
              </div>
            )}

            {/* Removed from Yardi — warning */}
            {diff.removedFromYardi.length > 0 && (
              <DiffSection
                sectionKey="removedFromYardi"
                icon="🗑️" warning
                title={`Not in export (${diff.removedFromYardi.length}) — were in Yardi, now missing`}
                expanded={!!expanded['removedFromYardi']}
                onToggle={() => toggle('removedFromYardi')}
              >
                <p className="text-xs text-warning mb-2 font-medium">
                  These items exist in your database but were not found in this export.
                  They will be removed if you apply. Investigate if unexpected.
                </p>
                {diff.removedFromYardi.map(item => (
                  <DiffItemRow key={item.code}>
                    <span className="font-mono font-semibold">{item.code}</span>
                    <TypeChip type={item.itemType} />
                    {item.status === 'occupied'
                      ? <span className="text-xs text-black/60">Unit {item.unit} · {item.lesseeName}</span>
                      : <Badge variant="medium">Vacant</Badge>
                    }
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}

            {/* Manually-added items not in export */}
            {diff.removedManual.length > 0 && (
              <DiffSection
                sectionKey="removedManual"
                icon="📋"
                title={`Manually-added not in export (${diff.removedManual.length})`}
                expanded={!!expanded['removedManual']}
                onToggle={() => toggle('removedManual')}
              >
                <p className="text-xs text-black/50 mb-2">
                  These were added manually in the app and aren't in Yardi. They will be removed on apply.
                </p>
                {diff.removedManual.map(item => (
                  <DiffItemRow key={item.code}>
                    <span className="font-mono font-semibold">{item.code}</span>
                    <TypeChip type={item.itemType} />
                    {item.status === 'occupied'
                      ? <span className="text-xs text-black/60">Unit {item.unit} · {item.lesseeName}</span>
                      : <Badge variant="medium">Vacant</Badge>
                    }
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}

            {/* Resident swaps — warning */}
            {changesByType['resident']?.length > 0 && (
              <DiffSection
                sectionKey="resident" icon="⚠️" warning
                title={`Resident swaps (${changesByType['resident'].length}) — same spot, different person`}
                expanded={!!expanded['resident']}
                onToggle={() => toggle('resident')}
              >
                <p className="text-xs text-warning mb-2 font-medium">
                  These spots changed residents without a recorded move-out/in. May indicate a Yardi-side swap.
                </p>
                {changesByType['resident'].map(({ prev, next }) => (
                  <DiffItemRow key={prev.code}>
                    <span className="font-mono font-semibold">{prev.code}</span>
                    <span className="text-xs text-black/50">Unit {prev.unit ?? next.unit}</span>
                    <span className="text-xs text-error line-through">{prev.lesseeName}</span>
                    <span className="text-xs text-black/30">→</span>
                    <span className="text-xs text-success font-medium">{next.lesseeName}</span>
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}

            {/* Occupancy changes */}
            {changesByType['occupancy']?.length > 0 && (
              <DiffSection
                sectionKey="occupancy" icon="🔄"
                title={`Occupancy changes (${changesByType['occupancy'].length})`}
                expanded={!!expanded['occupancy']}
                onToggle={() => toggle('occupancy')}
              >
                {changesByType['occupancy'].map(({ prev, next }) => (
                  <DiffItemRow key={prev.code}>
                    <span className="font-mono font-semibold">{prev.code}</span>
                    <TypeChip type={prev.itemType} />
                    {prev.status === 'occupied'
                      ? <>
                          <Badge variant="success">Occupied</Badge>
                          <span className="text-xs text-black/30">→</span>
                          <Badge variant="medium">Vacant</Badge>
                          <span className="text-xs text-black/50">{prev.lesseeName} moved out</span>
                        </>
                      : <>
                          <Badge variant="medium">Vacant</Badge>
                          <span className="text-xs text-black/30">→</span>
                          <Badge variant="success">Occupied</Badge>
                          <span className="text-xs text-black/50">Unit {next.unit} · {next.lesseeName}</span>
                        </>
                    }
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}

            {/* Rent changes */}
            {changesByType['rent']?.length > 0 && (
              <DiffSection
                sectionKey="rent" icon="💰"
                title={`Rent changes (${changesByType['rent'].length})`}
                expanded={!!expanded['rent']}
                onToggle={() => toggle('rent')}
              >
                {changesByType['rent'].map(({ prev, next }) => (
                  <DiffItemRow key={prev.code}>
                    <span className="font-mono font-semibold">{prev.code}</span>
                    {prev.currentRent !== next.currentRent && (
                      <span className="text-xs">
                        Rent: <span className="line-through text-black/40">{formatRent(prev.currentRent)}</span>
                        {' → '}
                        <span className="font-semibold">{formatRent(next.currentRent)}</span>
                      </span>
                    )}
                    {prev.marketRent !== next.marketRent && (
                      <span className="text-xs text-black/50">
                        Market: <span className="line-through">{formatRent(prev.marketRent)}</span> → {formatRent(next.marketRent)}
                      </span>
                    )}
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}

            {/* Lease date changes */}
            {changesByType['lease']?.length > 0 && (
              <DiffSection
                sectionKey="lease" icon="📅"
                title={`Lease date changes (${changesByType['lease'].length})`}
                expanded={!!expanded['lease']}
                onToggle={() => toggle('lease')}
              >
                {changesByType['lease'].map(({ prev, next }) => (
                  <DiffItemRow key={prev.code}>
                    <span className="font-mono font-semibold">{prev.code}</span>
                    <span className="text-xs text-black/50">
                      {prev.leaseFrom} – {prev.leaseTo ?? 'ongoing'}
                      {' → '}
                      {next.leaseFrom} – {next.leaseTo ?? 'ongoing'}
                    </span>
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}

            {/* New items */}
            {diff.added.length > 0 && (
              <DiffSection
                sectionKey="added" icon="🆕"
                title={`New items (${diff.added.length})`}
                expanded={!!expanded['added']}
                onToggle={() => toggle('added')}
              >
                {diff.added.map(item => (
                  <DiffItemRow key={item.code}>
                    <span className="font-mono font-semibold">{item.code}</span>
                    <TypeChip type={item.itemType} />
                    {item.status === 'occupied'
                      ? <span className="text-xs text-black/60">Unit {item.unit} · {item.lesseeName}</span>
                      : <Badge variant="medium">Vacant</Badge>
                    }
                    <span className="text-xs text-black/40">{formatRent(item.marketRent)}</span>
                  </DiffItemRow>
                ))}
              </DiffSection>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 pt-1 border-t border-black/8">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          {diff && (
            <Button onClick={handleApply} disabled={applying} className="flex-1">
              {applying
                ? 'Applying…'
                : noChanges
                  ? 'Apply (no changes)'
                  : `Apply ${totalChanges(diff)} change${totalChanges(diff) !== 1 ? 's' : ''}`
              }
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Diff UI sub-components
const SummaryPill = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="text-center">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-xs text-black/40">{label}</div>
  </div>
);

const DiffSection = ({
  sectionKey, icon, title, warning, expanded, onToggle, children,
}: {
  sectionKey: string; icon: string; title: string; warning?: boolean;
  expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className={`rounded-lg border ${warning ? 'border-warning/30 bg-warning/5' : 'border-black/10 bg-black/2'} overflow-hidden`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-left hover:bg-black/3 transition-colors"
    >
      <span>{icon}</span>
      {warning && <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning text-xs" />}
      <span className="flex-1">{title}</span>
      <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} className="text-black/30 text-xs" />
    </button>
    {expanded && <div className="px-3 pb-3 space-y-1.5 border-t border-black/8 pt-2">{children}</div>}
  </div>
);

const DiffItemRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 flex-wrap py-1 border-b border-black/5 last:border-0">{children}</div>
);

// ─── Assign Resident Modal ────────────────────────────────────────────────────

type ResidentSource = 'applicant' | 'resident' | 'waitlist' | 'custom';

interface AssignResidentModalProps {
  isOpen: boolean;
  item: RentableItem | null;           // pre-selected (from row click), or null (header button)
  onClose: () => void;
  onAssign: (code: string, updates: Partial<RentableItem>) => Promise<void>;
  onFulfillWaitlist: (id: string) => Promise<void>;
  vacantItems: RentableItem[];
  currentResidents: { name: string; unit: string | null }[];
  waitlist: WaitlistEntry[];
}

const AssignResidentModal = ({
  isOpen, item: preSelectedItem, onClose, onAssign, onFulfillWaitlist, vacantItems, currentResidents, waitlist,
}: AssignResidentModalProps) => {
  const { applicants } = useApplicants();
  const [selectedItem,          setSelectedItem]          = useState<RentableItem | null>(null);
  const [source,                setSource]                = useState<ResidentSource>('applicant');
  const [search,                setSearch]                = useState('');
  const [selectedApplicant,     setSelectedApplicant]     = useState<Applicant | null>(null);
  const [selectedResident,      setSelectedResident]      = useState<{ name: string; unit: string | null } | null>(null);
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [customName,            setCustomName]            = useState('');
  const [form,                  setForm]                  = useState({ unit: '', leaseFrom: '', leaseTo: '', currentRent: '' });
  const [saving,                setSaving]                = useState(false);

  const activeItem = preSelectedItem ?? selectedItem;

  useEffect(() => {
    if (isOpen) {
      setSelectedItem(null);
      setSource('applicant');
      setSearch('');
      setSelectedApplicant(null);
      setSelectedResident(null);
      setSelectedWaitlistEntry(null);
      setCustomName('');
      setForm({ unit: '', leaseFrom: '', leaseTo: '', currentRent: '' });
    }
  }, [isOpen]);

  const activeApplicants = useMemo(() =>
    applicants
      .filter(a => !['cancelled', 'completed'].includes(a['2_Tracking'].status))
      .filter(a => !search || a['1_Profile'].name.toLowerCase().includes(search.toLowerCase()) || a['1_Profile'].unit.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a['1_Profile'].name.localeCompare(b['1_Profile'].name)),
    [applicants, search]
  );

  const filteredResidents = useMemo(() =>
    currentResidents.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase())),
    [currentResidents, search]
  );

  const parkingWaitlist = useMemo(() =>
    waitlist.filter(e =>
      e.status === 'waiting' &&
      (!search || e.residentName.toLowerCase().includes(search.toLowerCase()) || e.residentUnit.includes(search))
    ),
    [waitlist, search]
  );

  const residentName =
    source === 'applicant' ? (selectedApplicant?.['1_Profile'].name ?? '') :
    source === 'resident'  ? (selectedResident?.name ?? '') :
    source === 'waitlist'  ? (selectedWaitlistEntry?.residentName ?? '') :
    customName;

  const switchSource = (s: ResidentSource) => {
    setSource(s); setSearch(''); setSelectedApplicant(null); setSelectedResident(null); setSelectedWaitlistEntry(null);
  };

  const selectWaitlistEntry = (entry: WaitlistEntry) => {
    setSelectedWaitlistEntry(entry);
    setForm(f => ({ ...f, unit: entry.residentUnit }));
  };

  const selectApplicant = (a: Applicant) => {
    setSelectedApplicant(a);
    const moveIn = a['1_Profile'].moveInDate?.toDate();
    const leaseFrom = moveIn
      ? `${moveIn.getMonth() + 1}/${moveIn.getDate()}/${moveIn.getFullYear()}`
      : '';
    setForm(f => ({ ...f, unit: a['1_Profile'].unit ?? '', leaseFrom }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !residentName.trim()) return;
    setSaving(true);
    try {
      await onAssign(activeItem.code, {
        status: 'occupied',
        unit: form.unit || null,
        lesseeName: residentName.trim(),
        lesseeId: source === 'applicant' ? (selectedApplicant?.id ?? null) : null,
        leaseFrom: form.leaseFrom || null,
        leaseTo: form.leaseTo || null,
        currentRent: parseFloat(form.currentRent) || activeItem.marketRent,
      });
      if (source === 'waitlist' && selectedWaitlistEntry) {
        await onFulfillWaitlist(selectedWaitlistEntry.id);
      }
      toast.success(`${activeItem.code} assigned to ${residentName.trim()}.`);
      onClose();
    } catch {
      toast.error('Failed to assign.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Resident to Rentable Item">
      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Item selector (only when opened from header, not from a row) */}
        {!preSelectedItem ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              Vacant Item <span className="text-error">*</span>
            </label>
            <select
              required
              value={selectedItem?.code ?? ''}
              onChange={e => {
                const found = vacantItems.find(i => i.code === e.target.value) ?? null;
                setSelectedItem(found);
                if (found) setForm(f => ({ ...f, currentRent: String(found.marketRent) }));
              }}
              className="w-full neu-pressed px-4 py-3 bg-main text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">Choose a vacant item…</option>
              {vacantItems.map(i => (
                <option key={i.code} value={i.code}>
                  {i.code} — {RENTABLE_TYPE_LABELS[i.itemType]} · {formatRent(i.marketRent)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-lg bg-black/4 border border-black/8 p-3 flex items-center gap-3">
            <TypeChip type={preSelectedItem.itemType} />
            <span className="font-mono font-semibold text-sm">{preSelectedItem.code}</span>
            <span className="text-sm text-black/50">Market: {formatRent(preSelectedItem.marketRent)}</span>
          </div>
        )}

        {/* Resident source */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-secondary">Select Resident</label>
          <div className="flex gap-1 bg-black/5 rounded-lg p-1 text-xs">
            {([['applicant', 'Applicants'], ['resident', 'Residents'], ['waitlist', 'Waitlist'], ['custom', 'Custom']] as [ResidentSource, string][]).map(([key, label]) => (
              <button key={key} type="button" onClick={() => switchSource(key)}
                className={`flex-1 py-1.5 font-medium rounded-md transition-all ${
                  source === key ? 'bg-white shadow-sm text-primary' : 'text-black/50 hover:text-black/70'
                }`}
              >{label}</button>
            ))}
          </div>

          {source !== 'custom' && (
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-sm" />
              <input type="text"
                placeholder={source === 'applicant' ? 'Search by name or unit…' : 'Search residents…'}
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full neu-pressed pl-9 pr-4 py-2.5 bg-main text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          )}

          {source === 'applicant' && (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-black/10 divide-y divide-black/5">
              {activeApplicants.length === 0
                ? <p className="text-sm text-black/40 text-center py-6">No active applicants found</p>
                : activeApplicants.map(a => (
                  <button key={a.id} type="button" onClick={() => selectApplicant(a)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/3 ${
                      selectedApplicant?.id === a.id ? 'bg-accent/8 border-l-2 border-accent' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary truncate">{a['1_Profile'].name}</div>
                      <div className="text-xs text-black/50">Unit {a['1_Profile'].unit} · {a['2_Tracking'].status.replace(/_/g, ' ')}</div>
                    </div>
                    {selectedApplicant?.id === a.id && <FontAwesomeIcon icon={faCheck} className="text-accent text-xs shrink-0" />}
                  </button>
                ))
              }
            </div>
          )}

          {source === 'resident' && (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-black/10 divide-y divide-black/5">
              {filteredResidents.length === 0
                ? <p className="text-sm text-black/40 text-center py-6">No residents found</p>
                : filteredResidents.map((r, idx) => (
                  <button key={idx} type="button" onClick={() => setSelectedResident(r)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/3 ${
                      selectedResident?.name === r.name ? 'bg-accent/8 border-l-2 border-accent' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary truncate">{r.name}</div>
                      {r.unit && <div className="text-xs text-black/50">Unit {r.unit}</div>}
                    </div>
                    {selectedResident?.name === r.name && <FontAwesomeIcon icon={faCheck} className="text-accent text-xs shrink-0" />}
                  </button>
                ))
              }
            </div>
          )}

          {source === 'waitlist' && (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-black/10 divide-y divide-black/5">
              {parkingWaitlist.length === 0
                ? <p className="text-sm text-black/40 text-center py-6">No active parking waitlist entries</p>
                : parkingWaitlist.map((entry, idx) => (
                  <button key={entry.id} type="button" onClick={() => selectWaitlistEntry(entry)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/3 ${
                      selectedWaitlistEntry?.id === entry.id ? 'bg-accent/8 border-l-2 border-accent' : ''
                    }`}
                  >
                    <span className="text-xs font-bold text-black/30 w-5 shrink-0">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary truncate">{entry.residentName}</div>
                      <div className="text-xs text-black/50">
                        Unit {entry.residentUnit} · ${entry.priceTier}/mo waitlist
                      </div>
                    </div>
                    {selectedWaitlistEntry?.id === entry.id && <FontAwesomeIcon icon={faCheck} className="text-accent text-xs shrink-0" />}
                  </button>
                ))
              }
            </div>
          )}

          {source === 'custom' && (
            <Input
              label="Resident Name"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Enter full name"
            />
          )}

          {residentName && (
            <p className="text-sm text-success flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <strong>{residentName}</strong> selected
            </p>
          )}
        </div>

        {/* Lease details */}
        <div className="space-y-3 rounded-lg bg-black/3 p-4">
          <p className="text-xs font-semibold text-black/40 uppercase tracking-wide">Lease Details</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit #" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="310" />
            <Input label="Current Rent ($/mo)" type="number" value={form.currentRent}
              onChange={e => setForm(f => ({ ...f, currentRent: e.target.value }))}
              placeholder={String(activeItem?.marketRent ?? '')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Lease From" value={form.leaseFrom} onChange={e => setForm(f => ({ ...f, leaseFrom: e.target.value }))} placeholder="1/31/2025" />
            <Input label="Lease To (optional)" value={form.leaseTo} onChange={e => setForm(f => ({ ...f, leaseTo: e.target.value }))} placeholder="Leave blank if M-T-M" />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={saving || !activeItem || !residentName.trim()} className="flex-1">
            <FontAwesomeIcon icon={faUserPlus} className="mr-1.5" />
            {saving ? 'Assigning…' : 'Assign Resident'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Add Waitlist Modal ───────────────────────────────────────────────────────

interface AddWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<WaitlistEntry, 'id'>) => Promise<void>;
  currentUser: { uid: string; displayName?: string | null };
}

const AddWaitlistModal = ({ isOpen, onClose, onAdd, currentUser }: AddWaitlistModalProps) => {
  const EMPTY = { residentName: '', residentUnit: '', specificCode: '', contact: '', notes: '' };
  const [form, setForm] = useState(EMPTY);
  const [tier, setTier] = useState<35 | 75>(35);
  const [saving, setSaving] = useState(false);
  const setF = (k: keyof typeof EMPTY, v: string) => setForm(f => ({ ...f, [k]: v }));
  const handleClose = () => { setForm(EMPTY); setTier(35); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd({
        priceTier: tier,
        specificCode: form.specificCode || undefined,
        residentName: form.residentName,
        residentUnit: form.residentUnit,
        contact: form.contact || undefined,
        notes: form.notes || undefined,
        requestedAt: new Date().toISOString(),
        addedBy: currentUser.uid,
        addedByName: currentUser.displayName || 'Unknown',
        status: 'waiting',
      });
      toast.success('Added to waitlist.');
      handleClose();
    } catch {
      toast.error('Failed to add to waitlist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add to Waitlist">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Tier selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary">Price Tier <span className="text-error">*</span></label>
          <div className="flex gap-2">
            {([35, 75] as const).map(t => (
              <button key={t} type="button" onClick={() => setTier(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all ${
                  tier === t
                    ? t === 35
                      ? 'border-success bg-success/10 text-success'
                      : 'border-warning bg-warning/10 text-warning'
                    : 'border-black/15 text-black/50 hover:border-black/30'
                }`}
              >
                ${t}/mo
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Resident Name" value={form.residentName} onChange={e => setF('residentName', e.target.value)} required placeholder="Full name" />
          <Input label="Unit #" value={form.residentUnit} onChange={e => setF('residentUnit', e.target.value)} required placeholder="e.g. 310" />
        </div>
        <Input label="Specific Code (optional)" value={form.specificCode} onChange={e => setF('specificCode', e.target.value)} placeholder="e.g. AP-049 if they want a specific spot" />
        <Input label="Contact (optional)" value={form.contact} onChange={e => setF('contact', e.target.value)} placeholder="Phone or email" />
        <Textarea label="Notes (optional)" value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Any additional context…" rows={3} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Adding…' : 'Add to Waitlist'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const RentableItems = () => {
  const { user } = useAuth();
  const {
    items, waitlist, loading,
    upsertRentableItems, updateRentableItem, deleteRentableItems,
    addWaitlistEntry, updateWaitlistEntry, deleteWaitlistEntry,
  } = useRentableItems();

  const [tab,              setTab]              = useState<'inventory' | 'waitlist'>('inventory');
  const [category,         setCategory]         = useState<CategoryKey>('all');
  const [typeFilter,       setTypeFilter]        = useState<RentableItemType | 'all'>('all');
  const [statusFilter,     setStatusFilter]      = useState<'all' | 'occupied' | 'vacant'>('all');
  const [search,           setSearch]            = useState('');
  const [seedOpen,         setSeedOpen]          = useState(false);
  const [assignOpen,       setAssignOpen]        = useState(false);
  const [assignItem,       setAssignItem]        = useState<RentableItem | null>(null);
  const [waitlistOpen,     setWaitlistOpen]      = useState(false);
  const [waitlistTier,     setWaitlistTier]      = useState<35 | 75>(35);
  const [waitlistFilter,   setWaitlistFilter]    = useState<WaitlistStatus | 'all'>('waiting');

  const vacantItems = useMemo(() => items.filter(i => i.status === 'vacant'), [items]);

  const currentResidents = useMemo(() => {
    const seen = new Set<string>();
    return items
      .filter(i => i.status === 'occupied' && i.lesseeName)
      .filter(i => { const k = i.lesseeName!; if (seen.has(k)) return false; seen.add(k); return true; })
      .map(i => ({ name: i.lesseeName!, unit: i.unit }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const lastSeeded = useMemo(() => {
    if (!items.length) return null;
    const ts = items.reduce((max, i) => (i.lastSeededAt > max ? i.lastSeededAt : max), items[0].lastSeededAt);
    return new Date(ts).toLocaleString();
  }, [items]);

  const visibleTypes = useMemo(
    () => (category === 'all' ? CATEGORY_TYPES.all : CATEGORY_TYPES[category]),
    [category]
  );

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(item => {
      if (!visibleTypes.includes(item.itemType)) return false;
      if (typeFilter !== 'all' && item.itemType !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (q) return (
        item.code.toLowerCase().includes(q) ||
        (item.unit ?? '').toLowerCase().includes(q) ||
        (item.lesseeName ?? '').toLowerCase().includes(q)
      );
      return true;
    });
  }, [items, visibleTypes, typeFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const total    = items.length;
    const occupied = items.filter(i => i.status === 'occupied').length;
    return { total, occupied, vacant: total - occupied, pct: total > 0 ? Math.round((occupied / total) * 100) : 0 };
  }, [items]);

  const typeBreakdown = useMemo(() =>
    visibleTypes
      .map(type => ({ type, total: items.filter(i => i.itemType === type).length, occupied: items.filter(i => i.itemType === type && i.status === 'occupied').length }))
      .filter(t => t.total > 0),
    [items, visibleTypes]
  );

  const filteredWaitlist = useMemo(() =>
    waitlist.filter(e =>
      e.priceTier === waitlistTier &&
      (waitlistFilter === 'all' || e.status === waitlistFilter)
    ),
    [waitlist, waitlistTier, waitlistFilter]
  );

  const waitingByTier = useMemo(() => ({
    35: waitlist.filter(e => e.priceTier === 35 && e.status === 'waiting').length,
    75: waitlist.filter(e => e.priceTier === 75 && e.status === 'waiting').length,
  }), [waitlist]);

  // ── Handlers ──

  const handleSeed = useCallback(async (incoming: RentableItem[], removeCodes: string[]) => {
    if (removeCodes.length) await deleteRentableItems(removeCodes);
    await upsertRentableItems(incoming);
  }, [deleteRentableItems, upsertRentableItems]);

  const handleVacate = async (item: RentableItem) => {
    try {
      await updateRentableItem(item.code, {
        status: 'vacant', unit: null, lesseeId: null, lesseeName: null,
        leaseFrom: null, leaseTo: null, currentRent: 0,
      });
      toast.success(`${item.code} marked as vacant.`);
    } catch {
      toast.error('Failed to vacate.');
    }
  };

  const handleWaitlistStatus = async (entry: WaitlistEntry, status: WaitlistStatus) => {
    try { await updateWaitlistEntry(entry.id, { status }); toast.success(`Marked as ${status}.`); }
    catch { toast.error('Failed to update.'); }
  };

  const handleFulfillWaitlist = async (id: string) => {
    await updateWaitlistEntry(id, { status: 'fulfilled' });
  };

  const handleDeleteWaitlist = async (id: string) => {
    try { await deleteWaitlistEntry(id); toast.success('Removed.'); }
    catch { toast.error('Failed to remove.'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><PageLoader /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Rentable Items</h1>
            <p className="text-black/60">
              {items.length > 0
                ? `${stats.total} items · last seeded ${lastSeeded}`
                : 'No data yet — seed from a Yardi export to get started'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={() => setAssignOpen(true)} className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUserPlus} />
              Assign Resident
            </Button>
            <Button onClick={() => setSeedOpen(true)} className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUpload} />
              Seed from Yardi
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total"     value={stats.total}    icon="📋" color="bg-pale-blue/30" />
            <StatCard label="Occupied"  value={stats.occupied} icon="✅" color="bg-mint/30"      />
            <StatCard label="Vacant"    value={stats.vacant}   icon="🔓" color="bg-peach/30"     />
            <StatCard label="Occupancy" value={`${stats.pct}%`} icon="📊" color="bg-lavender/30" />
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex border-b border-black/10">
          {(['inventory', 'waitlist'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-all ${
                tab === t ? 'border-b-2 border-accent text-accent' : 'text-black/50 hover:text-black/70'
              }`}
            >
              {t === 'waitlist'
                ? `Waitlist${waitlist.filter(e => e.status === 'waiting').length > 0 ? ` (${waitlist.filter(e => e.status === 'waiting').length})` : ''}`
                : 'Inventory'}
            </button>
          ))}
        </div>

        {/* ══ INVENTORY ══ */}
        {tab === 'inventory' && (
          <div className="space-y-4">
            {/* Category filter */}
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'parking', 'storage'] as CategoryKey[]).map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setTypeFilter('all'); }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${
                      category === cat
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'border-black/15 text-black/60 hover:border-black/30 hover:text-black/80'
                    }`}
                  >
                    {cat === 'parking' && <FontAwesomeIcon icon={faParking} className="mr-1.5 text-xs" />}
                    {cat === 'storage' && <FontAwesomeIcon icon={faBoxArchive} className="mr-1.5 text-xs" />}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              {category !== 'all' && typeBreakdown.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setTypeFilter('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                      typeFilter === 'all' ? 'bg-black/80 text-white border-black/80' : 'border-black/15 text-black/55 hover:border-black/30'
                    }`}
                  >All</button>
                  {typeBreakdown.map(({ type, total, occupied }) => (
                    <button key={type} onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                        typeFilter === type ? `${TYPE_COLOR[type]} font-semibold` : 'border-black/15 text-black/55 hover:border-black/30'
                      }`}
                    >
                      {RENTABLE_TYPE_LABELS[type]}
                      <span className="ml-1.5 opacity-60">{occupied}/{total}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search + status */}
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative flex-1 min-w-48">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-sm" />
                <input type="text" placeholder="Search by code, unit, or resident…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full neu-pressed pl-9 pr-4 py-2.5 bg-main text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex gap-1 bg-black/5 rounded-lg p-1">
                {(['all', 'occupied', 'vacant'] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                      statusFilter === s ? 'bg-white shadow-sm text-primary' : 'text-black/50 hover:text-black/70'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            {filteredItems.length === 0
              ? <div className="text-center py-16 text-black/40">{items.length === 0 ? 'No rentable items yet.' : 'No items match your filters.'}</div>
              : (
                <div className="neu-flat overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/10 bg-black/3">
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide w-28">Code</th>
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide">Type</th>
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide w-24">Status</th>
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide w-16">Unit</th>
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide">Resident</th>
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide w-28">Rent</th>
                          <th className="text-left px-4 py-3 font-semibold text-black/60 text-xs uppercase tracking-wide">Lease Period</th>
                          <th className="w-24" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredItems.map(item => (
                          <RentableRow
                            key={item.code} item={item}
                            onAssign={() => { setAssignItem(item); setAssignOpen(true); }}
                            onVacate={() => handleVacate(item)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2.5 border-t border-black/5 text-xs text-black/40">
                    Showing {filteredItems.length} of {items.length} items
                  </div>
                </div>
              )
            }
          </div>
        )}

        {/* ══ WAITLIST ══ */}
        {tab === 'waitlist' && (
          <div className="space-y-4">
            {/* Tier + actions row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Tier toggle */}
              <div className="flex gap-2">
                {([35, 75] as const).map(t => (
                  <button key={t} onClick={() => setWaitlistTier(t)}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                      waitlistTier === t
                        ? t === 35
                          ? 'border-success bg-success/10 text-success'
                          : 'border-warning bg-warning/10 text-warning'
                        : 'border-black/15 text-black/50 hover:border-black/30'
                    }`}
                  >
                    ${t}/mo Waitlist
                    {waitingByTier[t] > 0 && (
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        waitlistTier === t ? 'bg-current/20' : 'bg-black/10 text-black/50'
                      }`}>{waitingByTier[t]}</span>
                    )}
                  </button>
                ))}
              </div>
              <Button onClick={() => setWaitlistOpen(true)} className="flex items-center gap-2 text-sm shrink-0">
                <FontAwesomeIcon icon={faPlus} />
                Add to Waitlist
              </Button>
            </div>

            {/* Status filter */}
            <div className="flex gap-1 bg-black/5 rounded-lg p-1 w-fit">
              {(['waiting', 'fulfilled', 'cancelled', 'all'] as const).map(s => (
                <button key={s} onClick={() => setWaitlistFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    waitlistFilter === s ? 'bg-white shadow-sm text-primary' : 'text-black/50 hover:text-black/70'
                  }`}
                >
                  {s === 'all' ? 'All' : WAITLIST_STATUS_LABEL[s]}
                  {s !== 'all' && (
                    <span className="ml-1 opacity-50">
                      ({waitlist.filter(e => e.priceTier === waitlistTier && e.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredWaitlist.length === 0
              ? <div className="text-center py-16 text-black/40">
                  {waitlist.filter(e => e.priceTier === waitlistTier).length === 0
                    ? `No ${waitlistTier === 35 ? '$35' : '$75'} waitlist entries yet.`
                    : 'No entries with this status.'}
                </div>
              : (
                <div className="space-y-3">
                  {filteredWaitlist.map((entry, idx) => (
                    <WaitlistRow key={entry.id} entry={entry} position={idx + 1}
                      onStatusChange={handleWaitlistStatus} onDelete={handleDeleteWaitlist}
                    />
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <SeedDiffModal
        isOpen={seedOpen} onClose={() => setSeedOpen(false)}
        currentItems={items} onApply={handleSeed}
      />
      <AssignResidentModal
        isOpen={assignOpen}
        item={assignItem}
        onClose={() => { setAssignOpen(false); setAssignItem(null); }}
        onAssign={updateRentableItem}
        onFulfillWaitlist={handleFulfillWaitlist}
        vacantItems={vacantItems}
        currentResidents={currentResidents}
        waitlist={waitlist}
      />
      <AddWaitlistModal
        isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)}
        onAdd={addWaitlistEntry}
        currentUser={{ uid: user?.uid ?? '', displayName: user?.displayName || extractAgentName(user?.email) }}
      />
    </>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <div className={`neu-flat p-4 flex items-center gap-3 ${color}`}>
    <span className="text-2xl">{icon}</span>
    <div>
      <div className="text-2xl font-bold text-primary leading-none">{value}</div>
      <div className="text-xs text-secondary mt-0.5">{label}</div>
    </div>
  </div>
);

const RentableRow = ({
  item, onAssign, onVacate,
}: {
  item: RentableItem;
  onAssign: () => void;
  onVacate: () => void;
}) => (
  <tr className="hover:bg-black/2 transition-colors group">
    <td className="px-4 py-3">
      <span className="font-mono text-xs font-semibold text-primary">{item.code}</span>
    </td>
    <td className="px-4 py-3"><TypeChip type={item.itemType} /></td>
    <td className="px-4 py-3">
      {item.status === 'occupied'
        ? <Badge variant="success">Occupied</Badge>
        : <Badge variant="medium">Vacant</Badge>
      }
    </td>
    <td className="px-4 py-3 text-primary font-medium">{item.unit ?? '—'}</td>
    <td className="px-4 py-3 text-primary">{item.lesseeName ?? '—'}</td>
    <td className="px-4 py-3 text-primary">
      {item.currentRent > 0 && item.currentRent !== item.marketRent
        ? <span>{formatRent(item.currentRent)} <span className="text-xs text-black/40 line-through">{formatRent(item.marketRent)}</span></span>
        : formatRent(item.marketRent)
      }
    </td>
    <td className="px-4 py-3 text-xs text-black/60">
      {item.leaseFrom
        ? <>{item.leaseFrom}{item.leaseTo ? ` → ${item.leaseTo}` : ' → ongoing'}</>
        : '—'}
    </td>
    <td className="px-4 py-2">
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
        {item.status === 'vacant'
          ? (
            <button onClick={onAssign} title="Assign resident"
              className="p-1.5 rounded hover:bg-success/10 text-success/60 hover:text-success transition-colors">
              <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
            </button>
          ) : (
            <button onClick={onVacate} title="Mark as vacant"
              className="p-1.5 rounded hover:bg-warning/10 text-warning/60 hover:text-warning transition-colors">
              <FontAwesomeIcon icon={faUserMinus} className="text-xs" />
            </button>
          )
        }
      </div>
    </td>
  </tr>
);

const WaitlistRow = ({
  entry, position, onStatusChange, onDelete,
}: {
  entry: WaitlistEntry; position: number;
  onStatusChange: (entry: WaitlistEntry, status: WaitlistStatus) => void;
  onDelete: (id: string) => void;
}) => {
  const statusColor = {
    waiting:   'bg-peach/20 border-warning/30 text-warning',
    fulfilled: 'bg-mint/20 border-success/30 text-success',
    cancelled: 'bg-black/5 border-black/20 text-black/40',
  }[entry.status];

  return (
    <div className="neu-flat p-4 flex items-start gap-4">
      <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{position}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-primary">{entry.residentName}</span>
          <span className="text-black/40 text-sm">Unit {entry.residentUnit}</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
            entry.priceTier === 75
              ? 'bg-warning/10 text-warning border-warning/30'
              : 'bg-success/10 text-success border-success/30'
          }`}>${entry.priceTier}/mo</span>
          {entry.specificCode && <span className="text-xs text-black/40 font-mono">{entry.specificCode}</span>}
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
            {WAITLIST_STATUS_LABEL[entry.status]}
          </span>
        </div>
        {entry.notes   && <p className="text-sm text-black/55 mt-1">{entry.notes}</p>}
        {entry.contact && <p className="text-xs text-black/40 mt-0.5">Contact: {entry.contact}</p>}
        <p className="text-xs text-black/35 mt-1">
          <FontAwesomeIcon icon={faClockRotateLeft} className="mr-1" />
          Added {new Date(entry.requestedAt).toLocaleDateString()} by {entry.addedByName}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {entry.status === 'waiting' && (
          <>
            <button onClick={() => onStatusChange(entry, 'fulfilled')} title="Mark fulfilled"
              className="p-2 rounded-lg hover:bg-success/10 text-success/70 hover:text-success transition-colors">
              <FontAwesomeIcon icon={faCheck} className="text-sm" />
            </button>
            <button onClick={() => onStatusChange(entry, 'cancelled')} title="Cancel"
              className="p-2 rounded-lg hover:bg-black/5 text-black/40 hover:text-black/60 transition-colors">
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          </>
        )}
        <button onClick={() => onDelete(entry.id)} title="Delete"
          className="p-2 rounded-lg hover:bg-error/10 text-error/40 hover:text-error transition-colors">
          <FontAwesomeIcon icon={faTrash} className="text-sm" />
        </button>
      </div>
    </div>
  );
};
