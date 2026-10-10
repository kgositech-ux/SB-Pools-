import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Booking, TechnicianTask, PoolProfile, BookingStatus, TaskStatus, ChemicalReadings, TaskChecklist } from '../types';

// ======================== BOOKINGS & QUOTATIONS ========================

export function subscribeToBookings(
  onData: (bookings: Booking[]) => void,
  filter?: { customerId?: string; technicianId?: string; role?: string }
) {
  const path = 'bookings';
  if (!auth.currentUser) {
    onData([]);
    return () => {};
  }

  try {
    const collRef = collection(db, path);
    let q;

    if (filter?.role === 'admin') {
      q = query(collRef, orderBy('createdAt', 'desc'));
    } else if (filter?.role === 'technician') {
      const techId = filter.technicianId || auth.currentUser.uid;
      q = query(collRef, where('assignedTechnicianId', '==', techId), orderBy('createdAt', 'desc'));
    } else {
      const custId = filter?.customerId || auth.currentUser.uid;
      q = query(collRef, where('customerId', '==', custId), orderBy('createdAt', 'desc'));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Booking[];
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `bookings/${id}`;
  const now = new Date().toISOString();
  const newBooking: Booking = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'bookings', id), newBooking);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  notes?: string
): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updatePayload.notes = notes;
    }
    await updateDoc(doc(db, 'bookings', bookingId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function assignTechnicianToBooking(
  bookingId: string,
  technicianId: string,
  technicianName: string
): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      assignedTechnicianId: technicianId,
      assignedTechnicianName: technicianName,
      status: 'confirmed',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ======================== TASKS ========================

export function subscribeToTasks(
  onData: (tasks: TechnicianTask[]) => void,
  filter?: { technicianId?: string; customerId?: string; role?: string }
) {
  const path = 'tasks';
  if (!auth.currentUser) {
    onData([]);
    return () => {};
  }

  try {
    const collRef = collection(db, path);
    let q;

    if (filter?.role === 'admin') {
      q = query(collRef, orderBy('scheduledDate', 'desc'));
    } else if (filter?.role === 'technician') {
      const techId = filter.technicianId || auth.currentUser.uid;
      q = query(collRef, where('technicianId', '==', techId), orderBy('scheduledDate', 'desc'));
    } else {
      const custId = filter?.customerId || auth.currentUser.uid;
      q = query(collRef, where('customerId', '==', custId), orderBy('scheduledDate', 'desc'));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as TechnicianTask[];
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createTechnicianTask(data: Omit<TechnicianTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `tasks/${id}`;
  const now = new Date().toISOString();
  const newTask: TechnicianTask = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'tasks', id), newTask);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTechnicianTask(
  taskId: string,
  payload: {
    status?: TaskStatus;
    checklist?: Partial<TaskChecklist>;
    chemicalReadings?: ChemicalReadings;
    photoUrls?: string[];
    notes?: string;
  }
): Promise<void> {
  const path = `tasks/${taskId}`;
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      updatedAt: now,
    };
    if (payload.status) updateData.status = payload.status;
    if (payload.checklist) updateData.checklist = payload.checklist;
    if (payload.chemicalReadings) updateData.chemicalReadings = payload.chemicalReadings;
    if (payload.photoUrls !== undefined) updateData.photoUrls = payload.photoUrls;
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (payload.status === 'completed') updateData.completedAt = now;

    await updateDoc(doc(db, 'tasks', taskId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ======================== POOLS ========================

export function subscribeToPools(
  onData: (pools: PoolProfile[]) => void,
  filter?: { customerId?: string; role?: string }
) {
  const path = 'pools';
  if (!auth.currentUser) {
    onData([]);
    return () => {};
  }

  try {
    const collRef = collection(db, path);
    let q;

    if (filter?.role === 'admin') {
      q = query(collRef, orderBy('createdAt', 'desc'));
    } else {
      const custId = filter?.customerId || auth.currentUser.uid;
      q = query(collRef, where('customerId', '==', custId), orderBy('createdAt', 'desc'));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as PoolProfile[];
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createPoolProfile(data: Omit<PoolProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `pool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `pools/${id}`;
  const now = new Date().toISOString();
  const newPool: PoolProfile = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'pools', id), newPool);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ======================== SEEDING SELLO POOLS DATA ========================

export async function seedSampleData(currentUserId: string, currentUserName: string) {
  try {
    const now = new Date();
    const formatDate = (daysOffset: number) => {
      const d = new Date(now.getTime() + daysOffset * 86400000);
      return d.toISOString().split('T')[0];
    };

    // 1. Seed Sample Sello Pools
    const pools: PoolProfile[] = [
      {
        id: `pool_sello_1`,
        customerId: currentUserId,
        customerName: currentUserName || 'Sello Pools Client',
        poolName: 'Centurion 6m x 3m Fibreglass Pool',
        address: '142 Wierda Rd, Centurion, Pretoria',
        poolType: 'fibreglass',
        volumeGallons: 24000,
        filtrationType: '2-Bag Sand Filter with Silica Media',
        sanitizerType: '0.75kW Speck Porpoise Pump & Auto Chlorinator',
        dimensions: '6m x 3m x 1.5m deep',
        notes: 'Pump and sand filter included. Installed with brick paved coping and electrical timer box.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `pool_sello_2`,
        customerId: currentUserId,
        customerName: currentUserName || 'Sello Pools Client',
        poolName: 'Garsfontein Relined Pool & Spa',
        address: '88 Jacqueline Dr, Garsfontein, Pretoria East',
        poolType: 'fibreglass',
        volumeGallons: 38000,
        filtrationType: 'Speck 3-Bag Sand Filter',
        sanitizerType: 'Speck 0.75kW Pump with Quality Salt Chlorinator',
        dimensions: '8m x 4m',
        notes: 'Complete fibreglass relining and blue mosaic border completed by Sello Pools team.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const p of pools) {
      await setDoc(doc(db, 'pools', p.id), p);
    }

    // 2. Seed Sample Bookings & Quotation Requests
    const sampleBookings: Booking[] = [
      {
        id: `book_sello_1`,
        customerId: currentUserId,
        customerName: currentUserName || 'Dr. Johan van der Merwe',
        customerEmail: 'johan@pretoria.test',
        customerPhone: '082 555 4912',
        address: '142 Wierda Rd, Centurion',
        suburb: 'Centurion',
        poolId: 'pool_sello_1',
        poolType: 'fibreglass',
        serviceType: 'new_fibreglass_pool',
        scheduledDate: formatDate(2),
        timeSlot: '08:30 AM - 12:00 PM',
        status: 'confirmed',
        assignedTechnicianId: 'tech_sello_lead',
        assignedTechnicianName: 'Sello Mathebula (Head Contractor)',
        notes: 'Site excavation completed. Shell delivery & pump and sand filter installation scheduled.',
        price: 85000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `book_sello_2`,
        customerId: currentUserId,
        customerName: currentUserName || 'Thabo Molefe',
        customerEmail: 'thabo@gmail.test',
        customerPhone: '071 998 2341',
        address: '88 Jacqueline Dr, Garsfontein, Pretoria East',
        suburb: 'Pretoria East',
        poolId: 'pool_sello_2',
        poolType: 'fibreglass',
        serviceType: 'pool_renovation',
        scheduledDate: formatDate(0), // Today
        timeSlot: '10:00 AM - 01:00 PM',
        status: 'in_progress',
        assignedTechnicianId: 'tech_sipho',
        assignedTechnicianName: 'Sipho Ndlovu (Renovations Specialist)',
        notes: 'Fibreglass relining top-coat curing. Applying new ceramic mosaic tile band.',
        price: 32000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `book_sello_3`,
        customerId: currentUserId,
        customerName: currentUserName || 'Annette Pretorius',
        customerEmail: 'annette@vodamail.test',
        customerPhone: '083 412 9003',
        address: '215 Rubida St, Murrayfield, Pretoria',
        suburb: 'Pretoria East',
        poolType: 'fibreglass',
        serviceType: 'pump_filter_replacement',
        scheduledDate: formatDate(4),
        timeSlot: '01:30 PM - 03:30 PM',
        status: 'pending',
        assignedTechnicianId: 'tech_sipho',
        assignedTechnicianName: 'Sipho Ndlovu (Renovations Specialist)',
        notes: 'Quote requested for replacing old noisy pump with new 0.75kW Speck pump and 2-bag sand filter.',
        price: 8900,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `book_sello_4`,
        customerId: currentUserId,
        customerName: currentUserName || 'Pieter Botha',
        customerEmail: 'pieter@mweb.test',
        customerPhone: '076 112 8844',
        address: '55 Rigel Ave, Waterkloof Ridge',
        suburb: 'Waterkloof',
        poolType: 'fibreglass',
        serviceType: 'routine_maintenance',
        scheduledDate: formatDate(-4),
        timeSlot: '09:00 AM - 11:00 AM',
        status: 'completed',
        assignedTechnicianId: 'tech_sello_lead',
        assignedTechnicianName: 'Sello Mathebula (Head Contractor)',
        notes: 'Full sand filter backwash, replacement of sand filter valve O-ring, and chemical balancing.',
        price: 1850,
        createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
    ];

    for (const b of sampleBookings) {
      await setDoc(doc(db, 'bookings', b.id), b);
    }

    // 3. Seed Sample Tasks
    const sampleTasks: TechnicianTask[] = [
      {
        id: `task_sello_1`,
        bookingId: 'book_sello_2',
        technicianId: 'tech_sipho',
        technicianName: 'Sipho Ndlovu (Renovations Specialist)',
        customerId: currentUserId,
        customerName: currentUserName || 'Thabo Molefe',
        address: '88 Jacqueline Dr, Garsfontein, Pretoria East',
        serviceType: 'pool_renovation',
        scheduledDate: formatDate(0),
        status: 'in_progress',
        checklist: {
          skimmerBaskets: true,
          pumpBasket: true,
          surfaceSkimmed: true,
          tileLineBrushed: true,
          poolVacuumed: false,
          filterBackwashed: true,
          equipmentInspected: true,
          chemicalsAdded: false,
        },
        chemicalReadings: {
          ph: 7.4,
          freeChlorine: 2.8,
          totalAlkalinity: 100,
          calciumHardness: 250,
          cyanuricAcid: 40,
          saltPpm: 3100,
          waterTemperatureF: 77,
          clarity: 'crystal_clear',
        },
        notes: 'Relined surface smoothed and sealed. Filter sand flushed. Speck pump running smoothly at low decibels.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `task_sello_2`,
        bookingId: 'book_sello_4',
        technicianId: 'tech_sello_lead',
        technicianName: 'Sello Mathebula (Head Contractor)',
        customerId: currentUserId,
        customerName: currentUserName || 'Pieter Botha',
        address: '55 Rigel Ave, Waterkloof Ridge',
        serviceType: 'routine_maintenance',
        scheduledDate: formatDate(-4),
        status: 'completed',
        checklist: {
          skimmerBaskets: true,
          pumpBasket: true,
          surfaceSkimmed: true,
          tileLineBrushed: true,
          poolVacuumed: true,
          filterBackwashed: true,
          equipmentInspected: true,
          chemicalsAdded: true,
        },
        chemicalReadings: {
          ph: 7.3,
          freeChlorine: 2.2,
          totalAlkalinity: 95,
          calciumHardness: 270,
          cyanuricAcid: 45,
          saltPpm: 3200,
          waterTemperatureF: 75,
          clarity: 'crystal_clear',
        },
        notes: 'Routine service completed. Multiport valve lubricated. Pump and sand filter operating at optimal flow rate.',
        completedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
    ];

    for (const t of sampleTasks) {
      await setDoc(doc(db, 'tasks', t.id), t);
    }

    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}
