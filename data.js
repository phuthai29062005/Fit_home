/* =========================================================
   Fit Home — DỮ LIỆU (mặt bằng + danh mục đồ nội thất)
   Tách riêng khỏi app.js để dễ cập nhật độc lập.
   ========================================================= */

/* =========================================================
   1. MẶT BẰNG — VINHOMES SMART CITY, SAPPHIRE 1, CĂN 1PN+1
   Dựng lại từ mặt bằng tham chiếu chính thức của chủ đầu tư.
   Tỉ lệ suy ra từ diện tích công bố 42,8–43,0 m²: 0,674 cm/px.
   Kiểm chứng chéo bằng bề rộng 5 ô cửa — tất cả đều rơi đúng
   kích thước chuẩn (101 / 86 / 74 / 207 / 206 cm).
   Đơn vị cm. Gốc toạ độ ở góc ngoài trên-trái của căn.
   ========================================================= */
const DATA_STATUS = 'OFFICIAL_REFERENCE';

const PLANS = [
{
  id:'vhsc-s1-1pn1',
  group:'Vinhomes Smart City — Sapphire 1',
  name:'Căn 1PN+1 · 42,8–43,0 m²',
  w:707, d:607,
  note:'Cửa chính mở ở tường tây, vào thẳng khu bếp – ăn – khách. Phòng “+1” không có cánh cửa: nó mở thông hoàn toàn ra không gian chung, và là lối đi duy nhất vào phòng ngủ master.',
  source:'Dựng lại theo mặt bằng tham chiếu chính thức đăng trên smartcity.vinhomes.vn. Chủ đầu tư nêu rõ hình ảnh và thông tin trong tài liệu bán hàng chỉ mang tính tương đối và có thể điều chỉnh; thông tin ràng buộc pháp lý nằm trong hợp đồng mua bán. Kích thước từng phòng ở đây do nhóm suy ra từ tỉ lệ bản vẽ, chưa phải kích thước đo đạc.',
  entry:{wall:'W', pos:309, len:100},
  rooms:[
    { id:'khach', name:'Bếp + Ăn + Khách', type:'khach', x:12, y:297, w:586, d:286,
      floor:'go',
      openings:[
        {wall:'W', pos:12,  len:100, type:'door',   label:'Cửa chính'},
        {wall:'E', pos:40,  len:206, type:'glass',  label:'Cửa lô gia'},
        {wall:'N', pos:149, len:186, type:'open',   label:'Thông phòng +1'}
      ],
      fixtures:[
        {name:'Bếp',    x:0, y:226, w:240, d:60},
        {name:'Bếp',    x:0, y:133, w:60,  d:93}
      ]},

    { id:'plus1', name:'Phòng ngủ +1', type:'ngu', recipe:['giuong','tab'], x:160, y:22, w:187, d:267,
      floor:'go',
      openings:[
        {wall:'S', pos:0, len:187, type:'open', label:'Mở thông ra phòng khách'}
      ], fixtures:[]},

    { id:'master', name:'Phòng ngủ master', type:'ngu', x:356, y:22, w:336, d:267,
      floor:'go', recipe:['giuong','tab','den'],
      openings:[
        {wall:'W', pos:171, len:86,  type:'door',   label:'Cửa phòng'},
        {wall:'E', pos:13,  len:205, type:'window', label:'Cửa sổ'}
      ],
      fixtures:[{name:'Tủ âm tường', x:0, y:0, w:56, d:168}]},

    { id:'wc', name:'WC', type:'wc', x:12, y:22, w:142, d:267,
      floor:'gach', noFurnish:true,
      openings:[
        {wall:'S', pos:62, len:74, type:'door',   label:'Cửa WC'},
        {wall:'W', pos:1,  len:79, type:'window', label:'Cửa sổ'}
      ],
      fixtures:[{name:'Máy giặt', x:0, y:0, w:44, d:87}]},

    { id:'logia', name:'Lô gia', type:'logia', x:607, y:297, w:85, d:286,
      floor:'gach', noFurnish:true,
      openings:[
        {wall:'E', pos:0, len:286, type:'railing', label:'Lan can'}
      ], fixtures:[]}
  ],
  voids:[]
},

/* =========================================================
   1b. MẶT BẰNG — VINHOMES SMART CITY, THE MIAMI, CĂN GS1-12
   Dựng lại từ ảnh mặt bằng 2D + phối cảnh 3D do người dùng cung cấp
   (căn hộ mẫu GS1-12, toà The Miami). Ảnh gốc CHỈ ghi diện tích tổng
   (tim tường 102,7 m² · thông thuỷ 93,7–94,5 m²), KHÔNG có kích thước
   từng phòng hay chiều dài cạnh cửa — khác với căn 1PN+1 ở trên (căn
   đó suy ra được tỉ lệ chính xác nhờ đối chiếu 5 cạnh cửa chuẩn).
   Vì vậy toạ độ/kích thước từng phòng dưới đây là ƯỚC LƯỢNG theo đúng
   bố cục & tỉ lệ tương đối nhìn thấy trên ảnh (3PN, 2WC, 2 lô gia,
   bếp-ăn-khách thông nhau), KHÔNG phải số đo chính xác — cần đối
   chiếu lại với hợp đồng mua bán / bản vẽ CĐT trước khi dùng thật.
   Đơn vị cm. Gốc toạ độ ở góc ngoài trên-trái của căn.
   ========================================================= */
{
  id:'vhsc-miami-gs1-12',
  group:'Vinhomes Smart City — The Miami',
  name:'Căn GS1-12 · 3PN · 93,7–94,5 m²',
  w:930, d:1105,
  note:'Ước lượng lại từ ảnh mặt bằng 2D + phối cảnh 3D căn mẫu GS1-12 (chưa có số đo từng phòng từ CĐT). Bố cục: WC + lô gia kỹ thuật ở góc trên-trái, phòng ngủ master chiếm cả cột trái phía dưới; khối Bếp + Ăn + Khách thông nhau chạy dọc chính giữa (nới rộng 4,2 m để tivi/sofa/bàn trà đủ chỗ, tránh bị dồn cục), mở ra lô gia lớn ở cuối; cột phải là 2 phòng ngủ phụ kẹp WC chung ở giữa. Diện tích ước tính mỗi phòng chỉ mang tính tương đối, tổng thông thuỷ các phòng dưới đây (~87 m²) thấp hơn con số CĐT công bố (93,7–94,5 m²) vì phần hành lang/độ dày tường chưa mô hình hoá riêng.',
  source:'Dựng lại theo ảnh mặt bằng 2D (nét vẽ tay) và ảnh phối cảnh 3D căn GS1-12, dự án The Miami — Vinhomes Smart City, do người dùng cung cấp trực tiếp. Hai ảnh chỉ ghi diện tích tổng và tên phòng, không có kích thước chi tiết hay tỉ lệ bản vẽ đối chiếu được; toạ độ/kích thước từng phòng ở đây do nhóm ước lượng theo đúng tỉ lệ tương đối nhìn thấy, chưa phải kích thước đo đạc hay bản vẽ chính thức của chủ đầu tư.',
  entry:{wall:'N', pos:530, len:100},
  rooms:[
    { id:'wc1', name:'WC chung', type:'wc', x:0, y:0, w:140, d:200,
      floor:'gach', noFurnish:true,
      openings:[
        {wall:'W', pos:20, len:60, type:'window', label:'Cửa sổ nhỏ'},
        {wall:'S', pos:20, len:74, type:'door',   label:'Cửa WC'}
      ],
      fixtures:[{name:'Máy giặt', x:0, y:0, w:44, d:60}]},

    { id:'logia1', name:'Lô gia (bếp)', type:'logia', x:140, y:0, w:130, d:150,
      floor:'gach', noFurnish:true,
      openings:[
        {wall:'N', pos:0, len:130, type:'railing', label:'Lan can'}
      ], fixtures:[]},

    { id:'master', name:'Phòng ngủ master', type:'ngu', role:'bome', x:0, y:200, w:270, d:700,
      floor:'go', recipe:['giuong','tuquanao','tab','den'],
      openings:[
        {wall:'W', pos:300, len:200, type:'window', label:'Cửa sổ'},
        {wall:'N', pos:20,  len:74,  type:'door',   label:'Cửa WC'},
        {wall:'E', pos:400, len:90,  type:'door',   label:'Cửa phòng'}
      ],
      fixtures:[{name:'Tủ âm tường', x:214, y:0, w:56, d:200}]},

    { id:'khach', name:'Bếp + Ăn + Khách', type:'khach', x:270, y:0, w:420, d:800,
      floor:'go',
      openings:[
        {wall:'N', pos:260, len:100, type:'door',  label:'Cửa chính'},
        {wall:'W', pos:600, len:90,  type:'door',  label:'Cửa phòng ngủ master'},
        {wall:'E', pos:150, len:90,  type:'door',  label:'Cửa phòng ngủ nhỏ'},
        {wall:'E', pos:650, len:90,  type:'door',  label:'Cửa phòng ngủ 2'},
        {wall:'S', pos:20,  len:200, type:'glass', label:'Cửa lô gia'}
      ],
      fixtures:[
        {name:'Bếp', x:0, y:0,  w:220, d:60},
        {name:'Bếp', x:0, y:60, w:60,  d:140}
      ]},

    { id:'logia2', name:'Lô gia (khách)', type:'logia', x:270, y:800, w:420, d:180,
      floor:'gach', noFurnish:true,
      openings:[
        {wall:'S', pos:0, len:420, type:'railing', label:'Lan can'}
      ], fixtures:[]},

    { id:'ngu3', name:'Phòng ngủ nhỏ', type:'ngu', role:'con', x:690, y:0, w:240, d:380,
      floor:'go', recipe:['giuong','tuquanao','tab'],
      openings:[
        {wall:'N', pos:30, len:180, type:'window', label:'Cửa sổ'},
        {wall:'E', pos:40, len:150, type:'window', label:'Cửa sổ'},
        {wall:'W', pos:150,len:90,  type:'door',   label:'Cửa phòng'}
      ], fixtures:[]},

    { id:'wc2', name:'WC chung 2', type:'wc', x:690, y:380, w:240, d:160,
      floor:'gach', noFurnish:true,
      openings:[
        {wall:'E', pos:30,  len:50, type:'window', label:'Cửa sổ nhỏ'},
        {wall:'S', pos:100, len:74, type:'door',   label:'Cửa WC'}
      ], fixtures:[]},

    { id:'ngu2', name:'Phòng ngủ 2', type:'ngu', role:'ongba', x:690, y:540, w:240, d:380,
      floor:'go', recipe:['giuong','tuquanao','tab','den'],
      openings:[
        {wall:'N', pos:100, len:74,  type:'door',   label:'Cửa WC'},
        {wall:'W', pos:110, len:90,  type:'door',   label:'Cửa phòng'},
        {wall:'E', pos:150, len:180, type:'window', label:'Cửa sổ'}
      ], fixtures:[]}
  ],
  voids:[]
}
];

