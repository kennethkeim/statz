import { mockStravaActivities } from "./_data/strava-activities";
// import type { StravaActivity } from "./_models/strava-activities.model";

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

      <h2 className="mb-3">Fastest runs</h2>
      <ul>
        {[...activities]
          .sort((a, b) => b.average_speed - a.average_speed)
          .filter(
            (activity) =>
              activity.type === "Run" && activity.average_speed > 2.8,
          )
          .map((activity) => (
            <li key={activity.id} className="mb-3 flex justify-between">
              <p>{activity.start_date}</p>
              <p>
                {/* {activity.distance}m in {activity.moving_time}s */}
                {/* {activity.average_heartrate}bpm */}
                {activity.average_speed}
                {/* {activity.average_speed} */}
              </p>
            </li>
          ))}
      </ul>
    </main>
  );
}
