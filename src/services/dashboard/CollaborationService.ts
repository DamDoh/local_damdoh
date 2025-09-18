/**
 * Collaboration Service - Advanced project management and team collaboration
 * Provides project boards, workflow automation, document collaboration, and progress tracking
 * Single Responsibility: Team collaboration and project management orchestration
 * Dependencies: Groups, messaging, file storage, user management
 */

import { apiCall } from '@/lib/api-utils';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  progress: number; // 0-100
  ownerId: string;
  teamMembers: ProjectMember[];
  tags: string[];
  budget?: number;
  category: 'farming' | 'business' | 'community' | 'innovation' | 'logistics';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: ProjectPermission[];
}

export interface ProjectPermission {
  resource: 'tasks' | 'documents' | 'budget' | 'team' | 'settings';
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  reporterId: string;
  labels: string[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[]; // task IDs
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'link' | 'file';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  attachments?: TaskAttachment[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  projectId: string;
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
  isFinal: boolean;
  requiredFields: string[];
  automatedActions: WorkflowAction[];
}

export interface WorkflowTransition {
  id: string;
  fromStageId: string;
  toStageId: string;
  name: string;
  conditions: WorkflowCondition[];
  requiredPermissions: string[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowAction {
  type: 'notification' | 'assignment' | 'field_update' | 'integration';
  config: Record<string, any>;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image';
  mimeType: string;
  size: number;
  url: string;
  version: number;
  versions: DocumentVersion[];
  permissions: DocumentPermission[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export interface DocumentVersion {
  version: number;
  url: string;
  size: number;
  createdBy: string;
  createdAt: Date;
  changes?: string;
}

export interface DocumentPermission {
  userId: string;
  permission: 'view' | 'comment' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  projectId: string;
  description: string;
  hours: number;
  date: Date;
  billable: boolean;
  createdAt: Date;
}

export interface ProjectReport {
  id: string;
  projectId: string;
  type: 'progress' | 'time' | 'budget' | 'quality';
  title: string;
  data: any;
  generatedBy: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export class CollaborationService {
  private static instance: CollaborationService;
  private readonly CACHE_KEY = 'collaboration';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Project Management
   */
  async getProjects(userId: string, filters?: { status?: string; category?: string }): Promise<Project[]> {
    try {
      const params = new URLSearchParams({ userId, ...(filters || {}) });
      const result = await apiCall(`/api/collaboration/projects?${params}`) as { projects: Project[] };
      return result.projects;
    } catch (error) {
      console.warn('API unavailable for projects, using defaults');
      return this.getDefaultProjects(userId, filters);
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const result = await apiCall('/api/collaboration/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      }) as { project: Project };
      return result.project;
    } catch (error) {
      console.warn('Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const result = await apiCall(`/api/collaboration/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }) as { project: Project };
      return result.project;
    } catch (error) {
      console.warn('Failed to update project:', error);
      throw error;
    }
  }

  /**
   * Task Management
   */
  async getTasks(projectId: string, filters?: { status?: string; assignee?: string }): Promise<Task[]> {
    try {
      const params = new URLSearchParams({ projectId, ...(filters || {}) });
      const result = await apiCall(`/api/collaboration/tasks?${params}`) as { tasks: Task[] };
      return result.tasks;
    } catch (error) {
      console.warn('API unavailable for tasks, using defaults');
      return this.getDefaultTasks(projectId, filters);
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const result = await apiCall('/api/collaboration/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      }) as { task: Task };
      return result.task;
    } catch (error) {
      console.warn('Failed to create task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const result = await apiCall(`/api/collaboration/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }) as { task: Task };
      return result.task;
    } catch (error) {
      console.warn('Failed to update task:', error);
      throw error;
    }
  }

  async addTaskComment(taskId: string, comment: Omit<TaskComment, 'id' | 'taskId' | 'createdAt'>): Promise<TaskComment> {
    try {
      const result = await apiCall(`/api/collaboration/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify(comment)
      }) as { comment: TaskComment };
      return result.comment;
    } catch (error) {
      console.warn('Failed to add comment:', error);
      throw error;
    }
  }

  /**
   * Workflow Management
   */
  async getWorkflows(projectId: string): Promise<Workflow[]> {
    try {
      const result = await apiCall(`/api/collaboration/workflows?projectId=${projectId}`) as { workflows: Workflow[] };
      return result.workflows;
    } catch (error) {
      console.warn('API unavailable for workflows, using defaults');
      return this.getDefaultWorkflows(projectId);
    }
  }

  async createWorkflow(workflowData: Omit<Workflow, 'id' | 'createdAt'>): Promise<Workflow> {
    try {
      const result = await apiCall('/api/collaboration/workflows', {
        method: 'POST',
        body: JSON.stringify(workflowData)
      }) as { workflow: Workflow };
      return result.workflow;
    } catch (error) {
      console.warn('Failed to create workflow:', error);
      throw error;
    }
  }

  /**
   * Document Collaboration
   */
  async getDocuments(projectId: string): Promise<Document[]> {
    try {
      const result = await apiCall(`/api/collaboration/documents?projectId=${projectId}`) as { documents: Document[] };
      return result.documents;
    } catch (error) {
      console.warn('API unavailable for documents, using defaults');
      return this.getDefaultDocuments(projectId);
    }
  }

  async uploadDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'versions'>): Promise<Document> {
    try {
      const result = await apiCall('/api/collaboration/documents', {
        method: 'POST',
        body: JSON.stringify(documentData)
      }) as { document: Document };
      return result.document;
    } catch (error) {
      console.warn('Failed to upload document:', error);
      throw error;
    }
  }

  /**
   * Time Tracking
   */
  async logTime(timeEntry: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<TimeEntry> {
    try {
      const result = await apiCall('/api/collaboration/time', {
        method: 'POST',
        body: JSON.stringify(timeEntry)
      }) as { timeEntry: TimeEntry };
      return result.timeEntry;
    } catch (error) {
      console.warn('Failed to log time:', error);
      throw error;
    }
  }

  async getTimeEntries(projectId: string, userId?: string, dateRange?: { start: Date; end: Date }): Promise<TimeEntry[]> {
    try {
      const params = new URLSearchParams({ projectId });
      if (userId) params.append('userId', userId);
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }
      const result = await apiCall(`/api/collaboration/time?${params}`) as { timeEntries: TimeEntry[] };
      return result.timeEntries;
    } catch (error) {
      console.warn('API unavailable for time entries, using defaults');
      return this.getDefaultTimeEntries(projectId, userId, dateRange);
    }
  }

  /**
   * Reporting
   */
  async generateReport(projectId: string, type: 'progress' | 'time' | 'budget' | 'quality', period: { start: Date; end: Date }): Promise<ProjectReport> {
    try {
      const result = await apiCall('/api/collaboration/reports', {
        method: 'POST',
        body: JSON.stringify({ projectId, type, period })
      }) as { report: ProjectReport };
      return result.report;
    } catch (error) {
      console.warn('Failed to generate report:', error);
      return this.generateFallbackReport(projectId, type, period);
    }
  }

  // Default data methods
  private getDefaultProjects(userId: string, filters?: { status?: string; category?: string }): Project[] {
    const allProjects: Project[] = [
      {
        id: 'project-1',
        name: 'Organic Maize Supply Chain Optimization',
        description: 'Streamline the supply chain for organic maize from farm to market',
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-06-30'),
        progress: 65,
        ownerId: userId,
        teamMembers: [
          { userId, role: 'owner', joinedAt: new Date('2024-01-15'), permissions: [] },
          { userId: 'user-2', role: 'admin', joinedAt: new Date('2024-01-20'), permissions: [] }
        ],
        tags: ['supply-chain', 'organic', 'maize'],
        budget: 50000,
        category: 'business',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'project-2',
        name: 'Community Irrigation Project',
        description: 'Install community irrigation system for 50+ smallholder farmers',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2024-03-01'),
        dueDate: new Date('2024-08-31'),
        progress: 25,
        ownerId: userId,
        teamMembers: [
          { userId, role: 'owner', joinedAt: new Date('2024-02-01'), permissions: [] }
        ],
        tags: ['irrigation', 'community', 'sustainability'],
        budget: 75000,
        category: 'community',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      }
    ];

    return allProjects.filter(project => {
      if (filters?.status && project.status !== filters.status) return false;
      if (filters?.category && project.category !== filters.category) return false;
      return project.teamMembers.some(member => member.userId === userId);
    });
  }

  private getDefaultTasks(projectId: string, filters?: { status?: string; assignee?: string }): Task[] {
    const allTasks: Task[] = [
      {
        id: 'task-1',
        projectId,
        title: 'Conduct supplier assessment',
        description: 'Evaluate current suppliers and identify improvement opportunities',
        status: 'done',
        priority: 'high',
        assigneeId: 'user-1',
        reporterId: 'user-1',
        labels: ['assessment', 'suppliers'],
        dueDate: new Date('2024-02-15'),
        estimatedHours: 16,
        actualHours: 14,
        dependencies: [],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: 'task-2',
        projectId,
        title: 'Design new logistics workflow',
        description: 'Create optimized workflow for transportation and delivery',
        status: 'in-progress',
        priority: 'high',
        assigneeId: 'user-2',
        reporterId: 'user-1',
        labels: ['logistics', 'workflow'],
        dueDate: new Date('2024-03-01'),
        estimatedHours: 24,
        actualHours: 18,
        dependencies: ['task-1'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: 'task-3',
        projectId,
        title: 'Update quality control procedures',
        description: 'Revise QC procedures based on new organic certification requirements',
        status: 'todo',
        priority: 'medium',
        assigneeId: 'user-1',
        reporterId: 'user-1',
        labels: ['quality', 'certification'],
        dueDate: new Date('2024-03-15'),
        estimatedHours: 12,
        dependencies: ['task-2'],
        attachments: [],
        comments: [],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date()
      }
    ];

    return allTasks.filter(task => {
      if (filters?.status && task.status !== filters.status) return false;
      if (filters?.assignee && task.assigneeId !== filters.assignee) return false;
      return task.projectId === projectId;
    });
  }

  private getDefaultWorkflows(projectId: string): Workflow[] {
    return [
      {
        id: 'workflow-1',
        name: 'Agile Development Workflow',
        description: 'Standard agile workflow for project management',
        projectId,
        stages: [
          {
            id: 'backlog',
            name: 'Backlog',
            description: 'Tasks waiting to be started',
            order: 1,
            color: '#6b7280',
            isFinal: false,
            requiredFields: [],
            automatedActions: []
          },
          {
            id: 'todo',
            name: 'To Do',
            description: 'Tasks ready to be worked on',
            order: 2,
            color: '#3b82f6',
            isFinal: false,
            requiredFields: ['assigneeId'],
            automatedActions: []
          },
          {
            id: 'in-progress',
            name: 'In Progress',
            description: 'Tasks currently being worked on',
            order: 3,
            color: '#f59e0b',
            isFinal: false,
            requiredFields: [],
            automatedActions: []
          },
          {
            id: 'review',
            name: 'Review',
            description: 'Tasks ready for review',
            order: 4,
            color: '#8b5cf6',
            isFinal: false,
            requiredFields: [],
            automatedActions: []
          },
          {
            id: 'done',
            name: 'Done',
            description: 'Completed tasks',
            order: 5,
            color: '#10b981',
            isFinal: true,
            requiredFields: [],
            automatedActions: []
          }
        ],
        transitions: [],
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-15')
      }
    ];
  }

  private getDefaultDocuments(projectId: string): Document[] {
    return [
      {
        id: 'doc-1',
        projectId,
        name: 'Supply Chain Analysis Report',
        description: 'Detailed analysis of current supply chain performance',
        type: 'document',
        mimeType: 'application/pdf',
        size: 2048576,
        url: '/documents/supply-chain-analysis.pdf',
        version: 2,
        versions: [
          {
            version: 1,
            url: '/documents/supply-chain-analysis-v1.pdf',
            size: 1848576,
            createdBy: 'user-1',
            createdAt: new Date('2024-01-20')
          },
          {
            version: 2,
            url: '/documents/supply-chain-analysis-v2.pdf',
            size: 2048576,
            createdBy: 'user-2',
            createdAt: new Date('2024-02-01'),
            changes: 'Updated with Q1 performance data'
          }
        ],
        permissions: [
          {
            userId: 'user-1',
            permission: 'admin',
            grantedBy: 'user-1',
            grantedAt: new Date('2024-01-20')
          },
          {
            userId: 'user-2',
            permission: 'edit',
            grantedBy: 'user-1',
            grantedAt: new Date('2024-01-20')
          }
        ],
        tags: ['analysis', 'supply-chain', 'performance'],
        createdBy: 'user-1',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-01'),
        lastModifiedBy: 'user-2'
      }
    ];
  }

  private getDefaultTimeEntries(projectId: string, userId?: string, dateRange?: { start: Date; end: Date }): TimeEntry[] {
    const entries: TimeEntry[] = [
      {
        id: 'time-1',
        taskId: 'task-1',
        userId: 'user-1',
        projectId,
        description: 'Supplier assessment and data collection',
        hours: 6,
        date: new Date('2024-02-05'),
        billable: true,
        createdAt: new Date('2024-02-05')
      },
      {
        id: 'time-2',
        taskId: 'task-2',
        userId: 'user-2',
        projectId,
        description: 'Workflow design and documentation',
        hours: 8,
        date: new Date('2024-02-10'),
        billable: true,
        createdAt: new Date('2024-02-10')
      }
    ];

    return entries.filter(entry => {
      if (userId && entry.userId !== userId) return false;
      if (dateRange && (entry.date < dateRange.start || entry.date > dateRange.end)) return false;
      return entry.projectId === projectId;
    });
  }

  private generateFallbackReport(projectId: string, type: string, period: { start: Date; end: Date }): ProjectReport {
    const baseData = {
      progress: {
        completedTasks: 12,
        totalTasks: 20,
        completionRate: 0.6,
        overdueTasks: 2,
        upcomingDeadlines: 3
      },
      time: {
        totalHours: 156,
        billableHours: 142,
        averageHoursPerDay: 6.2,
        topContributors: ['user-1', 'user-2'],
        efficiency: 0.85
      },
      budget: {
        allocated: 50000,
        spent: 32000,
        remaining: 18000,
        utilization: 0.64,
        projectedTotal: 48000
      },
      quality: {
        defectRate: 0.02,
        customerSatisfaction: 4.2,
        complianceScore: 0.95,
        reworkRate: 0.05
      }
    };

    return {
      id: `report-${Date.now()}`,
      projectId,
      type: type as any,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      data: baseData[type as keyof typeof baseData],
      generatedBy: 'system',
      generatedAt: new Date(),
      period
    };
  }
}