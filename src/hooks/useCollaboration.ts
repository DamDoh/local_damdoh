/**
 * Collaboration Hook - Provides advanced collaboration functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import {
  CollaborationService,
  Team,
  Project,
  Task,
  User,
  Channel,
  Message,
  CollaborationEvent
} from '@/services/dashboard/CollaborationService';

export interface UseCollaborationReturn {
  // Current user
  currentUser: User | null;

  // Teams
  userTeams: Team[];
  createTeam: (teamData: Omit<Team, 'id' | 'members' | 'projects' | 'createdAt' | 'updatedAt'>) => Promise<Team>;
  joinTeam: (teamId: string) => Promise<void>;

  // Projects
  teamProjects: Project[];
  createProject: (projectData: Omit<Project, 'id' | 'members' | 'tasks' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  getTeamProjects: (teamId: string) => Promise<Project[]>;

  // Tasks
  projectTasks: Task[];
  createTask: (taskData: Omit<Task, 'id' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  addTaskComment: (taskId: string, content: string) => Promise<void>;

  // Communication
  channels: Channel[];
  createChannel: (channelData: Omit<Channel, 'id' | 'createdAt' | 'unreadCount'>) => Promise<Channel>;
  sendMessage: (channelId: string, content: string, type?: Message['type']) => Promise<Message>;

  // Search
  searchTasks: (query: string, projectId?: string) => Task[];
  searchProjects: (query: string, teamId?: string) => Project[];

  // Events
  onCollaborationEvent: (callback: (event: CollaborationEvent) => void) => () => void;

  // Loading states
  loading: {
    teams: boolean;
    projects: boolean;
    tasks: boolean;
    channels: boolean;
  };
}

export const useCollaboration = (): UseCollaborationReturn => {
  const { user } = useAuth();
  const collaborationService = CollaborationService.getInstance();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [teamProjects, setTeamProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState({
    teams: false,
    projects: false,
    tasks: false,
    channels: false
  });

  // Initialize current user
  useEffect(() => {
    if (user) {
      const collabUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        stakeholderType: user.role, // Map role to stakeholder type
        online: true,
        lastSeen: new Date()
      };

      setCurrentUser(collabUser);
      collaborationService.setCurrentUser(collabUser);
    }
  }, [user]);

  // Load user teams
  const loadUserTeams = useCallback(async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, teams: true }));
    try {
      const teams = await collaborationService.getUserTeams(currentUser.id);
      setUserTeams(teams);
    } catch (error) {
      console.error('Failed to load user teams:', error);
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserTeams();
  }, [loadUserTeams]);

  // Team operations
  const createTeam = useCallback(async (teamData: Omit<Team, 'id' | 'members' | 'projects' | 'createdAt' | 'updatedAt'>) => {
    const team = await collaborationService.createTeam(teamData);
    setUserTeams(prev => [...prev, team]);
    return team;
  }, []);

  const joinTeam = useCallback(async (teamId: string) => {
    if (!currentUser) return;
    await collaborationService.joinTeam(teamId, currentUser.id);
    await loadUserTeams(); // Refresh teams
  }, [currentUser, loadUserTeams]);

  // Project operations
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'members' | 'tasks' | 'documents' | 'createdAt' | 'updatedAt'>) => {
    const project = await collaborationService.createProject(projectData);
    setTeamProjects(prev => [...prev, project]);
    return project;
  }, []);

  const getTeamProjects = useCallback(async (teamId: string) => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const projects = await collaborationService.getTeamProjects(teamId);
      setTeamProjects(projects);
      return projects;
    } catch (error) {
      console.error('Failed to load team projects:', error);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, []);

  // Task operations
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt'>) => {
    const task = await collaborationService.createTask(taskData);
    setProjectTasks(prev => [...prev, task]);
    return task;
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    await collaborationService.updateTaskStatus(taskId, status);
    setProjectTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status, updatedAt: new Date() } : task
      )
    );
  }, []);

  const addTaskComment = useCallback(async (taskId: string, content: string) => {
    await collaborationService.addTaskComment(taskId, content);
    // Refresh tasks to get updated comments
    setProjectTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          // In a real app, you'd fetch the updated task with comments
          return { ...task, updatedAt: new Date() };
        }
        return task;
      })
    );
  }, []);

  // Communication operations
  const createChannel = useCallback(async (channelData: Omit<Channel, 'id' | 'createdAt' | 'unreadCount'>) => {
    const channel = await collaborationService.createChannel(channelData);
    setChannels(prev => [...prev, channel]);
    return channel;
  }, []);

  const sendMessage = useCallback(async (channelId: string, content: string, type: Message['type'] = 'text') => {
    const message = await collaborationService.sendMessage(channelId, content, type);
    // Update channel's last message
    setChannels(prev =>
      prev.map(channel =>
        channel.id === channelId
          ? { ...channel, lastMessage: message, unreadCount: 0 }
          : channel
      )
    );
    return message;
  }, []);

  // Search operations
  const searchTasks = useCallback((query: string, projectId?: string) => {
    return collaborationService.searchTasks(query, projectId);
  }, []);

  const searchProjects = useCallback((query: string, teamId?: string) => {
    return collaborationService.searchProjects(query, teamId);
  }, []);

  // Event handling
  const onCollaborationEvent = useCallback((callback: (event: CollaborationEvent) => void) => {
    return collaborationService.onCollaborationEvent(callback);
  }, []);

  return {
    currentUser,
    userTeams,
    createTeam,
    joinTeam,
    teamProjects,
    createProject,
    getTeamProjects,
    projectTasks,
    createTask,
    updateTaskStatus,
    addTaskComment,
    channels,
    createChannel,
    sendMessage,
    searchTasks,
    searchProjects,
    onCollaborationEvent,
    loading
  };
};

// Hook for team collaboration
export const useTeamCollaboration = (teamId: string) => {
  const {
    getTeamProjects,
    teamProjects,
    createProject,
    loading
  } = useCollaboration();

  useEffect(() => {
    if (teamId) {
      getTeamProjects(teamId);
    }
  }, [teamId, getTeamProjects]);

  return {
    projects: teamProjects,
    createProject: (projectData: Omit<Project, 'id' | 'members' | 'tasks' | 'documents' | 'createdAt' | 'updatedAt'>) =>
      createProject({ ...projectData, teamId }),
    loading: loading.projects
  };
};

// Hook for project collaboration
export const useProjectCollaboration = (projectId: string) => {
  const {
    createTask,
    updateTaskStatus,
    addTaskComment,
    projectTasks,
    loading
  } = useCollaboration();

  // In a real app, you'd load tasks for the project
  useEffect(() => {
    if (projectId) {
      // Load project tasks
      console.log('Loading tasks for project:', projectId);
    }
  }, [projectId]);

  return {
    tasks: projectTasks,
    createTask: (taskData: Omit<Task, 'id' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt'>) =>
      createTask({ ...taskData, projectId }),
    updateTaskStatus,
    addTaskComment,
    loading: loading.tasks
  };
};

// Hook for real-time collaboration sessions
export const useCollaborationSession = (type: 'document' | 'task' | 'project' | 'chat', resourceId: string) => {
  const collaborationService = CollaborationService.getInstance();
  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState<User[]>([]);

  useEffect(() => {
    const startSession = async () => {
      try {
        const newSession = await collaborationService.startCollaborationSession(type, resourceId);
        setSession(newSession);
        setParticipants(newSession.participants);
      } catch (error) {
        console.error('Failed to start collaboration session:', error);
      }
    };

    startSession();
  }, [type, resourceId]);

  const joinSession = useCallback(async (user: User) => {
    if (session) {
      await collaborationService.joinCollaborationSession(session.id, user);
      setParticipants(prev => {
        const exists = prev.some(p => p.id === user.id);
        return exists ? prev : [...prev, user];
      });
    }
  }, [session]);

  return {
    session,
    participants,
    joinSession,
    isActive: session?.isActive || false
  };
};