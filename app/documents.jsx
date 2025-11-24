import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject] = useState('All Projects');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProjectForUpload, setSelectedProjectForUpload] = useState('Website Redesign');
  const [documentName, setDocumentName] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const projects = [
    'Website Redesign',
    'Mobile App Development',
    'Marketing Campaign Q2',
  ];

  const documents = [
    {
      id: '1',
      name: 'Design Specifications.pdf',
      size: '2.3 MB',
      type: 'PDF',
      project: 'Website Redesign',
      uploadedBy: 'Project Manager',
      uploadedByInitials: 'PM',
      uploadDate: '1/20/2024',
      iconColor: '#FCE7F3',
      iconBg: '#EC4899',
    },
    {
      id: '2',
      name: 'Project Requirements.docx',
      size: '1.0 MB',
      type: 'DOCX',
      project: 'Website Redesign',
      uploadedBy: 'Project Manager',
      uploadedByInitials: 'PM',
      uploadDate: '1/19/2024',
      iconColor: '#DBEAFE',
      iconBg: '#3B82F6',
    },
    {
      id: '3',
      name: 'Wireframes.fig',
      size: '5.2 MB',
      type: 'FIG',
      project: 'Mobile App Development',
      uploadedBy: 'Team Member',
      uploadedByInitials: 'TM',
      uploadDate: '1/18/2024',
      iconColor: '#FEF3C7',
      iconBg: '#F59E0B',
    },
    {
      id: '4',
      name: 'Budget Report.xlsx',
      size: '850 KB',
      type: 'XLSX',
      project: 'Marketing Campaign Q2',
      uploadedBy: 'Admin User',
      uploadedByInitials: 'AU',
      uploadDate: '1/17/2024',
      iconColor: '#D1FAE5',
      iconBg: '#10B981',
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'All Projects' || doc.project === selectedProject;
    return matchesSearch && matchesProject;
  });

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'PDF':
        return 'document-text';
      case 'DOCX':
        return 'document';
      case 'FIG':
        return 'image';
      case 'XLSX':
        return 'grid';
      default:
        return 'document-text';
    }
  };

  const handleUpload = () => {
    // Handle upload logic here
    console.log('Uploading:', { selectedProjectForUpload, documentName });
    setShowUploadModal(false);
    setDocumentName('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Documents</Text>
        <Pressable style={styles.uploadButtonHeader} onPress={() => setShowUploadModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload Document</Text>
        </Pressable>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterButtonText}>{selectedProject}</Text>
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </Pressable>
      </View>

      {/* Documents List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {filteredDocuments.map((doc) => (
          <View key={doc.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <View style={[styles.documentIcon, { backgroundColor: doc.iconColor }]}>
                  <Ionicons name={getDocumentIcon(doc.type)} size={24} color={doc.iconBg} />
                </View>
                <View style={styles.documentDetails}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentSize}>{doc.size}</Text>
                </View>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{doc.type}</Text>
              </View>
            </View>

            <View style={styles.documentTags}>
              <View style={styles.projectTag}>
                <Text style={styles.projectTagText}>{doc.project}</Text>
              </View>
            </View>

            <View style={styles.documentFooter}>
              <View style={styles.uploaderInfo}>
                <View style={styles.uploaderAvatar}>
                  <Text style={styles.uploaderAvatarText}>{doc.uploadedByInitials}</Text>
                </View>
                <View>
                  <Text style={styles.uploaderText}>Uploaded by {doc.uploadedBy}</Text>
                  <Text style={styles.uploadDate}>{doc.uploadDate}</Text>
                </View>
              </View>
              <View style={styles.documentActions}>
                <Pressable style={styles.downloadButton}>
                  <Ionicons name="download-outline" size={18} color="#2563EB" />
                  <Text style={styles.downloadButtonText}>Download</Text>
                </Pressable>
                <Pressable style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Upload Document Modal */}
      <Modal
        visible={showUploadModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowUploadModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Upload Document</Text>
                <Text style={styles.modalSubtitle}>Add a new document to your project</Text>
              </View>
              <Pressable 
                onPress={() => setShowUploadModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Project Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Project</Text>
              <Pressable 
                style={styles.modalDropdown}
                onPress={() => setShowProjectDropdown(!showProjectDropdown)}
              >
                <Text style={styles.modalDropdownText}>{selectedProjectForUpload}</Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </Pressable>
              {showProjectDropdown && (
                <View style={styles.dropdownList}>
                  {projects.map((project) => (
                    <Pressable
                      key={project}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedProjectForUpload(project);
                        setShowProjectDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{project}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* File Upload Area */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>File</Text>
              <Pressable style={styles.uploadArea}>
                <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
                <Text style={styles.uploadAreaText}>Click to upload or drag and drop</Text>
              </Pressable>
            </View>

            {/* Document Name Input */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Document Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Document name"
                placeholderTextColor="#9CA3AF"
                value={documentName}
                onChangeText={setDocumentName}
              />
            </View>

            {/* Upload Button */}
            <Pressable style={styles.modalUploadButton} onPress={handleUpload}>
              <Text style={styles.modalUploadButtonText}>Upload Document</Text>
            </Pressable>
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
  uploadButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#111827',
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
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 13,
    color: '#6B7280',
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  documentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  projectTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  projectTagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  uploaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  uploaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploaderAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  uploaderText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  uploadDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  modalDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'relative',
  },
  modalDropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadAreaText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
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
  modalUploadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalUploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

