# QRoX Mobile

> Ứng dụng quét mã QR thanh toán và tạo mã VietQR chạy trực tiếp trên trình duyệt di động — không cần cài đặt từ Play Store.

[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://drivelehoctk-spec.github.io/qrox/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)](https://web.dev/progressive-web-apps/)

---

## 📖 Giới thiệu

**QRoX Mobile** là ứng dụng web (PWA) cho phép:

- 📷 **Quét mã QR** trực tiếp bằng camera điện thoại
- 🖼️ **Nạp ảnh QR** từ thư viện ảnh hoặc clipboard
- 💳 **Tạo mã VietQR** chuẩn EMVCo để nhận chuyển khoản
- ✏️ **Chỉnh sửa nội dung** sau khi quét — đổi số tiền, nội dung, chủ TK
- 💾 **Tải / sao chép** ảnh QR về máy hoặc vào clipboard
- 🌐 **Chạy offline** sau lần mở đầu tiên (nhờ Service Worker)
- 📱 **Cài lên màn hình chính** như app native

Được thiết kế tối ưu cho **Samsung + Microsoft Edge** nhưng hoạt động tốt trên Chrome Android, iOS Safari (một số giới hạn).

---

## ✨ Tính năng chi tiết

### 1. Ba nguồn nạp QR

| Nguồn | Cách dùng | Ghi chú |
|---|---|---|
| **Camera** | Bấm **📷 Camera** → chĩa vào QR | Dùng camera sau, tự lấy nét |
| **Thư viện** | Bấm **🖼 Thư viện** → chọn ảnh | Decode ảnh tĩnh bằng BarcodeDetector |
| **Clipboard** | Bấm **📋 Clipboard** → dán ảnh đã sao chép | Hỗ trợ Chromium 98+ |

### 2. Form thông tin thanh toán

| Trường | Đặc điểm |
|---|---|
| **Mã ngân hàng / BIN** | Autocomplete theo BIN / mã CK / tên viết tắt / tên đầy đủ / SWIFT |
| **Số tài khoản** | Cho phép cả **chữ + số** (do một số ngân hàng có chữ trong STK) |
| **Chủ tài khoản** | Tự động viết HOA |
| **Số tiền (VND)** | Tự động format dấu chấm phân cách |
| **Nội dung CK** | Đếm ký tự + đổi màu cảnh báo gần giới hạn 99 |

### 3. Hai chế độ QR

| Chế độ | Tag 01 | Khách quét |
|---|---|---|
| **Động** (mặc định) | `11` | Thấy số tiền + nội dung, **có thể sửa** |
| **Tĩnh** | `12` | Thấy số tiền + nội dung, **không sửa được** |

> 💡 **Chú ý:** Số tiền và nội dung vẫn được nhúng vào cả 2 chế độ. Khác biệt duy nhất là tag 01 — app ngân hàng đọc tag này để quyết định cho phép sửa hay không.

### 4. Xuất QR — 3 cách

- **Tự động:** sau khi tạo, QR tự copy vào clipboard
- **Nút bấm:** **📋 Sao chép** / **💾 Tải về**
- **Nhấn giữ** ảnh QR → bottom sheet menu (mobile) hoặc chuột phải (desktop)

### 5. Panel "QR đã đọc" — thông tin đầy đủ

Khi decode QR thành công, panel xanh hiện:
- Ngân hàng (BIN + tên viết tắt + mã CK + SWIFT)
- Số tài khoản
- Chủ tài khoản
- Số tiền (format VND)
- Nội dung chuyển khoản
- Chế độ: **TĨNH** hoặc **ĐỘNG**

---

## 🚀 Cài đặt

### Yêu cầu

- Điện thoại Android (Samsung, Xiaomi, Oppo...) hoặc iOS
- Trình duyệt **Microsoft Edge** (khuyên dùng) hoặc Chrome
- Điện thoại có camera (để quét QR)

### Cài đặt dưới dạng app

1. **Mở link:** https://drivelehoctk-spec.github.io/qrox/
2. **Cấp quyền** khi được hỏi:
   - Camera → **Cho phép** (để quét QR)
   - Clipboard → **Cho phép** (để dán ảnh)
3. **Thêm vào màn hình chính:**
   - Trên **Edge:** bấm **⋯** (góc dưới phải) → **Thêm vào điện thoại** → **Cài đặt**
   - Trên **Chrome:** bấm **⋮** → **Thêm vào Màn hình chính** → **Cài đặt**
4. **Icon QRoX** xuất hiện ngoài home screen → mở dùng như app thật

### Sử dụng offline

Sau lần mở đầu tiên, app sẽ cache toàn bộ:

- HTML, CSS, JavaScript
- Thư viện qrcode.min.js, html5-qrcode.min.js
- Danh sách ngân hàng (banks.json)

→ Lần sau mở **không cần mạng** vẫn chạy bình thường (trừ khi cần cập nhật danh sách ngân hàng mới).

---

## 📱 Hướng dẫn sử dụng

### Kịch bản 1 — Nhận tiền, tạo QR từ đầu
QRoX Mobile
