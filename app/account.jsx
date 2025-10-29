import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const [userInfo, setUserInfo] = useState({
    name: 'Kurama Musamba',
    username: 'kuram1290',
    email: 'kurama.musamba@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Productivity enthusiast and task management expert',
    location: 'San Francisco, CA',
    website: 'https://kuramamusamba.com'
  });

  const [editInfo, setEditInfo] = useState(userInfo);

  const handleSave = () => {
    setUserInfo(editInfo);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditInfo(userInfo);
    setIsEditing(false);
  };

  const accountSections = [
    {
      title: 'Personal Information',
      items: [
        { 
          icon: 'person-outline', 
          label: 'Full Name', 
          value: userInfo.name,
          editKey: 'name',
          placeholder: 'Enter your full name'
        },
        { 
          icon: 'at-outline', 
          label: 'Username', 
          value: userInfo.username,
          editKey: 'username',
          placeholder: 'Enter username'
        },
        { 
          icon: 'mail-outline', 
          label: 'Email', 
          value: userInfo.email,
          editKey: 'email',
          placeholder: 'Enter email address'
        },
        { 
          icon: 'call-outline', 
          label: 'Phone', 
          value: userInfo.phone,
          editKey: 'phone',
          placeholder: 'Enter phone number'
        },
        { 
          icon: 'location-outline', 
          label: 'Location', 
          value: userInfo.location,
          editKey: 'location',
          placeholder: 'Enter your location'
        },
        { 
          icon: 'link-outline', 
          label: 'Website', 
          value: userInfo.website,
          editKey: 'website',
          placeholder: 'Enter website URL'
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          value: pushNotifications,
          type: 'switch',
          onToggle: setPushNotifications
        },
        {
          icon: 'mail-outline',
          label: 'Email Notifications',
          value: emailNotifications,
          type: 'switch',
          onToggle: setEmailNotifications
        }
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock-closed-outline', label: 'Change Password', action: 'changePassword' },
        { icon: 'shield-checkmark-outline', label: 'Two-Factor Authentication', action: 'twoFactor' },
        { icon: 'key-outline', label: 'Privacy Settings', action: 'privacy' }
      ]
    },
    {
      title: 'Account Management',
      items: [
        { icon: 'download-outline', label: 'Export Data', action: 'exportData' },
        { icon: 'trash-outline', label: 'Delete Account', action: 'deleteAccount', danger: true }
      ]
    }
  ];

  const handleAction = (action) => {
    switch (action) {
      case 'changePassword':
        Alert.alert('Change Password', 'Password change feature coming soon!');
        break;
      case 'twoFactor':
        Alert.alert('Two-Factor Authentication', '2FA setup feature coming soon!');
        break;
      case 'privacy':
        Alert.alert('Privacy Settings', 'Privacy settings feature coming soon!');
        break;
      case 'exportData':
        Alert.alert('Export Data', 'Data export feature coming soon!');
        break;
      case 'deleteAccount':
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted') }
          ]
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Account</Text>
          <Pressable style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#000" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={50} color="#029688" />
            </View>
            <Pressable style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#029688" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{userInfo.name}</Text>
          <Text style={styles.userHandle}>@{userInfo.username}</Text>
          <Text style={styles.userBio}>{userInfo.bio}</Text>
          
          {/* Edit/Save Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={16} color="#029688" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Sections */}
        {accountSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.sectionItem}>
                  <View style={styles.sectionItemLeft}>
                    <View style={styles.sectionIcon}>
                      <Ionicons 
                        name={item.icon} 
                        size={20} 
                        color={item.danger ? '#FF3B30' : '#333'} 
                      />
                    </View>
                    <View style={styles.sectionText}>
                      <Text style={[
                        styles.sectionLabel,
                        item.danger && styles.dangerText
                      ]}>
                        {item.label}
                      </Text>
                      {item.value !== undefined && item.type !== 'switch' && (
                        <Text style={styles.sectionValue}>
                          {isEditing && item.editKey ? (
                            <TextInput
                              style={styles.editInput}
                              value={editInfo[item.editKey]}
                              onChangeText={(text) => setEditInfo({...editInfo, [item.editKey]: text})}
                              placeholder={item.placeholder}
                              placeholderTextColor="#999"
                            />
                          ) : (
                            item.value
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E0E0E0', true: '#029688' }}
                      thumbColor={item.value ? '#fff' : '#fff'}
                    />
                  ) : item.action ? (
                    <Pressable onPress={() => handleAction(item.action)}>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={item.danger ? '#FF3B30' : '#ccc'} 
                      />
                    </Pressable>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#029688',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButtons: {
    width: '100%',
    paddingHorizontal: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#029688',
  },
  editButtonText: {
    color: '#029688',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#029688',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionText: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 14,
    color: '#666',
  },
  editInput: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dangerText: {
    color: '#FF3B30',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
});
