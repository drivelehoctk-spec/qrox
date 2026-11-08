const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'sw.js');

let sw = fs.readFileSync(SW_PATH, 'utf8');
const coreMatch = sw.match(/const\s+CORE\s*=\s*\[([\s\S]*?)\];/);

if (!coreMatch) {
  console.error('Không tìm thấy CORE trong sw.js');
  process.exit(1);
}

const fileList = [...coreMatch[1].matchAll(/['"]([^'"]+)['"]/g)]
  .map((m) => m[1])
  .filter((p) => p !== './')
  .map((p) => p.replace(/^\.\//, ''))
  .filter(Boolean);

const h = crypto.createHash('sha256');
for (const f of fileList) {
  const full = path.join(ROOT, f);
  if (fs.existsSync(full)) {
    h.update(f + '\0');
    h.update(fs.readFileSync(full));
    h.update('\0');
  }
}

const hash = h.digest('hex').slice(0, 12);
const cache = `qrox-v${hash}`;

const before = sw;
sw = sw.replace(/const\s+CACHE\s*=\s*['"][^'"]+['"]\s*;/, `const CACHE = '${cache}';`);

if (sw !== before) {
  fs.writeFileSync(SW_PATH, sw);
  console.log('Đã cập nhật sw.js lên:', cache);
} else {
  console.log('Không có gì thay đổi.');
}
