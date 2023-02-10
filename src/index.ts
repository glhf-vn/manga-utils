import sqlite3 from "sqlite3";
import { Command } from "commander";
import { getLatestRegistries } from "./registries.js";
import { sendNewRegistries, sendReleases } from "./utils/discord.js";
import { getTodayReleases } from "./utils/glhf.js";

// initialize database
const db = new sqlite3.Database("./db/main.db", (err) => {
  if (err) {
    console.error(err.message);
  }
});

db.serialize(() => {
  // initial queries
  db.run(
    "CREATE TABLE IF NOT EXISTS ppd_latest (publisher TEXT PRIMARY KEY, name TEXT, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP);"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS publishers (id INT PRIMARY KEY, name TEXT);"
  );
});

// initialize program
const program = new Command();

program
  .command("registries <publisherId> [partner]")
  .description("Script for checking registries from `https://ppd.gov.vn/`")
  .option("-W, --webhook <webhook URL>", "send Discord webhook")
  .action(async (publisherId, partner, args) => {
    db.get(
      // first, get latest value from sqlite
      "SELECT name FROM ppd_latest WHERE publisher = ?",
      partner ? `${publisherId}_${partner}` : publisherId,
      async (err, row) => {
        if (err) throw err;

        // then start crawling
        const result = await getLatestRegistries(
          row ? row.name : "",
          publisherId,
          partner
        );

        // update latest value, if there is any
        if (result.length > 0)
          db.run(
            "INSERT OR REPLACE INTO ppd_latest (publisher, name) VALUES(?, ?)",
            [
              partner ? `${publisherId}_${partner}` : publisherId,
              result[0].name,
            ]
          );

        if (args.webhook) await sendNewRegistries(result, args.webhook);

        console.table(result);
      }
    );
  });

program
  .command("releases")
  .description("Script for getting releases from manga.GLHF.vn's API")
  .option("-W, --webhook <webhook URL>", "send Discord webhook")
  .action(async ({ webhook }) => {
    const releases = await getTodayReleases();

    if (releases.length == 0) return console.log("No entries, abort");

    if (webhook) await sendReleases(releases, webhook);

    console.table(releases);
  });

program.parse();
