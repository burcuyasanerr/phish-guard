# Phish Guard 🛡️

Kötü amaçlı (malware) ve tuzak (phishing) siteleri tespit edip kullanıcıyı uyaran bir **Google Chrome** eki (Manifest V3).

> Durum: **İskelet / erken geliştirme (v0.1.0)**

## Nasıl çalışır?

Her sayfa açıldığında üç katmanlı bir kontrol yapılır:

1. **Kara liste** – Alan adı bilinen kötü amaçlı siteler listesinde mi? (`src/data/blocklist.json`)
   Eşleşme varsa sekme bir uyarı sayfasına yönlendirilir.
2. **URL sezgileri** – IP adresli alan adı, punycode, marka taklidi, şüpheli uzantılar (`.xyz`, `.zip` …),
   `@` karakteri, HTTPS eksikliği gibi işaretler puanlanır. (`src/lib/heuristics.js`)
3. **Sayfa sinyalleri** – HTTP üzerinden parola alanı, parolayı başka alan adına gönderen formlar gibi
   içerik tabanlı işaretler. (`src/content/content.js`)

Toplam puana göre site **Güvenli / Şüpheli / Tehlikeli** olarak sınıflandırılır; sonuç eklenti
simgesindeki rozette ve açılır pencerede (popup) gösterilir.

## Proje yapısı

```
phish-guard/
├── manifest.json              # Eklenti tanımı (MV3)
├── src/
│   ├── background/
│   │   └── service-worker.js  # Sekmeleri izler, analiz eder, rozeti günceller
│   ├── content/
│   │   └── content.js         # Sayfa içi sinyalleri toplar, uyarı bandı gösterir
│   ├── lib/
│   │   ├── analyzer.js        # Tüm kontrolleri birleştirip risk seviyesi üretir
│   │   ├── heuristics.js      # URL kuralları
│   │   └── blocklist.js       # Kara liste yükleme/sorgulama
│   ├── data/
│   │   └── blocklist.json     # Örnek kara liste
│   ├── popup/                 # Simgeye tıklayınca açılan pencere
│   ├── options/               # Ayarlar (izin verilen siteler)
│   └── warning/               # Tehlikeli site uyarı sayfası
└── tests/
    └── heuristics.test.js     # Node yerleşik test koşucusuyla birim testler
```

## Kurulum (geliştirici modu)

1. Bu depoyu klonlayın:
   ```bash
   git clone https://github.com/burcuyasanerr/phish-guard.git
   ```
2. Chrome'da `chrome://extensions` adresini açın.
3. Sağ üstten **Geliştirici modu**nu açın.
4. **Paketlenmemiş öğe yükle** → `phish-guard` klasörünü seçin.

## Testler

Node.js 18+ gerekir:

```bash
npm test
```

## Yol haritası

- [ ] Eklenti simgeleri (16/32/48/128 px)
- [ ] Google Safe Browsing API entegrasyonu
- [ ] PhishTank / URLhaus / OpenPhish listelerinin periyodik indirilmesi
- [ ] Benzer alan adı (typosquatting) tespiti – Levenshtein mesafesi ile
- [ ] Alan adı yaşı (WHOIS) kontrolü
- [ ] Sayfa görsel benzerliği / makine öğrenmesi tabanlı sınıflandırma
- [ ] Kullanıcının şüpheli site bildirebilmesi
- [ ] Çoklu dil desteği (`_locales`)
- [ ] Chrome Web Store yayını
