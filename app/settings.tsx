import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  User,
  Bell,
  Camera,
  FileText,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Save
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Settings() {
  const [inspectorInfo, setInspectorInfo] = useState({
    name: 'John Smith',
    id: 'INS-001',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Professional Inspections LLC',
    license: 'LIC-12345',
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    autoSave: true,
    offlineMode: true,
    highQualityPhotos: false,
    gpsLocation: true,
    darkMode: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic
          router.replace('/');
        }}
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightComponent 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (showChevron && onPress && (
        <ChevronRight size={20} color="#64748B" />
      ))}
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inspector Profile</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
                {isEditing ? <Save size={20} color="#2563EB" /> : <Edit size={20} color="#2563EB" />}
              </TouchableOpacity>
            </View>
            
            <View style={styles.card}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.profileInput}
                    value={inspectorInfo.name}
                    onChangeText={(text) => setInspectorInfo({...inspectorInfo, name: text})}
                  />
                ) : (
                  <Text style={styles.profileValue}>{inspectorInfo.name}</Text>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Inspector ID</Text>
                <Text style={styles.profileValue}>{inspectorInfo.id}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.profileInput}
                    value={inspectorInfo.email}
                    onChangeText={(text) => setInspectorInfo({...inspectorInfo, email: text})}
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.profileValue}>{inspectorInfo.email}</Text>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Phone</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.profileInput}
                    value={inspectorInfo.phone}
                    onChangeText={(text) => setInspectorInfo({...inspectorInfo, phone: text})}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.profileValue}>{inspectorInfo.phone}</Text>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Company</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.profileInput}
                    value={inspectorInfo.company}
                    onChangeText={(text) => setInspectorInfo({...inspectorInfo, company: text})}
                  />
                ) : (
                  <Text style={styles.profileValue}>{inspectorInfo.company}</Text>
                )}
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>License</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.profileInput}
                    value={inspectorInfo.license}
                    onChangeText={(text) => setInspectorInfo({...inspectorInfo, license: text})}
                  />
                ) : (
                  <Text style={styles.profileValue}>{inspectorInfo.license}</Text>
                )}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* App Preferences */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            <View style={styles.card}>
              <SettingItem
                icon={<Bell size={20} color="#2563EB" />}
                title="Notifications"
                subtitle="Receive inspection reminders and updates"
                showChevron={false}
                rightComponent={
                  <Switch
                    value={preferences.notifications}
                    onValueChange={(value) => setPreferences({...preferences, notifications: value})}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={preferences.notifications ? '#2563EB' : '#9CA3AF'}
                  />
                }
              />
              
              <SettingItem
                icon={<Save size={20} color="#2563EB" />}
                title="Auto Save"
                subtitle="Automatically save inspection progress"
                showChevron={false}
                rightComponent={
                  <Switch
                    value={preferences.autoSave}
                    onValueChange={(value) => setPreferences({...preferences, autoSave: value})}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={preferences.autoSave ? '#2563EB' : '#9CA3AF'}
                  />
                }
              />
              
              <SettingItem
                icon={<Shield size={20} color="#2563EB" />}
                title="Offline Mode"
                subtitle="Work without internet connection"
                showChevron={false}
                rightComponent={
                  <Switch
                    value={preferences.offlineMode}
                    onValueChange={(value) => setPreferences({...preferences, offlineMode: value})}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={preferences.offlineMode ? '#2563EB' : '#9CA3AF'}
                  />
                }
              />
              
              <SettingItem
                icon={<Camera size={20} color="#2563EB" />}
                title="High Quality Photos"
                subtitle="Use maximum resolution for photos"
                showChevron={false}
                rightComponent={
                  <Switch
                    value={preferences.highQualityPhotos}
                    onValueChange={(value) => setPreferences({...preferences, highQualityPhotos: value})}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={preferences.highQualityPhotos ? '#2563EB' : '#9CA3AF'}
                  />
                }
              />
            </View>
          </View>
        </Animated.View>

        {/* Data & Privacy */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            <View style={styles.card}>
              <SettingItem
                icon={<FileText size={20} color="#2563EB" />}
                title="Export Data"
                subtitle="Download all inspection data"
                onPress={() => Alert.alert('Export Data', 'This feature will be available soon.')}
              />
              
              <SettingItem
                icon={<Shield size={20} color="#2563EB" />}
                title="Privacy Policy"
                subtitle="View our privacy policy"
                onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be displayed here.')}
              />
            </View>
          </View>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.duration(600).delay(800)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.card}>
              <SettingItem
                icon={<HelpCircle size={20} color="#2563EB" />}
                title="Help & FAQ"
                subtitle="Get help and find answers"
                onPress={() => Alert.alert('Help', 'Help documentation will be available here.')}
              />
              
              <SettingItem
                icon={<User size={20} color="#2563EB" />}
                title="Contact Support"
                subtitle="Get in touch with our team"
                onPress={() => Alert.alert('Contact Support', 'Support contact information will be displayed here.')}
              />
            </View>
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View entering={FadeInDown.duration(600).delay(1000)}>
          <View style={styles.section}>
            <View style={styles.card}>
              <SettingItem
                icon={<LogOut size={20} color="#EF4444" />}
                title="Logout"
                subtitle="Sign out of your account"
                onPress={handleLogout}
                showChevron={false}
              />
            </View>
          </View>
        </Animated.View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Vehicle Inspection Pro v1.0.0</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 100,
  },
  profileValue: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  profileInput: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#2563EB',
    paddingVertical: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#64748B',
  },
});