import { Handler } from "express";
import uuid from "uuid/v4";

import query from "../queries";
import * as mail from "../mail";
import * as utils from "../utils";

export const get = async (req, res) => {
  const domains = await query.domain.get({ user_id: req.user.id });

  const data = {
    apikey: req.user.apikey,
    email: req.user.email,
    domains: domains.map(utils.sanitize.domain)
  };

  return res.status(200).send(data);
};

export const remove = async (req, res) => {
  await query.user.remove(req.user);
  return res.status(200).send("OK");
};

export const inviteToken: Handler = async (req, res) => {
  const user = await query.user.invite({
    email: req.body.email,
    token: uuid()
  });

  await mail.invitation(user);

  return res.status(201).send({ message: "Invitation email has been sent." });
};

export const join: Handler = async (req, res, next) => {
  if (!req.params.invitationToken) return next();

  const [user] = await query.user.update(
    {
      invitation_token: req.params.invitationToken
    },
    {
      invitation_token: null,
      verified: true,
      verification_token: null,
      verification_expires: null
    }
  );

  if (user) {
    const token = utils.signToken(user as User);
    req.token = token;
  }

  return next();
};
