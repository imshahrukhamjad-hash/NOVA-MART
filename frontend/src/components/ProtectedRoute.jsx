import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fast-fail: if no token in localStorage at all, no need to hit the API
    if (!token) {
      setAuth(false);
      return;
    }

    // Explicitly pass the token header as a failsafe (in case interceptor hasn't fired yet)
    axios
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(
        () => setAuth(true),
        () => {
          // Token invalid/expired — clear it
          localStorage.removeItem("token");
          setAuth(false);
        }
      );
  }, []);

  if (auth === null) return null; // still loading
  return auth ? children : <Navigate to="/" />;
}
