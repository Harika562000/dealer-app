import { simulateNewArrival, simulatePriceDrop } from "../store/notificationSlice";
import { AppDispatch } from "../store/store";

export const triggerPriceDropNotification = (dispatch: AppDispatch, car: any) => {
  const priceReduction = Math.floor(car.price * 0.1); // 10% reduction
  const newPrice = car.price - priceReduction;
  
  dispatch(simulatePriceDrop({
    carId: car.id,
    carName: `${car.make} ${car.model} ${car.year}`,
    oldPrice: car.price,
    newPrice: newPrice,
  }));
};

export const triggerNewArrivalNotification = (dispatch: AppDispatch, car: any) => {
  dispatch(simulateNewArrival({
    carId: car.id,
    carName: `${car.make} ${car.model} ${car.year}`,
  }));
};

export const getNotificationTypeIcon = (type: string) => {
  switch (type) {
    case 'price_drop':
      return { name: 'trending-down', color: '#e74c3c' };
    case 'new_arrival':
      return { name: 'car', color: '#27ae60' };
    case 'status_change':
      return { name: 'information-circle', color: '#171C8F' };
    case 'wishlist_reminder':
      return { name: 'heart', color: '#e91e63' };
    case 'service_reminder':
      return { name: 'construct', color: '#f39c12' };
    default:
      return { name: 'notifications', color: '#95a5a6' };
  }
};

export const formatNotificationTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};
