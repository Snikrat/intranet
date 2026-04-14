import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Admin } from "../pages/Admin";
import Home from "../pages/Home";
import { Login } from "../pages/Login";
import { CardapioPage } from "../pages/WeeklyMenu";
import SignatureGeneratorPage from "../pages/SignatureGenerator";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />

        <Route path="/cardapio" element={<CardapioPage />} />

        <Route
          path="/gerador-assinatura"
          element={<SignatureGeneratorPage />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
