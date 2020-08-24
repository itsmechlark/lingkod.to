import useragent from "useragent";
import IPinfoWrapper from "node-ipinfo";
import IPinfo from "node-ipinfo/dist/src/model/ipinfo.model";
import URL from "url";

import query from "../queries";
import { getStatsLimit } from "../utils";
import env from "../env";

const browsersList = ["IE", "Firefox", "Chrome", "Opera", "Safari", "Edge"];
const osList = ["Windows", "Mac OS", "Linux", "Android", "iOS"];
const filterInBrowser = agent => item =>
  agent.family.toLowerCase().includes(item.toLocaleLowerCase());
const filterInOs = agent => item =>
  agent.os.family.toLowerCase().includes(item.toLocaleLowerCase());
const ipinfoWrapper = new IPinfoWrapper(env.IPINFO_TOKEN);

export default function({ data }) {
  const tasks = [];

  tasks.push(query.link.increamentVisit({ id: data.link.id }));

  if (data.link.visit_count < getStatsLimit()) {
    const agent = useragent.parse(data.headers["user-agent"]);
    const [browser = "Other"] = browsersList.filter(filterInBrowser(agent));
    const [os = "Other"] = osList.filter(filterInOs(agent));
    const referrer = data.referrer && URL.parse(data.referrer).hostname;

    tasks.push(
      ipinfoWrapper.lookupIp(data.realIP).then((response: IPinfo) => {
        query.visit.add({
          browser: browser.toLowerCase(),
          country: response.country || "Unknown",
          id: data.link.id,
          os: os.toLowerCase().replace(/\s/gi, ""),
          referrer: (referrer && referrer.replace(/\./gi, "[dot]")) || "Direct"
        });
      })
    );
  }

  return Promise.all(tasks);
}
