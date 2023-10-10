/** @jsxImportSource @emotion/react */
'use client';
import Image from 'next/image';
import tw from 'twin.macro';
import { twJoin } from 'tailwind-merge';

const Title = tw.div`p-8`;
export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div
        className={twJoin([
          'relative flex place-items-center z-[-1]',
          'before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full ',
          "before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-['']",
          'before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 before:lg:h-[360px]',
          'after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3',
          "after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] ",
          'after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40',
        ])}
      >
        <Image
          className='relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert'
          src='/next.svg'
          alt='Next.js Logo'
          width={180}
          height={37}
          priority
        />
      </div>
      <Title>Starter from Hengry</Title>
    </main>
  );
}
