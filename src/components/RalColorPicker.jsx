import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { RAL_CLASSIC } from '../data/ralClassic';
import { METAL_FINISHES, ralColor, finishLabel } from '../data/finishes';

const POPULAR = ['9003', '9016', '9005', '9006', '7016', '7021', '3020', '1023', '2004', '5002', '5015', '6018', '6005', '8017'];

const GROUPS = [
  { id: '1', hex: '#E49E00' },
  { id: '2', hex: '#ED6B21' },
  { id: '3', hex: '#B42025' },
  { id: '4', hex: '#8B4F86' },
  { id: '5', hex: '#1F4A84' },
  { id: '6', hex: '#2E6A3E' },
  { id: '7', hex: '#7C8288' },
  { id: '8', hex: '#6B442A' },
  { id: '9', hex: '#E9E6DA' },
];

/**
 * RAL Classic picker with search, colour-family filter, popular row and metal finishes.
 * value: a finish object ({ type: 'ral' | 'metal', hex, ... })
 */
export default function RalColorPicker({ value, onChange, labels }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState(value?.type === 'ral' ? value.code[0] : '9');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^ral\s*/, '');
    if (q) {
      return RAL_CLASSIC.filter(([code, name]) => code.startsWith(q) || name.toLowerCase().includes(q));
    }
    return RAL_CLASSIC.filter(([code]) => code[0] === group);
  }, [query, group]);

  const isActive = (f) => value && value.type === f.type && (f.type === 'ral' ? value.code === f.code : value.id === f.id);

  const swatch = (f, key) => (
    <button
      key={key}
      type="button"
      className={`ral-swatch ${f.metal ? 'is-metal' : ''} ${isActive(f) ? 'active' : ''}`}
      style={{ '--swatch': f.hex }}
      title={finishLabel(f)}
      aria-label={finishLabel(f)}
      aria-pressed={isActive(f)}
      onClick={() => onChange(f)}
    />
  );

  return (
    <div className="ral-picker">
      <div className="ral-current">
        <span className={`ral-current-chip ${value?.metal ? 'is-metal' : ''}`} style={{ '--swatch': value?.hex }} />
        <div className="ral-current-text">
          <strong>{value?.type === 'ral' ? `RAL ${value.code}` : labels.metal}</strong>
          <span>{value?.name}</span>
        </div>
      </div>

      <div className="ral-row">
        <span className="ral-row-label">{labels.metals}</span>
        <div className="ral-row-swatches">{METAL_FINISHES.map((f) => swatch(f, f.id))}</div>
      </div>
      <div className="ral-row">
        <span className="ral-row-label">{labels.popular}</span>
        <div className="ral-row-swatches">{POPULAR.map((c) => swatch(ralColor(c), c))}</div>
      </div>

      <label className="ral-search">
        <Search size={13} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          inputMode="search"
        />
      </label>

      {!query && (
        <div className="ral-groups" role="tablist">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={group === g.id}
              className={`ral-group-btn ${group === g.id ? 'active' : ''}`}
              onClick={() => setGroup(g.id)}
              title={`RAL ${g.id}000`}
            >
              <span style={{ background: g.hex }} />
              {g.id}xxx
            </button>
          ))}
        </div>
      )}

      <div className="ral-grid">
        {list.map(([code]) => swatch(ralColor(code), code))}
        {!list.length && <span className="ral-empty">{labels.noMatch}</span>}
      </div>
    </div>
  );
}
