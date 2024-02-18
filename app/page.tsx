/** @jsxImportSource @emotion/react */
'use client';
import Image from 'next/image';
import tw from 'twin.macro';
import { twJoin, twMerge } from 'tailwind-merge';
import {
  collection,
  addDoc,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';
import { Icon } from '@iconify/react';
import { db } from './_vender/firebase';
import { tags, Tag } from './data';

import Auth from './Auth';
import { useCallback } from 'react';

const Title = tw.div`p-8`;

interface Record extends Tag {
  deviceTime: number;
  serverTime: FieldValue;
}

interface TagButtonProps {
  onClick: (v: Tag) => void;
  tag: Tag;
}
function TagButton<T extends string>({ onClick, tag }: TagButtonProps) {
  const handleClick = useCallback(() => {
    onClick(tag);
  }, [onClick, tag]);

  return (
    <button
      className={twJoin(
        'rounded whitespace-pre-wrap p-2 touch-manipulation',
        tag.color || 'bg-gray-800 '
      )}
      onClick={handleClick}
    >
      {tag.text}
    </button>
  );
}

export default function Home() {
  const handleClick = async (tag: Tag) => {
    const collectionName =
      process.env.NODE_ENV === 'production' ? 'tags' : 'devTags';
    const tagsCollection = collection(db, collectionName);
    const newTag: Record = {
      ...tag,
      deviceTime: Date.now(),
      serverTime: serverTimestamp(),
    };
    const docRef = await addDoc(tagsCollection, newTag);
  };
  return (
    <main>
      <Auth />
      <div className='grid grid-cols-3 gap-2 p-2'>
        {tags.map((tag) => (
          <TagButton key={tag.text} tag={tag} onClick={handleClick} />
        ))}
      </div>
    </main>
  );
}
