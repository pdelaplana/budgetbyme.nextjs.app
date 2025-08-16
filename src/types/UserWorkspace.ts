import type { Entity } from './Entity';

export interface UserWorkspace extends Entity {
  email: string;
  name: string;
  preferences: {
    language: string;
    currency: string;
  };
}
