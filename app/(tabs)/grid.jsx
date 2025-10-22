import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FilterLabelsScreen() {
  const filterItems = [
    { icon: 'funnel', title: 'Assigned to me', count: null },
    { icon: '💥', title: 'Priority 1', count: 1 },
    { icon: '👌', title: 'Priority 3', count: 1 },
    { icon: 'settings', title: 'Manage Filter', count: null },
  ];

  const labelItems = [
    { icon: 'pricetag', title: 'Masana label', count: null },
    { icon: 'settings', title: 'Manage labels', count: null },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chevron-back" size={20} color="#333" />
        </View>
        <Text style={styles.headerTitle}>Filter & Labels</Text>
        <View style={styles.headerRight}>
          <Ionicons name="search" size={20} color="#333" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Filter your task</Text>
            <Pressable style={styles.addButton}>
              <Ionicons name="add" size={20} color="#029688" />
            </Pressable>
          </View>
          
          <View style={styles.itemsList}>
            {filterItems.map((item, index) => (
              <Pressable key={index} style={styles.listItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemIcon}>
                    {item.icon === '💥' || item.icon === '👌' ? (
                      <Text style={styles.emojiIcon}>{item.icon}</Text>
                    ) : (
                      <Ionicons name={item.icon} size={20} color="#666" />
                    )}
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                {item.count !== null && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Labels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Labels</Text>
            <Pressable style={styles.addButton}>
              <Ionicons name="add" size={20} color="#029688" />
            </Pressable>
          </View>
          
          <View style={styles.itemsList}>
            {labelItems.map((item, index) => (
              <Pressable key={index} style={styles.listItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemIcon}>
                    <Ionicons name={item.icon} size={20} color="#666" />
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                {item.count !== null && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emojiIcon: {
    fontSize: 20,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
