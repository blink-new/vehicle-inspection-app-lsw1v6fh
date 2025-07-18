import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Car, 
  Calendar,
  MapPin,
  User,
  FileText,
  Camera,
  CheckCircle
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export default function NewInspection() {
  const [vehicleInfo, setVehicleInfo] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    color: '',
    mileage: '',
    licensePlate: '',
  });

  const [inspectorInfo, setInspectorInfo] = useState({
    name: '',
    id: '',
    location: '',
  });

  const handleStartInspection = () => {
    // Validate required fields
    if (!vehicleInfo.make?.trim() || !vehicleInfo.model?.trim() || !vehicleInfo.year?.trim()) {
      Alert.alert('Missing Information', 'Please fill in the required vehicle information (Make, Model, Year).');
      return;
    }
    
    if (!inspectorInfo.name?.trim() || !inspectorInfo.id?.trim()) {
      Alert.alert('Missing Information', 'Please fill in the required inspector information (Name, ID).');
      return;
    }
    
    try {
      // Generate inspection ID and navigate to inspection form
      const inspectionId = `INS-${Date.now()}`;
      
      // Encode the data to pass to the inspection screen
      const vehicleData = encodeURIComponent(JSON.stringify(vehicleInfo));
      const inspectorData = encodeURIComponent(JSON.stringify(inspectorInfo));
      
      router.push(`/inspection/${inspectionId}?mode=new&vehicle=${vehicleData}&inspector=${inspectorData}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to start inspection. Please try again.');
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
          <Text style={styles.headerTitle}>New Inspection</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Inspector Information */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#2563EB" />
              <Text style={styles.sectionTitle}>Inspector Information</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Inspector Name *</Text>
                <TextInput
                  style={styles.input}
                  value={inspectorInfo.name}
                  onChangeText={(text) => setInspectorInfo(prev => ({...prev, name: text}))}
                  placeholder="Enter inspector name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Inspector ID *</Text>
                <TextInput
                  style={styles.input}
                  value={inspectorInfo.id}
                  onChangeText={(text) => setInspectorInfo(prev => ({...prev, id: text}))}
                  placeholder="Enter inspector ID"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={inspectorInfo.location}
                  onChangeText={(text) => setInspectorInfo(prev => ({...prev, location: text}))}
                  placeholder="Enter inspection location"
                />
              </View>
              
              <View style={styles.inspectorRow}>
                <Calendar size={16} color="#64748B" />
                <Text style={styles.locationText}>{new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Vehicle Information */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Car size={20} color="#2563EB" />
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>VIN Number</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.vin}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, vin: text}))}
                    placeholder="Enter VIN"
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity style={styles.scanButton}>
                  <Camera size={20} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Make *</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.make}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, make: text}))}
                    placeholder="Honda"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Model *</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.model}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, model: text}))}
                    placeholder="Civic"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Year *</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.year}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, year: text}))}
                    placeholder="2023"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.color}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, color: text}))}
                    placeholder="Silver"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Mileage</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.mileage}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, mileage: text}))}
                    placeholder="25,000"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>License Plate</Text>
                  <TextInput
                    style={styles.input}
                    value={vehicleInfo.licensePlate}
                    onChangeText={(text) => setVehicleInfo(prev => ({...prev, licensePlate: text}))}
                    placeholder="ABC-123"
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Inspection Preview */}
        <Animated.View entering={FadeInRight.duration(600).delay(600)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#2563EB" />
              <Text style={styles.sectionTitle}>Inspection Checklist</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.previewText}>This inspection will cover:</Text>
              <View style={styles.checklistPreview}>
                {[
                  'Exterior Condition',
                  'Interior Condition', 
                  'Engine & Mechanical',
                  'Safety Systems',
                  'Electrical Systems',
                  'Documentation'
                ].map((item, index) => (
                  <View key={index} style={styles.checklistItem}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text style={styles.checklistText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Start Button */}
      <Animated.View entering={FadeInDown.duration(600).delay(800)} style={styles.footer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartInspection}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.startGradient}
          >
            <Text style={styles.startButtonText}>Start Inspection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inspectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  scanButton: {
    width: 44,
    height: 44,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  checklistPreview: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistText: {
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});