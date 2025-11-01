# GitHub'a Deploy Rehberi

## Adımlar:

### 1. GitHub'da Repository Oluştur
1. GitHub'a git: https://github.com
2. "+" butonuna tıkla > "New repository"
3. Repository adını gir (örn: `video-generation-app`)
4. Public veya Private seç
5. "Initialize this repository with a README" SEÇME
6. "Create repository" tıkla

### 2. Repository'yi Bağla ve Push Et

Aşağıdaki komutları terminalde çalıştır (GitHub'dan aldığın repository URL'sini kullan):

```bash
cd C:\dev\manuelyt
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

**Örnek:**
```bash
git remote add origin https://github.com/ozgur/video-generation-app.git
git branch -M main
git push -u origin main
```

### 3. Netlify'a Bağla (GitHub'dan)

1. Netlify'a git: https://app.netlify.com
2. "Add new site" > "Import an existing project"
3. "Deploy with GitHub" seç
4. GitHub hesabını bağla (gerekirse)
5. Repository'ni seç
6. Environment Variables ekle:
   - `GOOGLE_AI_API_KEY` = Gemini API anahtarın
   - `ELEVENLABS_API_KEY` = ElevenLabs API anahtarın
7. "Deploy site" tıkla

### 4. Veya Vercel'e Deploy Et (Alternatif)

1. Vercel'e git: https://vercel.com
2. "Add New Project"
3. GitHub repository'ni seç
4. Environment Variables ekle
5. "Deploy" tıkla

## Önemli Notlar:

- Repository URL'sini aldıktan sonra bana söyle, ben push edebilirim
- Ya da sen manuel olarak yukarıdaki komutları çalıştırabilirsin
- GitHub repository URL'i şu formatta olur: `https://github.com/KULLANICI_ADI/REPO_ADI.git`

