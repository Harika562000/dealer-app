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
  const { carViews, searchQueries, wishlistActions } = state.userBehavior;
  const now = Date.now();
  
  // Always refresh if never refreshed
  if (!lastRefresh) return true;
  
  // Refresh if interval has passed
  if ((now - lastRefresh) > refreshInterval) return true;
  
  // Refresh if there's been significant new activity since last refresh
  const recentViews = carViews.filter(view => view.timestamp > lastRefresh);
  const recentSearches = searchQueries.filter(search => search.timestamp > lastRefresh);
  const recentWishlistActions = wishlistActions.filter(action => action.timestamp > lastRefresh);
  
  // Consider it significant if there are new car views, searches, or wishlist changes
  const hasSignificantActivity = recentViews.length > 0 || recentSearches.length > 0 || recentWishlistActions.length > 0;
  
  return hasSignificantActivity;
};

// Helper to get recommendations for display
export const getVisibleRecommendationSections = (state: RootState) => {
  const { sections, enabledSections } = state.recommendations;
  
  return enabledSections
    .map(sectionKey => sections[sectionKey as keyof typeof sections])
    .filter(section => section && section.recommendations.length > 0);
};