import { getRegistries } from "./utils/ppdvn.js";

const MAX_PAGE = 20;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getLatestRegistries = async (
  prevLatest: string,
  publisherId: number,
  partner?: string
) => {
  const registries: {
    name: string;
    author: string;
    publisherId: number;
  }[] = [];
  let page = 1;
  let check = true;

  while (check) {
    const r = await getRegistries(page, publisherId);

    // sleep for 0.5s before checking
    await sleep(500);

    for (const v of r) {
      // check

      // if matches `prevLatest`
      if (v[2] == prevLatest) {
        check = false;
        break;
      }

      // if there's a translator, and partner is specified, and correct
      if (v[4] != "" && (partner ? v[7].includes(partner) : true))
        registries.push({
          name: v[2],
          author: v[3],
          publisherId: publisherId,
        });
    }

    page++;

    if (page === MAX_PAGE) check = false;
  }

  return registries;
};
