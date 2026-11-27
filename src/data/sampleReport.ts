import type { SavedReport } from '../types/report';

export const SAMPLE_REPORT: SavedReport = {
  id: 'sample-11-2026-both-cosmetics',
  title: '11/2026 · Hàn & Trung · Mỹ phẩm (Mẫu tham khảo)',
  monthYear: '11/2026',
  market: 'Both',
  industry: 'cosmetics',
  industryLabel: 'Mỹ phẩm (Cosmetics)',
  referenceUrls: [],
  userPrompt:
    'Trend Report tháng 11/2026, thị trường Hàn Quốc & Trung Quốc (Both), ngành Mỹ phẩm (cosmetics).',
  createdAt: '2026-11-20T09:30:00.000Z',
  isSample: true,
  searchQueries: [
    'Korea beauty poster design trends editorial minimalism 2026',
    'Xiaohongshu cosmetics campaign visual trends neo-oriental 2026',
  ],
  sources: [
    {
      title: 'Behance — Seoul Graphic & Packaging Design Showcase',
      uri: 'https://www.behance.net/search/projects?search=seoul+cosmetics+poster',
      domain: 'behance.net',
      fromGrounding: true,
    },
    {
      title: 'Pinterest — Korean Editorial Beauty Layout References',
      uri: 'https://www.pinterest.com/search/pins/?q=korean+cosmetics+poster+design',
      domain: 'pinterest.com',
      fromGrounding: true,
    },
    {
      title: 'Xiaohongshu — Chinese Beauty Campaign Visual Aesthetics',
      uri: 'https://www.xiaohongshu.com/explore',
      domain: 'xiaohongshu.com',
      fromGrounding: true,
    },
  ],
  markdown: `# TREND REPORT THÁNG 11/2026 — MẪU THAM KHẢO

> **Lưu ý:** Đây là báo cáo mẫu được lưu sẵn để minh họa cấu trúc hiển thị (thẻ xu hướng, bảng màu HEX tương tác, huy hiệu độ chắc chắn, nút Copy prompt và nguồn). Hãy nhấn **"Tạo Trend Report"** để chạy phân tích trực tiếp mới nhất bằng Google Search grounding.

## 1. Tóm tắt 5 dòng (dành cho họp team)
1. **Hàn Quốc** tiếp tục đẩy mạnh ngôn ngữ *Clinical Editorial* (tối giản phòng lab kết hợp chụp macro giọt serum), ưu tiên nền trắng ấm và khoảng thở lớn.
2. **Trung Quốc** nổi bật với *Porcelain Mist* (sương sứ mỏng kết hợp ánh kim lạnh) trên Xiaohongshu cho dòng mỹ phẩm skincare & nước hoa nội địa.
3. Cả hai thị trường giảm mạnh hiệu ứng 3D nhựa bóng quá tay, chuyển sang chất liệu **kính mờ (frosted glass)**, **nhôm xước** và **bóng nắng tự nhiên (caustic shadows)**.
4. Typography song ngữ (Serif thanh mảnh kết hợp Mono kỹ thuật cho thành phần/định lượng) trở thành công thức chủ đạo trên poster launch sản phẩm mới.
5. **Khuyến nghị ngay cho team tại VN:** ưu tiên test *Clinical Daylight Macro* cho digital poster Q4 và tránh bố cục sticker Y2K quá tải thông tin.

## 2. Hàn Quốc: tối đa 5 xu hướng

### 1. Clinical Daylight Macro (Tối giản Phòng Lab Ánh Sáng Tự Nhiên)
- **Mô tả ngôn ngữ thị giác:**
  - **Bảng màu:** Trắng sứ ấm #F7F5F0, xám đá lạnh #D8D6D0, xanh y sinh #2E4A62, đen mực #181818, điểm nhấn bạc #C4C9CE.
  - **Typography:** Neo-Grotesque khoảng chữ rộng kết hợp Monospace cho bảng thành phần (ví dụ \`pH 5.5 / 50ml\`).
  - **Bố cục:** Swiss grid 4–6 cột rõ ràng, tỷ lệ khoảng trắng 45–55%, chai sản phẩm đặt lệch tâm tạo đối trọng với khối text.
  - **Chất liệu/Hiệu ứng:** Bóng đổ cửa sổ gắt (hard sunlight shadow), bề mặt kính mờ, giọt tinh chất trong suốt độ sắc nét cao.
  - **Mood:** Sạch sẽ, khoa học, tin cậy, không phô trương.
- **Ngành áp dụng tốt:** Mỹ phẩm (skincare, dermocosmetics), F&B cao cấp, Tech.
- **Ứng dụng cho poster quảng cáo:** Dùng 1 ảnh hero macro kết cấu kem/serum chiếm 60% khung hình, đặt thông số hoạt chất ở góc dưới theo lưới bảng dữ liệu mảnh 1px.
- **Độ chắc chắn + nguồn:** [Cao] Quan sát nhất quán trên [Behance Seoul Beauty](https://www.behance.net/search/projects?search=seoul+cosmetics+poster) và [Pinterest KR Editorial](https://www.pinterest.com/search/pins/?q=korean+cosmetics+poster+design).
- **Vòng đời dự kiến:** Đang lên

### 2. Botanical Glass & Soft Dew (Kính Thực Vật & Sương Mờ)
- **Mô tả ngôn ngữ thị giác:**
  - **Bảng màu:** Xanh rêu nhạt #CAD5C7, kem ngà #F4EFE6, xanh lá đậm #2F4838, nâu vỏ cây #6D5B4B.
  - **Typography:** Editorial Serif mảnh có độ tương phản nét cao (high-contrast serif) cho tiêu đề ngắn 2–3 từ.
  - **Bố cục:** Khung ảnh trung tâm bo góc rất nhẹ hoặc vuông sắc cạnh, viền chữ chạy sát mép poster.
  - **Chất liệu/Hiệu ứng:** Kính gợn sóng (fluted glass) che nhẹ một phần lá/hoa, ánh sáng khuếch tán mềm.
  - **Mood:** Thư thái, hữu cơ, tinh tế.
- **Ngành áp dụng tốt:** Mỹ phẩm thiên nhiên, nước hoa, trà/F&B.
- **Ứng dụng cho poster quảng cáo:** Chụp sản phẩm đặt sau tấm kính gân dọc giúp tạo chiều sâu mà vẫn giữ diện tích sạch đặt headline ở phía trên.
- **Độ chắc chắn + nguồn:** [Trung bình] Quan sát từ nhiều portfolio studio độc lập tại Seoul trên [Behance](https://www.behance.net/search/projects?search=seoul+cosmetics+poster).
- **Vòng đời dự kiến:** Mới nổi

## 3. Trung Quốc: tối đa 5 xu hướng

### 1. Porcelain Mist & Cold Metal (Sương Sứ & Kim Loại Lạnh)
- **Mô tả ngôn ngữ thị giác:**
  - **Bảng màu:** Trắng men sứ #F2F3F5, xanh lam khói #7B90A6, bạc titan #BFC5CC, đỏ son trầm #8E2C2C, than chì #232629.
  - **Typography:** Chữ không chân thanh mảnh kết hợp nét serif uốn nhẹ mang hơi thở Á Đông đương đại (Neo-Oriental minimal).
  - **Bố cục:** Bố cục dọc 3:4 chuẩn Xiaohongshu, đối xứng trung tâm với khoảng nền chuyển sắc sương nhẹ.
  - **Chất liệu/Hiệu ứng:** Men sứ mờ, giọt thủy ngân/kim loại lỏng tiết chế, sương mù mịn ở hậu cảnh.
  - **Mood:** Thanh lãnh, cao cấp, đương đại.
- **Ngành áp dụng tốt:** Mỹ phẩm makeup, nước hoa, thời trang, phụ kiện.
- **Ứng dụng cho poster quảng cáo:** Tạo key visual đặt thỏi son hoặc lọ kem trên khối đá/sứ lạnh, dùng một điểm nhấn đỏ trầm #8E2C2C cho CTA hoặc tên bộ sưu tập.
- **Độ chắc chắn + nguồn:** [Cao] Quan sát dày đặc trên [Xiaohongshu Explore](https://www.xiaohongshu.com/explore) ở nhóm thương hiệu C-beauty cao cấp.
- **Vòng đời dự kiến:** Đang lên

### 2. Silk Shadow & Ink Wash Minimal (Bóng Lụa & Thủy Mặc Tối Giản)
- **Mô tả ngôn ngữ thị giác:**
  - **Bảng màu:** Giấy dó sáng #F5F1E8, mực loang #3A3936, vàng đồng mờ #B89B6A, be ấm #DFD6C7.
  - **Typography:** Tiêu đề lớn đặt dọc hoặc chia nhịp bất đối xứng, chú thích nhỏ căn lề phải.
  - **Bố cục:** Không gian âm (negative space) rộng trên 50%, ánh sáng rọi chéo qua vải lụa mỏng.
  - **Chất liệu/Hiệu ứng:** Nếp gấp lụa mềm, bóng đổ tự nhiên, hạt film grain nhẹ 5–8%.
  - **Mood:** Thơ mộng, trầm tĩnh, sang trọng.
- **Ngành áp dụng tốt:** Mỹ phẩm chống lão hóa, quà tặng Tết/lễ hội, trà cao cấp.
- **Ứng dụng cho poster quảng cáo:** Phù hợp cho campaign mùa lễ cuối năm cần cảm giác cao cấp mà không rơi vào khuôn mẫu đỏ-vàng truyền thống.
- **Độ chắc chắn + nguồn:** [Thấp] Suy luận từ một số bộ ảnh lookbook gần đây trên [Xiaohongshu](https://www.xiaohongshu.com/explore), cần theo dõi thêm độ phủ trong 30 ngày tới.
- **Vòng đời dự kiến:** Mới nổi

## 4. Điểm giao thoa Hàn-Trung và điểm khác biệt

| Tiêu chí | Thị trường Hàn Quốc | Thị trường Trung Quốc | Điểm giao thoa |
| --- | --- | --- | --- |
| **Ánh sáng & Chất liệu** | Nắng trực tiếp sắc nét, kính mờ, bề mặt phòng lab | Sương mịn, men sứ, lụa và ánh kim lạnh | Cả hai rời xa 3D nhựa bóng, ưu tiên vật liệu thực & xúc giác |
| **Bảng màu chủ đạo** | Trung tính ấm (#F7F5F0, #D8D6D0) + 1 màu y sinh | Trung tính lạnh (#F2F3F5, #7B90A6) + điểm nhấn son trầm (#8E2C2C) | Tiết chế tối đa 3–4 màu trên một poster |
| **Typography** | Lưới Swiss grid, Mono kỹ thuật, khoảng trắng rộng | Nhịp điệu biên tập dọc, kết hợp tinh tế nét Á Đông tối giản | Hạn chế hiệu ứng chữ nổi/gradient, ưu tiên độ tương phản kích thước |

## 5. Khuyến nghị cho team: 3 style nên thử ngay, 2 style nên tránh, và lý do

### 3 style nên thử ngay
1. **Clinical Daylight Macro:** Dễ sản xuất tại studio Việt Nam (chỉ cần ánh sáng cứng + đạo cụ kính/đá), tăng độ tin cậy tức thì cho mỹ phẩm skincare.
2. **Porcelain Mist & Cold Metal:** Rất nổi bật trên feed dọc (Instagram/TikTok/Facebook 4:5), tạo cảm giác giá trị cao cho sản phẩm tầm trung – cao cấp.
3. **Typography Data-Grid tối giản:** Dùng bảng thông số hoạt chất tinh gọn giúp poster quảng cáo bán hàng vẫn giữ thẩm mỹ editorial.

### 2 style nên tránh
1. **Acid Y2K / Chrome Sticker quá tải:** Đã bão hòa mạnh từ năm trước, làm giảm độ tin cậy thương hiệu với nhóm khách hàng mỹ phẩm trưởng thành.
2. **3D Pastel Bóng Nhựa (Glossy Jelly 3D):** Dễ bị lẫn với ảnh AI đại trà, thiếu cảm giác chân thực về kết cấu sản phẩm.

## 6. Brief mẫu: Poster ra mắt Serum Phục Hồi
- **Mục tiêu:** Tăng nhận diện sản phẩm mới và truyền tải cảm giác an toàn, khoa học, thẩm thấu nhanh trên kênh social & POSM.
- **Key Visual:** Ảnh chụp macro cận cảnh lọ serum thủy tinh mờ đặt trên khối đá sáng, vệt nắng chéo sắc nét chiếu qua thân chai tạo ánh khúc xạ nhẹ cùng một vệt gel trong suốt bên cạnh.
- **Bảng màu:** Nền trắng sứ ấm #F7F5F0, chữ chính đen mực #181818, màu điểm nhấn xanh y sinh #2E4A62, đường kẻ lưới #D8D6D0.
- **Font gợi ý:** Tiêu đề *Plus Jakarta Sans* (Regular/SemiBold, tracking chặt) + thông số thành phần *JetBrains Mono* (10–12pt, tabular).
- **Tone & Mood:** Tối giản, trong trẻo, giàu tính chuyên môn nhưng vẫn gần gũi.

## 7. Prompt phụ trợ: 3 prompt moodboard (Midjourney / Imagen / Firefly)

### Prompt 1 — Clinical Daylight Macro (Midjourney)
\`\`\`
Editorial skincare advertising moodboard photography, frosted glass dropper serum bottle resting on warm alabaster stone #F7F5F0, sharp diagonal morning window shadows with delicate caustic light refraction, clean macro texture of clear hydrating gel drop beside the bottle, muted slate blue accent #2E4A62, Korean minimalist studio aesthetic, Leica 50mm macro lens, crisp focus, high editorial restraint, negative space at top for typography --ar 3:4 --style raw
\`\`\`

### Prompt 2 — Porcelain Mist & Cold Metal (Imagen)
\`\`\`
Contemporary Chinese luxury cosmetics campaign moodboard, matte porcelain pedestal #F2F3F5 with subtle brushed titanium metallic tray #BFC5CC, soft misty atmospheric background in smoky blue-grey #7B90A6, single sculptural deep crimson lacquer accent #8E2C2C, diffused gallery lighting, tactile ceramic and cold metal materials, serene high-fashion editorial composition, ultra-clean commercial photography, 3:4 vertical frame
\`\`\`

### Prompt 3 — Botanical Fluted Glass Editorial (Adobe Firefly)
\`\`\`
Minimalist botanical skincare poster background moodboard, translucent vertical fluted glass panel softly diffusing fresh eucalyptus leaves behind it, warm ivory backdrop #F4EFE6 and muted sage green #CAD5C7 tones, soft natural daylight, delicate water condensation droplets on glass, serene organic Korean editorial art direction, generous clean breathing space for minimal serif typography, photorealistic commercial studio shot
\`\`\`
`,
};
