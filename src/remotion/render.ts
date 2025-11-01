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
    // audioUrl /output/audio.mp3 veya /tmp/output/audio.mp3 formatında gelebilir
    let audioFilePath;
    if (audioUrl.startsWith('/tmp')) {
      audioFilePath = audioUrl;
    } else if (audioUrl.startsWith('/output')) {
      audioFilePath = process.env.NETLIFY || process.env.NETLIFY_DEV
        ? audioUrl.replace('/output', '/tmp/output')
        : path.join(process.cwd(), 'public', audioUrl);
    } else {
      audioFilePath = process.env.NETLIFY || process.env.NETLIFY_DEV
        ? path.join('/tmp', audioUrl.replace(/^\//, ''))
        : path.join(process.cwd(), 'public', audioUrl);
    }
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
    
    // Netlify'da /tmp'deki dosyalar frontend'den erişilemez
    // Video'yu base64 encode edip return edelim veya dosyayı okuyalım
    if (process.env.NETLIFY || process.env.NETLIFY_DEV) {
      // Netlify'da: Video dosyasını base64'e çevir veya başka bir storage'a yükle
      const videoBuffer = fs.readFileSync(outputLocation);
      const videoBase64 = videoBuffer.toString('base64');
      // Geçici olarak base64 URL döndür - frontend'de decode edeceğiz
      return `data:video/mp4;base64,${videoBase64}`;
    }
    
    // Local development: Normal path
    return '/output/video.mp4';
  } catch (error) {
    console.error('Error rendering video:', error);
    throw new Error('Failed to render the video with Remotion.');
  }
};
