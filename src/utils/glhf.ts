import { DateTime } from "luxon";

const GLHF_API_URL = "https://manga.glhf.vn/api";

type Entry = {
  id: string;
  name: string;
  date: string;
  publisher: {
    id: string;
    name: string;
  };
  price: number;
  edition: string | null;
  image_url: string | null;
  serie_id: number | null;
};

type ReleasesRes = {
  date: string;
  entries: Entry[];
}[];

type PublishersRes = {
  id: string;
  name: string;
  color: string;
}[];

export const getPublishers = async () => {
  const response = await fetch(`${GLHF_API_URL}/publishers`);

  const publishers: PublishersRes = await response.json();

  return publishers;
};

export const getTodayReleases = async () => {
  const today = DateTime.now().toISODate();
  const publishers = await getPublishers();
  const url = `${GLHF_API_URL}/releases/?start=${today}&end=${today}`;

  const releases: {
    publisher: {
      id: string;
      name: string;
    };
    entries: Entry[];
  }[] = [];

  await Promise.all(
    publishers.map(async ({ id, name }) => {
      const res = await fetch(`${url}&publisher=${id}`);
      const rel: ReleasesRes = await res.json();

      if (rel.length > 0)
        releases.push({
          publisher: {
            id,
            name,
          },
          entries: rel[0].entries,
        });
    })
  );

  return releases;
};
