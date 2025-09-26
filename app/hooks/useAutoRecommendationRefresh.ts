import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../store/store';
import { refreshRecommendations, shouldRefreshRecommendations } from '../utils/recommendationHelpers';

interface UseAutoRecommendationRefreshOptions {
  enabled?: boolean;
  debounceMs?: number;
  significantChangeThreshold?: number;
}

export const useAutoRecommendationRefresh = (options: UseAutoRecommendationRefreshOptions = {}) => {
  const {
    enabled = true,
    debounceMs = 3000,
    significantChangeThreshold = 2
  } = options;

  const dispatch = useDispatch();
  const { carViews, searchQueries, wishlistActions } = useSelector((state: RootState) => state.userBehavior);
  const { isInitialized, globalLoading } = useSelector((state: RootState) => state.recommendations);

  const lastRefreshTime = useRef(0);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const lastBehaviorCount = useRef({
    views: 0,
    searches: 0,
    wishlist: 0
  });

  const triggerRefresh = useCallback(() => {
    if (!enabled || globalLoading) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    
    // Don't refresh too frequently (minimum 30 seconds between auto-refreshes)
    if (timeSinceLastRefresh < 30000) return;

    console.log('🔄 Auto-refreshing recommendations due to user behavior changes');
    lastRefreshTime.current = now;
    refreshRecommendations(dispatch, () => store.getState());
  }, [dispatch, enabled, globalLoading]);

  const debouncedRefresh = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(triggerRefresh, debounceMs);
  }, [triggerRefresh, debounceMs]);

  useEffect(() => {
    if (!enabled || !isInitialized) return;

    const currentCounts = {
      views: carViews.length,
      searches: searchQueries.length,
      wishlist: wishlistActions.length
    };

    // Check if there's been significant behavior changes
    const viewsChange = currentCounts.views - lastBehaviorCount.current.views;
    const searchesChange = currentCounts.searches - lastBehaviorCount.current.searches;
    const wishlistChange = currentCounts.wishlist - lastBehaviorCount.current.wishlist;

    const totalChange = Math.abs(viewsChange) + Math.abs(searchesChange) + Math.abs(wishlistChange);

    // Trigger refresh if there's significant new activity
    if (totalChange >= significantChangeThreshold) {
      lastBehaviorCount.current = currentCounts;
      debouncedRefresh();
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [carViews.length, searchQueries.length, wishlistActions.length, enabled, isInitialized, debouncedRefresh, significantChangeThreshold]);

  // Also check if standard refresh conditions are met
  useEffect(() => {
    if (!enabled || !isInitialized) return;

    const state = store.getState();
    if (shouldRefreshRecommendations(state)) {
      console.log('🔄 Auto-refreshing recommendations due to time-based criteria');
      refreshRecommendations(dispatch, () => store.getState());
    }
  }, [dispatch, enabled, isInitialized]);

  return {
    triggerManualRefresh: triggerRefresh,
    isEnabled: enabled
  };
};

export default useAutoRecommendationRefresh;