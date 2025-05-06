import React, { useState, useEffect } from 'react';
import { Flight, generateFlights, routeCategories, classifyFlight } from '@/lib/flight-data';

import Globe from '@/components/Globe';
import FlightCard from '@/components/FlightCard';
import RouteClassifier from '@/components/RouteClassifier';
import FlightDashboard from '@/components/FlightDashboard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation, Plane, Route } from 'lucide-react';

const Index: React.FC = () => {
  // State for flights
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [view, setView] = useState<'globe' | 'dashboard'>('globe');
  const [isGeneratingFlights, setIsGeneratingFlights] = useState(false);
  
  // Generate initial flights
  useEffect(() => {
    generateNewFlights();
    
    // Set up interval for real-time updates
    const interval = setInterval(() => {
      // Update a random flight status (to simulate real-time changes)
      if (allFlights.length > 0) {
        const updatedFlights = [...allFlights];
        const randomIndex = Math.floor(Math.random() * updatedFlights.length);
        const statuses = ['on-time', 'delayed', 'cancelled', 'landed', 'in-air'] as const;
        updatedFlights[randomIndex] = {
          ...updatedFlights[randomIndex],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        };
        setAllFlights(updatedFlights);
        // Apply filters to keep displayed flights in sync
        applyFilters(updatedFlights);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Apply filters when category filter or all flights change
  useEffect(() => {
    applyFilters(allFlights);
  }, [categoryFilter, allFlights]);
  
  // Generate new flights
  const generateNewFlights = () => {
    setIsGeneratingFlights(true);
    // Simulate a short delay for loading effect
    setTimeout(() => {
      const newFlights = generateFlights(20);
      setAllFlights(newFlights);
      setDisplayedFlights(newFlights);
      setSelectedFlight(null);
      setIsGeneratingFlights(false);
    }, 800);
  };
  
  // Apply filters based on selected category
  const applyFilters = (flights: Flight[]) => {
    if (!categoryFilter) {
      setDisplayedFlights(flights);
      return;
    }
    
    const filtered = flights.filter(flight => {
      const category = classifyFlight(flight.distance);
      return category.type === categoryFilter;
    });
    
    setDisplayedFlights(filtered);
    
    // If selected flight is filtered out, deselect it
    if (selectedFlight && !filtered.find(f => f.id === selectedFlight.id)) {
      setSelectedFlight(null);
    }
  };
  
  // Handle search results
  const handleSearchResults = (results: Flight[]) => {
    setDisplayedFlights(results);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (category: string | null) => {
    setCategoryFilter(category);
  };
  
  // Handle flight selection
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-aviation-blue-dark text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-6 w-6" />
          <h1 className="text-xl font-bold">SkyFlow Route Sense</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="text-white border-white hover:bg-white hover:text-aviation-blue-dark"
            disabled={isGeneratingFlights}
            onClick={generateNewFlights}
          >
            {isGeneratingFlights ? 'Generating...' : 'Generate New Flights'}
          </Button>
        </div>
      </header>
      
      <main className="container py-6 max-w-screen-2xl">
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearchResults} 
            flights={allFlights} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[25%_1fr] gap-6">
          <div className="space-y-6">
            <RouteClassifier 
              onFilterChange={handleCategoryFilterChange}
              activeFilter={categoryFilter}
            />
            
            <div className="overflow-auto max-h-[calc(100vh-300px)] space-y-4">
              {displayedFlights.length === 0 ? (
                <div className="text-center p-4 bg-secondary rounded-md">
                  No flights match your criteria
                </div>
              ) : (
                displayedFlights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedFlight?.id === flight.id}
                    onClick={() => handleSelectFlight(flight)}
                  />
                ))
              )}
            </div>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm h-[65vh] overflow-hidden">
            <Tabs 
              defaultValue="globe" 
              value={view} 
              onValueChange={(value) => setView(value as 'globe' | 'dashboard')}
              className="h-full flex flex-col"
            >
              <div className="border-b px-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="globe" className="flex gap-2 items-center">
                    <Route className="h-4 w-4" />
                    <span>Flight Globe</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="flex gap-2 items-center">
                    <Plane className="h-4 w-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="globe" className="flex-1 m-0">
                <Globe 
                  flights={displayedFlights} 
                  selectedFlight={selectedFlight} 
                  onSelectFlight={handleSelectFlight} 
                />
              </TabsContent>
              
              <TabsContent value="dashboard" className="flex-1 m-0 p-4 overflow-auto">
                <FlightDashboard flights={displayedFlights} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="bg-aviation-blue-dark text-white p-4 mt-8">
        <div className="container text-center text-sm">
          <p>SkyFlow Route Sense &copy; 2025 | Real-time Flight Classification System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
