/** @jsxImportSource @emotion/react */
'use client';
import Image from 'next/image';
import tw from 'twin.macro';
import { twJoin } from 'tailwind-merge';
import { collection, addDoc } from 'firebase/firestore';
import { Icon } from '@iconify/react';
import { db } from './_vender/firebase';

import Auth from './Auth';
import { useCallback } from 'react';

const Title = tw.div`p-8`;
const Button = tw.button`bg-gray-800 rounded whitespace-pre-wrap p-2`;

interface Tag {
  deviceTime: number;
  serverTime?: number;
  value: string;
}

interface TagButtonProps<T> {
  onClick: (v: T) => void;
  value: T;
}
function TagButton<T extends string>({ onClick, value }: TagButtonProps<T>) {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [onClick, value]);
  return (
    <button
      className='bg-gray-800 rounded whitespace-pre-wrap p-2'
      onClick={handleClick}
    >
      {value}
    </button>
  );
}

const tagNames = [
  'Food\n10',
  'Food\n100',
  'Food\n1000',
  'Desert\n10',
  'Desert\n100',
  'Desert\n1000',
  'Alcohol\n10',
  'Alcohol\n100',
  'Alcohol\n1000',
  'Med\n10',
  'Med\n100',
  'Med\n1000',
  'Game\n10',
  'Game\n100',
  'Game\n1000',
  'Ticket\n10',
  'Ticket\n100',
  'Ticket\n1000',
];

export default function Home() {
  const handleClick = async (value: string) => {
    const tagsCollection = collection(db, 'tags');
    const newTag: Tag = {
      deviceTime: Date.now(),
      value,
    };
    const docRef = await addDoc(tagsCollection, newTag);
  };
  return (
    <main>
      <Auth />
      <Title>Starter from Hengry</Title>
      <div className='grid grid-cols-3 gap-2 p-2'>
        {tagNames.map((name) => (
          <TagButton key={name} onClick={handleClick} value={name} />
        ))}
      </div>
    </main>
  );
}
