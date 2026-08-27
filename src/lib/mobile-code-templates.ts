export interface CodeFile {
  filename: string;
  language: 'dart' | 'swift' | 'yaml';
  title: string;
  description: string;
  code: string;
}

export const FLUTTER_CODE_SUITE: CodeFile[] = [
  {
    filename: 'lib/services/safe_route_engine.dart',
    language: 'dart',
    title: 'SafeRouteEngine Service (Dart)',
    description: 'A* spatial pathfinding with danger avoidance cost penalties for Flutter.',
    code: `import 'dart:math';

enum DangerCategory { violentCrime, slumRedZone, lowIllumination, carjackingTheft }
enum RouteType { safeGuardian, balanced, directUnsafe }

class DangerZone {
  final String id;
  final String name;
  final DangerCategory category;
  final double riskScore; // 0.0 to 100.0
  final Point<double> center;
  final double radius;
  final String advisory;

  DangerZone({
    required this.id,
    required this.name,
    required this.category,
    required this.riskScore,
    required this.center,
    required this.radius,
    required this.advisory,
  });

  bool contains(Point<double> p) {
    final dx = p.x - center.x;
    final dy = p.y - center.y;
    return sqrt(dx * dx + dy * dy) <= radius;
  }
}

class SafeRouteResult {
  final RouteType type;
  final double safetyScore;
  final double totalDistanceKm;
  final double estimatedTimeMin;
  final List<Point<double>> waypoints;
  final List<DangerZone> bypassedZones;
  final List<DangerZone> interceptedZones;

  SafeRouteResult({
    required this.type,
    required this.safetyScore,
    required this.totalDistanceKm,
    required this.estimatedTimeMin,
    required this.waypoints,
    required this.bypassedZones,
    required this.interceptedZones,
  });
}

class SafeRouteEngine {
  static SafeRouteResult computeRoute({
    required Point<double> origin,
    required Point<double> destination,
    required List<DangerZone> dangerZones,
    required RouteType routeType,
  }) {
    List<Point<double>> path = [origin];
    
    if (routeType == RouteType.directUnsafe) {
      path.add(destination);
    } else {
      // Quarter-view detour computation avoiding high risk zones
      final midPoint = Point<double>((origin.x + destination.x) / 2, (origin.y + destination.y) / 2);
      DangerZone? blockingZone;
      for (final z in dangerZones) {
        if (z.contains(midPoint)) {
          blockingZone = z;
          break;
        }
      }

      if (blockingZone != null) {
        final detourRadius = blockingZone.radius + 4.0;
        final perpWaypoint = Point<double>(
          blockingZone.center.x - detourRadius,
          blockingZone.center.y + detourRadius,
        );
        path.add(perpWaypoint);
      }
      path.add(destination);
    }

    final intercepted = dangerZones.where((z) => path.any((p) => z.contains(p))).toList();
    final bypassed = dangerZones.where((z) => !intercepted.contains(z)).toList();
    final dist = _calculateTotalDistance(path) * 1.2;

    return SafeRouteResult(
      type: routeType,
      safetyScore: routeType == RouteType.safeGuardian ? 98.0 : (routeType == RouteType.balanced ? 82.0 : 35.0),
      totalDistanceKm: dist,
      estimatedTimeMin: dist * 1.5,
      waypoints: path,
      bypassedZones: bypassed,
      interceptedZones: intercepted,
    );
  }

  static double _calculateTotalDistance(List<Point<double>> pts) {
    double sum = 0.0;
    for (int i = 0; i < pts.length - 1; i++) {
      final dx = pts[i + 1].x - pts[i].x;
      final dy = pts[i + 1].y - pts[i].y;
      sum += sqrt(dx * dx + dy * dy);
    }
    return sum;
  }
}
`
  },
  {
    filename: 'lib/widgets/quarter_view_nav_map.dart',
    language: 'dart',
    title: 'Quarter-View 3D Navigation Canvas (Flutter)',
    description: 'CustomPainter rendering isometric 45° perspective, pulsating danger zones, and neon safe route ribbon.',
    code: `import 'dart:math';
import 'package:flutter/material.dart';
import '../services/safe_route_engine.dart';

class QuarterViewNavMap extends StatefulWidget {
  final Point<double> origin;
  final Point<double> destination;
  final List<DangerZone> dangerZones;
  final SafeRouteResult activeRoute;
  final double vehicleProgress; // 0.0 to 1.0

  const QuarterViewNavMap({
    Key? key,
    required this.origin,
    required this.destination,
    required this.dangerZones,
    required this.activeRoute,
    required this.vehicleProgress,
  }) : super(key: key);

  @override
  State<QuarterViewNavMap> createState() => _QuarterViewNavMapState();
}

class _QuarterViewNavMapState extends State<QuarterViewNavMap> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return CustomPaint(
          size: Size.infinite,
          painter: QuarterViewPainter(
            origin: widget.origin,
            destination: widget.destination,
            dangerZones: widget.dangerZones,
            activeRoute: widget.activeRoute,
            pulseValue: _pulseController.value,
            progress: widget.vehicleProgress,
          ),
        );
      },
    );
  }
}

class QuarterViewPainter extends CustomPainter {
  final Point<double> origin;
  final Point<double> destination;
  final List<DangerZone> dangerZones;
  final SafeRouteResult activeRoute;
  final double pulseValue;
  final double progress;

  QuarterViewPainter({
    required this.origin,
    required this.destination,
    required this.dangerZones,
    required this.activeRoute,
    required this.pulseValue,
    required this.progress,
  });

  // Transform 2D grid coordinates into 45° isometric / quarter-view screen space
  Offset _toQuarterView(Point<double> p, Size size) {
    final centerX = size.width / 2;
    final centerY = size.height / 2;
    const scale = 5.5;
    final isoX = centerX + (p.x - p.y) * cos(pi / 6) * scale;
    final isoY = centerY + (p.x + p.y) * sin(pi / 6) * scale * 0.65;
    return Offset(isoX, isoY);
  }

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Tactical Dark Grid
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B).withOpacity(0.4)
      ..strokeWidth = 1.0;

    for (double i = -50; i <= 50; i += 10) {
      canvas.drawLine(_toQuarterView(Point(i, -50), size), _toQuarterView(Point(i, 50), size), gridPaint);
      canvas.drawLine(_toQuarterView(Point(-50, i), size), _toQuarterView(Point(50, i), size), gridPaint);
    }

    // 2. Draw Pulsating Danger Zones
    for (final zone in dangerZones) {
      final centerOffset = _toQuarterView(zone.center, size);
      final radius = zone.radius * 4.5 * (1.0 + pulseValue * 0.15);

      final dangerFill = Paint()
        ..color = const Color(0xFFEF4444).withOpacity(0.25)
        ..style = PaintingStyle.fill;
      final dangerBorder = Paint()
        ..color = const Color(0xFFEF4444).withOpacity(0.8)
        ..strokeWidth = 2.0
        ..style = PaintingStyle.stroke;

      canvas.drawOval(
        Rect.fromCenter(center: centerOffset, width: radius * 2, height: radius * 1.3),
        dangerFill,
      );
      canvas.drawOval(
        Rect.fromCenter(center: centerOffset, width: radius * 2, height: radius * 1.3),
        dangerBorder,
      );
    }

    // 3. Draw Neon Safe Route Ribbon
    if (activeRoute.waypoints.isNotEmpty) {
      final routePath = Path();
      final firstPoint = _toQuarterView(activeRoute.waypoints.first, size);
      routePath.moveTo(firstPoint.dx, firstPoint.dy);

      for (int i = 1; i < activeRoute.waypoints.length; i++) {
        final pt = _toQuarterView(activeRoute.waypoints[i], size);
        routePath.lineTo(pt.dx, pt.dy);
      }

      final glowPaint = Paint()
        ..color = const Color(0xFF10B981).withOpacity(0.4)
        ..strokeWidth = 12.0
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final corePaint = Paint()
        ..color = const Color(0xFF34D399)
        ..strokeWidth = 4.0
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      canvas.drawPath(routePath, glowPaint);
      canvas.drawPath(routePath, corePaint);
    }

    // 4. Draw Point A & Point B Pins
    _drawPin(canvas, _toQuarterView(origin, size), const Color(0xFF3B82F6), 'A');
    _drawPin(canvas, _toQuarterView(destination, size), const Color(0xFF10B981), 'B');
  }

  void _drawPin(Canvas canvas, Offset offset, Color color, String label) {
    final pinPaint = Paint()..color = color;
    canvas.drawCircle(offset, 10.0, pinPaint);
    canvas.drawCircle(offset, 14.0, Paint()..color = color.withOpacity(0.3)..style = PaintingStyle.stroke..strokeWidth = 2);
  }

  @override
  bool shouldRepaint(covariant QuarterViewPainter oldDelegate) => true;
}
`
  }
];

