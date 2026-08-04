import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');

  constructor(private mailer: MailerService) {}

  async sendWelcomeEmail(email: string, username: string) {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'Welcome to Mintfolio',
        template: 'welcome',
        context: {
          username,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while sending welcome email.';
      this.logger.warn(errorMessage);
    }
  }
}
