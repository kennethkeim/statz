import { env } from "~/env";
import { mockStravaActivities } from "./_data/strava-activities";
import type { StravaActivity } from "./_models/strava-activities.model";

const METERS_IN_MILE = 1609.344;
const NUM_FASTEST_RESULTS = 5;
const NUM_LONGEST_RESULTS = 3;
const MOCK_ENABLED = false;
const MAX_FETCH_PAGES = 5;

const roundTo2 = (num: number): string => {
  // apparently this rounding isn't bulletproof - https://stackoverflow.com/a/12830454/8935239
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
};

const metersPerSecToMinPerMile = (metersPerSec: number): string => {
  const minPerMile = 26.8224 / metersPerSec;
  const min = Math.floor(minPerMile);
  const sec = Math.floor((minPerMile - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
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

export default async function Home() {
  let activities: StravaActivity[] = [];
  let pages = 0;
  if (MOCK_ENABLED) {
    activities = mockStravaActivities;
  } else {
    [pages, activities] = await getAllActivities();
  }
  const runs = activities.filter((activity) => activity.type === "Run");
  const metersRan = activities.reduce((acc, cur) => acc + cur.distance, 0);
  const milesRan = Math.round(metersRan / METERS_IN_MILE);
  // console.log(JSON.stringify(activities));

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 text-white">
      <section className="mb-8 flex justify-between">
        <p className="text-3xl font-bold">{runs.length} Runs</p>
        <p className="text-3xl font-bold">{milesRan} Miles</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl">{`Top ${NUM_FASTEST_RESULTS} fastest miles`}</h2>
        <p className="mb-3 text-sm text-slate-400">
          Based on avg of entire run, not based on splits
        </p>

        <ul>
          {[...runs]
            .filter((activity) => activity.distance >= METERS_IN_MILE)
            .sort((a, b) => b.average_speed - a.average_speed)
            .slice(0, NUM_FASTEST_RESULTS)
            .map((activity) => {
              return (
                <li key={activity.id} className="mb-3 flex justify-between">
                  <p>{formatDate(activity.start_date)}</p>
                  <p>{roundTo2(activity.distance / METERS_IN_MILE)} miles</p>
                  <p>
                    {/* {activity.distance}m in {activity.moving_time}s */}
                    {/* {activity.average_heartrate}bpm */}
                    {metersPerSecToMinPerMile(activity.average_speed)}
                  </p>
                </li>
              );
            })}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl">{`Top ${NUM_LONGEST_RESULTS} longest runs`}</h2>

        <ul>
          {[...runs]
            .sort((a, b) => b.distance - a.distance)
            .slice(0, NUM_LONGEST_RESULTS)
            .map((activity) => {
              return (
                <li key={activity.id} className="mb-3 flex justify-between">
                  <p>{formatDate(activity.start_date)}</p>
                  <p>{roundTo2(activity.distance / METERS_IN_MILE)} miles</p>
                  <p>{metersPerSecToMinPerMile(activity.average_speed)}</p>
                </li>
              );
            })}
        </ul>
      </section>

      <section className="mb-8">
        <p className="text-sm text-slate-400">
          Earliest date recorded:{" "}
          {formatDate(activities[activities.length - 1]?.start_date ?? "")}
        </p>

        <p className="text-sm text-slate-400">Pages: {pages}</p>
      </section>
    </main>
  );
}
