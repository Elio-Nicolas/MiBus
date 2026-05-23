import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import BrandFooter from "./componentes/BrandFooter";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    
    <>
    <ThemeModeProvider>
      <BrowserRouter>
       <AuthProvider>
         <AppRouter />
       </AuthProvider>
      </BrowserRouter>
    </ThemeModeProvider>
      <BrandFooter />
    </>
  );
}

export default App;