/* =========================================================
   2. DANH MỤC ĐỒ NỘI THẤT MUA ĐƯỢC Ở HÀ NỘI
   ========================================================= */
const CATS = [
  {id:'sofa',    label:'Sofa'},
  {id:'bantra',  label:'Bàn trà'},
  {id:'ketivi',  label:'Kệ tivi'},
  {id:'tham',    label:'Thảm'},
  {id:'giuong',  label:'Giường'},
  {id:'tuquanao',label:'Tủ quần áo'},
  {id:'tab',     label:'Tab đầu giường'},
  {id:'trangdiem', label:'Bàn trang điểm'},
  {id:'banan',   label:'Bàn ăn'},
  {id:'banlam',  label:'Bàn làm việc'},
  {id:'ghe',     label:'Ghế'},
  {id:'tugiay',  label:'Tủ giày'},
  {id:'kesach',  label:'Kệ sách'},
  {id:'den',     label:'Đèn'},
  {id:'bantho',  label:'Bàn thờ'},
  {id:'cay',     label:'Cây phong thuỷ'},
  {id:'guong',   label:'Gương'},
  {id:'tuong',   label:'Tượng phong thuỷ'},
  {id:'tranh',   label:'Tranh treo tường'},
  {id:'maygiat', label:'Máy giặt'},
  {id:'tulanh',  label:'Tủ lạnh'},
  {id:'dieuhoa', label:'Điều hoà'},
  {id:'binhnonglanh', label:'Bình nóng lạnh'},
  {id:'bepdien', label:'Bếp từ'},
  {id:'mayhutmui', label:'Máy hút mùi'},
  {id:'giaphoido', label:'Giá phơi đồ'}
];

