import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Save,
  Share,
  Plus,
  Download
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import StorageService, { InspectionData } from '../../services/StorageService';
import PDFReportService from '../../services/PDFReportService';

interface InspectionItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  notes?: string;
  photos?: string[];
  defects?: Array<{
    description: string;
    severity: 'critical' | 'major' | 'minor';
    location: string;
  }>;
}

interface DefectItem {
  id: string;
  category: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  photos: string[];
  notes: string;
}

export default function InspectionDetail() {
  const { id, mode, vehicle, inspector } = useLocalSearchParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InspectionItem | null>(null);
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewInspection, setIsNewInspection] = useState(mode === 'new');
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [inspectorInfo, setInspectorInfo] = useState<any>(null);

  const storageService = StorageService.getInstance();
  const pdfService = PDFReportService.getInstance();

  const sections = [
    'Exterior',
    'Interior', 
    'Engine & Mechanical',
    'Safety Systems',
    'Electrical',
    'Documentation'
  ];

  const [inspectionData, setInspectionData] = useState<InspectionItem[]>([
    // Exterior
    { id: '1', category: 'Exterior', item: 'Body Condition', status: 'pending' },
    { id: '2', category: 'Exterior', item: 'Paint Condition', status: 'pending' },
    { id: '3', category: 'Exterior', item: 'Windows & Windshield', status: 'pending' },
    { id: '4', category: 'Exterior', item: 'Lights (Headlights, Taillights)', status: 'pending' },
    { id: '5', category: 'Exterior', item: 'Mirrors', status: 'pending' },
    { id: '6', category: 'Exterior', item: 'Tires & Wheels', status: 'pending' },
    
    // Interior
    { id: '7', category: 'Interior', item: 'Seats & Upholstery', status: 'pending' },
    { id: '8', category: 'Interior', item: 'Dashboard & Controls', status: 'pending' },
    { id: '9', category: 'Interior', item: 'Steering Wheel', status: 'pending' },
    { id: '10', category: 'Interior', item: 'Pedals & Floor Mats', status: 'pending' },
    { id: '11', category: 'Interior', item: 'Interior Lights', status: 'pending' },
    
    // Engine & Mechanical
    { id: '12', category: 'Engine & Mechanical', item: 'Engine Condition', status: 'pending' },
    { id: '13', category: 'Engine & Mechanical', item: 'Fluid Levels', status: 'pending' },
    { id: '14', category: 'Engine & Mechanical', item: 'Belts & Hoses', status: 'pending' },
    { id: '15', category: 'Engine & Mechanical', item: 'Battery', status: 'pending' },
    { id: '16', category: 'Engine & Mechanical', item: 'Exhaust System', status: 'pending' },
    
    // Safety Systems
    { id: '17', category: 'Safety Systems', item: 'Brakes', status: 'pending' },
    { id: '18', category: 'Safety Systems', item: 'Airbags', status: 'pending' },
    { id: '19', category: 'Safety Systems', item: 'Seatbelts', status: 'pending' },
    { id: '20', category: 'Safety Systems', item: 'Horn', status: 'pending' },
    
    // Electrical
    { id: '21', category: 'Electrical', item: 'Electrical System', status: 'pending' },
    { id: '22', category: 'Electrical', item: 'Air Conditioning', status: 'pending' },
    { id: '23', category: 'Electrical', item: 'Radio & Electronics', status: 'pending' },
    
    // Documentation
    { id: '24', category: 'Documentation', item: 'Registration', status: 'pending' },
    { id: '25', category: 'Documentation', item: 'Insurance', status: 'pending' },
    { id: '26', category: 'Documentation', item: 'Service Records', status: 'pending' },
  ]);

  useEffect(() => {
    const completed = inspectionData.filter(item => item.status !== 'pending').length;
    setProgress((completed / inspectionData.length) * 100);
  }, [inspectionData]);

  useEffect(() => {
    // Initialize storage service
    const initializeApp = async () => {
      try {
        await storageService.initialize();
        
        // Parse vehicle and inspector data for new inspections
        if (isNewInspection && vehicle && inspector) {
          try {
            const parsedVehicle = JSON.parse(decodeURIComponent(vehicle as string));
            const parsedInspector = JSON.parse(decodeURIComponent(inspector as string));
            setVehicleInfo(parsedVehicle);
            setInspectorInfo(parsedInspector);
            console.log('Parsed vehicle info:', parsedVehicle);
            console.log('Parsed inspector info:', parsedInspector);
          } catch (parseError) {
            console.error('Failed to parse vehicle/inspector data:', parseError);
          }
        }
        
        // Load existing inspection data if available
        await loadInspectionData();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initializeApp();
  }, []);

  const loadInspectionData = async () => {
    try {
      // Skip loading for new inspections
      if (isNewInspection) {
        console.log('Starting new inspection with ID:', id);
        return;
      }

      const existingInspection = await storageService.getInspectionById(id as string);
      if (existingInspection) {
        // Convert stored data back to component format
        const convertedData = inspectionData.map(item => {
          const storedItem = existingInspection.inspectionItems[item.item];
          if (storedItem) {
            return {
              ...item,
              status: storedItem.status,
              notes: storedItem.notes,
              photos: storedItem.photos,
              defects: storedItem.defects
            };
          }
          return item;
        });
        setInspectionData(convertedData);
      }
    } catch (error) {
      console.error('Failed to load inspection data:', error);
    }
  };

  const getCurrentSectionItems = () => {
    return inspectionData.filter(item => item.category === sections[currentSection]);
  };

  const updateItemStatus = (itemId: string, status: 'pass' | 'fail' | 'warning') => {
    setInspectionData(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status } : item
      )
    );

    if (status === 'fail') {
      const item = inspectionData.find(i => i.id === itemId);
      if (item) {
        setSelectedItem(item);
        setShowDefectModal(true);
      }
    }

    // Auto-save after status change
    setTimeout(() => saveInspectionData(), 1000);
  };

  const takePhoto = async (itemId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        // Save photo to permanent storage
        const savedPhotoPath = await storageService.savePhoto(id as string, result.assets[0].uri);
        
        setInspectionData(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, photos: [...(item.photos || []), savedPhotoPath] }
              : item
          )
        );

        // Auto-save after photo addition
        setTimeout(() => saveInspectionData(), 1000);
      } catch (error) {
        Alert.alert('Error', 'Failed to save photo. Please try again.');
      }
    }
  };

  const addDefect = (defect: Omit<DefectItem, 'id'>) => {
    const newDefect: DefectItem = {
      ...defect,
      id: Date.now().toString(),
    };
    setDefects(prev => [...prev, newDefect]);
    
    // Add defect to the inspection item
    if (selectedItem) {
      setInspectionData(prev => 
        prev.map(item => 
          item.id === selectedItem.id 
            ? { 
                ...item, 
                defects: [...(item.defects || []), {
                  description: defect.description,
                  severity: defect.severity,
                  location: defect.category
                }]
              }
            : item
        )
      );
    }
    
    setShowDefectModal(false);
    
    // Auto-save after defect addition
    setTimeout(() => saveInspectionData(), 1000);
  };

  const saveInspectionData = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Calculate defect counts
      const allDefects = inspectionData.flatMap(item => item.defects || []);
      const criticalDefects = allDefects.filter(d => d.severity === 'critical').length;
      const majorDefects = allDefects.filter(d => d.severity === 'major').length;
      const minorDefects = allDefects.filter(d => d.severity === 'minor').length;
      
      // Determine overall status
      const failedItems = inspectionData.filter(item => item.status === 'fail').length;
      const warningItems = inspectionData.filter(item => item.status === 'warning').length;
      
      let overallStatus: 'pass' | 'warning' | 'fail' = 'pass';
      if (failedItems > 0 || criticalDefects > 0) {
        overallStatus = 'fail';
      } else if (warningItems > 0 || majorDefects > 0) {
        overallStatus = 'warning';
      }

      // Convert inspection data to storage format
      const inspectionItems: { [key: string]: any } = {};
      inspectionData.forEach(item => {
        inspectionItems[item.item] = {
          status: item.status,
          notes: item.notes,
          photos: item.photos,
          defects: item.defects
        };
      });

      const inspectionDataToSave: InspectionData = {
        id: id as string,
        vehicleInfo: vehicleInfo || {
          vin: '',
          make: 'Unknown',
          model: 'Unknown',
          year: '2024',
          color: '',
          mileage: '',
          licensePlate: ''
        },
        inspectorInfo: inspectorInfo || {
          name: 'Unknown Inspector',
          id: 'INS001',
          company: 'Professional Inspections Inc.'
        },
        inspectionItems,
        overallStatus,
        completedAt: new Date().toISOString(),
        progress,
        totalDefects: allDefects.length,
        criticalDefects,
        majorDefects,
        minorDefects
      };

      await storageService.saveInspection(inspectionDataToSave);
    } catch (error) {
      console.error('Failed to save inspection:', error);
      Alert.alert('Error', 'Failed to save inspection data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateReport = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      // First save the current inspection data
      await saveInspectionData();
      
      // Get the saved inspection data
      const inspectionData = await storageService.getInspectionById(id as string);
      if (!inspectionData) {
        throw new Error('Inspection data not found');
      }

      // Generate PDF report
      const pdfUri = await pdfService.generateInspectionReport(inspectionData);
      
      Alert.alert(
        'Report Generated',
        'Your inspection report has been generated successfully!',
        [
          { text: 'View Report', onPress: () => shareReport(pdfUri) },
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const shareReport = async (pdfUri: string) => {
    try {
      await pdfService.shareReport(pdfUri);
    } catch (error) {
      console.error('Failed to share report:', error);
      Alert.alert('Error', 'Failed to share report. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={20} color="#10B981" />;
      case 'fail':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#F59E0B" />;
      default:
        return <View style={styles.pendingIcon} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return '#DCFCE7';
      case 'fail': return '#FEE2E2';
      case 'warning': return '#FEF3C7';
      default: return '#F1F5F9';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : `Inspection #${id}`}
            </Text>
            <Text style={styles.headerSubtitle}>{Math.round(progress)}% Complete</Text>
          </View>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={generateReport}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <Download size={20} color="#FFFFFF" />
            ) : (
              <FileText size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Section Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              currentSection === index && styles.activeTab
            ]}
            onPress={() => setCurrentSection(index)}
          >
            <Text style={[
              styles.tabText,
              currentSection === index && styles.activeTabText
            ]}>
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inspection Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {getCurrentSectionItems().map((item, index) => (
          <Animated.View 
            key={item.id}
            entering={FadeInDown.duration(400).delay(index * 100)}
          >
            <View style={[styles.itemCard, { backgroundColor: getStatusColor(item.status) }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.item}</Text>
                {getStatusIcon(item.status)}
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.passButton]}
                  onPress={() => updateItemStatus(item.id, 'pass')}
                >
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.passText}>Pass</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.warningButton]}
                  onPress={() => updateItemStatus(item.id, 'warning')}
                >
                  <AlertTriangle size={16} color="#F59E0B" />
                  <Text style={styles.warningText}>Warning</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.failButton]}
                  onPress={() => updateItemStatus(item.id, 'fail')}
                >
                  <XCircle size={16} color="#EF4444" />
                  <Text style={styles.failText}>Fail</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.photoButton]}
                  onPress={() => takePhoto(item.id)}
                >
                  <Camera size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>

              {item.photos && item.photos.length > 0 && (
                <ScrollView horizontal style={styles.photoContainer}>
                  {item.photos.map((photo, photoIndex) => (
                    <Image 
                      key={photoIndex}
                      source={{ uri: photo }}
                      style={styles.photo}
                    />
                  ))}
                </ScrollView>
              )}

              {item.defects && item.defects.length > 0 && (
                <View style={styles.defectsContainer}>
                  <Text style={styles.defectsTitle}>Defects:</Text>
                  {item.defects.map((defect, defectIndex) => (
                    <View key={defectIndex} style={styles.defectItem}>
                      <Text style={[
                        styles.defectSeverity,
                        defect.severity === 'critical' && styles.criticalText,
                        defect.severity === 'major' && styles.majorText,
                        defect.severity === 'minor' && styles.minorText,
                      ]}>
                        {defect.severity.toUpperCase()}
                      </Text>
                      <Text style={styles.defectDescription}>{defect.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Defect Modal */}
      <Modal
        visible={showDefectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <DefectModal
          item={selectedItem}
          onClose={() => setShowDefectModal(false)}
          onSave={addDefect}
        />
      </Modal>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveInspectionData}
          disabled={isSaving}
        >
          <Save size={20} color="#2563EB" />
          <Text style={styles.saveText}>
            {isSaving ? 'Saving...' : 'Save Progress'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={generateReport}
          disabled={isGeneratingPDF}
        >
          <Share size={20} color="#FFFFFF" />
          <Text style={styles.shareText}>
            {isGeneratingPDF ? 'Generating...' : 'Share Report'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Defect Modal Component
function DefectModal({ 
  item, 
  onClose, 
  onSave 
}: { 
  item: InspectionItem | null;
  onClose: () => void;
  onSave: (defect: Omit<DefectItem, 'id'>) => void;
}) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'major' | 'minor'>('minor');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSave = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description for the defect.');
      return;
    }

    onSave({
      category: item?.category || '',
      description,
      severity,
      photos,
      notes,
    });
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Record Defect</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <Text style={styles.modalSubtitle}>Item: {item?.item}</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the defect..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Severity</Text>
          <View style={styles.severityButtons}>
            {(['critical', 'major', 'minor'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  severity === level && styles.activeSeverityButton,
                  level === 'critical' && styles.criticalButton,
                  level === 'major' && styles.majorButton,
                  level === 'minor' && styles.minorButton,
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text style={[
                  styles.severityText,
                  severity === level && styles.activeSeverityText
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Additional Notes</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.saveDefectButton} onPress={handleSave}>
          <Text style={styles.saveDefectText}>Save Defect</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  reportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  pendingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  passButton: {
    backgroundColor: '#DCFCE7',
  },
  warningButton: {
    backgroundColor: '#FEF3C7',
  },
  failButton: {
    backgroundColor: '#FEE2E2',
  },
  photoButton: {
    backgroundColor: '#EFF6FF',
    flex: 0,
    paddingHorizontal: 12,
  },
  passText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  failText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  photoContainer: {
    marginTop: 12,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  defectsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  defectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  defectItem: {
    marginBottom: 4,
  },
  defectSeverity: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  criticalText: {
    color: '#DC2626',
  },
  majorText: {
    color: '#D97706',
  },
  minorText: {
    color: '#059669',
  },
  defectDescription: {
    fontSize: 14,
    color: '#374151',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    gap: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    gap: 8,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelText: {
    fontSize: 16,
    color: '#2563EB',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeSeverityButton: {
    borderColor: '#2563EB',
  },
  criticalButton: {
    backgroundColor: '#FEE2E2',
  },
  majorButton: {
    backgroundColor: '#FEF3C7',
  },
  minorButton: {
    backgroundColor: '#DCFCE7',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeSeverityText: {
    color: '#2563EB',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveDefectButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveDefectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});