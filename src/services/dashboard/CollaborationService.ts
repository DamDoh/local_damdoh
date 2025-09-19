/**
 * Advanced Collaboration Service
 * Enables real-time collaboration, shared workspaces, and team features
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  stakeholderType: string;
  online: boolean;
  lastSeen: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: TeamMember[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
  settings: TeamSettings;
}

export interface TeamMember {
  userId: string;
  user: User;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamId: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  progress: number;
  members: ProjectMember[];
  tasks: Task[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  user: User;
  role: 'lead' | 'contributor' | 'reviewer';
  assignedTasks: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  assignee?: User;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
  mentions: string[];
}

export interface Document {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  collaborators: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TeamSettings {
  isPublic: boolean;
  allowJoinRequests: boolean;
  requireApproval: boolean;
  defaultRole: 'member' | 'viewer';
  notifications: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectUpdates: boolean;
    teamInvites: boolean;
  };
}

export interface CollaborationSession {
  id: string;
  type: 'document' | 'task' | 'project' | 'chat';
  resourceId: string;
  participants: User[];
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  author: User;
  channelId: string;
  type: 'text' | 'file' | 'system';
  timestamp: Date;
  edited: boolean;
  editedAt?: Date;
  reactions: MessageReaction[];
  thread?: Message[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  teamId?: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'task_assigned' | 'task_completed' | 'project_created' | 'message_sent' | 'document_shared';
  userId: string;
  resourceId: string;
  data: any;
  timestamp: Date;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private currentUser: User | null = null;
  private teams: Map<string, Team> = new Map();
  private projects: Map<string, Project> = new Map();
  private tasks: Map<string, Task> = new Map();
  private channels: Map<string, Channel> = new Map();
  private sessions: Map<string, CollaborationSession> = new Map();
  private eventListeners: ((event: CollaborationEvent) => void)[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  private initializeMockData(): void {
    // Mock teams
    const team1: Team = {
      id: 'team_1',
      name: 'Sustainable Farming Collective',
      description: 'A collaborative network of farmers focused on sustainable agriculture',
      members: [],
      projects: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      settings: {
        isPublic: true,
        allowJoinRequests: true,
        requireApproval: false,
        defaultRole: 'member',
        notifications: {
          taskAssigned: true,
          taskCompleted: true,
          projectUpdates: true,
          teamInvites: true
        }
      }
    };

    // Mock project
    const project1: Project = {
      id: 'project_1',
      name: 'Organic Certification Program',
      description: 'Collaborative effort to achieve organic certification for 50 farms',
      teamId: 'team_1',
      status: 'active',
      startDate: new Date('2024-02-01'),
      progress: 65,
      members: [],
      tasks: [],
      documents: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date()
    };

    this.teams.set(team1.id, team1);
    this.projects.set(project1.id, project1);
  }

  // User management
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Team management
  async createTeam(teamData: Omit<Team, 'id' | 'members' | 'projects' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const team: Team = {
      ...teamData,
      id: `team_${Date.now()}`,
      members: [],
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.teams.set(team.id, team);
    this.emitEvent({
      type: 'project_created',
      userId: this.currentUser?.id || '',
      resourceId: team.id,
      data: { team },
      timestamp: new Date()
    });

    return team;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team =>
      team.members.some(member => member.userId === userId)
    );
  }

  async joinTeam(teamId: string, userId: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');

    const isMember = team.members.some(member => member.userId === userId);
    if (isMember) return;

    const member: TeamMember = {
      userId,
      user: { id: userId, name: 'User', email: '', role: 'member', stakeholderType: 'Farmer', online: true, lastSeen: new Date() },
      role: team.settings.defaultRole,
      joinedAt: new Date(),
      permissions: ['read']
    };

    team.members.push(member);
    this.emitEvent({
      type: 'user_joined',
      userId,
      resourceId: teamId,
      data: { member },
      timestamp: new Date()
    });
  }

  // Project management
  async createProject(projectData: Omit<Project, 'id' | 'members' | 'tasks' | 'documents' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      ...projectData,
      id: `project_${Date.now()}`,
      members: [],
      tasks: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(project.id, project);

    // Add to team's projects
    const team = this.teams.get(project.teamId);
    if (team) {
      team.projects.push(project);
    }

    this.emitEvent({
      type: 'project_created',
      userId: this.currentUser?.id || '',
      resourceId: project.id,
      data: { project },
      timestamp: new Date()
    });

    return project;
  }

  async getTeamProjects(teamId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.teamId === teamId);
  }

  // Task management
  async createTask(taskData: Omit<Task, 'id' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      comments: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);

    // Add to project's tasks
    const project = this.projects.get(task.projectId);
    if (project) {
      project.tasks.push(task);
    }

    this.emitEvent({
      type: 'task_assigned',
      userId: this.currentUser?.id || '',
      resourceId: task.id,
      data: { task },
      timestamp: new Date()
    });

    return task;
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();

    if (status === 'completed' && oldStatus !== 'completed') {
      this.emitEvent({
        type: 'task_completed',
        userId: this.currentUser?.id || '',
        resourceId: taskId,
        data: { task },
        timestamp: new Date()
      });
    }
  }

  async addTaskComment(taskId: string, content: string): Promise<Comment> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      content,
      authorId: this.currentUser?.id || '',
      author: this.currentUser!,
      taskId,
      createdAt: new Date(),
      updatedAt: new Date(),
      mentions: []
    };

    task.comments.push(comment);
    return comment;
  }

  // Real-time collaboration sessions
  async startCollaborationSession(type: CollaborationSession['type'], resourceId: string): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: `session_${Date.now()}`,
      type,
      resourceId,
      participants: this.currentUser ? [this.currentUser] : [],
      startedAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async joinCollaborationSession(sessionId: string, user: User): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const isParticipant = session.participants.some(p => p.id === user.id);
    if (!isParticipant) {
      session.participants.push(user);
    }

    session.lastActivity = new Date();
  }

  // Communication channels
  async createChannel(channelData: Omit<Channel, 'id' | 'createdAt' | 'unreadCount'>): Promise<Channel> {
    const channel: Channel = {
      ...channelData,
      id: `channel_${Date.now()}`,
      createdAt: new Date(),
      unreadCount: 0
    };

    this.channels.set(channel.id, channel);
    return channel;
  }

  async sendMessage(channelId: string, content: string, type: Message['type'] = 'text'): Promise<Message> {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const message: Message = {
      id: `message_${Date.now()}`,
      content,
      authorId: this.currentUser?.id || '',
      author: this.currentUser!,
      channelId,
      type,
      timestamp: new Date(),
      edited: false,
      reactions: []
    };

    channel.lastMessage = message;

    // Update unread count for other members
    channel.members.forEach(memberId => {
      if (memberId !== this.currentUser?.id) {
        channel.unreadCount++;
      }
    });

    this.emitEvent({
      type: 'message_sent',
      userId: this.currentUser?.id || '',
      resourceId: channelId,
      data: { message },
      timestamp: new Date()
    });

    return message;
  }

  // Document collaboration
  async shareDocument(projectId: string, document: Omit<Document, 'id' | 'uploadedAt' | 'version'>): Promise<Document> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const doc: Document = {
      ...document,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date(),
      version: 1
    };

    project.documents.push(doc);

    this.emitEvent({
      type: 'document_shared',
      userId: this.currentUser?.id || '',
      resourceId: projectId,
      data: { document: doc },
      timestamp: new Date()
    });

    return doc;
  }

  // Event system
  onCollaborationEvent(callback: (event: CollaborationEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(event: CollaborationEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // Getters
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getChannel(channelId: string): Channel | undefined {
    return this.channels.get(channelId);
  }

  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  // Search and filtering
  searchTasks(query: string, projectId?: string): Task[] {
    const tasks = projectId
      ? Array.from(this.tasks.values()).filter(task => task.projectId === projectId)
      : Array.from(this.tasks.values());

    return tasks.filter(task =>
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  searchProjects(query: string, teamId?: string): Project[] {
    const projects = teamId
      ? Array.from(this.projects.values()).filter(project => project.teamId === teamId)
      : Array.from(this.projects.values());

    return projects.filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}