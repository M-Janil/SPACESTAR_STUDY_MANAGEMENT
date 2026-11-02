export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlaceStatus = 'pending' | 'verified';
export type PostSource = 'live' | 'gallery';

export interface Profile {
  id: string;
  username: string;
  name: string;
  email: string;
  dob: string | null;
  interests: string[];
  avatar_url: string | null;
  bio: string | null;
  is_admin?: boolean;
  created_at: string;
}

export type PlaceType = 'attraction' | 'stay' | 'food' | 'other';

export interface PlaceImageDetail {
  url: string;
  source: 'live' | 'gallery';
  captured_at: string;
}

export interface Place {
  id: string;
  name: string;
  bio: string | null;
  category: string | null;
  vibes: string[];
  city: string | null;
  state: string | null;
  country: string | null;
  continent: string | null;
  lat: number;
  lng: number;
  cover_image_url: string | null;
  images: string[];
  guide_text: string | null;
  guide_updated_at: string | null;
  status: PlaceStatus;
  created_by: string | null;
  created_at: string;
  place_type?: PlaceType;
  contact_phone?: string | null;
  price_info?: string | null;
  amenities?: string[] | null;
  cuisine?: string | null;
  opening_hours?: string | null;
  image_details?: PlaceImageDetail[] | null;
  entry_fee?: string | null;
  best_time_to_visit?: string | null;
}

export interface Post {
  id: string;
  place_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  vibe: string | null;
  extra_info: Json;
  source: PostSource;
  captured_at: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  place_id: string | null;
  post_id: string | null;
  created_at: string;
}

export interface SavedPlace {
  user_id: string;
  place_id: string;
  created_at: string;
}

export interface LoginAttempt {
  username: string;
  failed_count: number;
  locked_until: string | null;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PlaceConfirmation {
  id: string;
  place_id: string;
  user_id: string;
  created_at: string;
}

export type VehicleType = 'bike' | 'scooter' | 'car' | 'cycle';

export interface Rental {
  id: string;
  user_id: string | null;
  place_id: string | null;
  city: string;
  vehicle_type: VehicleType;
  title: string;
  description: string | null;
  price_per_day: number;
  contact_phone: string;
  image_url: string | null;
  images?: string[];
  registration_number?: string | null;
  insurance_expiry?: string | null;
  puc_expiry?: string | null;
  fitness_expiry?: string | null;
  plate_photo_url?: string | null;
  rc_doc_path?: string | null;
  insurance_doc_path?: string | null;
  puc_doc_path?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  available: boolean;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string; name: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      places: {
        Row: Place;
        Insert: Partial<Place> & { name: string; lat: number; lng: number };
        Update: Partial<Place>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: Partial<Post> & { place_id: string; user_id: string; image_url: string };
        Update: Partial<Post>;
        Relationships: [];
      };
      likes: {
        Row: Like;
        Insert: Partial<Like> & { user_id: string };
        Update: Partial<Like>;
        Relationships: [];
      };
      saved_places: {
        Row: SavedPlace;
        Insert: SavedPlace;
        Update: Partial<SavedPlace>;
        Relationships: [];
      };
      login_attempts: {
        Row: LoginAttempt;
        Insert: Partial<LoginAttempt> & { username: string };
        Update: Partial<LoginAttempt>;
        Relationships: [];
      };
      follows: {
        Row: Follow;
        Insert: Follow;
        Update: Partial<Follow>;
        Relationships: [];
      };
      place_confirmations: {
        Row: PlaceConfirmation;
        Insert: Partial<PlaceConfirmation> & { place_id: string; user_id: string };
        Update: Partial<PlaceConfirmation>;
        Relationships: [];
      };
      rentals: {
        Row: Rental;
        Insert: Partial<Rental> & { city: string; vehicle_type: VehicleType; title: string; price_per_day: number; contact_phone: string };
        Update: Partial<Rental>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
