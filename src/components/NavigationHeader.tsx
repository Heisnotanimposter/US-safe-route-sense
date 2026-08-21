import React from 'react';
import { 
  ShieldCheck, 
  Map, 
  Sliders, 
  Smartphone, 
  Sparkles, 
  Building2, 
  Flame,
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CITY_PRESETS, CityPreset } from '@/lib/danger-zones';

interface Props {
  selectedCity: CityPreset;
  onCityChange: (cityId: string) => void;
  safetySensitivity: number;
  onSafetySensitivityChange: (val: number) => void;
  onOpenMobileExport: () => void;
  onResetToDefaults: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const NavigationHeader: React.FC<Props> = ({
  selectedCity,
  onCityChange,
  safetySensitivity,
  onSafetySensitivityChange,
  onOpenMobileExport,
  onResetToDefaults,
  isAudioEnabled,
  onToggleAudio
}) => {
  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Mission */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                SafeRoute <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">Sense</span>
              </h1>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                3D Quarter-View
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              High-Risk Crime & Slum Avoidance Spatial Navigation Engine
            </p>
          </div>
        </div>

        {/* Controls: City Selector & Safety Sensitivity */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* City Preset Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 shadow-inner">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <Select value={selectedCity.id} onValueChange={onCityChange}>
              <SelectTrigger className="w-[140px] h-7 text-xs bg-transparent border-0 focus:ring-0 text-slate-200 font-medium p-0">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                {CITY_PRESETS.map(city => (
                  <SelectItem key={city.id} value={city.id} className="text-xs focus:bg-slate-800">
                    {city.name}, {city.state} (Safety: {city.safetyRating}/100)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Safety Weight Slider */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Avoidance:</span>
            <div className="w-24">
              <Slider
                value={[safetySensitivity]}
                min={2}
                max={15}
                step={1}
                onValueChange={(vals) => onSafetySensitivityChange(vals[0])}
                className="cursor-pointer"
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {safetySensitivity}x
            </span>
          </div>

          {/* Audio Voice Cue Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleAudio}
            className={`h-8 px-2.5 text-xs border-slate-800 ${
              isAudioEnabled ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-500'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>

          {/* Reset Origin / Dest */}
          <Button
            size="sm"
            variant="outline"
            onClick={onResetToDefaults}
            className="h-8 px-2.5 text-xs border-slate-800 text-slate-400 hover:text-white"
            title="Reset to City Defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          {/* Export Flutter & Swift Code Modal Trigger */}
          <Button
            size="sm"
            onClick={onOpenMobileExport}
            className="h-8 px-3 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium gap-1.5 shadow-lg shadow-cyan-600/20"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Flutter & Swift Code
          </Button>
        </div>
      </div>
    </header>
  );
};
