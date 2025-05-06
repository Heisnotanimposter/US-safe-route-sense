
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { routeCategories } from '@/lib/flight-data';

interface RouteClassifierProps {
  onFilterChange: (category: string | null) => void;
  activeFilter: string | null;
}

const RouteClassifier: React.FC<RouteClassifierProps> = ({ 
  onFilterChange, 
  activeFilter 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Route Classification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {routeCategories.map((category) => (
            <button
              key={category.type}
              className={`flex items-center p-2 rounded-md transition-colors ${
                activeFilter === category.type 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => onFilterChange(
                activeFilter === category.type ? null : category.type
              )}
            >
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: category.color }}
              ></div>
              <div className="flex flex-col items-start">
                <span className="font-medium capitalize">{category.type}</span>
                <span className="text-xs text-muted-foreground">
                  {category.description}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        {activeFilter && (
          <button 
            className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors w-full text-center"
            onClick={() => onFilterChange(null)}
          >
            Clear filter
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteClassifier;
