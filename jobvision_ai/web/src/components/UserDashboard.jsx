import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById } from "../app/api.js";

const UserDashboard = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchUserById(id);
        setUser(data);
      } catch (err) {
        setError(err.message || "Failed to load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p>Loading user info...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>User Info</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Verified:</strong> {user.is_verified ? "Yes" : "No"}</p>
      <p><strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}</p>
    </div>
  );
};

export default UserDashboard;
