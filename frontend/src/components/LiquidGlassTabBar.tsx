import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

type TabRoute = 'Discover' | 'Wishlist' | 'Blend' | 'Profile';

const tabConfig: Record<TabRoute, { 
  active: keyof typeof Ionicons.glyphMap; 
  inactive: keyof typeof Ionicons.glyphMap;
  label: string;
}> = {
  Discover: { active: 'compass', inactive: 'compass-outline', label: 'Discover' },
  Wishlist: { active: 'heart', inactive: 'heart-outline', label: 'Wishlist' },
  Blend: { active: 'people', inactive: 'people-outline', label: 'Blend' },
  Profile: { active: 'person', inactive: 'person-outline', label: 'Profile' },
};

// Check if liquid glass is available (iOS 26+)
const liquidGlassAvailable = isLiquidGlassAvailable();

export default function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const TabContent = () => (
    <View style={styles.tabsContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const routeName = route.name as TabRoute;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const config = tabConfig[routeName];
        const iconName = isFocused ? config.active : config.inactive;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={[styles.tabContent, isFocused && styles.tabContentActive]}>
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? colors.tabActive : colors.tabInactive}
              />
              <Text style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive
              ]}>
                {config.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {liquidGlassAvailable ? (
        // Use Apple's liquid glass effect on iOS 26+
        <GlassView 
          style={styles.glassView}
          glassEffectStyle="regular"
          isInteractive={false}
          tintColor="rgba(80, 80, 80, 0.15)"
        >
          <TabContent />
        </GlassView>
      ) : (
        // Fallback for older iOS and Android
        <View style={styles.fallbackContainer}>
          <TabContent />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  glassView: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  fallbackContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(240, 240, 245, 0.92)',
    // Shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  tabContentActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.tabInactive,
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.tabActive,
    fontWeight: '600',
  },
});
