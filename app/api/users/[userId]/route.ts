import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';

import { db } from '../../../_vender/firebase';

const fetchLatestStats = async (userId: string) => {
  const collectionRef = collection(db, 'stats');
  const data = await getDoc(doc(collectionRef));
  return data.data()?.stats.find(({ assignee }: any) => assignee === userId);
};

export default async function GET(request: Request) {
  try {
    const {
      body: { userId },
    } = await request.json();

    const data = await fetchLatestStats(userId);

    // const config = useRuntimeConfig()
    // const SLACK_BOT_TOKEN = config.slackBotToken

    return {
      ok: true,
      data,
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
