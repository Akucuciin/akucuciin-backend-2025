import nodemailer from "nodemailer";

import AppConfig from "../configs/app.config.mjs";

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
  sendVerifyEmail: (email, registerToken) => {
    var mailOptions;
    mailOptions = {
      from: sender,
      to: email,
      subject: "Aktivasi akun AkuCuciin",
      html: `<html><body>Please activate your AkuCuciin account. If you feel you are not registered, please ignore this message. Press <a href="${
        AppConfig.URL.verifyServer
      }${email}/${registerToken}">Verify Email</a> to verify, only valid for ${
        AppConfig.JWT.verifyRegisterMaxAge / 60
      } minutes.</body></html>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  },
  sendRequestResetPassword: (email, resetPasswordToken) => {
    var mailOptions;
    mailOptions = {
      from: sender,
      to: email,
      subject: "Permintaan reset password akun AkuCuciin",
      html: `<html><body>We received a request to reset your password for your Akucuciin account. If you didnt request a password reset, you can safely ignore this email. To reset your password, click the link below: <a href="${
        AppConfig.URL.requestResetPasswordForm
      }${email}/${resetPasswordToken}">Reset Password</a>. For security purposes, this link will expire in ${
        AppConfig.JWT.resetPasswordMaxAge / 60
      } minutes</body></html>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  },
};

export default MailService;
