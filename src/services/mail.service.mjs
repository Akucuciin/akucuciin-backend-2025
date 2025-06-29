import ejs from 'ejs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import path from 'path';
import AppConfig from '../configs/app.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sender = `"${AppConfig.MAILER.sender}" <${AppConfig.MAILER.email}>`;

const transporter = nodemailer.createTransport({
  name: AppConfig.MAILER.smtpName,
  host: AppConfig.MAILER.smtpHost,
  port: 465,
  secure: true,
  requireTLS: false,
  auth: {
    user: AppConfig.MAILER.email,
    pass: AppConfig.MAILER.password,
  },
});

const MailService = {
  sendVerifyEmail: async (email, registerToken) => {
    const emailContent = await ejs.renderFile(
      path.join(__dirname, '../views/emails/register.ejs'),
      {
        verifyLink: `${AppConfig.URL.verifyServer}${email}/${registerToken}`,
        expirationTime: Number(AppConfig.JWT.verifyRegisterMaxAge) / 60,
      }
    );
    var mailOptions;
    mailOptions = {
      from: sender,
      to: email,
      subject: 'Aktivasi akun AkuCuciin',
      html: emailContent,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },
  resendVerifyEmail: async (email, registerToken) => {
    const emailContent = await ejs.renderFile(
      path.join(__dirname, '../views/emails/resendVerification.ejs'),
      {
        verifyLink: `${AppConfig.URL.verifyServer}${email}/${registerToken}`,
        expirationTime: Number(AppConfig.JWT.verifyRegisterMaxAge) / 60,
      }
    );
    var mailOptions;
    mailOptions = {
      from: sender,
      to: email,
      subject: '[Resend] Aktivasi akun AkuCuciin',
      html: emailContent,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },
  sendRequestResetPassword: async (email, resetPasswordToken) => {
    const emailContent = await ejs.renderFile(
      path.join(__dirname, '../views/emails/resetPassword.ejs'),
      {
        resetLink: `${AppConfig.URL.requestResetPasswordForm}${email}/${resetPasswordToken}`,
        expirationTime: Number(AppConfig.JWT.resetPasswordMaxAge) / 60,
      }
    );
    var mailOptions;
    mailOptions = {
      from: sender,
      to: email,
      subject: 'Permintaan reset password akun AkuCuciin',
      html: emailContent,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },
};

export default MailService;
