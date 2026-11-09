export type GarmentCategory = 
  | 'Tops' 
  | 'Bottoms' 
  | 'Dresses' 
  | 'Outerwear' 
  | 'Shoes' 
  | 'Accessories';

export interface ClothingItem {
  id: string;
  name: string;
  category: GarmentCategory;
  photoUrl: string;
  colorName: string;
  colorHex: string;
  dateAdded: string;
  isFavorite?: boolean;
  isAnalyzing?: boolean;
}

export interface SavedOutfit {
  id: string;
  title: string;
  vibe: string;
  date: string;
  items: ClothingItem[];
  aestheticNotes: string;
  accentColor: string;
  isFavorite?: boolean;
}

export type MainSection = 'wardrobe' | 'generate' | 'saved';
