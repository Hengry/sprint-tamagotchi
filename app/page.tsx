/** @jsxImportSource @emotion/react */
'use client';
import tw from 'twin.macro';
import { twJoin, twMerge } from 'tailwind-merge';
import {
  collection,
  addDoc,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';
import { Icon } from '@iconify/react';
import { auth, db } from './_vender/firebase';
import { tags, Tag } from './data';

import Auth from './Auth';
import { useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const Title = tw.div`p-8`;

interface Record extends Tag {
  deviceTime: number;
  serverTime: FieldValue;
  user?: string;
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
        'rounded touch-manipulation relative',
        tag.color || 'bg-gray-800 '
      )}
      onClick={handleClick}
    >
      {tag.icon && (
        <Icon
          className='absolute h-full w-auto aspect-square right-0 text-white/10'
          icon={tag.icon}
        />
      )}
      <div className='whitespace-pre-wrap p-2 relative z-10'>{tag.text}</div>
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
      user: auth.currentUser?.uid,
    };

    toast.promise(addDoc(tagsCollection, newTag), {
      loading: 'Loading',
      success: `Succeeded ${tag.text}`,
      error: 'Error',
    });
  };
  return (
    <main className='touch-manipulation'>
      <Auth />
      <div className='grid grid-cols-3 gap-2 p-2'>
        {tags.map((tag) => (
          <TagButton key={tag.text} tag={tag} onClick={handleClick} />
        ))}
      </div>
      <Toaster />
    </main>
  );
}
