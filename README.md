# Mộc Tại Coffee — ReactJS + Node.js

Source website Mộc Tại Coffee đã chuyển từ HTML/CSS/JavaScript thuần sang ReactJS và backend Node.js/Express. Giữ lại ảnh, phong cách kem–olive, bố cục responsive và các tương tác của bản cũ.

## Công nghệ

- Frontend: React 19, Vite 8, CSS thuần; sử dụng component, hooks và state.
- Backend local/Node hosting: Node.js + Express 5, REST API.
- Dữ liệu: JSON mẫu, chỉ đọc, trong backend/src/data. Chưa có database hoặc màn hình quản trị.
- Giá và kích cỡ trong bản này là minh họa. Thông tin địa chỉ/giờ mở cửa cần bổ sung.

## Yêu cầu

Node.js 22.12+ (khuyến nghị Node.js 24 LTS) và npm. Không cần cài database.

## Chạy trên máy — Windows, macOS, Linux

Giải nén, mở thư mục chứa package.json bằng VS Code, rồi chạy:

```bash
npm ci
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:3001
- Health check: http://127.0.0.1:3001/api/health
- Vite chuyển tiếp /api sang backend, nên frontend gọi /api cùng origin và không cần bật CORS rộng.
- Nhấn Ctrl+C để dừng cả hai.
- Frontend tự cập nhật khi sửa component/CSS. Khi sửa backend hoặc JSON mẫu, dừng và chạy lại npm run dev.

Không mở trực tiếp frontend/index.html bằng Live Server; bản React cần chạy qua Vite hoặc backend sau khi build.

### Chạy hai terminal riêng (backend tự khởi động lại)

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Backend dùng Node watch mode. Nếu watch không được hệ điều hành hỗ trợ, dùng npm start và tự khởi động lại sau khi sửa.

### Cấu hình tùy chọn

Mặc định chạy được mà không cần tạo .env.

- backend/.env.example: sao chép thành backend/.env nếu chạy backend riêng; PORT, HOST. Các lệnh backend tự đọc file này.
- frontend/.env.example: cấu hình API_PROXY_TARGET cho backend khác cổng khi chạy frontend riêng. Khởi động lại Vite sau khi sửa .env.
- Với npm run dev ở root: có thể đặt API_PORT và PORT qua biến môi trường. Ví dụ PowerShell: `$env:API_PORT="3002"; $env:PORT="5174"; npm run dev`.
- VITE_API_BASE_URL chỉ cần khi triển khai frontend và API khác origin; cấu hình CORS giới hạn đúng frontend tại dịch vụ API. Source hiện tại ưu tiên triển khai cùng origin.

## Build và chạy production bằng Node.js

```bash
npm run build
npm start
```

Mở http://127.0.0.1:3001. Express phục vụ cả React từ frontend/dist và /api.
Để phục vụ bên ngoài máy, đặt HOST=0.0.0.0 tại môi trường deploy.

Các thư mục dist là đầu ra build, không sửa trực tiếp. Source chính nằm trong frontend/src và backend/src.

## Cấu trúc

```text
moc-tai-coffee/
├── frontend/
│   ├── public/assets/          Ảnh quán và đồ uống
│   ├── src/components/        Header, Hero, Story, Menu, Gallery, Modal, Footer
│   ├── src/hooks/             Tải API, animation, reduced motion
│   ├── src/services/api.js    API client và xử lý lỗi
│   ├── src/App.jsx
│   ├── src/main.jsx
│   └── src/styles.css
├── backend/
│   ├── src/data/              Catalog và thông tin quán dạng JSON
│   ├── src/repositories/      Đọc dữ liệu; điểm thay thế bằng database
│   ├── src/services/          Lọc/tìm món, phân trang, tính giá, kiểm tra dữ liệu
│   ├── src/http/api.js        HTTP API dùng chung
│   ├── src/app.js             Express adapter và phục vụ React production
│   ├── src/server.js          Node server
│   └── test/                  Kiểm tra nghiệp vụ và HTTP
├── worker/                    Adapter riêng cho bản xem trên ChatGPT Sites
├── scripts/                   Dev, build, kiểm tra production
├── package.json
├── package-lock.json
└── README.md
```

## Luồng dữ liệu

React gọi API client → /api → HTTP router → service nghiệp vụ → repository → JSON mẫu.
Thực đơn, danh mục, slider, gallery và thông tin quán được tải từ backend. Nội dung giới thiệu tĩnh nằm trong component React.
Hộp thoại chi tiết tải món theo ID rồi gọi API tính giá khi đổi kích cỡ hoặc số lượng. Frontend không quyết định đơn giá cuối cùng.
Các request cũ bị hủy khi đổi bộ lọc hoặc đóng hộp thoại để tránh dữ liệu trả về sai thứ tự.

## API

| Method | Đường dẫn | Chức năng |
|---|---|---|
| GET | /api/health | Kiểm tra backend |
| GET | /api/home | Thông tin trang chủ, danh mục, slider và gallery |
| GET | /api/store | Thông tin quán |
| GET | /api/categories | Danh mục và số món đang có |
| GET | /api/gallery | Ảnh không gian |
| GET | /api/menu | Danh sách món, lọc, tìm kiếm và phân trang |
| GET | /api/menu/:id | Chi tiết món |
| POST | /api/quotes | Tính giá tham khảo từ danh mục phía server |

Ví dụ: `/api/menu?category=coffee&q=ca%20phe&page=1&limit=3`.

- category: all, coffee, tea, cake.
- q: tối đa 100 ký tự; tìm không phân biệt hoa/thường và dấu tiếng Việt.
- page: số nguyên 1–10000; limit: số nguyên 1–24.
- GET danh sách trả `{data: [...], meta: {total, page, limit, pageCount}}`.
- API khác trả `{data: ...}`; lỗi trả `{error: {code, message}}`.

### Tính giá tham khảo

Gửi POST /api/quotes với Content-Type: application/json:

```json
{
  "items": [
    {"productId": "ca-phe-sua-moc-tai", "variantId": "large", "quantity": 2}
  ]
}
```

Backend kiểm tra món tồn tại, kích cỡ và số lượng 1–20. Đơn giá lấy từ catalog; giá/total tự gửi từ client không được dùng. Các dòng trùng món và kích cỡ được gộp, tổng số lượng của mỗi nhóm tối đa 20. Payload tối đa 16 KB, tối đa 20 dòng.
Ví dụ trên trả tổng 110000 VND theo dữ liệu minh họa hiện tại.

API này không tạo đơn, không lưu giỏ hàng, không xử lý thanh toán, không tính vận chuyển/thuế. Chưa có API ghi dữ liệu nên chưa có hệ thống tài khoản, phân quyền hoặc CRUD quản trị.

## Sửa dữ liệu

- backend/src/data/store.json: tên quán, địa chỉ, giờ mở cửa, mapUrl, slider và gallery. Điền thông tin thật rồi đặt isDemo=false và điều chỉnh notice.
- backend/src/data/catalog.json: danh mục, món, giá VND dạng số nguyên, ảnh, mô tả, available và variants. Khi sửa giá/kích cỡ, cập nhật các test sử dụng món mẫu.
- Ảnh: frontend/public/assets; dùng đường dẫn /assets/ten-anh.jpg trong JSON.
- Khi cần database, thay repository và giữ hợp đồng API; không cần viết lại các component React.

## Kiểm tra

```bash
npm test
npm run build
npm run test:production
```

npm test kiểm tra quy tắc giá, lọc/tìm kiếm, phân trang, validate JSON, số lượng, kích cỡ, lỗi HTTP và tính nhất quán giữa Node và adapter xem trước.
npm run test:production yêu cầu đã build; kiểm tra Express phục vụ HTML/JS/CSS/ảnh và API giống bản đóng gói.

Build và kiểm tra tự động đã chạy thành công trong phiên chuyển đổi. Kiểm tra giao diện bằng trình duyệt chưa thực hiện được vì môi trường xem thử gặp lỗi hệ thống.

## Bản xem trên ChatGPT Sites và Node.js

ChatGPT Sites chạy Fetch/Worker, không chạy một tiến trình Node.js/Express lâu dài. Vì vậy worker/index.js dùng chung HTTP router và service nghiệp vụ với Express, đồng thời phục vụ React đã build. Đây là adapter triển khai riêng; backend bạn tải về và chạy qua npm start là Node.js/Express thật.

Build tạo dist/server/index.js để xuất bản bản xem. Ảnh, CSS và JS được đóng gói trong Worker để bản xem không phụ thuộc ổ đĩa local. Bản Node sử dụng frontend/dist theo cách thông thường.

## GitHub

Source chưa được đẩy vào GitHub và chưa có đồng bộ tự động. Sau khi tạo một repo, có thể quản lý bộ source này bằng Git như dự án React/Node thông thường. Không commit node_modules, dist hoặc file .env.

## Giới hạn còn lại

- Nút đăng nhập vẫn là thông báo chuẩn bị tính năng, chưa có xác thực người dùng.
- Chưa có database, quản trị thực đơn, upload ảnh, đặt hàng hay thanh toán.
- Địa chỉ, giờ mở cửa, ảnh và giá đang là nội dung mẫu.
- Google Fonts tải qua Internet; ảnh đã có sẵn trong source. Font hệ thống được dùng khi không tải được font.
