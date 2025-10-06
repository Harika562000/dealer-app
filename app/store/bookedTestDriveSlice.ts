import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BookedTestDrive {
  id: string;          // unique id
  car: any;
  userInfo: any;
  date: string;
  time: string;
  dealer: any;
}

interface BookedTestDrivesState {
  drives: BookedTestDrive[];
}

const initialState: BookedTestDrivesState = {
  drives: [],
};

export const bookedTestDrivesSlice = createSlice({
  name: "bookedTestDrives",
  initialState,
  reducers: {
    addTestDrive: (state, action: PayloadAction<BookedTestDrive>) => {
      state.drives.push(action.payload);
    },
  },
});

export const { addTestDrive } = bookedTestDrivesSlice.actions;
export default bookedTestDrivesSlice.reducer;