const CATALOG = [
  // sofa
  {id:'s1', cat:'sofa', name:'Sofa văng 2 chỗ Kalmar', brand:'Baya · Long Biên',      w:190, d:85,  h:82,  price:6490000, ship:250000, days:5,  color:'#6F7F76'},
  {id:'s2', cat:'sofa', name:'Sofa góc L Metro',       brand:'Nhà Xinh · Cầu Giấy',   w:260, d:165, h:80,  price:18900000,ship:450000, days:10, knock:true, shape:'corner', color:'#4E5A63'},
  {id:'s3', cat:'sofa', name:'Sofa nỉ 3 chỗ khung gỗ', brand:'Xưởng Hữu Bằng',        w:185, d:80,  h:78,  price:3250000, ship:200000, days:7,  color:'#8A6F5C'},
  {id:'s4', cat:'sofa', name:'Ghế bành đơn Bọc nỉ',    brand:'Baya · Long Biên',      w:78,  d:80,  h:85,  price:2190000, ship:150000, days:5,  shape:'armchair', color:'#7D8577'},
  {id:'s5', cat:'sofa', name:'Sofa văng nỉ 2m2 chân gỗ',   brand:'Nội thất Fami · Hà Nội',  w:220, d:90,  h:83,  price:7590000, ship:280000, days:6,  color:'#5B6B5F'},
  {id:'s6', cat:'sofa', name:'Sofa da công nghiệp 3 chỗ',  brand:'AKA Furniture · Hà Nội',  w:200, d:88,  h:85,  price:9990000, ship:320000, days:8,  color:'#3E3530'},
  {id:'s7', cat:'sofa', name:'Sofa giường gấp đa năng',    brand:'Shopee Mall · Hà Nội',    w:180, d:90,  h:75,  price:3890000, ship:220000, days:5,  knock:true, color:'#6B5D52'},
  {id:'s8', cat:'sofa', name:'Ghế sofa đơn mini bọc nỉ',   brand:'Baya · Long Biên',        w:70,  d:70,  h:65,  price:890000,  ship:60000,  days:3,  color:'#B5473A'},
  {id:'s9', cat:'sofa', name:'Sofa băng vải bố Bắc Âu',    brand:'Miliboo Việt Nam',        w:210, d:88,  h:80,  price:11500000,ship:380000, days:9,  shape:'bench', color:'#8E9A8C'},
  // bàn trà
  {id:'b1', cat:'bantra', name:'Bàn trà gỗ sồi chữ nhật', brand:'Xưởng Hữu Bằng',     w:100, d:55,  h:42,  price:1150000, ship:120000, days:6,  color:'#A9855C'},
  {id:'b2', cat:'bantra', name:'Bàn trà tròn mặt đá',     brand:'Baya · Long Biên',   w:80,  d:80,  h:40,  price:2790000, ship:150000, days:5,  shape:'round', color:'#9C9A93'},
  {id:'b3', cat:'bantra', name:'Bàn trà kính cường lực chân inox', brand:'Nội thất Xinh · Hà Nội', w:110, d:60,  h:45,  price:2190000, ship:140000, days:5,  color:'#B7BCC0'},
  {id:'b4', cat:'bantra', name:'Bàn trà gỗ công nghiệp 2 tầng',    brand:'Đê La Thành',            w:90,  d:50,  h:40,  price:790000,  ship:80000,  days:3,  knock:true, color:'#8F7A61'},
  {id:'b5', cat:'bantra', name:'Bàn trà mây đan thủ công',         brand:'Xưởng Hữu Bằng',         w:70,  d:70,  h:38,  price:1350000, ship:100000, days:6,  color:'#C8A96E'},
  {id:'b6', cat:'bantra', name:'Bàn trà nâng hạ đa năng',          brand:'AKA Furniture · Hà Nội', w:100, d:60,  h:45,  price:2990000, ship:180000, days:6,  knock:true, color:'#726251'},
  {id:'b7', cat:'bantra', name:'Bàn trà đá cẩm thạch mini',        brand:'Nhà Xinh · Cầu Giấy',    w:60,  d:60,  h:38,  price:3490000, ship:200000, days:7,  shape:'round', color:'#A7A29A'},
  {id:'b8', cat:'bantra', name:'Bàn trà mặt gương nghệ thuật',     brand:'Nhà Xinh · Cầu Giấy',    w:90,  d:50,  h:40,  price:3990000, ship:220000, days:7,  color:'#C7CDD2'},
  {id:'b9', cat:'bantra', name:'Bàn trà gỗ nan hình oval',         brand:'Xưởng Hữu Bằng',         w:95,  d:55,  h:40,  price:1690000, ship:130000, days:6,  shape:'round', color:'#B79A66'},
  {id:'b10',cat:'bantra', name:'Bàn trà xếp lồng 2 tầng',          brand:'Đê La Thành',            w:55,  d:55,  h:45,  knock:true, price:990000,  ship:90000,  days:4,  shape:'nested', color:'#8F7A61'},
  // kệ tivi
  {id:'k1', cat:'ketivi', name:'Kệ tivi 1m6 MDF phủ melamine', brand:'Hoà Phát',      w:160, d:40,  h:45,  price:2350000, ship:180000, days:4,  knock:true, color:'#7A6A58'},
  {id:'k2', cat:'ketivi', name:'Kệ tivi 1m8 gỗ công nghiệp',   brand:'Đê La Thành',   w:180, d:40,  h:42,  price:1850000, ship:150000, days:3,  knock:true, color:'#8B7A64'},
  {id:'k3', cat:'ketivi', name:'Kệ tivi treo tường 1m4',       brand:'An Cường Concept',        w:140, d:30,  h:35,  price:1990000, ship:140000, days:5,  knock:true, color:'#5A4E42'},
  {id:'k4', cat:'ketivi', name:'Kệ tivi 2m0 gỗ óc chó',         brand:'Nội thất Fami · Hà Nội',  w:200, d:42,  h:46,  price:6900000, ship:400000, days:10, knock:true, color:'#6E5C48'},
  {id:'k5', cat:'ketivi', name:'Kệ tivi khung sắt gỗ công nghiệp', brand:'Shopee Mall · Hà Nội', w:150, d:38,  h:48,  price:1290000, ship:110000, days:3,  knock:true, color:'#867258'},
  {id:'k6', cat:'ketivi', name:'Kệ tivi mặt đá Marble',        brand:'Nhà Xinh · Cầu Giấy',     w:170, d:42,  h:46,  price:5200000, ship:280000, days:8,  knock:true, color:'#8E8B84'},
  {id:'k7', cat:'ketivi', name:'Kệ tivi mây tre đan',          brand:'Xưởng Hữu Bằng',          w:150, d:38,  h:44,  price:1650000, ship:130000, days:6,  color:'#B79A66'},
  {id:'k8', cat:'ketivi', name:'Kệ tivi treo tường tối giản 1m2', brand:'An Cường Concept',      w:120, d:25,  h:30,  mount:110, price:1590000, ship:120000, days:5,  knock:true, color:'#4E4438'},
  {id:'k9', cat:'ketivi', name:'Kệ tivi kết hợp tủ rượu',      brand:'Nhà Xinh · Cầu Giấy',     w:190, d:42,  h:80,  price:8500000, ship:420000, days:11, knock:true, shape:'cabinet', color:'#5A4B3A'},
  {id:'k10',cat:'ketivi', name:'Kệ tivi gỗ tần bì Bắc Âu',     brand:'Miliboo Việt Nam',        w:165, d:40,  h:46,  price:5600000, ship:320000, days:9,  knock:true, color:'#B79E7A'},
  // thảm
  {id:'t1', cat:'tham', name:'Thảm dệt 1m6 × 2m3',   brand:'Baya · Long Biên',        w:230, d:160, h:2,   price:890000,  ship:80000,  days:4,  color:'#B9A98F'},
  {id:'t2', cat:'tham', name:'Thảm lông ngắn 1m2×1m7',brand:'Shopee Mall · Hà Nội',   w:170, d:120, h:2,   price:420000,  ship:35000,  days:3,  color:'#C3B7A4'},
  {id:'t3', cat:'tham', name:'Thảm trải sofa 2m×3m',   brand:'Baya · Long Biên',        w:300, d:200, h:2,   price:1690000, ship:120000, days:5,  color:'#9C8B6E'},
  {id:'t4', cat:'tham', name:'Thảm Ba Tư hoạ tiết',    brand:'Nhà Xinh · Cầu Giấy',     w:200, d:140, h:2,   price:2890000, ship:150000, days:7,  color:'#7A3B34'},
  {id:'t5', cat:'tham', name:'Thảm cói tự nhiên',      brand:'Xưởng Hữu Bằng',          w:160, d:120, h:1,   price:390000,  ship:50000,  days:5,  color:'#C9B98E'},
  {id:'t6', cat:'tham', name:'Thảm lót phòng ngủ nhỏ', brand:'Shopee Mall · Hà Nội',    w:100, d:150, h:2,   price:280000,  ship:30000,  days:3,  color:'#B0A99C'},
  {id:'t7', cat:'tham', name:'Thảm sợi tre chống trơn',brand:'Đê La Thành',             w:120, d:180, h:2,   price:520000,  ship:45000,  days:4,  color:'#A79768'},
  // giường
  {id:'g1', cat:'giuong', name:'Giường 1m6 HP-G16',      brand:'Hoà Phát',            w:165, d:205, h:40,  price:4500000, ship:250000, days:6,  knock:true, color:'#8C7256'},
  {id:'g2', cat:'giuong', name:'Giường gỗ tự nhiên 1m8', brand:'Xưởng Hữu Bằng',      w:185, d:210, h:45,  price:7200000, ship:380000, days:12, knock:true, color:'#7A5C3E'},
  {id:'g3', cat:'giuong', name:'Giường đơn 1m2 sinh viên',brand:'Đê La Thành',        w:125, d:195, h:38,  price:1650000, ship:150000, days:4,  knock:true, color:'#9A8266'},
  {id:'g4', cat:'giuong', name:'Giường 1m4 khung thép',      brand:'Hoà Phát',              w:145, d:200, h:35,  price:2900000, ship:180000, days:5,  knock:true, color:'#6D6F72'},
  {id:'g5', cat:'giuong', name:'Giường bọc da 1m8',          brand:'Nhà Xinh · Cầu Giấy',   w:190, d:212, h:42,  price:14500000,ship:550000, days:14, knock:true, shape:'upholstered', color:'#463A34'},
  {id:'g6', cat:'giuong', name:'Giường đơn 1m sắt sơn tĩnh điện', brand:'Hoà Phát',         w:105, d:200, h:36,  price:2100000, ship:180000, days:5,  knock:true, color:'#7F6A50'},
  {id:'g7', cat:'giuong', name:'Giường gỗ sồi Bắc Âu 1m6',   brand:'Miliboo Việt Nam',      w:168, d:207, h:44,  price:11900000,ship:480000, days:15, knock:true, color:'#B08A5C'},
  {id:'g8', cat:'giuong', name:'Giường ngăn kéo thông minh 1m5', brand:'Đê La Thành',       w:155, d:200, h:42,  price:5200000, ship:280000, days:8,  knock:true, shape:'storage', color:'#816A4E'},
  // tủ quần áo
  {id:'u1', cat:'tuquanao', name:'Tủ quần áo 3 buồng',   brand:'Hoà Phát',            w:165, d:60,  h:200, price:4200000, ship:280000, days:7,  knock:true, color:'#6D5F4E'},
  {id:'u2', cat:'tuquanao', name:'Tủ quần áo 2 buồng',   brand:'Đê La Thành',         w:120, d:55,  h:190, price:3400000, ship:220000, days:5,  knock:true, color:'#7C6B58'},
  {id:'u3', cat:'tuquanao', name:'Tủ vải khung thép 1m2',brand:'Shopee Mall · Hà Nội',w:120, d:50,  h:170, price:690000,  ship:40000,  days:3,  knock:true, color:'#95928B'},
  {id:'u4', cat:'tuquanao', name:'Tủ quần áo 4 cánh',        brand:'Hoà Phát',                w:200, d:60,  h:200, price:5400000, ship:350000, days:9,  knock:true, color:'#5F5142'},
  {id:'u5', cat:'tuquanao', name:'Tủ áo cửa lùa 1m8',        brand:'An Cường Concept',        w:180, d:60,  h:220, price:7900000, ship:400000, days:12, knock:true, shape:'sliding', color:'#4D4137'},
  {id:'u6', cat:'tuquanao', name:'Tủ nhựa Đài Loan 5 tầng',  brand:'Shopee Mall · Hà Nội',    w:80,  d:45,  h:130, price:590000,  ship:45000,  days:3,  knock:true, color:'#9C9990'},
  {id:'u7', cat:'tuquanao', name:'Tủ quần áo mini 1 buồng',  brand:'Đê La Thành',             w:80,  d:52,  h:180, price:2100000, ship:160000, days:5,  knock:true, color:'#84725D'},
  {id:'u8', cat:'tuquanao', name:'Kệ mở đựng đồ vải',        brand:'Xưởng Hữu Bằng',          w:100, d:45,  h:160, price:1450000, ship:120000, days:5,  color:'#96805F'},
  // tab
  {id:'n1', cat:'tab', name:'Tab đầu giường 2 ngăn', brand:'Hoà Phát',                w:45,  d:40,  h:55,  price:750000,  ship:80000,  days:4,  color:'#8C7256'},
  {id:'n2', cat:'tab', name:'Tab đầu giường gỗ sồi 1 ngăn', brand:'Xưởng Hữu Bằng',    w:40,  d:38,  h:50,  price:590000,  ship:60000,  days:5,  color:'#A9855C'},
  {id:'n3', cat:'tab', name:'Tab đầu giường mặt đá',        brand:'Nhà Xinh · Cầu Giấy',w:48,  d:42,  h:56,  price:1690000, ship:110000, days:7,  color:'#8E8B84'},
  {id:'n4', cat:'tab', name:'Đôn kê mini để sàn',            brand:'Shopee Mall · Hà Nội', w:35, d:25, h:30, price:250000, ship:30000, days:3, color:'#7C6A54'},
  {id:'n5', cat:'tab', name:'Tab đầu giường 3 ngăn kéo',    brand:'Đê La Thành',       w:50,  d:42,  h:58,  price:980000,  ship:90000,  days:5,  color:'#7A6650'},
  {id:'n6', cat:'tab', name:'Đôn gỗ tròn đa năng',          brand:'Xưởng Hữu Bằng',    w:38,  d:38,  h:45,  price:390000,  ship:45000,  days:4,  color:'#9C7E52'},
  // bàn trang điểm — tách riêng khỏi "bàn làm việc" (trước ở chung 'banlam')
  // vì đây là đồ khác hẳn cả công năng lẫn hình dáng (có gương), và để yêu
  // cầu "cần góc làm việc" không bao giờ vô tình chọn nhầm bàn trang điểm.
  {id:'v1', cat:'trangdiem', name:'Bàn trang điểm mặt kính',       brand:'Nhà Xinh · Cầu Giấy',    w:80, d:40, h:75, price:2390000, ship:180000, days:6, knock:true, color:'#B79A7E'},
  {id:'v2', cat:'trangdiem', name:'Bàn trang điểm gỗ sồi mini',    brand:'Xưởng Hữu Bằng',         w:60, d:35, h:72, price:1290000, ship:110000, days:5, knock:true, color:'#A9855C'},
  {id:'v3', cat:'trangdiem', name:'Bàn trang điểm có đèn LED',     brand:'AKA Furniture · Hà Nội', w:90, d:42, h:135,price:3890000, ship:250000, days:8, knock:true, color:'#4E4438'},
  // bàn ăn
  {id:'a1', cat:'banan', name:'Bàn ăn 4 ghế gỗ cao su', brand:'JYSK · Hà Nội',        w:120, d:75,  h:75,  price:3990000, ship:250000, days:6,  knock:true, color:'#A08761'},
  {id:'a2', cat:'banan', name:'Bàn ăn gấp 2 người',     brand:'Shopee Mall · Hà Nội', w:80,  d:60,  h:74,  price:1290000, ship:90000,  days:3,  knock:true, color:'#AC9670'},
  {id:'a3', cat:'banan', name:'Bàn ăn tròn 6 người mặt đá', brand:'Nhà Xinh · Cầu Giấy',   w:135, d:135, h:76,  price:8900000, ship:400000, days:10, knock:true, shape:'round', color:'#8D8880'},
  {id:'a4', cat:'banan', name:'Bàn ăn chữ nhật 6 ghế',      brand:'Hoà Phát',              w:160, d:85,  h:75,  price:5200000, ship:300000, days:8,  knock:true, color:'#7C6A50'},
  {id:'a5', cat:'banan', name:'Bộ bàn ăn chân sắt 2 người', brand:'AKA Furniture · Hà Nội',w:70,  d:70,  h:74,  price:1090000, ship:90000,  days:4,  knock:true, color:'#6E625A'},
  {id:'a6', cat:'banan', name:'Bàn ăn kéo dài đa năng',     brand:'Đê La Thành',           w:100, d:70,  h:75,  price:2450000, ship:180000, days:6,  knock:true, color:'#8A7458'},
  {id:'a7', cat:'banan', name:'Quầy bar mini kèm ghế cao',  brand:'Shopee Mall · Hà Nội',  w:110, d:40,  h:100, price:2890000, ship:200000, days:6,  knock:true, color:'#4E4640'},
  {id:'a8', cat:'banan', name:'Bàn ăn mặt đá marble 4 ghế', brand:'Nhà Xinh · Cầu Giấy',   w:140, d:80,  h:75,  price:9900000, ship:420000, days:12, knock:true, color:'#EDEAE3'},
  {id:'a9', cat:'banan', name:'Bàn ăn treo tường gấp gọn',  brand:'Shopee Mall · Hà Nội',  w:90,  d:50,  h:74,  price:990000,  ship:80000,  days:3,  knock:true, color:'#9C8462'},
  {id:'a10',cat:'banan', name:'Bàn ăn gỗ cao su 8 ghế',     brand:'JYSK · Hà Nội',         w:200, d:95,  h:75,  price:9200000, ship:400000, days:11, knock:true, color:'#8A7458'},
  // bàn làm việc
  {id:'w1', cat:'banlam', name:'Bàn làm việc 1m2 chân sắt', brand:'Hoà Phát',         w:120, d:60,  h:75,  price:1450000, ship:120000, days:4,  knock:true, color:'#7F7263'},
  {id:'w2', cat:'banlam', name:'Bàn học 1m sinh viên',      brand:'Đê La Thành',      w:100, d:50,  h:75,  price:850000,  ship:80000,  days:3,  knock:true, color:'#8E8070'},
  {id:'w3', cat:'banlam', name:'Bàn làm việc góc chữ L',    brand:'Hoà Phát',              w:140, d:120, h:75,  price:2650000, ship:200000, days:6,  knock:true, color:'#6C6055'},
  {id:'w4', cat:'banlam', name:'Bàn nâng hạ đứng-ngồi',     brand:'AKA Furniture · Hà Nội',w:120, d:60,  h:75,  price:4900000, ship:280000, days:8,  knock:true, color:'#524A42'},
  {id:'w6', cat:'banlam', name:'Bàn máy tính khung thép',   brand:'Shopee Mall · Hà Nội',  w:100, d:55,  h:74,  price:690000,  ship:70000,  days:3,  knock:true, color:'#7A7268'},
  {id:'w7', cat:'banlam', name:'Bàn gấp gọn treo tường',    brand:'Đê La Thành',           w:80,  d:40,  h:75,  price:590000,  ship:60000,  days:4,  knock:true, color:'#8C7D66'},
  {id:'w8', cat:'banlam', name:'Bàn làm việc gỗ sồi tối giản', brand:'Miliboo Việt Nam',   w:110, d:55,  h:75,  price:2190000, ship:170000, days:6,  knock:true, color:'#C9A876'},
  {id:'w9', cat:'banlam', name:'Bàn làm việc có kệ sách tích hợp', brand:'Hoà Phát',       w:130, d:60,  h:135, price:3450000, ship:230000, days:7,  knock:true, color:'#7F7263'},
  {id:'w10',cat:'banlam', name:'Bàn làm việc gấp gọn để giường', brand:'Shopee Mall · Hà Nội', w:60, d:35, h:32, price:390000,  ship:45000,  days:3,  color:'#B79A66'},
  // ghế
  {id:'c1', cat:'ghe', name:'Ghế công thái học lưới', brand:'Warrior · Hà Nội',       w:65,  d:65,  h:120, price:1890000, ship:100000, days:4,  knock:true, color:'#5C6066'},
  {id:'c2', cat:'ghe', name:'Ghế gỗ tựa lưng',        brand:'Xưởng Hữu Bằng',         w:45,  d:48,  h:90,  price:450000,  ship:60000,  days:5,  color:'#9C8058'},
  {id:'c3', cat:'ghe', name:'Ghế xoay văn phòng lưng lưới', brand:'Warrior · Hà Nội',      w:60,  d:60,  h:115, price:1290000, ship:90000,  days:4,  knock:true, color:'#454A4E'},
  {id:'c4', cat:'ghe', name:'Ghế ăn nhựa Eames chân gỗ',    brand:'Shopee Mall · Hà Nội',  w:46,  d:52,  h:82,  price:320000,  ship:40000,  days:3,  knock:true, color:'#C7BFA8'},
  {id:'c5', cat:'ghe', name:'Ghế bar chân cao',             brand:'AKA Furniture · Hà Nội',w:40,  d:40,  h:112, price:750000,  ship:70000,  days:4,  knock:true, color:'#3E3833'},
  {id:'c6', cat:'ghe', name:'Ghế thư giãn tựa lưng ngả',    brand:'Nhà Xinh · Cầu Giấy',   w:75,  d:90,  h:100, price:4200000, ship:250000, days:8,  color:'#6C7A72'},
  {id:'c7', cat:'ghe', name:'Ghế đôn mây tre',              brand:'Xưởng Hữu Bằng',        w:35,  d:35,  h:52,  price:280000,  ship:35000,  days:4,  color:'#B79A66'},
  {id:'c8', cat:'ghe', name:'Ghế đôn tròn bọc nỉ',          brand:'Baya · Long Biên',      w:38,  d:38,  h:45,  price:390000,  ship:45000,  days:4,  color:'#7D8577'},
  {id:'c9', cat:'ghe', name:'Ghế bập bênh thư giãn',        brand:'Nhà Xinh · Cầu Giấy',   w:70,  d:95,  h:100, price:5200000, ship:280000, days:9,  color:'#6C7A72'},
  {id:'c10',cat:'ghe', name:'Ghế gaming công thái học',     brand:'Warrior · Hà Nội',      w:68,  d:70,  h:125, price:2890000, ship:150000, days:5,  knock:true, color:'#3E3833'},
  // tủ giày
  {id:'d1', cat:'tugiay', name:'Tủ giày 4 tầng',       brand:'Hoà Phát',              w:80,  d:32,  h:110, price:1250000, ship:100000, days:4,  knock:true, color:'#77685A'},
  {id:'d2', cat:'tugiay', name:'Tủ giày 6 tầng cửa lùa',    brand:'Hoà Phát',              w:100, d:35,  h:150, price:2100000, ship:160000, days:6,  knock:true, color:'#6A5D4E'},
  {id:'d3', cat:'tugiay', name:'Kệ giày mini 3 tầng',       brand:'Shopee Mall · Hà Nội',  w:60,  d:28,  h:60,  price:390000,  ship:40000,  days:3,  knock:true, color:'#93887A'},
  {id:'d4', cat:'tugiay', name:'Tủ giày kèm ghế thay giày', brand:'Đê La Thành',           w:90,  d:34,  h:100, price:1850000, ship:140000, days:5,  knock:true, color:'#7C6C58'},
  {id:'d5', cat:'tugiay', name:'Kệ giày kim loại đa tầng',  brand:'AKA Furniture · Hà Nội',w:70,  d:30,  h:90,  price:650000,  ship:60000,  days:3,  knock:true, color:'#5C5852'},
  {id:'d6', cat:'tugiay', name:'Tủ giày âm tường 5 tầng',   brand:'An Cường Concept',      w:120, d:35,  h:160, price:3900000, ship:250000, days:8,  knock:true, color:'#4E4438'},
  {id:'d7', cat:'tugiay', name:'Tủ giày mini 2 tầng để cửa', brand:'Shopee Mall · Hà Nội', w:50,  d:26,  h:45,  knock:true, price:290000,  ship:35000,  days:3,  color:'#93887A'},
  {id:'d8', cat:'tugiay', name:'Kệ giày kết hợp ghế ngồi mini', brand:'Đê La Thành',       w:80,  d:30,  h:48,  knock:true, price:790000,  ship:70000,  days:4,  color:'#7C6C58'},
  {id:'d9', cat:'tugiay', name:'Tủ giày thông minh khử mùi', brand:'AKA Furniture · Hà Nội', w:90, d:34,  h:105, knock:true, price:2650000, ship:180000, days:6,  color:'#5C5852'},
  // kệ sách
  {id:'e1', cat:'kesach', name:'Kệ sách 5 tầng gỗ',    brand:'Đê La Thành',           w:80,  d:30,  h:180, price:1100000, ship:100000, days:4,  knock:true, color:'#8A785F'},
  {id:'e2', cat:'kesach', name:'Kệ sách góc chữ L',         brand:'Đê La Thành',           w:100, d:100, h:180, price:1890000, ship:150000, days:6,  knock:true, color:'#8A785F'},
  {id:'e3', cat:'kesach', name:'Kệ sách treo tường module', brand:'Shopee Mall · Hà Nội',  w:60,  d:20,  h:90,  price:450000,  ship:45000,  days:3,  color:'#7C6A54'},
  {id:'e4', cat:'kesach', name:'Giá sách xoay 4 mặt',       brand:'AKA Furniture · Hà Nội',w:50,  d:50,  h:140, price:1450000, ship:110000, days:5,  knock:true, color:'#6E5F4C'},
  {id:'e5', cat:'kesach', name:'Kệ sách gỗ tự nhiên 3 tầng',brand:'Xưởng Hữu Bằng',        w:90,  d:28,  h:110, price:990000,  ship:90000,  days:6,  color:'#A9855C'},
  {id:'e6', cat:'kesach', name:'Kệ sách kết hợp bàn học',   brand:'Hoà Phát',              w:100, d:45,  h:150, price:2200000, ship:170000, days:6,  knock:true, color:'#7A6A58'},
  {id:'e7', cat:'kesach', name:'Kệ sách treo tường hình tổ ong', brand:'Shopee Mall · Hà Nội', w:70, d:20, h:65, mount:100, price:390000,  ship:45000,  days:3,  color:'#8A785F'},
  {id:'e8', cat:'kesach', name:'Kệ sách mini để bàn',       brand:'Baya · Long Biên',      w:35,  d:18,  h:28,  price:150000,  ship:25000,  days:2,  color:'#9C8058'},
  {id:'e9', cat:'kesach', name:'Kệ sách sắt công nghiệp',   brand:'AKA Furniture · Hà Nội',w:85,  d:26,  h:170, knock:true, price:1690000, ship:130000, days:5,  color:'#454A4E'},
  // đèn
  {id:'l1', cat:'den',    name:'Đèn cây đứng vải bố',  brand:'Baya · Long Biên',      w:35,  d:35,  h:160, price:690000,  ship:70000,  days:4,  color:'#C7A96A'},
  {id:'l2', cat:'den',    name:'Đèn sàn tre đan',      brand:'Xưởng Hữu Bằng',        w:40,  d:40,  h:150, price:520000,  ship:60000,  days:5,  color:'#BE9E63'},
  {id:'l3', cat:'den',    name:'Đèn cây chân gỗ chao vải',   brand:'Đê La Thành',           w:35,  d:35,  h:150, price:450000,  ship:55000,  days:4,  color:'#D2B575'},
  {id:'l4', cat:'den',    name:'Đèn đứng công nghiệp chân sắt',brand:'AKA Furniture · Hà Nội',w:32, d:32,  h:165, price:850000,  ship:80000,  days:5,  color:'#3E3833'},
  {id:'l5', cat:'den',    name:'Đèn cây mây tre đan Bali',   brand:'Xưởng Hữu Bằng',        w:40,  d:40,  h:158, price:690000,  ship:70000,  days:5,  color:'#C0A264'},
  {id:'l6', cat:'den',    name:'Đèn để bàn phong cách Bắc Âu',brand:'Shopee Mall · Hà Nội', w:20,  d:20,  h:42,  price:290000,  ship:35000,  days:3,  color:'#E4D6A8'},
  {id:'l7', cat:'den',    name:'Đèn sàn góc phòng 3 chao',   brand:'Nhà Xinh · Cầu Giấy',   w:45,  d:45,  h:170, price:2900000, ship:180000, days:7,  color:'#8E7A54'},
  {id:'l8', cat:'den',    name:'Đèn thả trần mây tre',       brand:'Xưởng Hữu Bằng',        w:35,  d:35,  h:35,  mount:230, price:590000,  ship:60000,  days:5,  color:'#C0A264'},
  {id:'l9', cat:'den',    name:'Đèn ngủ cảm ứng chạm',       brand:'Shopee Mall · Hà Nội',  w:12,  d:12,  h:20,  price:190000,  ship:25000,  days:3,  color:'#E4D6A8'},
  {id:'l10',cat:'den',    name:'Đèn tường trang trí đầu giường', brand:'Đê La Thành',       w:14,  d:10,  h:22,  mount:120, price:350000,  ship:40000,  days:4,  color:'#D2B575'},
  // bàn thờ
  {id:'h1', cat:'bantho', name:'Bàn thờ treo tường 1m07', brand:'Xưởng Sơn Đồng',     w:107, d:48,  h:20,  mount:135,  price:2400000, ship:200000, days:9,  color:'#8E4B2E'},
  {id:'h2', cat:'bantho', name:'Tủ thờ gỗ gụ 1m53',      brand:'Xưởng Sơn Đồng',     w:153, d:68,  h:127, price:9800000, ship:500000, days:15, color:'#6E3A22'},
  {id:'h3', cat:'bantho', name:'Bàn thờ treo tường 1m27',   brand:'Xưởng Sơn Đồng',        w:127, d:48,  h:20,  mount:150, price:3200000, ship:250000, days:10, color:'#7A3F26'},
  {id:'h4', cat:'bantho', name:'Bàn thờ treo tường mini 81cm', brand:'Xưởng Sơn Đồng',     w:81,  d:41,  h:18,  mount:130, price:1650000, ship:150000, days:7,  color:'#8E4B2E'},
  {id:'h5', cat:'bantho', name:'Tủ thờ gỗ hương 1m75',      brand:'Đồng Kỵ · Bắc Ninh',    w:175, d:78,  h:132, price:15800000,ship:650000, days:18, color:'#5A2E1C'},
  {id:'h6', cat:'bantho', name:'Bàn thờ Thần Tài Thổ Địa',  brand:'Xưởng Sơn Đồng',        w:48,  d:34,  h:35,  price:890000,  ship:90000,  days:6,  color:'#8E4B2E'},
  {id:'h7', cat:'bantho', name:'Kệ thờ treo tường hiện đại',brand:'An Cường Concept',      w:100, d:35,  h:15,  mount:140, price:1990000, ship:170000, days:8,  color:'#4E4438'},
  {id:'h8', cat:'bantho', name:'Bàn thờ treo tường gỗ hương cao cấp', brand:'Xưởng Sơn Đồng', w:117, d:48, h:20, mount:145, price:4900000, ship:320000, days:12, color:'#5A2E1C'},
  {id:'h9', cat:'bantho', name:'Bàn thờ ông Công ông Táo mini', brand:'Xưởng Sơn Đồng',     w:38,  d:26,  h:16,  mount:120, price:590000,  ship:70000,  days:5,  color:'#8E4B2E'},
  {id:'h10',cat:'bantho', name:'Bàn thờ Phật để bàn mini',  brand:'Xưởng Sơn Đồng',         w:42,  d:28,  h:30,  price:990000,  ship:90000,  days:6,  color:'#7A3F26'},
  // cây phong thuỷ — đúng tên cây được gợi ý theo mệnh ở mục phong thuỷ (MENH_INFO.cay)
  {id:'p1',  cat:'cay', name:'Lưỡi hổ',              brand:'Chợ hoa Quảng Bá · Hà Nội',   w:18, d:18, h:55,  price:189000, ship:30000, days:3, color:'#3E6B3A'},
  {id:'p2',  cat:'cay', name:'Kim ngân',              brand:'Làng hoa Tây Tựu · Hà Nội',   w:22, d:22, h:70,  price:350000, ship:40000, days:3, color:'#4E7A46'},
  {id:'p3',  cat:'cay', name:'Bạch mã hoàng tử',      brand:'Chợ hoa Quảng Bá · Hà Nội',   w:20, d:20, h:60,  price:320000, ship:40000, days:4, color:'#4A7040'},
  {id:'p4',  cat:'cay', name:'Ngọc ngân',             brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:16, d:16, h:40,  price:179000, ship:30000, days:3, color:'#5C8352'},
  {id:'p5',  cat:'cay', name:'Sen đá',                brand:'Vườn ươm Đà Lạt',             w:10, d:10, h:15,  price:69000,  ship:20000, days:2, color:'#7F9A72'},
  {id:'p6',  cat:'cay', name:'Kim tiền',              brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:20, d:20, h:55,  price:259000, ship:35000, days:3, color:'#3D6B3A'},
  {id:'p7',  cat:'cay', name:'Trầu bà',               brand:'Shopee Mall · Hà Nội',        w:15, d:15, h:35,  price:89000,  ship:25000, days:2, color:'#4A7A44'},
  {id:'p8',  cat:'cay', name:'Cây phát tài',          brand:'Làng hoa Tây Tựu · Hà Nội',   w:25, d:25, h:100, price:550000, ship:60000, days:5, color:'#3E6238'},
  {id:'p9',  cat:'cay', name:'Vạn niên thanh',        brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:18, d:18, h:50,  price:199000, ship:30000, days:3, color:'#4E7A48'},
  {id:'p10', cat:'cay', name:'Trúc phú quý',          brand:'Chợ hoa Quảng Bá · Hà Nội',   w:14, d:14, h:45,  price:149000, ship:25000, days:2, color:'#5A8A4E'},
  {id:'p11', cat:'cay', name:'Phát tài núi',          brand:'Làng hoa Tây Tựu · Hà Nội',   w:28, d:28, h:140, price:890000, ship:80000, days:6, color:'#375A32'},
  {id:'p12', cat:'cay', name:'Trầu bà đế vương xanh', brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:20, d:20, h:55,  price:279000, ship:35000, days:3, color:'#3E6B3E'},
  {id:'p13', cat:'cay', name:'Thuỷ tiên',             brand:'Chợ hoa Quảng Bá · Hà Nội',   w:16, d:16, h:35,  price:159000, ship:25000, days:2, color:'#EDE6C8'},
  {id:'p14', cat:'cay', name:'Trầu bà thuỷ sinh',     brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:12, d:12, h:30,  price:129000, ship:25000, days:2, color:'#4E8248'},
  {id:'p15', cat:'cay', name:'Phát lộc',              brand:'Làng hoa Tây Tựu · Hà Nội',   w:12, d:12, h:40,  price:99000,  ship:20000, days:2, color:'#5C8A50'},
  {id:'p16', cat:'cay', name:'Vạn lộc',               brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:18, d:18, h:45,  price:249000, ship:30000, days:3, color:'#6B8F52'},
  {id:'p17', cat:'cay', name:'Hồng môn',              brand:'Chợ hoa Quảng Bá · Hà Nội',   w:18, d:18, h:45,  price:219000, ship:30000, days:3, color:'#B5473A'},
  {id:'p18', cat:'cay', name:'Phú quý',               brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:18, d:18, h:45,  price:259000, ship:30000, days:3, color:'#79995C'},
  {id:'p19', cat:'cay', name:'Ngũ gia bì',            brand:'Làng hoa Tây Tựu · Hà Nội',   w:24, d:24, h:90,  price:450000, ship:55000, days:4, color:'#3E6238'},
  {id:'p20', cat:'cay', name:'Trầu bà lá xẻ',         brand:'Cây cảnh Xanh Nhà · Hà Nội',  w:26, d:26, h:80,  price:490000, ship:55000, days:4, color:'#33562F'},
  {id:'p21', cat:'cay', name:'Ngọc bích',             brand:'Vườn ươm Đà Lạt',             w:16, d:16, h:35,  price:169000, ship:25000, days:3, color:'#5C8F5A'},
  {id:'p22', cat:'cay', name:'Lan hồ điệp vàng',      brand:'Vườn ươm Đà Lạt',             w:14, d:14, h:50,  price:459000, ship:45000, days:4, color:'#E6C77A'},
  {id:'p23', cat:'cay', name:'Hoa mười giờ',          brand:'Làng hoa Tây Tựu · Hà Nội',   w:20, d:20, h:20,  price:55000,  ship:20000, days:2, color:'#D98A94'},
  // gương — thêm hạng mục riêng vì gương đứng/gương treo tường là 2 kiểu đặt khác hẳn nhau
  {id:'gu1', cat:'guong', name:'Gương đứng toàn thân khung gỗ',     brand:'Xưởng Hữu Bằng',          w:45, d:3,  h:170, price:890000,  ship:90000,  days:4, color:'#C7CDD2'},
  {id:'gu2', cat:'guong', name:'Gương đứng khung sắt nghệ thuật',   brand:'AKA Furniture · Hà Nội',  w:40, d:3,  h:165, price:1290000, ship:100000, days:5, color:'#BFC5C9'},
  {id:'gu3', cat:'guong', name:'Gương treo tường tròn khung gỗ 60cm',brand:'Nhà Xinh · Cầu Giấy',    w:60, d:3,  h:60,  mount:150, price:690000,  ship:70000,  days:4, color:'#C9CFD3'},
  {id:'gu4', cat:'guong', name:'Gương treo tường chữ nhật khung vàng',brand:'Nhà Xinh · Cầu Giấy',   w:50, d:3,  h:70,  mount:140, price:990000,  ship:90000,  days:4, color:'#D4CCA8'},
  {id:'gu5', cat:'guong', name:'Gương phòng tắm có đèn LED',        brand:'An Cường Concept',        w:60, d:3,  h:80,  mount:130, price:1990000, ship:130000, days:5, color:'#C2C9CD'},
  {id:'gu6', cat:'guong', name:'Gương trang điểm để bàn',           brand:'Shopee Mall · Hà Nội',    w:25, d:15, h:35,  price:250000,  ship:30000,  days:3, color:'#CBD1D4'},
  // tượng phong thuỷ — đặt kệ tủ/bàn thờ/góc phòng khách, mỗi mẫu 1 hình khối
  // riêng trong td_furniture() (không dùng chung 1 khối hộp mặc định)
  {id:'tg1', cat:'tuong', name:'Tượng Phật Di Lặc gỗ hương',    brand:'Xưởng Sơn Đồng',           w:20, d:18, h:25, price:890000,  ship:80000,  days:6, color:'#8E6A3E'},
  {id:'tg2', cat:'tuong', name:'Tượng Tỳ Hưu đá phong thuỷ',    brand:'Đá quý Lục Yên · Yên Bái', w:15, d:10, h:12, price:450000,  ship:60000,  days:5, color:'#4A4A4E'},
  {id:'tg3', cat:'tuong', name:'Tượng Thiềm Thừ (cóc 3 chân)',  brand:'Chợ đồ đồng Ý Yên',        w:14, d:12, h:10, price:350000,  ship:50000,  days:4, color:'#B08D46'},
  {id:'tg4', cat:'tuong', name:'Tượng Quan Công đồng',          brand:'Chợ đồ đồng Ý Yên',        w:18, d:14, h:35, price:1590000, ship:120000, days:7, color:'#9C7A3C'},
  {id:'tg5', cat:'tuong', name:'Tượng Voi phong thuỷ đá cẩm thạch', brand:'Đá quý Lục Yên · Yên Bái', w:22, d:12, h:16, price:690000, ship:70000, days:5, color:'#D8D3C8'},
  {id:'tg6', cat:'tuong', name:'Tượng Rùa đầu rồng',            brand:'Chợ đồ đồng Ý Yên',        w:16, d:10, h:12, price:420000,  ship:55000,  days:4, color:'#8A7B4E'},
  {id:'tg7', cat:'tuong', name:'Tượng Phật Quan Âm gốm sứ',     brand:'Gốm Bát Tràng',            w:16, d:16, h:32, price:990000,  ship:90000,  days:6, color:'#EDE7DC'},
  {id:'tg8', cat:'tuong', name:'Tượng cá chép hoá rồng',        brand:'Chợ đồ đồng Ý Yên',        w:24, d:10, h:20, price:750000,  ship:75000,  days:5, color:'#A6863F'},
  // tranh treo tường — mount = độ cao tâm tranh so với sàn
  {id:'tr1', cat:'tranh', name:'Tranh Mã Đáo Thành Công',       brand:'Tranh Đông Hồ Concept',    w:100, d:3, h:60, mount:150, price:1290000, ship:100000, days:6, color:'#7A5A32'},
  {id:'tr2', cat:'tranh', name:'Tranh Cửu Ngư Quần Hội',        brand:'Tranh Đông Hồ Concept',    w:80,  d:3, h:60, mount:150, price:990000,  ship:90000,  days:5, color:'#3E6B7A'},
  {id:'tr3', cat:'tranh', name:'Tranh thư pháp chữ "Tâm"',      brand:'Xưởng Sơn Đồng',           w:50,  d:3, h:70, mount:155, price:590000,  ship:60000,  days:4, color:'#1E1B18'},
  {id:'tr4', cat:'tranh', name:'Tranh phong cảnh núi sông',     brand:'Nhà Xinh · Cầu Giấy',      w:120, d:3, h:70, mount:145, price:1690000, ship:150000, days:7, color:'#4E6E5C'},
  {id:'tr5', cat:'tranh', name:'Tranh hoa mẫu đơn phú quý',     brand:'Tranh Đông Hồ Concept',    w:90,  d:3, h:60, mount:150, price:890000,  ship:80000,  days:5, color:'#B5473A'},
  {id:'tr6', cat:'tranh', name:'Tranh trừu tượng Bắc Âu',       brand:'Miliboo Việt Nam',         w:70,  d:3, h:90, mount:130, price:750000,  ship:70000,  days:4, color:'#C9BFA8'},
  {id:'tr7', cat:'tranh', name:'Bộ 3 tranh canvas tối giản',    brand:'Shopee Mall · Hà Nội',     w:120, d:3, h:40, mount:160, price:650000,  ship:60000,  days:3, color:'#DAD4C6'},
  // máy giặt
  {id:'mg1', cat:'maygiat', name:'Máy giặt mini 3.5kg',             brand:'Shopee Mall · Hà Nội',    w:45, d:43, h:70,  price:2890000, ship:100000, days:3, knock:true, color:'#E4E2DC'},
  {id:'mg2', cat:'maygiat', name:'Máy giặt cửa trên 8kg',           brand:'Điện máy Xanh · Hà Nội',  w:60, d:58, h:85,  price:5490000, ship:150000, days:3, knock:true, color:'#E8E6E0'},
  {id:'mg3', cat:'maygiat', name:'Máy giặt cửa ngang Inverter 9kg', brand:'Điện máy Xanh · Hà Nội',  w:60, d:55, h:85,  price:8990000, ship:200000, days:5, knock:true, color:'#E0DED8'},
  {id:'mg4', cat:'maygiat', name:'Máy giặt sấy 2 trong 1 9kg',      brand:'Điện máy Xanh · Hà Nội',  w:60, d:56, h:85,  price:13900000,ship:250000, days:6, knock:true, color:'#DAD8D2'},
  // tủ lạnh
  {id:'tl1', cat:'tulanh', name:'Tủ lạnh mini 90L',                 brand:'Điện máy Xanh · Hà Nội',  w:47, d:50, h:84,  price:2390000, ship:100000, days:3, knock:true, color:'#EDEBE5'},
  {id:'tl2', cat:'tulanh', name:'Tủ lạnh 2 cánh 236L',              brand:'Điện máy Xanh · Hà Nội',  w:55, d:60, h:150, price:6290000, ship:200000, days:4, knock:true, color:'#E8E6E0'},
  {id:'tl3', cat:'tulanh', name:'Tủ lạnh Inverter 320L',            brand:'Điện máy Xanh · Hà Nội',  w:60, d:65, h:175, price:9990000, ship:250000, days:5, knock:true, color:'#E2E0DA'},
  {id:'tl4', cat:'tulanh', name:'Tủ lạnh side by side 550L',        brand:'Điện máy Xanh · Hà Nội',  w:91, d:73, h:179, price:22900000,ship:400000, days:8, knock:true, color:'#3A3A3A'},
  // điều hoà (mount = độ cao lắp so với sàn)
  {id:'dh1', cat:'dieuhoa', name:'Điều hoà treo tường 1 chiều 9000BTU', brand:'Điện máy Xanh · Hà Nội', w:80, d:20, h:28, mount:200, price:6990000, ship:250000, days:4, color:'#EFEFEC'},
  {id:'dh2', cat:'dieuhoa', name:'Điều hoà Inverter 2 chiều 12000BTU',  brand:'Điện máy Xanh · Hà Nội', w:85, d:22, h:30, mount:200, price:10900000,ship:300000, days:5, color:'#ECECE8'},
  {id:'dh3', cat:'dieuhoa', name:'Điều hoà Inverter tiết kiệm điện 18000BTU', brand:'Điện máy Xanh · Hà Nội', w:95, d:24, h:32, mount:200, price:16900000,ship:350000, days:6, color:'#E9E9E4'},
  // bình nóng lạnh
  {id:'bn1', cat:'binhnonglanh', name:'Bình nóng lạnh trực tiếp',       brand:'Điện máy Xanh · Hà Nội', w:24, d:24, h:40, mount:180, price:1290000, ship:80000,  days:3, color:'#DCD8CE'},
  {id:'bn2', cat:'binhnonglanh', name:'Bình nóng lạnh gián tiếp 15L',   brand:'Điện máy Xanh · Hà Nội', w:36, d:36, h:56, mount:170, price:2990000, ship:130000, days:4, color:'#D6D2C6'},
  {id:'bn3', cat:'binhnonglanh', name:'Bình nóng lạnh gián tiếp 30L',   brand:'Điện máy Xanh · Hà Nội', w:40, d:40, h:68, mount:165, price:3890000, ship:160000, days:5, color:'#D0CCC0'},
  // bếp từ / bếp điện
  {id:'bd1', cat:'bepdien', name:'Bếp từ đơn mini',        brand:'Shopee Mall · Hà Nội',    w:30, d:36, h:6, price:590000,  ship:50000,  days:3, color:'#2E2E2E'},
  {id:'bd2', cat:'bepdien', name:'Bếp từ đôi âm bàn',      brand:'Điện máy Xanh · Hà Nội',  w:70, d:40, h:6, price:6990000, ship:200000, days:5, color:'#242424'},
  {id:'bd3', cat:'bepdien', name:'Bếp hồng ngoại đôi',     brand:'Điện máy Xanh · Hà Nội',  w:59, d:52, h:7, price:2490000, ship:150000, days:4, color:'#2A2A2A'},
  // máy hút mùi
  {id:'hm1', cat:'mayhutmui', name:'Máy hút mùi âm tủ 70cm',   brand:'Điện máy Xanh · Hà Nội', w:70, d:40, h:15, mount:150, price:2590000, ship:130000, days:4, color:'#DCDCDC'},
  {id:'hm2', cat:'mayhutmui', name:'Máy hút mùi kính cong 90cm',brand:'Điện máy Xanh · Hà Nội', w:90, d:45, h:18, mount:150, price:5490000, ship:200000, days:5, color:'#2E2E2E'},
  {id:'hm3', cat:'mayhutmui', name:'Máy hút mùi áp trần',       brand:'Điện máy Xanh · Hà Nội', w:80, d:50, h:20, mount:180, price:8990000, ship:250000, days:6, color:'#3A3A3A'},
  // giá phơi đồ
  {id:'gp1', cat:'giaphoido', name:'Giá phơi đồ inox gấp gọn',    brand:'Shopee Mall · Hà Nội',    w:120, d:50, h:95,  price:490000, ship:60000, days:3, knock:true, color:'#B9BFC4'},
  {id:'gp2', cat:'giaphoido', name:'Giàn phơi thông minh gắn trần',brand:'Điện máy Xanh · Hà Nội',  w:180, d:60, h:5,   mount:250, price:1590000, ship:120000, days:5, color:'#A8AEB4'},
  {id:'gp3', cat:'giaphoido', name:'Giá phơi đồ ban công 2 tầng', brand:'Xưởng Hữu Bằng',           w:150, d:55, h:140, price:890000, ship:90000, days:4, knock:true, color:'#8C9198'}
];

