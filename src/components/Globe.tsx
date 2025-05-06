
import React, { useEffect, useRef, useState } from 'react';
import { Flight, classifyFlight } from '@/lib/flight-data';

interface GlobeProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
}

const Globe: React.FC<GlobeProps> = ({ flights, selectedFlight, onSelectFlight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Draw function
    const draw = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate center and radius
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      
      // Draw globe
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      // Create gradient for globe
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, '#5bc0eb');
      gradient.addColorStop(0.5, '#3e92cc');
      gradient.addColorStop(1, '#0a2463');
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Apply simple rotation - in a real implementation, this would use proper 3D projections
      const rotationX = rotation.x % (Math.PI * 2);
      
      // Draw equator and meridians
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      // Equator
      ctx.beginPath();
      ctx.ellipse(
        centerX, 
        centerY, 
        radius, 
        radius * Math.abs(Math.cos(rotationX)), 
        0, 
        0, 
        Math.PI * 2
      );
      ctx.stroke();
      
      // Draw flight routes
      flights.forEach(flight => {
        const { departureAirport, arrivalAirport, distance } = flight;
        
        // Convert lat/long to simple 2D positions (this is a simplified visualization)
        // In a real app, we'd use proper 3D projections
        const dep = convertLatLongToPosition(
          departureAirport.lat, 
          departureAirport.long, 
          centerX, 
          centerY, 
          radius,
          rotationX
        );
        
        const arr = convertLatLongToPosition(
          arrivalAirport.lat, 
          arrivalAirport.long, 
          centerX, 
          centerY, 
          radius,
          rotationX
        );
        
        // Get category color
        const category = classifyFlight(distance);
        
        // Draw route
        ctx.beginPath();
        ctx.moveTo(dep.x, dep.y);
        
        // Create arc between points
        const midX = (dep.x + arr.x) / 2;
        const midY = (dep.y + arr.y) / 2 - distance / 100;
        
        ctx.quadraticCurveTo(midX, midY, arr.x, arr.y);
        
        ctx.strokeStyle = selectedFlight?.id === flight.id 
          ? '#D8315B' 
          : category.color;
        ctx.lineWidth = selectedFlight?.id === flight.id ? 3 : 1.5;
        ctx.stroke();
        
        // Draw endpoints
        const pointRadius = selectedFlight?.id === flight.id ? 5 : 3;
        
        // Departure point
        ctx.beginPath();
        ctx.arc(dep.x, dep.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = selectedFlight?.id === flight.id ? '#D8315B' : '#FFFAFF';
        ctx.fill();
        
        // Arrival point
        ctx.beginPath();
        ctx.arc(arr.x, arr.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = selectedFlight?.id === flight.id ? '#D8315B' : '#FFFAFF';
        ctx.fill();
      });
    };
    
    // Animation loop
    const animate = () => {
      draw();
      // Auto-rotate if not dragging
      if (!isDragging) {
        setRotation(prev => ({ ...prev, y: prev.y + 0.002 }));
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [flights, isDragging, rotation, selectedFlight]);
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPosition.x;
    const deltaY = e.clientY - lastPosition.y;
    
    setRotation({
      x: rotation.x + deltaY * 0.01,
      y: rotation.y + deltaX * 0.01,
    });
    
    setLastPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if click is close to any flight point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    for (const flight of flights) {
      const { departureAirport, arrivalAirport } = flight;
      
      const dep = convertLatLongToPosition(
        departureAirport.lat,
        departureAirport.long,
        centerX,
        centerY,
        radius,
        rotation.x
      );
      
      const arr = convertLatLongToPosition(
        arrivalAirport.lat,
        arrivalAirport.long,
        centerX,
        centerY,
        radius,
        rotation.x
      );
      
      // Check if click is close to either point
      const depDistance = Math.sqrt(Math.pow(x - dep.x, 2) + Math.pow(y - dep.y, 2));
      const arrDistance = Math.sqrt(Math.pow(x - arr.x, 2) + Math.pow(y - arr.y, 2));
      
      if (depDistance < 10 || arrDistance < 10) {
        onSelectFlight(flight);
        return;
      }
    }
  };
  
  return (
    <div className="h-full w-full relative">
      <canvas
        ref={canvasRef}
        className="cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      <div className="absolute bottom-4 left-4 text-xs text-white bg-aviation-blue-dark/70 p-2 rounded">
        <div>Click and drag to rotate</div>
        <div>Click on points to select flights</div>
      </div>
    </div>
  );
};

// Helper function to convert lat/long to position on canvas
function convertLatLongToPosition(
  lat: number, 
  long: number, 
  centerX: number, 
  centerY: number, 
  radius: number,
  rotationX: number
) {
  // Convert to radians
  const latRad = (lat * Math.PI) / 180;
  const longRad = (long * Math.PI) / 180;
  
  // Apply simple rotation
  const adjustedLongRad = longRad + Math.PI + rotationX;
  
  // Convert to 2D position (simplified)
  const x = centerX + radius * Math.cos(latRad) * Math.cos(adjustedLongRad);
  const y = centerY + radius * Math.sin(latRad);
  
  return { x, y };
}

export default Globe;
