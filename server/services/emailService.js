import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      logger.warn('Email service not configured. Email notifications will be skipped.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      logger.warn(`Email not sent (service not configured): ${subject} to ${to}`);
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@creditiq.com',
        to,
        subject,
        text,
        html,
      });

      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Welcome email on registration
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to CreditIQ!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CreditIQ!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Thank you for joining CreditIQ, your AI-powered loan underwriting platform.</p>
              <p>With CreditIQ, you can:</p>
              <ul>
                <li>Apply for loans with instant AI-powered risk assessment</li>
                <li>Get real-time updates on your application status</li>
                <li>Understand credit decisions with transparent explanations</li>
                <li>Track all your applications in one place</li>
              </ul>
              <p>Get started by submitting your first loan application!</p>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2026 CreditIQ. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Welcome to CreditIQ, ${user.firstName}! Thank you for joining our platform.`,
    });
  }

  // Loan submission confirmation
  async sendLoanSubmissionEmail(user, application) {
    const subject = 'Loan Application Submitted Successfully';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Submitted!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>Your loan application has been successfully submitted and is being processed.</p>
              
              <div class="info-box">
                <h3>Application Details:</h3>
                <p><strong>Application ID:</strong> ${application.id}</p>
                <p><strong>Loan Amount:</strong> ₹${application.loanAmount.toLocaleString()}</p>
                <p><strong>Tenure:</strong> ${application.tenure} months</p>
                <p><strong>Status:</strong> ${application.status}</p>
              </div>
              
              <p>Our AI-powered system is currently evaluating your application against our credit policies. You will receive a decision shortly.</p>
              
              <a href="${process.env.FRONTEND_URL}/applications/${application.id}" class="button">View Application Status</a>
            </div>
            <div class="footer">
              <p>© 2026 CreditIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Your loan application for ₹${application.loanAmount.toLocaleString()} has been submitted successfully.`,
    });
  }

  // Loan decision notification
  async sendLoanDecisionEmail(user, application, decision) {
    const isApproved = decision.decision === 'APPROVED';
    const subject = `Loan Application ${isApproved ? 'Approved' : 'Update'}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .status-badge { display: inline-block; padding: 8px 16px; background: ${isApproved ? '#10b981' : '#ef4444'}; color: white; border-radius: 20px; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'}; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Decision</h1>
              <span class="status-badge">${decision.decision}</span>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>${isApproved 
                ? 'Congratulations! Your loan application has been approved.' 
                : 'We have completed the review of your loan application.'}</p>
              
              <div class="info-box">
                <h3>Application Details:</h3>
                <p><strong>Application ID:</strong> ${application.id}</p>
                <p><strong>Loan Amount:</strong> ₹${application.loanAmount.toLocaleString()}</p>
                <p><strong>Decision:</strong> ${decision.decision}</p>
                ${decision.riskBand ? `<p><strong>Risk Band:</strong> ${decision.riskBand}</p>` : ''}
                ${decision.policyReason ? `<p><strong>Reason:</strong> ${decision.policyReason}</p>` : ''}
              </div>
              
              ${isApproved 
                ? '<p>Next steps: Our team will contact you shortly to proceed with the loan disbursement process.</p>' 
                : '<p>You can review the detailed decision and reapply in the future.</p>'}
              
              <a href="${process.env.FRONTEND_URL}/applications/${application.id}" class="button">View Full Details</a>
            </div>
            <div class="footer">
              <p>© 2026 CreditIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Your loan application has been ${decision.decision.toLowerCase()}. Application ID: ${application.id}`,
    });
  }

  // Password reset email (for future implementation)
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .warning-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <div class="warning-box">
                <p><strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>© 2026 CreditIQ. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
