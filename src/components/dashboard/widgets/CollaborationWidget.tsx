/**
 * Collaboration Widget - Advanced project management and team collaboration
 * Displays project boards, workflow automation, document collaboration, and progress tracking
 * Single Responsibility: Team collaboration visualization and interaction
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FolderKanban, Users, FileText, Clock, CheckCircle,
  AlertCircle, Plus, MoreHorizontal, Calendar, Target,
  BarChart3, RefreshCw, MessageSquare, Paperclip
} from 'lucide-react';
import { CollaborationService, Project, Task } from "@/services/dashboard/CollaborationService";
import { useAuth } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

interface CollaborationWidgetProps {
  defaultTab?: 'projects' | 'tasks' | 'documents' | 'time';
  compact?: boolean;
}

export const CollaborationWidget: React.FC<CollaborationWidgetProps> = ({
  defaultTab = 'projects',
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const collaborationService = CollaborationService.getInstance();

  const loadData = async (showRefreshIndicator = false) => {
    if (!user?.id) return;

    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [projectsData, tasksData] = await Promise.all([
        collaborationService.getProjects(user.id),
        selectedProject ? collaborationService.getTasks(selectedProject) : Promise.resolve([])
      ]);

      setProjects(projectsData);
      setTasks(tasksData);

      // Auto-select first project if none selected
      if (!selectedProject && projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      toast({
        title: "Error",
        description: "Failed to load collaboration data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, selectedProject]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'backlog': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-indigo-800">
            <FolderKanban className="h-5 w-5 mr-2 text-indigo-600 animate-pulse" />
            Team Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    const activeProjects = projects.filter(p => p.status === 'active');
    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done');

    return (
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <FolderKanban className="h-5 w-5 text-indigo-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-indigo-900">
            {activeProjects.length} active projects
          </div>
          <div className="text-xs text-indigo-700">
            {tasks.length} tasks • {overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'On track'}
          </div>
        </div>
        <CheckCircle className="h-4 w-4 text-green-600" />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-indigo-800">
            <FolderKanban className="h-5 w-5 mr-2 text-indigo-600" />
            Team Collaboration
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-indigo-600">
          Project management, task tracking, and team collaboration
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects" className="flex items-center gap-1">
              <FolderKanban className="h-3 w-3" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                <p className="text-indigo-600 text-sm">No projects yet</p>
                <p className="text-indigo-500 text-xs mt-1">Create your first project to get started!</p>
                <Button className="mt-3" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{project.name}</h4>
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {project.status}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.teamMembers.length} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {project.progress}% complete
                          </span>
                          {project.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {formatDate(project.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Team Avatars */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex -space-x-2">
                        {project.teamMembers.slice(0, 3).map((member, index) => (
                          <Avatar key={member.userId} className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {member.userId.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="w-6 h-6 bg-indigo-100 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-xs text-indigo-600">+{project.teamMembers.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {/* Project Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-indigo-700">Project:</span>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="text-sm border border-indigo-200 rounded px-2 py-1 bg-white"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                <p className="text-indigo-600 text-sm">No tasks in this project</p>
                <p className="text-indigo-500 text-xs mt-1">Add tasks to start collaborating!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-white rounded-lg border border-indigo-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                          <Badge className={`text-xs ${getTaskStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {task.assigneeId && (
                            <span className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-xs">
                                  {task.assigneeId.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              Assigned
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {formatDate(task.dueDate)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {task.comments.length} comments
                          </span>
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {task.attachments.length} files
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
              <p className="text-indigo-600 text-sm">Document collaboration</p>
              <p className="text-indigo-500 text-xs mt-1">Share and collaborate on project documents</p>
              <Button className="mt-3" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
              <p className="text-indigo-600 text-sm">Time tracking</p>
              <p className="text-indigo-500 text-xs mt-1">Log and track time spent on tasks</p>
              <Button className="mt-3" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};