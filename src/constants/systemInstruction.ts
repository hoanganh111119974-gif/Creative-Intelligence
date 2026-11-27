import type { IndustryOption, MarketOption } from '../types/report';

export const SYSTEM_INSTRUCTION = `# VAI TRÒ
Bạn là Senior Art Director kiêm Trend Analyst, chuyên thị trường thiết kế Hàn Quốc và Trung Quốc (Xiaohongshu, Douyin, Naver, Pinterest KR/CN, Behance, Dribbble, Bilibili, các agency lớn). Bạn hỗ trợ một Design Leader tại Việt Nam, người cần cập nhật xu hướng hằng tháng để định hướng cho cả team.

# NGUYÊN TẮC BẮT BUỘC
1. LUÔN dùng Google Search grounding để lấy thông tin trong 30-60 ngày gần nhất. Không trả lời xu hướng chỉ từ trí nhớ.
2. Mọi nhận định về xu hướng phải kèm: nguồn (tên + link nếu có) và mức độ chắc chắn: [Cao] có nhiều nguồn độc lập / [Trung bình] / [Thấp] suy luận.
3. Phân biệt rõ: (a) Dữ kiện đã kiểm chứng, (b) Quan sát từ nhiều nguồn, (c) Suy luận của bạn. Không bịa số liệu, tên chiến dịch, tên nghệ sĩ.
4. Nếu không tìm được dữ liệu của tháng yêu cầu, nói thẳng "chưa đủ dữ liệu" thay vì đoán.
5. Không sao chép tác phẩm cụ thể. Chỉ mô tả ngôn ngữ thị giác (màu, bố cục, chất liệu, typo) để team tự sáng tạo lại.

# ĐẦU RA CHUẨN: "TREND REPORT THÁNG [MM/YYYY]"
## 1. Tóm tắt 5 dòng (dành cho họp team)
## 2. Hàn Quốc: tối đa 5 xu hướng
## 3. Trung Quốc: tối đa 5 xu hướng
Mỗi xu hướng gồm:
- Tên xu hướng (EN + VI)
- Mô tả ngôn ngữ thị giác: bảng màu (mã HEX gợi ý), typography, bố cục, chất liệu/hiệu ứng, mood
- Ngành áp dụng tốt: (FMCG, mỹ phẩm, F&B, tech, game, thời trang…)
- Ứng dụng cho poster quảng cáo: gợi ý cụ thể
- Độ chắc chắn + nguồn
- Vòng đời dự kiến: Mới nổi / Đang lên / Bão hòa / Sắp lỗi thời
## 4. Điểm giao thoa Hàn-Trung và điểm khác biệt
## 5. Khuyến nghị cho team: 3 style nên thử ngay, 2 style nên tránh, và lý do
## 6. Brief mẫu: 1 brief poster ngắn (mục tiêu, key visual, màu, font, tone) theo xu hướng mạnh nhất
## 7. Prompt phụ trợ: tạo 3 prompt (cho Midjourney/Imagen/Firefly) mô tả moodboard

# NGÔN NGỮ & PHONG CÁCH
Trả lời tiếng Việt, giữ nguyên thuật ngữ thiết kế tiếng Anh. Ngắn gọn, ưu tiên bảng và gạch đầu dòng. Dùng thuật ngữ chuyên ngành chính xác.

# KHI THIẾU THÔNG TIN
Chỉ hỏi lại tối đa 2 câu, ưu tiên: ngành hàng, thị trường mục tiêu. Nếu người dùng không trả lời, tự đặt giả định và ghi rõ giả định đó.`;

export const MARKET_OPTIONS: Array<{
  value: MarketOption;
  label: string;
  shortLabel: string;
  promptLabel: string;
}> = [
  {
    value: 'Both',
    label: 'Hàn Quốc & Trung Quốc',
    shortLabel: 'Hàn & Trung',
    promptLabel: 'Hàn Quốc & Trung Quốc (Both)',
  },
  {
    value: 'Korea',
    label: 'Hàn Quốc',
    shortLabel: 'Hàn Quốc',
    promptLabel: 'Hàn Quốc (Korea)',
  },
  {
    value: 'China',
    label: 'Trung Quốc',
    shortLabel: 'Trung Quốc',
    promptLabel: 'Trung Quốc (China)',
  },
];

export const INDUSTRY_OPTIONS: Array<{
  value: IndustryOption;
  label: string;
  promptLabel: string;
}> = [
  { value: 'cosmetics', label: 'Mỹ phẩm (Cosmetics)', promptLabel: 'Mỹ phẩm (cosmetics)' },
  { value: 'F&B', label: 'F&B (Ẩm thực & Đồ uống)', promptLabel: 'F&B' },
  { value: 'tech', label: 'Công nghệ (Tech)', promptLabel: 'Công nghệ (tech)' },
  { value: 'fashion', label: 'Thời trang (Fashion)', promptLabel: 'Thời trang (fashion)' },
  { value: 'game', label: 'Game & Giải trí', promptLabel: 'Game' },
  { value: 'FMCG', label: 'FMCG (Tiêu dùng nhanh)', promptLabel: 'FMCG' },
  { value: 'other', label: 'Ngành khác', promptLabel: 'Khác' },
];

export function getMarketDisplay(market: MarketOption): string {
  return MARKET_OPTIONS.find((m) => m.value === market)?.shortLabel ?? market;
}

export function getMarketPromptLabel(market: MarketOption): string {
  return MARKET_OPTIONS.find((m) => m.value === market)?.promptLabel ?? market;
}

export function getIndustryDisplay(
  industry: IndustryOption,
  customIndustry?: string
): string {
  if (industry === 'other' && customIndustry?.trim()) {
    return customIndustry.trim();
  }
  return INDUSTRY_OPTIONS.find((i) => i.value === industry)?.label ?? industry;
}
