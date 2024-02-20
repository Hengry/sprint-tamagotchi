import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';

import { db } from '../../../_vender/firebase';

const fetchLatestStats = async (userId: string) => {
  const collectionRef = collection(db, 'stats');
  const data = await getDoc(doc(collectionRef));
  return data.data()?.stats.find(({ assignee }: any) => assignee === userId);
};

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    const data = await fetchLatestStats(userId);

    // const config = useRuntimeConfig()
    // const SLACK_BOT_TOKEN = config.slackBotToken
    console.log('data', data);
    return Response.json(data || {});
  } catch (error) {
    console.error(error);
    return new Response(`error: ${error}`, {
      status: 400,
    });
  }
}
