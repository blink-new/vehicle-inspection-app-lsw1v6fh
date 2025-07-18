import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ClipboardList, 
  History, 
  Settings, 
  Plus,
  Car,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function Home() {
  const recentInspections = [
    { id: '1', vehicle: '2023 Honda Civic', date: '2024-01-15', status: 'Completed' },
    { id: '2', vehicle: '2022 Toyota Camry', date: '2024-01-14', status: 'In Progress' },
    { id: '3', vehicle: '2021 Ford F-150', date: '2024-01-13', status: 'Completed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={styles.headerTitle}>Vehicle Inspection Pro</Text>
          <Text style={styles.headerSubtitle}>Professional Vehicle Assessment</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.primaryAction]}
              onPress={() => router.push('/new-inspection')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Plus size={32} color="#FFFFFF" />
                <Text style={styles.actionTitle}>New Inspection</Text>
                <Text style={styles.actionSubtitle}>Start vehicle assessment</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/history')}
            >
              <History size={28} color="#2563EB" />
              <Text style={styles.actionTitleSecondary}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/settings')}
            >
              <Settings size={28} color="#2563EB" />
              <Text style={styles.actionTitleSecondary}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <ClipboardList size={24} color="#2563EB" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Total Inspections</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={24} color="#10B981" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Inspections */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <Text style={styles.sectionTitle}>Recent Inspections</Text>
          {recentInspections.map((inspection, index) => (
            <TouchableOpacity 
              key={inspection.id}
              style={styles.inspectionCard}
              onPress={() => router.push(`/inspection/${inspection.id}`)}
            >
              <View style={styles.inspectionIcon}>
                <Car size={24} color="#2563EB" />
              </View>
              <View style={styles.inspectionInfo}>
                <Text style={styles.inspectionVehicle}>{inspection.vehicle}</Text>
                <Text style={styles.inspectionDate}>{inspection.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                inspection.status === 'Completed' ? styles.completedBadge : styles.progressBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  inspection.status === 'Completed' ? styles.completedText : styles.progressText
                ]}>
                  {inspection.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
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
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  primaryAction: {
    flex: 2,
  },
  actionGradient: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#FEF3C7',
    marginTop: 4,
  },
  actionTitleSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  inspectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inspectionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  inspectionDate: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
  },
  progressBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    color: '#166534',
  },
  progressText: {
    color: '#92400E',
  },
});