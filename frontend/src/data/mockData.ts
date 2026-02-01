import { Artwork, ArtStyle } from '../types/navigation';

export const artStyles: { id: ArtStyle; label: string; image: string }[] = [
  {
    id: 'Abstract',
    label: 'Abstract',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
  },
  {
    id: 'Modern',
    label: 'Modern',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop',
  },
  {
    id: 'Minimalist',
    label: 'Minimalist',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=400&fit=crop',
  },
  {
    id: 'Photography',
    label: 'Photography',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop',
  },
  {
    id: 'Sculpture',
    label: 'Sculpture',
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&h=400&fit=crop',
  },
  {
    id: 'Traditional',
    label: 'Traditional',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
  },
  {
    id: 'Digital',
    label: 'Digital',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
  },
  {
    id: 'Contemporary',
    label: 'Contemporary',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=400&fit=crop',
  },
];

export const mockArtworks: Artwork[] = [
  {
    id: '1',
    title: 'Ethereal Waves',
    artist: 'Maria Chen',
    description: 'A mesmerizing blend of colors that evoke the feeling of ocean waves at sunset.',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop',
    category: 'Abstract',
    isWishlisted: false,
    aiLabel: 'Recommended for you',
  },
  {
    id: '2',
    title: 'Urban Rhythm',
    artist: 'James Wright',
    description: 'A dynamic exploration of city life through bold geometric forms.',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1000&fit=crop',
    category: 'Modern',
    isWishlisted: false,
    aiLabel: 'Based on your taste',
  },
  {
    id: '3',
    title: 'Silent Bloom',
    artist: 'Sophie Laurent',
    description: 'Delicate floral study in the tradition of Dutch masters.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop',
    category: 'Traditional',
    isWishlisted: true,
  },
  {
    id: '4',
    title: 'Digital Dreams',
    artist: 'Alex Kim',
    description: 'A vibrant digital artwork exploring the boundaries of reality.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1000&fit=crop',
    category: 'Digital',
    isWishlisted: false,
    aiLabel: 'Recommended for you',
  },
  {
    id: '5',
    title: 'Quiet Reflection',
    artist: 'Emma Stone',
    description: 'Minimalist composition invoking peace and tranquility.',
    imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=1000&fit=crop',
    category: 'Minimalist',
    isWishlisted: false,
  },
  {
    id: '6',
    title: 'Captured Moments',
    artist: 'David Lee',
    description: 'A striking photograph capturing the essence of urban life.',
    imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=1000&fit=crop',
    category: 'Photography',
    isWishlisted: false,
    aiLabel: 'Based on your taste',
  },
];
