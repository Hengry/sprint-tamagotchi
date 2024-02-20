import {
  CollectionReference,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  limit,
  query,
  orderBy,
} from 'firebase/firestore';
import axios from 'axios';

import { db } from '../../_vender/firebase';
import { Snapshot, Stats } from '../types';

const statuses = [
  'prep and planning',
  'to do',
  'in progress',
  'waiting for code review',
  'coming to next release',
  'testing',
  'done',
];

const fetchLatestSnapshot = async (collectionRef: CollectionReference) => {
  const q = query(collectionRef, orderBy('date', 'desc'), limit(1));
  const data = await getDocs(q);
  let result = {};
  data.forEach((d) => {
    result = d.data();
  });
  return result;
};

const saveSnapshot = async (
  collectionRef: CollectionReference,
  data: Snapshot
) => {
  await setDoc(doc(collectionRef), { ...data, date: Date.now() });
};

const saveStats = async (collectionRef: CollectionReference, data: Stats) => {
  await setDoc(doc(collectionRef), { ...data, date: Date.now() });
};

const clickupAPI = async (url: string, options?: object) => {
  console.log(url);
  return axios
    .get(url, {
      headers: {
        Authorization: 'pk_78236060_6445TL42UTMLKHJISXXF6JBC6O0PJ3GT',
        'Content-Type': 'application/json',
      },
      ...options,
    })
    .then((res) => res.data);
};

const fetchRawData = async () => {
  const teams = await clickupAPI(`https://api.clickup.com/api/v2/team`);
  const team = teams.teams.find(({ name }: any) => name === 'Cardinal Blue');

  const spaces = await clickupAPI(
    `https://api.clickup.com/api/v2/team/${team.id}/space`
  );
  const space = spaces.spaces.find(
    ({ name }: any) => name === 'PicCollage (P/C/R)'
  );

  const lists = await clickupAPI(
    `https://api.clickup.com/api/v2/space/${space.id}/list`
  );
  const list = lists.lists.find(({ name }: any) => name === 'iOS sprint');

  const entries = await Promise.all(
    statuses.map(async (status) => {
      let tasks: any[] = [];
      let page = 0;
      let isEnd = false;
      while (!isEnd) {
        const res = await clickupAPI(
          `https://api.clickup.com/api/v2/list/${list.id}/task`,
          {
            params: {
              statuses: [status],
              page,
              custom_fields: JSON.stringify([
                {
                  field_id: '6ea9b8e4-836d-49fd-ad22-490fea467744',
                  operator: '=',
                  value: '8.34',
                },
              ]),
            },
          }
        );
        tasks = [...tasks, ...res.tasks];
        // console.log('status', status, res);
        isEnd = Boolean(res.last_page);
        page++;
      }
      return [status, tasks.length];
    })
  );
  console.log(entries);
  return Object.fromEntries(entries);
};

const getStats = (previousData: any, nextData: any) => {
  const score = statuses.reduce(
    (sum, status, index) => sum + index * nextData[status],
    0
  );
  const ticketCounts = (Object.values(nextData) as number[]).reduce(
    (sum, count) => sum + count,
    0
  );
  const fullScore = (statuses.length - 1) * ticketCounts;
  return { completeness: score / fullScore };
};

export async function POST(request: Request) {
  try {
    // const body = await request.json();
    // const id = body.id;

    const snapshotsCollection = collection(db, 'snapshots');
    const statsCollection = collection(db, 'stats');

    const nextData = await fetchRawData();
    const previousData = await fetchLatestSnapshot(snapshotsCollection);
    await saveSnapshot(snapshotsCollection, { tasks: nextData });
    const stats = getStats(previousData, nextData);
    // assigneeId
    await saveStats(statsCollection, stats);

    // const config = useRuntimeConfig()
    // const SLACK_BOT_TOKEN = config.slackBotToken

    console.log('updated');
    return Response.json(stats);
  } catch (error) {
    console.error(error);
    return new Response(`error: ${error}`, {
      status: 400,
    });
  }
}
