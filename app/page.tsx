/** @jsxImportSource @emotion/react */
'use client';
import Image from 'next/image';
import tw from 'twin.macro';
import { twJoin } from 'tailwind-merge';
import { collection, addDoc } from 'firebase/firestore';
import { Icon } from '@iconify/react';
import { db } from './_vender/firebase';
import tagNames from './tags.data';

import Auth from './Auth';
import { useCallback } from 'react';

const Title = tw.div`p-8`;

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

export default function Home() {
  const handleClick = async (value: string) => {
    const collectionName =
      process.env.NODE_ENV === 'production' ? 'tags' : 'devTags';
    const tagsCollection = collection(db, collectionName);
    const newTag: Tag = {
      deviceTime: Date.now(),
      value,
    };
    const docRef = await addDoc(tagsCollection, newTag);
  };
  return (
    <main>
      <Auth />
      <div className='grid grid-cols-3 gap-2 p-2'>
        {tagNames.map((name) => (
          <TagButton key={name} onClick={handleClick} value={name} />
        ))}
      </div>
    </main>
  );
}
