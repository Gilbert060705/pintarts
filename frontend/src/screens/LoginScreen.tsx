import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../styles';
import { authService } from '../api/auth';
import { userStorage } from '../utils/storage';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Clear previous error
    setError(null);

    // Validate inputs
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        username: username.trim(),
        password: password.trim(),
      });

      if (response.success) {
        // Save user ID to storage
        await userStorage.saveUserId(response.user_id);
        await userStorage.saveUserData({
          userId: response.user_id,
          username: username.trim(),
        });

        // Navigate to main app
        navigation.replace('MainApp', { screen: 'Discover' });
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Handle specific error cases
      if (errorMessage.includes('Invalid username or password')) {
        setError('Invalid username or password');
      } else if (errorMessage.includes('Network')) {
        setError('Unable to connect. Please check your internet connection.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    // For now, go to onboarding for registration
    navigation.navigate('Onboarding');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Discover art that fits you</Text>

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
            placeholder="Enter your username"
            placeholderTextColor={colors.gray[400]}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainerLarge}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            placeholder="Enter your password"
            placeholderTextColor={colors.gray[400]}
            secureTextEntry
            style={styles.input}
            editable={!isLoading}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.9}
          style={[styles.button, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 40,
  },
  tagline: {
    color: colors.gray[500],
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: 'rgba(172, 50, 45, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
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
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    color: colors.gray[500],
    fontSize: 14,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
