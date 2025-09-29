import { useSelector } from "react-redux";

export function useCounts() {
  const compareCount = useSelector((state: any) => state.cars.compareList.length);
  const wishlistCount = useSelector((state: any) => state.cars.wishlist.length);
  return { compareCount, wishlistCount };
}

export function filterVehicles(cars: any[], vehicleFilter: string) {
    const currentYear = new Date().getFullYear();
  
    return cars.filter(car => {
      const isNew =
        car.year === currentYear ||
        (car.year === currentYear - 1 && car.previousOwners === 0 && car.mileage <= 5000);
  
      const isPreowned =
        car.previousOwners > 0 || car.year < currentYear - 1;
  
      const isCertified =
        car.condition === "certified pre-owned";
  
      if (vehicleFilter === "new") return isNew;
      if (vehicleFilter === "preowned") return isPreowned;
      if (vehicleFilter === "certified") return isCertified;
  
      return true;
    });
}
  