import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import Home from "./components/Home";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:id" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
