import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState('Website Redesign');

  const projects = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete redesign of company website',
      unreadCount: 2,
    },
    {
      id: '2',
      title: 'Mobile App Development',
      description: 'Build iOS and Android mobile application',
      unreadCount: 0,
    },
    {
      id: '3',
      title: 'Marketing Campaign Q2',
      description: 'Q2 marketing initiatives and campaigns',
      unreadCount: 0,
    },
  ];

  const messages = [
    {
      id: '1',
      sender: 'Project Manager',
      senderInitials: 'PM',
      time: '07:00 AM',
      message: 'Great progress on the homepage design!',
    },
    {
      id: '2',
      sender: 'Team Member',
      senderInitials: 'TM',
      time: '07:00 AM',
      message: 'Thanks! I\'ve updated the color scheme based on your feedback.',
    },
    {
      id: '3',
      sender: 'Project Manager',
      senderInitials: 'PM',
      time: '07:15 AM',
      message: 'Perfect! Can you also add the new navigation menu?',
    },
  ];

  const selectedProjectData = projects.find(p => p.title === selectedProject);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Projects Section */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Projects</Text>
          <View style={styles.projectsList}>
            {projects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => setSelectedProject(project.title)}
                style={[
                  styles.projectItem,
                  selectedProject === project.title && styles.projectItemSelected,
                ]}
              >
                <View style={styles.projectContent}>
                  <Text
                    style={[
                      styles.projectTitle,
                      selectedProject === project.title && styles.projectTitleSelected,
                    ]}
                  >
                    {project.title}
                  </Text>
                  <Text
                    style={[
                      styles.projectDescription,
                      selectedProject === project.title && styles.projectDescriptionSelected,
                    ]}
                  >
                    {project.description}
                  </Text>
                </View>
                {project.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{project.unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chat Section */}
        {selectedProjectData && (
          <View style={styles.chatSection}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatProjectTitle}>{selectedProjectData.title}</Text>
              <Text style={styles.chatProjectDescription}>{selectedProjectData.description}</Text>
            </View>

            <ScrollView 
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={true}
            >
              {messages.map((msg) => (
                <View key={msg.id} style={styles.messageItem}>
                  <View style={styles.messageAvatar}>
                    <Text style={styles.messageAvatarText}>{msg.senderInitials}</Text>
                  </View>
                  <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSender}>{msg.sender}</Text>
                      <Text style={styles.messageTime}>{msg.time}</Text>
                    </View>
                    <View style={styles.messageBubble}>
                      <Text style={styles.messageText}>{msg.message}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <Pressable style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  projectsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  projectsList: {
    gap: 8,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  projectItemSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectTitleSelected: {
    color: '#fff',
  },
  projectDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  projectDescriptionSelected: {
    color: '#E0E7FF',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  chatSection: {
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
  chatHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatProjectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  chatProjectDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  messagesList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  messagesContent: {
    gap: 16,
  },
  messageItem: {
    flexDirection: 'row',
    gap: 12,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

