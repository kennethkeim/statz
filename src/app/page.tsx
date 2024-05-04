import { mockStravaActivities } from "./_data/strava-activities";
// import type { StravaActivity } from "./_models/strava-activities.model";

export default async function Home() {
  console.log("getting data from Strava...");

  // Temporary quickstart to fetch data from Strava
  // const response = await fetch(
  //   "https://www.strava.com/api/v3/athlete/activities",
  //   {
  //     headers: {
  //       Authorization: `Bearer xxx`,
  //     },
  //   },
  // );
  // const activities = (await response.json()) as StravaActivity[];

  const activities = mockStravaActivities;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 text-white">
      <h1>So. You want to see some Strava Statz.</h1>

      <ul>
        {activities
          .filter((activity) => activity.type === "Run")
          .map((activity) => (
            <li key={activity.id} className="mb-3 flex justify-between">
              <p>{activity.name}</p>
              <p>
                {activity.distance}m in {activity.moving_time}s
                {/* {activity.average_heartrate}bpm */}
                {/* {activity.average_speed} */}
                {/* {activity.average_speed} */}
              </p>
            </li>
          ))}
      </ul>
    </main>
  );
}
