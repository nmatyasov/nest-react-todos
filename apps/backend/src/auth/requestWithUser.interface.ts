import { LoginUserDto } from '@auth/dto/auth.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: LoginUserDto;
}

export default RequestWithUser;
