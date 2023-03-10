import { JwtPayload } from '@libs/payload.interface';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export default RequestWithUser;
