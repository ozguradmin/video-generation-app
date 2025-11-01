import { renderMedia, selectComposition } from '@remotion/renderer';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import path from 'path';
import fs from 'fs';

// Bu fonksiyon, Next.js API rotasından çağrılacak.
export const renderVideoOnServer = async (script: string, audioUrl: string): Promise<string> => {
  try {
    console.log('Starting video render process...');
    const compositionId = 'MyComposition';
    // Remotion kompozisyonlarımızın giriş noktası
    const entryPoint = path.resolve(process.cwd(), 'src/remotion/index.ts');

    const audioFilePath = path.join(process.cwd(), 'public', audioUrl);
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at: ${audioFilePath}`);
    }

    const audioDurationInSeconds = await getAudioDurationInSeconds(audioFilePath);
    const fps = 30;
    const durationInFrames = Math.ceil(audioDurationInSeconds * fps) + 30;
    console.log(`Calculated duration: ${durationInFrames} frames.`);

    const outputDir = path.join(process.cwd(), 'public', 'output');
    const outputLocation = path.join(outputDir, 'video.mp4');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Selecting composition...');
    // Remotion bundle location - bundle'ı daha önce oluşturmalıyız
    const bundleLocation = path.join(process.cwd(), 'remotion', 'bundle');
    
    // Bundle location kullan - server-side rendering için gerekli
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        script,
        audioUrl,
      },
    });

    console.log('Rendering media...');
    await renderMedia({
      composition: { ...composition, durationInFrames },
      outputLocation,
      codec: 'h264',
    });

    console.log(`Video rendered successfully at: ${outputLocation}`);
    return '/output/video.mp4';
  } catch (error) {
    console.error('Error rendering video:', error);
    throw new Error('Failed to render the video with Remotion.');
  }
};
