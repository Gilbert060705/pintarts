import { NavigatorScreenParams } from '@react-navigation/native';

// Art style type for onboarding
export type ArtStyle = 
  | 'Abstract'
  | 'Modern'
  | 'Minimalist'
  | 'Photography'
  | 'Sculpture'
  | 'Traditional'
  | 'Digital'
  | 'Contemporary';

// Artwork type
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  imageUrl: string;
  category: ArtStyle;
  isWishlisted: boolean;
  aiLabel?: string;
}

// Stack Navigator types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Onboarding: undefined;
  MainApp: NavigatorScreenParams<MainTabParamList>;
  ArtDetail: { artwork: Artwork };
  ARPreview: { artwork: Artwork };
};

// Bottom Tab Navigator types
export type MainTabParamList = {
  Discover: undefined;
  Wishlist: undefined;
  Blend: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
