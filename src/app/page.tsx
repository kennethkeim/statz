import { env } from "~/env";
import { mockStravaActivities } from "./_data/strava-activities";
import type { StravaActivity } from "./_models/strava-activities.model";

const METERS_IN_MILE = 1609.344;
const NUM_FASTEST_MILE_RESULTS = 3;
const NUM_FASTEST_RUN_RESULTS = 5;
const NUM_LONGEST_RESULTS = 3;
const MOCK_ENABLED = false;
const MAX_FETCH_PAGES = 5;

const roundTo2 = (num: number): string => {
  // apparently this rounding isn't bulletproof - https://stackoverflow.com/a/12830454/8935239
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
};

const metersPerSecToMinPerMile = (metersPerSec: number): string => {
  const min = 26.8224 / metersPerSec;
  const wholeMinutes = Math.floor(min);
  const sec = Math.round((min - wholeMinutes) * 60);
  return `${wholeMinutes}:${sec.toString().padStart(2, "0")}`;
};

const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateString = `${date.getFullYear()}/${month}/${day}`;
  return dateString;
};

// Temporary quickstart to fetch data from Strava
const getActivitiesPage = async (page: number): Promise<StravaActivity[]> => {
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
    {
      // use client secret var for access token until i implement oauth
      headers: { Authorization: `Bearer ${env.STRAVA_CLIENT_SECRET}` },
    },
  );

  const rawJson = (await response.json()) as unknown;
  if (response.status !== 200) {
    console.log("Error response", rawJson);
    throw new Error(`Strava API Error: ${response.status}`);
  }

  return rawJson as StravaActivity[];
};

const getAllActivities = async (): Promise<[number, StravaActivity[]]> => {
  const activities: StravaActivity[] = [];
  let page = 1;
  let pageActivities: StravaActivity[];
  do {
    console.log(`Fetching page: ${page}`);
    pageActivities = await getActivitiesPage(page);
    activities.push(...pageActivities);
    page++;
    // in while condition, page is pointing to the next page to be fetched
  } while (pageActivities.length > 0 && page <= MAX_FETCH_PAGES);

  return [page - 1, activities];
};

const ActivityListItem = ({ activity }: { activity: StravaActivity }) => {
  return (
    <li className="mb-4">
      <p>{activity.name}</p>

      <article className="flex justify-between">
        <p>{formatDate(activity.start_date)}</p>
        <p>{roundTo2(activity.distance / METERS_IN_MILE)} miles</p>
        <p>
          {/* {activity.average_heartrate}bpm */}
          {metersPerSecToMinPerMile(activity.average_speed)}
        </p>
      </article>
    </li>
  );
};

const TableSection = ({
  activities,
  limit,
  title,
  subTitle,
}: {
  activities: StravaActivity[];
  limit: number;
  title: string;
  subTitle?: string;
}) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl">{title}</h2>
      <p className="mb-3 text-sm text-slate-400">{subTitle}</p>

      <ul>
        {activities.slice(0, limit).map((activity) => {
          return <ActivityListItem activity={activity} key={activity.id} />;
        })}
      </ul>
    </section>
  );
};

export default async function Home() {
  let activities: StravaActivity[] = [];
  let pages = 0;
  if (MOCK_ENABLED) {
    activities = mockStravaActivities;
  } else {
    [pages, activities] = await getAllActivities();
  }

  // stats
  const runs = activities.filter((activity) => activity.type === "Run");
  const metersRan = activities.reduce((acc, cur) => acc + cur.distance, 0);
  const milesRan = Math.round(metersRan / METERS_IN_MILE);
  const runsSortedBySpeed = [...runs].sort(
    (a, b) => b.average_speed - a.average_speed,
  );
  const runsSortedByDistance = [...runs].sort(
    (a, b) => b.distance - a.distance,
  );

  // For saving mock data
  // console.log(JSON.stringify(activities));

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 font-mono text-white">
      <div className="mx-auto max-w-xl">
        <section className="mb-8 flex justify-between">
          <p className="text-3xl font-bold">{runs.length} Runs</p>
          <p className="text-3xl font-bold">{milesRan} Miles</p>
        </section>

        <TableSection
          title={`Top ${NUM_FASTEST_MILE_RESULTS} fastest miles`}
          subTitle="Based on avg of entire run, not based on splits"
          limit={NUM_FASTEST_MILE_RESULTS}
          activities={runsSortedBySpeed.filter(
            (activity) => activity.distance >= METERS_IN_MILE,
          )}
        />

        <TableSection
          title={`Top ${NUM_FASTEST_RUN_RESULTS} fastest runs`}
          limit={NUM_FASTEST_RUN_RESULTS}
          activities={runsSortedBySpeed}
        />

        <TableSection
          title={`Top ${NUM_LONGEST_RESULTS} longest runs`}
          limit={NUM_LONGEST_RESULTS}
          activities={runsSortedByDistance}
        />

        <section className="mb-10">
          <p className="text-sm text-slate-400">
            Earliest date recorded:{" "}
            {formatDate(activities[activities.length - 1]?.start_date ?? "")}
          </p>

          <p className="text-sm text-slate-400">Pages: {pages}</p>
        </section>
      </div>
    </main>
  );
}