/* bộ đồ tối thiểu theo loại phòng — dùng cho máy bố trí theo ngân sách */
const RECIPES = {
  khach : ['sofa','ketivi','bantra','tham','den','bantho'],
  ngu   : ['giuong','tuquanao','tab','den'],
  studio: ['giuong','tuquanao','banlam','ghe','ketivi'],
  ktx   : ['giuong','banlam','ghe','tuquanao'],
  davang: ['banlam','ghe','kesach','tuquanao']
};
/* tỉ trọng ngân sách khi bố trí cả căn hộ */
const WEIGHT = {khach:1, ngu:.62, studio:1, ktx:1, davang:.35};

/* =========================================================
   MỨC NGÂN SÁCH — để 15tr/30tr/50tr/100tr cho ra kết quả THỰC SỰ khác
   nhau, không chỉ đổi từng món trong cùng 1 hạng mục sang loại đắt hơn,
   mà đổi cả SỐ HẠNG MỤC được xếp: ngân sách càng thấp càng chỉ xếp đồ
   THIẾT YẾU NHẤT (RECIPE_CORE), càng cao càng thêm đồ trang trí/tiện
   nghi (RECIPE_EXTRA) ngoài bộ RECIPES mặc định ở trên (= mức "Tiêu
   chuẩn"). Mốc tiền tính theo NGÂN SÁCH CẢ CĂN HỘ người dùng nhập.
   ========================================================= */
