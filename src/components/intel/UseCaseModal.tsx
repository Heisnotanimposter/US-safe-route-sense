import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Plane, 
  ShieldCheck, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Layers, 
  Activity, 
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UseCaseModal: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto apple-glass border-white/10 text-slate-100 p-6 rounded-3xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 px-2.5 py-0.5 text-xs font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> US-SAFE-ROUTE-SENSE SPECIFICATION
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-2 py-0.5 text-xs font-mono">
              V2.4 MODULAR ARCHITECTURE
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            System Mission Briefing & Precise Use Cases
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Dual-domain autonomous 3D UAV airspace navigation and high-security urban road routing engine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-3 text-xs text-slate-300 leading-relaxed">
          {/* Executive Overview */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              The Core Problem: Standard GPS Blind Spots
            </h3>
            <p>
              Traditional consumer navigation engines (e.g. Google Maps, Apple Maps, Waze) strictly optimize for the 
              <strong> mathematically shortest travel time</strong>. This naive objective function leads to catastrophic failure in two mission-critical domains:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Urban Physical Blindness
                </div>
                <p className="text-[11px] text-slate-400">
                  Consumer GPS routes delivery couriers, high-value logistics, and solo night drivers straight through high-density violent crime corridors and carjacking red zones to save 90 seconds.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                  <CloudLightning className="w-3.5 h-3.5" /> Drone 3D Airspace Void
                </div>
                <p className="text-[11px] text-slate-400">
                  UAV delivery networks cannot fly straight lines: they must respect FAA Part 107 No-Fly Zones (NFZ), microburst wind-shears, pedestrian crowd safety (Part 107.39), and residential noise ceilings.
                </p>
              </div>
            </div>
          </div>

          {/* Use Case 1: AeroSafe 3D Drone Skyway */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Use Case 1: AeroSafe 3D Drone Skyway (UTM)</h4>
                  <span className="text-[10px] text-cyan-400 font-mono">FAA PART 107 • AIRSPACE DECONFLICTION • 3D ALTITUDE PROFILING</span>
                </div>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-[10px] font-mono">
                REGIONAL CORRIDORS
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Target Personas</div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>Hospital Emergency Dispatchers (Blood / Organs)</li>
                  <li>Autonomous Parcel Logistics (E-Commerce)</li>
                  <li>Utility & Infrastructure LiDAR Surveyors</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Operational Constraints</div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>FAA Ceiling: Max 120m AGL (Part 107.51)</li>
                  <li>Crowd Avoidance: Zero flight over open assemblies</li>
                  <li>Acoustic Limit: &lt; 65 dBA over residential wards</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Engine Deliverables</div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>Continuous 3D Climb/Cruise/Descent curves</li>
                  <li>Atmospheric wind-shear 3D buffer rerouting</li>
                  <li>Battery State-of-Charge (SoC) projection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Use Case 2: SafeRoute Guardian Physical Road Navigation */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Use Case 2: SafeRoute Guardian Ground Navigation</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">OSRM PHYSICAL SNAPPING • CRIME BUFFERING • SAFE-TO-DIRECT RATIO</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-mono">
                VEHICLE FLEETS
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Target Personas</div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>Armored Transport & Cash-in-Transit</li>
                  <li>Emergency First Responder Fleet Routing</li>
                  <li>Solo Night Commuters & Rideshare Operators</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Geographic Intelligence</div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li>Violent crime & gang conflict hotzones</li>
                  <li>Unlit corridors & vehicle ambush perimeters</li>
                  <li>Live civil alert & curfew buffer perimeters</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Transparent Trade-Off</div>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  <li><strong>Safe-to-Direct Rate</strong> comparison</li>
                  <li>e.g., +7.8% travel distance to evade 100% violent crimes</li>
                  <li>OSRM arterial highway bypass snapping</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Use Case 3: Mobile & On-Device Native SDK Export */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Use Case 3: Embedded & Mobile SDK (Flutter & Swift)</h4>
                  <span className="text-[10px] text-indigo-400 font-mono">OFFLINE ON-DEVICE ROUTING • FLIGHT CONTROLLER INTEGRATION</span>
                </div>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px] font-mono">
                NATIVE CODE
              </Badge>
            </div>

            <p className="text-[11px] text-slate-400">
              Robotics platforms (PX4, ArduPilot) and in-vehicle dash units operate in degraded cellular conditions. The built-in code generator provides pre-compiled <strong>Flutter (Dart)</strong> and <strong>iOS (Swift)</strong> spatial search classes implementing local cost-matrix penalties without server round-trips.
            </p>
          </div>

          {/* Feature Matrix */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Platform Architecture & Domain Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono">
                    <th className="py-2 pr-3">Feature</th>
                    <th className="py-2 px-3 text-cyan-300">AeroSafe 3D Skyway</th>
                    <th className="py-2 px-3 text-emerald-300">SafeRoute Guardian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-white">Coordinate Dimension</td>
                    <td className="py-2 px-3">3D (Lng, Lat, Altitude AGL)</td>
                    <td className="py-2 px-3">2D Road Snapped (OSRM)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-white">Threat Model</td>
                    <td className="py-2 px-3">Wind shear, NFZs, Crowds, Noise</td>
                    <td className="py-2 px-3">Violent crime, Carjacking, Slums</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-white">Telemetry Feedback</td>
                    <td className="py-2 px-3">Altitude HUD, Battery SoC, Acoustics</td>
                    <td className="py-2 px-3">Safe-to-Direct Rate, Crime Evasion</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold text-white">Camera Support</td>
                    <td className="py-2 px-3">Quarter-View 58°, Drone Follow, Top-Down</td>
                    <td className="py-2 px-3">Quarter-View, Driver Follow, Top-Down</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
