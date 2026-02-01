import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';
import { usersService, blendService, UserListItem } from '../api';
import { userStorage } from '../utils/storage';

export default function BlendScreen() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [creatingBlendWith, setCreatingBlendWith] = useState<string | null>(null);

  // Load user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const usersList = await usersService.getAllUsers(userId);
      setUsers(usersList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      console.error('Failed to fetch users:', err);
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  // Fetch on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId, fetchUsers]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleBlend = async (friendId: string, friendName: string) => {
    if (!userId) return;

    setCreatingBlendWith(friendId);

    try {
      const response = await blendService.createBlend(userId, friendId);
      Alert.alert(
        'Blend Created! 🎨',
        `Your art blend with ${friendName} is ready! Check your recommendations.`,
        [{ text: 'OK' }]
      );
      console.log('✅ Blend created:', response.blend_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create blend';
      Alert.alert('Error', message);
      console.error('Failed to create blend:', err);
    } finally {
      setCreatingBlendWith(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!userId) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="person-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>Please log in to see other users</Text>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>No other users found</Text>
          <Text style={styles.emptySubtext}>Invite friends to join PINTARTS!</Text>
        </View>
      );
    }

    return (
      <View style={styles.friendsSection}>
        <Text style={styles.friendsTitle}>Other Users</Text>
        
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            activeOpacity={0.8}
            style={styles.friendItem}
            onPress={() => handleBlend(user.id, user.username)}
            disabled={creatingBlendWith === user.id}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{user.username}</Text>
              {user.similarity !== undefined && user.similarity !== null && (
                <View style={styles.matchRow}>
                  <Ionicons name="sparkles" size={12} color={colors.primary} />
                  <Text style={styles.matchText}>
                    {Math.round(user.similarity * 100)}% taste match
                  </Text>
                </View>
              )}
            </View>
            <View style={[
              styles.blendButton,
              creatingBlendWith === user.id && styles.blendButtonDisabled
            ]}>
              {creatingBlendWith === user.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.blendButtonText}>Blend</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity activeOpacity={0.8} style={styles.inviteButton}>
          <Ionicons name="person-add-outline" size={20} color={colors.gray[500]} />
          <Text style={styles.inviteText}>Invite more friends</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          (isLoading || error || users.length === 0) && styles.scrollContentCenter,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
              Select a user to generate combined art recommendations based on both your preferences.
            </Text>
          </View>
        </View>

        {renderContent()}
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
  scrollContentCenter: {
    flexGrow: 1,
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 4,
    textAlign: 'center',
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
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
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
    minWidth: 60,
    alignItems: 'center',
  },
  blendButtonDisabled: {
    opacity: 0.7,
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
