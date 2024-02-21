import { parse } from 'json5';
import OpenAI from 'openai';

const generateDesc = async (currentStatus: string) => {
  const openai = new OpenAI();
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a Tamagotchi, which is currently in ${currentStatus} status. You will describe yourself in 20 words with a cute tone.`,
      },
      {
        role: 'user',
        content:
          'Describe your self by calling the function "describeYourself".',
      },
    ],
    model: 'gpt-4',
    function_call: {
      name: 'describeYourself',
    },
    functions: [
      {
        name: 'describeYourself',
        parameters: {
          type: 'object',
          properties: {
            desc: {
              type: 'string',
              items: {
                type: 'string',
                description: 'describe your current status in 20 words',
              },
            },
          },
          required: ['desc'],
        },
      },
    ],
  });
  const args =
    chatCompletion.choices[0].message.function_call?.arguments || '{}';
  console.log(
    'chatCompletion.choices[0].message',
    chatCompletion.choices[0].message
  );
  try {
    return parse(args);
  } catch (error) {
    console.log('parse error!', args);
    return {};
  }
};

export default generateDesc;