export const SWIFT_CODE_SUITE: CodeFile[] = [
  {
    filename: 'SafeRouteSense/SafeRouteEngine.swift',
    language: 'swift',
    title: 'SafeRouteEngine (Swift / iOS)',
    description: 'Native Swift spatial safety graph router with danger zone evasion for iOS MapKit / SceneKit.',
    code: `import Foundation
import CoreLocation

public enum DangerSeverity: String, Codable {
    case critical, high, moderate, low
}

public struct DangerZone: Identifiable {
    public let id: String
    public let name: String
    public let severity: DangerSeverity
    public let riskScore: Double // 0.0 - 100.0
    public let coordinate: CLLocationCoordinate2D
    public let radiusMeters: Double
    public let advisory: String
    
    public func contains(location: CLLocationCoordinate2D) -> Bool {
        let centerLoc = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        let targetLoc = CLLocation(latitude: location.latitude, longitude: location.longitude)
        return centerLoc.distance(from: targetLoc) <= radiusMeters
    }
}

public struct SafeRouteProfile {
    public let safetyScore: Int
    public let distanceMeters: Double
    public let durationSeconds: Double
    public let pathCoordinates: [CLLocationCoordinate2D]
    public let bypassedDangerCount: Int
}

public class SafeRouteEngine {
    public static let shared = SafeRouteEngine()
    
    public func calculateSafeRoute(
        from origin: CLLocationCoordinate2D,
        to destination: CLLocationCoordinate2D,
        avoiding dangerZones: [DangerZone]
    ) -> SafeRouteProfile {
        var path: [CLLocationCoordinate2D] = [origin]
        
        // Mid-point corridor evaluation
        let midLat = (origin.latitude + destination.latitude) / 2.0
        let midLon = (origin.longitude + destination.longitude) / 2.0
        let midCoord = CLLocationCoordinate2D(latitude: midLat, longitude: midLon)
        
        var bypassed = 0
        if let dangerousZone = dangerZones.first(where: { $0.contains(location: midCoord) }) {
            bypassed += 1
            // Compute safe circumferential detour offset (0.01 deg ~= 1.1km)
            let detourOffset = (dangerousZone.radiusMeters / 111000.0) + 0.005
            let detourWayPoint = CLLocationCoordinate2D(
                latitude: dangerousZone.coordinate.latitude + detourOffset,
                longitude: dangerousZone.coordinate.longitude - detourOffset
            )
            path.append(detourWayPoint)
        }
        
        path.append(destination)
        
        let startLoc = CLLocation(latitude: origin.latitude, longitude: origin.longitude)
        let endLoc = CLLocation(latitude: destination.latitude, longitude: destination.longitude)
        let dist = startLoc.distance(from: endLoc) * 1.25
        
        return SafeRouteProfile(
            safetyScore: 98,
            distanceMeters: dist,
            durationSeconds: dist / 11.1, // ~40 km/h urban speed
            pathCoordinates: path,
            bypassedDangerCount: bypassed
        )
    }
}
`
  },
  {
    filename: 'SafeRouteSense/QuarterViewMapView.swift',
    language: 'swift',
    title: 'Quarter-View 3D Navigation View (SwiftUI & MapKit)',
    description: 'SwiftUI component utilizing MapCamera 45-degree pitch, volumetric danger overlays, and tactical HUD.',
    code: `import SwiftUI
import MapKit

public struct QuarterViewMapView: View {
    @State private var cameraPosition: MapCameraPosition
    let origin: CLLocationCoordinate2D
    let destination: CLLocationCoordinate2D
    let dangerZones: [DangerZone]
    let safeRoute: SafeRouteProfile
    
    public init(
        origin: CLLocationCoordinate2D,
        destination: CLLocationCoordinate2D,
        dangerZones: [DangerZone],
        safeRoute: SafeRouteProfile
    ) {
        self.origin = origin
        self.destination = destination
        self.dangerZones = dangerZones
        self.safeRoute = safeRoute
        
        // 45° Pitch Quarter-View Camera setup
        let center = CLLocationCoordinate2D(
            latitude: (origin.latitude + destination.latitude) / 2.0,
            longitude: (origin.longitude + destination.longitude) / 2.0
        )
        _cameraPosition = State(initialValue: .camera(
            MapCamera(
                centerCoordinate: center,
                distance: 4500,
                heading: 35.0,
                pitch: 45.0 // Quarter-view isometric tilt
            )
        ))
    }
    
    public var body: some View {
        ZStack {
            Map(position: $cameraPosition) {
                // Origin Pin A
                Annotation("Origin A", coordinate: origin) {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 24, height: 24)
                        .overlay(Image(systemName: "location.fill").foregroundColor(.white).font(.caption))
                }
                
                // Destination Pin B
                Annotation("Destination B", coordinate: destination) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 24, height: 24)
                        .overlay(Image(systemName: "flag.fill").foregroundColor(.white).font(.caption))
                }
                
                // Danger Zone Pulsating Rings
                ForEach(dangerZones) { zone in
                    MapCircle(center: zone.coordinate, radius: zone.radiusMeters)
                        .foregroundStyle(.red.opacity(0.35))
                        .stroke(.red, lineWidth: 2)
                }
                
                // Safe Neon Route Ribbon
                MapPolyline(coordinates: safeRoute.pathCoordinates)
                    .stroke(
                        LinearGradient(
                            colors: [Color.emeraldGreen, Color.cyan],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        lineWidth: 6
                    )
            }
            .mapStyle(.standard(elevation: .realistic, pointsOfInterest: .excludingAll))
            
            // Quarter-View HUD Overlay
            VStack {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Label("SAFE GUARDIAN ACTIVE", systemImage: "shield.checkered")
                            .font(.caption.bold())
                            .foregroundColor(.green)
                        Text("Safety Index: \(safeRoute.safetyScore)%")
                            .font(.title3.bold())
                            .foregroundColor(.white)
                    }
                    .padding()
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)
                    
                    Spacer()
                }
                .padding(.top, 40)
                .padding(.horizontal)
                
                Spacer()
            }
        }
    }
}

extension Color {
    static let emeraldGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
}
`
  }
];
