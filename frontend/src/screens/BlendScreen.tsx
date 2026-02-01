import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';

const mockFriends = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    matchScore: 85,
  },
  {
    id: '2',
    name: 'Michael Lee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    matchScore: 72,
  },
  {
    id: '3',
    name: 'Emma Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    matchScore: 68,
  },
];

export default function BlendScreen() {
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
          <Text style={styles.headerTitle}>Art Blend</Text>
          <Text style={styles.headerSubtitle}>Discover art with friends</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionBox}>
            <View style={styles.descriptionIcon}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <Text style={styles.descriptionLabel}>AI Match</Text>
            <Text style={styles.descriptionText}>
              Select a friend to generate combined art recommendations based on both your preferences.
            </Text>
          </View>
        </View>

        {/* Friends List */}
        <View style={styles.friendsSection}>
          <Text style={styles.friendsTitle}>Your Friends</Text>
          
          {mockFriends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              activeOpacity={0.8}
              style={styles.friendItem}
            >
              <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <View style={styles.matchRow}>
                  <Ionicons name="sparkles" size={12} color={colors.primary} />
                  <Text style={styles.matchText}>{friend.matchScore}% taste match</Text>
                </View>
              </View>
              <View style={styles.blendButton}>
                <Text style={styles.blendButtonText}>Blend</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity activeOpacity={0.8} style={styles.inviteButton}>
            <Ionicons name="person-add-outline" size={20} color={colors.gray[500]} />
            <Text style={styles.inviteText}>Invite more friends</Text>
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
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  descriptionBox: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 12,
  },
  descriptionIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(172, 50, 45, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 20,
  },
  friendsSection: {
    paddingHorizontal: 24,
  },
  friendsTitle: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  matchText: {
    fontSize: 10,
    color: colors.gray[500],
    marginLeft: 4,
  },
  blendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  blendButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
    borderRadius: 12,
  },
  inviteText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 8,
  },
});
