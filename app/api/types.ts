export interface Tasks {
  [status: string]: string[];
}

export interface SnapshotDoc {
  date: number;
  fieldValue: string;
  tasks: Tasks;
}

export interface Stats {}
