import {
  collection,
  getDocs,
  limit,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { type NextRequest } from 'next/server';

import { db } from '../../_vender/firebase';

const fetchLatestStats = async (fieldValue: string) => {
  const collectionRef = collection(db, 'stats');
  const q = query(
    collectionRef,
    orderBy('date', 'desc'),
    limit(1),
    where('fieldValue', '==', fieldValue)
  );
  const data = await getDocs(q);
  let result = {};
  data.forEach((d) => {
    result = d.data();
  });
  return result;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fieldValue = searchParams.get('value');
    if (!fieldValue)
      return new Response('value is required', {
        status: 400,
      });
    const data = await fetchLatestStats(fieldValue);

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
