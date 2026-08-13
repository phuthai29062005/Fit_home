FIT-HOME — GHI CHÚ DỰ ÁN
=========================
(mô phỏng công cụ ướm thử nội thất căn hộ cho khách hàng ở Hà Nội)


1. CÁC FILE TRONG THƯ MỤC NÀY
------------------------------
fithome-demo.html            Giao diện web chính (mở file này bằng trình
                              duyệt, hoặc chạy qua 1 local server).
app.js                       Toàn bộ logic: bố trí phòng, kiểm tra vừa vặn
                              & phong thuỷ, đọc ghi chú yêu cầu, dựng 3D.
data.js                      Dữ liệu: mặt bằng căn hộ, catalog sản phẩm,
                              bảng phong thuỷ theo năm sinh, từ khoá tiếng
                              Việt dùng để đọc ghi chú.
phan_bo_do_gia_dung.py       Bản RÚT GỌN, độc lập của thuật toán "phân bổ
                              đồ đúng phòng" — chạy: python3 phan_bo_do_gia_dung.py
Attention-Is-All-You-Need.pdf  Paper tham khảo cho phần "AI đọc hiểu yêu
                              cầu người dùng" (chi tiết ở mục 2 bên dưới).
README.txt                   File này.


2. PHẦN "AI HỖ TRỢ ĐỌC HIỂU YÊU CẦU NGƯỜI DÙNG"
------------------------------------------------
Trong app.js, người dùng gõ yêu cầu bằng tiếng Việt tự nhiên ở ô "Ghi chú
yêu cầu của bạn" (VD: "chỉ cần 1 giường, sofa to quá, cần góc làm việc có
PC, muốn tông màu trắng"). Hàm parseNeedNotes() đọc ghi chú này, tách
thành từng câu, rồi DÒ TỪ KHOÁ tiếng Việt (khai báo trong data.js:
CAT_KEYWORDS, WORK_KEYWORDS, SIZE_*_HINTS, COLOR_WORDS...) để suy ra:
  - cần thêm/bớt món đồ nào
  - kích thước ưu tiên (to hơn / nhỏ hơn)
  - tông màu ưu tiên
  - có cần góc làm việc / PC / tivi treo phòng ngủ hay không
Câu nào không khớp từ khoá nào thì được báo lại rõ ràng ("Chưa hiểu: ...")
thay vì bị bỏ qua âm thầm.

Đây là bản RULE-BASED (so khớp từ khoá) — CHƯA phải một LLM thật. Muốn
nâng cấp thành "AI đọc hiểu yêu cầu" đúng nghĩa (hiểu được câu diễn đạt
tự do, không cần đúng từ khoá) thì cần thay bước dò từ khoá bằng một mô
hình ngôn ngữ (LLM) — ví dụ gọi API của một LLM để phân tích ghi chú và
trả về đúng cấu trúc dữ liệu (món đồ / kích thước / màu) mà parseNeedNotes()
đang tính bằng tay.

File Attention-Is-All-You-Need.pdf (Vaswani et al., 2017, tải từ
https://arxiv.org/abs/1706.03762) là paper nền tảng giới thiệu kiến trúc
Transformer — kiến trúc mạng nơ-ron mà mọi LLM hiện nay (GPT, Gemini,
Claude...) đều xây dựng dựa trên đó. Dùng để trích dẫn/tham khảo khi
trình bày phần "AI đọc hiểu yêu cầu" trong báo cáo, giải thích VÌ SAO một
LLM có thể "đọc hiểu" câu tiếng Việt tự do tốt hơn cách dò từ khoá hiện
tại của project.

Trích dẫn gợi ý (APA):
  Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez,
  A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need.
  Advances in Neural Information Processing Systems, 30.


3. PHẦN "THUẬT TOÁN PHÂN BỔ ĐỒ GIA DỤNG ĐÚNG PHÒNG"
------------------------------------------------------
Bản ĐẦY ĐỦ đang chạy thật trong app.js là hàm autoLayout() / autoLayoutAll()
— không chỉ chọn ĐÚNG PHÒNG mà còn tính cả toạ độ x/y cụ thể trong phòng,
né tường/cửa/cửa sổ, tránh chồng lấn giữa các món, xoay 90° nếu cần, và
tôn trọng ngân sách.

File phan_bo_do_gia_dung.py là bản RÚT GỌN, tách riêng ra ngoài web app,
chỉ tập trung vào đúng 1 câu hỏi cốt lõi: "món đồ này nên xếp vào PHÒNG
NÀO là hợp lý" (chưa xét toạ độ chi tiết trong phòng) — dễ đọc, dễ trình
bày trong báo cáo, chạy độc lập không cần trình duyệt:

    python3 phan_bo_do_gia_dung.py

Ý tưởng thuật toán (tham lam - greedy):
  1. Mỗi loại đồ (category) có sẵn danh sách PHÒNG PHÙ HỢP, xếp theo thứ
     tự ưu tiên (VD: máy giặt ưu tiên WC, hết chỗ thì mới sang lô gia;
     giường/tủ quần áo chỉ hợp phòng ngủ; sofa/bàn ăn chỉ hợp phòng khách).
  2. Với từng món đồ, duyệt qua danh sách phòng phù hợp theo đúng thứ tự
     ưu tiên đó, chọn phòng ĐÚNG LOẠI và CÒN CHỖ TRỐNG đầu tiên (ưu tiên
     phòng còn nhiều chỗ trống nhất nếu có nhiều phòng cùng loại).
  3. Hạng mục nào (như "gương") không thể suy ra phòng chỉ từ category —
     phải đọc thêm TÊN món (VD "gương phòng tắm" khác "gương trang điểm")
     — đúng là điểm mà một AI đọc hiểu ngôn ngữ tự nhiên (mục 2) sẽ làm
     tốt hơn nhiều so với luật cứng.
  4. Món nào hết cả chỗ ở mọi phòng phù hợp thì báo "không xếp được" thay
     vì nhét bừa vào phòng sai — script sẽ in rõ danh sách này ở cuối.

Sức chứa từng phòng và danh sách đồ mẫu trong file này chỉ mang tính minh
hoạ (rút gọn từ catalog thật trong data.js), có thể sửa trực tiếp trong
phần "1. DANH SÁCH PHÒNG" và "3. DANH SÁCH ĐỒ MẪU" ở đầu file để test
với dữ liệu khác.


4. LƯU Ý
--------
Toàn bộ giá cả, sản phẩm trong bản demo web (fithome-demo.html) là dữ
liệu mô phỏng phục vụ trình bày học phần, chưa phải báo giá thương mại
thật (đã ghi rõ trong chính giao diện web).
