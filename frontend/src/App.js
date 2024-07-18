import React from "react";
import "./App.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AllRoutes from "./Routes/AllRoutes"

const theme = createTheme();

const App = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
       <AllRoutes/>
      </ThemeProvider>
    </>
  );
};

export default App;