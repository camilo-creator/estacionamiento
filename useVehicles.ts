import { useState, useCallback } from 'react';
import { db, normPlate } from '@/lib/firebase';
import type { Vehicle } from '@/types';

export function useVehicles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVehicle = useCallback(async (plate: string): Promise<Vehicle | null> => {
    if (!db) return null;
    
    const p = normPlate(plate);
    if (!p) return null;
    
    try {
      const doc = await db.collection("vehicles").doc(p).get();
      if (!doc.exists) return null;
      return { plate: p, ...doc.data() } as Vehicle;
    } catch (err) {
      console.error('Error getting vehicle:', err);
      return null;
    }
  }, []);

  const searchVehicle = useCallback(async (plate: string): Promise<Vehicle | null> => {
    setLoading(true);
    setError(null);
    try {
      const vehicle = await getVehicle(plate);
      return vehicle;
    } catch (err) {
      setError('Error al buscar el vehículo');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getVehicle]);

  const registerVehicle = useCallback(async (vehicle: Vehicle): Promise<boolean> => {
    if (!db) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const plate = normPlate(vehicle.plate);
      await db.collection("vehicles").doc(plate).set({
        name: vehicle.name,
        phone: vehicle.phone,
        unit: vehicle.unit,
        email: vehicle.email || '',
        rut: vehicle.rut || ''
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al registrar vehículo');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getVehicle,
    searchVehicle,
    registerVehicle
  };
}
