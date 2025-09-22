import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecommendationResult } from "../services/recommendationService";

export interface RecommendationSection {
  title: string;
  category: string;
  recommendations: RecommendationResult[];
  isLoading: boolean;
  lastUpdated: number;
}

interface RecommendationState {
  sections: {
    similar: RecommendationSection;
    budget: RecommendationSection;
    popular: RecommendationSection;
    new: RecommendationSection;
    brandPreference: RecommendationSection;
    trending: RecommendationSection;
  };
  isInitialized: boolean;
  globalLoading: boolean;
  lastRefresh: number;
  refreshInterval: number; // in milliseconds
  enabledSections: string[];
  userFeedback: {
    carId: string;
    action: 'like' | 'dislike' | 'not_interested' | 'view';
    timestamp: number;
    category: string;
  }[];
}

const createEmptySection = (title: string, category: string): RecommendationSection => ({
  title,
  category,
  recommendations: [],
  isLoading: false,
  lastUpdated: 0,
});

const initialState: RecommendationState = {
  sections: {
    similar: createEmptySection("Similar to what you viewed", "similar"),
    budget: createEmptySection("Within your budget", "budget"),
    popular: createEmptySection("Popular choices", "popular"),
    new: createEmptySection("New arrivals", "new"),
    brandPreference: createEmptySection("From your preferred brands", "brand_preference"),
    trending: createEmptySection("Trending now", "trending"),
  },
  isInitialized: false,
  globalLoading: false,
  lastRefresh: 0,
  refreshInterval: 30 * 60 * 1000, // 30 minutes
  enabledSections: ['similar', 'budget', 'popular', 'new', 'trending'],
  userFeedback: [],
};

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    // Initialize recommendations
    startRecommendationRefresh: (state) => {
      state.globalLoading = true;
      Object.values(state.sections).forEach(section => {
        if (state.enabledSections.includes(section.category)) {
          section.isLoading = true;
        }
      });
    },

    // Set recommendations for a specific section
    setRecommendations: (state, action: PayloadAction<{
      category: keyof RecommendationState['sections'];
      recommendations: RecommendationResult[];
    }>) => {
      const { category, recommendations } = action.payload;
      if (state.sections[category]) {
        state.sections[category].recommendations = recommendations;
        state.sections[category].isLoading = false;
        state.sections[category].lastUpdated = Date.now();
      }
    },

    // Finish global refresh
    completeRecommendationRefresh: (state) => {
      state.globalLoading = false;
      state.lastRefresh = Date.now();
      state.isInitialized = true;
      
      // Stop loading for all sections
      Object.values(state.sections).forEach(section => {
        section.isLoading = false;
      });
    },

    // Add user feedback
    addUserFeedback: (state, action: PayloadAction<{
      carId: string;
      action: 'like' | 'dislike' | 'not_interested' | 'view';
      category: string;
    }>) => {
      const feedback = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      state.userFeedback.unshift(feedback);
      
      // Keep only last 100 feedback items
      if (state.userFeedback.length > 100) {
        state.userFeedback = state.userFeedback.slice(0, 100);
      }

      // Remove disliked or not_interested cars from recommendations
      if (feedback.action === 'dislike' || feedback.action === 'not_interested') {
        Object.values(state.sections).forEach(section => {
          section.recommendations = section.recommendations.filter(
            rec => rec.car.id !== feedback.carId
          );
        });
      }
    },

    // Update section visibility
    updateEnabledSections: (state, action: PayloadAction<string[]>) => {
      state.enabledSections = action.payload;
    },

    // Update refresh interval
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },

    // Clear all recommendations
    clearRecommendations: (state) => {
      Object.values(state.sections).forEach(section => {
        section.recommendations = [];
        section.lastUpdated = 0;
      });
      state.isInitialized = false;
      state.lastRefresh = 0;
    },

    // Remove specific car from all recommendations (e.g., after purchase)
    removeCarFromRecommendations: (state, action: PayloadAction<string>) => {
      const carId = action.payload;
      Object.values(state.sections).forEach(section => {
        section.recommendations = section.recommendations.filter(
          rec => rec.car.id !== carId
        );
      });
    },

    // Boost car priority in recommendations (e.g., after user shows interest)
    boostCarRecommendation: (state, action: PayloadAction<{
      carId: string;
      category: string;
      boost: number; // multiplier for score
    }>) => {
      const { carId, category, boost } = action.payload;
      
      Object.values(state.sections).forEach(section => {
        if (section.category === category || category === 'all') {
          const carRec = section.recommendations.find(rec => rec.car.id === carId);
          if (carRec) {
            carRec.score *= boost;
            carRec.reasons.push('Based on your recent interest');
            
            // Re-sort recommendations by score
            section.recommendations.sort((a, b) => b.score - a.score);
          }
        }
      });
    },

    // Smart section reordering based on user interaction
    reorderSectionsByEngagement: (state) => {
      // Calculate engagement score for each section
      const sectionEngagement: Record<string, number> = {};
      
      state.userFeedback.forEach(feedback => {
        const category = feedback.category;
        if (!sectionEngagement[category]) sectionEngagement[category] = 0;
        
        switch (feedback.action) {
          case 'like':
            sectionEngagement[category] += 3;
            break;
          case 'view':
            sectionEngagement[category] += 1;
            break;
          case 'dislike':
            sectionEngagement[category] -= 1;
            break;
          case 'not_interested':
            sectionEngagement[category] -= 2;
            break;
        }
      });

      // Update enabled sections based on engagement
      const sortedSections = Object.entries(sectionEngagement)
        .sort(([,a], [,b]) => b - a)
        .map(([category]) => category);

      // Include sections with no feedback but keep them at the end
      const allSections = ['similar', 'budget', 'popular', 'new', 'trending', 'brand_preference'];
      const unengagedSections = allSections.filter(section => !sortedSections.includes(section));
      
      state.enabledSections = [...sortedSections, ...unengagedSections];
    },

    // Advanced: A/B testing for recommendation algorithms
    setRecommendationVariant: (state, action: PayloadAction<{
      variant: 'default' | 'price_focused' | 'brand_focused' | 'popularity_focused';
      experimentId: string;
    }>) => {
      // This could be used for A/B testing different recommendation strategies
      // For now, just store the variant info
      (state as any).experimentVariant = action.payload.variant;
      (state as any).experimentId = action.payload.experimentId;
    },
  },
});

export const {
  startRecommendationRefresh,
  setRecommendations,
  completeRecommendationRefresh,
  addUserFeedback,
  updateEnabledSections,
  setRefreshInterval,
  clearRecommendations,
  removeCarFromRecommendations,
  boostCarRecommendation,
  reorderSectionsByEngagement,
  setRecommendationVariant,
} = recommendationSlice.actions;

export default recommendationSlice.reducer;