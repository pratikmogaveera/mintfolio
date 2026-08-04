import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: config.get<string>('MAIL_USER'),
            clientId: config.get<string>('MAIL_CLIENT_ID'),
            clientSecret: config.get<string>('MAIL_CLIENT_SECRET'),
            refreshToken: config.get<string>('MAIL_REFRESH_TOKEN'),
          },
        },
        defaults: {
          from: config.get<string>('MAIL_FROM'),
        },
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
