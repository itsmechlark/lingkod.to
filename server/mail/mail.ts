import mailgun from "mailgun.js";
import path from "path";
import fs from "fs";

import { inviteMailText, resetMailText, verifyMailText } from "./text";
import { CustomError } from "../utils";
import env from "../env";

const mg = mailgun.client({
  username: "api",
  key: env.MAILGUN_API_KEY,
  url: env.MAILGUN_URL
});

interface Message {
  from?: string;
  to: Array<string>;
  subject: string;
  text?: string;
  html: string;
  tag?: Array<string>;
}

export const sendMail = async (mail: Message) => {
  return mg.messages.create(env.MAILGUN_DOMAIN, {
    from: mail.from || env.MAIL_FROM,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html
  });
};

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
  sendMail({
    to: [user.email],
    subject: "Verify your account",
    text: verifyMailText
      .replace(/{{verification}}/gim, user.verification_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME),
    html: verifyEmailTemplate
      .replace(/{{verification}}/gim, user.verification_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
      .replace(/{{site_name}}/gm, env.SITE_NAME)
  })
    .then(msg => {
      console.log(msg);
    })
    .catch(error => {
      console.log(error);
      throw new CustomError(
        "Couldn't send verification email. Try again later."
      );
    });
};

export const resetPasswordToken = async (user: User) => {
  sendMail({
    to: [user.email],
    subject: "Reset your password",
    text: resetMailText
      .replace(/{{resetpassword}}/gm, user.reset_password_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN),
    html: resetEmailTemplate
      .replace(/{{resetpassword}}/gm, user.reset_password_token)
      .replace(/{{domain}}/gm, env.DEFAULT_DOMAIN)
  })
    .then(msg => {
      console.log(msg);
    })
    .catch(error => {
      console.log(error);
      throw new CustomError(
        "Couldn't send reset password email. Try again later."
      );
    });
};

export const invitation = async (user: User) => {
  sendMail({
    to: [user.email],
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
  })
    .then(msg => {
      console.log(msg);
    })
    .catch(error => {
      console.log(error);
      throw new CustomError("Couldn't send invitation email. Try again later.");
    });
};
