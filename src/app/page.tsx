'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log'ları polling ile çek
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error('Log fetch error:', err);
      }
    };

    if (loading) {
      // Her 2 saniyede bir log'ları güncelle
      fetchLogs(); // İlk hemen çek
      logIntervalRef.current = setInterval(fetchLogs, 2000);
    } else {
      // İşlem bittiğinde son bir kez çek ve interval'i temizle
      fetchLogs();
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    }

    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVideoUrl(null);
    setError(null);
    setLogs([]);
    setShowLogs(true);

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      // Response'u önce text olarak oku, sonra JSON'a çevir
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        throw new Error(`Sunucudan boş yanıt alındı (Status: ${response.status}). API çalışmıyor olabilir. Lütfen Netlify Function log'larını kontrol edin.`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // JSON parse hatası - muhtemelen HTML error sayfası dönmüş
        throw new Error(`Sunucu hatası (Status ${response.status}): ${text.substring(0, 500)}`);
      }

      if (!response.ok) {
        const errorMsg = data.error || data.details || data.message || 'Bir hata oluştu.';
        const stackInfo = data.stack ? `\n\nStack Trace:\n${data.stack.substring(0, 500)}` : '';
        const fullError = errorMsg + stackInfo;
        throw new Error(fullError);
      }

      // Video varsa göster, yoksa sadece script ve audio bilgisi ver
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        // Video oluşturulamadı ama script ve audio hazır
        setError(`Video oluşturulamadı ancak script ve ses dosyası hazır. ${data.videoGenerated === false ? 'Video rendering başarısız oldu.' : ''}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Bilinmeyen bir hata oluştu.';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyLogs = () => {
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      alert('Log\'lar kopyalandı!');
    }).catch(() => {
      alert('Log\'lar kopyalanamadı.');
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-2xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-8">
          Makale URL'sinden Video Oluşturucu
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          İlgi çekici bir haber veya makale linki yapıştırın, sizin için özetleyip "brainrot" formatında bir videoya dönüştürelim.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ornek-haber-sitesi.com/makale"
            required
            className="w-full max-w-lg p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 px-8 py-3 rounded-lg font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Video Oluşturuluyor...' : 'Videoyu Oluştur'}
          </button>
        </form>

        {error && <p className="mt-8 text-red-500">{error}</p>}

        {/* Log Gösterimi */}
        {showLogs && (
          <div className="mt-8 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">İşlem Logları</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyLogs}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all"
                >
                  📋 Log'ları Kopyala
                </button>
                <button
                  onClick={() => setShowLogs(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-all"
                >
                  ✖️ Gizle
                </button>
              </div>
            </div>
            <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500">Log bekleniyor...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1 whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="mt-12 w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Oluşturulan Video</h2>
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
               <video controls src={videoUrl} className="w-full h-full">
                Your browser does not support the video tag.
              </video>
            </div>
            <a
              href={videoUrl}
              download
              className="mt-6 inline-block px-8 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
            >
              Videoyu İndir
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
