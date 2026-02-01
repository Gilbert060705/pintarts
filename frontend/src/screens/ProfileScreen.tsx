import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar & Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.gray[500]} />
          </View>
          <Text style={styles.userName}>Art Collector</Text>
          <Text style={styles.userEmail}>collector@pintarts.com</Text>
        </View>
       

        {/* Divider */}
        <View style={styles.divider} />

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          {[
            { icon: 'notifications-outline', label: 'Notifications' },
            { icon: 'shield-outline', label: 'Privacy' },
            { icon: 'help-circle-outline', label: 'Help & Support' },
            { icon: 'information-circle-outline', label: 'About' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              style={styles.menuItem}
            >
              <Ionicons name={item.icon as any} size={22} color={colors.gray[800]} />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity activeOpacity={0.8} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    color: colors.black,
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  preferencesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  preferencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  editText: {
    fontSize: 12,
    color: colors.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: 24,
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
    color: colors.black,
  },
  signOutSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  signOutText: {
    marginLeft: 16,
    fontSize: 14,
    color: colors.primary,
  },
});
