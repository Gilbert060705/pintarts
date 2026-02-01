import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Artwork } from '../types/navigation';
import { mockArtworks } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';
import SearchBottomSheet from '../components/SearchBottomSheet';

type DiscoverNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNavigationProp>();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);

  const handleArtworkPress = (artwork: Artwork) => {
    navigation.navigate('ArtDetail', { artwork });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Reset to default recommendations
      setArtworks(mockArtworks);
      return;
    }

    // TODO: Call backend search API
    // For now, filter mock data as a placeholder
    console.log('🔍 Searching for:', query);
    
    // Simulated search - filter by title or artist
    const filtered = mockArtworks.filter(
      (art) =>
        art.title.toLowerCase().includes(query.toLowerCase()) ||
        art.artist.toLowerCase().includes(query.toLowerCase()) ||
        art.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setArtworks(filtered.length > 0 ? filtered : mockArtworks);
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

        {/* Artwork Grid */}
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
                
                <TouchableOpacity style={styles.wishlistButton} activeOpacity={0.8}>
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

        {/* Empty State */}
        {artworks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="image-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No artworks found</Text>
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.emptyStateLink}>Clear search</Text>
            </TouchableOpacity>
          </View>
        )}
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
