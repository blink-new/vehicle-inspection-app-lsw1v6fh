import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Search,
  Filter,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Share,
  Download,
  Trash2
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StorageService, { InspectionData } from '../services/StorageService';
import PDFReportService from '../services/PDFReportService';

export default function InspectionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [inspectionRecords, setInspectionRecords] = useState<InspectionData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<InspectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

  const storageService = StorageService.getInstance();
  const pdfService = PDFReportService.getInstance();

  useEffect(() => {
    loadInspectionHistory();
  }, []);

  useEffect(() => {
    filterInspections();
  }, [searchQuery, filterStatus, inspectionRecords]);

  const loadInspectionHistory = async () => {
    try {
      setIsLoading(true);
      const inspections = await storageService.getAllInspections();
      setInspectionRecords(inspections);
    } catch (error) {
      console.error('Failed to load inspection history:', error);
      Alert.alert('Error', 'Failed to load inspection history.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterInspections = () => {
    let filtered = inspectionRecords;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.vehicleInfo.vin.toLowerCase().includes(query) ||
        record.vehicleInfo.make.toLowerCase().includes(query) ||
        record.vehicleInfo.model.toLowerCase().includes(query) ||
        record.vehicleInfo.licensePlate.toLowerCase().includes(query) ||
        record.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.overallStatus === filterStatus);
    }

    setFilteredRecords(filtered);
  };

  const deleteInspection = async (inspectionId: string) => {
    Alert.alert(
      'Delete Inspection',
      'Are you sure you want to delete this inspection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteInspection(inspectionId);
              await loadInspectionHistory();
              Alert.alert('Success', 'Inspection deleted successfully.');
            } catch (error) {
              console.error('Failed to delete inspection:', error);
              Alert.alert('Error', 'Failed to delete inspection.');
            }
          }
        }
      ]
    );
  };

  const generateAndShareReport = async (inspection: InspectionData) => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(inspection.id);
    try {
      const pdfUri = await pdfService.generateInspectionReport(inspection);
      await pdfService.shareReport(pdfUri);
    } catch (error) {
      console.error('Failed to generate/share report:', error);
      Alert.alert('Error', 'Failed to generate or share report.');
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  const exportAllData = async () => {
    try {
      const exportPath = await storageService.exportAllData();
      Alert.alert(
        'Data Exported',
        `All inspection data has been exported successfully.`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Error', 'Failed to export data.');
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
        return <Clock size={20} color="#64748B" />;
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

  const getScoreColor = (criticalDefects: number, majorDefects: number) => {
    if (criticalDefects > 0) return '#EF4444';
    if (majorDefects > 0) return '#F59E0B';
    return '#10B981';
  };

  const calculateScore = (inspection: InspectionData) => {
    const totalItems = Object.keys(inspection.inspectionItems).length;
    const passedItems = Object.values(inspection.inspectionItems).filter(item => item.status === 'pass').length;
    return totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;
  };

  const renderInspectionCard = ({ item, index }: { item: InspectionData; index: number }) => {
    const score = calculateScore(item);
    const isGenerating = isGeneratingPDF === item.id;
    
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 100)}>
        <TouchableOpacity 
          style={styles.inspectionCard}
          onPress={() => router.push(`/inspection/${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleIcon}>
                <Car size={24} color="#2563EB" />
              </View>
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleName}>
                  {item.vehicleInfo.year} {item.vehicleInfo.make} {item.vehicleInfo.model}
                </Text>
                <Text style={styles.licensePlate}>{item.vehicleInfo.licensePlate}</Text>
                <Text style={styles.vinText}>VIN: {item.vehicleInfo.vin}</Text>
              </View>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.overallStatus) }]}>
              {getStatusIcon(item.overallStatus)}
              <Text style={[styles.statusText, { 
                color: item.overallStatus === 'pass' ? '#166534' : 
                       item.overallStatus === 'fail' ? '#DC2626' : '#92400E' 
              }]}>
                {item.overallStatus.charAt(0).toUpperCase() + item.overallStatus.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.inspectionMeta}>
              <View style={styles.metaItem}>
                <Calendar size={16} color="#64748B" />
                <Text style={styles.metaText}>
                  {new Date(item.completedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.inspectorText}>
                  Inspector: {item.inspectorInfo.name}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.progressText}>
                  Progress: {Math.round(item.progress)}%
                </Text>
              </View>
            </View>

            <View style={styles.scoreSection}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(item.criticalDefects, item.majorDefects) }]}>
                  {score}%
                </Text>
              </View>
              
              <View style={styles.defectsContainer}>
                {item.criticalDefects > 0 && (
                  <View style={styles.defectBadge}>
                    <XCircle size={12} color="#EF4444" />
                    <Text style={styles.defectText}>{item.criticalDefects} Critical</Text>
                  </View>
                )}
                {item.majorDefects > 0 && (
                  <View style={styles.defectBadge}>
                    <AlertTriangle size={12} color="#F59E0B" />
                    <Text style={styles.defectText}>{item.majorDefects} Major</Text>
                  </View>
                )}
                {item.minorDefects > 0 && (
                  <View style={styles.defectBadge}>
                    <AlertTriangle size={12} color="#10B981" />
                    <Text style={styles.defectText}>{item.minorDefects} Minor</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton}>
              <FileText size={16} color="#2563EB" />
              <Text style={styles.actionText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => generateAndShareReport(item)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Download size={16} color="#2563EB" />
              ) : (
                <Share size={16} color="#2563EB" />
              )}
              <Text style={styles.actionText}>
                {isGenerating ? 'Generating...' : 'Share Report'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteInspection(item.id)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inspection History</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading inspection history...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Inspection History</Text>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={exportAllData}
          >
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vehicle, VIN, plate, or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {(['all', 'pass', 'warning', 'fail'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterText,
                filterStatus === status && styles.activeFilterText
              ]}>
                {status === 'all' ? 'All' : 
                 status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {filteredRecords.length} inspection{filteredRecords.length !== 1 ? 's' : ''} found
        </Text>
        {inspectionRecords.length > 0 && (
          <Text style={styles.totalText}>
            Total: {inspectionRecords.length} inspections
          </Text>
        )}
      </View>

      {/* Inspection List */}
      {filteredRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Inspections Found</Text>
          <Text style={styles.emptyText}>
            {inspectionRecords.length === 0 
              ? "You haven't completed any inspections yet."
              : "No inspections match your search criteria."
            }
          </Text>
          {inspectionRecords.length === 0 && (
            <TouchableOpacity 
              style={styles.newInspectionButton}
              onPress={() => router.push('/new-inspection')}
            >
              <Text style={styles.newInspectionText}>Start New Inspection</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderInspectionCard}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeFilterButton: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#64748B',
  },
  totalText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  newInspectionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newInspectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inspectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  licensePlate: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  vinText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 12,
  },
  inspectionMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  inspectorText: {
    fontSize: 14,
    color: '#64748B',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  defectsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  defectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    gap: 4,
  },
  defectText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    gap: 6,
  },
  deleteButton: {
    flex: 0,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});