import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./APP";
import Register from "./components/Register";
import Login from "./components/Login";
import Verify from "./components/Verify";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
