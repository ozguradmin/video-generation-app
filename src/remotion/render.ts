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

    // Netlify için /tmp, local için public
    const baseDir = process.env.NETLIFY ? '/tmp' : path.join(process.cwd(), 'public');
    const audioFilePath = path.join(baseDir, audioUrl);
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at: ${audioFilePath}`);
    }

    const audioDurationInSeconds = await getAudioDurationInSeconds(audioFilePath);
    const fps = 30;
    const durationInFrames = Math.ceil(audioDurationInSeconds * fps) + 30;
    console.log(`Calculated duration: ${durationInFrames} frames.`);

    const outputDir = process.env.NETLIFY 
      ? path.join('/tmp', 'output')
      : path.join(process.cwd(), 'public', 'output');
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
      serveUrl: bundleLocation,
      composition: { ...composition, durationInFrames },
      outputLocation,
      codec: 'h264',
    });

    console.log(`Video rendered successfully at: ${outputLocation}`);
    // Netlify için /tmp kullanıldığında dosya yolunu değiştir
    return process.env.NETLIFY ? '/tmp/output/video.mp4' : '/output/video.mp4';
  } catch (error) {
    console.error('Error rendering video:', error);
    throw new Error('Failed to render the video with Remotion.');
  }
};
