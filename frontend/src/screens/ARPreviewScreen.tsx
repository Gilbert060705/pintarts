import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { colors } from '../styles';

type ARPreviewRouteProp = RouteProp<RootStackParamList, 'ARPreview'>;
type ARPreviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ARPreview'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_IMAGE_SIZE = SCREEN_WIDTH * 0.6;

export default function ARPreviewScreen() {
  const navigation = useNavigation<ARPreviewNavigationProp>();
  const route = useRoute<ARPreviewRouteProp>();
  const { artwork } = route.params;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [cameraPhotoUri, setCameraPhotoUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const compositeRef = useRef<View>(null);

  // Store current position values for the composite
  const [artworkPosition, setArtworkPosition] = useState({ x: 0, y: 0, scale: 1 });

  // Gesture values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const updatePosition = (x: number, y: number, s: number) => {
    setArtworkPosition({ x, y, scale: s });
  };

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(updatePosition)(translateX.value, translateY.value, scale.value);
    });

  // Pinch gesture for scaling
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.3, Math.min(3, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(updatePosition)(translateX.value, translateY.value, scale.value);
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Animated style for the artwork
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    setIsCapturing(true);
    
    try {
      // Step 1: Take photo from camera
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setCameraPhotoUri(photo.uri);
        setShowPreview(true);
        
        // Step 2: Wait a frame for the UI to update, then capture composite
        setTimeout(async () => {
          if (compositeRef.current) {
            const uri = await captureRef(compositeRef, {
              format: 'jpg',
              quality: 0.9,
            });
            setCapturedUri(uri);
          }
          setIsCapturing(false);
        }, 100);
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
      setIsCapturing(false);
    }
  };

  const handleSave = async () => {
    if (!capturedUri) return;

    if (!mediaPermission?.granted) {
      const result = await requestMediaPermission();
      if (!result.granted) {
        Alert.alert('Permission needed', 'Please grant media library access to save photos');
        return;
      }
    }

    try {
      await MediaLibrary.saveToLibraryAsync(capturedUri);
      Alert.alert('Saved!', 'Photo saved to your gallery');
      handleRetry();
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo');
    }
  };

  const handleRetry = () => {
    setShowPreview(false);
    setCapturedUri(null);
    setCameraPhotoUri(null);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  // Request camera permission if not granted
  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Loading...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={64} color={colors.white} />
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionText}>
            We need camera access to show how this artwork looks on your wall
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show preview with saved photo
  if (showPreview && capturedUri) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Image source={{ uri: capturedUri }} style={styles.capturedImage} />
        
        {/* Overlay controls */}
        <View style={styles.capturedControls}>
          <TouchableOpacity style={styles.capturedButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={28} color={colors.white} />
            <Text style={styles.capturedButtonText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="download-outline" size={28} color={colors.white} />
            <Text style={styles.capturedButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hidden composite view for capturing */}
      {showPreview && cameraPhotoUri && !capturedUri && (
        <View 
          ref={compositeRef}
          style={styles.hiddenComposite}
          collapsable={false}
        >
          <Image 
            source={{ uri: cameraPhotoUri }} 
            style={styles.compositeBackground}
            resizeMode="cover"
          />
          <View style={styles.compositeOverlay}>
            <View style={[
              styles.compositeArtwork,
              {
                transform: [
                  { translateX: artworkPosition.x },
                  { translateY: artworkPosition.y },
                  { scale: artworkPosition.scale },
                ],
              }
            ]}>
              <Image
                source={{ uri: artwork.imageUrl }}
                style={styles.artworkImage}
                resizeMode="contain"
              />

            </View>
          </View>
        </View>
      )}
      
      {/* Camera view */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      
      {/* Artwork overlay with gestures */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.artworkContainer, animatedImageStyle]}>
            <Image
              source={{ uri: artwork.imageUrl }}
              style={styles.artworkImage}
              resizeMode="contain"
            />

          </Animated.View>
        </GestureDetector>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Drag to move • Pinch to resize
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]} 
          onPress={handleCapture}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <View style={styles.placeholder} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    width: INITIAL_IMAGE_SIZE,
    height: INITIAL_IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  capturedImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  capturedControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  capturedButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedButtonText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  // Hidden composite for capturing
  hiddenComposite: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: -1,
  },
  compositeBackground: {
    width: '100%',
    height: '100%',
  },
  compositeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compositeArtwork: {
    width: INITIAL_IMAGE_SIZE,
    height: INITIAL_IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
