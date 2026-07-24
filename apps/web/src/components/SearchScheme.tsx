'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { searchSchemes } from '@/lib/api-client';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { MFScheme } from '@mintfolio/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function SearchScheme() {
  const [query, setQuery] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useQuery({
    queryKey: ['search-scheme', debouncedQuery],
    queryFn: () => searchSchemes(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
  });

  const schemes: MFScheme[] = data?.data?.data ?? [];

  return (
    <Combobox
      items={schemes}
      onValueChange={(value) => {
        const scheme = schemes.find((s) => String(s.schemeCode) === value);
        if (scheme) {
          setSelectedCode(scheme.schemeCode);
          setQuery(scheme.schemeName);
        }
      }}
    >
      <ComboboxInput
        placeholder="Search mutual fund schemes..."
        value={query}
        showTrigger={false}
        onChange={(e) => setQuery(e.currentTarget.value)}
      />
      <ComboboxContent>
        <ComboboxEmpty>No schemes found.</ComboboxEmpty>
        <ComboboxList>
          {(scheme: MFScheme) => (
            <ComboboxItem key={scheme.schemeCode} value={String(scheme.schemeCode)}>
              {scheme.schemeName}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
