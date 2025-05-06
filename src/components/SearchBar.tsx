
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Flight } from '@/lib/flight-data';

interface SearchBarProps {
  onSearch: (results: Flight[]) => void;
  flights: Flight[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, flights }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onSearch(flights);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    const results = flights.filter(flight => 
      flight.flightNumber.toLowerCase().includes(lowerQuery) ||
      flight.airline.toLowerCase().includes(lowerQuery) ||
      flight.departureAirport.code.toLowerCase().includes(lowerQuery) ||
      flight.arrivalAirport.code.toLowerCase().includes(lowerQuery) ||
      flight.departureAirport.city.toLowerCase().includes(lowerQuery) ||
      flight.arrivalAirport.city.toLowerCase().includes(lowerQuery) ||
      flight.departureAirport.country.toLowerCase().includes(lowerQuery) ||
      flight.arrivalAirport.country.toLowerCase().includes(lowerQuery)
    );
    
    onSearch(results);
  };

  const handleClear = () => {
    setQuery('');
    onSearch(flights);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flights, airports, or cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-[68px]"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
};

export default SearchBar;
