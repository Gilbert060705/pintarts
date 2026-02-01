import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Artwork } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';
import SearchBottomSheet from '../components/SearchBottomSheet';
import { recommendService, Painting, wishlistService } from '../api';
import { userStorage } from '../utils/storage';

type DiscoverNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

// Convert API Painting to our Artwork type
const paintingToArtwork = (painting: Painting): Artwork => ({
  id: painting.id,
  title: painting.title,
  artist: painting.artist || 'Unknown Artist',
  imageUrl: painting.image_url,
  category: painting.style || 'Art',
  description: painting.description || '',
  isWishlisted: painting.is_wishlisted,
});

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNavigationProp>();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
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

  // Fetch recommendations when userId is available
  const fetchRecommendations = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setError(null);
    
    try {
      const paintings = await recommendService.getRecommendations(userId);
      const converted = paintings.map(paintingToArtwork);
      setArtworks(converted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recommendations';
      console.error('Failed to fetch recommendations:', err);
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, fetchRecommendations]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      fetchRecommendations();
    }
  };

  const handleArtworkPress = (artwork: Artwork) => {
    navigation.navigate('ArtDetail', { artwork });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Reset to recommendations
      fetchRecommendations();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paintings = await recommendService.searchPaintings(query, userId || undefined);
      const converted = paintings.map(paintingToArtwork);
      setArtworks(converted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      console.error('Search failed:', err);
      
      // If no results found, show empty state instead of error
      if (message.includes('No paintings found')) {
        setArtworks([]);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleWishlist = async (artwork: Artwork) => {
    if (!userId) {
      console.log('User not logged in');
      return;
    }

    // Optimistic update - toggle immediately in UI
    setArtworks((prev) =>
      prev.map((art) =>
        art.id === artwork.id
          ? { ...art, isWishlisted: !art.isWishlisted }
          : art
      )
    );

    try {
      if (!artwork.isWishlisted) {
        // Add to wishlist
        await wishlistService.addToWishlist(userId, artwork.id);
        console.log('✅ Added to wishlist:', artwork.title);
      } else {
        // Remove from wishlist
        await wishlistService.removeFromWishlist(userId, artwork.id);
        console.log('🗑️ Removed from wishlist:', artwork.title);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Revert optimistic update on error
      setArtworks((prev) =>
        prev.map((art) =>
          art.id === artwork.id
            ? { ...art, isWishlisted: artwork.isWishlisted }
            : art
        )
      );
    }
  };

  const getSectionTitle = () => {
    if (searchQuery) {
      return `Results for "${searchQuery}"`;
    }
    return 'Discover';
  };

  const getSectionSubtitle = () => {
    if (searchQuery) {
      return `${artworks.length} artwork${artworks.length !== 1 ? 's' : ''} found`;
    }
    return 'Curated for your taste';
  };

  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
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
          <Text style={styles.errorText}>Please log in to see recommendations</Text>
        </View>
      );
    }

    if (artworks.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="image-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No artworks found' : 'No recommendations yet'}
          </Text>
          {searchQuery && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.emptyStateLink}>Clear search</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.grid}>
        {artworks.map((artwork) => (
          <TouchableOpacity
            key={artwork.id}
            onPress={() => handleArtworkPress(artwork)}
            activeOpacity={0.9}
            style={[styles.card, { width: CARD_WIDTH }]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: artwork.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              
              {artwork.aiLabel && (
                <View style={styles.aiLabel}>
                  <Text style={styles.aiLabelText}>{artwork.aiLabel}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.wishlistButton} 
                activeOpacity={0.8}
                onPress={() => handleToggleWishlist(artwork)}
              >
                <Ionicons
                  name={artwork.isWishlisted ? 'heart' : 'heart-outline'}
                  size={18}
                  color={artwork.isWishlisted ? colors.primary : colors.black}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {artwork.title}
              </Text>
              <Text style={styles.cardArtist} numberOfLines={1}>
                {artwork.artist}
              </Text>
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
        contentContainerStyle={styles.scrollContent}
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
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setSearchVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>
            {searchQuery && (
              <TouchableOpacity 
                onPress={() => handleSearch('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
                <Text style={styles.clearSearchText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>{getSectionSubtitle()}</Text>
        </View>

        {/* Content */}
        {renderContent()}
      </ScrollView>

      {/* Search Bottom Sheet */}
      <SearchBottomSheet
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSearch={handleSearch}
        currentQuery={searchQuery}
      />
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
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
  },
  logo: {
    width: 120,
    height: 28,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 4,
    flex: 1,
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  clearSearchText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  grid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray[50],
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  aiLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiLabelText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '500',
  },
  cardArtist: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 12,
  },
  emptyStateLink: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
});
