import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  async sendProjectInvitation(input: { to: string; projectName: string; managerName: string; token: string }) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const acceptUrl = `${appUrl}/invite?token=${encodeURIComponent(input.token)}`;
    try {
      await this.transporter.sendMail({
        from: `Flowyn <${process.env.SMTP_USER}>`,
        to: input.to,
        subject: `Invitation to join ${input.projectName} on Flowyn`,
        text: `${input.managerName} invited you to join ${input.projectName}. Accept: ${acceptUrl}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Project invitation</h2><p>${this.escape(input.managerName)} invited you to join <strong>${this.escape(input.projectName)}</strong> on Flowyn.</p><p><a href="${acceptUrl}" style="display:inline-block;padding:12px 18px;background:#65a30d;color:white;text-decoration:none;border-radius:8px">Accept invitation</a></p><p>This link expires in 7 days.</p></div>`,
      });
    } catch {
      throw new InternalServerErrorException('Invitation was created, but the email could not be sent');
    }
  }

  private escape(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
  }
}
