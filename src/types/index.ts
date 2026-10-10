export type UserRole = 'admin' | 'technician' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  suburb?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PoolType = 
  | 'fibreglass' 
  | 'gunite_concrete' 
  | 'saltwater' 
  | 'in_ground_chlorine' 
  | 'above_ground' 
  | 'commercial';

export interface PoolProfile {
  id: string;
  customerId: string;
  customerName: string;
  poolName: string;
  address: string;
  poolType: PoolType;
  volumeGallons: number;
  filtrationType?: string;
  sanitizerType?: string;
  dimensions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = 
  | 'new_fibreglass_pool'
  | 'pool_renovation'
  | 'pump_filter_replacement'
  | 'routine_maintenance'
  | 'weekly_cleaning'
  | 'chemical_balance'
  | 'filter_deep_clean'
  | 'equipment_inspection'
  | 'pool_opening_closing'
  | 'green_to_clean';

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address: string;
  suburb?: string;
  poolId?: string;
  poolType?: string;
  poolDimensions?: string;
  serviceType: ServiceType;
  scheduledDate: string;
  timeSlot?: string;
  status: BookingStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  notes?: string;
  price?: number;
  quoteAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChemicalReadings {
  ph?: number; // Ideal: 7.2 - 7.6
  freeChlorine?: number; // Ideal: 1.0 - 3.0 ppm
  totalAlkalinity?: number; // Ideal: 80 - 120 ppm
  calciumHardness?: number; // Ideal: 200 - 400 ppm
  cyanuricAcid?: number; // Ideal: 30 - 50 ppm
  saltPpm?: number; // Ideal: 2700 - 3400 ppm
  waterTemperatureF?: number;
  clarity?: 'crystal_clear' | 'slightly_cloudy' | 'cloudy' | 'green_algae';
}

export interface TaskChecklist {
  skimmerBaskets: boolean;
  pumpBasket: boolean;
  surfaceSkimmed: boolean;
  tileLineBrushed: boolean;
  poolVacuumed: boolean;
  filterBackwashed: boolean;
  equipmentInspected: boolean;
  chemicalsAdded: boolean;
}

export type TaskStatus = 'scheduled' | 'in_progress' | 'completed';

export interface TechnicianTask {
  id: string;
  bookingId: string;
  technicianId: string;
  technicianName: string;
  customerId: string;
  customerName: string;
  address: string;
  serviceType: string;
  scheduledDate: string;
  status: TaskStatus;
  checklist?: Partial<TaskChecklist>;
  chemicalReadings?: ChemicalReadings;
  photoUrls?: string[];
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
