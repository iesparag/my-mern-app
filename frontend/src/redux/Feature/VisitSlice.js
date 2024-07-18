import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import VisitService from "../Service/VisitService";

const initialState = {
    isFetching: false,
    isError: false,
    isSuccess: false,
    ClinicianVisitDetailData: {},
    visitDetailAndClinicianChecklist: {},
    clientDocumentationByClientId: [],
    conversation: [],
    lastVisitNote: {},
    perVisitSentiment: {},
    modalData: {},
};

export const getClinicianVisitDetailsData = createAsyncThunk(
    "clinicianVisitDetailData",
    async (optionParameter, thunkAPI) => {
        const response =
            await VisitService.getClinicianVisitDetailsData(optionParameter);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getPatientVisitDetailsAndClinicianChecklist = createAsyncThunk(
    "visitDetailAndClinicianChecklist",
    async (clientId, thunkAPI) => {
        const response =
            await VisitService.getPatientVisitDetailsAndClinicianChecklist(
                clientId
            );
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getClientDocumentationByClientId = createAsyncThunk(
    "ClientDocumentationByClientId",
    async (optionsData, thunkAPI) => {
        const response =
            await VisitService.getClientDocumentationByClientId(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getVisitsConversationOverview = createAsyncThunk(
    "VisitsConversationOverview",
    async (optionsData, thunkAPI) => {
        const response =
            await VisitService.getVisitsConversationOverview(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getLastVisitNote = createAsyncThunk(
    "VisitLastVisitNote",
    async (optionsData, thunkAPI) => {
        const response = await VisitService.getLastVisitNote(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const getPerVisitSentimentAnalysis = createAsyncThunk(
    "individualVisitSentiment",
    async (optionsData, thunkAPI) => {
        const response =
            await VisitService.getPerVisitSentimentAnalysis(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

export const CallingModalData = createAsyncThunk(
    "modalData",
    async (optionsData, thunkAPI) => {
        const response = await VisitService.CallingModalData(optionsData);
        if (response) {
            return response;
        } else {
            throw thunkAPI.rejectWithValue(response?.response);
        }
    }
);

const VisitSlice = createSlice({
    name: "visitDetailAndClinicianChecklist",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getClinicianVisitDetailsData.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(
                getClinicianVisitDetailsData.fulfilled,
                (state, action) => {
                    console.log(action.payload);
                    const sortedData = {
                        ...action.payload,
                        rows: action?.payload?.rows?.sort(
                            (a, b) =>
                                new Date(b?.schedule_date) -
                                new Date(a?.schedule_date)
                        ),
                    };
                    state.isFetching = false;
                    state.isError = false;
                    state.isSuccess = true;
                    state.ClinicianVisitDetailData = sortedData;
                }
            )
            .addCase(getClinicianVisitDetailsData.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(
                getPatientVisitDetailsAndClinicianChecklist.pending,
                (state) => {
                    state.isFetching = true;
                    state.isSuccess = false;
                    state.isError = false;
                }
            )
            .addCase(
                getPatientVisitDetailsAndClinicianChecklist.fulfilled,
                (state, action) => {
                    state.isFetching = false;
                    state.isError = false;
                    state.isSuccess = true;
                    state.visitDetailAndClinicianChecklist = action.payload;
                }
            )
            .addCase(
                getPatientVisitDetailsAndClinicianChecklist.rejected,
                (state, action) => {
                    state.isFetching = false;
                    state.isSuccess = false;
                    state.isError = true;
                }
            );

        builder
            .addCase(getClientDocumentationByClientId.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(
                getClientDocumentationByClientId.fulfilled,
                (state, action) => {
                    state.isFetching = false;
                    state.isError = false;
                    state.isSuccess = true;
                    state.clientDocumentationByClientId = action.payload;
                }
            )
            .addCase(
                getClientDocumentationByClientId.rejected,
                (state, action) => {
                    state.isFetching = false;
                    state.isSuccess = false;
                    state.isError = true;
                }
            );

        builder
            .addCase(getVisitsConversationOverview.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(
                getVisitsConversationOverview.fulfilled,
                (state, action) => {
                    state.isFetching = false;
                    state.isError = false;
                    state.isSuccess = true;
                    state.conversation = action.payload;
                }
            )
            .addCase(
                getVisitsConversationOverview.rejected,
                (state, action) => {
                    state.isFetching = false;
                    state.isSuccess = false;
                    state.isError = true;
                }
            );

        builder
            .addCase(getLastVisitNote.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(getLastVisitNote.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.lastVisitNote = action.payload;
            })
            .addCase(getLastVisitNote.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(getPerVisitSentimentAnalysis.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(
                getPerVisitSentimentAnalysis.fulfilled,
                (state, action) => {
                    state.isFetching = false;
                    state.isError = false;
                    state.isSuccess = true;
                    state.perVisitSentiment = action.payload;
                }
            )
            .addCase(getPerVisitSentimentAnalysis.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });

        builder
            .addCase(CallingModalData.pending, (state) => {
                state.isFetching = true;
                state.isSuccess = false;
                state.isError = false;
            })
            .addCase(CallingModalData.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isError = false;
                state.isSuccess = true;
                state.modalData = action.payload;
            })
            .addCase(CallingModalData.rejected, (state, action) => {
                state.isFetching = false;
                state.isSuccess = false;
                state.isError = true;
            });
    },
});

export default VisitSlice.reducer;
