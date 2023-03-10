import { ConfigurableEmailModule } from '@email/email.module-definition';
import { Module } from '@nestjs/common';
import EmailService from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule extends ConfigurableEmailModule {}
