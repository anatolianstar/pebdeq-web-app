#!/usr/bin/env python3
import sys
sys.path.append('.')
from test_all_project_files import AllProjectCodeQualityTest
import json

def test_backup():
    print("=== BACKUP TEST ===")
    
    tester = AllProjectCodeQualityTest()
    files_info = tester.scan_project_files()
    
    # 3 Python dosyası seç
    python_files = files_info.get('python', [])[:3]
    tester.selected_files = python_files
    
    print(f"Selected files count: {len(tester.selected_files)}")
    print("Selected files:")
    for i, f in enumerate(tester.selected_files):
        print(f"  {i+1}. {f.get('relative_path', 'no_path')} [{f.get('category', 'no_cat')}]")
    
    print("\n=== BACKUP PROCESS ===")
    backup_dir = tester.create_backup()
    
    # Manifest'i oku
    manifest_file = backup_dir / 'backup_manifest.json'
    with open(manifest_file, 'r', encoding='utf-8') as file:
        manifest = json.load(file)
    
    print("\n=== MANIFEST RESULTS ===")
    print(f"Total files selected: {len(tester.selected_files)}")
    print(f"Total files in manifest: {manifest.get('total_files', 0)}")
    print(f"Actually backed up: {len(manifest.get('backed_up_files', []))}")
    
    print("\nBacked up files:")
    for f in manifest.get('backed_up_files', []):
        print(f"  - {f}")
    
    # SORUN VAR MI KONTROL ET
    if len(manifest.get('backed_up_files', [])) != len(tester.selected_files):
        print("\n❌ SORUN VAR!")
        print(f"Seçilen: {len(tester.selected_files)}")
        print(f"Backup alınan: {len(manifest.get('backed_up_files', []))}")
    else:
        print("\n✅ BACKUP DOGRU!")

if __name__ == "__main__":
    test_backup() 