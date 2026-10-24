export type RoleType = 'ux' | 'tech' | 'pitch' | 'all';

export interface TeamMember {
  id: string;
  name: string;
  role: RoleType;
  roleTitle: string;
  avatar: string;
  status: 'online' | 'busy' | 'away';
  activeTask?: string;
  responsibilities: string[];
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedRole: RoleType;
  assignedMemberId?: string;
  checkpointId?: number; // Checkpoint 1 to 7
  criterionId?: number;  // Criteria 1 to 7
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  tags: string[];
}

export interface CheckpointInfo {
  id: number;
  name: string;
  timeRange: string;
  description: string;
  deliverable: string;
  relatedCriteria: string[];
  isCompleted: boolean;
}

export interface GuidedStageChecklist {
  role: RoleType;
  roleTitle: string;
  tasks: string[];
}

export interface GuidedStage {
  checkpointId: number;
  title: string;
  timeRange: string;
  durationMinutes: number;
  objective: string;
  mandatoryDeliverable: string;
  mentorTip: string;
  checklists: GuidedStageChecklist[];
}

export interface ChatMessage {
  id: string;
  channel: string;
  authorId: string;
  authorName: string;
  authorRole: RoleType;
  authorAvatar: string;
  content: string;
  codeSnippet?: string;
  timestamp: string;
  isAi?: boolean;
}

export interface MentorFeedback {
  id: string;
  checkpointId: number;
  mentorName: string;
  area: string;
  feedback: string;
  actionItems: string[];
  timestamp: string;
}

export interface CodeFile {
  id: string;
  path: string;
  language: 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'sql' | 'python';
  content: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface CodeCommit {
  id: string;
  fileId: string;
  filePath: string;
  authorId: string;
  authorName: string;
  message: string;
  content: string;
  previousContent?: string;
  timestamp: string;
}

export interface CriterionScore {
  criterionNumber: number;
  title: string;
  score: number;
  feedback: string;
  recommendations: string[];
}

export interface CriteriaEvaluation {
  totalScore: number;
  evaluatedAt: string;
  criteria: CriterionScore[];
  summary: string;
  topStrengths: string[];
  keyRisks: string[];
}

export interface PitchSlide {
  id: number;
  title: string;
  criterionRelated: string;
  bulletPoints: string[];
  speakerNotes: string;
  metricHighlight?: string;
}

export interface GitHubIntegration {
  enabled: boolean;
  repoUrl: string;
  repoName: string;
  branch: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSyncedAt?: string;
  latestCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
  starsCount?: number;
  openIssuesCount?: number;
  recentCommits?: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
}

export interface GoogleDriveDoc {
  id: string;
  title: string;
  type: 'folder' | 'document' | 'presentation' | 'spreadsheet' | 'pdf' | 'link';
  url: string;
  description?: string;
  category?: 'pitch' | 'validation' | 'regulation' | 'general' | 'design';
  addedBy?: string;
  updatedAt?: string;
}

export interface GoogleDriveIntegration {
  enabled: boolean;
  folderUrl: string;
  status: 'connected' | 'disconnected';
  sharedDocs: GoogleDriveDoc[];
}

export interface VercelIntegration {
  enabled: boolean;
  projectName: string;
  deploymentUrl: string;
  previewUrl?: string;
  environment: 'Production' | 'Preview';
  status: 'ready' | 'building' | 'error' | 'queued' | 'disconnected';
  lastDeployedAt?: string;
  branch?: string;
  commitHash?: string;
}

export interface TeamIntegrations {
  github: GitHubIntegration;
  googleDrive: GoogleDriveIntegration;
  vercel: VercelIntegration;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}
