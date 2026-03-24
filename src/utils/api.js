const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  console.log(path)
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  console.log(res);
  return res.json();
}

export const api = {
  // Cars
  getCars:        ()      => request('/'),
  searchCars:     (name)  => request(`/name/${encodeURIComponent(name)}`),
  getCarByName:   (name)  => request(`/name/${encodeURIComponent(name)}`).then(r => r[0] ?? null),
  getCarsByBrand: (brand) => request(`/brand/${encodeURIComponent(brand)}`),
  deleteCar:      (id)    => request(`/car/${id}`, { method: 'DELETE' }),

  // Brands
  getBrands:      ()      => request('/getbrands'),
  deleteBrand:    (id)    => request(`/brand/${id}`, { method: 'DELETE' }),

  // About
  getAbout:       ()      => request('/about_us'),
};
