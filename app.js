/* ===================================================================
   APP.JS — Thuật toán lõi & Xử lý logic (VietQR, Banks, jsQR, Camera)
   =================================================================== */

/* --- PHẦN 1: VIETQR CORE --- */

function crc16(s){
  let crc = 0xFFFF, poly = 0x1021;
  for (const ch of s){
    const b = ch.charCodeAt(0);
    for (let i = 0; i < 8; i++){
      const bit = ((b >> (7 - i)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc = (crc << 1) & 0xFFFF;
      if (c15 !== bit) crc ^= poly;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(tag, val){
  return tag + String(val.length).padStart(2, '0') + val;
}

function strip(s){
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^\x20-\x7E]/g, '');
}

function parseTLV(text){
  const r = {}; let i = 0;
  while (i <= text.length - 4){
    const tag = text.substr(i, 2);
    const len = parseInt(text.substr(i + 2, 2), 10);
    if (isNaN(len) || i + 4 + len > text.length) break;
    r[tag] = text.substr(i + 4, len);
    i += 4 + len;
  }
  return r;
}

function buildVietQR({bin, acc, holder = '', amount = '', content = '',
                      method = 'dynamic', includeHolder = false}){
  const isStatic = (method === 'static');

  const inner = tlv('00', bin) + tlv('01', acc);
  const merchant = tlv('38',
    tlv('00', 'A000000727') + tlv('01', inner) + tlv('02', 'QRIBFTTA')
  );

  const amtTLV = (amount && +amount > 0) ? tlv('54', String(+amount)) : '';
  const add = content ? tlv('08', strip(content)) : '';
  const addTLV = add ? tlv('62', add) : '6200';
  const mName = (includeHolder && holder) ? tlv('59', strip(holder)) : '';

  const init = isStatic ? tlv('01', '12') : tlv('01', '11');

  const payload = tlv('00', '01') + init + merchant + tlv('53', '704')
                + amtTLV + tlv('58', 'VN') + addTLV + mName;
  const withCrc = payload + '6304';
  return withCrc + crc16(withCrc);
}

function parseVietQR(text){
  if (!text || !text.startsWith('000201') || !text.includes('A000000727')) return null;
  const root = parseTLV(text);
  const out = {
    bankCode: '', account: '', accHolder: '',
    amount: '', content: '', isStatic: false
  };

  const maRaw = root['38'] || root['26'];
  if (maRaw){
    const ma = parseTLV(maRaw);
    if (ma['01']){
      const inner = parseTLV(ma['01']);
      out.bankCode = inner['00'] || '';
      out.account  = inner['01'] || '';
    }
  }
  if (root['54']) out.amount    = root['54'];
  if (root['59']) out.accHolder = root['59'];
  if (root['62']){
    const s = parseTLV(root['62']);
    out.content = s['08'] || s['01'] || '';
  }
  if (root['01']) out.isStatic = (root['01'] === '12');
  else            out.isStatic = false;

  return out;
}

/* --- PHẦN 2: QUẢN LÝ NGÂN HÀNG --- */
let BANKS = [];

function normalize(s){
  return (s || '').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g,'d').replace(/Đ/g,'d')
    .replace(/\s+/g,' ').trim();
}

function mapBankRecord(b){
  return {
    bin:       String(b.bin || ''),
    code:      String(b.code || ''),
    shortName: String(b.shortName || b.short_name || ''),
    fullName:  String(b.name || ''),
    swiftCode: String(b.swift_code || b.swiftCode || ''),
    logo:      String(b.logo || '')
  };
}

async function fetchBanksFromApi(){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const resp = await fetch('https://api.vietqr.io/v2/banks', { signal: ctrl.signal });
    clearTimeout(timer);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();
    if (json.code !== '00' || !Array.isArray(json.data) || !json.data.length){
      throw new Error('Dữ liệu API không hợp lệ');
    }
    return json.data.map(mapBankRecord).filter(b => b.bin);
  } catch (e){
    clearTimeout(timer);
    throw e;
  }
}

async function fetchBanksFromLocalFile(){
  const resp = await fetch('./banks.json', { cache: 'no-cache' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const json = await resp.json();
  if (json.code !== '00' || !Array.isArray(json.data) || !json.data.length){
    throw new Error('banks.json không hợp lệ');
  }
  return json.data.map(mapBankRecord).filter(b => b.bin);
}

function saveBanksCache(banks){
  try {
    localStorage.setItem('qrox_banks_v4',
      JSON.stringify({ data: banks, ts: Date.now() }));
  } catch {}
}

function loadBanksCache(){
  try {
    const cached = localStorage.getItem('qrox_banks_v4');
    if (!cached) return null;
    const obj = JSON.parse(cached);
    if (Array.isArray(obj.data) && obj.data.length &&
        (Date.now() - obj.ts) < 30*24*60*60*1000){
      return obj.data;
    }
  } catch {}
  return null;
}

async function loadBanks(){
  try {
    const banks = await fetchBanksFromApi();
    if (banks && banks.length){
      BANKS = banks;
      saveBanksCache(BANKS);
      return;
    }
  } catch {}

  try {
    const banks = await fetchBanksFromLocalFile();
    if (banks && banks.length){
      BANKS = banks;
      saveBanksCache(BANKS);
      return;
    }
  } catch {}

  const cached = loadBanksCache();
  if (cached){
    BANKS = cached;
    return;
  }
  BANKS = [];
}

function getBankByBin(bin){
  return BANKS.find(b => b.bin === bin) || null;
}

/* --- PHẦN 3: XỬ LÝ ĐỌC ẢNH TĨNH VỚI jsQR --- */
async function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

async function loadImgElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

async function decodeImageFile(file, onSuccess, onError) {
  if (!file) return;
  try {
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImgElement(dataUrl);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      onSuccess(code.data);
    } else {
      if (typeof onError === 'function') onError('Không tìm thấy mã QR hợp lệ trong ảnh.');
    }
  } catch (error) {
    console.error('Lỗi xử lý ảnh:', error);
    if (typeof onError === 'function') onError('Có lỗi xảy ra khi đọc tệp ảnh.');
  }
}
