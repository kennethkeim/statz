import { mockStravaActivities } from "./_data/strava-activities";
import type { StravaActivity } from "./_models/strava-activities.model";
import {
  formatDate,
  roundTo2,
  metersPerSecToMinPerMile,
  getAllActivities,
} from "./_utils/activity.utils";

const METERS_IN_MILE = 1609.344;
const NUM_FASTEST_MILE_RESULTS = 3;
const NUM_FASTEST_RUN_RESULTS = 3;
const NUM_LONGEST_RESULTS = 3;
const MOCK_ENABLED = false;

const ActivityListItem = ({ activity }: { activity: StravaActivity }) => {
  return (
    <li className="mb-5">
      <a
        href={`https://www.strava.com/activities/${activity.id}`}
        target="_blank"
      >
        <article className="flex justify-between">
          <p>{roundTo2(activity.distance / METERS_IN_MILE)} miles</p>
          <p>
            {/* {activity.average_heartrate}bpm */}
            {metersPerSecToMinPerMile(activity.average_speed)}
          </p>
        </article>

        <article className="flex justify-between text-xs text-slate-400">
          <p>{activity.name}</p>
          <p>{formatDate(activity.start_date)}</p>
        </article>
      </a>
    </li>
  );
};

const Section = ({
  children,
  classNames = "",
}: {
  children: React.ReactNode;
  classNames?: string;
}) => {
  return <section className={`mb-10 ${classNames}`}>{children}</section>;
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
    <Section>
      <h2 className="text-xl">{title}</h2>
      <p className="mb-3 text-sm text-slate-400">{subTitle}</p>

      <ul>
        {activities.slice(0, limit).map((activity) => {
          return <ActivityListItem activity={activity} key={activity.id} />;
        })}
      </ul>
    </Section>
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
  const runs = activities.filter((activity) => activity.sport_type === "Run");
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
    <main className="min-h-screen bg-gradient-to-b from-[#E34902] to-[#480B62] p-6 font-mono text-white">
      <div className="mx-auto max-w-md">
        <section className="mb-8 flex justify-between">
          <p className="text-3xl font-bold">{runs.length} Runs</p>
          <p className="text-3xl font-bold">{milesRan} Miles</p>
        </section>

        <TableSection
          title={`Top ${NUM_FASTEST_MILE_RESULTS} fastest miles`}
          subTitle="Based on avg of entire run, not based on splits"
          limit={NUM_FASTEST_MILE_RESULTS}
          activities={runsSortedBySpeed.filter(
            (run) => run.distance >= METERS_IN_MILE,
          )}
        />

        <TableSection
          title={`Top ${NUM_FASTEST_RUN_RESULTS} fastest sprints`}
          subTitle="Runs less than 1 mile"
          limit={NUM_FASTEST_RUN_RESULTS}
          activities={runsSortedBySpeed.filter(
            (run) => run.distance < METERS_IN_MILE,
          )}
        />

        <TableSection
          title={`Top ${NUM_LONGEST_RESULTS} longest runs`}
          limit={NUM_LONGEST_RESULTS}
          activities={runsSortedByDistance}
        />

        <Section>
          <p className="text-sm text-slate-400">
            Earliest date recorded:{" "}
            {formatDate(activities[activities.length - 1]?.start_date ?? "")}
          </p>

          <p className="text-xs text-slate-400">Pages: {pages}</p>
        </Section>
      </div>
    </main>
  );
}
