
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flight, routeCategories } from '@/lib/flight-data';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

interface FlightDashboardProps {
  flights: Flight[];
}

const FlightDashboard: React.FC<FlightDashboardProps> = ({ flights }) => {
  // Calculate statistics
  const totalFlights = flights.length;
  
  // Count flights by status
  const statusCounts = flights.reduce((acc, flight) => {
    acc[flight.status] = (acc[flight.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count flights by route category
  const categoryCounts = flights.reduce((acc, flight) => {
    const category = routeCategories.find(
      cat => flight.distance >= cat.minDistance && flight.distance <= cat.maxDistance
    );
    if (category) {
      acc[category.type] = (acc[category.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Format for pie chart
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name.replace('-', ' '),
    value
  }));
  
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace('-', ' '),
    value
  }));
  
  const COLORS = ['#5BC0EB', '#3E92CC', '#0A2463'];
  const STATUS_COLORS = {
    'on time': '#4ade80',
    'delayed': '#fbbf24',
    'cancelled': '#f87171',
    'landed': '#60a5fa',
    'in air': '#a78bfa'
  };
  
  // Calculate average distance
  const averageDistance = flights.length > 0
    ? Math.round(flights.reduce((sum, flight) => sum + flight.distance, 0) / flights.length)
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Route Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} flights`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#9ca3af'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} flights`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-md p-4">
              <div className="text-sm text-muted-foreground">Total Flights</div>
              <div className="text-2xl font-bold">{totalFlights}</div>
            </div>
            <div className="bg-secondary rounded-md p-4">
              <div className="text-sm text-muted-foreground">Average Distance</div>
              <div className="text-2xl font-bold">{averageDistance} km</div>
            </div>
            <div className="bg-secondary rounded-md p-4">
              <div className="text-sm text-muted-foreground">In Air</div>
              <div className="text-2xl font-bold">{statusCounts['in-air'] || 0}</div>
            </div>
            <div className="bg-secondary rounded-md p-4">
              <div className="text-sm text-muted-foreground">Airports Served</div>
              <div className="text-2xl font-bold">
                {new Set([
                  ...flights.map(f => f.departureAirport.code),
                  ...flights.map(f => f.arrivalAirport.code)
                ]).size}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightDashboard;
