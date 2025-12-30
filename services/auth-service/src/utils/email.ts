import crypto from 'crypto';
import nodemailer from 'nodemailer';

/**
 * Email utility for sending verification and other emails
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static baseUrl = process.env.FRONTEND_URL || 'http://localhost';
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const emailService = process.env.EMAIL_SERVICE;
      const emailHost = process.env.EMAIL_HOST;
      const emailPort = process.env.EMAIL_PORT;
      const emailUser = process.env.EMAIL_USER;
      const emailPassword = process.env.EMAIL_PASSWORD;

      // Mock mode if credentials are not configured
      if (!emailUser || !emailPassword) {
        console.warn('⚠️  Email credentials not configured. Using mock mode.');
        console.log('📧 Mock mode: Emails will be logged to console instead of being sent.');
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      } else if (emailHost && emailPort) {
        // Custom SMTP configuration (e.g., Ethereal, Mailtrap, etc.)
        console.log(`📧 Configuring SMTP: ${emailHost}:${emailPort}`);
        this.transporter = nodemailer.createTransport({
          host: emailHost,
          port: parseInt(emailPort, 10),
          secure: false, // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      } else if (emailService) {
        // Email service (Gmail, Outlook, etc.)
        console.log(`📧 Configuring email service: ${emailService}`);
        this.transporter = nodemailer.createTransport({
          service: emailService,
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      } else {
        console.warn('⚠️  No email configuration found. Using mock mode.');
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    }
    return this.transporter;
  }

  /**
   * Generate a verification token
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: `"Procrastinator" <${process.env.EMAIL_USER || 'noreply@procrastinator.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      
      // If using mock mode, log the email
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('\n=================================');
        console.log('📧 EMAIL MOCK - Would send email:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('---');
        console.log(options.text || options.html);
        console.log('=================================\n');
      } else {
        console.log('✅ Email sent successfully to:', options.to);
        console.log('Message ID:', info.messageId);
      }

      return true;
    } catch (error) {
      console.error('❌ Email error:', error);
      return false;
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(
    email: string,
    username: string,
    token: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.baseUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur Procrastinator !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${username},</p>
            <p>Merci de vous être inscrit sur Procrastinator ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            </p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <p><strong>Ce lien expirera dans 24 heures.</strong></p>
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Procrastinator. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bienvenue sur Procrastinator, ${username} !

Merci de vous être inscrit. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :

${verificationUrl}

Ce lien expirera dans 24 heures.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

---
© 2025 Procrastinator. Tous droits réservés.
    `;

    return this.sendEmail({
      to: email,
      subject: '✅ Vérifiez votre adresse email - Procrastinator',
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    username: string,
    token: string,
    userId?: string,
  ): Promise<boolean> {
    const resetUrl = `${this.baseUrl}/reset-password?token=${token}${userId ? `&userId=${userId}` : ''}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${username},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <p><strong>Ce lien expirera dans 1 heure.</strong></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Procrastinator. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Réinitialisation de mot de passe

Bonjour ${username},

Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour continuer :

${resetUrl}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

---
© 2025 Procrastinator. Tous droits réservés.
    `;

    return this.sendEmail({
      to: email,
      subject: '🔐 Réinitialisation de mot de passe - Procrastinator',
      html,
      text,
    });
  }
}
