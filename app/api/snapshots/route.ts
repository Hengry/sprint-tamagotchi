import {
  CollectionReference,
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import { db } from '../../_vender/firebase';
import { Snapshot, Stats } from '../types';

const fetchLatestSnapshot = async (collectionRef: CollectionReference) =>
  getDoc(doc(collectionRef));

const saveSnapshot = async (
  collectionRef: CollectionReference,
  data: Snapshot
) => {
  await setDoc(doc(collectionRef), data);
};

const saveStats = async (collectionRef: CollectionReference, data: Stats) => {
  await setDoc(doc(collectionRef), data);
};

const fetchRawData = (id: string) => {
  // fetch
  return {};
};

const getStats = (previousData, nextData) => {
  // calc
  return {};
};

export default async function POST(request: Request) {
  try {
    const { body } = await request.json();
    const id = body.id;

    const snapshotsCollection = collection(db, 'snapshots');
    const statsCollection = collection(db, 'stats');

    const nextData = await fetchRawData(id);
    const previousData = await fetchLatestSnapshot(snapshotsCollection);
    await saveSnapshot(snapshotsCollection, nextData);
    const stats = getStats(previousData, nextData);
    // assigneeId
    await saveStats(statsCollection, stats);

    // const config = useRuntimeConfig()
    // const SLACK_BOT_TOKEN = config.slackBotToken

    return {
      ok: true,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: 'failed',
      error,
    };
  }
}
