import { Types, Date } from 'mongoose';

export interface IRefreshSession {
  refreshToken: string;
  fingerprint: string;
  expiresIn: number;
  userId: Types.ObjectId;
}
