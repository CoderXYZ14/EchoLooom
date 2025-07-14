"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  participants: number;
  scheduledTime: Date;
  dailyRoomName: string;
  isHost: boolean;
  duration: number;
}

interface RawMeetingData {
  id: string;
  title: string;
  scheduledTime: string | Date;
  duration: number;
  participants?:
    | Array<{ email: string; name: string; joined: boolean }>
    | number;
  dailyRoomName: string;
}

interface DashboardContextType {
  addNewMeetingToState: (
    newMeeting: RawMeetingData,
    replaceId?: string
  ) => void;
  upcomingMeetings: UpcomingMeeting[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
  addNewMeetingToState: (
    newMeeting: RawMeetingData,
    replaceId?: string
  ) => void;
  upcomingMeetings: UpcomingMeeting[];
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  addNewMeetingToState,
  upcomingMeetings,
}) => {
  return (
    <DashboardContext.Provider
      value={{
        addNewMeetingToState,
        upcomingMeetings,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
