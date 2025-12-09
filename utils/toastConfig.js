import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Custom Toast configuration for the app
 * Provides beautiful, modern toast notifications with icons
 */
export const toastConfig = {
  success: ({ text1, text2, ...props }) => (
    <View style={[styles.toastContainer, styles.successContainer]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconWrapper, styles.successIconWrapper]}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),

  error: ({ text1, text2, ...props }) => (
    <View style={[styles.toastContainer, styles.errorContainer, styles.errorToast]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconWrapper, styles.errorIconWrapper]}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, styles.errorText1]}>{text1 || 'Đã xảy ra lỗi'}</Text>
        {text2 && <Text style={[styles.text2, styles.errorText2]}>{text2}</Text>}
      </View>
    </View>
  ),

  info: ({ text1, text2, ...props }) => (
    <View style={[styles.toastContainer, styles.infoContainer]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconWrapper, styles.infoIconWrapper]}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 70,
    maxWidth: '85%',
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderLeftWidth: 4,
  },
  successContainer: {
    borderLeftColor: '#10B981',
  },
  errorContainer: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorToast: {
    zIndex: 99999,
    elevation: 50,
  },
  infoContainer: {
    borderLeftColor: '#3B82F6',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconWrapper: {
    backgroundColor: '#D1FAE5',
  },
  errorIconWrapper: {
    backgroundColor: '#FEE2E2',
  },
  infoIconWrapper: {
    backgroundColor: '#DBEAFE',
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },
  errorText1: {
    color: '#991B1B',
    fontWeight: '700',
  },
  errorText2: {
    color: '#7F1D1D',
    fontWeight: '500',
  },
});

