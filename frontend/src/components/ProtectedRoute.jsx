import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    axios.get("/auth/me").then(
      () => setAuth(true),
      () => setAuth(false)
    );
  }, []);

  if (auth === null) return null;
  return auth ? children : <Navigate to="/" />;
}
