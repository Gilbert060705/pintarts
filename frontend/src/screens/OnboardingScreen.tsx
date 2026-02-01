import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ArtStyle } from '../types/navigation';
import { artStyles } from '../data/mockData';
import { colors } from '../styles';
import { authService } from '../api/auth';
import { userStorage } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

type Step = 'account' | 'preferences';

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('account');
  
  // Account fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences
  const [selectedStyles, setSelectedStyles] = useState<ArtStyle[]>([]);
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStyle = (style: ArtStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const validateAccountStep = (): boolean => {
    if (!username.trim()) {
      setError('Please enter a username');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Please enter a password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (validateAccountStep()) {
      setCurrentStep('preferences');
    }
  };

  const handleBack = () => {
    if (currentStep === 'preferences') {
      setCurrentStep('account');
    } else {
      navigation.goBack();
    }
  };

  const handleSignUp = async () => {
    if (selectedStyles.length === 0) {
      setError('Please select at least one art style');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Register the user
      await authService.register({
        username: username.trim(),
        email: email.trim(),
        password: password,
        preferences: selectedStyles,
      });

      // Step 2: Auto-login after successful registration
      const loginResponse = await authService.login({
        username: username.trim(),
        password: password,
      });

      if (loginResponse.success) {
        // Save user data
        await userStorage.saveUserId(loginResponse.user_id);
        await userStorage.saveUserData({
          userId: loginResponse.user_id,
          username: username.trim(),
        });

        // Navigate to main app
        navigation.replace('MainApp', { screen: 'Discover' });
      } else {
        // Registration succeeded but login failed - go to login page
        Alert.alert(
          'Account Created!',
          'Your account has been created. Please log in.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        setError('Username or email already exists');
      } else if (errorMessage.includes('Network')) {
        setError('Unable to connect. Please check your internet connection.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSelected = (style: ArtStyle) => selectedStyles.includes(style);

  // Render Account Step
  if (currentStep === 'account') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.accountContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.accountHeader}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.accountTitle}>Create your account</Text>
            <Text style={styles.accountSubtitle}>Join PINTARTS to discover art that fits you</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError(null);
              }}
              placeholder="Choose a username"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              placeholder="Enter your email"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              placeholder="Create a password"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainerLarge}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError(null);
              }}
              placeholder="Confirm your password"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNextStep}
            activeOpacity={0.9}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} style={styles.buttonIcon} />
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Render Preferences Step
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Back Button */}
      <View style={styles.prefsHeader}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 2 of 2</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.prefsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}>What kind of art speaks to you?</Text>
          <Text style={styles.headerSubtext}>Select at least one style</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainerPrefs}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSignUp}
          activeOpacity={0.9}
          style={[
            styles.primaryButton,
            (selectedStyles.length === 0 || isLoading) && styles.buttonDisabled,
          ]}
          disabled={selectedStyles.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
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
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  accountContent: {
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 40,
  },
  accountHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 140,
    height: 32,
    marginBottom: 24,
  },
  accountTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  accountSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(172, 50, 45, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainerPrefs: {
    backgroundColor: 'rgba(172, 50, 45, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  errorText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainerLarge: {
    marginBottom: 32,
  },
  label: {
    color: colors.black,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
    paddingVertical: 12,
    fontSize: 14,
    color: colors.black,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(172, 50, 45, 0.4)',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: colors.gray[500],
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
  },
  stepIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 22,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 8,
  },
  headerSubtext: {
    fontSize: 14,
    color: colors.gray[500],
  },
  prefsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  prefsScrollContent: {
    paddingBottom: 120,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
});
