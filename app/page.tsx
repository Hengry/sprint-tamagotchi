/** @jsxImportSource @emotion/react */
'use client';
import Image from 'next/image';
import tw from 'twin.macro';
import { twJoin } from 'tailwind-merge';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './_vender/firebase';

import Auth from './Auth';

const Title = tw.div`p-8`;
export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Auth />
      <Title>Starter from Hengry</Title>
    </main>
  );
}
