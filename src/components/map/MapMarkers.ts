import { NavMode } from '@/types/navigation';

export function updateOriginPin(el: HTMLElement, mode: NavMode) {
  if (mode === 'DRONE_SKYWAY') {
    el.innerHTML = `
      <div class="relative flex items-center justify-center w-10 h-10">
        <div class="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-slate-950/90 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center font-mono font-bold text-[11px] shadow-2xl shadow-cyan-500/80">
          H1
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/90 text-white font-mono font-bold text-xs border-2 border-white shadow-xl shadow-cyan-500/50">
        A
      </div>
    `;
  }
}

export function updateDestPin(el: HTMLElement, mode: NavMode) {
  if (mode === 'DRONE_SKYWAY') {
    el.innerHTML = `
      <div class="relative flex items-center justify-center w-10 h-10">
        <div class="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="w-8 h-8 rounded-full bg-slate-950/90 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-mono font-bold text-[11px] shadow-2xl shadow-emerald-500/80">
          H2
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 text-white font-mono font-bold text-xs border-2 border-white shadow-xl shadow-emerald-500/50">
        B
      </div>
    `;
  }
}

export function updateVehicleMarkerIcon(el: HTMLElement, mode: NavMode) {
  if (mode === 'DRONE_SKYWAY') {
    el.innerHTML = `
      <div class="relative flex flex-col items-center justify-center w-14 h-14">
        <!-- Altitude Laser Ground Projection -->
        <div class="absolute -bottom-6 w-1 h-6 bg-gradient-to-b from-cyan-400 to-transparent opacity-80 animate-pulse"></div>
        <!-- 3D Quadcopter Airframe with Spinning Rotors -->
        <div class="relative w-10 h-10 rounded-full bg-slate-950/95 border-2 border-cyan-400 flex items-center justify-center shadow-2xl shadow-cyan-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin duration-700">
            <path d="M12 2v20M2 12h20"/>
            <circle cx="12" cy="12" r="3" fill="#06b6d4"/>
          </svg>
          <div class="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-cyan-400/80 animate-ping"></div>
          <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400/80 animate-ping"></div>
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/90 border-2 border-white text-white shadow-2xl shadow-emerald-500/80">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2" fill="white" stroke="none"/>
        </svg>
      </div>
    `;
  }
}
