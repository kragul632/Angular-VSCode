// app/shared/specs.util.ts
export type ViewSpec = { id: string; label: string; value: string };

type SpecDef = {
  /** Stable ID you can use for testing / data-qa */
  id:
    | 'color'
    | 'capacity'
    | 'price'
    | 'generation'
    | 'year'
    | 'cpuModel'
    | 'hardDiskSize'
    | 'strapColor'
    | 'caseSize'
    | 'description'
    | 'screenSize';
  /** Label to display in UI */
  label: string;
  /** Synonyms to search (case/space/underscore insensitive) */
  keys: string[];
  /** Optional value formatter */
  format?: (v: unknown) => string;
};

const normalize = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '').trim();

const toKeyMap = (obj: Record<string, unknown>) => {
  const map: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    map[normalize(k)] = obj[k];
  }
  return map;
};

const stringify = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(stringify).join(', ');
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

/**
 * Define all specs we care about (canonical label + synonyms).
 * Add/remove rows here to change UI for both Home and Detail.
 */
export const SPEC_DEFS: SpecDef[] = [
  {
    id: 'color',
    label: 'Color',
    keys: ['color', 'colour', 'Color', 'Colour'],
  },
  {
    id: 'capacity',
    label: 'Capacity',
    keys: ['capacity', 'Capacity', 'capacity gb', 'Capacity GB'],
  },
  {
    id: 'price',
    label: 'Price',
    keys: ['price', 'Price'],
    format: (v) => stringify(v),
  },
  {
    id: 'generation',
    label: 'Generation',
    keys: ['generation', 'Generation'],
  },
  {
    id: 'year',
    label: 'Year',
    keys: ['year', 'Year'],
  },
  {
    id: 'cpuModel',
    label: 'CPU Model',
    keys: ['cpu model', 'CPU model'],
  },
  {
    id: 'hardDiskSize',
    label: 'Hard Disk Size',
    keys: ['hard disk size', 'Hard disk size'],
  },
  {
    id: 'strapColor',
    label: 'Strap Colour',
    keys: ['strap colour', 'Strap Colour', 'strap color', 'Strap Color'],
  },
  {
    id: 'caseSize',
    label: 'Case Size',
    keys: ['case size', 'Case Size'],
  },
  {
    id: 'description',
    label: 'Description',
    keys: ['description', 'Description'],
  },
  {
    id: 'screenSize',
    label: 'Screen Size',
    keys: ['screen size', 'Screen size', 'display size', 'Display Size'],
  },
];

/**
 * Extract only the specs we defined above, in that order.
 * Returns an array of { id, label, value } for those that exist and are non-empty.
 */
export function pickSpecs(data: unknown): ViewSpec[] {
  if (!data || typeof data !== 'object') return [];
  const map = toKeyMap(data as Record<string, unknown>);

  const firstDefined = (candidates: string[]) => {
    for (const c of candidates) {
      const v = map[normalize(c)];
      if (v !== undefined && v !== null && stringify(v) !== '') return v;
    }
    return undefined;
  };

  const out: ViewSpec[] = [];
  for (const def of SPEC_DEFS) {
    const found = firstDefined(def.keys);
    if (found !== undefined) {
      const value = def.format ? def.format(found) : stringify(found);
      if (value !== '') {
        out.push({ id: def.id, label: def.label, value });
      }
    }
  }
  return out;
}