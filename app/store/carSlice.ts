import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
}

interface CarState {
  wishlist: Car[];
  compareList: Car[];
}

const initialState: CarState = {
  wishlist: [],
  compareList: [],
};

const carSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Car>) => {
      if (!state.wishlist.find((c) => c.id === action.payload.id)) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter((c) => c.id !== action.payload);
    },
    addToCompare: (state, action: PayloadAction<Car>) => {
      if (!state.compareList.find((c) => c.id === action.payload.id)) {
        if (state.compareList.length < 3) {
          state.compareList.push(action.payload);
        }
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.compareList = state.compareList.filter((c) => c.id !== action.payload);
    },
    clearCompare: (state) => {
      state.compareList = [];
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  addToCompare,
  removeFromCompare,
  clearCompare,
} = carSlice.actions;

export default carSlice.reducer;
