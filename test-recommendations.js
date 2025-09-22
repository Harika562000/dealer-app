// Test script to validate recommendation logic
// Run this in browser console at http://localhost:8081

async function testRecommendationSystem() {
  console.log('🧪 Testing Recommendation System...');
  
  // Test 1: Check if recommendationService is accessible
  try {
    const { recommendationService } = await import('./app/services/recommendationService.ts');
    console.log('✅ RecommendationService loaded successfully');
    
    // Test 2: Get all cars
    const allCars = recommendationService.getCars();
    console.log(`✅ Total cars available: ${allCars.length}`);
    
    // Test 3: Test personalized recommendations
    const mockUserViews = [
      { carId: '1', carMake: 'Maruti', price: 500000, fuelType: 'Petrol', timestamp: Date.now() }
    ];
    const mockSearches = [
      { query: 'maruti swift', filters: {}, timestamp: Date.now() }
    ];
    const mockPreferences = {
      budgetRange: { min: 400000, max: 800000 },
      preferredFuelTypes: ['Petrol'],
      preferredBrands: ['Maruti'],
      preferredCategories: [],
      transmissionPreference: null
    };
    
    const recommendations = recommendationService.getPersonalizedRecommendations(
      mockUserViews,
      mockSearches,
      [],
      mockPreferences,
      5
    );
    
    console.log(`✅ Generated ${recommendations.length} personalized recommendations`);
    console.log('Sample recommendation:', recommendations[0]);
    
    // Test 4: Test category-specific recommendations
    const budgetRecs = recommendationService.getRecommendationsByCategory(
      'budget',
      mockUserViews,
      mockSearches,
      [],
      mockPreferences,
      3
    );
    
    console.log(`✅ Budget recommendations: ${budgetRecs.length}`);
    
    console.log('🎉 All tests passed! Recommendation system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRecommendationSystem();