import { WebhookClient } from "discord.js";
import { DateTime } from "luxon";
import { getLatestRegistries } from "../registries.js";
import { getTodayReleases } from "./glhf.js";
import { emote } from "../data/emote.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Registries = Awaited<ReturnType<typeof getLatestRegistries>>;
type Releases = Awaited<ReturnType<typeof getTodayReleases>>;

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

export const sendReleases = async (releases: Releases, url: string) => {
  const webhook = new WebhookClient({
    url,
  });
  let totalCost = 0;

  webhook
    .send({
      embeds: [
        {
          author: {
            name: "manga.glhf.vn",
            url: "https://manga.glhf.vn/",
            icon_url:
              "https://res.cloudinary.com/glhfvn/image/upload/v1650536017/LOGO_shomth.png",
          },
          title: `Lịch phát hành hôm nay`,
          url: "https://manga.glhf.vn/",
          description: `${DateTime.now().setLocale("vi-VN").toLocaleString({
            weekday: "long",
            month: "long",
            day: "2-digit",
          })}`,
          fields: releases.map(({ publisher, entries }) => ({
            name: `${
              emote.find(({ id }) => publisher.id === id)?.value ?? ""
            } ${publisher.name}`,
            value: entries
              .map(({ name, edition, price }) => {
                totalCost += price;

                return `${name}${edition ? ` (${edition})` : ""}\n`;
              })
              .join(""),
            inline: true,
          })),
          footer: {
            text: `Tổng số tiền: ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(totalCost)}`,
          },
        },
      ],
    })
    .then()
    .catch((error) => console.error(error));
};
