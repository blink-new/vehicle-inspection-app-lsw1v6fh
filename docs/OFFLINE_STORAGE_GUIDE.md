# Offline Data Storage Implementation Guide

## Overview

This guide explains how offline data storage is implemented in the Vehicle Inspection Pro app using React Native's AsyncStorage and Expo FileSystem. The implementation provides robust offline capabilities with automatic data persistence, photo storage, and seamless synchronization.

## Architecture

### Storage Service (`services/StorageService.ts`)

The `StorageService` is a singleton class that handles all offline data operations:

- **Inspection Data**: Stores complete inspection records with metadata
- **Photo Management**: Saves photos to device storage with proper organization
- **Inspector Profiles**: Manages inspector information and settings
- **Search & Filter**: Provides efficient data querying capabilities
- **Data Export**: Enables backup and data portability

### Key Features

#### 1. **Automatic Data Persistence**
```typescript
// Auto-save after any data change
const updateItemStatus = (itemId: string, status: 'pass' | 'fail' | 'warning') => {
  setInspectionData(prev => 
    prev.map(item => 
      item.id === itemId ? { ...item, status } : item
    )
  );
  
  // Auto-save with debounce
  setTimeout(() => saveInspectionData(), 1000);
};
```

#### 2. **Photo Storage Management**
```typescript
// Photos are saved to permanent device storage
const savedPhotoPath = await storageService.savePhoto(inspectionId, photoUri);

// Photos are organized by inspection ID
// Path: /DocumentDirectory/inspection_photos/{inspectionId}_{timestamp}.jpg
```

#### 3. **Data Structure**
```typescript
interface InspectionData {
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
    [itemName: string]: {
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
  progress: number;
  totalDefects: number;
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
}
```

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install @react-native-async-storage/async-storage expo-file-system
```

### Step 2: Initialize Storage Service

```typescript
// In your main component
useEffect(() => {
  const initializeStorage = async () => {
    const storageService = StorageService.getInstance();
    await storageService.initialize();
  };
  
  initializeStorage();
}, []);
```

### Step 3: Save Inspection Data

```typescript
const saveInspectionData = async () => {
  try {
    const inspectionDataToSave: InspectionData = {
      id: inspectionId,
      vehicleInfo: { /* vehicle data */ },
      inspectorInfo: { /* inspector data */ },
      inspectionItems: { /* inspection results */ },
      overallStatus: calculateOverallStatus(),
      completedAt: new Date().toISOString(),
      progress: calculateProgress(),
      totalDefects: calculateDefects().total,
      criticalDefects: calculateDefects().critical,
      majorDefects: calculateDefects().major,
      minorDefects: calculateDefects().minor
    };

    await storageService.saveInspection(inspectionDataToSave);
  } catch (error) {
    console.error('Failed to save inspection:', error);
  }
};
```

### Step 4: Load Inspection Data

```typescript
const loadInspectionData = async () => {
  try {
    const existingInspection = await storageService.getInspectionById(inspectionId);
    if (existingInspection) {
      // Convert stored data back to component format
      setInspectionData(convertStoredDataToComponentFormat(existingInspection));
    }
  } catch (error) {
    console.error('Failed to load inspection data:', error);
  }
};
```

### Step 5: Handle Photos

```typescript
const takePhoto = async (itemId: string) => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    try {
      // Save photo to permanent storage
      const savedPhotoPath = await storageService.savePhoto(
        inspectionId, 
        result.assets[0].uri
      );
      
      // Update component state
      setInspectionData(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, photos: [...(item.photos || []), savedPhotoPath] }
            : item
        )
      );
      
      // Auto-save
      setTimeout(() => saveInspectionData(), 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo.');
    }
  }
};
```

## Advanced Features

### 1. **Search and Filter**

```typescript
// Search inspections
const searchResults = await storageService.searchInspections('Toyota');

// Filter by criteria
const filteredResults = await storageService.filterInspections({
  status: 'fail',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  make: 'Toyota'
});
```

### 2. **Data Export**

```typescript
// Export all data to JSON file
const exportPath = await storageService.exportAllData();
// Returns: /DocumentDirectory/vehicle_inspection_backup_{timestamp}.json
```

### 3. **Storage Statistics**

```typescript
const stats = await storageService.getStorageStats();
// Returns: { totalInspections: 25, totalPhotos: 150, storageUsed: "45.2 MB" }
```

### 4. **Inspector Profile Management**

```typescript
// Save inspector profile
await storageService.saveInspectorProfile({
  name: 'John Inspector',
  id: 'INS001',
  company: 'Professional Inspections Inc.',
  email: 'john@inspections.com',
  phone: '+1-555-0123',
  certifications: ['ASE Certified', 'State Licensed']
});

// Load inspector profile
const profile = await storageService.getInspectorProfile();
```

## Best Practices

### 1. **Error Handling**
Always wrap storage operations in try-catch blocks and provide user feedback:

```typescript
try {
  await storageService.saveInspection(data);
  // Show success feedback
} catch (error) {
  console.error('Storage error:', error);
  Alert.alert('Error', 'Failed to save data. Please try again.');
}
```

### 2. **Auto-Save with Debouncing**
Implement auto-save with debouncing to avoid excessive storage operations:

```typescript
const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

const autoSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  const timeout = setTimeout(() => {
    saveInspectionData();
  }, 1000); // Save after 1 second of inactivity
  
  setSaveTimeout(timeout);
};
```

### 3. **Loading States**
Always show loading states during storage operations:

```typescript
const [isSaving, setIsSaving] = useState(false);

const saveData = async () => {
  setIsSaving(true);
  try {
    await storageService.saveInspection(data);
  } finally {
    setIsSaving(false);
  }
};
```

### 4. **Data Validation**
Validate data before saving:

```typescript
const validateInspectionData = (data: InspectionData): boolean => {
  return !!(
    data.id &&
    data.vehicleInfo.vin &&
    data.inspectorInfo.name &&
    Object.keys(data.inspectionItems).length > 0
  );
};
```

## Storage Locations

### AsyncStorage Keys
- `vehicle_inspections`: Array of all inspection records
- `inspector_profile`: Current inspector profile
- `app_settings`: Application settings and preferences

### File System Paths
- Photos: `/DocumentDirectory/inspection_photos/`
- Exports: `/DocumentDirectory/vehicle_inspection_backup_{timestamp}.json`

## Performance Considerations

1. **Lazy Loading**: Load inspection data only when needed
2. **Pagination**: Implement pagination for large datasets
3. **Image Optimization**: Compress images before storage
4. **Background Processing**: Use background tasks for large operations
5. **Memory Management**: Clean up unused data and images

## Synchronization Strategy

For future cloud sync implementation:

1. **Conflict Resolution**: Last-write-wins or user-choice resolution
2. **Delta Sync**: Only sync changed data
3. **Offline Queue**: Queue operations when offline
4. **Status Tracking**: Track sync status per inspection
5. **Retry Logic**: Implement exponential backoff for failed syncs

## Testing

### Unit Tests
```typescript
describe('StorageService', () => {
  it('should save and retrieve inspection data', async () => {
    const service = StorageService.getInstance();
    const testData = createTestInspectionData();
    
    await service.saveInspection(testData);
    const retrieved = await service.getInspectionById(testData.id);
    
    expect(retrieved).toEqual(testData);
  });
});
```

### Integration Tests
- Test photo saving and retrieval
- Test data export functionality
- Test search and filter operations
- Test error handling scenarios

This implementation provides a robust offline storage solution that ensures data persistence, efficient querying, and seamless user experience even without internet connectivity.