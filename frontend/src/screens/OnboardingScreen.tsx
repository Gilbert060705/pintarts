import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ArtStyle } from '../types/navigation';
import { artStyles } from '../data/mockData';
import { colors } from '../styles';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [selectedStyles, setSelectedStyles] = useState<ArtStyle[]>([]);

  const toggleStyle = (style: ArtStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const handleContinue = () => {
    navigation.replace('MainApp', { screen: 'Discover' });
  };

  const isSelected = (style: ArtStyle) => selectedStyles.includes(style);

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
          <Text style={styles.headerText}>What kind of art speaks to you?</Text>
        </View>

        {/* Art Style Grid */}
        <View style={styles.grid}>
          {artStyles.map((style) => (
            <TouchableOpacity
              key={style.id}
              onPress={() => toggleStyle(style.id)}
              activeOpacity={0.8}
              style={[
                styles.card,
                { width: CARD_WIDTH },
                isSelected(style.id) ? styles.cardSelected : styles.cardDefault,
              ]}
            >
              <View style={styles.cardImageContainer}>
                <Image
                  source={{ uri: style.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardOverlay} />
                
                <View style={styles.cardLabel}>
                  <Text style={styles.cardLabelText}>{style.label}</Text>
                </View>
                
                {isSelected(style.id) && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.9}
          style={[
            styles.button,
            selectedStyles.length === 0 && styles.buttonDisabled,
          ]}
          disabled={selectedStyles.length === 0}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  headerText: {
    fontSize: 22,
    color: colors.black,
    textAlign: 'center',
    fontWeight: '400',
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
    marginBottom: 12,
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardImageContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cardLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardLabelText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(172, 50, 45, 0.4)',
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
