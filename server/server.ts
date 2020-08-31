import env from "./env";

import "./tracer";

import asyncHandler from "express-async-handler";
import cookieParser from "cookie-parser";
import passport from "passport";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import nextApp from "next";
import ua from "universal-analytics";
import * as Sentry from "@sentry/node";

import * as helpers from "./handlers/helpers";
import * as links from "./handlers/links";
import * as auth from "./handlers/auth";
import * as users from "./handlers/users";
import __v1Routes from "./__v1";
import routes from "./routes";

import "./cron";
import "./passport";
import logger from "./logger";

const port = env.PORT;
const app = nextApp({ dir: "./client", dev: env.isDev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();

  server.set("trust proxy", true);

  if (env.isDev) {
    server.use(morgan("dev"));
  } else if (env.SENTRY_PRIVATE_DSN) {
    server.use(morgan("combined", { stream: logger.stream }));

    Sentry.init({
      dsn: env.SENTRY_PRIVATE_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.KUTT_SHA
    });

    server.use(
      Sentry.Handlers.requestHandler({
        ip: true,
        user: ["id", "email"]
      })
    );
  }

  if (env.GOOGLE_ANALYTICS_UNIVERSAL) {
    server.use(
      ua.middleware(env.GOOGLE_ANALYTICS_UNIVERSAL, { cookieName: "_ga" })
    );
  }

  server.use(helmet());
  server.use(cookieParser());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(passport.initialize());
  server.use(express.static("static"));
  server.use(helpers.ip);

  server.use(asyncHandler(links.redirectCustomDomain));

  server.use("/api/v2", routes);
  server.use("/api", __v1Routes);

  server.get("/join/:invitationToken?", asyncHandler(users.join), (req, res) =>
    app.render(req, res, "/reset-password", { token: req.token })
  );

  server.get(
    "/reset-password/:resetPasswordToken?",
    asyncHandler(auth.resetPassword),
    (req, res) => app.render(req, res, "/reset-password", { token: req.token })
  );

  server.get(
    "/verify/:verificationToken?",
    asyncHandler(auth.verify),
    (req, res) => app.render(req, res, "/verify", { token: req.token })
  );

  server.get("/:id", asyncHandler(links.redirect(app)));

  // Error handler
  server.use(helpers.error);

  // Handler everything else by Next.js
  server.get("*", (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
