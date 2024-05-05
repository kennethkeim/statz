import { env } from "process";
import type { StravaActivity } from "../_models/strava-activities.model";

const MAX_FETCH_PAGES = 5;

export const roundTo2 = (num: number): string => {
  // apparently this rounding isn't bulletproof - https://stackoverflow.com/a/12830454/8935239
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
};

export const metersPerSecToMinPerMile = (metersPerSec: number): string => {
  const min = 26.8224 / metersPerSec;
  const wholeMinutes = Math.floor(min);
  const sec = Math.round((min - wholeMinutes) * 60);
  return `${wholeMinutes}:${sec.toString().padStart(2, "0")}`;
};

export const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const dateString = `${date.getFullYear()}/${month}/${day}`;
  return dateString;
};

// Temporary quickstart to fetch data from Strava
export const getActivitiesPage = async (
  page: number,
): Promise<StravaActivity[]> => {
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

export const getAllActivities = async (): Promise<
  [number, StravaActivity[]]
> => {
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
