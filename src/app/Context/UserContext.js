"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { getUserSettings } from "@/actions/userSettings";

const UserContext = createContext();

export function UserProvider({ children, session, initialData }) {
  const [displayName, setDisplayName] = useState(initialData?.name || session?.user?.name || "");
  const [program, setProgram] = useState(initialData?.program || "CSE");
  const [targetCGPA, setTargetCGPA] = useState(initialData?.targetCGPA ?? 9.0);
  const [universityScale, setUniversityScale] = useState(initialData?.universityScale ?? 10);
  const [currentCGPA, setCurrentCGPA] = useState(initialData?.currentCGPA ?? null);
  const [currentSem, setCurrentSem] = useState(initialData?.currentSem ?? 1);
  const [isManualCGPA, setIsManualCGPA] = useState(
    initialData?.autoCalculateCGPA !== undefined
      ? !initialData.autoCalculateCGPA
      : !!initialData?.currentCGPA && initialData.currentCGPA > 0
  );

  const updateName = (newName) => {
    setDisplayName(newName);
  };

  const updateProgram = (newProgram) => {
    setProgram(newProgram);
  };

  // Sync methods to update context from server responses
  const updateCGPA = useCallback((newCGPA) => {
    setCurrentCGPA(newCGPA);
  }, []);

  const updateSemester = useCallback((newSem) => {
    setCurrentSem(newSem);
  }, []);

  const updateTargetCGPA = useCallback((newTargetCGPA) => {
    setTargetCGPA(newTargetCGPA);
  }, []);

  const updateAutoCalculateCGPA = useCallback((newAutoCalculate) => {
    setIsManualCGPA(!newAutoCalculate);
  }, []);

  const updateUniversityScale = useCallback((newScale) => {
    setUniversityScale(newScale);
  }, []);

  const updateProgramName = useCallback((newProgram) => {
    setProgram(newProgram);
  }, []);

  // Refresh user data from server
  const refreshUserData = useCallback(async () => {
    try {
      const data = await getUserSettings();
      if (data) {
        if (data.currentCGPA !== undefined) setCurrentCGPA(data.currentCGPA);
        if (data.currentSem !== undefined) setCurrentSem(data.currentSem);
        if (data.targetCGPA !== undefined) setTargetCGPA(data.targetCGPA);
        if (data.autoCalculateCGPA !== undefined) setIsManualCGPA(!data.autoCalculateCGPA);
        if (data.universityScale !== undefined) setUniversityScale(data.universityScale);
        if (data.program !== undefined) setProgram(data.program);
        if (data.name !== undefined) setDisplayName(data.name);
      }
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  }, []);

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
    setTargetCGPA,
    isManualCGPA,
    setIsManualCGPA,
    // Sync methods
    updateCGPA,
    updateSemester,
    updateTargetCGPA,
    updateAutoCalculateCGPA,
    updateUniversityScale,
    updateProgramName,
    refreshUserData
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
