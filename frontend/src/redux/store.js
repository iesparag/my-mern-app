import { configureStore } from "@reduxjs/toolkit";
import ClientSlice from "./Feature/ClientSlice";
import VisitSlice from "./Feature/VisitSlice";
import DashBoardSlice from "./Feature/DashBoardSlice";
import userSlice from "./Feature/userSlice";

const store = configureStore({
    reducer: {
        Client: ClientSlice,
        Visit: VisitSlice,
        DashboardData: DashBoardSlice,
        User: userSlice,
    },
});

export default store;
