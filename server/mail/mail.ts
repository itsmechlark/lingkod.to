import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

import { inviteMailText, resetMailText, verifyMailText } from "./text";
import { CustomError } from "../utils";
import env from "../env";

const mailConfig = {
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASSWORD
  }
};

const transporter = nodemailer.createTransport(mailConfig);

export default transporter;

// Read email templates
const inviteEmailTemplatePath = path.join(__dirname, "template-invite.html");
const resetEmailTemplatePath = path.join(__dirname, "template-reset.html");
const verifyEmailTemplatePath = path.join(__dirname, "template-verify.html");
const inviteEmailTemplate = fs
  .readFileSync(inviteEmailTemplatePath, { encoding: "utf-8" })
  .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
  .replace(/{{site_name}}/gm, env.SITE_NAME);
const resetEmailTemplate = fs
  .readFileSync(resetEmailTemplatePath, { encoding: "utf-8" })
  .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
  .replace(/{{site_name}}/gm, env.SITE_NAME);
const verifyEmailTemplate = fs
  .readFileSync(verifyEmailTemplatePath, { encoding: "utf-8" })
  .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
  .replace(/{{site_name}}/gm, env.SITE_NAME);

export const verification = async (user: User) => {
  const mail = await transporter.sendMail({
    from: env.MAIL_FROM || env.MAIL_USER,
    to: user.email,
    subject: "Verify your account",
    text: verifyMailText
      .replace(/{{verification}}/gim, user.verification_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME),
    html: verifyEmailTemplate
      .replace(/{{verification}}/gim, user.verification_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME)
  });

  if (!mail.accepted.length) {
    throw new CustomError("Couldn't send verification email. Try again later.");
  }
};

export const resetPasswordToken = async (user: User) => {
  const mail = await transporter.sendMail({
    from: env.MAIL_FROM || env.MAIL_USER,
    to: user.email,
    subject: "Reset your password",
    text: resetMailText
      .replace(/{{resetpassword}}/gm, user.reset_password_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN),
    html: resetEmailTemplate
      .replace(/{{resetpassword}}/gm, user.reset_password_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
  });

  if (!mail.accepted.length) {
    throw new CustomError(
      "Couldn't send reset password email. Try again later."
    );
  }
};

export const invitation = async (user: User) => {
  const mail = await transporter.sendMail({
    from: env.MAIL_FROM || env.MAIL_USER,
    to: user.email,
    subject: `You've been invited to join ${env.SITE_NAME} Account`,
    text: inviteMailText
      .replace(/{{email}}/gim, user.email)
      .replace(/{{invitation}}/gim, user.invitation_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME),
    html: inviteEmailTemplate
      .replace(/{{email}}/gim, user.email)
      .replace(/{{invitation}}/gim, user.invitation_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME)
  });

  if (!mail.accepted.length) {
    throw new CustomError("Couldn't send invitation email. Try again later.");
  }
};
