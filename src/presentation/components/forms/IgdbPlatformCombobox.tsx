import React, { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import type { IgdbPlatform } from '../../../domain/models/IgdbGame';

interface IgdbPlatformComboboxProps {
  value: IgdbPlatform | null;
  onChange: (platform: IgdbPlatform | null) => void;
  platforms: IgdbPlatform[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const IgdbPlatformCombobox: React.FC<IgdbPlatformComboboxProps> = ({
  value,
  onChange,
  platforms,
  placeholder = "Select IGDB Platform...",
  disabled = false,
  error
}) => {
  const [query, setQuery] = useState('');

  // Filter platforms based on search query
  const filteredPlatforms = useMemo(() => {
    if (!query.trim()) {
      return platforms;
    }

    const searchTerm = query.toLowerCase();
    return platforms.filter(platform => 
      platform.name.toLowerCase().includes(searchTerm) ||
      platform.abbreviation?.toLowerCase().includes(searchTerm) ||
      platform.alternativeName?.toLowerCase().includes(searchTerm)
    );
  }, [platforms, query]);

  const displayValue = (platform: IgdbPlatform | null) => {
    if (!platform) return '';
    
    let displayText = platform.name;
    if (platform.alternativeName) {
      displayText += ` (${platform.alternativeName})`;
    } else if (platform.abbreviation) {
      displayText += ` (${platform.abbreviation})`;
    }
    return displayText;
  };

  return (
    <div className="relative">
      <Combobox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Combobox.Input
            className={`w-full pl-4 ${value ? 'pr-16' : 'pr-12'} py-2 bg-slate-700 border rounded text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed ${
                error 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-slate-600'
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
              className="absolute inset-y-0 right-10 flex items-center px-1 hover:bg-slate-600 rounded-md transition-colors"
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
                      {platform.name}
                    </span>
                    {(platform.alternativeName || platform.abbreviation) && (
                      <span className={`block text-sm ${active ? 'text-cyan-200' : 'text-gray-400'}`}>
                        {platform.alternativeName || platform.abbreviation}
                      </span>
                    )}
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