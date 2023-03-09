import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;
  constructor(private readonly congigServise: ConfigService) {
    this.nodemailerTransport =createTransport({
      service:congigServise.get<string>("EMAIL_SERVICE"),
      auth:{
        user :congigServise.get<string>("EMAIL_USER"),
        pass: congigServise.get<string>("EMAIL_PASSWORD")
      }
    })
  }
  sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail(options);
  }
}