const BUDGET_TIERS = [
  {max:20000000, ten:'Tiết kiệm',  ghiChu:'Chỉ xếp đồ thiết yếu nhất, bớt đồ trang trí.'},
  {max:40000000, ten:'Tiêu chuẩn', ghiChu:'Đủ bộ đồ cơ bản cho mỗi phòng.'},
  {max:70000000, ten:'Đầy đủ',     ghiChu:'Thêm đồ trang trí/tiện nghi ngoài bộ cơ bản.'},
  {max:Infinity, ten:'Cao cấp',    ghiChu:'Đầy đủ + nhiều đồ trang trí, ưu tiên món tốt hơn trong mỗi hạng mục.'}
];
const RECIPE_CORE = {
  khach : ['sofa','ketivi','tham'],
  ngu   : ['giuong','tuquanao'],
  studio: ['giuong','tuquanao','ketivi'],
  ktx   : ['giuong','tuquanao'],
  davang: ['banlam','ghe','tuquanao']
};
const RECIPE_EXTRA = {
  khach : ['cay','guong','tuong','tranh'],
  ngu   : ['cay','guong','tranh'],
  studio: ['cay','kesach','tranh'],
  ktx   : ['cay'],
  davang: ['kesach','cay']
};

const HUONG = ['Bắc','Đông Bắc','Đông','Đông Nam','Nam','Tây Nam','Tây','Tây Bắc'];

