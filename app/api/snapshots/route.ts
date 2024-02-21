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
  where,
} from 'firebase/firestore';
import axios from 'axios';
import { type NextRequest } from 'next/server';

import { db } from '../../_vender/firebase';
import { SnapshotDoc, Tasks, Stats } from '../types';
import generateDesc from '../snapshots/generateDesc';

const statuses = [
  'prep and planning',
  'to do',
  'in progress',
  'waiting for code review',
  'coming to next release',
  'testing',
  'done',
];

const fetchLatest = async (
  collectionRef: CollectionReference,
  fieldValue: string
) => {
  const q = query(
    collectionRef,
    orderBy('date', 'desc'),
    limit(1),
    where('fieldValue', '==', fieldValue)
  );
  const data = await getDocs(q);
  let result: any = {};
  data.forEach((d) => {
    result = d.data();
  });
  return result;
};

const saveSnapshot = async (
  collectionRef: CollectionReference,
  data: SnapshotDoc
) => {
  await setDoc(doc(collectionRef), data);
};

const saveStats = async (collectionRef: CollectionReference, data: Stats) => {
  await setDoc(doc(collectionRef), data);
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

const fetchRawData = async (value: string) => {
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
                  value,
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
      return [status, tasks.map(({ id }) => id)];
    })
  );
  console.log(entries);
  return Object.fromEntries(entries);
};

const getIdStatusTable = (
  tasks: Tasks,
  statusIndexTable: Record<string, number>
) => {
  const table: Record<string, number> = {};
  Object.entries(tasks).forEach(([status, ids]) =>
    ids.forEach((id) => {
      table[id] = statusIndexTable[status];
    })
  );
  return table;
};

const getStats = (
  prev: { snapshots: Tasks; stats: any },
  next: { snapshots: Tasks }
) => {
  const score = statuses.reduce(
    (sum, status, index) => sum + index * next.snapshots[status].length,
    0
  );
  const ticketCounts = (Object.values(next.snapshots) as string[][]).reduce(
    (sum, ids) => sum + ids.length,
    0
  );
  const fullScore = (statuses.length - 1) * ticketCounts;
  const completeness = score / fullScore;

  const statusIndexTable = Object.fromEntries(
    statuses.map((status, index) => [status, index])
  );
  const prevStatusTable = getIdStatusTable(prev.snapshots, statusIndexTable);
  const nextStatusTable = getIdStatusTable(next.snapshots, statusIndexTable);

  let steps = 0;
  Object.entries(nextStatusTable).forEach(([id, status]) => {
    steps += Math.max(
      prevStatusTable[id] ? status - prevStatusTable[id] : 0,
      0
    );
  });

  return {
    completeness,
    progressLevel: Math.floor(completeness * 5),
    velocity: completeness - prev.stats.completeness,
    steps,
  };
};

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fieldValue = searchParams.get('value');
    if (!fieldValue)
      return new Response('value is required', {
        status: 400,
      });
    // const body = await request.json();
    // const id = body.id;

    const snapshotsCollection = collection(db, 'snapshots');
    const statsCollection = collection(db, 'stats');

    const nextSnapshots = await fetchRawData(fieldValue);
    const previousSnapshots: SnapshotDoc = await fetchLatest(
      snapshotsCollection,
      fieldValue
    );
    const previousStats = await fetchLatest(statsCollection, fieldValue);
    await saveSnapshot(snapshotsCollection, {
      fieldValue,
      date: Date.now(),
      tasks: nextSnapshots,
    });
    const stats = getStats(
      { snapshots: previousSnapshots.tasks, stats: previousStats },
      { snapshots: nextSnapshots }
    );

    const statusLevel = [
      'egg',
      'cracking egg',
      'hen in broken egg',
      'hen',
      'walking hen',
      'goaled hen',
    ];
    const { desc } = await generateDesc(statusLevel[stats.progressLevel]);

    // assigneeId
    await saveStats(statsCollection, {
      ...stats,
      desc,
      date: Date.now(),
      fieldValue,
    });

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
