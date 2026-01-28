/**
 * GearShedSelector Component
 * Dual-panel item picker for Gear Shed reservations
 */

import { useState, useMemo } from 'react';
import type { SchedulerItem } from '../../types/scheduler';

interface GearShedSelectorProps {
  availableItems: SchedulerItem[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  disabled?: boolean;
}

export const GearShedSelector = ({
  availableItems,
  selectedItems,
  onSelectionChange,
  disabled = false,
}: GearShedSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search with advanced syntax
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return availableItems;

    const term = searchTerm.toLowerCase();

    // Check for exact phrase search (quotes)
    const exactPhraseMatch = term.match(/"([^"]+)"/);
    if (exactPhraseMatch) {
      const phrase = exactPhraseMatch[1];
      return availableItems.filter((item) =>
        item.item.toLowerCase().includes(phrase)
      );
    }

    // Check for exclusions (- prefix)
    const exclusions: string[] = [];
    const includes: string[] = [];
    term.split(' ').forEach((word) => {
      if (word.startsWith('-') && word.length > 1) {
        exclusions.push(word.substring(1));
      } else if (word.trim()) {
        includes.push(word);
      }
    });

    return availableItems.filter((item) => {
      const itemName = item.item.toLowerCase();
      const itemDesc = (item.description || '').toLowerCase();
      const combined = `${itemName} ${itemDesc}`;

      // Check exclusions first
      for (const exclude of exclusions) {
        if (combined.includes(exclude)) return false;
      }

      // Check includes (all must match)
      if (includes.length === 0) return true;
      return includes.every((include) => combined.includes(include));
    });
  }, [availableItems, searchTerm]);

  // Split into available and selected
  const available = filteredItems.filter((item) => !selectedItems.includes(item.item));
  const selected = filteredItems.filter((item) => selectedItems.includes(item.item));

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleToggleItem = (itemName: string) => {
    if (disabled) return;

    if (selectedItems.includes(itemName)) {
      onSelectionChange(selectedItems.filter((item) => item !== itemName));
    } else {
      onSelectionChange([...selectedItems, itemName]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search... (use quotes for exact, - to exclude)"
          className="w-full px-4 py-2 pr-10 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50 text-neuro-primary"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neuro-secondary hover:text-neuro-primary text-xl"
          >
            &times;
          </button>
        )}
      </div>

      {/* Dual Panel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Available Items Panel */}
        <div className="bg-neuro-element rounded-neuro-lg shadow-neuro-flat overflow-hidden">
          <div className="p-3 bg-white/20 border-b border-white/20 text-sm font-semibold text-neuro-secondary">
            Available Items
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {available.length === 0 ? (
              <div className="p-4 text-center text-neuro-secondary text-sm">
                {searchTerm ? 'No items match search' : 'No available items'}
              </div>
            ) : (
              available.map((item) => (
                <button
                  key={item._docId}
                  onClick={() => handleToggleItem(item.item)}
                  disabled={disabled}
                  className="w-full px-3 py-2 rounded-neuro-sm bg-neuro-element shadow-neuro-pressed hover:shadow-neuro-flat transition-all duration-200 text-left text-neuro-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {item.item}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Selected Items Panel */}
        <div className="bg-neuro-element rounded-neuro-lg shadow-neuro-flat overflow-hidden">
          <div className="p-3 bg-white/20 border-b border-white/20 text-sm font-semibold text-neuro-secondary">
            Selected Items
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {selected.length === 0 ? (
              <div className="p-4 text-center text-neuro-secondary text-sm">
                No items selected
              </div>
            ) : (
              selected.map((item) => (
                <button
                  key={item._docId}
                  onClick={() => handleToggleItem(item.item)}
                  disabled={disabled}
                  className="w-full px-3 py-2 rounded-neuro-sm bg-neuro-mint shadow-neuro-pressed hover:shadow-neuro-flat transition-all duration-200 text-left text-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {item.item}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-neuro-secondary">
        Click items to move between panels. Search supports exact phrases ("mountain bike") and
        exclusions (-broken).
      </p>
    </div>
  );
};
