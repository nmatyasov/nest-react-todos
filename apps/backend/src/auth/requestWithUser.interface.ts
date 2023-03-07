import { LoginUserDto } from '@auth/dto/credentialsUser.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: LoginUserDto;
}

export default RequestWithUser;
