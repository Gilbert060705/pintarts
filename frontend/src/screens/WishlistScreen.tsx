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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { mockArtworks } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';

type WishlistNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WishlistScreen() {
  const navigation = useNavigation<WishlistNavigationProp>();
  const wishlistedArtworks = mockArtworks.filter((a) => a.isWishlisted);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          wishlistedArtworks.length === 0 && styles.scrollContentCenter,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {wishlistedArtworks.length} saved artworks
          </Text>
        </View>

        {wishlistedArtworks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={40} color={colors.gray[400]} />
            </View>
            <Text style={styles.emptyTitle}>No artworks saved yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any artwork to save it here
            </Text>
          </View>
        ) : (
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
        )}
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
