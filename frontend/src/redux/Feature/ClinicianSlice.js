import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import clinicianService from "../Service/ClinicianService"

const initialState = {
  isFetching: false,
  isError: false,
  isSuccess: false,
  ClinicianData: [],
};


/// getClinicianData action reducer
export const getClinicianData = createAsyncThunk(
  "clinicianData",
  async ( _ , thunkAPI) => {
    const response = await clinicianService.getClinicianData();
    if (response) {
      return response;
    } else {
      throw thunkAPI.rejectWithValue(response?.response);
    }
  }
);


const ClinicianSlice = createSlice({
  name: "ClinicianData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(getClinicianData.pending, (state) => {
      state.isFetching = true;
      state.isSuccess = false ;
      state.isError = false;
    })
    .addCase(getClinicianData.fulfilled, (state, action) => {
      state.isFetching = false;
      state.isError = false;
      state.isSuccess = true ;
      state.ClinicianData = action.payload
    })
    .addCase(getClinicianData.rejected, (state, action) => {
      state.isFetching = false;
      state.isSuccess = false;
      state.isError =true ;
    });
  },
});


export default ClinicianSlice.reducer;