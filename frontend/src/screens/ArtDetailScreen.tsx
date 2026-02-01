import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';

type ArtDetailRouteProp = RouteProp<RootStackParamList, 'ArtDetail'>;
type ArtDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ArtDetail'>;

export default function ArtDetailScreen() {
  const navigation = useNavigation<ArtDetailNavigationProp>();
  const route = useRoute<ArtDetailRouteProp>();
  const { artwork } = route.params;

  const [isWishlisted, setIsWishlisted] = useState(artwork.isWishlisted);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleTryNow = () => {
    console.log('Try AR preview');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.8} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleWishlist} activeOpacity={0.8} style={styles.headerButton}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color={isWishlisted ? colors.primary : colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Artwork Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: artwork.imageUrl }}
            style={styles.artworkImage}
            resizeMode="contain"
          />
        </View>

        {/* Artwork Details */}
        <View style={styles.detailsContainer}>
          {/* Title & Category */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{artwork.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{artwork.category}</Text>
            </View>
          </View>

          {/* Artist */}
          <Text style={styles.artist}>{artwork.artist}</Text>

          {/* Description */}
          <Text style={styles.description}>{artwork.description}</Text>

          {/* Primary CTA */}
          <TouchableOpacity
            onPress={handleTryNow}
            activeOpacity={0.9}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Try it now</Text>
          </TouchableOpacity>

          {/* Secondary CTA */}
          <TouchableOpacity
            onPress={toggleWishlist}
            activeOpacity={0.9}
            style={styles.secondaryButton}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? colors.primary : colors.black}
            />
            <Text style={[styles.secondaryButtonText, isWishlisted && styles.secondaryButtonTextActive]}>
              {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </Text>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: colors.gray[50],
  },
  artworkImage: {
    width: '100%',
    aspectRatio: 1,
  },
  detailsContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    color: colors.black,
    fontWeight: '600',
    marginRight: 16,
  },
  categoryBadge: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: colors.black,
  },
  artist: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: colors.black,
  },
  secondaryButtonTextActive: {
    color: colors.primary,
  },
});
