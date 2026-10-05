export interface BusStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  zone: string;
  facilities: string[];
}

export interface RouteStopInfo {
  stopId: string;
  distanceFromStartKm: number;
  scheduledTimeOffsetMin: number;
}

export interface TransitRoute {
  id: string;
  routeNumber: string;
  name: string;
  source: string;
  destination: string;
  color: string;
  type: 'Electric AC' | 'Ordinary Govt' | 'Express AC' | 'Metro Feeder' | 'Airport Shuttle';
  fareBase: number;
  stops: RouteStopInfo[];
  pathWaypoints: [number, number][]; // High resolution path
}

export interface LiveBus {
  id: string;
  vehicleNumber: string;
  routeId: string;
  routeNumber: string;
  depot: string;
  busType: 'Electric AC' | 'Ordinary Govt' | 'Express AC' | 'Metro Feeder' | 'Airport Shuttle';
  lat: number;
  lng: number;
  bearing: number; // 0-360 degrees
  speedKmh: number;
  currentStopIndex: number;
  nextStopId: string;
  progressBetweenStops: number; // 0 to 1
  occupancy: 'low' | 'medium' | 'high' | 'full'; // seats available, standing, crowded
  passengerCount: number;
  capacity: number;
  wheelchairAccessible: boolean;
  status: 'on-time' | 'delayed' | 'early';
  delayMinutes: number;
  lastGpsPing: number; // timestamp
  trafficLevel: 'smooth' | 'moderate' | 'congested';
  driverName: string;
  driverRating: number;
  isEv: boolean;
  batteryOrFuelPercent: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracyMeters: number;
  addressName?: string;
  isCustom?: boolean;
}

export interface StopArrivalInfo {
  busId: string;
  routeNumber: string;
  routeType: string;
  vehicleNumber: string;
  destination: string;
  etaSeconds: number;
  distanceKm: number;
  occupancy: 'low' | 'medium' | 'high' | 'full';
  status: 'on-time' | 'delayed' | 'early';
  delayMinutes: number;
  isEv: boolean;
}

export interface ServiceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert';
  affectedRouteIds: string[];
  effectiveUntil: string;
  category: 'Detour' | 'Weather' | 'Special Service' | 'Maintenance';
}

export interface TripPlanOption {
  id: string;
  route: TransitRoute;
  fromStop: BusStop;
  toStop: BusStop;
  totalDistanceKm: number;
  estimatedDurationMin: number;
  fare: number;
  liveBus: LiveBus | null;
  etaMinutesToBoard: number;
  stopsCount: number;
  stopsList: BusStop[];
}

export interface DigitalTicket {
  ticketId: string;
  passengerName: string;
  routeNumber: string;
  fromStopName: string;
  toStopName: string;
  ticketType: 'Adult Single' | 'Student Concession' | 'Daily Pass' | 'Senior Citizen';
  fare: number;
  bookingTime: string;
  validUntil: string;
  qrPayload: string;
  busType: string;
}

export interface StopTimetable {
  routeNumber: string;
  destination: string;
  firstBus: string;
  lastBus: string;
  peakFrequencyMins: number;
  offPeakFrequencyMins: number;
  operatingDays: string;
}

