import * as XLSX from 'xlsx';
import type { RentableItem, RentableItemType } from '../types/rentableItem';

const DESCRIPTION_TO_TYPE: Record<string, RentableItemType> = {
  'Assigned Parking': 'assigned_parking',
  'Premium Parking': 'premium_parking',
  'Uncovered Parking': 'uncovered_parking',
  'Disabled Access': 'disabled_access',
  'Large Storage': 'large_storage',
  'Medium Plus Storage': 'medium_plus_storage',
  'Medium Storage': 'medium_storage',
  'Small Storage': 'small_storage',
  'Wine Storage': 'wine_storage',
};

// Matches codes like AP-049, PP-001, UP-348, LS-018, W-01, AP-77
const CODE_RE = /^[A-Z]+-\d+$/;

export function parseRentableXls(file: File): Promise<RentableItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        // cellDates: true → SheetJS converts date cells to JS Date objects
        const wb = XLSX.read(data, { type: 'array', raw: true, cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: (string | number | Date | undefined)[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          raw: true,
          defval: undefined,
        });

        const items: RentableItem[] = [];
        let currentGroup = '';
        const now = new Date().toISOString();

        for (const row of rows) {
          if (!row || !row.some((c) => c !== undefined)) continue;

          const col0 = row[0];
          const col1 = row[1];

          // Group header: "Beacon 85(cobea85) - park1"
          if (typeof col0 === 'string' && col0.includes('cobea85')) {
            const m = col0.match(/- (\w+)$/);
            if (m) currentGroup = m[1];
            continue;
          }

          // Total / header rows
          if (!col0 && typeof col1 === 'string' && col1.includes('Total')) continue;
          if (col0 === 'Code') continue;
          if (
            typeof col0 === 'string' &&
            (col0.startsWith('Rentable') ||
              col0.startsWith('For Selected') ||
              col0.startsWith('As Of'))
          )
            continue;

          const code = typeof col0 === 'string' ? col0.trim() : '';
          if (!CODE_RE.test(code)) continue;

          const description = typeof col1 === 'string' ? col1.trim() : '';
          const itemType = DESCRIPTION_TO_TYPE[description];
          if (!itemType) continue;

          const marketRent = toNum(row[2]);
          const unit = toStr(row[3]);
          const lesseeId = toStr(row[4]);
          const lesseeName = toStr(row[5]);
          const leaseFrom = toDate(row[6]);
          const leaseTo = toDate(row[7]);
          const currentRent = toNum(row[8]);

          items.push({
            code,
            description,
            itemType,
            group: currentGroup,
            marketRent,
            status: lesseeName ? 'occupied' : 'vacant',
            unit,
            lesseeId,
            lesseeName,
            leaseFrom,
            leaseTo,
            currentRent,
            source: 'seed',
            lastSeededAt: now,
          });
        }

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function toStr(val: string | number | Date | undefined): string | null {
  if (val === undefined || val === null || val instanceof Date) return null;
  const s = String(val).trim();
  return s || null;
}

// Handles three formats SheetJS may produce for date cells:
//   1. JS Date object  — when cellDates:true converts the cell
//   2. Number          — Excel serial (days since 1900-01-01)
//   3. String          — serial stored as text (e.g. "45688")
// Range guard (>40000 <70000) ≈ year 2009–2064, keeps rent numbers safe.
// UTC accessors prevent timezone from shifting the day.
function toDate(val: string | number | Date | undefined): string | null {
  if (val === undefined || val === null) return null;
  if (val instanceof Date) {
    return `${val.getUTCMonth() + 1}/${val.getUTCDate()}/${val.getUTCFullYear()}`;
  }
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (!isNaN(num) && num > 40000 && num < 70000) {
    const d = new Date(Math.round((num - 25569) * 86400 * 1000));
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
  }
  const s = String(val).trim();
  return s || null;
}

function toNum(val: string | number | Date | undefined): number {
  if (val instanceof Date) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(String(val ?? 0)) || 0;
}
