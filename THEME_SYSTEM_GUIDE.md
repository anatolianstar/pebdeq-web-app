# 🎨 Tema Sistemi Kullanım Kılavuzu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum](#kurulum)
3. [Modüler CSS Yapısı](#modüler-css-yapısı)
4. [Tema Oluşturucu Kullanımı](#tema-oluşturucu-kullanımı)
5. [Tema Yönetimi](#tema-yönetimi)
6. [API Endpoint'leri](#api-endpoints)
7. [Örnekler](#örnekler)
8. [Sorun Giderme](#sorun-giderme)

---

## 🔍 Genel Bakış

Bu tema sistemi, PEBDEQ e-ticaret platformu için dinamik ve özelleştirilebilir tema oluşturma ve yönetimi sağlar. Sistem şu özellikleri içerir:

### ✨ Özellikler
- **Modüler CSS Yapısı**: Organize edilmiş, yeniden kullanılabilir stil dosyaları
- **Tema Oluşturucu**: Görsel arayüzle tema oluşturma
- **Dinamik Tema Yükleme**: Sayfa yenilemesi olmadan tema değişimi
- **Tema İçe/Dışa Aktarma**: JSON formatında tema paylaşımı
- **Admin Panel Entegrasyonu**: Tema yönetimi için admin arayüzü
- **Tema Önizleme**: Gerçek zamanlı tema önizleme
- **Tema Sürümü**: Tema versiyonlama ve güncelleme

---

## 🚀 Kurulum

### 1. Backend Kurulumu

#### A. Gerekli Paketler
```bash
cd backend
pip install flask flask-sqlalchemy flask-cors flask-migrate
```

#### B. Veritabanı Migration
```bash
cd backend
flask db migrate -m "Add custom themes table"
flask db upgrade
```

### 2. Frontend Kurulumu

#### A. Stil Dosyaları
Yeni modüler CSS dosyaları otomatik olarak yüklenir:
- `globals.css` - Global stiller
- `variables.css` - CSS değişkenleri
- `utilities.css` - Utility sınıfları

#### B. Tema Oluşturucu
Theme Builder component'i admin paneline entegre edilmiştir.

---

## 🎨 Modüler CSS Yapısı

### 📁 Dosya Yapısı
```
frontend/src/
├── styles/
│   ├── globals.css      # Global reset ve typography
│   ├── variables.css    # CSS değişkenleri
│   └── utilities.css    # Utility sınıfları
├── components/
│   ├── ThemeBuilder.js  # Tema oluşturucu component
│   └── ThemeBuilder.css # Tema oluşturucu stilleri
└── utils/
    └── themeTemplate.js # Tema template ve utilities
```

### 🎯 CSS Değişkenleri

#### Renkler
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-primary: #ffffff;
  --text-primary: #212529;
  /* ... daha fazlası */
}
```

#### Tipografi
```css
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  /* ... daha fazlası */
}
```

#### Spacing
```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  /* ... daha fazlası */
}
```

---

## 🛠️ Tema Oluşturucu Kullanımı

### 1. Tema Oluşturucuya Erişim
1. Admin paneline giriş yapın
2. **"Theme Builder"** sekmesine tıklayın
3. Tema oluşturucu arayüzü açılır

### 2. Tema Oluşturma Adımları

#### A. Temel Bilgiler
- **Tema Adı**: Temanızın adı
- **Açıklama**: Tema hakkında açıklama
- **Yazar**: Tema oluşturan kişi
- **Tip**: Light, Dark, veya Custom

#### B. Renkler
- **Birincil Renkler**: Primary, hover, active tonları
- **İkincil Renkler**: Secondary renk paleti
- **Durum Renkleri**: Success, danger, warning, info
- **Arka Plan Renkleri**: Çeşitli arka plan tonları
- **Metin Renkleri**: Farklı metin seviyeleri

#### C. Tipografi
- **Font Aileleri**: Base, heading, mono fontları
- **Font Boyutları**: H1'den H6'ya kadar boyutlar
- **Font Ağırlıkları**: Light'tan Black'e kadar
- **Satır Yükseklikleri**: Farklı line-height değerleri

#### D. Boşluk ve Şekil
- **Spacing**: XS'den XXXL'ye kadar boşluk değerleri
- **Border Radius**: Farklı kenar yuvarlaklık değerleri
- **Gölgeler**: Çeşitli gölge efektleri

#### E. Komponent Ayarları
- **Header**: Yükseklik, padding, gölge ayarları
- **Butonlar**: Padding, border radius, font ayarları
- **Kartlar**: Padding, gölge, border ayarları

### 3. Tema Önizleme
- **"Preview Theme"** butonuna tıklayın
- Tema gerçek zamanlı olarak uygulanır
- **"Stop Preview"** ile önizlemeyi durdurun

### 4. Tema Kaydetme
- Tüm ayarları tamamladıktan sonra
- **"Save Theme"** butonuna tıklayın
- Tema veritabanına kaydedilir

---

## 📊 Tema Yönetimi

### 1. Tema Listesi
```javascript
// Tüm temaları getir
GET /api/themes

// Popüler temaları getir
GET /api/themes/popular?limit=10

// Tema ara
GET /api/themes/search?q=dark&type=dark
```

### 2. Tema Operations
```javascript
// Tema detayı
GET /api/themes/1

// Tema güncelle
PUT /api/themes/1

// Tema sil
DELETE /api/themes/1

// Tema aktifleştir/deaktifleştir
POST /api/themes/1/activate
POST /api/themes/1/deactivate
```

### 3. Tema İçe/Dışa Aktarma
```javascript
// Tema dışa aktar
GET /api/themes/export/1

// Tema içe aktar
POST /api/themes/import
```

---

## 🔧 API Endpoint'leri

### Tema CRUD İşlemleri

#### Tema Oluştur
```http
POST /api/themes
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "My Custom Theme",
  "id": "my-custom-theme",
  "description": "A beautiful custom theme",
  "author": "John Doe",
  "type": "light",
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d",
    // ... diğer renkler
  },
  "typography": {
    "fontFamilyBase": "Arial, sans-serif",
    // ... diğer tipografi ayarları
  }
}
```

#### Tema Listele
```http
GET /api/themes
```

#### Tema Detay
```http
GET /api/themes/1
```

#### Tema Güncelle
```http
PUT /api/themes/1
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Updated Theme Name",
  // ... güncellenecek alanlar
}
```

#### Tema Sil
```http
DELETE /api/themes/1
Authorization: Bearer TOKEN
```

### Tema Yönetimi

#### Tema Ara
```http
GET /api/themes/search?q=dark&type=dark&author=john&page=1&per_page=10
```

#### Kullanıcının Temaları
```http
GET /api/themes/my-themes
Authorization: Bearer TOKEN
```

#### Tema Derecelendirme
```http
POST /api/themes/1/rate
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "rating": 5
}
```

---

## 💡 Örnekler

### 1. Basit Tema Oluşturma
```javascript
import { createThemeFromTemplate, generateThemeCSS } from './utils/themeTemplate';