/* =========================================================
   4. PHONG THUỶ NGŨ HÀNH — mệnh theo năm sinh, màu & cây hợp mệnh
   Bảng Nạp Âm Lục Thập Hoa Giáp (60 năm, mỗi mục gộp 2 năm Can Chi
   liền kề cùng một nạp âm — đúng thứ tự vòng Giáp Tý truyền thống).
   ========================================================= */
const CAN  = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CHI  = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
const NAP_AM = [
  {name:'Hải Trung Kim',   menh:'kim'},  {name:'Lư Trung Hoả',    menh:'hoa'},
  {name:'Đại Lâm Mộc',     menh:'moc'},  {name:'Lộ Bàng Thổ',     menh:'tho'},
  {name:'Kiếm Phong Kim',  menh:'kim'},  {name:'Sơn Đầu Hoả',     menh:'hoa'},
  {name:'Giản Hạ Thuỷ',    menh:'thuy'}, {name:'Thành Đầu Thổ',   menh:'tho'},
  {name:'Bạch Lạp Kim',    menh:'kim'},  {name:'Dương Liễu Mộc',  menh:'moc'},
  {name:'Tuyền Trung Thuỷ',menh:'thuy'}, {name:'Ốc Thượng Thổ',   menh:'tho'},
  {name:'Tích Lịch Hoả',   menh:'hoa'},  {name:'Tùng Bách Mộc',   menh:'moc'},
  {name:'Trường Lưu Thuỷ', menh:'thuy'}, {name:'Sa Trung Kim',    menh:'kim'},
  {name:'Sơn Hạ Hoả',      menh:'hoa'},  {name:'Bình Địa Mộc',    menh:'moc'},
  {name:'Bích Thượng Thổ', menh:'tho'},  {name:'Kim Bạch Kim',    menh:'kim'},
  {name:'Phú Đăng Hoả',    menh:'hoa'},  {name:'Thiên Hà Thuỷ',   menh:'thuy'},
  {name:'Đại Trạch Thổ',   menh:'tho'},  {name:'Thoa Xuyến Kim',  menh:'kim'},
  {name:'Tang Đố Mộc',     menh:'moc'},  {name:'Đại Khê Thuỷ',    menh:'thuy'},
  {name:'Sa Trung Thổ',    menh:'tho'},  {name:'Thiên Thượng Hoả',menh:'hoa'},
  {name:'Thạch Lựu Mộc',   menh:'moc'},  {name:'Đại Hải Thuỷ',    menh:'thuy'}
];

