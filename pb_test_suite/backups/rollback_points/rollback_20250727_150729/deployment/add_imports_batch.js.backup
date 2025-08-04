const fs = require('fs');

// Her dosya için import ekleyen fonksiyon
function addImport(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // createApiUrl import'u zaten var mı?
    if (content.includes("import { createApiUrl }")) {
      console.log(`✅ ${filePath} - import already exists`);
      return;
    }
    
    // createApiUrl kullanılıyor mu?
    if (!content.includes("createApiUrl(")) {
      console.log(`⚠️ ${filePath} - createApiUrl not used`);
      return;
    }
    
    // Son import'tan sonra ekle
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && lines[i].includes('from ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      // Son import'tan sonra ekle
      lines.splice(lastImportIndex + 1, 0, "import { createApiUrl } from '../utils/config';");
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`✅ ${filePath} - import added`);
    } else {
      console.log(`❌ ${filePath} - no imports found`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${filePath} - ${error.message}`);
  }
}

// Dosya listesi (ESLint hatası verenler)
const errorFiles = [
  'frontend/src/components/Header.js',
  'frontend/src/components/ThemeBuilder.js', 
  'frontend/src/pages/About.js',
  'frontend/src/pages/AdminDashboard.js',
  'frontend/src/pages/Checkout.js',
  'frontend/src/pages/Contact.js',
  'frontend/src/pages/EmailManagement.js',
  'frontend/src/pages/GeneralSettings.js',
  'frontend/src/pages/Login.js',
  'frontend/src/pages/Orders.js',
  'frontend/src/pages/PrivacyPolicy.js',
  'frontend/src/pages/Products.js',
  'frontend/src/pages/Register.js',
  'frontend/src/pages/ReturnPolicy.js',
  'frontend/src/pages/TermsOfService.js',
  'frontend/src/pages/UserDashboard.js',
  'frontend/src/themes/siteSettingsIntegration.js'
];

console.log('🔧 Adding missing imports...');
errorFiles.forEach(file => {
  if (fs.existsSync(file)) {
    addImport(file);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('✅ Import addition completed!'); 