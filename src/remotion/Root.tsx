"use client";

import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        // Süre, API'de ses dosyasına göre dinamik olarak hesaplanacak.
        // Studio için varsayılan bir değer bırakıyoruz.
        durationInFrames={300} 
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          script: 'Bu, Remotion Studio için varsayılan bir metindir. API üzerinden video oluşturulduğunda burası dinamik olarak dolacak.',
          // Studio'da test için public klasörüne bir ses dosyası ekleyebilirsiniz.
          audioUrl: '', 
        }}
      />
    </>
  );
};