/* mỗi mệnh: màu hợp (bản mệnh + được sinh), màu kỵ (bị khắc), cây hợp mệnh */
const MENH_INFO = {
  kim:  { label:'Kim',  hanh:'Kim loại',
    mauHop: [{name:'Trắng',  hex:'#F2F2EF'}, {name:'Ghi bạc', hex:'#B9BCC1'}, {name:'Vàng đất', hex:'#C9A96A'}, {name:'Nâu be', hex:'#B8977A'}],
    mauKy:  [{name:'Đỏ', hex:'#B5473A'}, {name:'Hồng', hex:'#D98A94'}, {name:'Cam', hex:'#D98A45'}, {name:'Tím', hex:'#7A5C7E'}],
    ly:'Thổ sinh Kim nên hợp thêm vàng/nâu đất; Hoả khắc Kim nên tránh đỏ, hồng, cam, tím.',
    cay:['Lưỡi hổ','Kim ngân','Bạch mã hoàng tử','Ngọc ngân','Sen đá'],
    // chất liệu tượng thuộc hành Kim (bản mệnh) hoặc Thổ (Thổ sinh Kim) — đồng/đá/gốm
    tuong:['Tượng Thiềm Thừ (cóc 3 chân)','Tượng Quan Công đồng','Tượng cá chép hoá rồng','Tượng Voi phong thuỷ đá cẩm thạch']},
  moc:  { label:'Mộc',  hanh:'Cây cối',
    mauHop: [{name:'Xanh lá', hex:'#4E6B4A'}, {name:'Xanh rêu', hex:'#5C6E52'}, {name:'Đen', hex:'#2A2A2A'}, {name:'Xanh dương', hex:'#3E5F7A'}],
    mauKy:  [{name:'Trắng', hex:'#F2F2EF'}, {name:'Ghi bạc', hex:'#B9BCC1'}, {name:'Ánh kim', hex:'#C8C0A8'}],
    ly:'Thuỷ sinh Mộc nên hợp thêm đen/xanh dương; Kim khắc Mộc nên tránh trắng, ghi, ánh kim.',
    cay:['Kim tiền','Trầu bà','Cây phát tài','Vạn niên thanh','Trúc phú quý'],
    // chất liệu Mộc (gỗ, bản mệnh) hoặc Thuỷ (Thuỷ sinh Mộc, biểu tượng nước)
    tuong:['Tượng Phật Di Lặc gỗ hương','Tượng cá chép hoá rồng','Tượng Rùa đầu rồng']},
  thuy: { label:'Thuỷ', hanh:'Nước',
    mauHop: [{name:'Xanh dương', hex:'#3E5F7A'}, {name:'Đen', hex:'#2A2A2A'}, {name:'Trắng', hex:'#F2F2EF'}, {name:'Ghi bạc', hex:'#B9BCC1'}],
    mauKy:  [{name:'Vàng đất', hex:'#C9A96A'}, {name:'Nâu', hex:'#8C6B4E'}],
    ly:'Kim sinh Thuỷ nên hợp thêm trắng/ghi bạc; Thổ khắc Thuỷ nên tránh vàng đất, nâu.',
    cay:['Phát tài núi','Trầu bà đế vương xanh','Thuỷ tiên','Trầu bà thuỷ sinh','Phát lộc'],
    // chất liệu Thuỷ (biểu tượng nước) hoặc Kim (Kim sinh Thuỷ, đồng)
    tuong:['Tượng Rùa đầu rồng','Tượng cá chép hoá rồng','Tượng Thiềm Thừ (cóc 3 chân)']},
  hoa:  { label:'Hoả',  hanh:'Lửa',
    mauHop: [{name:'Đỏ', hex:'#B5473A'}, {name:'Hồng', hex:'#D98A94'}, {name:'Cam', hex:'#D98A45'}, {name:'Xanh lá', hex:'#4E6B4A'}],
    mauKy:  [{name:'Đen', hex:'#2A2A2A'}, {name:'Xanh dương', hex:'#3E5F7A'}],
    ly:'Mộc sinh Hoả nên hợp thêm xanh lá; Thuỷ khắc Hoả nên tránh đen, xanh dương.',
    cay:['Vạn lộc','Hồng môn','Phú quý','Ngũ gia bì','Trầu bà lá xẻ'],
    // chất liệu Mộc (Mộc sinh Hoả, gỗ) — ít lựa chọn hợp trực tiếp hành Hoả trong danh mục hiện có
    tuong:['Tượng Phật Di Lặc gỗ hương']},
  tho:  { label:'Thổ',  hanh:'Đất',
    mauHop: [{name:'Vàng đất', hex:'#C9A96A'}, {name:'Nâu', hex:'#8C6B4E'}, {name:'Đỏ', hex:'#B5473A'}, {name:'Cam', hex:'#D98A45'}],
    mauKy:  [{name:'Xanh lá', hex:'#4E6B4A'}, {name:'Xanh rêu', hex:'#5C6E52'}],
    ly:'Hoả sinh Thổ nên hợp thêm đỏ/cam; Mộc khắc Thổ nên tránh xanh lá, xanh rêu.',
    cay:['Sen đá','Ngọc bích','Kim ngân','Lan hồ điệp vàng','Hoa mười giờ'],
    // chất liệu Thổ (bản mệnh, đá/gốm) hoặc Hoả (Hoả sinh Thổ)
    tuong:['Tượng Voi phong thuỷ đá cẩm thạch','Tượng Tỳ Hưu đá phong thuỷ','Tượng Phật Quan Âm gốm sứ']}
};

