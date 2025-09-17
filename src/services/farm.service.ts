import { api, PaginationParams } from '../lib/api-client';

interface Farm {
  id: string;
  owner: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  size: {
    value: number;
    unit: string;
  };
  crops: Array<{
    id: string;
    name: string;
    variety: string;
    plantedArea: number;
    plantingDate: Date;
    expectedHarvestDate: Date;
    status: string;
  }>;
  soilData?: {
    type: string;
    ph: number;
    organicMatter: number;
    lastTestedDate: Date;
  };
  irrigation?: {
    type: string;
    source: string;
    schedule: string;
  };
  active: boolean;
}

interface CreateFarmParams {
  name: string;
  location: {
    coordinates: [number, number];
  };
  size: {
    value: number;
    unit: 'hectares' | 'acres';
  };
}

export const farmService = {
  getAll: (params?: PaginationParams & { active?: boolean }) =>
    api.get<{ data: Farm[]; pagination: any }>('/farms', {
      params: new URLSearchParams(params as any),
    }),

  getById: (id: string) =>
    api.get<Farm>(`/farms/${id}`),

  create: (data: CreateFarmParams) =>
    api.post<Farm>('/farms', data),

  update: (id: string, data: Partial<Farm>) =>
    api.put<Farm>(`/farms/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/farms/${id}`),

  getNearby: (longitude: number, latitude: number, maxDistance: number = 10000) =>
    api.get<Farm[]>('/farms/nearby', {
      params: new URLSearchParams({
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        maxDistance: maxDistance.toString(),
      }),
    }),

  getByOwner: (ownerId: string, params?: PaginationParams) =>
    api.get<{ data: Farm[]; pagination: any }>(`/farms/owner/${ownerId}`, {
      params: new URLSearchParams(params as any),
    }),

  // Crop management
  addCrop: (farmId: string, cropData: Omit<Farm['crops'][0], 'id'>) =>
    api.post<Farm>(`/farms/${farmId}/crops`, cropData),

  updateCrop: (farmId: string, cropId: string, cropData: Partial<Farm['crops'][0]>) =>
    api.put<Farm>(`/farms/${farmId}/crops/${cropId}`, cropData),

  deleteCrop: (farmId: string, cropId: string) =>
    api.delete<Farm>(`/farms/${farmId}/crops/${cropId}`),

  // Soil data management
  updateSoilData: (farmId: string, soilData: Farm['soilData']) =>
    api.put<Farm>(`/farms/${farmId}/soil-data`, soilData),
};