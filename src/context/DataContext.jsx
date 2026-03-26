import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [cars,          setCars]          = useState(null);
  const [brands,        setBrands]        = useState(null);
  const [carsLoading,   setCarsLoading]   = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [carsError,     setCarsError]     = useState(null);
  const [brandsError,   setBrandsError]   = useState(null);

//adding a timestamp
const [carsLoadedAt, setCarsLoadedAt] = useState(null);
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  // Fetch once — if already cached, skip
  const fetchCars = useCallback(async (force = false) => {
    const isStale = !carsLoadedAt || Date.now() - carsLoadedAt > CACHE_TTL;
    if (cars && !force && !isStale) return cars;
    setCarsLoading(true);
    setCarsError(null);
    try {
      const data = await api.getCars();
      setCars(data);
      setCarsLoadedAt(Date.now());
      return data;
    } catch (err) {
      setCarsError(err.message);
    } finally {
      setCarsLoading(false);
    }
  }, [cars,carsLoadedAt]);

  const fetchBrands = useCallback(async (force = false) => {
    if (brands && !force) return brands;
    setBrandsLoading(true);
    setBrandsError(null);
    try {
      const data = await api.getBrands();
      setBrands(data);
      return data;
    } catch (err) {
      setBrandsError(err.message);
    } finally {
      setBrandsLoading(false);
    }
  }, [brands]);

  // Call this to manually invalidate cache (e.g. after adding a car)
  const invalidateCars   = () => setCars(null);
  const invalidateBrands = () => setBrands(null);

  return (
    <DataContext.Provider value={{
      cars,   carsLoading,   carsError,   fetchCars,   invalidateCars,
      brands, brandsLoading, brandsError, fetchBrands, invalidateBrands,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
