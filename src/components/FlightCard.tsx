
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flight, classifyFlight } from '@/lib/flight-data';
import { Badge } from '@/components/ui/badge';
import { Clock, Plane, Route } from 'lucide-react';

interface FlightCardProps {
  flight: Flight;
  isSelected?: boolean;
  onClick?: () => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, isSelected = false, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const category = classifyFlight(flight.distance);

  const statusColor = {
    'on-time': 'bg-green-500',
    'delayed': 'bg-yellow-500',
    'cancelled': 'bg-red-500',
    'landed': 'bg-blue-500',
    'in-air': 'bg-aviation-blue-light animate-pulse-subtle',
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        isSelected 
          ? 'border-aviation-red shadow-lg scale-[1.02]' 
          : 'hover:border-aviation-blue hover:shadow'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Plane className="h-5 w-5" />
            {flight.airline} {flight.flightNumber}
          </CardTitle>
          <Badge className={statusColor[flight.status]}>
            {flight.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-4">
          <div className="text-left">
            <div className="font-medium">{flight.departureAirport.code}</div>
            <div className="text-sm text-muted-foreground">{flight.departureAirport.city}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatDate(flight.departureTime)}</div>
          </div>
          
          <div className="flex flex-col items-center px-2">
            <div
              className="w-full h-0.5 my-1"
              style={{ backgroundColor: category.color }}
            ></div>
            <div className="text-xs font-medium" style={{ color: category.color }}>
              {category.type}
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium">{flight.arrivalAirport.code}</div>
            <div className="text-sm text-muted-foreground">{flight.arrivalAirport.city}</div>
            <div className="text-xs text-muted-foreground mt-1">{formatDate(flight.arrivalTime)}</div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Route className="h-4 w-4" />
            <span>{flight.distance} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{Math.round(flight.distance / 800)} hr</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightCard;
