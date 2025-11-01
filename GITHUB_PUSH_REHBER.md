# GitHub'a Push Etme Rehberi

## Yöntem 1: Terminal/Komut İstemi ile (En Kolay)

### Adımlar:

1. **Komut İstemi'ni Aç (Windows)**
   - Windows tuşuna bas
   - "cmd" veya "PowerShell" yaz
   - "Command Prompt" veya "Windows PowerShell" seç

2. **Proje Klasörüne Git**
   ```bash
   cd C:\dev\manuelyt
   ```

3. **Push Et**
   ```bash
   git push origin main
   ```

4. **Eğer Authentication İsterse:**
   - GitHub username ve password sorabilir
   - Password yerine **Personal Access Token** kullanman gerekebilir
   - Token oluştur: https://github.com/settings/tokens
   - "Generate new token" > "classic" seç
   - `repo` yetkisi ver
   - Token'ı kopyala ve password olarak kullan

## Yöntem 2: GitHub Desktop (En Kolay - Önerilen)

1. **GitHub Desktop İndir**
   - https://desktop.github.com/
   - İndir ve kur

2. **Hesabını Bağla**
   - GitHub Desktop'ı aç
   - File > Options > Accounts
   - GitHub hesabını bağla

3. **Repository'yi Aç**
   - File > Add Local Repository
   - `C:\dev\manuelyt` klasörünü seç

4. **Push Et**
   - Üstte "Push origin" butonunu gör
   - Tıkla - otomatik push eder

## Yöntem 3: Visual Studio Code ile

1. **VS Code'u Aç**
   - VS Code'da `C:\dev\manuelyt` klasörünü aç

2. **Source Control Paneli**
   - Sol menüden Source Control ikonuna tıkla (Ctrl+Shift+G)

3. **Push Et**
   - Üstte "..." menüsüne tıkla
   - "Push" seç
   - Veya terminal'de `git push origin main` yaz

## Yöntem 4: Manuel Push (Internet Sorunu Varsa)

Eğer internet bağlantısı sorunluysa:

1. **Commit'leri Kontrol Et**
   ```bash
   cd C:\dev\manuelyt
   git log --oneline -5
   ```

2. **Internet Bağlantısını Kontrol Et**
   - Başka bir ağa bağlan (telefon hotspot vb.)
   - Tekrar push et

## Hata Çözümleri:

### "Could not resolve host: github.com"
- **Çözüm:** Internet bağlantını kontrol et
- **Alternatif:** Başka bir ağ kullan

### "Authentication failed"
- **Çözüm:** Personal Access Token kullan
- Token oluştur: https://github.com/settings/tokens

### "Everything up-to-date"
- **Anlamı:** Zaten push edilmiş
- Yeni commit varsa tekrar dene

## En Kolay Yol: GitHub Desktop

GitHub Desktop kullanmak en kolay yol. İndirip kur, repository'yi aç ve "Push" butonuna tıkla - hepsi bu!

