import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dashboardService from "../Service/DashBoardService";

const initialState = {
    isFetching: false,
    isError: false,
    isSuccess: false,
    complianceData: {},
    sentimentData: {},
    dashboardKeywords: [],
    dashboardNotifications: {},
    clientPerCareCenter: "",
    averageTimePerVisit: "",
    percentageTimePerVisit: "",
    percentageChangeInVisits: "",
};

export const getDashboardCompliance = createAsyncThunk(
    "dashboardCompliance",
    async (optionParameter, thunkAPI) => {
        const response =
            await dashboardService.getDashboardCompliance(optionParameter);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getDashboardSentiment = createAsyncThunk(
    "dashboardSentiment",
    async (optionsData, thunkAPI) => {
        const response =
            await dashboardService.getDashboardSentiment(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getDashboardNotifications = createAsyncThunk(
    "dashboardNotifications",
    async (optionsData, thunkAPI) => {
        const response =
            await dashboardService.getDashboardNotifications(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getClientsPerCareCenterAndAverageTimePerVisit = createAsyncThunk(
    "ClientsPerCareCenterAndAverageTimePerVisit",
    async (optionsData, thunkAPI) => {
        const response =
            await dashboardService.getClientsPerCareCenterAndAverageTimePerVisit(
                optionsData
            );
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getDashboardKeyWords = createAsyncThunk(
    "dashboardKeyword",
    async (optionsData, thunkAPI) => {
        const response =
            await dashboardService.getDashboardKeyWords(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

const DashBoardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardCompliance.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getDashboardCompliance.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.complianceData = action.payload;
            })
            .addCase(getDashboardCompliance.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(getDashboardSentiment.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getDashboardSentiment.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.sentimentData = action.payload;
            })
            .addCase(getDashboardSentiment.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(getDashboardKeyWords.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getDashboardKeyWords.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.dashboardKeywords = action.payload;
            })
            .addCase(getDashboardKeyWords.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(getDashboardNotifications.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getDashboardNotifications.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.dashboardNotifications = action.payload;
            })
            .addCase(getDashboardNotifications.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(
                getClientsPerCareCenterAndAverageTimePerVisit.pending,
                (state) => {
                    state.isFetching = true;
                    state.isSuccess = false;
                    state.isError = false;
                }
            )
            .addCase(
                getClientsPerCareCenterAndAverageTimePerVisit.fulfilled,
                (state, action) => {
                    state.isFetching = false;
                    state.isError = false;
                    state.isSuccess = true;
                    state.averageTimePerVisit =
                        action.payload.averageTimePerVisit;
                    state.clientPerCareCenter = action.payload.visitsPerCenter;
                    state.percentageTimePerVisit =
                        action.payload.percentageChangeInVisitTime;
                    state.percentageChangeInVisits =
                        action.payload.percentageChangeInVisits;
                }
            )
            .addCase(
                getClientsPerCareCenterAndAverageTimePerVisit.rejected,
                (state, action) => {
                    state.isFetching = false;
                    state.isSuccess = false;
                    state.isError = true;
                }
            );
    },
});

export default DashBoardSlice.reducer;
