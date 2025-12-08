import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/authSlice';

export default function MoreScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Navigate to login screen after logout
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      router.replace('/login');
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const isAdmin = userInfo?.role === 'admin';

  const featureItems = [
    {
      icon: 'person-outline',
      title: 'Profile',
      subtitle: 'Your account info',
      iconColor: '#2563EB',
      iconBg: '#E0ECFF',
      onPress: () => router.push('/profile'),
    },
    ...(isAdmin
      ? [
          {
            icon: 'people-outline',
            title: 'User Management',
            subtitle: 'Manage all users',
            iconColor: '#DC2626',
            iconBg: '#FEE2E2',
            onPress: () => router.push('/admin-users'),
          },
        ]
      : []),
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'Messages',
      subtitle: 'Team chat',
      iconColor: '#6366F1',
      iconBg: '#EEF2FF',
      onPress: () => router.push('/messages'),
    },
    {
      icon: 'document-text-outline',
      title: 'Documents',
      subtitle: 'Files & docs',
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      onPress: () => router.push('/documents'),
    },
    {
      icon: 'people-outline',
      title: 'Team',
      subtitle: 'Manage members',
      iconColor: '#2563EB',
      iconBg: '#E0ECFF',
      onPress: () => router.push('/team'),
    },
  ];

  const settingsItems = [
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'Preferences',
      iconColor: '#6B7280',
      iconBg: '#F3F4F6',
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      iconColor: '#6B7280',
      iconBg: '#F3F4F6',
    },
  ];

  const renderItem = (item, isLast = false) => (
    <Pressable 
      key={item.title} 
      style={[styles.listItem, isLast && styles.listItemLast]}
      onPress={item.onPress || undefined}
    >
      <View style={styles.listItemLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(userInfo?.fullName || userInfo?.username || 'U').substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.profileName}>
                  {userInfo?.fullName || userInfo?.username || 'User'}
                </Text>
                <Text style={styles.profileRole}>
                  {userInfo?.role || 'Member'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <View style={styles.notification}>
                <Ionicons name="notifications-outline" size={22} color="#111827" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>More</Text>
          <Text style={styles.pageSubtitle}>Additional features and settings</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.sectionList}>
            {featureItems.map((item, index) => renderItem(item, index === featureItems.length - 1))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionList}>
            {settingsItems.map((item, index) => renderItem(item, index === settingsItems.length - 1))}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notification: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  pageHeader: {
    paddingHorizontal: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
