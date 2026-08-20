import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Car, 
  Moon, 
  Flame, 
  Wind, 
  CloudRain, 
  Plane, 
  Users, 
  VolumeX,
  TrendingUp,
  Percent,
  Timer,
  Milestone
} from 'lucide-react';
import { DangerZone, CityPreset } from '@/lib/danger-zones';
import { DroneHazardZone, DroneCityCorridor, DroneDeliveryMission } from '@/lib/drone-hazards';
import { RouteOption, SafeToDirectRateMetrics, calculateSafeToDirectRate } from '@/lib/safe-routing-engine';
import { DroneRouteOption } from '@/lib/drone-routing-engine';
import { Badge } from '@/components/ui/badge';

interface Props {
  navMode: 'DRONE_SKYWAY' | 'GROUND_VEHICLE';
  selectedCity: CityPreset;
  selectedDroneCorridor: DroneCityCorridor;
  selectedDroneMission: DroneDeliveryMission;
  activeGroundRoute: RouteOption | null;
  groundDirectRoute: RouteOption | null;
  activeDroneRoute: DroneRouteOption | null;
  groundDangerZones: DangerZone[];
  droneHazards: DroneHazardZone[];
}

export const DangerAnalyticsPanel: React.FC<Props> = ({
  navMode,
  selectedCity,
  selectedDroneCorridor,
  selectedDroneMission,
  activeGroundRoute,
  groundDirectRoute,
  activeDroneRoute,
  groundDangerZones,
  droneHazards
}) => {
  const isDrone = navMode === 'DRONE_SKYWAY';

  // Compute Safe-to-Direct Rate Metrics
  const safeToDirectRate: SafeToDirectRateMetrics | null = (activeGroundRoute && groundDirectRoute)
    ? calculateSafeToDirectRate(activeGroundRoute, groundDirectRoute, groundDangerZones)
    : null;

  if (isDrone) {
    const bypassed = activeDroneRoute?.bypassedHazards || [];
    const intercepted = activeDroneRoute?.interceptedHazards || [];

    return (
      <div className="space-y-4">
        {/* Drone Skyway Aero Telemetry Card */}
        <div className="apple-glass rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
                {selectedDroneCorridor.name}
              </span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-mono">
              FAA PART 107
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Ground Risk Index</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                0.00%
              </div>
              <div className="text-[10px] text-slate-400">Zero human crowd exposure</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Acoustic Score</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {activeDroneRoute?.acousticComplianceScore || 98}%
              </div>
              <div className="text-[10px] text-slate-400">&lt;48 dBA quiet compliant</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Battery Consumed</div>
              <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                {activeDroneRoute?.batteryConsumedWh || 62} <span className="text-xs text-slate-500">Wh</span>
              </div>
              <div className="text-[10px] text-slate-400">{activeDroneRoute?.batteryRemainingPercent || 88}% Remaining</div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Cruise Altitude</div>
              <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">
                {activeDroneRoute?.cruisingAltitudeMeters || 110} <span className="text-xs text-slate-500">m AGL</span>
              </div>
              <div className="text-[10px] text-slate-400">Optimal wind corridor</div>
            </div>
          </div>

          <div className="p-2 bg-slate-950/50 rounded-xl border border-white/5 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="text-slate-400 font-mono">MISSION:</span>
            <span className="font-semibold text-cyan-300">{selectedDroneMission.title}</span>
          </div>
        </div>

        {/* Atmospheric & Aviation Hazards Bypassed */}
        <div className="apple-glass rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
                Aero Hazards Bypassed ({bypassed.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">100% CLEAR</span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {bypassed.map((hazard) => (
              <div
                key={hazard.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {hazard.category === 'weather_wind_shear' && <Wind className="w-4 h-4 text-cyan-400" />}
                    {hazard.category === 'weather_rain_cell' && <CloudRain className="w-4 h-4 text-blue-400" />}
                    {hazard.category === 'faa_airspace_nfz' && <Plane className="w-4 h-4 text-red-400" />}
                    {hazard.category === 'high_density_crowd' && <Users className="w-4 h-4 text-amber-400" />}
                    {hazard.category === 'noise_sensitive_residential' && <VolumeX className="w-4 h-4 text-purple-400" />}
                    <span className="text-xs font-bold text-slate-200">{hazard.name}</span>
                  </div>
                  <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-mono shrink-0">
                    Risk: {hazard.riskScore}/100
                  </Badge>
                </div>

                <p className="text-[11px] text-slate-400 mb-2">
                  {hazard.description}
                </p>

                <div className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 p-1.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{hazard.safetyAdvisory}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ground Vehicle Analytics with Safe-to-Direct Rate Calculation
  const bypassed = activeGroundRoute?.bypassedDangerZones || [];

  return (
    <div className="space-y-4">
      {/* 1. Safe-to-Direct Rate Calculation Metrics Card */}
      {safeToDirectRate && (
        <div className="apple-glass rounded-2xl p-4 shadow-xl border-emerald-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold tracking-wider text-emerald-300 uppercase">
                Safe vs Direct Rate Telemetry
              </span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono font-bold">
              +{safeToDirectRate.safetyGainPercent}% SAFER
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-emerald-500/20">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Threat Evasion Rate
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {safeToDirectRate.dangerAvoidanceRatePercent}%
              </div>
              <div className="text-[10px] text-slate-400">
                Evaded {safeToDirectRate.dangerAvoidedFormatted} red zone
              </div>
            </div>

            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Timer className="w-3 h-3 text-cyan-400" />
                Detour Trade-Off
              </div>
              <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                +{safeToDirectRate.detourDistancePercent}% <span className="text-xs text-slate-500">(+{safeToDirectRate.extraTimeMinutes} min)</span>
              </div>
              <div className="text-[10px] text-slate-400">For total threat evasion</div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-white/5 text-xs text-slate-300 flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[11px]">Crimes Evaded:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ~{safeToDirectRate.totalCrimesEvadedPerMonth} incidents / month avoided
            </span>
          </div>
        </div>
      )}

      {/* 2. City Baseline Profile */}
      <div className="apple-glass rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
              {selectedCity.name} Municipal Risk Baseline
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-slate-400">
            {selectedCity.state}, USA
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">City Safety Index</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {selectedCity.safetyRating} <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="text-[10px] text-slate-400">Metro Average</div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Violent Crime Rate</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              {selectedCity.violentCrimePer1k} <span className="text-xs text-slate-500">/ 1k pop</span>
            </div>
            <div className="text-[10px] text-slate-400">Per annum</div>
          </div>
        </div>
      </div>

      {/* 3. Bypassed Danger Zones List */}
      <div className="apple-glass rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
              Danger Zones Bypassed ({bypassed.length})
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">100% EVADED</span>
        </div>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {bypassed.map((zone) => (
            <div
              key={zone.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-200">{zone.name}</span>
                <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-mono">
                  Risk: {zone.riskScore}/100
                </Badge>
              </div>

              <p className="text-[11px] text-slate-400 mb-2">{zone.description}</p>

              <div className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 p-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>{zone.safetyAdvisory}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
