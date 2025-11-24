import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // User data - in real app, this would come from context/state management
  const [userData, setUserData] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    initials: 'AU',
    avatarColor: '#2563EB',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 2024',
    projects: ['Website Redesign', 'Mobile App Development', 'Marketing Campaign Q2'],
  });

  // Edit form states
  const [editName, setEditName] = useState(userData.name);
  const [editEmail, setEditEmail] = useState(userData.email);
  const [editPhone, setEditPhone] = useState(userData.phone);

  const handleOpenEditModal = () => {
    setEditName(userData.name);
    setEditEmail(userData.email);
    setEditPhone(userData.phone);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Please fill in name and email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Update user data
    const newInitials = editName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    setUserData({
      ...userData,
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      initials: newInitials,
    });

    Alert.alert('Success', 'Profile updated successfully');
    setShowEditProfileModal(false);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Handle password change logic here
    Alert.alert('Success', 'Password changed successfully');
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const profileMenuItems = [
    {
      id: '1',
      icon: 'lock-closed-outline',
      title: 'Change Password',
      subtitle: 'Update your password',
      onPress: () => setShowChangePasswordModal(true),
    },
    {
      id: '2',
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification settings',
      onPress: () => {},
    },
    {
      id: '3',
      icon: 'language-outline',
      title: 'Language',
      subtitle: 'English',
      onPress: () => {},
    },
    {
      id: '4',
      icon: 'moon-outline',
      title: 'Theme',
      subtitle: 'Light',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.editButton} onPress={handleOpenEditModal}>
          <Ionicons name="create-outline" size={20} color="#2563EB" />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: userData.avatarColor }]}>
            <Text style={styles.avatarText}>{userData.initials}</Text>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userRole}>{userData.role}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>

        {/* User Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData.phone}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{userData.joinDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Projects Section */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Projects</Text>
          <View style={styles.projectsList}>
            {userData.projects.map((project, index) => (
              <View key={index} style={styles.projectTag}>
                <Text style={styles.projectTagText}>{project}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            {profileMenuItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons name={item.icon} size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowChangePasswordModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Pressable 
                onPress={() => setShowChangePasswordModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <Pressable style={styles.modalButton} onPress={handleChangePassword}>
              <Text style={styles.modalButtonText}>Update Password</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowEditProfileModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable 
                onPress={() => setShowEditProfileModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalButtonRow}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleSaveProfile}>
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  projectsSection: {
    marginBottom: 20,
  },
  projectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  projectTagText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
  },
  modalButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flex: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

