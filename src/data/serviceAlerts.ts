import { ServiceAlert, StopTimetable } from '../types/transit';

export const GOVERNMENT_SERVICE_ALERTS: ServiceAlert[] = [
  {
    id: 'alert-1',
    title: 'Route 502-EXP: Morning VIP Corridor Clearance',
    description: 'Minor 4-minute slow down near India Gate Circle due to ceremonial convoy clearance. GPS fleet actively adjusting headways.',
    severity: 'info',
    affectedRouteIds: ['route-502', 'route-108'],
    effectiveUntil: '11:30 AM Today',
    category: 'Detour',
  },
  {
    id: 'alert-2',
    title: 'Summer Heat Relief: 100% Electric AC Fleet Deployed',
    description: 'All 720-AC and 502-EXP buses are running continuous climate-controlled air conditioning. Free chilled drinking water available at Central Secretariat Gate 3.',
    severity: 'info',
    affectedRouteIds: ['route-720', 'route-502'],
    effectiveUntil: 'End of Week',
    category: 'Special Service',
  },
  {
    id: 'alert-3',
    title: 'Airport Line AIR-9: Express Dedicated Bus Lane Enforced',
    description: 'Traffic Police has cleared the dedicated transit right-of-way on Dhaula Kuan corridor. Airport buses arriving 2 minutes ahead of schedule.',
    severity: 'info',
    affectedRouteIds: ['route-airport'],
    effectiveUntil: 'Permanent Notice',
    category: 'Special Service',
  },
  {
    id: 'alert-4',
    title: 'Track Maintenance near South Extension Ring Road',
    description: 'Southbound lane reduced to single file near Lajpat Nagar junction. Expect 3 to 5 minutes moderate transit delay between 05:00 PM and 08:00 PM.',
    severity: 'warning',
    affectedRouteIds: ['route-ring', 'route-502'],
    effectiveUntil: 'Tomorrow 08:00 PM',
    category: 'Maintenance',
  }
];

export const ROUTE_TIMETABLES: Record<string, StopTimetable> = {
  '502-EXP': {
    routeNumber: '502-EXP',
    destination: 'Cyber IT Tech Park',
    firstBus: '05:30 AM',
    lastBus: '11:45 PM',
    peakFrequencyMins: 5,
    offPeakFrequencyMins: 10,
    operatingDays: 'All 7 Days (Mon - Sun)',
  },
  '720-AC': {
    routeNumber: '720-AC',
    destination: 'Cyber IT Tech Park Direct',
    firstBus: '05:45 AM',
    lastBus: '11:15 PM',
    peakFrequencyMins: 6,
    offPeakFrequencyMins: 12,
    operatingDays: 'All 7 Days (Mon - Sun)',
  },
  '108-ORD': {
    routeNumber: '108-ORD',
    destination: 'India Gate Loop',
    firstBus: '05:00 AM',
    lastBus: '11:30 PM',
    peakFrequencyMins: 4,
    offPeakFrequencyMins: 8,
    operatingDays: 'All 7 Days (Mon - Sun)',
  },
  'AIR-9': {
    routeNumber: 'AIR-9',
    destination: 'Intl Airport Terminal 3',
    firstBus: '24 Hours (Round-the-clock)',
    lastBus: '24 Hours (Round-the-clock)',
    peakFrequencyMins: 15,
    offPeakFrequencyMins: 20,
    operatingDays: '24/7 Continuous Service',
  },
  'RING-33': {
    routeNumber: 'RING-33',
    destination: 'Outer Ring Corridor Feeder',
    firstBus: '06:00 AM',
    lastBus: '10:30 PM',
    peakFrequencyMins: 8,
    offPeakFrequencyMins: 15,
    operatingDays: 'All 7 Days (Mon - Sun)',
  }
};
