#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Thuật toán PHÂN BỔ ĐỒ GIA DỤNG ĐÚNG PHÒNG — bản đơn giản (demo/báo cáo)
========================================================================
Ý tưởng: mỗi loại đồ (category) có 1 hoặc vài PHÒNG PHÙ HỢP, xếp theo thứ
tự ưu tiên. Thuật toán duyệt từng món đồ, thử xếp vào phòng phù hợp nhất
còn CHỖ TRỐNG (sức chứa còn lại) theo kiểu tham lam (greedy) — hạng mục
nào không còn phòng phù hợp nào trống thì báo "không xếp được", không
nhét bừa vào phòng sai chỗ.

Đây là bản RÚT GỌN để trình bày ý tưởng thuật toán trong báo cáo — không
phải bản đầy đủ đang chạy trong app.js của dự án FIT-HOME (bản đầy đủ còn
tính cả toạ độ x/y trong phòng, tránh chồng lấn, né cửa/cửa sổ, xoay 90°...
xem hàm autoLayout() trong app.js). Chạy được ngay, không cần cài thêm gì:

    python3 phan_bo_do_gia_dung.py
"""

from collections import defaultdict

# =========================================================
# 1. DANH SÁCH PHÒNG — mỗi phòng có 1 loại (type) và sức chứa đơn giản
#    (số "chỗ" tối đa, không tính diện tích thật — chỉ để minh hoạ ý
#    tưởng "phân bổ có giới hạn", giống hạn chế ngân sách/diện tích
#    trong bài toán thật).
# =========================================================
ROOMS = [
    {"id": "khach",  "ten": "Bếp + Ăn + Khách", "loai": "khach", "suc_chua": 8},
    {"id": "plus1",  "ten": "Phòng ngủ +1",     "loai": "ngu",   "suc_chua": 4},
    {"id": "master", "ten": "Phòng ngủ master", "loai": "ngu",   "suc_chua": 5},
    {"id": "wc",     "ten": "WC",               "loai": "wc",    "suc_chua": 3},
    {"id": "logia",  "ten": "Lô gia (ban công)","loai": "logia", "suc_chua": 2},
]

# =========================================================
# 2. LUẬT "HẠNG MỤC → PHÒNG PHÙ HỢP" — liệt kê theo thứ tự ƯU TIÊN.
#    Đúng như logic RECIPES trong data.js của FIT-HOME: đồ phòng khách ở
#    khách, đồ ngủ ở phòng ngủ, đồ tắm/giặt ở WC hoặc lô gia, v.v.
# =========================================================
LUAT_PHONG = {
    # đồ phòng khách / bếp / ăn
    "sofa":     ["khach"],
    "bantra":   ["khach"],
    "ketivi":   ["khach", "ngu"],       # tivi treo phòng ngủ cũng hợp lý
    "banan":    ["khach"],
    "tugiay":   ["khach"],              # gần cửa chính
    "bantho":   ["khach"],
    "tulanh":   ["khach"],
    "bepdien":  ["khach"],
    "mayhutmui":["khach"],

    # đồ phòng ngủ
    "giuong":   ["ngu"],
    "tuquanao": ["ngu"],
    "tab":      ["ngu"],
    "banlam":   ["ngu", "khach"],       # góc làm việc: ưu tiên phòng ngủ, hết chỗ thì khách
    "kesach":   ["ngu", "khach"],
    "ghe":      ["khach", "ngu"],

    # đồ WC / giặt giũ / ban công — hay bị xếp NHẦM nhất nếu chỉ đoán bừa
    "maygiat":      ["wc", "logia"],
    "binhnonglanh": ["wc"],
    "giaphoido":    ["logia", "wc"],

    # đồ dùng chung, đặt đâu cũng được (đèn, cây, điều hoà...)
    "den":      ["khach", "ngu"],
    "cay":      ["khach", "ngu"],
    "dieuhoa":  ["ngu", "khach"],
    "tham":     ["khach", "ngu"],
}

# gương thì KHÔNG THỂ suy ra phòng chỉ từ category — phải nhìn TÊN món để
# biết đó là gương phòng tắm hay gương phòng ngủ/phòng khách; đây chính là
# lý do phần "AI đọc hiểu yêu cầu" (đọc mô tả bằng tiếng Việt) trong dự án
# hữu ích hơn là chỉ tra bảng cứng nhắc.
def phong_hop_cho_guong(ten_mon):
    if "phòng tắm" in ten_mon.lower():
        return ["wc"]
    if "trang điểm" in ten_mon.lower():
        return ["ngu", "khach"]
    return ["ngu", "khach"]


# =========================================================
# 3. DANH SÁCH ĐỒ MẪU — rút gọn từ CATALOG thật trong data.js, đủ đa dạng
#    category để minh hoạ thuật toán chạy đúng trên nhiều loại đồ khác nhau.
# =========================================================
DO_MAU = [
    {"id": "s1",  "cat": "sofa",     "ten": "Sofa văng 2 chỗ Kalmar"},
    {"id": "b1",  "cat": "bantra",   "ten": "Bàn trà gỗ sồi chữ nhật"},
    {"id": "k1",  "cat": "ketivi",   "ten": "Kệ tivi 1m6 MDF phủ melamine"},
    {"id": "a1",  "cat": "banan",    "ten": "Bàn ăn 4 ghế gỗ cao su"},
    {"id": "h1",  "cat": "bantho",   "ten": "Bàn thờ treo tường 1m07"},
    {"id": "g1",  "cat": "giuong",   "ten": "Giường 1m6 HP-G16"},
    {"id": "g2",  "cat": "giuong",   "ten": "Giường gỗ tự nhiên 1m8"},
    {"id": "u1",  "cat": "tuquanao", "ten": "Tủ quần áo 3 buồng"},
    {"id": "n1",  "cat": "tab",      "ten": "Tab đầu giường 2 ngăn"},
    {"id": "w1",  "cat": "banlam",   "ten": "Bàn làm việc 1m2 chân sắt"},
    {"id": "c1",  "cat": "ghe",      "ten": "Ghế công thái học lưới"},
    {"id": "d1",  "cat": "tugiay",   "ten": "Tủ giày 4 tầng"},
    {"id": "e1",  "cat": "kesach",   "ten": "Kệ sách 5 tầng gỗ"},
    {"id": "l1",  "cat": "den",      "ten": "Đèn cây đứng vải bố"},
    {"id": "p1",  "cat": "cay",      "ten": "Lưỡi hổ"},
    {"id": "mg3", "cat": "maygiat",  "ten": "Máy giặt cửa ngang Inverter 9kg"},
    {"id": "tl3", "cat": "tulanh",   "ten": "Tủ lạnh Inverter 320L"},
    {"id": "bd1", "cat": "bepdien",  "ten": "Bếp từ đơn mini"},
    {"id": "hm2", "cat": "mayhutmui","ten": "Máy hút mùi kính cong 90cm"},
    {"id": "dh2", "cat": "dieuhoa",  "ten": "Điều hoà Inverter 2 chiều 12000BTU"},
    {"id": "bn2", "cat": "binhnonglanh", "ten": "Bình nóng lạnh gián tiếp 15L"},
    {"id": "gp2", "cat": "giaphoido","ten": "Giàn phơi thông minh gắn trần"},
    {"id": "gu5", "cat": "guong",    "ten": "Gương phòng tắm có đèn LED"},
    {"id": "gu4", "cat": "guong",    "ten": "Gương treo tường chữ nhật khung vàng"},
    {"id": "gu6", "cat": "guong",    "ten": "Gương trang điểm để bàn"},
]


def phan_bo(danh_sach_do, danh_sach_phong):
    """
    Thuật toán tham lam (greedy):
    1. Với mỗi món đồ, lấy DANH SÁCH PHÒNG PHÙ HỢP theo thứ tự ưu tiên
       (từ LUAT_PHONG, hoặc luật riêng cho gương).
    2. Duyệt lần lượt từng phòng phù hợp — phòng nào ĐÚNG LOẠI và CÒN CHỖ
       thì xếp món đồ vào đó, dừng lại (không xét tiếp các lựa chọn kém
       ưu tiên hơn).
    3. Nếu hết cả danh sách mà không phòng nào còn chỗ → món đồ "không
       xếp được", cần tăng sức chứa/diện tích phòng hoặc bỏ bớt đồ khác.
    """
    phong_theo_id = {p["id"]: p for p in danh_sach_phong}
    da_dung = defaultdict(int)          # số chỗ đã dùng theo id phòng
    ket_qua = []                        # log từng bước để in báo cáo

    for do in danh_sach_do:
        if do["cat"] == "guong":
            uu_tien_loai = phong_hop_cho_guong(do["ten"])
        else:
            uu_tien_loai = LUAT_PHONG.get(do["cat"], ["khach"])

        xep_vao = None
        for loai in uu_tien_loai:
            # tìm phòng ĐÚNG LOẠI và CÒN CHỖ, ưu tiên phòng còn nhiều chỗ trống nhất
            ung_vien = [p for p in danh_sach_phong
                        if p["loai"] == loai and da_dung[p["id"]] < p["suc_chua"]]
            if ung_vien:
                ung_vien.sort(key=lambda p: p["suc_chua"] - da_dung[p["id"]], reverse=True)
                xep_vao = ung_vien[0]
                break

        if xep_vao:
            da_dung[xep_vao["id"]] += 1
            ket_qua.append((do, xep_vao, True))
        else:
            ket_qua.append((do, None, False))

    return ket_qua, da_dung, phong_theo_id


def in_bao_cao(ket_qua, da_dung, phong_theo_id):
    print("=" * 64)
    print("KẾT QUẢ PHÂN BỔ ĐỒ GIA DỤNG")
    print("=" * 64)
    for do, phong, thanh_cong in ket_qua:
        if thanh_cong:
            print(f"  [OK] {do['ten']:<38} -> {phong['ten']}")
        else:
            print(f"  [KHÔNG XẾP ĐƯỢC] {do['ten']:<28} (hết chỗ ở mọi phòng phù hợp)")

    print("\n" + "-" * 64)
    print("TỔNG KẾT THEO PHÒNG")
    print("-" * 64)
    for pid, phong in phong_theo_id.items():
        dung = da_dung[pid]
        print(f"  {phong['ten']:<22} {dung}/{phong['suc_chua']} chỗ đã dùng")

    khong_xep = [do for do, _, ok in ket_qua if not ok]
    if khong_xep:
        print(f"\n{len(khong_xep)} món chưa xếp được — cân nhắc tăng sức chứa phòng "
              "hoặc bớt đồ ở hạng mục đó.")
    else:
        print("\nTất cả món đồ đều đã được xếp đúng phòng phù hợp.")


if __name__ == "__main__":
    ket_qua, da_dung, phong_theo_id = phan_bo(DO_MAU, ROOMS)
    in_bao_cao(ket_qua, da_dung, phong_theo_id)
