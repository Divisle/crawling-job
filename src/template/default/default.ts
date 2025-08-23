export interface DefaultJob {
  title: string;
  location: string;
  department: string;
  href: string;
}

export interface DefaultJobMessageData {
  newJobs: DefaultJob[];
  deleteJobs: DefaultJob[];
  updateJobs: DefaultJob[];
}

export function buildDefaultJobMessage(data: DefaultJobMessageData) {
  // Implementation here
}
