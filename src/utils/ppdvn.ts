import * as cheerio from "cheerio";

const PPDVN_SITE_URL = "https://ppdvn.gov.vn/web/guest/ke-hoach-xuat-ban";

export const getRegistries = async (
  page = 1,
  publisherId: number | null = null
) => {
  const response = await fetch(
    `${PPDVN_SITE_URL}?&p=${page}${publisherId ? `&id_nxb=${publisherId}` : ""}`
  );
  const body = await response.text();

  const $ = cheerio.load(body);

  const selector = "#list_data_return table tbody tr";

  return [...$(selector)].map((e) =>
    [...$(e).find("td")].map((e) => $(e).text())
  );
};
