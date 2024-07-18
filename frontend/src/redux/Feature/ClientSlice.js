import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import clientService from "../Service/ClientService";

const initialState = {
    isFetching: false,
    isError: false,
    isSuccess: false,
    clientData: [],
};

export const getClientData = createAsyncThunk(
    "clientData",
    async (_, thunkAPI) => {
        const response = await clientService.getClientData();
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

const ClientSlice = createSlice({
    name: "ClientData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getClientData.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getClientData.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.clientData = action.payload;
            })
            .addCase(getClientData.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });
    },
});

export default ClientSlice.reducer;
