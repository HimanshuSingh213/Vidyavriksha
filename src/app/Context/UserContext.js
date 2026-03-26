"use client";
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children, session, initialData }) {
  const [displayName, setDisplayName] = useState(initialData?.name || session?.user?.name || "");
  const [program, setProgram] = useState(initialData?.program || "CSE");
  const [targetCGPA, setTargetCGPA] = useState(initialData?.targetCGPA ?? 9.0);
  const [universityScale, setUniversityScale] = useState(initialData?.universityScale ?? 10);
  const [currentCGPA, setCurrentCGPA] = useState(initialData?.currentCGPA ?? null);
  const [currentSem, setCurrentSem] = useState(initialData?.currentSem ?? 1);

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
    setSelectedSem,
    currentSem, 
    setCurrentSem,
    currentCGPA, 
    setCurrentCGPA,
    universityScale, 
    setUniversityScale,
    targetCGPA, 
    setTargetCGPA
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);