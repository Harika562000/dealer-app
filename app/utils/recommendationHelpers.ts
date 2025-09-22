import { recommendationService } from "../services/recommendationService";
import {
    completeRecommendationRefresh,
    setRecommendations,
    startRecommendationRefresh
} from "../store/recommendationSlice";
import { AppDispatch, RootState } from "../store/store";

export const refreshRecommendations = (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(startRecommendationRefresh());

  const state = getState();
  const { userBehavior, recommendations } = state;
  const { carViews, searchQueries, wishlistActions, userPreferences } = userBehavior;
  const { enabledSections } = recommendations;

  try {
    // Get recommendations for each enabled section
    const promises = enabledSections.map(async (sectionKey) => {
      let sectionRecommendations: any[] = [];

      switch (sectionKey) {
        case 'similar':
          sectionRecommendations = recommendationService.getRecommendationsByCategory(
            'similar',
            carViews,
            searchQueries,
            wishlistActions,
            userPreferences,
            5
          );
          break;

        case 'budget':
          sectionRecommendations = recommendationService.getRecommendationsByCategory(
            'budget',
            carViews,
            searchQueries,
            wishlistActions,
            userPreferences,
            5
          );
          break;

        case 'popular':
          sectionRecommendations = recommendationService.getRecommendationsByCategory(
            'popular',
            carViews,
            searchQueries,
            wishlistActions,
            userPreferences,
            5
          );
          break;

        case 'new':
          sectionRecommendations = recommendationService.getRecommendationsByCategory(
            'new',
            carViews,
            searchQueries,
            wishlistActions,
            userPreferences,
            5
          );
          break;

        case 'brand_preference':
          sectionRecommendations = recommendationService.getRecommendationsByCategory(
            'brand_preference',
            carViews,
            searchQueries,
            wishlistActions,
            userPreferences,
            5
          );
          break;

        case 'trending':
          sectionRecommendations = recommendationService.getTrendingCars(5);
          break;

        default:
          sectionRecommendations = [];
      }

      // Dispatch recommendations for this section
      dispatch(setRecommendations({
        category: sectionKey as any,
        recommendations: sectionRecommendations,
      }));
    });

    // Wait for all sections to complete
    Promise.all(promises).then(() => {
      dispatch(completeRecommendationRefresh());
    });

  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    dispatch(completeRecommendationRefresh());
  }
};

// Helper to check if recommendations need refresh
export const shouldRefreshRecommendations = (state: RootState): boolean => {
  const { lastRefresh, refreshInterval } = state.recommendations;
  const now = Date.now();
  
  // Refresh if never refreshed or interval has passed
  return !lastRefresh || (now - lastRefresh) > refreshInterval;
};

// Helper to get recommendations for display
export const getVisibleRecommendationSections = (state: RootState) => {
  const { sections, enabledSections } = state.recommendations;
  
  return enabledSections
    .map(sectionKey => sections[sectionKey as keyof typeof sections])
    .filter(section => section && section.recommendations.length > 0);
};