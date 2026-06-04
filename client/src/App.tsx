import { Routes, Route } from "react-router-dom";
import { UserSelectPage } from "./pages/UserSelectPage";
import { FeedPage } from "./pages/FeedPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserSelectPage />} />
      <Route path="/feed" element={<FeedPage />} />
    </Routes>
  );
}
