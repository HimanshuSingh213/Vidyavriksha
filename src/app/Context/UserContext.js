"use client";
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children, session, initialData }) {
  const [displayName, setDisplayName] = useState(initialData?.name || session?.user?.name || "");
  const [program, setProgram] = useState(initialData?.program || "CSE");

  const updateName = (newName) => {
    setDisplayName(newName);
  };

  const updateProgram = (newProgram) => {
    setProgram(newProgram);
  };

  const [selectedSem, setSelectedSem] = useState("");

  const value = {
    displayName,
    setDisplayName,
    program,
    setProgram,
    updateName,
    updateProgram,
    selectedSem,
    setSelectedSem
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);