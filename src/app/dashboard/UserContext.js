"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children, session }) {
  const [displayName, setDisplayName] = useState(session?.user?.name);

  // Load from localStorage on mount if it exists
  useEffect(() => {
    const saved = localStorage.getItem("customDisplayName");
    if (saved) setDisplayName(saved);
  }, []);

  const updateName = (newName) => {
    setDisplayName(newName);
    localStorage.setItem("customDisplayName", newName);

  };

  const value = {
    displayName,
    updateName
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);