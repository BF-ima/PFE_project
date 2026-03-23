import { useState, useEffect } from "react";

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res  = await fetch("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("useCurrentUser error:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchMe();
  }, []);

  return { currentUser, loadingUser };
};

export default useCurrentUser;