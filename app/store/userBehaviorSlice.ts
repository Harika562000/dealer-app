import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CarView {
  carId: string;
  carMake: string;
  carModel: string;
  timestamp: number;
  duration: number; // in seconds
  price: number;
  fuelType: string;
}

export interface SearchQuery {
  id: string;
  query: string;
  filters: {
    make?: string;
    model?: string;
    priceRange?: { min: number; max: number };
    fuelType?: string;
    year?: number;
  };
  timestamp: number;
  resultsCount: number;
}

export interface WishlistAction {
  carId: string;
  action: 'add' | 'remove';
  timestamp: number;
  carMake: string;
  carModel: string;
  price: number;
}

export interface CompareAction {
  carIds: string[];
  timestamp: number;
  duration: number;
}

export interface UserPreferences {
  budgetRange: { min: number; max: number };
  preferredBrands: string[];
  preferredFuelTypes: string[];
  preferredBodyTypes: string[];
  maxAge: number; // maximum car age in years
  location: {
    city: string;
    state: string;
  };
  familySize: number;
  primaryUse: 'city' | 'highway' | 'mixed' | 'commercial';
}

interface UserBehaviorState {
  carViews: CarView[];
  searchQueries: SearchQuery[];
  wishlistActions: WishlistAction[];
  compareActions: CompareAction[];
  userPreferences: UserPreferences;
  sessionStartTime: number;
  totalSessionTime: number;
  isTrackingEnabled: boolean;
}

const initialPreferences: UserPreferences = {
  budgetRange: { min: 200000, max: 2000000 }, // Default range in INR
  preferredBrands: [],
  preferredFuelTypes: [],
  preferredBodyTypes: [],
  maxAge: 10,
  location: { city: '', state: '' },
  familySize: 4,
  primaryUse: 'mixed',
};

const initialState: UserBehaviorState = {
  carViews: [],
  searchQueries: [],
  wishlistActions: [],
  compareActions: [],
  userPreferences: initialPreferences,
  sessionStartTime: Date.now(),
  totalSessionTime: 0,
  isTrackingEnabled: true,
};

const userBehaviorSlice = createSlice({
  name: "userBehavior",
  initialState,
  reducers: {
    // Car viewing behavior
    trackCarView: (state, action: PayloadAction<Omit<CarView, 'timestamp'>>) => {
      if (!state.isTrackingEnabled) return;
      
      const carView: CarView = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      // Keep only last 100 car views to prevent memory issues
      state.carViews.unshift(carView);
      if (state.carViews.length > 100) {
        state.carViews = state.carViews.slice(0, 100);
      }
    },

    // Search behavior
    trackSearch: (state, action: PayloadAction<Omit<SearchQuery, 'id' | 'timestamp'>>) => {
      if (!state.isTrackingEnabled) return;
      
      const searchQuery: SearchQuery = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      };
      
      state.searchQueries.unshift(searchQuery);
      if (state.searchQueries.length > 50) {
        state.searchQueries = state.searchQueries.slice(0, 50);
      }
    },

    // Wishlist behavior
    trackWishlistAction: (state, action: PayloadAction<Omit<WishlistAction, 'timestamp'>>) => {
      if (!state.isTrackingEnabled) return;
      
      const wishlistAction: WishlistAction = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      state.wishlistActions.unshift(wishlistAction);
      if (state.wishlistActions.length > 50) {
        state.wishlistActions = state.wishlistActions.slice(0, 50);
      }
    },

    // Compare behavior
    trackCompareAction: (state, action: PayloadAction<Omit<CompareAction, 'timestamp'>>) => {
      if (!state.isTrackingEnabled) return;
      
      const compareAction: CompareAction = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      state.compareActions.unshift(compareAction);
      if (state.compareActions.length > 20) {
        state.compareActions = state.compareActions.slice(0, 20);
      }
    },

    // Update user preferences
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },

    // Session tracking
    updateSessionTime: (state) => {
      const currentTime = Date.now();
      const sessionDuration = currentTime - state.sessionStartTime;
      state.totalSessionTime += sessionDuration;
      state.sessionStartTime = currentTime;
    },

    // Privacy controls
    toggleTracking: (state) => {
      state.isTrackingEnabled = !state.isTrackingEnabled;
    },

    clearBehaviorData: (state) => {
      state.carViews = [];
      state.searchQueries = [];
      state.wishlistActions = [];
      state.compareActions = [];
      state.totalSessionTime = 0;
      state.sessionStartTime = Date.now();
    },



    // Smart preference inference from behavior
    inferPreferencesFromBehavior: (state) => {
      if (state.carViews.length < 5) return; // Need enough data
      
      // Infer budget range from viewed cars
      const viewedPrices = state.carViews.map(view => view.price);
      const minPrice = Math.min(...viewedPrices);
      const maxPrice = Math.max(...viewedPrices);
      
      state.userPreferences.budgetRange = {
        min: Math.max(minPrice * 0.8, 100000), // 20% below min viewed
        max: Math.min(maxPrice * 1.2, 5000000), // 20% above max viewed
      };

      // Infer preferred brands
      const brandCounts: Record<string, number> = {};
      state.carViews.forEach(view => {
        brandCounts[view.carMake] = (brandCounts[view.carMake] || 0) + 1;
      });
      
      const sortedBrands = Object.entries(brandCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([brand]) => brand);
      
      state.userPreferences.preferredBrands = sortedBrands;

      // Infer preferred fuel types
      const fuelCounts: Record<string, number> = {};
      state.carViews.forEach(view => {
        fuelCounts[view.fuelType] = (fuelCounts[view.fuelType] || 0) + 1;
      });
      
      const sortedFuels = Object.entries(fuelCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([fuel]) => fuel);
      
      state.userPreferences.preferredFuelTypes = sortedFuels;
    },
  },
});

export const {
  trackCarView,
  trackSearch,
  trackWishlistAction,
  trackCompareAction,
  updateUserPreferences,
  updateSessionTime,
  toggleTracking,
  clearBehaviorData,
  inferPreferencesFromBehavior,
} = userBehaviorSlice.actions;

// Helper functions (not reducers)
export const getRecentActivity = (state: UserBehaviorState) => {
  const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
  return {
    recentViews: state.carViews.filter(view => view.timestamp > last24Hours),
    recentSearches: state.searchQueries.filter(search => search.timestamp > last24Hours),
    recentWishlistActions: state.wishlistActions.filter(action => action.timestamp > last24Hours),
  };
};

export default userBehaviorSlice.reducer;