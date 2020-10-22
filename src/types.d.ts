// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  sourcePrio?: number; //nr from 1, 1 is highest priority
}

interface Memory {
  uuid: number;
  log: any;
}

interface RoleCount<T> {
  [Key: string]: T;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
