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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Artwork } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';
import { wishlistService, Painting } from '../api';
import { userStorage } from '../utils/storage';

type WishlistNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Convert API Painting to Artwork
const paintingToArtwork = (painting: Painting): Artwork => ({
  id: painting.id,
  title: painting.title,
  artist: painting.artist || 'Unknown Artist',
  imageUrl: painting.image_url,
  category: painting.style || 'Art',
  description: painting.description || '',
  isWishlisted: true, // It's in wishlist, so always true
});

export default function WishlistScreen() {
  const navigation = useNavigation<WishlistNavigationProp>();
  const [wishlistedArtworks, setWishlistedArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  // Fetch wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const paintings = await wishlistService.getWishlist(userId);
      const converted = paintings.map(paintingToArtwork);
      setWishlistedArtworks(converted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wishlist';
      console.error('Failed to fetch wishlist:', err);
      // Empty wishlist is not an error
      if (!message.includes('No paintings')) {
        setError(message);
      }
      setWishlistedArtworks([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  // Fetch on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId, fetchWishlist]);

  // Refetch when screen comes into focus (to catch new wishlists from discover)
  useFocusEffect(
    useCallback(() => {
      if (userId && !isLoading) {
        fetchWishlist();
      }
    }, [userId, isLoading, fetchWishlist])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWishlist();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
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
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="person-outline" size={40} color={colors.gray[400]} />
          </View>
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptySubtitle}>
            Log in to see your saved artworks
          </Text>
        </View>
      );
    }

    if (wishlistedArtworks.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={40} color={colors.gray[400]} />
          </View>
          <Text style={styles.emptyTitle}>No artworks saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any artwork to save it here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.list}>
        {wishlistedArtworks.map((artwork) => (
          <TouchableOpacity
            key={artwork.id}
            onPress={() => navigation.navigate('ArtDetail', { artwork })}
            activeOpacity={0.9}
            style={styles.listItem}
          >
            <Image
              source={{ uri: artwork.imageUrl }}
              style={styles.listItemImage}
              resizeMode="cover"
            />
            <View style={styles.listItemInfo}>
              <Text style={styles.listItemTitle} numberOfLines={1}>
                {artwork.title}
              </Text>
              <Text style={styles.listItemArtist} numberOfLines={1}>
                {artwork.artist}
              </Text>
              <View style={styles.savedBadge}>
                <Ionicons name="heart" size={14} color={colors.primary} />
                <Text style={styles.savedText}>Saved</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
          (wishlistedArtworks.length === 0 || isLoading || error) && styles.scrollContentCenter,
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
          <Text style={styles.headerTitle}>Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {isLoading ? 'Loading...' : `${wishlistedArtworks.length} saved artworks`}
          </Text>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.gray[100],
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: 8,
  },
  list: {
    paddingHorizontal: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItemImage: {
    width: 96,
    height: 96,
  },
  listItemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  listItemTitle: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
  listItemArtist: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  savedText: {
    fontSize: 10,
    color: colors.primary,
    marginLeft: 4,
  },
});
