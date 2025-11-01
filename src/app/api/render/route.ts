import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
// renderVideoOnServer'ı dinamik olarak yüklüyoruz, böylece Next.js bundler'ı onu analiz etmeyecek

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});
const writeFileAsync = promisify(fs.writeFile);

// Netlify serverless functions için /tmp kullan, yoksa public/output
const logDir = process.env.NETLIFY 
  ? path.join('/tmp', 'output')
  : path.join(process.cwd(), 'public', 'output');
const logFilePath = path.join(logDir, 'process.log');

function logProgress(message: string) {
  const timestamp = new Date().toISOString();
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
  } catch (error) {
    // Log yazma hatası - konsola yaz
    console.error(`[${timestamp}] ${message}`);
  }
}


async function generateScriptWithGemini(url: string): Promise<string> {
  logProgress('Generating script with Gemini from URL...');
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }
    // MODEL GÜNCELLENDİ - Kullanıcının istediği model adı kullanılıyor.
    // Google Search tool'unu model oluştururken etkinleştiriyoruz
    // googleSearch tip tanımı SDK'da eksik ama API'de destekleniyor
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-09-2025",
      tools: [
        {
          googleSearch: {}
        } as any
      ] as any,
      systemInstruction: "Sen, verilen URL'leri analiz edip içeriklerini genç kitle için video senaryosuna dönüştüren bir yapay zeka asistanısın."
    });

    const prompt = `Lütfen aşağıdaki URL'yi ziyaret et, içeriğini analiz et ve bu içeriği, genç kitleye yönelik, dikkat süresi düşük kişilerin ilgisini çekecek şekilde, kısa ve vurucu cümlelerle bir video senaryosuna dönüştür. Metin, bir "brainrot" veya "storytime" videosu senaryosu gibi olmalı. Eğer orijinal içerik İngilizce veya başka bir dildeyse, senaryoyu mutlaka akıcı bir Türkçeye çevir. Çıktı sadece ve sadece video senaryosu olmalı, ekstra bir açıklama ekleme. Maksimum 60 saniyelik bir video için uygun uzunlukta olmalı.\n\nURL: ${url}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text();
    logProgress('Script generated successfully by Gemini.');
    return script;
  } catch (error) {
    logProgress(`ERROR during Gemini script generation: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error('Failed to generate script using Gemini.');
  }
}

async function synthesizeSpeechWithElevenLabs(text: string): Promise<string> {
  logProgress('Synthesizing speech with ElevenLabs...');
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }
    
    // Rachel sesinin voice_id'sini kullanıyoruz (bu ID'yi ElevenLabs dokümantasyonundan alabilirsiniz)
    // Alternatif olarak, kullanıcının kendi seslerinden birini de kullanabilirsiniz
    const voiceId = "Rachel"; // Bu bir placeholder, gerçek voice_id ile değiştirilmeli
    
    // Önce Rachel sesinin ID'sini bulalım veya varsayılan bir ID kullanalım
    // ElevenLabs'in standart seslerinden biri için ID: "21m00Tcm4TlvDq8ikWAM" (Rachel için)
    // Ama kullanıcı kendi seslerini de kullanabilir
    const defaultVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Bu Rachel sesi için örnek bir ID
    
    const audio = await elevenlabs.textToSpeech.convert(
      defaultVoiceId,
      {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    );

    // Netlify için /tmp, local için public/output
    const outputDir = process.env.NETLIFY
      ? path.join('/tmp', 'output')
      : path.join(process.cwd(), 'public', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const audioFilePath = path.join(outputDir, 'audio.mp3');

    // ReadableStream'i buffer'lara oku
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    // Tüm buffer'ları birleştir
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = Buffer.concat(chunks, totalLength);
    
    // Buffer'ı dosyaya yaz
    await writeFileAsync(audioFilePath, buffer);

    logProgress(`Audio content written to file: ${audioFilePath}`);
    // Netlify için /tmp kullanıldığında dosya yolunu değiştir
    return process.env.NETLIFY ? '/tmp/output/audio.mp3' : '/output/audio.mp3';
  } catch (error) {
    const errorDetails = error instanceof Error 
      ? `${error.message} | Stack: ${error.stack?.substring(0, 300)}`
      : String(error);
    logProgress(`ERROR during ElevenLabs speech synthesis: ${errorDetails}`);
    throw new Error(`Failed to synthesize speech with ElevenLabs: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export async function POST(request: Request) {
  // Her istekte log dosyasını temizle
  try {
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
  } catch (e) {
    console.error('Could not delete log file:', e);
  }
  logProgress('API request received.');
  console.log('API request received - starting video generation');

  try {
    const { url } = await request.json();
    logProgress(`Received URL: ${url}`);

    if (!url) {
      logProgress('ERROR: URL is required.');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const script = await generateScriptWithGemini(url);
    const audioUrl = await synthesizeSpeechWithElevenLabs(script);
    logProgress('Calling renderVideoOnServer...');
    // Dinamik import ile render.ts dosyasını yüklüyoruz
    const { renderVideoOnServer } = await import('../../../remotion/render');
    const videoUrl = await renderVideoOnServer(script, audioUrl);

    logProgress('All steps completed. Returning video URL.');
    return NextResponse.json({ videoUrl: videoUrl, script: script, audioUrl: audioUrl });
  } catch (error) {
    const errorDetails = error instanceof Error 
      ? `${error.message}\nStack: ${error.stack?.substring(0, 500)}`
      : String(error);
    logProgress(`FATAL ERROR in POST handler: ${errorDetails}`);
    console.error('FATAL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const stackTrace = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      error: 'Failed to render video', 
      details: errorMessage,
      stack: stackTrace?.substring(0, 1000) // İlk 1000 karakter
    }, { status: 500 });
  }
}
