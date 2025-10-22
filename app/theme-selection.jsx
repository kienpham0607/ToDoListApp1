import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemeSelectionScreen() {
  const router = useRouter();
  const [themes, setThemes] = useState([
    { id: '1', name: 'Teal', color: '#029688', selected: true },
    { id: '2', name: 'Black', color: '#000000', selected: false },
    { id: '3', name: 'Red', color: '#F44336', selected: false },
    { id: '4', name: 'Blue', color: '#2196F3', selected: false },
  ]);

  const selectTheme = (themeId) => {
    setThemes(themes.map(theme => ({
      ...theme,
      selected: theme.id === themeId
    })));
  };

  const handleOpenApp = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Create to do list</Text>
        <Text style={styles.subtitle}>Choose your to do list color theme:</Text>

        <ScrollView style={styles.themeContainer} showsVerticalScrollIndicator={false}>
          {themes.map((theme) => (
            <Pressable 
              key={theme.id} 
              style={styles.themeCard}
              onPress={() => selectTheme(theme.id)}
            >
              <View style={[styles.themeColorBar, { backgroundColor: theme.color }]} />
              <View style={styles.themeContent}>
                <View style={styles.themePreview}>
                  <View style={styles.themePreviewIcon} />
                  <View style={styles.themePreviewLines}>
                    <View style={styles.themePreviewLine} />
                    <View style={styles.themePreviewLine} />
                    <View style={styles.themePreviewLine} />
                  </View>
                </View>
                {theme.selected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.openAppButton} onPress={handleOpenApp}>
            <Text style={styles.openAppButtonText}>Open Todyapp</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  themeContainer: {
    flex: 1,
  },
  themeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  themeColorBar: {
    height: 8,
    width: '100%',
  },
  themeContent: {
    padding: 16,
    position: 'relative',
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themePreviewIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  themePreviewLines: {
    flex: 1,
    gap: 4,
  },
  themePreviewLine: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#029688',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  openAppButton: {
    backgroundColor: '#029688',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  openAppButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
