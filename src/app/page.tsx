import { mockStravaActivities } from "./_data/strava-activities";
// import type { StravaActivity } from "./_models/strava-activities.model";

const METERS_IN_MILE = 1609.344;
const NUM_FASTEST_RESULTS = 5;

const roundTo2 = (num: number): number => {
  // apparently this isn't bulletproof - https://stackoverflow.com/a/12830454/8935239
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const metersPerSecToMinPerMile = (metersPerSec: number): string => {
  const minPerMile = 26.8224 / metersPerSec;
  const min = Math.floor(minPerMile);
  const sec = Math.floor((minPerMile - min) * 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export default async function Home() {
  console.log("getting data from Strava...");

  // Temporary quickstart to fetch data from Strava
  // const response = await fetch(
  //   "https://www.strava.com/api/v3/athlete/activities?per_page=200",
  //   {
  //     headers: {
  //       Authorization: `Bearer xxx`,
  //     },
  //   },
  // );
  // const rawJson = (await response.json()) as unknown;
  // if (response.status !== 200) {
  //   console.log("Error response", rawJson);
  //   throw new Error(`Strava API Error: ${response.status}`);
  // }
  // const activities = rawJson as StravaActivity[];
  // console.log(JSON.stringify(activities));

  const activities = mockStravaActivities;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 text-white">
      <h1 className="mb-6">So. You want to see some Strava Statz.</h1>

      <h2 className="mb-3 text-xl">{`Top ${NUM_FASTEST_RESULTS} fastest miles`}</h2>
      <p className="mb-3 text-sm text-slate-400">
        (based on avg of entire run, not based on splits)
      </p>
      <ul>
        {[...activities]
          .filter(
            (activity) =>
              activity.type === "Run" && activity.distance >= METERS_IN_MILE,
          )
          .sort((a, b) => b.average_speed - a.average_speed)
          .slice(0, NUM_FASTEST_RESULTS)
          .map((activity) => {
            const date = new Date(activity.start_date);
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const dateString = `${date.getFullYear()}/${month}/${day}`;
            return (
              <li key={activity.id} className="mb-3 flex justify-between">
                <p>{dateString}</p>
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
    </main>
  );
}
