import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { DangerZone } from '@/lib/danger-zones';
import { RouteOption } from '@/lib/safe-routing-engine';
import { 
  Eye, 
  Compass, 
  MapPin, 
  ShieldAlert, 
  Layers, 
  Crosshair, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type CameraMode = 'QUARTER_VIEW' | 'DRIVER_FOLLOW' | 'TOP_DOWN';
export type PickingMode = 'NONE' | 'PICK_A' | 'PICK_B' | 'ADD_HAZARD';

interface Props {
  origin: [number, number];
  destination: [number, number];
  dangerZones: DangerZone[];
  activeRoute: RouteOption | null;
  baselineRoute: RouteOption | null;
  showBaselineComparison: boolean;
  onOriginChange: (coords: [number, number]) => void;
  onDestinationChange: (coords: [number, number]) => void;
  onAddCustomHazard: (coords: [number, number]) => void;
  simProgress: number; // 0.0 to 1.0
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  onVehicleStepChange?: (stepIndex: number) => void;
}

export const QuarterViewNavigation3D: React.FC<Props> = ({
  origin,
  destination,
  dangerZones,
  activeRoute,
  baselineRoute,
  showBaselineComparison,
  onOriginChange,
  onDestinationChange,
  onAddCustomHazard,
  simProgress,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  onVehicleStepChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraMode, setCameraMode] = useState<CameraMode>('QUARTER_VIEW');
  const [pickingMode, setPickingMode] = useState<PickingMode>('NONE');
  const [selectedDangerZone, setSelectedDangerZone] = useState<DangerZone | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<[number, number] | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Scene Objects
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const routeLineRef = useRef<THREE.Line | null>(null);
  const baselineLineRef = useRef<THREE.Line | null>(null);
  const dangerObjectsRef = useRef<THREE.Group[]>([]);
  const pinARef = useRef<THREE.Group | null>(null);
  const pinBRef = useRef<THREE.Group | null>(null);
  const radarSweepRef = useRef<THREE.Mesh | null>(null);

  // Mouse interaction state for orbital rotation
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 95 });

  // Camera Target
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Initialize Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Dark Navy Cyber Background
    scene.fog = new THREE.FogExp2(0x060913, 0.0075);
    sceneRef.current = scene;

    // 2. Camera Setup (Quarter-View 45° Pitch)
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Tactical Lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.5);
    dirLight.position.set(50, 80, 50);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x10b981, 2, 120);
    accentLight.position.set(0, 30, 0);
    scene.add(accentLight);

    // 5. Build Futuristic Cyber Ground Grid & 3D City Blocks
    buildCityEnvironment(scene);

    // 6. Build Radar Sweep Mesh
    const radarGeo = new THREE.RingGeometry(0.5, 60, 64);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const radarMesh = new THREE.Mesh(radarGeo, radarMat);
    radarMesh.rotation.x = -Math.PI / 2;
    radarMesh.position.y = 0.2;
    scene.add(radarMesh);
    radarSweepRef.current = radarMesh;

    // 7. Vehicle Avatar
    const vehicleGroup = createVehicleObject();
    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;

    // 8. Pins A and B
    const pinA = createPinObject(0x3b82f6, 'A');
    const pinB = createPinObject(0x10b981, 'B');
    scene.add(pinA);
    scene.add(pinB);
    pinARef.current = pinA;
    pinBRef.current = pinB;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Radar rotation & pulse
      if (radarSweepRef.current) {
        radarSweepRef.current.rotation.z = elapsedTime * 0.6;
        const scale = 1.0 + Math.sin(elapsedTime * 2) * 0.05;
        radarSweepRef.current.scale.set(scale, scale, scale);
      }

      // Animate Pin floats
      if (pinARef.current) {
        pinARef.current.position.y = 2.5 + Math.sin(elapsedTime * 3) * 0.4;
      }
      if (pinBRef.current) {
        pinBRef.current.position.y = 2.5 + Math.cos(elapsedTime * 3) * 0.4;
      }

      // Animate Danger Zone pulsing cylinders
      dangerObjectsRef.current.forEach((obj, idx) => {
        const ring = obj.getObjectByName('pulseRing');
        if (ring) {
          const pulse = 1.0 + Math.sin(elapsedTime * 3 + idx) * 0.12;
          ring.scale.set(pulse, 1, pulse);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Update Camera position based on angles & mode
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const { theta, phi, radius } = cameraAngleRef.current;

    if (cameraMode === 'QUARTER_VIEW') {
      // 45° Pitch Isometric Quarter-View
      camera.position.x = cameraTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = cameraTargetRef.current.y + radius * Math.cos(phi);
      camera.position.z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(cameraTargetRef.current);
    } else if (cameraMode === 'TOP_DOWN') {
      // 2D Tactical View
      camera.position.set(cameraTargetRef.current.x, radius * 1.1, cameraTargetRef.current.z + 0.001);
      camera.lookAt(cameraTargetRef.current);
    }
  }, [cameraMode]);

  // Update camera mode changes
  useEffect(() => {
    if (cameraMode === 'QUARTER_VIEW') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 95 };
    } else if (cameraMode === 'TOP_DOWN') {
      cameraAngleRef.current = { theta: 0, phi: 0.01, radius: 105 };
    }
    updateCameraPosition();
  }, [cameraMode, updateCameraPosition]);

  // Update Pins A and B positions
  useEffect(() => {
    if (pinARef.current) {
      pinARef.current.position.set(origin[0], 2.5, origin[1]);
    }
    if (pinBRef.current) {
      pinBRef.current.position.set(destination[0], 2.5, destination[1]);
    }
  }, [origin, destination]);

  // Update Danger Zones in 3D
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean existing danger 3D objects
    dangerObjectsRef.current.forEach(obj => scene.remove(obj));
    dangerObjectsRef.current = [];

    dangerZones.forEach(zone => {
      const group = new THREE.Group();
      group.position.set(zone.center[0], 0, zone.center[1]);

      // 1. Red Ground Perimeter Circle
      const circleGeo = new THREE.RingGeometry(zone.radius - 0.5, zone.radius, 48);
      const circleMat = new THREE.MeshBasicMaterial({
        color: zone.severity === 'critical' ? 0xef4444 : 0xf97316,
        side: THREE.DoubleSide
      });
      const circleMesh = new THREE.Mesh(circleGeo, circleMat);
      circleMesh.rotation.x = -Math.PI / 2;
      circleMesh.position.y = 0.3;
      circleMesh.name = 'pulseRing';
      group.add(circleMesh);

      // 2. Volumetric Hazard Cylinder
      const cylGeo = new THREE.CylinderGeometry(zone.radius, zone.radius, 12, 32, 1, true);
      const cylMat = new THREE.MeshBasicMaterial({
        color: zone.severity === 'critical' ? 0xdc2626 : 0xeab308,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cylMesh = new THREE.Mesh(cylGeo, cylMat);
      cylMesh.position.y = 6;
      group.add(cylMesh);

      // 3. Central Danger Icon / Beacon
      const beaconGeo = new THREE.ConeGeometry(1.2, 3.5, 4);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        wireframe: true
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 8;
      beaconMesh.rotation.x = Math.PI;
      group.add(beaconMesh);

      scene.add(group);
      dangerObjectsRef.current.push(group);
    });
  }, [dangerZones]);

  // Update Route Polyline Ribbons in 3D
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove old active route
    if (routeLineRef.current) {
      scene.remove(routeLineRef.current);
      routeLineRef.current.geometry.dispose();
      routeLineRef.current = null;
    }

    // Remove old baseline route
    if (baselineLineRef.current) {
      scene.remove(baselineLineRef.current);
      baselineLineRef.current.geometry.dispose();
      baselineLineRef.current = null;
    }

    // 1. Draw Active Safe Route
    if (activeRoute && activeRoute.pathPoints.length > 1) {
      const points = activeRoute.pathPoints.map(p => new THREE.Vector3(p[0], 0.6, p[1]));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, points.length * 8, 0.45, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: activeRoute.type === 'SAFE_GUARDIAN' ? 0x10b981 : (activeRoute.type === 'BALANCED' ? 0x3b82f6 : 0xef4444),
        transparent: true,
        opacity: 0.95
      });
      const routeMesh = new THREE.Mesh(tubeGeo, tubeMat) as any;
      scene.add(routeMesh);
      routeLineRef.current = routeMesh;
    }

    // 2. Draw Baseline Unsafe Route Comparison (if enabled)
    if (showBaselineComparison && baselineRoute && baselineRoute.pathPoints.length > 1) {
      const points = baselineRoute.pathPoints.map(p => new THREE.Vector3(p[0], 0.4, p[1]));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineDashedMaterial({
        color: 0xef4444,
        dashSize: 1.5,
        gapSize: 1.0,
        linewidth: 2
      });
      const baselineLine = new THREE.Line(geometry, material);
      baselineLine.computeLineDistances();
      scene.add(baselineLine);
      baselineLineRef.current = baselineLine;
    }
  }, [activeRoute, baselineRoute, showBaselineComparison]);

  // Update Vehicle position along route during simulation
  useEffect(() => {
    if (!vehicleGroupRef.current || !activeRoute || activeRoute.pathPoints.length < 2) return;

    const points = activeRoute.pathPoints.map(p => new THREE.Vector3(p[0], 0.8, p[1]));
    const curve = new THREE.CatmullRomCurve3(points);

    const clampedProgress = Math.min(Math.max(simProgress, 0), 1);
    const position = curve.getPointAt(clampedProgress);
    const tangent = curve.getTangentAt(clampedProgress).normalize();

    vehicleGroupRef.current.position.copy(position);

    // Orient vehicle towards tangent direction
    const angle = Math.atan2(tangent.x, tangent.z);
    vehicleGroupRef.current.rotation.y = angle;

    // Driver follow camera mode
    if (cameraMode === 'DRIVER_FOLLOW' && cameraRef.current) {
      const followOffset = tangent.clone().multiplyScalar(-18).add(new THREE.Vector3(0, 10, 0));
      cameraRef.current.position.copy(position.clone().add(followOffset));
      cameraRef.current.lookAt(position.clone().add(tangent.clone().multiplyScalar(15)));
    }

    // Notify current step index
    if (onVehicleStepChange && activeRoute.steps.length > 0) {
      const stepIdx = Math.min(
        Math.floor(clampedProgress * activeRoute.steps.length),
        activeRoute.steps.length - 1
      );
      onVehicleStepChange(stepIdx);
    }
  }, [simProgress, activeRoute, cameraMode, onVehicleStepChange]);

  // Mouse Interaction: Orbit, Pan, and Point Picking
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast on ground plane for coordinates
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, target);

    if (target) {
      setHoveredPoint([Math.round(target.x * 10) / 10, Math.round(target.z * 10) / 10]);
    }

    if (!isDraggingRef.current || cameraMode === 'DRIVER_FOLLOW') return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (e.buttons === 1) {
      // Rotate Quarter-View Camera
      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.1, cameraAngleRef.current.phi - deltaY * 0.008));
      updateCameraPosition();
    } else if (e.buttons === 2) {
      // Pan Camera Target
      cameraTargetRef.current.x -= deltaX * 0.15;
      cameraTargetRef.current.z -= deltaY * 0.15;
      updateCameraPosition();
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, target);

    if (!target) return;

    const coords: [number, number] = [
      Math.round(Math.max(-45, Math.min(45, target.x)) * 10) / 10,
      Math.round(Math.max(-45, Math.min(45, target.z)) * 10) / 10
    ];

    if (pickingMode === 'PICK_A') {
      onOriginChange(coords);
      setPickingMode('NONE');
    } else if (pickingMode === 'PICK_B') {
      onDestinationChange(coords);
      setPickingMode('NONE');
    } else if (pickingMode === 'ADD_HAZARD') {
      onAddCustomHazard(coords);
      setPickingMode('NONE');
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (cameraMode === 'DRIVER_FOLLOW') return;
    cameraAngleRef.current.radius = Math.max(30, Math.min(180, cameraAngleRef.current.radius + e.deltaY * 0.08));
    updateCameraPosition();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden bg-slate-950 rounded-xl border border-slate-800 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          pickingMode !== 'NONE' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      />

      {/* Quarter-View Perspective Badge & Mode Selector */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
        <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-300">
            3D QUARTER-VIEW ENGINE
          </span>
          <Badge variant="outline" className="text-[10px] bg-cyan-950/60 border-cyan-500/40 text-cyan-400 font-mono">
            60 FPS
          </Badge>
        </div>

        {/* Camera Perspective Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-1 rounded-lg flex items-center gap-1 shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={cameraMode === 'QUARTER_VIEW' ? 'default' : 'ghost'}
                  onClick={() => setCameraMode('QUARTER_VIEW')}
                  className={`h-7 px-2.5 text-xs font-medium gap-1.5 ${
                    cameraMode === 'QUARTER_VIEW' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Quarter-View 45°
                </Button>
              </TooltipTrigger>
              <TooltipContent>Standard 45-degree 3D Isometric View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={cameraMode === 'DRIVER_FOLLOW' ? 'default' : 'ghost'}
                  onClick={() => setCameraMode('DRIVER_FOLLOW')}
                  className={`h-7 px-2.5 text-xs font-medium gap-1.5 ${
                    cameraMode === 'DRIVER_FOLLOW' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-slate-300'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Driver Follow
                </Button>
              </TooltipTrigger>
              <TooltipContent>Locks camera behind vehicle in real time</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={cameraMode === 'TOP_DOWN' ? 'default' : 'ghost'}
                  onClick={() => setCameraMode('TOP_DOWN')}
                  className={`h-7 px-2.5 text-xs font-medium gap-1.5 ${
                    cameraMode === 'TOP_DOWN' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'text-slate-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  2D Top-Down
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tactical 2D bird's eye view</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Interactive Point Picking Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
          <Button
            size="sm"
            variant={pickingMode === 'PICK_A' ? 'default' : 'outline'}
            onClick={() => setPickingMode(pickingMode === 'PICK_A' ? 'NONE' : 'PICK_A')}
            className={`h-7 px-2.5 text-xs gap-1.5 ${
              pickingMode === 'PICK_A' ? 'bg-blue-600 text-white' : 'border-blue-500/40 text-blue-400 hover:bg-blue-950/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {pickingMode === 'PICK_A' ? 'Click Map for A' : 'Set Point A'}
          </Button>

          <Button
            size="sm"
            variant={pickingMode === 'PICK_B' ? 'default' : 'outline'}
            onClick={() => setPickingMode(pickingMode === 'PICK_B' ? 'NONE' : 'PICK_B')}
            className={`h-7 px-2.5 text-xs gap-1.5 ${
              pickingMode === 'PICK_B' ? 'bg-emerald-600 text-white' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {pickingMode === 'PICK_B' ? 'Click Map for B' : 'Set Point B'}
          </Button>

          <Button
            size="sm"
            variant={pickingMode === 'ADD_HAZARD' ? 'default' : 'outline'}
            onClick={() => setPickingMode(pickingMode === 'ADD_HAZARD' ? 'NONE' : 'ADD_HAZARD')}
            className={`h-7 px-2.5 text-xs gap-1.5 ${
              pickingMode === 'ADD_HAZARD' ? 'bg-red-600 text-white' : 'border-red-500/40 text-red-400 hover:bg-red-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {pickingMode === 'ADD_HAZARD' ? 'Click to Drop Danger' : '+ Danger Zone'}
          </Button>
        </div>
      </div>

      {/* Picking Active Banner */}
      {pickingMode !== 'NONE' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-cyan-950/95 border border-cyan-500/80 px-4 py-2 rounded-full text-cyan-200 text-xs font-mono font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>
            {pickingMode === 'PICK_A' && 'Click anywhere on 3D map to reposition Point A (Origin)'}
            {pickingMode === 'PICK_B' && 'Click anywhere on 3D map to reposition Point B (Destination)'}
            {pickingMode === 'ADD_HAZARD' && 'Click on 3D grid to place a new High-Risk Danger Zone & trigger instant safe reroute'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPickingMode('NONE')}
            className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Vehicle Simulation Controller Bottom Dock */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-2 rounded-xl flex items-center gap-3 pointer-events-auto shadow-2xl">
          <Button
            size="sm"
            onClick={onToggleSimulation}
            className={`h-8 px-3 text-xs font-semibold gap-1.5 ${
              isSimulating ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Pause Drive' : 'Start 3D Drive'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onResetSimulation}
            className="h-8 px-2 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {/* Progress bar */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${Math.round(simProgress * 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {Math.round(simProgress * 100)}%
            </span>
          </div>
        </div>

        {/* Map Coordinates & Danger Legend */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl pointer-events-auto flex items-center gap-4 text-xs font-mono shadow-2xl">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">GRID:</span>
            <span>{hoveredPoint ? `[${hoveredPoint[0]}, ${hoveredPoint[1]}]` : '[0.0, 0.0]'}</span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 font-sans text-[11px]">Safe Path</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-sans text-[11px]">Danger Zone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Procedural 3D City Builder
function buildCityEnvironment(scene: THREE.Scene) {
  // Ground grid
  const gridHelper = new THREE.GridHelper(100, 25, 0x06b6d4, 0x1e293b);
  gridHelper.position.y = 0.05;
  scene.add(gridHelper);

  // Ground plane
  const planeGeo = new THREE.PlaneGeometry(100, 100);
  const planeMat = new THREE.MeshBasicMaterial({ color: 0x090d16, side: THREE.DoubleSide });
  const ground = new THREE.Mesh(planeGeo, planeMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // 3D Procedural Skyscrapers with Cyber Neon Windows
  const buildingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.8
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35 });

  // Generate 40 aesthetic procedural city block buildings
  for (let i = 0; i < 48; i++) {
    const bx = ((i % 8) - 3.5) * 12 + (Math.sin(i) * 2);
    const bz = (Math.floor(i / 8) - 2.5) * 14 + (Math.cos(i) * 2);

    // Keep center open for routes
    if (Math.abs(bx) < 6 && Math.abs(bz) < 6) continue;

    const bHeight = 4 + (Math.sin(i * 99) * 0.5 + 0.5) * 18;
    const bWidth = 4 + (i % 3);
    const bDepth = 4 + ((i * 2) % 3);

    const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
    const buildingMesh = new THREE.Mesh(bGeo, buildingMat);
    buildingMesh.position.set(bx, bHeight / 2, bz);

    const edges = new THREE.EdgesGeometry(bGeo);
    const line = new THREE.LineSegments(edges, edgeMat);
    buildingMesh.add(line);

    scene.add(buildingMesh);
  }
}

// Helper: 3D Tactical Vehicle Marker
function createVehicleObject(): THREE.Group {
  const group = new THREE.Group();

  // Cyber car body
  const bodyGeo = new THREE.BoxGeometry(2.0, 0.8, 3.8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.9,
    roughness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  group.add(body);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 1.8);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.95,
    roughness: 0.05
  });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.1, -0.2);
  group.add(cabin);

  // Headlights
  const lightGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const leftLight = new THREE.Mesh(lightGeo, lightMat);
  leftLight.position.set(-0.7, 0.5, 1.9);
  const rightLight = new THREE.Mesh(lightGeo, lightMat);
  rightLight.position.set(0.7, 0.5, 1.9);
  group.add(leftLight);
  group.add(rightLight);

  // Taillights (Red neon)
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const leftTail = new THREE.Mesh(lightGeo, tailMat);
  leftTail.position.set(-0.7, 0.5, -1.9);
  const rightTail = new THREE.Mesh(lightGeo, tailMat);
  rightTail.position.set(0.7, 0.5, -1.9);
  group.add(leftTail);
  group.add(rightTail);

  return group;
}

// Helper: 3D Holographic Waypoint Pins
function createPinObject(hexColor: number, label: string): THREE.Group {
  const group = new THREE.Group();

  const headGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const headMat = new THREE.MeshBasicMaterial({ color: hexColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.0;
  group.add(head);

  const stemGeo = new THREE.CylinderGeometry(0.1, 0.3, 2.0, 8);
  const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 1.0;
  group.add(stem);

  // Ground glowing halo ring
  const haloGeo = new THREE.RingGeometry(0.8, 1.8, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: hexColor,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.2;
  group.add(halo);

  return group;
}
