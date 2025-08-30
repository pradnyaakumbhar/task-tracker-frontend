import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from "react";
import axios from 'axios';
import { useAuth } from './authContext';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Space {
  id: string;
  name: string;
  spaceNumber: string;
  _count: {
    tasks: number;
  };
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  number: string;
  memberEmails: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  spaces: Space[];
  _count: {
    spaces: number;
    members: number;
  };
}

export interface WorkspaceDetails extends Workspace {
  owner: User;
  members: User[];
}

interface WorkspacesResponse {
  message: string;
  workspaces: Workspace[];
}

interface WorkspaceDetailsResponse {
  message: string;
  workspace: WorkspaceDetails;
}

export interface WorkspaceContextType {
  // workspace list
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
  
  // workspace information
  workspaceDetails: WorkspaceDetails | null;
  detailsLoading: boolean;
  detailsError: string | null;
  
  // Actions
  setSelectedWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  fetchWorkspaceDetails: (workspaceId: string) => Promise<void>;
  clearWorkspaceDetails: () => void;
  
  // Helper functions
  getWorkspaceByNumber: (number: string) => Workspace | undefined;
  getSpaceByNumber: (workspaceNumber: string, spaceNumber: string) => Space | undefined;
  getWorkspaceIdByNumber: (number: string) => string | undefined;
  getSpaceIdByNumber: (workspaceNumber: string, spaceNumber: string) => string | undefined;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<WorkspaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setSelectedWorkspace(null);
      setWorkspaceDetails(null);
      setError(null);
      setDetailsError(null);
    }
  }, [token, user]);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces]);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceDetails(selectedWorkspace.id);
    } else {
      clearWorkspaceDetails();
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async (): Promise<void> => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<WorkspacesResponse>(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user/workspaces`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data && response.data.workspaces) {
        setWorkspaces(response.data.workspaces);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceDetails = async (workspaceId: string): Promise<void> => {
    if (!token) return;

    try {
      setDetailsLoading(true);
      setDetailsError(null);

      const response = await axios.post<WorkspaceDetailsResponse>(
        `${import.meta.env.VITE_APP_BASE_URL}/api/workspace/details`,
        { workspaceId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data && response.data.workspace) {
        setWorkspaceDetails(response.data.workspace);
      }
    } catch (err) {
      console.error('Error fetching workspace details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearWorkspaceDetails = (): void => {
    setWorkspaceDetails(null);
    setDetailsError(null);
  };

  // get workspace by number
  const getWorkspaceByNumber = (number: string): Workspace | undefined => {
    return workspaces.find(workspace => workspace.number === number);
  };

  // get workspace ID by number
  const getWorkspaceIdByNumber = (number: string): string | undefined => {
    const workspace = getWorkspaceByNumber(number);
    return workspace?.id;
  };

  // get space by number
  const getSpaceByNumber = (workspaceNumber: string, spaceNumber: string): Space | undefined => {
    if (workspaceDetails && workspaceDetails.number === workspaceNumber) {
      return workspaceDetails.spaces.find(space => space.spaceNumber === spaceNumber);
    }
    const workspace = getWorkspaceByNumber(workspaceNumber);
    if (!workspace) return undefined;
    return workspace.spaces.find(space => space.spaceNumber === spaceNumber);
  };
  // get space ID by number
  const getSpaceIdByNumber = (workspaceNumber: string, spaceNumber: string): string | undefined => {
    const space = getSpaceByNumber(workspaceNumber, spaceNumber);
    return space?.id;
  };

  const refreshWorkspaces = async (): Promise<void> => {
    await fetchWorkspaces();
    if (selectedWorkspace) {
      await fetchWorkspaceDetails(selectedWorkspace.id);
    }
  };

  // Update selected workspace
  const handleSetSelectedWorkspace = (workspace: Workspace): void => {
    setSelectedWorkspace(workspace);
  };

  const value: WorkspaceContextType = {
    workspaces,
    selectedWorkspace,
    loading,
    error,
    workspaceDetails,
    detailsLoading,
    detailsError,
    setSelectedWorkspace: handleSetSelectedWorkspace,
    refreshWorkspaces,
    fetchWorkspaceDetails,
    clearWorkspaceDetails,
    getWorkspaceByNumber,
    getSpaceByNumber,
    getWorkspaceIdByNumber,
    getSpaceIdByNumber,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};