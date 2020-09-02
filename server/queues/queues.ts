import Queue from "bull";
import path from "path";

import env from "../env";

const removeJob = job => job.remove();

export const visit = new Queue("visit", env.REDIS_URL);

visit.clean(5000, "completed");

visit.process(8, path.resolve(__dirname, "visit.js"));

visit.on("completed", removeJob);