/* =========================================================
   5. KIỂU TƯỜNG & SÀN — mỗi loại chọn 1 kiểu, áp dụng đồng bộ
   cho toàn bộ căn hộ (không chọn riêng theo từng phòng, và tường
   với sàn cũng không bắt buộc phải cùng tông với nhau).
   Tường: type:'son' tô màu phẳng; type:'go' phủ vân gỗ (woodTex
   trong app.js); slat:true vẽ thêm nẹp gỗ dọc (lam sóng/lam thẳng).
   Sàn:  type:'go' vân gỗ (woodTex); type:'gach' lát gạch/đá (tileTex).
   ========================================================= */
const WALL_FINISHES = [
  {id:'trang-mo',    group:'Sơn nước', label:'Trắng mờ (mặc định)', type:'son', color:'#F0EAE0', roughness:.96},
  {id:'kem-sua',     group:'Sơn nước', label:'Kem sữa',             type:'son', color:'#EFE6D3', roughness:.94},
  {id:'xam-nhat',    group:'Sơn nước', label:'Xám nhạt',            type:'son', color:'#DEDBD3', roughness:.9},
  {id:'xanh-sage',   group:'Sơn nước', label:'Xanh sage',           type:'son', color:'#AFB89E', roughness:.9},
  {id:'xanh-dem',    group:'Sơn nước', label:'Xanh dương đêm',      type:'son', color:'#3E5062', roughness:.85},
  {id:'hong-dat',    group:'Sơn nước', label:'Hồng đất (terracotta)',type:'son',color:'#C98F72', roughness:.9},
  {id:'vang-bo',     group:'Sơn nước', label:'Vàng bơ',             type:'son', color:'#E6C77A', roughness:.92},
  {id:'xanh-reu',    group:'Sơn nước', label:'Xanh rêu đậm',        type:'son', color:'#4B5A42', roughness:.88},
  {id:'go-lam-socha',group:'Ốp/ép gỗ', label:'Lam sóng gỗ óc chó',  type:'go',  color:'#5A4433', roughness:.55, slat:true},
  {id:'go-lam-soi',  group:'Ốp/ép gỗ', label:'Lam thẳng gỗ sồi sáng',type:'go', color:'#C9A876', roughness:.6,  slat:true},
  {id:'go-tram',     group:'Ốp/ép gỗ', label:'Ốp gỗ trầm mộc toàn phần',type:'go',color:'#7A5C3E', roughness:.62, slat:false}
];

const FLOOR_FINISHES = [
  {id:'go-soi',    group:'Sàn gỗ',    label:'Gỗ sồi tự nhiên (mặc định)', type:'go',   color:'#C5A87E', roughness:.55},
  {id:'go-occho',  group:'Sàn gỗ',    label:'Gỗ óc chó đậm',              type:'go',   color:'#7A5A3E', roughness:.5},
  {id:'go-tanbi',  group:'Sàn gỗ',    label:'Gỗ tần bì xám khói',         type:'go',   color:'#9C9186', roughness:.58},
  {id:'go-sang',   group:'Sàn gỗ',    label:'Gỗ sáng phong cách Scandinavian', type:'go', color:'#DCC79E', roughness:.6},
  {id:'gach-be-tong',group:'Sàn gạch/đá',label:'Gạch bê tông mài',        type:'gach', color:'#E8E4DC', grout:'#C9C2B4', roughness:.4},
  {id:'gach-terrazzo',group:'Sàn gạch/đá',label:'Gạch terrazzo',         type:'gach', color:'#EDE9E2', grout:'#B7ADA0', roughness:.3},
  {id:'da-marble', group:'Sàn gạch/đá',label:'Đá marble trắng vân xám',  type:'gach', color:'#F1EFE9', grout:'#D8D3C8', roughness:.2},
  {id:'gach-bong', group:'Sàn gạch/đá',label:'Gạch bông hoạ tiết cổ điển',type:'gach', color:'#D9CBB4', grout:'#8C6B4E', roughness:.45}
];

/* =========================================================
   6. ĐIỀU KIỆN CỦA NGƯỜI DÙNG — người dùng gõ ghi chú tự do,
   parseNeedNotes() trong app.js đọc từ khoá tiếng Việt bên dưới
   để suy ra yêu cầu (hạng mục, kích thước, màu), rồi máy bố trí
   CHỌN đúng món và THÊM đúng phòng thay vì chỉ chọn rẻ nhất.
   ========================================================= */
const CAT_KEYWORDS = {
  banlam:   ['bàn làm việc','bàn học','góc làm việc','chỗ làm việc','bàn máy tính'],
  ghe:      ['ghế công thái học','ghế xoay','ghế văn phòng','ghế ăn','ghế'],
  ketivi:   ['kệ tivi','kệ ti vi','kệ tv','tivi treo','ti vi treo','tv treo'],
  sofa:     ['sofa','ghế sofa','ghế salon'],
  bantra:   ['bàn trà','bàn cà phê'],
  tham:     ['thảm'],
  giuong:   ['giường'],
  tuquanao: ['tủ quần áo','tủ áo'],
  tab:      ['táp đầu giường','tab đầu giường','tủ đầu giường'],
  banan:    ['bàn ăn'],
  tugiay:   ['tủ giày','kệ giày'],
  kesach:   ['kệ sách','kệ đựng sách','giá sách'],
  den:      ['đèn cây','đèn sàn','đèn bàn','đèn'],
  bantho:   ['bàn thờ'],
  cay:      ['cây phong thuỷ','cây xanh','chậu cây','cây cảnh','cây để bàn','cây trồng trong nhà'],
  guong:    ['gương soi','gương trang điểm','gương trang trí','gương'],
  maygiat:  ['máy giặt sấy','máy giặt'],
  tulanh:   ['tủ lạnh'],
  dieuhoa:  ['điều hoà','điều hòa','máy lạnh'],
  binhnonglanh: ['bình nóng lạnh','máy nước nóng','bình nước nóng'],
  bepdien:  ['bếp từ','bếp hồng ngoại','bếp điện'],
  mayhutmui:['máy hút mùi','hút mùi'],
  giaphoido:['giá phơi đồ','giá phơi quần áo','giàn phơi']
};
/* vai trò người ở 1 phòng ngủ cụ thể — dùng để đọc ghi chú kiểu "phòng ngủ
   nhỏ là của con, sinh năm 2015" rồi tính phong thuỷ (hướng giường...) RIÊNG
   cho từng phòng theo đúng người ở đó, thay vì 1 năm sinh chung cả nhà. */
const ROLE_KEYWORDS = {
  ongba: ['ông bà','ông nội','bà nội','ông ngoại','bà ngoại','ông','bà'],
  bome:  ['bố mẹ','ba mẹ','cha mẹ','bố','mẹ','ba','má','cha'],
  con:   ['con cái','con trai','con gái','con']
};
const ROLE_LABEL = {ongba:'Ông/bà', bome:'Bố/mẹ', con:'Con'};
/* nhu cầu không gắn với 1 hạng mục cụ thể — bắt trước để khỏi lẫn với "bàn làm việc" */
const WORK_KEYWORDS = ['pc','máy tính bàn','máy tính để bàn','dàn pc','bộ máy tính','case pc','màn hình máy tính'];
const ONEBED_KEYWORDS = ['1 giường','một giường','chỉ cần 1 giường','chỉ 1 giường','không cần 2 giường','1 cái giường thôi'];
/* "không cần / không muốn / bỏ ... X" — câu phủ định, loại hẳn hạng mục X khỏi phòng */
const NEGATE_HINTS = ['không cần','không muốn','không thích','bỏ','khỏi cần','miễn'];
/* hạng mục mà "to/nhỏ" nên so theo CHIỀU CAO thay vì diện tích đáy (đèn, táp
   đầu giường trông "to" chủ yếu do cao thấp, không phải bề ngang) */
const HEIGHT_SIZE_CATS = ['den','tab'];

const SIZE_UP_HINTS   = ['to hơn','lớn hơn','rộng hơn','dài hơn','cao hơn','cỡ lớn'];
const SIZE_DOWN_HINTS = ['nhỏ hơn','bé hơn','gọn hơn','ngắn hơn','thấp hơn'];
/* "to quá / lớn quá / rộng quá" mà KHÔNG có "hơn" phía sau = đang than phiền đồ hiện tại
   to quá → cần đổi sang món NHỎ hơn, nên xếp ở nhóm ngược lại SIZE_UP thông thường */
const SIZE_TOOBIG_HINTS   = ['to quá','lớn quá','rộng quá','dài quá','cao quá','cồng kềnh'];
const SIZE_TOOSMALL_HINTS = ['nhỏ quá','bé quá','chật quá','hẹp quá','ngắn quá','thấp quá'];

const COLOR_FAMILIES = {
  trang:  {label:'trắng',    rgb:[240,240,236]},
  den:    {label:'đen',      rgb:[35,33,30]},
  xam:    {label:'xám',      rgb:[140,140,138]},
  be:     {label:'be/kem',   rgb:[214,196,164]},
  nau:    {label:'nâu gỗ',   rgb:[120,84,56]},
  do:     {label:'đỏ',       rgb:[176,60,45]},
  cam:    {label:'cam',      rgb:[210,130,60]},
  vang:   {label:'vàng',     rgb:[214,180,90]},
  xanhla: {label:'xanh lá',  rgb:[78,107,74]},
  xanhduong:{label:'xanh dương', rgb:[62,95,122]},
  hong:   {label:'hồng',     rgb:[214,150,160]},
  tim:    {label:'tím',      rgb:[122,90,126]}
};
/* cụm từ tiếng Việt → khoá trong COLOR_FAMILIES, xếp cụm dài/đặc hiệu trước để khớp trước */
const COLOR_WORDS = [
  ['xanh dương', 'xanhduong'], ['xanh biển', 'xanhduong'], ['xanh nước biển', 'xanhduong'],
  ['xanh lá', 'xanhla'], ['xanh rêu', 'xanhla'], ['xanh lục', 'xanhla'],
  ['trắng', 'trang'], ['đen', 'den'], ['xám', 'xam'], ['ghi', 'xam'],
  ['be', 'be'], ['kem', 'be'], ['nâu', 'nau'], ['gỗ', 'nau'],
  ['đỏ', 'do'], ['cam', 'cam'], ['vàng', 'vang'], ['hồng', 'hong'], ['tím', 'tim']
];
