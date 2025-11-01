"use client";

import { AbsoluteFill } from 'remotion';
import { MyVideo } from './Video';

export const MyComposition: React.FC<{ script: string; audioUrl: string }> = ({
  script,
  audioUrl,
}) => {
  return (
    <AbsoluteFill>
      <MyVideo script={script} audioUrl={audioUrl} />
    </AbsoluteFill>
  );
};
