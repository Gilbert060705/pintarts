import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';
import { Artwork } from '../types/navigation';
import { wishlistService } from '../api';
import { userStorage } from '../utils/storage';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

interface BlendResultsSheetProps {
  visible: boolean;
  onClose: () => void;
  artworks: Artwork[];
  partnerName: string;
  onArtworkPress: (artwork: Artwork) => void;
}

export default function BlendResultsSheet({
  visible,
  onClose,
  artworks,
  partnerName,
  onArtworkPress,
}: BlendResultsSheetProps) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  
  // Local state for artworks (to handle wishlist updates)
  const [localArtworks, setLocalArtworks] = useState<Artwork[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID on mount
  useEffect(() => {
    const loadUserId = async () => {
      const id = await userStorage.getUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  // Sync local artworks with props
  useEffect(() => {
    setLocalArtworks(artworks);
  }, [artworks]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(async (artwork: Artwork) => {
    if (!userId) return;
    
    // Add to loading set
    setLoadingWishlist(prev => new Set(prev).add(artwork.id));
    
    // Optimistic update
    setLocalArtworks(prev =>
      prev.map(a =>
        a.id === artwork.id ? { ...a, isWishlisted: !a.isWishlisted } : a
      )
    );

    try {
      const response = await wishlistService.toggleWishlist(userId, artwork.id);
      // Update with actual server response
      setLocalArtworks(prev =>
        prev.map(a =>
          a.id === artwork.id ? { ...a, isWishlisted: response.is_wishlisted } : a
        )
      );
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      // Revert optimistic update on error
      setLocalArtworks(prev =>
        prev.map(a =>
          a.id === artwork.id ? { ...a, isWishlisted: artwork.isWishlisted } : a
        )
      );
    } finally {
      setLoadingWishlist(prev => {
        const next = new Set(prev);
        next.delete(artwork.id);
        return next;
      });
    }
  }, [userId]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      >
        <Animated.View
          style={[
            styles.backdropInner,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.blendIcon}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>Blend with {partnerName}</Text>
              <Text style={styles.subtitle}>
                {localArtworks.length} artwork{localArtworks.length !== 1 ? 's' : ''} you'll both love
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>

        {/* Artworks Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {localArtworks.map((artwork) => (
            <TouchableOpacity
              key={artwork.id}
              onPress={() => onArtworkPress(artwork)}
              activeOpacity={0.9}
              style={[styles.card, { width: CARD_WIDTH }]}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: artwork.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.wishlistButton} 
                  activeOpacity={0.8}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleWishlistToggle(artwork);
                  }}
                  disabled={loadingWishlist.has(artwork.id)}
                >
                  {loadingWishlist.has(artwork.id) ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name={artwork.isWishlisted ? 'heart' : 'heart-outline'}
                      size={16}
                      color={artwork.isWishlisted ? colors.primary : colors.black}
                    />
                  )}
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
          
          {/* Empty State */}
          {localArtworks.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No recommendations found</Text>
              <Text style={styles.emptySubtext}>
                Try blending with a different friend
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  blendIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(172, 50, 45, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray[50],
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 11,
    color: colors.black,
    fontWeight: '500',
  },
  cardArtist: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[500],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.gray[400],
    marginTop: 4,
    textAlign: 'center',
  },
});
