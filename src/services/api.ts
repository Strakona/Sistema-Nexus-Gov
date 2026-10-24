import { Task, ChatMessage, CodeFile, CodeCommit, MentorFeedback, CriteriaEvaluation } from '../types';

export async function fetchAppState() {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch app state');
  return res.json();
}

export async function updateCheckpointStage(checkpointId: number) {
  const res = await fetch('/api/stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkpointId }),
  });
  return res.json();
}

export async function updateTeamMembers(updatedMembers: any[]) {
  const res = await fetch('/api/team/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updatedMembers }),
  });
  return res.json();
}

export async function createTask(task: Partial<Task>) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function sendChatMessage(msg: Partial<ChatMessage>) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  });
  return res.json();
}

export async function addMentorFeedback(fb: Partial<MentorFeedback>) {
  const res = await fetch('/api/mentors/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fb),
  });
  return res.json();
}

export async function saveCodeFile(fileData: Partial<CodeFile> & { modifiedBy?: string; fileId?: string }) {
  const res = await fetch('/api/code/save-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fileData),
  });
  return res.json();
}

export async function commitCodeChange(commitData: {
  fileId: string;
  authorId: string;
  authorName: string;
  message: string;
  content: string;
}) {
  const res = await fetch('/api/code/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commitData),
  });
  return res.json();
}

export async function mergeCodeModules(fileIds: string[], mergedFileName: string) {
  const res = await fetch('/api/code/merge-modules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds, mergedFileName }),
  });
  return res.json();
}

export async function askAiCopilot(prompt: string, contextType: 'general' | 'survey' | 'code' | 'pitch' = 'general') {
  const res = await fetch('/api/ai/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, contextType }),
  });
  return res.json();
}

export async function evaluateProjectWithAi(projectSummaryData: {
  problemText?: string;
  validationText?: string;
  valuePropText?: string;
  interestText?: string;
  mvpDescription?: string;
  businessModelText?: string;
  pitchSummary?: string;
}): Promise<{ success: boolean; evaluation: CriteriaEvaluation }> {
  const res = await fetch('/api/ai/evaluate-govtech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectSummaryData),
  });
  return res.json();
}
