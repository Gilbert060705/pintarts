import React from 'react';
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

type DiscoverNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

export default function DiscoverScreen() {
  const navigation = useNavigation<DiscoverNavigationProp>();

  const handleArtworkPress = (artwork: Artwork) => {
    navigation.navigate('ArtDetail', { artwork });
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
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discover</Text>
          <Text style={styles.sectionSubtitle}>Curated for your taste</Text>
        </View>

        {/* Artwork Grid */}
        <View style={styles.grid}>
          {mockArtworks.map((artwork) => (
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
    paddingBottom: 16,
  },
  logo: {
    width: 120,
    height: 28,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 4,
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
});
