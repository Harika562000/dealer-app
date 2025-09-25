import { CarView, SearchQuery, UserPreferences, WishlistAction } from "../store/userBehaviorSlice";
import { cars } from "./dummyCars";

// Simple car interface matching our data structure
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  fuel: string;
  mileage: string;
  image: string;
  transmission?: string;
  category?: string;
  seating?: number;
  features?: string[];
  // Additional properties for compatibility
  rating?: number;
  reviewsCount?: number;
  isNew?: boolean;
  bodyType?: string;
}

// Simple recommendation result interface
export interface RecommendationResult {
  car: Car;
  score: number;
  reasons: string[];
  category: string;
  confidence: number;
}

export class RecommendationService {
  private static instance: RecommendationService;
  private cars: Car[];

  private constructor() {
    this.cars = cars as Car[];
  }

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  // Get all cars (for search/browse functionality)
  getCars(): Car[] {
    return this.cars;
  }

  // Get car by ID
  getCarById(id: string): Car | undefined {
    return this.cars.find(car => car.id === id);
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(
    userViews: CarView[],
    userSearches: SearchQuery[],
    wishlistActions: WishlistAction[],
    preferences: UserPreferences,
    limit: number = 10
  ): RecommendationResult[] {
    // Get recently viewed/searched brands for better recommendations
    const recentBrands = new Set<string>();
    
    // Add brands from recent views (last 3 views)
    userViews.slice(-3).forEach(view => {
      if (view.carMake) recentBrands.add(view.carMake);
    });
    
    // Add brands from recent searches (last 2 searches)
    userSearches.slice(-2).forEach(search => {
      const query = search.query.toLowerCase();
      this.cars.forEach(car => {
        if (query.includes(car.make.toLowerCase())) {
          recentBrands.add(car.make);
        }
      });
    });

    const recommendations: RecommendationResult[] = [];
    const shuffled = [...this.cars].sort(() => Math.random() - 0.5);
    
    for (const car of shuffled) {
      if (recommendations.length >= limit) break;
      
      let score = 0.3; // Base score
      const reasons: string[] = [];
      let category = 'popular';
      
      // Higher score for recently viewed brands
      if (recentBrands.has(car.make)) {
        score += 0.4;
        reasons.push(`More ${car.make} models`);
        category = 'brand_preference';
      }
      
      // Budget preference
      if (preferences.budgetRange && car.price <= preferences.budgetRange.max) {
        score += 0.2;
        reasons.push('Within your budget');
        category = 'budget';
      }
      
      // Fuel preference
      if (preferences.preferredFuelTypes.includes(car.fuel)) {
        score += 0.3;
        reasons.push(`Your preferred ${car.fuel} fuel type`);
        category = 'fuel_preference';
      }
      
      // Add some randomness for variety
      score += Math.random() * 0.1;
      
      if (reasons.length === 0) {
        reasons.push('Popular choice');
      }

      recommendations.push({
        car,
        score: Math.min(score, 1.0),
        reasons: reasons.slice(0, 2),
        category,
        confidence: Math.min(score + 0.2, 0.9)
      });
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Get similar cars based on a specific car (for car detail page)
  getSimilarCars(carId: string, limit: number = 6): RecommendationResult[] {
    const targetCar = this.getCarById(carId);
    if (!targetCar) return [];

    const similarCars = this.cars
      .filter(car => car.id !== carId)
      .map(car => {
        let score = 0;
        const reasons: string[] = [];
        let category = 'similar';

        // Same brand gets highest priority
        if (car.make === targetCar.make) {
          score += 0.5;
          reasons.push(`More ${car.make} models`);
          category = 'brand_preference';
        }

        // Same category
        if (car.category && targetCar.category && car.category === targetCar.category) {
          score += 0.3;
          reasons.push(`Similar ${car.category} vehicles`);
        }

        // Similar price range (±30%)
        const priceDiff = Math.abs(car.price - targetCar.price) / targetCar.price;
        if (priceDiff <= 0.3) {
          score += 0.2;
          reasons.push('Similar price range');
        }

        // Same fuel type
        if (car.fuel === targetCar.fuel) {
          score += 0.1;
          reasons.push(`${car.fuel} fuel type`);
        }

        return {
          car,
          score,
          reasons: reasons.slice(0, 2),
          category,
          confidence: Math.min(score + 0.3, 0.9)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return similarCars;
  }

  // Get trending cars (newer models)
  getTrendingCars(limit: number = 5): RecommendationResult[] {
    const trending = this.cars
      .filter(car => car.year >= 2024)
      .sort((a, b) => b.year - a.year)
      .slice(0, limit);

    return trending.map(car => ({
      car,
      score: Math.random() * 0.5 + 0.5,
      reasons: ['Trending model'],
      category: 'new',
      confidence: 0.8
    }));
  }

  // Search cars with filters
  searchCars(
    query: string,
    filters?: {
      make?: string;
      priceRange?: { min: number; max: number };
      fuelType?: string;
      category?: string;
      year?: number;
    }
  ): Car[] {
    let results = [...this.cars];

    // Apply text search
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(car =>
        car.make.toLowerCase().includes(lowerQuery) ||
        car.model.toLowerCase().includes(lowerQuery) ||
        car.fuel.toLowerCase().includes(lowerQuery) ||
        (car.category && car.category.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.make) {
        results = results.filter(car => car.make.toLowerCase() === filters.make!.toLowerCase());
      }

      if (filters.priceRange) {
        results = results.filter(car =>
          car.price >= filters.priceRange!.min && car.price <= filters.priceRange!.max
        );
      }

      if (filters.fuelType) {
        results = results.filter(car => car.fuel.toLowerCase() === filters.fuelType!.toLowerCase());
      }

      if (filters.category) {
        results = results.filter(car => (car.category || '').toLowerCase() === filters.category!.toLowerCase());
      }

      if (filters.year) {
        results = results.filter(car => car.year === filters.year);
      }
    }

    return results;
  }

  // Get popular cars (mix of different makes)
  getPopularCars(limit: number = 5): Car[] {
    const makes = [...new Set(this.cars.map(car => car.make))];
    const popular: Car[] = [];
    
    for (const make of makes) {
      if (popular.length >= limit) break;
      const makeCars = this.cars.filter(car => car.make === make);
      if (makeCars.length > 0) {
        popular.push(makeCars[Math.floor(Math.random() * makeCars.length)]);
      }
    }
    
    return popular;
  }

  // Get new arrivals
  getNewArrivals(limit: number = 5): Car[] {
    return this.cars
      .filter(car => car.year >= 2024)
      .sort((a, b) => b.year - a.year)
      .slice(0, limit);
  }

  // Get cars by price range
  getCarsByPriceRange(min: number, max: number): Car[] {
    return this.cars.filter(car => car.price >= min && car.price <= max);
  }

  // Get cars by fuel type
  getCarsByFuelType(fuelType: string): Car[] {
    return this.cars.filter(car => 
      car.fuel.toLowerCase() === fuelType.toLowerCase()
    );
  }

  // Get cars by make/brand
  getCarsByMake(make: string): Car[] {
    return this.cars.filter(car => 
      car.make.toLowerCase() === make.toLowerCase()
    );
  }

  // Get cars by category
  getCarsByCategory(category: string): Car[] {
    return this.cars.filter(car => 
      (car.category || '').toLowerCase() === category.toLowerCase()
    );
  }

  // Get recommendations by category (used by recommendation helpers)
  getRecommendationsByCategory(
    category: string,
    userViews: CarView[],
    userSearches: SearchQuery[],
    wishlistActions: WishlistAction[],
    preferences: UserPreferences,
    limit: number = 5
  ): RecommendationResult[] {
    switch (category) {
      case 'similar':
      case 'brand_preference':
        return this.getPersonalizedRecommendations(userViews, userSearches, wishlistActions, preferences, limit);
      
      case 'budget':
        return this.getPersonalizedRecommendations(userViews, userSearches, wishlistActions, preferences, limit)
          .filter(rec => rec.category === 'budget')
          .slice(0, limit);
      
      case 'popular':
        const popular = this.getPopularCars(limit);
        return popular.map(car => ({
          car,
          score: Math.random() * 0.3 + 0.7,
          reasons: ['Popular choice'],
          category: 'popular',
          confidence: 0.8
        }));
      
      case 'new':
        return this.getTrendingCars(limit);
      
      default:
        return this.getPersonalizedRecommendations(userViews, userSearches, wishlistActions, preferences, limit);
    }
  }

  // Update car data (for future API integration)
  updateCarData(cars: Car[]): void {
    this.cars = cars;
  }
}

// Export singleton instance
export const recommendationService = RecommendationService.getInstance();