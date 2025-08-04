# Veritabanı Yönetimi

Bu klasörde veritabanı yönetimi için gerekli scriptler bulunmaktadır.

## Dosyalar

- `instance/pebdeq.db` - Ana veritabanı
- `instance/pebdeq_backup.db` - Backup veritabanı (restore noktası)
- `restore_database.py` - Veritabanını backup'tan geri yükler
- `create_backup.py` - Yeni backup oluşturur
- `reset_db.py` - Veritabanını sıfırlar ve yeniden oluşturur

## Kullanım

### 1. Veritabanını Backup'tan Geri Yükle
```bash
python restore_database.py
```

### 2. Yeni Backup Oluştur
```bash
python create_backup.py
```

### 3. Veritabanını Tamamen Sıfırla
```bash
python reset_db.py
```

## Backup Sistemi

- **Ana veritabanı**: `instance/pebdeq.db`
- **Restore noktası**: `instance/pebdeq_backup.db`
- **Eski backup'lar**: `instance/pebdeq_backup_YYYYMMDD_HHMMSS.db`

## Önemli Notlar

1. **Restore işlemi** mevcut veritabanını tamamen siler ve backup'tan geri yükler
2. **Backup oluşturma** mevcut durumu backup olarak kaydeder
3. **Reset işlemi** veritabanını sıfırlar ve örnek verilerle doldurur

## Güvenlik

- Backup dosyaları otomatik olarak tarihli kopyalar halinde saklanır
- Restore işlemi geri alınamaz, dikkatli kullanın
- Önemli değişiklikler öncesi mutlaka backup alın 