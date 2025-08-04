#!/usr/bin/env python3
import sys
sys.path.append('.')
from test_all_project_files import AllProjectCodeQualityTest
import json

def test_manual_selection():
    print("=== MANUEL SEÇİM SİMÜLASYONU ===")
    
    tester = AllProjectCodeQualityTest()
    files_info = tester.scan_project_files()
    
    # Tüm dosyaları listele (gerçek program gibi)
    all_files_list = []
    for file_type in ['python', 'javascript', 'css', 'other']:
        if file_type in files_info:
            for file_info in files_info[file_type]:
                all_files_list.append(file_info)
    
    print(f"Toplam dosya sayısı: {len(all_files_list)}")
    
    # Kullanıcının manuel seçimi simüle et: 1,5,10,15,20
    manual_indices = [1, 5, 10, 15, 20]
    manual_selection = [all_files_list[i-1] for i in manual_indices if i <= len(all_files_list)]
    tester.selected_files = manual_selection
    
    print(f"\nManuel seçim: {manual_indices}")
    print(f"Seçilen dosya sayısı: {len(tester.selected_files)}")
    print("Seçilen dosyalar:")
    for i, f in enumerate(tester.selected_files):
        path = str(f.get('relative_path', 'no_path'))
        category = f.get('category', 'no_cat')
        print(f"  {i+1}. {path} [{category}]")
    
    # Backup al
    print(f"\n=== BACKUP ALIYOR ===")
    backup_dir = tester.create_backup()
    
    # Sonuçları kontrol et
    manifest_file = backup_dir / 'backup_manifest.json'
    with open(manifest_file, 'r', encoding='utf-8') as file:
        manifest = json.load(file)
    
    print(f"\n=== SONUÇ ===")
    print(f"MANUEL SEÇİM: {len(manual_selection)} dosya")
    print(f"BACKUP ALINAN: {len(manifest.get('backed_up_files', []))} dosya")
    
    if len(manifest.get('backed_up_files', [])) == len(manual_selection):
        print("✅ BAŞARILI: Seçilen dosyalar = Backup alınan dosyalar")
    else:
        print("❌ SORUN VAR!")
        print(f"  Seçilen: {len(manual_selection)}")
        print(f"  Backup alınan: {len(manifest.get('backed_up_files', []))}")

def test_option_0():
    print("\n=== SEÇENEK  0 (TÜM DOSYALAR) TESTİ ===")
    
    tester = AllProjectCodeQualityTest()
    files_info = tester.scan_project_files()
    
    # Seçenek 0: Tüm dosyalar
    all_files_list = []
    for file_type in ['python', 'javascript', 'css', 'other']:
        if file_type in files_info:
            for file_info in files_info[file_type]:
                all_files_list.append(file_info)
    
    tester.selected_files = all_files_list
    
    print(f"Tüm dosya sayısı: {len(all_files_list)}")
    print(f"Seçilen dosya sayısı: {len(tester.selected_files)}")
    
    # Bu backup almayacağız çünkü çok büyük olabilir
    print("(Backup test edilmiyor - çok fazla dosya)")

if __name__ == "__main__":
    test_manual_selection()
    test_option_0() 