import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

const APP_NAME = 'Procrastinator';

export class TOTPUtils {
  /**
   * Generate a new TOTP secret
   */
  static generateSecret(email: string) {
    return speakeasy.generateSecret({
      name: `${APP_NAME} (${email})`,
      issuer: APP_NAME,
      length: 32,
    });
  }

  /**
   * Generate QR code image from secret
   */
  static async generateQRCode(secret: string): Promise<string> {
    try {
      const qrCode = await QRCode.toDataURL(secret);
      return qrCode;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, // Allow codes from previous/next time windows
      });
      return verified;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate backup codes (10 codes)
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  static hashBackupCode(code: string): string {
    return crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hash = this.hashBackupCode(code);
    return hashedCodes.includes(hash);
  }
}
