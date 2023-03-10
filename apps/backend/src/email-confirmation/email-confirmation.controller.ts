import JwtAuthenticationGuard from '@auth/guards/jwt-authentication.guard';
import RequestWithUser from '@auth/requestWithUser.interface';
import { JwtPayload } from '@libs/payload.interface';
import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import ConfirmEmailDto from './dto/confrmEmail.dto';
import { EmailConfirmationService } from './email-confirmation.service';

@ApiTags('EmailConfirmation')
@Controller('email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService
  ) {}

  @ApiOperation({ summary: 'User email confirmation' })
  @ApiQuery({
    name: 'confirmationData',
    required: true,
    description: 'Token',
    type: ConfirmEmailDto,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Post('confirm')
  async confirm(@Body() confirmatiomData: ConfirmEmailDto): Promise<void> {
    const email: string =
      await this.emailConfirmationService.decodeConfirmationToken(
        confirmatiomData.token
      );
    await this.emailConfirmationService.confirmEmail(email);
  }

  @ApiOperation({ summary: "Repeated email confirmation request" })
  @ApiResponse({ status: HttpStatus.OK, description: "Request with user identity", type : JwtPayload})
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })  
  @Post('resend-confirmation-link')
  @UseGuards(JwtAuthenticationGuard)
  async resendConfirmationLink(@Req() req: RequestWithUser) {
    await this.emailConfirmationService.resendConfirmationLink(req.user._id);
  }
}
