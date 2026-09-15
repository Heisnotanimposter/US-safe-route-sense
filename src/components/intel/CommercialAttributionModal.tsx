import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ShieldCheck, Scale, Database, Globe, Radio, AlertCircle } from 'lucide-react';

interface CommercialAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialAttributionModal: React.FC<CommercialAttributionModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/30 text-slate-100 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold tracking-wider uppercase font-mono">
              Commercial Compliance & Licensing Registry
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs font-mono">
            Full legal attribution and compliance audit for white-label commercial distribution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs text-slate-300 font-sans leading-relaxed">
          {/* Status Alert */}
          <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">Commercial Ready (Clean-Room Certified)</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                All restrictive non-commercial datasets (e.g. TeleGeography cables CC BY-NC-SA, OpenSky academic feeds, and Google News personal RSS) have been omitted or replaced with commercial-grade endpoints.
              </p>
            </div>
          </div>

          {/* Software License */}
          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-mono font-bold text-cyan-400 text-sm">
              <Scale className="w-4 h-4" />
              <span>Core Application & Engine (MIT License)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The underlying software code architecture is licensed under the permissive MIT License. You are legally entitled to fork, rebrand, modify, package, and commercialize this software.
            </p>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400">
              Copyright (c) 2026 Bilawal Sidhu, SafeRouteSense Contributors. Licensed under the MIT License.
            </div>
          </div>

          {/* Third-Party Data Sources Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-cyan-400 text-sm">
              <Database className="w-4 h-4" />
              <span>Live Telemetry & Geospatial Data Sources</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>USGS Earthquakes</span>
                  <span className="text-emerald-400 text-[10px] font-mono">Public Domain</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">
                  U.S. Geological Survey Real-Time Hazard Feed. Attribution: &quot;Data courtesy of the U.S. Geological Survey&quot;.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>CelesTrak SGP4 Satellites</span>
                  <span className="text-emerald-400 text-[10px] font-mono">Public / Govt</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">
                  Orbital elements courtesy of Dr. T.S. Kelso &amp; CelesTrak. Real-time SGP4 propagation calculated on-device.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>OpenStreetMap Infrastructure</span>
                  <span className="text-emerald-400 text-[10px] font-mono">ODbL 1.0</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">
                  Datacenters, power stations &amp; dams extracted from OSM. &copy; OpenStreetMap contributors.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>NASA FIRMS Thermal</span>
                  <span className="text-emerald-400 text-[10px] font-mono">CC0 / NASA EOSDIS</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">
                  VIIRS/MODIS fire thermal anomaly data. Public domain / US Government work.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>adsb.lol Flight Radar</span>
                  <span className="text-emerald-400 text-[10px] font-mono">ODbL 1.0</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">
                  Community ADS-B exchange point API for civilian &amp; tactical aircraft tracking.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>3D Spatial Models</span>
                  <span className="text-emerald-400 text-[10px] font-mono">CC BY 4.0</span>
                </div>
                <p className="text-slate-400 text-[10px] mt-1">
                  Curated optimized glTF models (747, Jet, MQ-9, C172, Ship). Attribution retained per Sketchfab creators.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Best Practices */}
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200/90">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Commercial Deployment Recommendation:</span>
              <p className="mt-0.5 text-slate-300">
                When deploying as a multi-tenant enterprise SaaS, proxy outbound API requests (such as Map tiles or premium ADS-B enterprise feeds) through your secure backend with API key rotation and user rate-limits.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
