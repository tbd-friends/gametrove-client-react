import React, { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { usePlatforms } from '../../hooks';
import type { Platform } from '../../../domain/models';

interface PlatformComboboxProps {
  value: Platform | null;
  onChange: (platform: Platform | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const PlatformCombobox: React.FC<PlatformComboboxProps> = ({
  value,
  onChange,
  placeholder = "Select a platform...",
  disabled = false,
  error
}) => {
  const [query, setQuery] = useState('');
  const { platforms, loading, error: platformsError } = usePlatforms();

  // Filter platforms based on search query
  const filteredPlatforms = useMemo(() => {
    if (!query.trim()) {
      return platforms;
    }

    const searchTerm = query.toLowerCase();
    return platforms.filter(platform => 
      platform.description.toLowerCase().includes(searchTerm) ||
      platform.manufacturer.toLowerCase().includes(searchTerm)
    );
  }, [platforms, query]);

  const displayValue = (platform: Platform | null) => {
    return platform ? `${platform.description} (${platform.manufacturer})` : '';
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-400">
          Loading platforms...
        </div>
      </div>
    );
  }

  if (platformsError) {
    return (
      <div className="relative">
        <div className="w-full px-3 py-2 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
          Error loading platforms: {platformsError}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Combobox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Combobox.Input
            className={`w-full pl-4 ${value ? 'pr-16' : 'pr-12'} py-3 bg-slate-800 border rounded-lg text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed ${
                error 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-700'
              }`}
            displayValue={displayValue}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          
          {/* Clear button - only show when there's a value */}
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange(null);
                setQuery('');
              }}
              className="absolute inset-y-0 right-10 flex items-center px-1 hover:bg-slate-700 rounded-md transition-colors"
              title="Clear selection"
            >
              <XMarkIcon
                className="h-4 w-4 text-gray-400 hover:text-gray-300"
                aria-hidden="true"
              />
            </button>
          )}
          
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-slate-800 border border-slate-700 shadow-lg">
          {filteredPlatforms.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-400">
              No platforms found for "{query}"
            </div>
          ) : (
            filteredPlatforms.map((platform) => (
              <Combobox.Option
                key={platform.id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-cyan-600 text-white' : 'text-gray-300'
                  }`
                }
                value={platform}
              >
                {({ selected, active }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {platform.description}
                    </span>
                    <span className={`block text-sm ${active ? 'text-cyan-200' : 'text-gray-400'}`}>
                      {platform.manufacturer}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-white' : 'text-cyan-600'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};