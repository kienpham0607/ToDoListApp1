import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeamScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const teamMembers = [
    {
      id: '1',
      name: 'Admin User',
      role: 'Admin',
      email: 'admin@example.com',
      initials: 'AU',
      avatarColor: '#2563EB',
      projects: ['Website Redesign', 'Mobile App Development'],
      status: 'active',
    },
    {
      id: '2',
      name: 'Project Manager',
      role: 'Project Manager',
      email: 'pm@example.com',
      initials: 'PM',
      avatarColor: '#10B981',
      projects: ['Website Redesign', 'Marketing Campaign Q2'],
      status: 'active',
    },
    {
      id: '3',
      name: 'Team Member',
      role: 'Developer',
      email: 'dev@example.com',
      initials: 'TM',
      avatarColor: '#F59E0B',
      projects: ['Mobile App Development'],
      status: 'active',
    },
    {
      id: '4',
      name: 'Designer',
      role: 'UI/UX Designer',
      email: 'designer@example.com',
      initials: 'DS',
      avatarColor: '#EC4899',
      projects: ['Website Redesign'],
      status: 'active',
    },
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Team</Text>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search team members..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Team Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teamMembers.length}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {teamMembers.filter(m => m.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {new Set(teamMembers.flatMap(m => m.projects)).size}
          </Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
      </View>

      {/* Team Members List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Team Members</Text>
        {filteredMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View style={styles.memberInfo}>
                <View style={[styles.memberAvatar, { backgroundColor: member.avatarColor }]}>
                  <Text style={styles.memberAvatarText}>{member.initials}</Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
              </View>
              <View style={styles.memberActions}>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="mail-outline" size={18} color="#2563EB" />
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            <View style={styles.memberProjects}>
              <Text style={styles.projectsLabel}>Projects:</Text>
              <View style={styles.projectsList}>
                {member.projects.map((project, index) => (
                  <View key={index} style={styles.projectTag}>
                    <Text style={styles.projectTagText}>{project}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.memberFooter}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  memberProjects: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  projectsLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  projectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  projectTagText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  memberFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

