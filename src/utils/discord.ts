import { WebhookClient } from "discord.js";
import { getLatestRegistries } from "../registries.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Registries = Awaited<ReturnType<typeof getLatestRegistries>>;

export const sendNewRegistries = async (data: Registries, url: string) => {
  const webhook = new WebhookClient({
    url,
  });

  data.map(async ({ name, author }) => {
    webhook
      .send({
        embeds: [
          {
            author: {
              name: "Đăng ký xuất bản / manga.glhf.vn",
              url: "https://manga.glhf.vn",
              icon_url:
                "https://res.cloudinary.com/glhfvn/image/upload/v1650536017/LOGO_shomth.png",
            },
            title: name,
            fields: [
              {
                name: "Tác giả",
                value: author,
              },
            ],
          },
        ],
      })
      .then()
      .catch((error) => console.error(error));

    await sleep(100);
  });
};
