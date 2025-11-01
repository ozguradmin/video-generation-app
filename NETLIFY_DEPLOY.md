# Netlify Deploy Rehberi

## Adımlar:

1. **Netlify hesabına git ve yeni site oluştur**
   - [Netlify Dashboard](https://app.netlify.com)
   - "Add new site" > "Import an existing project"
   - GitHub/GitLab/Bitbucket ile bağla veya "Deploy manually" seç

2. **Environment Variables Ekle**
   Netlify Dashboard > Site settings > Environment variables:
   - `GOOGLE_AI_API_KEY` = Gemini API anahtarın
   - `ELEVENLABS_API_KEY` = ElevenLabs API anahtarın

3. **Build Ayarları**
   - Build command: `npm run build`
   - Publish directory: `.next` (Next.js için otomatik)

4. **Manuel Deploy İçin:**
   - `npm run build` komutunu çalıştır (Remotion bundle oluşturur)
   - `remotion/bundle` klasörünü `.gitignore`'dan çıkar (veya Netlify build sırasında oluşturur)

## Önemli Notlar:

- Remotion bundle build sırasında otomatik oluşturulur (`postbuild` script)
- API routes Netlify Functions olarak çalışır
- Log dosyaları `/public/output/` klasöründe oluşturulur (geçici olarak)
- Video dosyaları `/public/output/` klasöründe oluşturulur

## Sorun Giderme:

- Build başarısız olursa: Environment variables'ı kontrol et
- Remotion bundle oluşmazsa: `postbuild` script'ini kontrol et
- API çalışmazsa: Netlify Functions log'larını kontrol et

