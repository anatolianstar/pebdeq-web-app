const fs = require('fs');
const path = require('path');

// Frontend src klasörünü tarayacağız
const srcDir = path.join(__dirname, 'frontend', 'src');

// Değiştirilecek pattern'ler
const patterns = [
  {
    // Tek tırnak içinde localhost:5005 API çağrıları
    find: /'http:\/\/localhost:5005\/([^']+)'/g,
    replace: "createApiUrl('$1')"
  },
  {
    // Çift tırnak içinde localhost:5005 API çağrıları  
    find: /"http:\/\/localhost:5005\/([^"]+)"/g,
    replace: "createApiUrl('$1')"
  },
  {
    // Template literal içinde localhost:5005
    find: /`http:\/\/localhost:5005\/([^`]+)`/g,
    replace: "createApiUrl('$1')"
  },
  {
    // Değişken ile birleştirilen haller
    find: /`\$\{API_BASE_URL\}\/([^`}]+)`/g,
    replace: "createApiUrl('$1')"
  }
];

// createApiUrl import'u yoksa ekleyen fonksiyon
function addCreateApiUrlImport(content, filePath) {
  // Zaten var mı kontrol et
  if (content.includes("createApiUrl")) {
    return content;
  }
  
  // Find existing import statements
  const importRegex = /import.*from\s+['"`][^'"`]+['"`];?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    // Son import'tan sonra createApiUrl import'unu ekle
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const afterLastImport = lastImportIndex + lastImport.length;
    
    const importStatement = "\nimport { createApiUrl } from '../utils/config';";
    content = content.slice(0, afterLastImport) + importStatement + content.slice(afterLastImport);
  }
  
  return content;
}

// Dosyayı işleyen fonksiyon
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Localhost:5005 pattern'lerini değiştir
    patterns.forEach(pattern => {
      if (pattern.find.test(content)) {
        content = content.replace(pattern.find, pattern.replace);
        modified = true;
      }
    });
    
    // Eğer değişiklik yaptıysak import ekle
    if (modified) {
      content = addCreateApiUrlImport(content, filePath);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Klasörü recursive olarak tarayan fonksiyon
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

// Ana işlev
function updateApiUrlsMain() {
  console.log('🔧 Starting API URL migration...');
  console.log(`📁 Scanning directory: ${srcDir}`);
  
  if (!fs.existsSync(srcDir)) {
    console.error(`❌ Source directory not found: ${srcDir}`);
    process.exit(1);
  }
  
  walkDirectory(srcDir);
  console.log('✅ API URL migration completed!');
}

// Script'i çalıştır
updateApiUrlsMain(); 