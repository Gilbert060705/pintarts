import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 280;

interface SearchBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  currentQuery?: string;
}

export default function SearchBottomSheet({
  visible,
  onClose,
  onSearch,
  currentQuery = '',
}: SearchBottomSheetProps) {
  const [searchText, setSearchText] = useState(currentQuery);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      // Animate in
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
      ]).start(() => {
        // Focus input after animation
        inputRef.current?.focus();
      });
    } else {
      // Animate out
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

  useEffect(() => {
    setSearchText(currentQuery);
  }, [currentQuery]);

  const handleSearch = () => {
    Keyboard.dismiss();
    onSearch(searchText.trim());
    onClose();
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }) },
            ]}
          />
        </TouchableWithoutFeedback>

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
            <Text style={styles.title}>Search Artworks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color={colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Describe what you're looking for..."
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearInputButton}>
                <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          {/* Example Searches */}
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsLabel}>Try:</Text>
            {['sunset landscape', 'abstract blue', 'portrait'].map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => {
                  setSearchText(suggestion);
                  onSearch(suggestion);
                  onClose();
                }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {currentQuery && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.searchButton, !searchText.trim() && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!searchText.trim()}
            >
              <Ionicons name="search" size={18} color={colors.white} />
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.black,
  },
  clearInputButton: {
    padding: 4,
  },
  suggestions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: colors.gray[500],
    marginRight: 4,
  },
  suggestionChip: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonDisabled: {
    backgroundColor: 'rgba(172, 50, 45, 0.4)',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
});
