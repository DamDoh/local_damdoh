/**
 * Collaboration Panel - Advanced team collaboration interface
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  CheckSquare,
  FolderOpen,
  UserPlus,
  Settings,
  X,
  Send,
  Paperclip,
  MoreVertical
} from 'lucide-react';
import { useCollaboration, useTeamCollaboration, useProjectCollaboration } from '@/hooks/useCollaboration';
import { Team, Project, Task, Channel, Message } from '@/services/dashboard/CollaborationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    userTeams,
    createTeam,
    joinTeam,
    createChannel,
    sendMessage,
    channels,
    loading
  } = useCollaboration();

  const [activeTab, setActiveTab] = useState<'teams' | 'projects' | 'tasks' | 'chat'>('teams');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Team collaboration
  const { projects: teamProjects, createProject } = useTeamCollaboration(selectedTeam?.id || '');

  // Project collaboration
  const { tasks: projectTasks, createTask, updateTaskStatus } = useProjectCollaboration(selectedProject?.id || '');

  const handleCreateTeam = async () => {
    try {
      const teamName = prompt('Enter team name:');
      if (!teamName) return;

      const teamDescription = prompt('Enter team description:');
      await createTeam({
        name: teamName,
        description: teamDescription || '',
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
      });
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!selectedTeam) return;

    try {
      const projectName = prompt('Enter project name:');
      if (!projectName) return;

      const projectDescription = prompt('Enter project description:');
      await createProject({
        name: projectName,
        description: projectDescription || '',
        teamId: selectedTeam.id,
        status: 'planning',
        startDate: new Date(),
        progress: 0
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProject) return;

    try {
      const taskTitle = prompt('Enter task title:');
      if (!taskTitle) return;

      const taskDescription = prompt('Enter task description:');
      await createTask({
        title: taskTitle,
        description: taskDescription || '',
        projectId: selectedProject.id,
        status: 'todo',
        priority: 'medium',
        tags: [],
        createdBy: 'current_user' // Should be dynamic
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChannel || !newMessage.trim()) return;

    try {
      await sendMessage(selectedChannel.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${className}`}>
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Collaboration Hub</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'projects', label: 'Projects', icon: FolderOpen },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 p-3 text-center transition-colors ${
                activeTab === id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'teams' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Your Teams</h3>
                <Button size="sm" onClick={handleCreateTeam}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Team
                </Button>
              </div>

              {loading.teams ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {userTeams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{team.name}</h4>
                          <p className="text-sm text-gray-600">{team.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {team.members.length}
                          </div>
                          <div className="text-xs text-gray-500">members</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-4">
              {selectedTeam ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{selectedTeam.name} Projects</h3>
                    <Button size="sm" onClick={handleCreateProject}>
                      <Plus className="h-4 w-4 mr-1" />
                      New Project
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {teamProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProject?.id === project.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-600">{project.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {project.progress}%
                            </div>
                            <div className="text-xs text-gray-500">{project.status}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Team</h3>
                  <p className="text-gray-600">Choose a team to view its projects</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-4">
              {selectedProject ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{selectedProject.name} Tasks</h3>
                    <Button size="sm" onClick={handleCreateTask}>
                      <Plus className="h-4 w-4 mr-1" />
                      New Task
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {projectTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'urgent' ? 'bg-red-200 text-red-900' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                          >
                            {task.status === 'completed' ? 'Reopen' : 'Complete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                  <p className="text-gray-600">Choose a project to view its tasks</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Channel List */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Channels</h3>
                  <Button size="sm" onClick={() => createChannel({
                    name: 'general',
                    type: 'public',
                    teamId: selectedTeam?.id,
                    members: [],
                    createdBy: 'current_user'
                  })}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedChannel?.id === channel.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#{channel.name}</span>
                        {channel.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {channel.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedChannel ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      <div className="space-y-4">
                        {/* Mock messages - in real app, load from API */}
                        <div className="text-center text-gray-500 text-sm py-4">
                          Welcome to #{selectedChannel.name}
                        </div>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <Input
                          placeholder={`Message #${selectedChannel.name}`}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Channel</h3>
                      <p className="text-gray-600">Choose a channel to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;