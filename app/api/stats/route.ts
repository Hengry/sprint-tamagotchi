import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';

import { db } from '../../_vender/firebase';

const fetchLatestStats = async () => {
  const collectionRef = collection(db, 'stats');
  const q = query(collectionRef, orderBy('date', 'desc'), limit(1));
  const data = await getDocs(q);
  let result = {};
  data.forEach((d) => {
    result = d.data();
  });
  return result;
};

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await fetchLatestStats();

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
