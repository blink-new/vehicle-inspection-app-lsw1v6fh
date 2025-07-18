import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface InspectionData {
  id: string;
  vehicleInfo: {
    vin: string;
    make: string;
    model: string;
    year: string;
    color: string;
    mileage: string;
    licensePlate: string;
  };
  inspectorInfo: {
    name: string;
    id: string;
    company: string;
  };
  inspectionItems: {
    [key: string]: {
      status: 'pass' | 'warning' | 'fail';
      notes?: string;
      photos?: string[];
      defects?: Array<{
        description: string;
        severity: 'critical' | 'major' | 'minor';
        location: string;
      }>;
    };
  };
  overallStatus: 'pass' | 'warning' | 'fail';
  completedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  signature?: string;
  progress: number;
  totalDefects: number;
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
}

export interface InspectorProfile {
  name: string;
  id: string;
  company: string;
  email: string;
  phone: string;
  certifications: string[];
}

class StorageService {
  private static instance: StorageService;
  private readonly INSPECTIONS_KEY = 'vehicle_inspections';
  private readonly INSPECTOR_PROFILE_KEY = 'inspector_profile';
  private readonly SETTINGS_KEY = 'app_settings';
  private readonly PHOTOS_DIR = `${FileSystem.documentDirectory}inspection_photos/`;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Initialize storage directories
  async initialize(): Promise<void> {
    try {
      const photosDir = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
      if (!photosDir.exists) {
        await FileSystem.makeDirectoryAsync(this.PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  // Inspection Data Management
  async saveInspection(inspection: InspectionData): Promise<void> {
    try {
      const existingInspections = await this.getAllInspections();
      const updatedInspections = existingInspections.filter(i => i.id !== inspection.id);
      updatedInspections.unshift(inspection);
      
      await AsyncStorage.setItem(this.INSPECTIONS_KEY, JSON.stringify(updatedInspections));
    } catch (error) {
      console.error('Failed to save inspection:', error);
      throw new Error('Failed to save inspection data');
    }
  }

  async getAllInspections(): Promise<InspectionData[]> {
    try {
      const data = await AsyncStorage.getItem(this.INSPECTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load inspections:', error);
      return [];
    }
  }

  async getInspectionById(id: string): Promise<InspectionData | null> {
    try {
      const inspections = await this.getAllInspections();
      return inspections.find(i => i.id === id) || null;
    } catch (error) {
      console.error('Failed to load inspection:', error);
      return null;
    }
  }

  async deleteInspection(id: string): Promise<void> {
    try {
      const inspections = await this.getAllInspections();
      const updatedInspections = inspections.filter(i => i.id !== id);
      await AsyncStorage.setItem(this.INSPECTIONS_KEY, JSON.stringify(updatedInspections));
      
      // Also delete associated photos
      await this.deleteInspectionPhotos(id);
    } catch (error) {
      console.error('Failed to delete inspection:', error);
      throw new Error('Failed to delete inspection');
    }
  }

  // Photo Management
  async savePhoto(inspectionId: string, photoUri: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${inspectionId}_${timestamp}.jpg`;
      const newPath = `${this.PHOTOS_DIR}${fileName}`;
      
      await FileSystem.copyAsync({
        from: photoUri,
        to: newPath,
      });
      
      return newPath;
    } catch (error) {
      console.error('Failed to save photo:', error);
      throw new Error('Failed to save photo');
    }
  }

  async deleteInspectionPhotos(inspectionId: string): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.PHOTOS_DIR);
      const inspectionPhotos = files.filter(file => file.startsWith(inspectionId));
      
      for (const photo of inspectionPhotos) {
        await FileSystem.deleteAsync(`${this.PHOTOS_DIR}${photo}`, { idempotent: true });
      }
    } catch (error) {
      console.error('Failed to delete photos:', error);
    }
  }

  // Inspector Profile Management
  async saveInspectorProfile(profile: InspectorProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.INSPECTOR_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save inspector profile:', error);
      throw new Error('Failed to save inspector profile');
    }
  }

  async getInspectorProfile(): Promise<InspectorProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.INSPECTOR_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load inspector profile:', error);
      return null;
    }
  }

  // Settings Management
  async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        notifications: true,
        autoSave: true,
        offlineMode: true,
        photoQuality: 'high',
        autoBackup: false,
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }

  // Data Export/Import
  async exportAllData(): Promise<string> {
    try {
      const inspections = await this.getAllInspections();
      const profile = await this.getInspectorProfile();
      const settings = await this.getSettings();
      
      const exportData = {
        inspections,
        profile,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      
      const fileName = `vehicle_inspection_backup_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
      return filePath;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  // Search and Filter
  async searchInspections(query: string): Promise<InspectionData[]> {
    try {
      const inspections = await this.getAllInspections();
      const lowercaseQuery = query.toLowerCase();
      
      return inspections.filter(inspection => 
        inspection.vehicleInfo.vin.toLowerCase().includes(lowercaseQuery) ||
        inspection.vehicleInfo.make.toLowerCase().includes(lowercaseQuery) ||
        inspection.vehicleInfo.model.toLowerCase().includes(lowercaseQuery) ||
        inspection.vehicleInfo.licensePlate.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Failed to search inspections:', error);
      return [];
    }
  }

  async filterInspections(filters: {
    status?: 'pass' | 'warning' | 'fail';
    dateFrom?: string;
    dateTo?: string;
    make?: string;
  }): Promise<InspectionData[]> {
    try {
      const inspections = await this.getAllInspections();
      
      return inspections.filter(inspection => {
        if (filters.status && inspection.overallStatus !== filters.status) return false;
        if (filters.make && inspection.vehicleInfo.make !== filters.make) return false;
        if (filters.dateFrom && inspection.completedAt < filters.dateFrom) return false;
        if (filters.dateTo && inspection.completedAt > filters.dateTo) return false;
        return true;
      });
    } catch (error) {
      console.error('Failed to filter inspections:', error);
      return [];
    }
  }

  // Storage Statistics
  async getStorageStats(): Promise<{
    totalInspections: number;
    totalPhotos: number;
    storageUsed: string;
  }> {
    try {
      const inspections = await this.getAllInspections();
      const photosDir = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
      const files = photosDir.exists ? await FileSystem.readDirectoryAsync(this.PHOTOS_DIR) : [];
      
      return {
        totalInspections: inspections.length,
        totalPhotos: files.length,
        storageUsed: photosDir.exists ? `${(photosDir.size || 0 / 1024 / 1024).toFixed(2)} MB` : '0 MB',
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalInspections: 0, totalPhotos: 0, storageUsed: '0 MB' };
    }
  }
}

export default StorageService;