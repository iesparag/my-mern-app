import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../Service/UserService';

// Initial state
const initialState = {
  loggedUser: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isError: false,
  errorMessage: '',
  successMessage: '',
};

// Async thunk for user registration
export const register = createAsyncThunk('user/register', async (userData, thunkAPI) => {
  try {
    const response = await UserService.registerUser(userData);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || { message: 'Something went wrong!' });
  }
});

// Async thunk for user login
export const login = createAsyncThunk('user/login', async (userData, thunkAPI) => {
  try {
    const response = await UserService.loginUser(userData);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || { message: 'Something went wrong!' });
  }
});

// User slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.loggedUser = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.isError = false;
      state.errorMessage = '';
    },
    clearSuccessMessage: (state) => {
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log(action.payload,"action Payload");
        debugger
        state.isLoading = false;
        state.loggedUser = action.payload.data;
        state.successMessage = action.payload.message;
        localStorage.setItem('loggedUser', JSON.stringify(action.payload.data));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loggedUser = action.payload.data.user;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        state.successMessage = action.payload.message;
        localStorage.setItem('loggedUser', JSON.stringify(action.payload.data.user));
        localStorage.setItem('accessToken', action.payload.data.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Login failed';
      });
  },
});

export const { clearUser, clearError, clearSuccessMessage } = userSlice.actions;

// // Selectors
// export const selectUser = (state) => state.user.loggedUser || null;
// export const selectUserStatus = (state) => {
//   const user = state.user || {};
//   return {
//     isLoading: user.isLoading || false,
//     isError: user.isError || false,
//     errorMessage: user.errorMessage || '',
//     successMessage: user.successMessage || '',
//   };
// };

// export const selectAccessToken = (state) => state.user.accessToken || null;
// export const selectRefreshToken = (state) => state.user.refreshToken || null;

export default userSlice.reducer;
