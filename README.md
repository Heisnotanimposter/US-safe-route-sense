# US-Safe-Route-Sense

> **Autonomous 3D UAV Skyway UTM & High-Security Urban Ground Navigation Platform**

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-3D-blueviolet.svg)](https://maplibre.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## Overview

**US-Safe-Route-Sense** is an enterprise-grade spatial navigation platform that solves the fatal blind spot of consumer navigation tools (e.g. Google Maps, Waze), which prioritize shortest travel duration while blindly routing vehicles through violent crime corridors and failing to provide 3D regulatory deconfliction for autonomous drones.

The platform provides two flagship navigation modes:
1. **AeroSafe 3D Skyway (FAA Part 107 UTM)**: Regional autonomous drone corridor planning with 3D altitude profiles (climb, cruise, descent, safety margins), microburst wind-shear buffering, No-Fly Zone (NFZ) deconfliction, battery State-of-Charge (SoC) projection, and acoustic compliance monitoring.
2. **SafeRoute Guardian Ground Navigation (OSRM Snapped)**: Physical highway and arterial route planning that reroutes around verified violent crime hotspots, carjacking zones, and civil unrest perimeters with real-time **Safe-to-Direct Rate** analytics.
3. **Mobile & Edge SDK Export**: Ready-to-deploy **Flutter (Dart)** and **iOS (Swift)** spatial routing modules for on-device, offline computation.

For comprehensive technical documentation, see [USE_CASES_AND_ARCHITECTURE.md](./USE_CASES_AND_ARCHITECTURE.md).

---

## Key Features

- **Full-Bleed 3D Quarter-View Map Engine**: Powered by MapLibre GL with dark Carto tiles, 58° tilt angle, smooth rotation, and interactive pin placement.
- **Multiple Camera Modes**:
  - `3D Quarter-View`: 58° pitch overview for strategic corridor awareness.
  - `Vehicle / Drone Follow`: Real-time tracking camera maintaining heading rotation behind the vehicle.
  - `Top-Down 2D`: Classic orthographic tactical overview.
- **Interactive Threat Placement**: Click anywhere on the map to deploy live weather disturbances (wind-shears / storms) or ground crime perimeters and watch routes dynamically recalculate in real time.
- **Safe-to-Direct Rate Metrics**: Transparent quantification of trade-offs comparing detour percentage against crimes evaded per month.
- **Drone Altitude Profile HUD**: Real-time SVG graph tracking ground elevation, safety clearances, and drone altitude AGL along the route.
- **Turn-by-Turn Voice Guidance**: Integrated browser Web Speech API announcing navigational maneuvers and hazard warnings with custom pitch and rate.
- **Use Cases & Mission Briefing Dialog**: Built-in interactive briefing modal detailing operational profiles, target personas, and regulatory frameworks.

---

## Codebase Architecture

The project is structured with strict separation of concerns into domain-driven modules:

```
src/
├── types/              # Centralized navigation, drone, and ground domain interfaces
├── hooks/              # Custom React hooks (useNavigationState, useGroundRouting, useDroneRouting, etc.)
├── components/
│   ├── map/            # MapLibre GL 3D view, MapMarkers, and MapLayers
│   ├── hud/            # Modular Tesla Glass Overlay components (TopControlCard, WaypointRouteCard, etc.)
│   ├── intel/          # Interactive Use Cases & System Briefing modal
│   ├── analytics/      # Crime and flight telemetry analytics drawer
│   ├── export/         # Flutter & Swift code export modal
│   └── ui/             # shadcn-ui components
├── lib/                # Routing engines (OSRM, 3D AeroSafe), danger databases, and templates
└── pages/
    └── Index.tsx       # Clean top-level orchestrator
```

---

## Getting Started

### Prerequisites
- Node.js (v18+) or Bun
- npm, pnpm, or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/Heisnotanimposter/US-safe-route-sense.git
cd US-safe-route-sense

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## License

This project is licensed under the MIT License.
