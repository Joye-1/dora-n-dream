import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Welcome } from "./pages/Welcome";
import { Home } from "./pages/Home";
import { Listen } from "./pages/Listen";
import { WordDetail } from "./pages/WordDetail";
import { Review } from "./pages/Review";
import { Errors } from "./pages/Errors";
import { Stats } from "./pages/Stats";
import { Auth } from "./pages/Auth";

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<Layout />}>
        <Route path="/book/:bookId" element={<Home />} />
        <Route path="/book/:bookId/listen" element={<Listen />} />
        <Route path="/book/:bookId/review" element={<Review />} />
        <Route path="/book/:bookId/errors" element={<Errors />} />
        <Route path="/book/:bookId/stats" element={<Stats />} />
        <Route path="/word/:word" element={<WordDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