// Basit tema oluştur
const myTheme = createThemeFromTemplate({
  name: 'Ocean Blue',
  id: 'ocean-blue',
  colors: {
    primary: '#0077be',
    secondary: '#00a8cc',
    backgroundPrimary: '#f0f8ff'
  }
});

// CSS üret
const css = generateThemeCSS(myTheme);
```

### 2. Tema İçe Aktarma
```javascript
import { importTheme } from './utils/themeTemplate';

const jsonData = `{
  "name": "Dark Mode",
  "id": "dark-mode",
  "colors": {
    "primary": "#bb86fc",
    "backgroundPrimary": "#121212",
    "textPrimary": "#ffffff"
  }
}`;

try {
  const theme = importTheme(jsonData);
  console.log('Tema içe aktarıldı:', theme);
} catch (error) {
  console.error('İçe aktarma hatası:', error);
}
```

### 3. Tema Validation
```javascript
import { validateTheme } from './utils/themeTemplate';

const errors = validateTheme(myTheme);
if (errors.length > 0) {
  console.error('Tema validation hataları:', errors);
}
```

---

## 🐛 Sorun Giderme

### 1. Tema Yüklenmeme Sorunu
```javascript
// Tema CSS'inin yüklendiğini kontrol edin
const themeStyle = document.getElementById('theme-preview');
if (!themeStyle) {
  console.error('Tema CSS yüklenemedi');
}
```

### 2. CSS Değişkenleri Çalışmıyor
```css
/* Fallback değerleri kullanın */
.my-component {
  color: var(--text-primary, #212529);
  background: var(--background-primary, #ffffff);
}
```

### 3. Tema Kaydetme Hatası
```javascript
// Token kontrolü
const token = localStorage.getItem('token');
if (!token) {
  console.error('Authentication token bulunamadı');
}

// Tema validation
const errors = validateTheme(themeData);
if (errors.length > 0) {
  console.error('Tema validation hataları:', errors);
}
```

### 4. Migration Hatası
```bash
# Backend dizininde
flask db stamp head
flask db migrate -m "Add custom themes table"
flask db upgrade
```

---

## 📚 Gelişmiş Kullanım

### 1. Özel CSS Değişkenleri
```css
/* Kendi tema değişkenlerinizi ekleyin */
:root {
  --my-custom-color: #ff6b6b;
  --my-custom-font: 'Custom Font', sans-serif;
}

[data-theme="my-theme"] {
  --primary-color: var(--my-custom-color);
  --font-family-base: var(--my-custom-font);
}
```

### 2. Dinamik Tema Değişimi
```javascript
// Tema değiştirme fonksiyonu
const changeTheme = (themeId) => {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem('selectedTheme', themeId);
};

// Sayfa yüklendiğinde tema uygulama
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    changeTheme(savedTheme);
  }
});
```

### 3. Tema Performans Optimizasyonu
```javascript
// Tema CSS'ini lazy load
const loadThemeCSS = async (themeId) => {
  const existingStyle = document.getElementById(`theme-${themeId}`);
  if (existingStyle) return;

  const css = await fetch(`/api/themes/${themeId}/css`);
  const cssText = await css.text();
  
  const style = document.createElement('style');
  style.id = `theme-${themeId}`;
  style.textContent = cssText;
  document.head.appendChild(style);
};
```

---

## 🎯 Sonuç

Bu tema sistemi sayesinde:
- **Modüler CSS yapısı** ile daha organize kod
- **Dinamik tema oluşturma** ile kullanıcı deneyimi
- **Tema yönetimi** ile admin kontrolü
- **Performans optimizasyonu** ile hızlı yükleme
- **Genişletilebilir yapı** ile gelecek geliştirmeler

Sistem tam entegre ve kullanıma hazır durumda. Herhangi bir sorunla karşılaştığınızda bu kılavuzu kontrol edin veya destek ekibiyle iletişime geçin.

---

## 📞 Destek

Herhangi bir sorunuz varsa:
- **Dokümantasyon**: Bu kılavuzu inceleyin
- **Kod İncelemesi**: `frontend/src/utils/themeTemplate.js` dosyasını kontrol edin
- **API Testleri**: `/api/themes` endpoint'lerini test edin
- **Debug Modu**: Browser console'da hata mesajlarını kontrol edin 