
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationStatus {
  @ApiProperty({ description: 'Registration status true or false'})
  success: boolean;
  @ApiProperty({ description: 'User message'})
  message: string;
  @ApiProperty({ description: 'Redirect URL for login'})
  url:string;
}
