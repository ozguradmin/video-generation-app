"use client";

import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const MyVideo: React.FC<{ script: string; audioUrl: string }> = ({
  script,
  audioUrl,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
      }}
    >
      <Audio src={audioUrl} />
      <div
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 80, // Yazı boyutunu biraz küçülttük
          textAlign: 'center',
          color: 'white',
          opacity,
          padding: '40px',
          maxWidth: '90%',
        }}
      >
        {script}
      </div>
    </AbsoluteFill>
  );
};
