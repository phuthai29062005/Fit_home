"use strict";

const byId = id => CATALOG.find(x => x.id === id);
const catLabel = id => (CATS.find(c => c.id === id) || {}).label || id;

/* =========================================================
   3. TRẠNG THÁI
   S.store giữ đồ của từng phòng: khoá "planId/roomId".
   Nhờ vậy chuyển phòng không mất đồ, và bản vẽ hiện được
   toàn bộ căn hộ đã bố trí.
   ========================================================= */
const S = {
  planId:'vhsc-s1-1pn1', roomId:'khach',
  store:{}, wallFinish:WALL_FINISHES[0].id, floorFinish:FLOOR_FINISHES[0].id,
  sel:null, filter:'all',
  huong:'Nam', year:2000, budget:30000000, lightPreset:'day',
  need:{ people:2, notes:'', workspace:false, pc:false, bedroomTv:false, oneBedOnly:false,
         sizePref:{}, colorPref:{}, must:[], autoMust:[], exclude:[], parsed:[] },
  arIdx:0
};
let UID = 1;

/* =========================================================
   lưu & khôi phục mong muốn cá nhân (ghi chú, ngân sách, cách
   bố trí…) vào trình duyệt — để tải lại trang không mất lựa chọn
   ========================================================= */
const SAVE_KEY = 'fithome_state_v1';
function saveState(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      planId:S.planId, roomId:S.roomId, store:S.store,
      wallFinish:S.wallFinish, floorFinish:S.floorFinish,
      huong:S.huong, year:S.year, budget:S.budget, lightPreset:S.lightPreset,
      need:S.need
    }));
    const n = document.getElementById('saveNote');
    if (n) n.textContent = 'Đã lưu mong muốn của bạn trên trình duyệt này · ' +
      new Date().toLocaleTimeString('vi-VN');
  }catch(e){ /* localStorage có thể bị chặn (chế độ ẩn danh…) — bỏ qua, không chặn ứng dụng */ }
}
function loadState(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.planId && PLANS.some(p => p.id === d.planId)) S.planId = d.planId;
    S.roomId = d.roomId || S.roomId;
    S.store = d.store || {};
    S.wallFinish = d.wallFinish || S.wallFinish;
    S.floorFinish = d.floorFinish || S.floorFinish;
    S.huong = d.huong || S.huong;
    S.year = d.year || S.year;
    S.budget = d.budget || S.budget;
    S.lightPreset = d.lightPreset || S.lightPreset;
    Object.assign(S.need, d.need || {});
    let maxUid = 0;
    Object.values(S.store).forEach(list => (list||[]).forEach(it => { if (it.uid > maxUid) maxUid = it.uid; }));
    UID = maxUid + 1;
    return true;
  }catch(e){ return false; }
}
function clearSavedState(){
  try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
  window.removeEventListener('beforeunload', saveState);
  location.reload();
}

const plan  = () => PLANS.find(p => p.id === S.planId);
const liveRooms = () => plan().rooms.filter(r => !r.noFurnish);
const room  = () => plan().rooms.find(r => r.id === S.roomId) || liveRooms()[0];
const key   = (pid, rid) => pid + '/' + rid;
const itemsIn = rid => (S.store[key(S.planId, rid)] || (S.store[key(S.planId, rid)] = []));
const items = () => itemsIn(S.roomId);
const roomById = rid => plan().rooms.find(r => r.id === rid);

/* tường & sàn dùng chung 1 kiểu cho toàn bộ căn hộ, không lệ thuộc lẫn nhau */
const currentWallFinish  = () => WALL_FINISHES.find(x => x.id === S.wallFinish)   || WALL_FINISHES[0];
const currentFloorFinish = () => FLOOR_FINISHES.find(x => x.id === S.floorFinish) || FLOOR_FINISHES[0];

const vnd = n => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
/* demo chưa có kho sản phẩm/SKU thật để trỏ thẳng vào — dẫn ra kết quả tìm
   kiếm GOOGLE theo tên + hãng sản phẩm, để nút "mua" luôn ra một trang thật
   có thể bấm vào. Trước đây trỏ thẳng vào tìm kiếm Shopee, nhưng với đồ điện
   máy (tủ lạnh, máy giặt, điều hoà...) kết quả trên Shopee thường là hàng
   trôi nổi/không rõ nguồn gốc, giá lệch rất xa giá hãng thật (Điện Máy Xanh,
   Nguyễn Kim...) — dò Google sẽ ra nhiều nguồn để so sánh, sát với brand đã
   gắn trong dữ liệu hơn. */
const buyUrl = p => 'https://www.google.com/search?q=' + encodeURIComponent('mua ' + p.name + ' ' + p.brand.split('·')[0].trim() + ' giá bao nhiêu');

function dims(it){
  const p = byId(it.id);
  return (it.rot % 180 === 0) ? {w:p.w, d:p.d} : {w:p.d, d:p.w};
}
const noFloor = p => p.cat === 'tham' || !!p.mount;
function rectOf(it){ const {w,d} = dims(it); return {x:it.x, y:it.y, w, d}; }
const overlap = (a,b) => a.x < b.x+b.w && b.x < a.x+a.w && a.y < b.y+b.d && b.y < a.y+a.d;
function gapBetween(a,b){
  const dx = Math.max(0, Math.max(a.x-(b.x+b.w), b.x-(a.x+a.w)));
  const dy = Math.max(0, Math.max(a.y-(b.y+b.d), b.y-(a.y+a.d)));
  if (dx>0 && dy>0) return Infinity;
  return Math.max(dx,dy);
}
function openingRect(o, r){
  const T = 12;
  if (o.wall==='N') return {x:o.pos, y:0,       w:o.len, d:T};
  if (o.wall==='S') return {x:o.pos, y:r.d - T, w:o.len, d:T};
  if (o.wall==='W') return {x:0,     y:o.pos,   w:T,     d:o.len};
  return               {x:r.w - T,   y:o.pos,   w:T,     d:o.len};
}
function passRect(o, r, K){
  if (o.wall==='N') return {x:o.pos, y:0,       w:o.len, d:K};
  if (o.wall==='S') return {x:o.pos, y:r.d - K, w:o.len, d:K};
  if (o.wall==='W') return {x:0,     y:o.pos,   w:K,     d:o.len};
  return               {x:r.w - K,   y:o.pos,   w:K,     d:o.len};
}
function swingRect(o, r){
  const K = 90;
  if (o.wall==='N') return {x:o.pos, y:0,       w:o.len, d:K};
  if (o.wall==='S') return {x:o.pos, y:r.d - K, w:o.len, d:K};
  if (o.wall==='W') return {x:0,     y:o.pos,   w:K,     d:o.len};
  return               {x:r.w - K,   y:o.pos,   w:K,     d:o.len};
}
function cungMenh(year, nam=true){
  const s2 = year % 100;
  let s = String(s2).padStart(2,'0').split('').reduce((a,c)=>a+ +c, 0);
  while (s > 9) s = String(s).split('').reduce((a,c)=>a+ +c, 0);
  let n = nam ? (10 - s) : (s + 5);
  while (n > 9) n -= 9;
  if (nam && n === 5) n = 2;
  if (!nam && n === 5) n = 8;
  const MAP = {1:'Khảm',2:'Khôn',3:'Chấn',4:'Tốn',6:'Càn',7:'Đoài',8:'Cấn',9:'Ly'};
  const ten = MAP[n] || 'Khảm';
  const dong = ['Khảm','Ly','Chấn','Tốn'].includes(ten);
  return {
    ten,
    nhom: dong ? 'Đông tứ mệnh' : 'Tây tứ mệnh',
    tot : dong ? ['Bắc','Nam','Đông','Đông Nam'] : ['Tây','Tây Bắc','Tây Nam','Đông Bắc']
  };
}
/* mệnh Ngũ hành theo Nạp Âm — 60 năm Can Chi lặp lại theo chu kỳ */
function napAmOf(year){
  const j = ((year - 4) % 60 + 60) % 60;
  const canChi = CAN[j % 10] + ' ' + CHI[j % 12];
  const na = NAP_AM[Math.floor(j / 2)];
  return {canChi, ten:na.name, menh:na.menh, ...MENH_INFO[na.menh]};
}
/* hướng thực của một cạnh trên bản vẽ, biết cạnh trên là S.huong */
function huongCua(edge){         // edge: 'N','E','S','W' trên bản vẽ
  const base = HUONG.indexOf(S.huong);
  const step = {N:0, E:2, S:4, W:6}[edge];
  return HUONG[(base + step) % 8];
}
/* đầu giường tựa vào tường nào */
function headEdge(it){
  const r = room(), R = rectOf(it);
  const dN = R.y, dS = r.d - (R.y + R.d), dW = R.x, dE = r.w - (R.x + R.w);
  const m = Math.min(dN,dS,dW,dE);
  if (m === dN) return 'N';
  if (m === dS) return 'S';
  if (m === dW) return 'W';
  return 'E';
}


/* =========================================================
   5. VẼ MẶT BẰNG CẢ CĂN HỘ
   ========================================================= */
const SANS = "'Be Vietnam Pro',system-ui,sans-serif";
const MONO = "'IBM Plex Mono',monospace";
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let VIEW = {sc:1, ox:0, oy:0};

function resize(){
  const wrap = cv.parentElement, dpr = window.devicePixelRatio || 1;
  cv.width = wrap.clientWidth * dpr; cv.height = wrap.clientHeight * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  draw();
  if (typeof TD !== 'undefined' && TD.active) td_resize();
}
window.addEventListener('resize', resize);

function fitView(){
  const P = plan();
  const W = cv.parentElement.clientWidth, H = cv.parentElement.clientHeight, pad = 66;
  VIEW.sc = Math.min((W - pad*2)/P.w, (H - pad*2)/P.d);
  VIEW.ox = (W - P.w*VIEW.sc)/2;
  VIEW.oy = (H - P.d*VIEW.sc)/2;
}
const X = x => VIEW.ox + x*VIEW.sc;
const Y = y => VIEW.oy + y*VIEW.sc;
const L = v => v*VIEW.sc;
const invX = px => (px - VIEW.ox)/VIEW.sc;
const invY = py => (py - VIEW.oy)/VIEW.sc;

function badSet(){
  const s = new Set(), r = room(), list = items();
  list.forEach(a => {
    const A = rectOf(a);
    if (A.x < -1 || A.y < -1 || A.x+A.w > r.w+1 || A.y+A.d > r.d+1) s.add(a.uid);
    (r.fixtures||[]).forEach(f => { if (overlap(A,{x:f.x,y:f.y,w:f.w,d:f.d})) s.add(a.uid); });
  });
  for (let i=0;i<list.length;i++) for (let j=i+1;j<list.length;j++){
    if (noFloor(byId(list[i].id)) || noFloor(byId(list[j].id))) continue;
    if (overlap(rectOf(list[i]), rectOf(list[j]))) { s.add(list[i].uid); s.add(list[j].uid); }
  }
  return s;
}
const shorten = (t,wpx) => { const m = Math.floor(wpx/6.4); return t.length>m ? t.slice(0,Math.max(3,m-1))+'…' : t; };

function drawItems(r, active){
  const list = itemsIn(r.id);
  const bad = active ? badSet() : new Set();
  const sorted = list.slice().sort((a,b) => (byId(a.id).cat==='tham'?0:1)-(byId(b.id).cat==='tham'?0:1));
  sorted.forEach(it => {
    const p = byId(it.id), R = rectOf(it);
    const x = X(r.x+R.x), y = Y(r.y+R.y), w = L(R.w), h = L(R.d);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = active ? (p.cat==='tham' ? .55 : .92) : (p.cat==='tham' ? .22 : .38);
    ctx.fillRect(x,y,w,h);
    ctx.globalAlpha = 1;
    ctx.lineWidth = (active && it.uid===S.sel) ? 2.5 : 1;
    ctx.strokeStyle = bad.has(it.uid) ? '#D8695B'
      : (active && it.uid===S.sel) ? '#EAE6DC'
      : 'rgba(0,0,0,'+(active?.45:.25)+')';
    ctx.strokeRect(x,y,w,h);
    if (active && !['tham','den'].includes(p.cat)){
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath();
      if (it.rot===0){ ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); }
      else if (it.rot===90){ ctx.moveTo(x,y); ctx.lineTo(x,y+h); }
      else if (it.rot===180){ ctx.moveTo(x,y); ctx.lineTo(x+w,y); }
      else { ctx.moveTo(x+w,y); ctx.lineTo(x+w,y+h); }
      ctx.stroke();
    }
    if (active && w>54 && h>24){
      ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '600 11px '+SANS;
      ctx.fillText(shorten(p.name,w), x+6, y+15);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '10px '+MONO;
      ctx.fillText(Math.round(R.w)+'×'+Math.round(R.d)+' cm', x+6, y+28);
    }
  });
}

function drawOpenings(r, active){
  (r.openings||[]).forEach(o => {
    const a1 = (o.wall==='N'||o.wall==='S') ? X(r.x+o.pos) : X(r.x + (o.wall==='W'?0:r.w));
    ctx.save();
    const isDoor = o.type==='door';
    if (o.type==='open'){ ctx.strokeStyle = active ? 'rgba(234,230,220,.28)' : 'rgba(234,230,220,.12)'; ctx.setLineDash([2,6]); }
    else if (o.type==='railing'){ ctx.strokeStyle = active ? 'rgba(192,138,46,.8)' : 'rgba(192,138,46,.4)'; ctx.setLineDash([5,4]); }
    else if (o.type==='glass'){ ctx.strokeStyle = active ? '#8FC7D9' : 'rgba(143,199,217,.45)'; }
    else ctx.strokeStyle = isDoor ? '#241D17' : (active ? '#7FB0C4' : 'rgba(127,176,196,.45)');
    ctx.lineWidth = isDoor ? 6 : (o.type==='open' ? 3 : 5);
    ctx.beginPath();
    if (o.wall==='N'||o.wall==='S'){
      const yy = o.wall==='N' ? Y(r.y) : Y(r.y+r.d);
      ctx.moveTo(X(r.x+o.pos), yy); ctx.lineTo(X(r.x+o.pos+o.len), yy);
    } else {
      const xx = o.wall==='W' ? X(r.x) : X(r.x+r.w);
      ctx.moveTo(xx, Y(r.y+o.pos)); ctx.lineTo(xx, Y(r.y+o.pos+o.len));
    }
    ctx.stroke(); ctx.setLineDash([]);
    if (isDoor && active){
      const sw = swingRect(o,r);
      ctx.strokeStyle = 'rgba(234,230,220,.5)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.strokeRect(X(r.x+sw.x), Y(r.y+sw.y), L(sw.w), L(sw.d));
      ctx.setLineDash([]);
    }
    if (active){
      const g = openingRect(o,r);
      ctx.fillStyle = 'rgba(234,230,220,.55)'; ctx.font = '10px '+MONO;
      ctx.fillText(o.label+' '+(o.len/100).toFixed(2).replace('.',',')+'m',
        X(r.x+g.x)+4, Y(r.y+g.y) + (o.wall==='N' ? -6 : 16));
    }
    ctx.restore();
  });
}

function drawRoom(r, active){
  ctx.fillStyle = active ? '#302820' : '#241E18';
  ctx.fillRect(X(r.x), Y(r.y), L(r.w), L(r.d));
  (r.fixtures||[]).forEach(f => {
    ctx.fillStyle = 'rgba(234,230,220,'+(active?.10:.06)+')';
    ctx.fillRect(X(r.x+f.x), Y(r.y+f.y), L(f.w), L(f.d));
    ctx.strokeStyle = 'rgba(234,230,220,'+(active?.35:.18)+')';
    ctx.setLineDash([4,4]); ctx.lineWidth = 1;
    ctx.strokeRect(X(r.x+f.x), Y(r.y+f.y), L(f.w), L(f.d));
    ctx.setLineDash([]);
    if (active){
      ctx.fillStyle = 'rgba(234,230,220,.5)'; ctx.font = '11px '+MONO;
      ctx.fillText(f.name, X(r.x+f.x)+6, Y(r.y+f.y)+16);
    }
  });
  drawItems(r, active);
  ctx.strokeStyle = active ? '#EAE6DC' : 'rgba(234,230,220,.42)';
  ctx.lineWidth = active ? 4 : 2;
  ctx.strokeRect(X(r.x), Y(r.y), L(r.w), L(r.d));
  drawOpenings(r, active);
  ctx.fillStyle = active ? 'rgba(234,230,220,.9)' : 'rgba(234,230,220,.5)';
  ctx.font = (active ? '600 12px ' : '11px ') + SANS;
  ctx.fillText(r.name, X(r.x)+8, Y(r.y)+L(r.d)-16);
  ctx.font = '10px '+MONO;
  ctx.fillStyle = 'rgba(234,230,220,.45)';
  ctx.fillText((r.w/100).toFixed(2).replace('.',',')+' × '+(r.d/100).toFixed(2).replace('.',',')+' m',
    X(r.x)+8, Y(r.y)+L(r.d)-4);
}

function draw(){
  const P = plan();
  const W = cv.parentElement.clientWidth, H = cv.parentElement.clientHeight;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#1C1712'; ctx.fillRect(0,0,W,H);

  for (let g=0; g<=Math.max(P.w,P.d)+400; g+=10){
    ctx.strokeStyle = (g%100===0) ? 'rgba(192,138,46,.17)' : 'rgba(192,138,46,.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(g),Y(-200)); ctx.lineTo(X(g),Y(P.d+200)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(-200),Y(g)); ctx.lineTo(X(P.w+200),Y(g)); ctx.stroke();
  }
  // sàn chung của căn hộ (hành lang, tiền phòng)
  ctx.fillStyle = 'rgba(234,230,220,.05)';
  ctx.fillRect(X(0), Y(0), L(P.w), L(P.d));

  (P.voids||[]).forEach(v => {
    ctx.fillStyle = 'rgba(234,230,220,.09)';
    ctx.fillRect(X(v.x), Y(v.y), L(v.w), L(v.d));
    ctx.strokeStyle = 'rgba(234,230,220,.3)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(X(v.x), Y(v.y), L(v.w), L(v.d));
    ctx.fillStyle = 'rgba(234,230,220,.5)'; ctx.font = '10px '+MONO;
    ctx.fillText(v.name, X(v.x)+6, Y(v.y)+15);
  });

  P.rooms.forEach(r => { if (r.id !== S.roomId) drawRoom(r,false); });
  drawRoom(room(), true);

  // vỏ căn hộ + cửa chính
  ctx.strokeStyle = 'rgba(234,230,220,.85)'; ctx.lineWidth = 2;
  ctx.setLineDash([10,6]);
  ctx.strokeRect(X(0), Y(0), L(P.w), L(P.d));
  ctx.setLineDash([]);
  if (P.entry){
    const e = P.entry;
    ctx.strokeStyle = '#D8695B'; ctx.lineWidth = 7; ctx.beginPath();
    if (e.wall==='N'||e.wall==='S'){
      const yy = e.wall==='N' ? Y(0) : Y(P.d);
      ctx.moveTo(X(e.pos), yy); ctx.lineTo(X(e.pos+e.len), yy);
      ctx.stroke();
      ctx.fillStyle = '#D8695B'; ctx.font = '600 10px '+MONO;
      ctx.fillText('CỬA CHÍNH', X(e.pos), yy + (e.wall==='N' ? -10 : 20));
    } else {
      const xx = e.wall==='W' ? X(0) : X(P.w);
      ctx.moveTo(xx, Y(e.pos)); ctx.lineTo(xx, Y(e.pos+e.len));
      ctx.stroke();
      ctx.fillStyle = '#D8695B'; ctx.font = '600 10px '+MONO;
      ctx.fillText('CỬA CHÍNH', xx + (e.wall==='W' ? -74 : 8), Y(e.pos)-6);
    }
  }
  drawRuler(P);
  drawCompass(W,H);
}
function drawRuler(P){
  ctx.strokeStyle = 'rgba(234,230,220,.4)'; ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(234,230,220,.6)'; ctx.font = '10px '+MONO;
  const y = Y(P.d)+28;
  ctx.beginPath(); ctx.moveTo(X(0),y); ctx.lineTo(X(P.w),y);
  ctx.moveTo(X(0),y-4); ctx.lineTo(X(0),y+4);
  ctx.moveTo(X(P.w),y-4); ctx.lineTo(X(P.w),y+4); ctx.stroke();
  ctx.fillText((P.w/100).toFixed(2).replace('.',',')+' m', (X(0)+X(P.w))/2-20, y+15);
  const x = X(P.w)+28;
  ctx.beginPath(); ctx.moveTo(x,Y(0)); ctx.lineTo(x,Y(P.d)); ctx.stroke();
  ctx.save(); ctx.translate(x+14,(Y(0)+Y(P.d))/2+20); ctx.rotate(-Math.PI/2);
  ctx.fillText((P.d/100).toFixed(2).replace('.',',')+' m',0,0); ctx.restore();
}
function drawCompass(W,H){
  const cx = W-46, cy = 44, R = 20;
  ctx.strokeStyle = 'rgba(192,138,46,.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
  const ang = -HUONG.indexOf(S.huong)*Math.PI/4 - Math.PI/2;
  ctx.strokeStyle = '#D8695B'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ang)*R, cy+Math.sin(ang)*R); ctx.stroke();
  ctx.fillStyle = 'rgba(234,230,220,.75)'; ctx.font = '9px '+MONO;
  ctx.fillText('B', cx-3, cy-R-5);
  ctx.fillText(S.huong, cx-22, cy+R+14);
}
/* các cặp đồ vốn phải kê sát nhau — không tính là lối đi hẹp */
const CLOSE_OK = [
  ['sofa','bantra'],['sofa','tham'],['sofa','den'],['bantra','tham'],
  ['banlam','ghe'],['banan','ghe'],['giuong','tab'],['giuong','den'],
  ['banlam','kesach'],['ketivi','tham'],['tuquanao','tab']
];

function runChecks(rid){
  rid = rid || S.roomId;
  const r = roomById(rid), out = [];
  const items = itemsIn(rid);

  if (!items.length){
    return [{lv:'warn', t:'Phòng đang trống', s:'Thêm đồ từ danh mục bên trái, hoặc bấm “Bố trí tự động trong ngân sách”.'}];
  }

  // 1. lọt ranh giới phòng
  const outside = items.filter(a => {
    const A = rectOf(a);
    return A.x < -1 || A.y < -1 || A.x+A.w > r.w+1 || A.y+A.d > r.d+1;
  });
  out.push(outside.length
    ? {lv:'err', t:outside.length + ' món nằm ngoài phòng', s:'Kéo lại vào trong khung tường.'}
    : {lv:'ok',  t:'Mọi món đều nằm gọn trong phòng', s:'Kích thước phòng ' + (r.w/100).toFixed(2) + ' × ' + (r.d/100).toFixed(2) + ' m.'});

  // 2. chồng lấn
  let clash = 0;
  for (let i=0;i<items.length;i++) for (let j=i+1;j<items.length;j++){
    if (byId(items[i].id).cat==='tham' || byId(items[j].id).cat==='tham') continue;
    if (overlap(rectOf(items[i]), rectOf(items[j]))) clash++;
  }
  out.push(clash
    ? {lv:'err', t:clash + ' cặp đồ đang chồng lên nhau', s:'Hai món không thể cùng chiếm một chỗ.'}
    : {lv:'ok',  t:'Không có món nào chồng nhau', s:''});

  // 3. lối đi tối thiểu 60 cm (bỏ qua các cặp vốn phải kê sát nhau)
  let narrow = null;
  for (let i=0;i<items.length && !narrow;i++) for (let j=i+1;j<items.length;j++){
    const a = items[i], b = items[j];
    const ca = byId(a.id).cat, cbb = byId(b.id).cat;
    if (byId(a.id).mount || byId(b.id).mount) continue;
    if (['den','bantra'].includes(ca) || ['den','bantra'].includes(cbb) || noFloor(byId(a.id)) || noFloor(byId(b.id))) continue;
    if (CLOSE_OK.some(pr => (pr[0]===ca && pr[1]===cbb) || (pr[0]===cbb && pr[1]===ca))) continue;
    const g = gapBetween(rectOf(a), rectOf(b));
    if (g > 0 && g < 60){ narrow = {a,b,g}; break; }
  }
  out.push(narrow
    ? {lv:'warn', t:'Lối đi hẹp ' + Math.round(narrow.g) + ' cm', s:'Giữa ' + byId(narrow.a.id).name + ' và ' + byId(narrow.b.id).name + '. Tối thiểu nên 60 cm để đi lại thoải mái.'}
    : {lv:'ok',  t:'Lối đi đều đạt tối thiểu 60 cm', s:''});

  // 4. chắn cửa
  const doors = (r.openings||[]).filter(o => o.type === 'door' || o.type === 'open');
  const blocked = [];
  doors.forEach(o => {
    const sw = o.type === 'open' ? passRect(o, r, 48) : swingRect(o, r);
    items.forEach(a => {
      if (noFloor(byId(a.id))) return;
      if (overlap(rectOf(a), sw)) blocked.push(byId(a.id).name + ' chắn ' + o.label.toLowerCase());
    });
  });
  out.push(blocked.length
    ? {lv:'err', t:'Đồ chắn lối đi / vùng mở cửa', s:blocked.join('; ') + '.'}
    : {lv:'ok',  t:'Cửa mở được hết cánh', s:''});

  // 5. lọt cửa khi vận chuyển
  const swingDoors = (r.openings||[]).filter(o => o.type === 'door');
  const minDoor = plan().entry ? plan().entry.len : (swingDoors.length ? Math.min(...swingDoors.map(o => o.len)) : 90);
  const tooBig = items.filter(a => { const p = byId(a.id); return Math.min(p.w, p.d) > minDoor - 5 && !p.knock && !noFloor(p); });
  out.push(tooBig.length
    ? {lv:'warn', t:'Khó khiêng qua cửa chính ' + minDoor + ' cm', s:tooBig.map(a => byId(a.id).name).join('; ') + ' là hàng nguyên khối, không tháo rời được. Cần đo lại lồng thang máy trước khi đặt.'}
    : {lv:'ok',  t:'Mọi món khiêng lọt cửa chính ' + minDoor + ' cm', s:''});

  // 6. chắn cửa sổ bằng đồ cao
  const wins = (r.openings||[]).filter(o => o.type === 'window' || o.type === 'glass');
  const dark = [];
  wins.forEach(o => {
    const g = openingRect(o, r);
    const zone = {x:g.x - 10, y:g.y - 10, w:g.w + 20, d:g.d + 60};
    items.forEach(a => { if (byId(a.id).h >= 120 && overlap(rectOf(a), zone)) dark.push(byId(a.id).name); });
  });
  out.push(dark.length
    ? {lv:'warn', t:'Đồ cao che cửa sổ', s:dark.join('; ') + ' cao trên 1,2 m đang chắn nguồn sáng tự nhiên.'}
    : {lv:'ok',  t:'Không món cao nào chắn cửa sổ', s:''});

  /* ---- phong thuỷ ---- */
  const cm = cungMenh(S.year);
  const na = napAmOf(S.year);
  const plantPicks = na.cay.map(name => CATALOG.find(x => x.cat==='cay' && x.name===name)).filter(Boolean);
  const plantHtml = plantPicks.length
    ? '<span class="plantrow">' + plantPicks.map(pl =>
        `<span class="plantpick">${pl.name} · ${vnd(pl.price)}
          <button type="button" onclick="addItem('${pl.id}')">+ Thêm</button>
          <a href="${buyUrl(pl)}" target="_blank" rel="noopener noreferrer">Mua ↗</a></span>`).join('') + '</span>'
    : na.cay.join(', ');
  out.push({lv:'ok',
    t:'Mệnh ' + na.ten + ' (' + na.label + ') — năm ' + na.canChi,
    s:'Màu hợp: ' + na.mauHop.map(m=>m.name).join(', ') + '. Nên tránh: ' + na.mauKy.map(m=>m.name).join(', ') + '. '
      + na.ly + ' Cây hợp mệnh: ' + plantHtml});
  const bed = items.find(a => byId(a.id).cat === 'giuong');
  if (bed){
    const e = headEdge(bed), h = huongCua(e);
    const good = cm.tot.includes(h);
    out.push({lv: good ? 'ok' : 'warn',
      t:'Đầu giường quay hướng ' + h + (good ? ' — hợp mệnh' : ' — chưa hợp mệnh'),
      s:'Bạn thuộc cung ' + cm.ten + ' (' + cm.nhom + '). Hướng tốt: ' + cm.tot.join(', ') + '.'});

    // giường xung cửa: chỉ tính khi cửa ở tường đối diện đầu giường
    const OPP = {N:'S', S:'N', W:'E', E:'W'};
    const footWall = OPP[e];
    let xung = false;
    doors.forEach(o => {
      if (o.type !== 'door' || o.wall !== footWall) return;
      const g = openingRect(o, r), B = rectOf(bed);
      if (o.wall==='N'||o.wall==='S'){ if (B.x < g.x+g.w && g.x < B.x+B.w) xung = true; }
      else { if (B.y < g.y+g.d && g.y < B.y+B.d) xung = true; }
    });
    out.push(xung
      ? {lv:'warn', t:'Chân giường chĩa thẳng ra cửa', s:'Dân gian gọi là “xung cửa”. Xoay giường hoặc dịch lệch khỏi trục cửa là xong.'}
      : {lv:'ok',  t:'Giường không xung cửa', s:''});

    // gương đối diện chân giường: gương nằm áp đúng tường đối diện đầu giường
    // và chắn ngay trước chân giường — kiêng kỵ phổ biến trong phong thuỷ dân gian
    const mirrors = items.filter(a => byId(a.id).cat === 'guong');
    if (mirrors.length){
      const B = rectOf(bed);
      const nearWall = (rect, wall) => {
        const T = 20;
        if (wall==='N') return rect.y <= T;
        if (wall==='S') return rect.y + rect.d >= r.d - T;
        if (wall==='W') return rect.x <= T;
        return rect.x + rect.w >= r.w - T;
      };
      const facing = mirrors.some(m => {
        const M = rectOf(m);
        if (!nearWall(M, footWall)) return false;
        return (footWall==='N'||footWall==='S')
          ? (M.x < B.x+B.w && B.x < M.x+M.w)
          : (M.y < B.y+B.d && B.y < M.y+M.d);
      });
      out.push(facing
        ? {lv:'warn', t:'Gương đối diện chân giường', s:'Dân gian cho rằng gương soi thẳng vào người đang ngủ dễ giật mình, hao khí. Xoay gương sang tường bên, hoặc dùng gương có cửa che khi không dùng.'}
        : {lv:'ok',  t:'Không có gương đối diện chân giường', s:''});
    }
  }
  const altar = items.find(a => byId(a.id).cat === 'bantho');
  if (altar){
    const A = rectOf(altar);
    let xau = null;
    (r.fixtures||[]).forEach(f => {
      if (!['WC','Bếp'].includes(f.name)) return;
      const near = gapBetween(A, {x:f.x,y:f.y,w:f.w,d:f.d});
      if (near < 40) xau = f.name;
    });
    out.push(xau
      ? {lv:'err', t:'Bàn thờ sát ' + xau.toLowerCase(), s:'Không đặt bàn thờ tựa hoặc kề tường nhà vệ sinh / bếp.'}
      : {lv:'ok',  t:'Vị trí bàn thờ đạt yêu cầu', s:'Tựa tường đặc, không kề khu vệ sinh và bếp.'});
  } else if (r.type === 'khach'){
    out.push({lv:'warn', t:'Chưa bố trí bàn thờ', s:'Phần lớn hộ gia đình Việt cần chỗ đặt bàn thờ trong phòng khách. Có sẵn trong danh mục.'});
  }

  /* hạng mục lẽ ra phải có trong phòng (công thức gốc, mức ngân sách hiện tại,
     hoặc yêu cầu thêm ở mục 2) nhưng cuối cùng KHÔNG xếp được món nào — kể cả
     khi ngân sách đủ mua (vd phòng quá chật vì tủ âm tường + cửa sổ đã chiếm
     hết tường), để không bị mất món trong im lặng mà không rõ vì sao. */
  const missing = neededCats(r).filter(c => !items.some(a => byId(a.id).cat === c));
  if (missing.length){
    out.push({lv:'warn', t:'Chưa xếp được: ' + missing.map(catLabel).join(', '),
      s:'Phòng không còn đủ diện tích tường trống cho món này (có thể do ngân sách chưa đủ, hoặc phòng đã chật). Thử bỏ bớt đồ khác trong phòng, hoặc chọn đồ nhỏ hơn ở mục 4.'});
  }
  return out;
}

/* =========================================================
   7. MÁY BỐ TRÍ THEO NGÂN SÁCH
   ========================================================= */
function fitsRoom(p, r){
  const M = 30;
  const a = (p.w <= r.w - M && p.d <= r.d - M);
  const b = (p.d <= r.w - M && p.w <= r.d - M);
  return a || b;
}
/* "độ to" của 1 món — hầu hết so theo diện tích đáy (w×d), riêng đèn/táp đầu
   giường (HEIGHT_SIZE_CATS) so theo chiều cao vì đó mới là thứ trông "to/nhỏ". */
const sizeMetric = p => HEIGHT_SIZE_CATS.includes(p.cat) ? p.h : p.w * p.d;
const CAT_MEDIAN = {};
function catMedianSize(cat){
  if (CAT_MEDIAN[cat] != null) return CAT_MEDIAN[cat];
  const vals = CATALOG.filter(p => p.cat === cat).map(sizeMetric).sort((a,b) => a-b);
  return CAT_MEDIAN[cat] = vals[Math.floor(vals.length/2)] || 0;
}
function hexToRgb(hex){
  const n = parseInt(hex.replace('#',''), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
/* quy 1 mã màu sản phẩm về 1 trong các "họ màu" tiếng Việt gần nhất */
function colorFamily(hex){
  const [r,g,b] = hexToRgb(hex);
  let best=null, bd=Infinity;
  for (const key in COLOR_FAMILIES){
    const [cr,cg,cb] = COLOR_FAMILIES[key].rgb;
    const d = (r-cr)**2 + (g-cg)**2 + (b-cb)**2;
    if (d < bd){ bd = d; best = key; }
  }
  return best;
}
/* điểm phạt theo điều kiện người dùng (S.need) — càng thấp càng được ưu tiên
   chọn trước trong cùng hạng mục, nhưng KHÔNG loại món nào, chỉ sắp lại thứ tự
   nên máy vẫn luôn tìm được món phù hợp ngân sách nếu món ưu tiên quá đắt. */
function needPenalty(p){
  const n = S.need; let pen = 0;
  const sp = n.sizePref[p.cat];
  if (sp){
    const med = catMedianSize(p.cat), val = sizeMetric(p);
    if (sp === 'big'   && val <= med) pen++;
    if (sp === 'small' && val >= med) pen++;
  }
  const cp = n.colorPref[p.cat] || n.colorPref._all;
  if (cp && colorFamily(p.color) !== cp) pen++;
  if (n.pc){
    if (p.cat==='banlam' && p.d < 55)  pen++;
    if (p.cat==='ghe'    && p.h < 110) pen++;
  }
  if (n.people >= 3 && p.cat==='giuong' && p.w < 165) pen++;
  if (n.people <= 1 && p.cat==='giuong' && p.w >= 165) pen++;
  if (n.people >= 3 && p.cat==='banan'  && p.w < 120) pen++;
  return pen;
}
function pickSet(budget, cats){
  const r = room(), chosen = [];
  const pool = cats.map(c => ({
    cat:c,
    opts: CATALOG.filter(p => p.cat === c && fitsRoom(p, r))
                 .sort((a,b) => (needPenalty(a)-needPenalty(b)) || ((a.price+a.ship) - (b.price+b.ship)))
  })).filter(g => g.opts.length);

  const cost = p => p.price + p.ship;
  // vòng 1: lấy rẻ nhất, bỏ bớt hạng mục nếu không đủ tiền
  let left = budget, taken = [];
  for (const g of pool){
    const cheap = g.opts[0];
    if (cost(cheap) <= left){ taken.push({g, p:cheap}); left -= cost(cheap); }
  }
  // vòng 2: nâng cấp dần theo thứ tự ưu tiên — không nâng cấp vượt sang mức
  // penalty cao hơn (vd từ "món nhỏ theo yêu cầu" sang "món to không theo yêu cầu")
  // dù có đủ tiền, để yêu cầu kích thước/màu không bị ngân sách rộng nuốt mất.
  let changed = true;
  while (changed){
    changed = false;
    for (const t of taken){
      const cur = t.g.opts.indexOf(t.p);
      const next = t.g.opts[cur + 1];
      if (next && needPenalty(next) <= needPenalty(t.p) && cost(next) - cost(t.p) <= left){
        left -= cost(next) - cost(t.p); t.p = next; changed = true;
      }
    }
  }
  taken.forEach(t => chosen.push(t.p));
  return chosen;
}

/* ---- công cụ đặt đồ: tìm chỗ trống thật trên tường ---- */
function blockedZones(avoidWindow){
  const r = room(), z = [];
  (r.fixtures||[]).forEach(f => z.push({x:f.x, y:f.y, w:f.w, d:f.d}));
  (r.openings||[]).forEach(o => {
    if (o.type === 'door') z.push(swingRect(o, r));
    else if (o.type === 'open') z.push(passRect(o, r, 55));
    else if (o.type === 'railing'){ /* lan can: không cấm */ }
    else if (avoidWindow){
      const g = openingRect(o, r);
      z.push({x:g.x-5, y:g.y-5, w:g.w+10, d:g.d+62});
    }
  });
  return z;
}
function isFree(R, gap, avoidWindow){
  const r = room();
  if (R.x < 0 || R.y < 0 || R.x + R.w > r.w || R.y + R.d > r.d) return false;
  for (const z of blockedZones(avoidWindow)) if (overlap(R, z)) return false;
  for (const it of items()){
    if (byId(it.id).cat === 'tham') continue;
    const O = rectOf(it);
    if (overlap(R, {x:O.x-gap, y:O.y-gap, w:O.w+2*gap, d:O.d+2*gap})) return false;
  }
  return true;
}
const ROT = {N:0, E:270, S:180, W:90};

/* kê áp tường, ưu tiên giữa tường; trả về món đã đặt hoặc null */
function placeOnWall(p, walls, opt){
  opt = opt || {};
  const r = room(), M = opt.margin != null ? opt.margin : 8;
  const gap = opt.gap != null ? opt.gap : 12;
  const avoidWindow = opt.avoidWindow != null ? opt.avoidWindow : (p.h >= 110);
  for (const wall of walls){
    const rot = ROT[wall];
    const dm = dims({id:p.id, rot});
    const horiz = (wall === 'N' || wall === 'S');
    const span = horiz ? r.w - dm.w - M : r.d - dm.d - M;
    if (span < M) continue;
    const fixed = wall === 'N' ? M
                : wall === 'S' ? r.d - dm.d - M
                : wall === 'W' ? M
                : r.w - dm.w - M;
    const geomMid = (horiz ? r.w - dm.w : r.d - dm.d) / 2;
    /* căn theo 1 TRỤC CÓ SẴN (vd tivi đã đặt trước) thay vì tự căn giữa bức
       tường của riêng nó — để sofa/thảm/bàn trà thẳng hàng với tivi dù tivi
       và sofa nằm trên 2 bức tường khác nhau, không lệch trục nhau. Chỉ áp
       dụng khi bức tường đang xét CÙNG HƯỚNG (ngang/dọc) với trục cần theo. */
    const mid = (opt.alignTo && opt.alignTo.axis === (horiz ? 'x' : 'y'))
      ? Math.max(M, Math.min(span, opt.alignTo.value - (horiz ? dm.w : dm.d)/2))
      : geomMid;
    const cands = [];
    for (let v = M; v <= span; v += 5) cands.push(v);
    cands.sort((x,y) => Math.abs(x-mid) - Math.abs(y-mid));
    const doorSpans = (r.openings||[]).filter(o => o.type === 'door').map(o => openingRect(o, r));
    for (const v of cands){
      const R = horiz ? {x:v, y:fixed, w:dm.w, d:dm.d} : {x:fixed, y:v, w:dm.w, d:dm.d};
      if (opt.notInFrontOfDoor && doorSpans.some(g =>
            (g.w < g.d) ? (R.y < g.y+g.d && g.y < R.y+R.d) : (R.x < g.x+g.w && g.x < R.x+R.w))) continue;
      if (opt.awayFrom && (r.fixtures||[]).some(f =>
            opt.awayFrom.includes(f.name) &&
            gapBetween(R, {x:f.x, y:f.y, w:f.w, d:f.d}) < 50)) continue;
      if (isFree(R, gap, avoidWindow)){
        const it = {uid:UID++, id:p.id, x:R.x, y:R.y, rot};
        items().push(it); return it;
      }
    }
  }
  return null;
}
/* đặt quanh một điểm mong muốn, nới dần ra nếu vướng */
function placeNear(p, x, y, rot, gap){
  rot = rot || 0; gap = gap != null ? gap : 15;
  const dm = dims({id:p.id, rot});
  for (let step = 0; step <= 40; step++){
    for (const [sx,sy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
      const R = {x:Math.round(x + sx*step*10), y:Math.round(y + sy*step*10), w:dm.w, d:dm.d};
      if (isFree(R, step > 12 ? 0 : gap, p.h >= 110)){
        const it = {uid:UID++, id:p.id, x:R.x, y:R.y, rot};
        items().push(it); return it;
      }
    }
  }
  return null;
}
function placeCorner(p){
  const r = room(), M = 10, dm = dims({id:p.id, rot:0});
  const spots = [
    [r.w-dm.w-M, r.d-dm.d-M], [M, r.d-dm.d-M], [r.w-dm.w-M, M], [M, M]
  ];
  for (const [x,y] of spots){
    if (isFree({x, y, w:dm.w, d:dm.d}, 8, p.h >= 110)){
      const it = {uid:UID++, id:p.id, x, y, rot:0}; items().push(it); return it;
    }
  }
  return placeNear(p, r.w/2, r.d/2, 0, 8);
}
/* thảm nằm dưới sàn, không xét va chạm */
function placeRug(p, cx, cy){
  const r = room();
  const it = {uid:UID++, id:p.id, rot:0,
    x: Math.max(0, Math.min(Math.round(cx - p.w/2), r.w - p.w)),
    y: Math.max(0, Math.min(Math.round(cy - p.d/2), r.d - p.d))};
  items().unshift(it); return it;
}
const front = it => { const R = rectOf(it); return {top:R.y, bot:R.y + R.d, cx:R.x + R.w/2}; };


/* danh mục cần cho 1 phòng = công thức gốc + phần thêm theo điều kiện người dùng
   (S.need). Việc "phòng master" là nơi nhận góc làm việc/PC/tivi treo là quy ước
   riêng của căn hộ mẫu này — nếu sau này có mặt bằng khác, khối này tự bỏ qua. */
/* phòng nào nhận góc làm việc/PC — mặc định là master, nhưng nếu người dùng chỉ
   cần 1 giường thì phòng +1 (không còn giường) hợp lý hơn để đặt bàn làm việc.
   Tivi treo phòng ngủ thì luôn vào master vì đó mới là phòng còn giường thật. */
const deskRoomId = () => S.need.oneBedOnly ? 'plus1' : 'master';
/* mức ngân sách hiện tại (0=Tiết kiệm .. 3=Cao cấp) — theo tổng ngân sách
   cả căn hộ người dùng nhập, tra trong BUDGET_TIERS (data.js). */
function budgetTierIdx(){
  const i = BUDGET_TIERS.findIndex(t => S.budget <= t.max);
  return i === -1 ? BUDGET_TIERS.length - 1 : i;
}
const budgetTier = () => BUDGET_TIERS[budgetTierIdx()];
function neededCats(r){
  const tier = budgetTierIdx();
  const base = (r.recipe || RECIPES[r.type] || RECIPES.khach);
  const core = RECIPE_CORE[r.type] || RECIPE_CORE.khach;
  const extra = RECIPE_EXTRA[r.type] || RECIPE_EXTRA.khach;
  /* 0 Tiết kiệm: chỉ đồ cốt lõi · 1 Tiêu chuẩn: đúng bộ mặc định (như trước
     giờ) · 2 Đầy đủ: bộ mặc định + 1 món trang trí · 3 Cao cấp: + tất cả */
  const cats = (tier === 0 ? core
              : tier === 1 ? base
              : tier === 2 ? base.concat(extra.slice(0,1))
              : base.concat(extra)).slice();
  const add = c => { if (!cats.includes(c)) cats.push(c); };
  const rm  = c => { const i = cats.indexOf(c); if (i > -1) cats.splice(i, 1); };
  if (S.need.oneBedOnly && r.id === 'plus1'){ rm('giuong'); rm('tab'); }
  if ((S.need.workspace || S.need.pc) && r.id === deskRoomId()){ add('banlam'); add('ghe'); }
  if (S.need.bedroomTv && r.id === 'master') add('ketivi');
  if (r.type === 'khach'){ S.need.must.forEach(add); S.need.autoMust.forEach(add); }
  S.need.exclude.forEach(rm);
  return cats;
}
function autoLayout(budget, silent){
  const r = room();
  const cats = neededCats(r);
  const picks = pickSet(budget != null ? budget : S.budget, cats);
  S.store[key(S.planId, r.id)] = [];
  S.sel = null;
  const get = c => picks.find(p => p.cat === c);
  /* thử món đã chọn; nếu không kê lọt thì lùi dần sang món rẻ hơn cùng loại */
  const alts = c => {
    const first = get(c); if (!first) return [];
    const rest = CATALOG.filter(p => p.cat === c && p.id !== first.id && fitsRoom(p, r))
                        .sort((a,b) => (b.price+b.ship) - (a.price+a.ship));
    return [first].concat(rest);
  };
  const onWall = (c, walls, opt) => {
    for (const p of alts(c)){ const it = placeOnWall(p, walls, opt); if (it) return it; }
    return null;
  };
  const placed = new Set();

  if (r.type === 'khach'){
    const tv = get('ketivi'), sofa = get('sofa'), tra = get('bantra'),
          tham = get('tham'), den = get('den'), tho = get('bantho');
    const itTv   = tv   ? onWall('ketivi', ['N','S','W','E'], {gap:0,  avoidWindow:false}) : null;
    /* tivi đặt trước — nếu rơi vào tường ngang (N/S) thì lấy TRỤC X thật của
       nó để ép sofa (và sau đó thảm/bàn trà) căn thẳng hàng, thay vì để sofa
       tự căn giữa bức tường của riêng nó rồi lệch trục với tivi. */
    const tvAlign = (itTv && (itTv.rot === 0 || itTv.rot === 180))
      ? {axis:'x', value: front(itTv).cx} : null;
    const itSofa = sofa ? onWall('sofa',   ['S','N','W','E'], {gap:60, avoidWindow:false, alignTo: tvAlign}) : null;
    placed.add('ketivi').add('sofa');
    let midY = r.d/2, cx = r.w/2;
    if (itSofa){
      cx = front(itSofa).cx;
      midY = front(itSofa).top - 45 - (tra ? tra.d/2 : 30);
      if (itTv) midY = Math.max(midY, front(itTv).bot + 60 + (tra ? tra.d/2 : 30));
    } else if (itTv){ cx = front(itTv).cx; midY = front(itTv).bot + 90; }
    if (tham) placeRug(tham, cx, midY);
    if (tra)  placeNear(tra, cx - tra.w/2, midY - tra.d/2, 0, 0);
    if (tho)  onWall('bantho', ['N','E','W','S'], {gap:14, avoidWindow:true, awayFrom:['WC','Bếp']});
    if (den)  placeCorner(den);
    placed.add('tham').add('bantra').add('bantho').add('den');
  }
  else if (r.type === 'ngu'){
    const bed = get('giuong'), tu = get('tuquanao'), tab = get('tab'), den = get('den');
    const itBed = bed ? (onWall('giuong', ['N','W','E','S'], {gap:30, avoidWindow:true, notInFrontOfDoor:true})
                       || onWall('giuong', ['N','W','E','S'], {gap:30, avoidWindow:true})
                       || onWall('giuong', ['N','W','E','S'], {gap:12})) : null;
    if (tab && itBed){ const B = rectOf(itBed); placeNear(tab, B.x - tab.w - 4, B.y, 0, 0); }
    /* thử khoảng cách rộng trước, hẹp dần nếu phòng chật (giường to + tủ âm
       tường + cửa sổ đã ăn hết diện tích tường) — giống cách giường đã làm
       ở trên, để đỡ bỏ sót tủ dù ngân sách thừa sức mua. */
    if (tu)  onWall('tuquanao', ['S','W','E','N'], {gap:20}) || onWall('tuquanao', ['S','W','E','N'], {gap:8});
    if (den) placeCorner(den);
    placed.add('giuong').add('tab').add('tuquanao').add('den');
    if (S.need.workspace || S.need.pc){
      const ban = get('banlam'), ghe = get('ghe');
      /* đặt cả bộ (bàn + ghế) hoặc không đặt gì — 1 cái ghế trơ trọi không
         có bàn thì không phải là "góc làm việc" người dùng yêu cầu. Thử đệm
         hẹp hơn nếu phòng đã chật (giống cách máy vẫn cố kê bằng được giường). */
      const itBan = ban ? (onWall('banlam', ['E','S','W','N'], {gap:25, avoidWindow:false})
                        || onWall('banlam', ['E','S','W','N'], {gap:10, avoidWindow:false})) : null;
      if (itBan && ghe){
        const B = rectOf(itBan);
        placeNear(ghe, B.x+B.w/2-ghe.w/2, B.y+B.d+6, 0, 0)
          || onWall('ghe', ['S','W','E','N'], {gap:10, avoidWindow:false});
      }
      placed.add('banlam').add('ghe');
    }
    if (S.need.bedroomTv){
      onWall('ketivi', ['N','S','W','E'], {gap:20, avoidWindow:false})
        || onWall('ketivi', ['N','S','W','E'], {gap:8, avoidWindow:false});
      placed.add('ketivi');
    }
  }
  else if (r.type === 'studio'){
    const bed = get('giuong'), tu = get('tuquanao'), ban = get('banlam'),
          ghe = get('ghe'), tv = get('ketivi');
    if (bed) placeOnWall(bed, ['N','W','E','S'], {gap:25, avoidWindow:true, notInFrontOfDoor:true}) || placeOnWall(bed, ['N','W','E','S'], {gap:25, avoidWindow:true});
    if (tu)  placeOnWall(tu,  ['W','E','S','N'], {gap:20});
    const itBan = ban ? placeOnWall(ban, ['E','S','W','N'], {gap:25, avoidWindow:false}) : null;
    if (ghe && itBan){ const B = rectOf(itBan); placeNear(ghe, B.x+B.w/2-ghe.w/2, B.y+B.d+6, 0, 0); }
    if (tv) placeOnWall(tv, ['S','N','W','E'], {gap:25, avoidWindow:false});
    placed.add('giuong').add('tuquanao').add('banlam').add('ghe').add('ketivi');
  }
  else {
    const bed = get('giuong'), ban = get('banlam'), ghe = get('ghe'),
          tu = get('tuquanao'), ke = get('kesach');
    if (bed) placeOnWall(bed, ['N','W','E','S'], {gap:25, avoidWindow:true});
    if (tu)  placeOnWall(tu,  ['E','W','S','N'], {gap:20});
    const itBan = ban ? placeOnWall(ban, ['S','W','E','N'], {gap:25, avoidWindow:false}) : null;
    if (ghe && itBan){ const B = rectOf(itBan); placeNear(ghe, B.x+B.w/2-ghe.w/2, B.y-ghe.d-6, 0, 0); }
    if (ke)  placeOnWall(ke, ['W','E','N','S'], {gap:20});
    placed.add('giuong').add('banlam').add('ghe').add('tuquanao').add('kesach');
  }
  /* các hạng mục được chọn nhưng chưa có chỗ (vd món "bắt buộc phải có" thêm
     ngoài công thức gốc) — kê tạm sát tường trống gần nhất, nới đệm nếu chật */
  cats.forEach(c => {
    if (placed.has(c) || !get(c)) return;
    onWall(c, ['S','W','E','N'], {gap:20, avoidWindow:false})
      || onWall(c, ['S','W','E','N'], {gap:8, avoidWindow:false});
  });
  if (!silent) renderAll();
}

/* bố trí toàn bộ căn hộ: chia ngân sách theo tỉ trọng từng phòng */
function autoLayoutAll(){
  const P = plan(), keep = S.roomId;
  const rs = liveRooms();
  const tot = rs.reduce((a,r) => a + (WEIGHT[r.type]||.5), 0);
  rs.forEach(r => {
    S.roomId = r.id;
    autoLayout(S.budget * (WEIGHT[r.type]||.5) / tot, true);
  });
  S.roomId = keep; S.sel = null;
  renderAll();
}

/* =========================================================
   8. GIAO DIỆN
   ========================================================= */
const $ = s => document.querySelector(s);

function buildSelects(){
  const groups = [...new Set(PLANS.map(p => p.group))];
  $('#selPlan').innerHTML = groups.map(g =>
    `<optgroup label="${g}">` +
    PLANS.filter(p => p.group===g).map(p => `<option value="${p.id}">${p.name}</option>`).join('') +
    `</optgroup>`).join('');
  $('#selPlan').value = S.planId;
  const rooms = liveRooms();
  if (!rooms.some(r => r.id === S.roomId)) S.roomId = rooms[0].id;
  $('#selRoom').innerHTML = rooms.map(r =>
    `<option value="${r.id}">${r.name} · ${(r.w/100).toFixed(2)}×${(r.d/100).toFixed(2)} m</option>`).join('');
  $('#selRoom').value = S.roomId;
  $('#selHuong').innerHTML = HUONG.map(h => `<option value="${h}">${h}</option>`).join('');
  $('#selHuong').value = S.huong;
  const wallGroups = [...new Set(WALL_FINISHES.map(w => w.group))];
  $('#selWall').innerHTML = wallGroups.map(g =>
    `<optgroup label="${g}">` +
    WALL_FINISHES.filter(w => w.group===g).map(w => `<option value="${w.id}">${w.label}</option>`).join('') +
    `</optgroup>`).join('');
  $('#selWall').value = S.wallFinish;
  const floorGroups = [...new Set(FLOOR_FINISHES.map(f => f.group))];
  $('#selFloor').innerHTML = floorGroups.map(g =>
    `<optgroup label="${g}">` +
    FLOOR_FINISHES.filter(f => f.group===g).map(f => `<option value="${f.id}">${f.label}</option>`).join('') +
    `</optgroup>`).join('');
  $('#selFloor').value = S.floorFinish;
  const P = plan();
  $('#planNote').textContent = P.note;
  $('#planSrc').textContent = P.source || '';
  $('#planSize').textContent = 'Khung căn ' + (P.w/100).toFixed(2).replace('.',',') + ' × ' +
    (P.d/100).toFixed(2).replace('.',',') + ' m · ' + P.rooms.length + ' phòng có thể bố trí';
}

/* đọc ghi chú tự do của người dùng, dò từ khoá tiếng Việt (data.js) để suy ra
   yêu cầu cụ thể. Không hiểu ngôn ngữ tự nhiên thật sự — chỉ khớp cụm từ, nên
   luôn hiện lại "đã hiểu gì" để người dùng biết máy đọc đúng hay chưa. */
function parseNeedNotes(text){
  const n = S.need;
  n.notes = text;
  n.workspace = false; n.pc = false; n.bedroomTv = false; n.oneBedOnly = false;
  n.sizePref = {}; n.colorPref = {}; n.exclude = []; n.autoMust = []; n.unmatched = [];

  /* giữ nguyên chữ hoa/thường của câu gốc (clausesRaw) để hiện lại đúng như
     người dùng đã gõ khi báo "chưa hiểu" — chỉ hạ chữ thường (cl) lúc so khớp */
  const clausesRaw = text.split(/[,.;\n]+/).map(s => s.trim()).filter(Boolean);
  const hasAny = (s, list) => list.some(k => s.includes(k));
  const findColor = s => { for (const [word, fam] of COLOR_WORDS) if (s.includes(word)) return fam; return null; };

  clausesRaw.forEach(raw => {
    const cl = raw.toLowerCase();
    /* câu nói về SỐ LƯỢNG giường (vd "1 giường") không phải là yêu cầu mua
       thêm giường ở phòng khách — xử lý riêng rồi bỏ qua phần còn lại của câu. */
    if (hasAny(cl, ONEBED_KEYWORDS)){ n.oneBedOnly = true; return; }

    /* khớp theo cụm từ DÀI NHẤT tìm được trên toàn bộ danh mục — không phải
       hạng mục khai báo trước trong CAT_KEYWORDS — để "táp đầu giường" (chứa
       sẵn chữ "giường") không bị nhận nhầm thành hạng mục Giường. */
    let matchedCat = null, matchedLen = 0;
    for (const cat in CAT_KEYWORDS) for (const kw of CAT_KEYWORDS[cat]){
      if (cl.includes(kw) && kw.length > matchedLen){ matchedCat = cat; matchedLen = kw.length; }
    }

    /* "không cần / không muốn / bỏ ..." — loại hẳn hạng mục khỏi phòng,
       bỏ qua mọi xử lý kích thước/màu/thêm-vào-bắt-buộc bên dưới. Nếu câu phủ
       định mà không rõ đang phủ định món gì (matchedCat rỗng) thì coi như
       CHƯA HIỂU — báo lại thay vì âm thầm bỏ qua. */
    if (hasAny(cl, NEGATE_HINTS)){
      if (matchedCat){ if (!n.exclude.includes(matchedCat)) n.exclude.push(matchedCat); }
      else n.unmatched.push(raw);
      return;
    }

    /* theo dõi TRỰC TIẾP xem câu này có thật sự đổi được gì không — thay vì
       suy luận lại từ matchedCat/isWork sau đó (dễ sai, vd "ghế" khớp được
       hạng mục nhưng lại bị loại khỏi autoMust vì đã có cơ chế riêng, nên
       khớp category không đồng nghĩa với có tác dụng). Câu nào không bật cờ
       này thì bị coi là CHƯA HIỂU và báo lại cho người dùng biết. */
    let hadEffect = false;

    const isWork = hasAny(cl, WORK_KEYWORDS);
    if (isWork){ n.pc = true; n.workspace = true; hadEffect = true; }
    if (matchedCat === 'banlam'){ n.workspace = true; hadEffect = true; }
    if (matchedCat === 'ketivi' && cl.includes('ngủ')){ n.bedroomTv = true; hadEffect = true; }

    if (matchedCat){
      if (hasAny(cl, SIZE_TOOBIG_HINTS) || hasAny(cl, SIZE_DOWN_HINTS)){ n.sizePref[matchedCat] = 'small'; hadEffect = true; }
      else if (hasAny(cl, SIZE_TOOSMALL_HINTS) || hasAny(cl, SIZE_UP_HINTS)){ n.sizePref[matchedCat] = 'big'; hadEffect = true; }
      const fam = findColor(cl);
      if (fam){ n.colorPref[matchedCat] = fam; hadEffect = true; }
      /* nhắc tới 1 hạng mục chưa chắc đã nằm trong công thức phòng khách (vd
         "bàn ăn") — tự thêm vào autoMust (tính lại MỖI LẦN đọc ghi chú, khác
         với "must" do người dùng tự bấm chip — để đổi ghi chú là đổi hẳn,
         không bị dính yêu cầu cũ đã không còn nhắc tới nữa).
         banlam/ghe/ketivi đã có cơ chế riêng (góc làm việc/PC/tivi) nên bỏ qua. */
      if (!['banlam','ghe','ketivi'].includes(matchedCat)){
        if (!n.autoMust.includes(matchedCat)) n.autoMust.push(matchedCat);
        hadEffect = true;
      }
    } else {
      const fam = findColor(cl);
      if (fam && /(nội thất|đồ đạc|tông màu|toàn bộ nhà|cả nhà)/.test(cl)){ n.colorPref._all = fam; hadEffect = true; }
    }

    /* không tạo được tác dụng thật nào — báo lại rõ ràng thay vì lặng lẽ bỏ
       qua, để người dùng biết cần gõ khác đi hoặc tự thêm món đó từ danh mục
       bên dưới (vd "ghế" nhắc riêng lẻ, không đi kèm góc làm việc/PC/tivi). */
    if (!hadEffect) n.unmatched.push(raw);
  });

  const deskWr = deskRoomId() === 'plus1' ? 'phòng ngủ +1' : 'phòng ngủ master';
  const parsed = [];
  if (n.oneBedOnly) parsed.push('Chỉ dùng 1 giường — phòng ngủ +1 sẽ không xếp giường nữa.');
  if (n.pc) parsed.push('Thêm bộ PC / máy tính bàn (kèm góc làm việc) vào ' + deskWr + '.');
  else if (n.workspace) parsed.push('Thêm góc làm việc vào ' + deskWr + '.');
  if (n.bedroomTv) parsed.push('Thêm tivi treo tường trong phòng ngủ master.');
  n.exclude.forEach(cat => parsed.push('Bỏ ' + catLabel(cat) + ' — không xếp món này ở phòng khách.'));
  Object.keys(n.sizePref).forEach(cat =>
    parsed.push(catLabel(cat) + ': ưu tiên cỡ ' + (n.sizePref[cat]==='big' ? 'lớn hơn' : 'nhỏ hơn') + ' mức trung bình.'));
  Object.keys(n.colorPref).forEach(cat => {
    const label = cat === '_all' ? 'Toàn bộ đồ nội thất' : catLabel(cat);
    parsed.push(label + ': ưu tiên tông màu ' + COLOR_FAMILIES[n.colorPref[cat]].label + '.');
  });
  /* hạng mục chỉ được NHẮC TÊN suông (không kèm cỡ/màu) — 2 dòng trên đã tự
     nói lên chuyện "sẽ thêm" rồi nên bỏ qua, tránh lặp lại 2 lần cùng 1 ý. */
  n.autoMust.forEach(cat => {
    if (n.sizePref[cat] == null && n.colorPref[cat] == null) parsed.push('Thêm ' + catLabel(cat) + ' vào phòng khách.');
  });
  n.parsed = parsed;
  return n.parsed;
}
function buildNeeds(){
  $('#selPeople').value = String(S.need.people);
  $('#needNotes').value = S.need.notes;
  const understood = S.need.parsed.length
    ? '<b>Đã hiểu:</b><br>' + S.need.parsed.map(t => '· ' + t).join('<br>')
    : (S.need.notes.trim() ? '' : '<span class="empty">Gõ ghi chú rồi bấm “Áp dụng &amp; bố trí lại cả căn hộ” để xem máy hiểu gì.</span>');
  const unmatched = (S.need.unmatched||[]).length
    ? (understood ? '<br>' : '') + '<b class="warn">Chưa hiểu:</b><br>' + S.need.unmatched.map(t => '· “' + t + '”').join('<br>')
      + '<span class="hint">Máy chỉ dò từ khoá, không hiểu câu tự nhiên hoàn toàn — thử đổi cách nói (vd “giường”, “sofa”, “bàn ăn”, “to hơn/nhỏ hơn”, “màu trắng”, “góc làm việc”, “PC”, “cây phong thuỷ”), hoặc thêm thẳng món đó từ danh mục bên dưới.</span>'
    : '';
  $('#needParsed').innerHTML = understood + unmatched
    || '<span class="empty">Gõ ghi chú rồi bấm “Áp dụng &amp; bố trí lại cả căn hộ” để xem máy hiểu gì.</span>';
  $('#mustChecks').innerHTML = CATS.map(c =>
    `<button class="chip" data-c="${c.id}" aria-pressed="${S.need.must.includes(c.id)}">${c.label}</button>`).join('');
  $('#mustChecks').querySelectorAll('.chip').forEach(b => b.onclick = () => {
    const c = b.dataset.c, i = S.need.must.indexOf(c);
    if (i === -1) S.need.must.push(c); else S.need.must.splice(i, 1);
    buildNeeds(); saveState();
  });
}
function buildCatalog(){
  const used = [...new Set(CATALOG.map(p => p.cat))];
  $('#catFilter').innerHTML =
    `<button class="chip" data-c="all" aria-pressed="${S.filter==='all'}">Tất cả</button>` +
    used.map(c => `<button class="chip" data-c="${c}" aria-pressed="${S.filter===c}">${catLabel(c)}</button>`).join('');
  $('#catFilter').querySelectorAll('.chip').forEach(b => b.onclick = () => { S.filter = b.dataset.c; buildCatalog(); });
  const list = CATALOG.filter(p => S.filter==='all' || p.cat===S.filter);
  $('#catList').innerHTML = list.map(p => `
    <div class="item">
      <button class="itemAdd" data-id="${p.id}">
        <span class="swatch" style="background:${p.color}"></span>
        <span>
          <span class="nm">${p.name}</span>
          <span class="mt">${p.brand} · ${p.w}×${p.d} cm · giao ${p.days} ngày</span>
        </span>
        <span class="pr">${vnd(p.price)}<br><span style="font-weight:400;color:var(--muted)">+${vnd(p.ship)} ship</span></span>
      </button>
      <a class="buy" href="${buyUrl(p)}" target="_blank" rel="noopener noreferrer">So sánh giá ↗</a>
    </div>`).join('');
  $('#catList').querySelectorAll('.itemAdd').forEach(b => b.onclick = () => addItem(b.dataset.id));
}

function addItem(id){
  const p = byId(id), r = room(), list = items();
  const it = {uid:UID++, id, x:Math.round(r.w/2-p.w/2), y:Math.round(r.d/2-p.d/2), rot:0};
  for (let k=0;k<40;k++){
    if (!list.some(o => overlap(rectOf(it), rectOf(o)))) break;
    it.x += 25; it.y += 18;
    if (it.x + p.w > r.w) it.x = 12;
    if (it.y + p.d > r.d) it.y = 12;
  }
  list.push(it); S.sel = it.uid; renderAll();
}

function renderChecks(){
  $('#checks').innerHTML = runChecks().map(c => `
    <div class="check">
      <span class="dot ${c.lv==='ok'?'ok':c.lv==='warn'?'warn':'err'}"></span>
      <span><b>${c.t}</b>${c.s?`<span>${c.s}</span>`:''}</span>
    </div>`).join('');
}

function totalOf(list){
  let sub=0, ship=0, days=0;
  list.forEach(it => { const p = byId(it.id); sub+=p.price; ship+=p.ship; days=Math.max(days,p.days); });
  return {sub, ship, days, total:sub+ship};
}
/* tóm tắt phong thuỷ CẢ CĂN HỘ (không riêng phòng đang xem) — để nằm sẵn
   trong báo giá và in ra được, vì bảng "Kiểm tra vừa vặn & phong thuỷ" bên
   phải bị ẩn khi in (nó có nút bấm tương tác, không hợp để lên giấy). */
function phongThuyReport(){
  const cm = cungMenh(S.year), na = napAmOf(S.year);
  const roomBits = liveRooms().filter(rr => itemsIn(rr.id).length).map(rr => {
    const issues = runChecks(rr.id).filter(c => c.lv !== 'ok');
    const body = issues.length
      ? issues.map(c => `<div class="ptIssue ${c.lv}">${c.t}${c.s ? ' — ' + c.s.replace(/<[^>]+>/g,'') : ''}</div>`).join('')
      : `<div class="ptIssue ok">Đạt yêu cầu vừa vặn &amp; phong thuỷ.</div>`;
    return `<div class="ptRoom"><b>${rr.name}</b>${body}</div>`;
  }).join('');
  return `
    <div class="rule"></div>
    <h4>Phong thuỷ</h4>
    <div class="ptGlobal">Mệnh <b>${na.ten}</b> (${na.label}) — năm ${na.canChi}, cung <b>${cm.ten}</b> (${cm.nhom}).<br>
      Màu hợp: ${na.mauHop.map(m=>m.name).join(', ')} · Nên tránh: ${na.mauKy.map(m=>m.name).join(', ')}.<br>
      Hướng tốt: ${cm.tot.join(', ')} · Cây hợp mệnh: ${na.cay.join(', ')}.</div>
    ${roomBits || '<div class="empty">Chưa bố trí phòng nào.</div>'}`;
}
function renderTierTag(){
  const idx = budgetTierIdx(), t = budgetTier();
  $('#tierTag').innerHTML = `<span class="lvl">Mức ${idx+1}/4 · ${t.ten}</span>
    <div class="tierDots">${BUDGET_TIERS.map((_,i) => `<i class="${i<=idx?'on':''}"></i>`).join('')}</div>
    <span class="note">${t.ghiChu}</span>`;
}
function renderReceipt(){
  renderTierTag();
  const el = $('#receipt'), P = plan();
  const all = liveRooms().flatMap(rr => itemsIn(rr.id));
  const A = totalOf(all);
  const roomsDone = liveRooms().filter(rr => itemsIn(rr.id).length).length;

  if (!all.length){
    el.innerHTML = `<h4>Báo giá</h4><div class="meta">${P.name}</div>
      <div class="empty">Chưa có món nào.<br>Đặt ngân sách rồi bấm “Bố trí cả căn hộ”.</div>`;
    return;
  }
  const pct = Math.min(100, A.total / Math.max(1,S.budget) * 100);
  const over = A.total > S.budget;

  const roomBlocks = liveRooms().filter(rr => itemsIn(rr.id).length).map(rr => {
    const list = itemsIn(rr.id);
    const rows = {};
    list.forEach(it => rows[it.id] = (rows[it.id]||0)+1);
    const lines = Object.entries(rows).map(([id,q]) => {
      const p = byId(id);
      return `<div class="rline"><span class="n">${q>1?q+'× ':''}${p.name}<em>${p.brand}</em></span>
        <span>${vnd(p.price*q)}<a class="buy" href="${buyUrl(p)}" target="_blank" rel="noopener noreferrer">Mua ↗</a></span></div>`;
    }).join('');
    const RR = totalOf(list);
    return `<div class="rroom">${rr.name} · ${(rr.w/100).toFixed(2)}×${(rr.d/100).toFixed(2)} m${rr.id===S.roomId ? ' <i class="cur">(đang xem)</i>' : ''}</div>
      ${lines}
      <div class="rline sub"><span class="n">Cộng ${rr.name.toLowerCase()}</span><span>${vnd(RR.total)}</span></div>`;
  }).join('<div class="rule soft"></div>');

  el.innerHTML = `
    <h4>Báo giá</h4>
    <div class="meta">${P.name.split('·')[0].trim()} · cả căn hộ · ${roomsDone}/${liveRooms().length} phòng đã bố trí</div>
    ${roomBlocks}
    <div class="rule"></div>
    <div class="rline"><span class="n">Tiền hàng</span><span>${vnd(A.sub)}</span></div>
    <div class="rline"><span class="n">Vận chuyển (đã gồm)</span><span>${vnd(A.ship)}</span></div>
    <div class="rule"></div>
    <div class="total"><span>CẢ CĂN HỘ</span><span class="v">${vnd(A.total)}</span></div>
    <div class="rline"><span class="n">${all.length} món</span><span>giao ${A.days} ngày</span></div>
    <div class="bar"><i class="${over?'over':''}" style="width:${pct}%"></i></div>
    <div class="rline" style="color:${over?'var(--son)':'var(--muted)'}">
      <span class="n">${over?'Vượt ngân sách':'Còn lại trong ngân sách'}</span>
      <span>${vnd(Math.abs(S.budget - A.total))}</span></div>
    ${phongThuyReport()}
    <div style="height:10px"></div>`;
}
function renderToolbar(){
  const has = S.sel != null;
  ['#btnRot','#btnDup','#btnDel'].forEach(s => $(s).disabled = !has);
  $('#roomLbl').textContent = room().name + ' · ' + items().length + ' món';
}
function renderAll(){
  fitView(); draw(); renderChecks(); renderReceipt(); renderToolbar();
  $('#selRoom').value = S.roomId;
  if (typeof TD !== 'undefined' && TD.active){ td_resize(); td_build(); }
  saveState();
}

/* ---------- tương tác trên bản vẽ ---------- */
let drag = null;
function hitItem(px,py){
  const r = room();
  const x = invX(px) - r.x, y = invY(py) - r.y, list = items();
  for (let i=list.length-1;i>=0;i--){
    const R = rectOf(list[i]);
    if (x>=R.x && x<=R.x+R.w && y>=R.y && y<=R.y+R.d) return list[i];
  }
  return null;
}
function hitRoom(px,py){
  const x = invX(px), y = invY(py);
  return liveRooms().find(r => x>=r.x && x<=r.x+r.w && y>=r.y && y<=r.y+r.d);
}
cv.addEventListener('pointerdown', e => {
  const b = cv.getBoundingClientRect(), px = e.clientX-b.left, py = e.clientY-b.top;
  const it = hitItem(px,py);
  if (it){
    S.sel = it.uid;
    drag = {uid:it.uid, dx: invX(px)-room().x-it.x, dy: invY(py)-room().y-it.y};
    cv.setPointerCapture(e.pointerId);
    draw(); renderToolbar(); return;
  }
  const rr = hitRoom(px,py);
  if (rr && rr.id !== S.roomId){ S.roomId = rr.id; S.sel = null; renderAll(); return; }
  S.sel = null; draw(); renderToolbar();
});
cv.addEventListener('pointermove', e => {
  if (!drag) return;
  const b = cv.getBoundingClientRect(), r = room();
  const it = items().find(i => i.uid===drag.uid); if (!it) return;
  const dm = dims(it);
  let nx = invX(e.clientX-b.left) - r.x - drag.dx;
  let ny = invY(e.clientY-b.top)  - r.y - drag.dy;
  nx = Math.round(nx/5)*5; ny = Math.round(ny/5)*5;
  if (Math.abs(nx) < 15) nx = 0;
  if (Math.abs(ny) < 15) ny = 0;
  if (Math.abs(r.w-(nx+dm.w)) < 15) nx = r.w-dm.w;
  if (Math.abs(r.d-(ny+dm.d)) < 15) ny = r.d-dm.d;
  it.x = Math.max(-30, Math.min(nx, r.w+30-dm.w));
  it.y = Math.max(-30, Math.min(ny, r.d+30-dm.d));
  draw();
});
cv.addEventListener('pointerup', () => { if (drag){ drag=null; renderChecks(); renderReceipt(); if (typeof TD!=='undefined'&&TD.active) td_build(); saveState(); } });
cv.addEventListener('pointercancel', () => drag = null);

document.addEventListener('keydown', e => {
  if (S.sel == null) return;
  const it = items().find(i => i.uid===S.sel); if (!it) return;
  const st = e.shiftKey ? 20 : 5;
  const map = {ArrowLeft:[-st,0], ArrowRight:[st,0], ArrowUp:[0,-st], ArrowDown:[0,st]};
  if (map[e.key]){ it.x+=map[e.key][0]; it.y+=map[e.key][1]; e.preventDefault(); draw(); renderChecks(); saveState(); }
  if (e.key==='r'||e.key==='R'){ it.rot=(it.rot+90)%360; draw(); renderChecks(); saveState(); }
  if (e.key==='Delete'||e.key==='Backspace'){
    S.store[key(S.planId,S.roomId)] = items().filter(i => i.uid!==S.sel);
    S.sel=null; renderAll(); e.preventDefault();
  }
});

$('#selPeople').onchange = e => { S.need.people = +e.target.value || 1; saveState(); };
$('#selPlan').onchange = e => { S.planId = e.target.value; S.sel=null; buildSelects(); renderAll(); };
$('#selRoom').onchange = e => { S.roomId = e.target.value; S.sel=null; renderAll(); };
$('#selHuong').onchange = e => { S.huong = e.target.value; draw(); renderChecks(); saveState(); };
$('#selWall').onchange = e => { S.wallFinish = e.target.value; if (typeof TD!=='undefined' && TD.active) td_build(); saveState(); };
$('#selFloor').onchange = e => { S.floorFinish = e.target.value; if (typeof TD!=='undefined' && TD.active) td_build(); saveState(); };
$('#inpYear').onchange = e => { S.year = +e.target.value || 2000; renderChecks(); saveState(); };
$('#inpBudget').onchange = e => { S.budget = +e.target.value || 0; renderReceipt(); saveState(); };
$('#btnAutoAll').onclick = () => { S.budget = +$('#inpBudget').value||0; autoLayoutAll(); };
$('#btnApplyNotes').onclick = () => {
  parseNeedNotes($('#needNotes').value);
  buildNeeds();
  S.budget = +$('#inpBudget').value || S.budget;
  autoLayoutAll();
};
$('#btnAuto').onclick = () => {
  S.budget = +$('#inpBudget').value||0;
  const tot = liveRooms().reduce((a,r)=>a+(WEIGHT[r.type]||.5),0);
  autoLayout(S.budget * (WEIGHT[room().type]||.5) / tot);
};
$('#btnClear').onclick = () => {
  liveRooms().forEach(r => S.store[key(S.planId,r.id)] = []);
  S.sel=null; renderAll();
};
$('#btnResetSaved').onclick = () => {
  if (confirm('Xoá toàn bộ mong muốn và cách bố trí đã lưu trên trình duyệt này, làm lại từ đầu?')) clearSavedState();
};
$('#btnRot').onclick = () => { const it=items().find(i=>i.uid===S.sel); if(it){ it.rot=(it.rot+90)%360; renderAll(); } };
$('#btnDup').onclick = () => { const it=items().find(i=>i.uid===S.sel); if(it){ items().push({uid:UID++,id:it.id,x:it.x+30,y:it.y+30,rot:it.rot}); renderAll(); } };
$('#btnDel').onclick = () => { S.store[key(S.planId,S.roomId)] = items().filter(i=>i.uid!==S.sel); S.sel=null; renderAll(); };
$('#btnPrint').onclick = () => window.print();

document.querySelectorAll('.tabs button').forEach(b => {
  b.onclick = () => {
    const t = b.dataset.tab;
    document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-pressed', String(x===b)));
    $('#paneLeft').classList.toggle('show', t==='left');
    $('#paneRight').classList.toggle('show', t==='right');
    $('#stage').style.display = (t==='stage' || window.innerWidth>720) ? 'flex' : 'none';
    if (t==='stage') setTimeout(resize, 30);
  };
});

/* =========================================================
   9. PHỐI CẢNH 3D — hướng ảnh render
   Bốn thứ tạo ra khác biệt so với "đồ hoạ game":
   (1) chiếu sáng bằng environment map + tone mapping ACES
   (2) vật liệu PBR có texture sinh bằng canvas (gỗ, gạch, vải, đá)
   (3) hình khối bo góc thay vì hộp vuông
   (4) bóng tiếp xúc (contact shadow) dưới từng món đồ
   ========================================================= */
const HAS3D = (typeof THREE !== 'undefined');
const WALL_H = 2.75;
const TD = {ready:false, active:false, orbit:{az:-0.62, pol:0.72, dist:12}, looping:false};

/* cấu hình 3D — cường độ & tông sáng của cảnh, chọn được từ thanh công cụ */
const LIGHT_PRESETS = {
  day:     {label:'Ban ngày',  bg:0x171310, hemiSky:0xF4F7FF, hemiGround:0x8A7A62, hemiI:.55, sunColor:0xFFF0D8, sunI:1.35, expo:1.05},
  evening: {label:'Buổi tối',  bg:0x0B0906, hemiSky:0xFFD9A0, hemiGround:0x2A2018, hemiI:.30, sunColor:0xFFB870, sunI:.85,  expo:.82}
};
function applyLightPreset(){
  if(!TD.ready) return;
  const p = LIGHT_PRESETS[S.lightPreset] || LIGHT_PRESETS.day;
  TD.scene.background.setHex(p.bg);
  TD.hemi.color.setHex(p.hemiSky); TD.hemi.groundColor.setHex(p.hemiGround); TD.hemi.intensity=p.hemiI;
  TD.sun.color.setHex(p.sunColor); TD.sun.intensity=p.sunI;
  TD.renderer.toneMappingExposure=p.expo;
  const b=document.getElementById('btnLight');
  if(b) b.textContent='Ánh sáng: '+p.label;
}

/* ---------- texture sinh bằng canvas ---------- */
const TEX = {};
function cvs(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function noise(ctx,w,h,amt,alpha){
  const d=ctx.getImageData(0,0,w,h);
  for(let i=0;i<d.data.length;i+=4){
    const n=(Math.random()-.5)*amt;
    d.data[i]+=n; d.data[i+1]+=n; d.data[i+2]+=n;
    if(alpha!=null) d.data[i+3]=alpha;
  }
  ctx.putImageData(d,0,0);
}
function mkTex(canvas, rx, ry){
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx||1, ry||1);
  t.anisotropy = 8;
  if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
  return t;
}
function woodTex(){
  if (TEX.wood) return TEX.wood.clone();
  const W=512,H=512,c=cvs(W,H),x=c.getContext('2d');
  x.fillStyle='#BC9C74'; x.fillRect(0,0,W,H);
  const planks=4, ph=H/planks;
  for(let p=0;p<planks;p++){
    const base=[188,156,116], v=(Math.random()-.5)*26;
    x.fillStyle=`rgb(${base[0]+v},${base[1]+v},${base[2]+v})`;
    const off=(p%2)*W*0.35;
    x.fillRect(0,p*ph,W,ph-2);
    // vân gỗ
    for(let i=0;i<26;i++){
      x.strokeStyle=`rgba(${110+Math.random()*40},${85+Math.random()*30},${55+Math.random()*25},${.08+Math.random()*.12})`;
      x.lineWidth=.6+Math.random()*1.6;
      x.beginPath();
      const y0=p*ph+Math.random()*ph;
      x.moveTo(-10,y0);
      for(let sx=0;sx<=W;sx+=32) x.lineTo(sx, y0+Math.sin((sx+off)/58)*2.4+(Math.random()-.5)*1.6);
      x.stroke();
    }
    x.fillStyle='rgba(70,50,30,.28)'; x.fillRect(0,p*ph+ph-2,W,2);   // khe ván
  }
  noise(x,W,H,10);
  TEX.wood=mkTex(c,1,1); return TEX.wood.clone();
}
function tileTex(col, grout, n){
  const key='tile'+col+n;
  if (TEX[key]) return TEX[key].clone();
  const W=512,H=512,c=cvs(W,H),x=c.getContext('2d');
  x.fillStyle=grout; x.fillRect(0,0,W,H);
  const s=W/(n||4);
  for(let i=0;i<(n||4);i++) for(let j=0;j<(n||4);j++){
    const v=(Math.random()-.5)*10;
    x.fillStyle=col;
    x.fillRect(i*s+1.5, j*s+1.5, s-3, s-3);
    x.fillStyle=`rgba(255,255,255,${.03+Math.random()*.05})`;
    x.fillRect(i*s+1.5, j*s+1.5, s-3, (s-3)/2);
  }
  noise(x,W,H,7);
  TEX[key]=mkTex(c,1,1); return TEX[key].clone();
}
function fabricTex(hex){
  const key='fab'+hex;
  if (TEX[key]) return TEX[key].clone();
  const W=256,H=256,c=cvs(W,H),x=c.getContext('2d');
  x.fillStyle=hex; x.fillRect(0,0,W,H);
  for(let i=0;i<W;i+=3){
    x.strokeStyle='rgba(255,255,255,.05)'; x.beginPath(); x.moveTo(i,0); x.lineTo(i,H); x.stroke();
    x.strokeStyle='rgba(0,0,0,.05)'; x.beginPath(); x.moveTo(0,i); x.lineTo(W,i); x.stroke();
  }
  noise(x,W,H,14);
  TEX[key]=mkTex(c,3,3); return TEX[key].clone();
}
function stoneTex(){
  if (TEX.stone) return TEX.stone.clone();
  const W=512,H=512,c=cvs(W,H),x=c.getContext('2d');
  x.fillStyle='#EFEDE8'; x.fillRect(0,0,W,H);
  for(let i=0;i<16;i++){
    x.strokeStyle=`rgba(150,150,155,${.12+Math.random()*.2})`;
    x.lineWidth=.6+Math.random()*2.4; x.beginPath();
    let px=Math.random()*W, py=-10;
    x.moveTo(px,py);
    while(py<H){ px+=(Math.random()-.5)*70; py+=20+Math.random()*30; x.lineTo(px,py); }
    x.stroke();
  }
  noise(x,W,H,6);
  TEX.stone=mkTex(c,1,1); return TEX.stone.clone();
}
function shadowTex(){
  if (TEX.sh) return TEX.sh;
  const W=128,c=cvs(W,W),x=c.getContext('2d');
  const g=x.createRadialGradient(W/2,W/2,0,W/2,W/2,W/2);
  g.addColorStop(0,'rgba(0,0,0,.42)'); g.addColorStop(.55,'rgba(0,0,0,.18)'); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g; x.fillRect(0,0,W,W);
  TEX.sh=new THREE.CanvasTexture(c); return TEX.sh;
}

/* ---------- vật liệu & hình khối ---------- */
function M(o){ return new THREE.MeshStandardMaterial(Object.assign({roughness:.85, metalness:0}, o)); }
/* tường là mảng phẳng lớn không bị vật gì che, hứng trọn sky env map + nắng nên
   dựng "cháy sáng" nếu dùng thẳng màu — nén bớt kênh màu trước khi lên vật liệu
   để tường tối vẫn đọc được là tối, tường sáng vẫn gần như giữ nguyên. */
function wallShade(hex){
  const c = new THREE.Color(hex);
  c.r = Math.pow(c.r, 1.7); c.g = Math.pow(c.g, 1.7); c.b = Math.pow(c.b, 1.7);
  return c;
}
function roundedBox(w,h,d,r){
  /* bevel của ExtrudeGeometry nở ra ngoài r mỗi phía, nên phải co hình
     gốc lại đúng 2r để kích thước cuối cùng khớp số đo thật của sản phẩm */
  r = Math.max(.004, Math.min(r, w/2-.004, h/2-.004, d/2-.004));
  const w2 = Math.max(.004, w-2*r), h2 = Math.max(.004, h-2*r);
  const rr = Math.min(r*.9, w2/2-.001, h2/2-.001);
  const s = new THREE.Shape();
  const x=-w2/2, y=-h2/2;
  s.moveTo(x+rr,y);
  s.lineTo(x+w2-rr,y); s.quadraticCurveTo(x+w2,y,x+w2,y+rr);
  s.lineTo(x+w2,y+h2-rr); s.quadraticCurveTo(x+w2,y+h2,x+w2-rr,y+h2);
  s.lineTo(x+rr,y+h2); s.quadraticCurveTo(x,y+h2,x,y+h2-rr);
  s.lineTo(x,y+rr); s.quadraticCurveTo(x,y,x+rr,y);
  const g = new THREE.ExtrudeGeometry(s,{depth:Math.max(.004,d-2*r), bevelEnabled:true,
    bevelSize:r, bevelThickness:r, bevelSegments:3, curveSegments:6});
  g.translate(0,0,-Math.max(.004,d-2*r)/2);
  g.rotateX(Math.PI/2);
  g.computeVertexNormals();
  return g;
}
function rb(w,h,d,r,mat,x,y,z){
  const m=new THREE.Mesh(roundedBox(w,d,h,r||.03), mat);   // extrude theo trục Y
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; return m;
}
function bx(w,h,d,mat,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(w,.005),Math.max(h,.005),Math.max(d,.005)), mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; return m;
}
function cyl(rt,rb_,h,mat,x,y,z){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb_,h,24), mat);
  m.position.set(x,y,z); m.castShadow=true; return m;
}
function contact(w,d,x,z,op){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w*1.5,d*1.5),
    new THREE.MeshBasicMaterial({map:shadowTex(), transparent:true, depthWrite:false, opacity:op||.85}));
  m.rotation.x=-Math.PI/2; m.position.set(x,.004,z); m.renderOrder=1; m.userData.contact=true; return m;
}
/* rèm: mặt phẳng gợn sóng */
function curtain(len, h, color, horiz){
  const seg=Math.max(12, Math.round(len*14));
  const g=new THREE.PlaneGeometry(len,h,seg,1);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const t=(p.getX(i)+len/2)/len;
    p.setZ(i, Math.sin(t*Math.PI*len*7)*0.035);
  }
  g.computeVertexNormals();
  const m=new THREE.Mesh(g, M({color:color, roughness:.95, side:THREE.DoubleSide}));
  m.castShadow=true; m.position.y=h/2;
  if(!horiz) m.rotation.y=Math.PI/2;
  return m;
}
function plant(scale){
  const g=new THREE.Group(), s=scale||1;
  const pot=M({color:0xC9BCA8, roughness:.8});
  g.add(cyl(.10*s,.085*s,.19*s, pot, 0,.095*s,0));
  g.add(cyl(.102*s,.102*s,.012*s, pot, 0,.19*s,0));
  const stemM=M({color:0x5A6B3E, roughness:.85});
  const n=8+Math.round(Math.random()*3);
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2+Math.random()*.4;
    const lean=.14+Math.random()*.10, len=.30*s+Math.random()*.20*s;
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.004*s,.006*s,len,5), stemM);
    stem.position.set(Math.cos(a)*lean*s, .19*s+len/2*.86, Math.sin(a)*lean*s);
    stem.rotation.set(Math.sin(a)*.5, 0, -Math.cos(a)*.5);
    stem.castShadow=true; g.add(stem);

    const tip=stem.position.clone();
    tip.x+=Math.sin(stem.rotation.z)*len*.5*-1; tip.y+=len*.42; tip.z+=Math.sin(stem.rotation.x)*len*.5;
    const leaves=3+Math.round(Math.random()*2);
    const gv=(Math.random()-.5)*.12;
    const leafM=M({color:new THREE.Color(0x3E6B3A).offsetHSL(0,0,gv), roughness:.68});
    for(let j=0;j<leaves;j++){
      const l=new THREE.Mesh(new THREE.ConeGeometry(.028*s,.16*s,5), leafM);
      const la=a+(j-leaves/2)*.5+(Math.random()-.5)*.2;
      l.position.set(tip.x+Math.cos(la)*.04*s, tip.y+Math.random()*.05*s, tip.z+Math.sin(la)*.04*s);
      l.rotation.set(Math.cos(la)*1.15+.2, -la, Math.sin(la)*1.15);
      l.castShadow=true; g.add(l);
    }
  }
  return g;
}

/* ---------- đồ nội thất ---------- */
function td_furniture(it, ox, oy){
  ox=ox||0; oy=oy||0;
  const p = byId(it.id), g = new THREE.Group();
  const W=p.w/100, D=p.d/100, H=Math.max(p.h,3)/100;
  const c=new THREE.Color(p.color);
  const dark=c.clone().multiplyScalar(.62), light=c.clone().multiplyScalar(1.16);
  const fab = M({color:c, map:fabricTex('#'+c.getHexString()), roughness:.96});
  const wood= M({color:c, map:woodTex(), roughness:.62});
  const woodD=M({color:dark, map:woodTex(), roughness:.6});
  const metal=M({color:0x8C8F94, roughness:.35, metalness:.85});
  const add=m=>{ g.add(m); return m; };

  switch(p.cat){
    case 'sofa': {
      const seat=H*.40, armW=Math.min(W*.11,.17);
      add(rb(W, seat*.55, D, .05, fab, 0, seat*.28, 0));
      add(rb(W, H*.92, D*.20, .07, fab, 0, H*.46, -D/2+D*.10));
      add(rb(armW, H*.60, D*.92, .06, fab, -W/2+armW/2, H*.30, D*.03));
      add(rb(armW, H*.60, D*.92, .06, fab,  W/2-armW/2, H*.30, D*.03));
      const n=W>1.9?3:2, cw=(W-armW*2)/n;
      for(let i=0;i<n;i++){
        const cush=rb(cw*.94, H*.20, D*.62, .07, fab, -W/2+armW+cw*(i+.5), seat*.55+H*.10, D*.06);
        cush.rotation.x=-.03; add(cush);
        const back=rb(cw*.88, H*.34, .13, .06, fab, -W/2+armW+cw*(i+.5), H*.62, -D/2+D*.22);
        back.rotation.x=.09; add(back);
      }
      break;
    }
    case 'giuong': {
      add(rb(W, H*.5, D, .02, woodD, 0, H*.25, 0));
      add(rb(W*.97, H*.42, D*.95, .05, M({color:0xF3EFE6, roughness:.95}), 0, H*.5+H*.21, 0));
      const hb=rb(W, .58, .08, .04, fab, 0, H*.5+.20, -D/2+.04); add(hb);
      // chăn phủ
      const duvet=rb(W*.99, .07, D*.62, .04, M({color:c, map:fabricTex('#'+c.getHexString()), roughness:.97}),
                     0, H*.5+H*.42+.02, D*.16); add(duvet);
      add(rb(W*.99, .05, .1, .03, M({color:light, roughness:.97}), 0, H*.5+H*.42+.03, D*.16-D*.31));
      for(const sx of (W>1.4?[-.26,.26]:[0])){
        const pil=rb(W*.36, .12, .3, .06, M({color:0xFAF7F1, roughness:.96}), sx*W, H*.5+H*.42+.05, -D/2+.28);
        pil.rotation.x=-.16; add(pil);
      }
      break;
    }
    case 'tuquanao': {
      add(rb(W,H,D,.015, wood, 0, H/2, 0));
      const n=W>1.4?3:2;
      for(let i=0;i<n;i++){
        const x=-W/2+W/n*(i+.5);
        add(bx(W/n*.94, H*.96, .012, woodD, x, H/2, D/2+.008));
        add(cyl(.008,.008,.18, metal, x+W/n*.36, H*.52, D/2+.03));
      }
      break;
    }
    case 'ketivi': {
      add(rb(W,H,D,.02, wood, 0, H/2, 0));
      add(bx(W*.9,H*.4,.01, woodD, 0, H*.3, D/2+.008));
      const tw=Math.min(W*.62,1.15), th=tw*.565, standW=tw*.46;
      const standM=M({color:0x1B1D20, roughness:.4, metalness:.3});
      add(bx(standW,.015,.13, standM, 0, H+.008, 0));
      add(bx(.026,.10,.026, standM, -standW*.34, H+.06, 0));
      add(bx(.026,.10,.026, standM,  standW*.34, H+.06, 0));
      const scrY=H+.115+th/2;
      add(bx(tw+.02, th+.02, .022, M({color:0x0B0C0E, roughness:.55, metalness:.15}), 0, scrY, 0));
      add(bx(tw, th, .006, new THREE.MeshPhysicalMaterial({color:0x0D1013, roughness:.09, metalness:.1, clearcoat:1, clearcoatRoughness:.12}), 0, scrY, .012));
      break;
    }
    case 'bantra': case 'banan': case 'banlam': {
      const topM = p.cat==='banan' ? M({color:0xF2F0EC, map:stoneTex(), roughness:.35}) : wood;
      add(rb(W,.045,D,.012, topM, 0, H-.022, 0));
      const lx=W/2-.07, lz=D/2-.07;
      [[-lx,-lz],[lx,-lz],[-lx,lz],[lx,lz]].forEach(([x,z])=>add(cyl(.022,.026,H-.045, metal, x,(H-.045)/2,z)));
      break;
    }
    case 'ghe': {
      if(p.h>=110){
        add(cyl(.28,.30,.03, M({color:0x2A2E33,roughness:.5}), 0,.02,0));
        for(let i=0;i<5;i++){ const a=i/5*Math.PI*2;
          add(bx(.26,.03,.05, M({color:0x2A2E33,roughness:.5}), Math.cos(a)*.13,.03,Math.sin(a)*.13)); }
        add(cyl(.035,.035,.36, metal, 0,.22,0));
        add(rb(W*.82,.10,D*.82,.04, fab, 0,.45,0));
        const bk=rb(W*.78,H-.66,.07,.04, fab, 0,.50+(H-.66)/2,-D*.34); bk.rotation.x=.11; add(bk);
      } else {
        add(rb(W,.06,D,.02, wood, 0,.43,0));
        const bk=rb(W*.92,H-.48,.045,.02, wood, 0,.46+(H-.48)/2,-D/2+.04); bk.rotation.x=.1; add(bk);
        const lx=W/2-.05,lz=D/2-.05;
        [[-lx,-lz],[lx,-lz],[-lx,lz],[lx,lz]].forEach(([x,z])=>add(cyl(.018,.022,.43, woodD, x,.215,z)));
      }
      break;
    }
    case 'tab': {
      add(rb(W,H,D,.02, wood, 0,H/2,0));
      add(bx(W*.85,H*.34,.01, woodD, 0,H*.68,D/2+.008));
      add(bx(W*.85,H*.34,.01, woodD, 0,H*.28,D/2+.008));
      add(cyl(.007,.007,.1, metal, 0,H*.68,D/2+.03));
      break;
    }
    case 'tugiay': case 'kesach': {
      add(bx(.028,H,D, wood, -W/2+.014,H/2,0));
      add(bx(.028,H,D, wood,  W/2-.014,H/2,0));
      add(bx(W,.028,.018, wood, 0,H-.014,-D/2+.009));
      const n=Math.max(3,Math.round(H/.36));
      for(let i=0;i<=n;i++) add(bx(W-.056,.024,D*.94, light===dark?wood:M({color:light,map:woodTex(),roughness:.6}), 0, i*(H/n)+.012, 0));
      break;
    }
    case 'den': {
      add(cyl(.10,.13,.02, M({color:dark,roughness:.5,metalness:.5}), 0,.01,0));
      add(cyl(.014,.014,H-.26, metal, 0,(H-.26)/2,0));
      const sh=cyl(.13,.19,.24, M({color:0xF6E6C4, roughness:.9, emissive:0xFFCB77, emissiveIntensity:.55}), 0,H-.12,0);
      sh.castShadow=false; add(sh);
      const pl=new THREE.PointLight(0xFFCF96,.5,3.2); pl.position.set(0,H-.16,0); g.add(pl);
      break;
    }
    case 'tham': {
      const m=new THREE.Mesh(new THREE.PlaneGeometry(W,D),
        M({color:c, map:fabricTex('#'+c.getHexString()), roughness:1}));
      m.rotation.x=-Math.PI/2; m.position.y=.008; m.receiveShadow=true; g.add(m);
      break;
    }
    case 'bantho': {
      const base = p.mount ? p.mount/100 : 0;
      const hh=Math.max(H,.12);
      add(rb(W,hh,D,.02, woodD, 0, base+hh/2, 0));
      const top=base+hh;
      add(cyl(.055,.065,.09, M({color:0xC08A2E, roughness:.35, metalness:.8}), 0, top+.045, 0));
      add(cyl(.02,.02,.13, M({color:0xB0362A, roughness:.5}), -W*.28, top+.065, 0));
      add(cyl(.02,.02,.13, M({color:0xB0362A, roughness:.5}),  W*.28, top+.065, 0));
      break;
    }
    case 'cay': {
      /* dùng chung bộ sinh cây trang trí (plant()) — quy đổi chiều cao sản phẩm
         thật (H mét) ra hệ số scale mà plant() hiểu, để mỗi loại cây cao thấp
         khác nhau (sen đá 15cm ~ phát tài núi 1m4) trông đúng tỉ lệ, không phải
         cùng một khối hộp như các hạng mục chưa có hình riêng. */
      add(plant(Math.max(.45, Math.min(3.2, H/.53))));
      break;
    }
    case 'guong': {
      /* panel gương thật (kim loại bóng + envMap phản chiếu cảnh, không dệt vân
         gỗ) lồng trong khung mỏng — khác hẳn khối hộp mặc định, đọc ra ngay là
         một tấm gương chứ không phải đồ nội thất đặc. */
      const frameM = M({color:c, roughness:.5, metalness:.25});
      const mirrorM = M({color:0xC9D3D8, roughness:.03, metalness:1});
      add(rb(W, H, Math.max(D,.03), .012, frameM, 0, H/2, 0));
      add(bx(W*.86, H*.88, .008, mirrorM, 0, H/2, D/2-.006));
      break;
    }
    case 'maygiat': case 'tulanh': case 'dieuhoa': case 'binhnonglanh':
    case 'bepdien': case 'mayhutmui': case 'giaphoido': {
      /* vỏ máy sơn tĩnh điện / kim loại — không phủ vân gỗ như đồ nội thất gỗ,
         để tủ lạnh/máy giặt/điều hoà... trông đúng chất liệu của thiết bị. */
      const bodyM = M({color:c, roughness:.4, metalness:.5});
      add(rb(W, H, D, .025, bodyM, 0, H/2, 0));
      if (p.cat==='maygiat' || p.cat==='tulanh'){
        const doorR = Math.min(W,H)*(p.cat==='maygiat'?.3:.34);
        const doorM = M({color:dark, roughness:.3, metalness:.55});
        const door = cyl(doorR, doorR, .02, doorM, 0, p.cat==='maygiat'?H*.42:H*.55, D/2+.002);
        door.rotation.x = Math.PI/2;
        add(door);
      }
      break;
    }
    default: add(rb(W,H,D,.02, wood, 0,H/2,0));
  }

  if (p.cat!=='tham' && !p.mount) g.add(contact(W,D,0,0, .8));
  const dm = dims(it);
  g.position.set((ox+it.x+dm.w/2)/100, 0, (oy+it.y+dm.d/2)/100);
  g.rotation.y = -it.rot*Math.PI/180;
  g.userData.uid = it.uid;
  return g;
}

/* ---------- tường có khoét cửa ---------- */
function td_wall(r, side){
  const g=new THREE.Group();
  const len=(side==='N'||side==='S')?r.w:r.d;
  const ops=(r.openings||[]).filter(o=>o.wall===side).sort((a,b)=>a.pos-b.pos);
  const segs=[]; let cur=0;
  ops.forEach(o=>{ if(o.pos>cur) segs.push([cur,o.pos,'full']); segs.push([o.pos,o.pos+o.len,o.type]); cur=o.pos+o.len; });
  if(cur<len) segs.push([cur,len,'full']);
  const T=.09;
  const finish = currentWallFinish();
  const wallM = finish.type==='go'
    ? M({color:wallShade(finish.color), roughness:finish.roughness, envMapIntensity:.15,
        map:(()=>{ const t=woodTex(); t.repeat.set(Math.max(1,Math.round(len/70)), Math.max(1,Math.round(WALL_H/70))); return t; })()})
    : M({color:wallShade(finish.color), roughness:finish.roughness, envMapIntensity:.15});
  const skirtM= M({color:0xE2D9CB, roughness:.7});
  const glassM= new THREE.MeshPhysicalMaterial({color:0xDCEAF0, transparent:true, opacity:.16,
                  roughness:.05, metalness:0, transmission:.85});
  const frameM= M({color:0x555B60, roughness:.5, metalness:.5});
  const put=(a,b,y0,y1,mat,thin)=>{
    const L=(b-a)/100, h=y1-y0, mid=(a+b)/200, t=thin||T;
    let m;
    if(side==='N') m=bx(L,h,t,mat,mid,y0+h/2,-t/2);
    else if(side==='S') m=bx(L,h,t,mat,mid,y0+h/2,r.d/100+t/2);
    else if(side==='W') m=bx(t,h,L,mat,-t/2,y0+h/2,mid);
    else m=bx(t,h,L,mat,r.w/100+t/2,y0+h/2,mid);
    g.add(m); return m;
  };
  /* nẹp gỗ dọc nhô nhẹ ra phía trong phòng, dùng cho kiểu lam sóng/lam thẳng */
  const proud=.018;
  const slatBox=(a,b,y0,y1,mat)=>{
    const L=(b-a)/100, h=y1-y0, mid=(a+b)/200, t=.022;
    let m;
    if(side==='N') m=bx(L,h,t,mat,mid,y0+h/2, proud-t/2);
    else if(side==='S') m=bx(L,h,t,mat,mid,y0+h/2, r.d/100-proud+t/2);
    else if(side==='W') m=bx(t,h,L,mat, proud-t/2, y0+h/2,mid);
    else m=bx(t,h,L,mat, r.w/100-proud+t/2, y0+h/2,mid);
    g.add(m); return m;
  };
  const addSlats=(a,b,y0,y1)=>{
    const unit=9, gapW=3, w=unit-gapW, span=b-a;
    const n=Math.max(1,Math.floor((span+gapW)/unit));
    const used=n*unit-gapW, start=a+(span-used)/2;
    const slatWood=M({color:wallShade(finish.color), roughness:finish.roughness, envMapIntensity:.15,
      map:(()=>{ const t=woodTex(); t.repeat.set(1, Math.max(1,Math.round((y1-y0)/1.2))); return t; })()});
    for(let i=0;i<n;i++){ const sa=start+i*unit; slatBox(sa, sa+w, y0, y1, slatWood); }
  };
  segs.forEach(([a,b,type])=>{
    if(type==='full'){
      put(a,b,0,WALL_H,wallM); put(a,b,0,.09,skirtM,T+.012);
      if(finish.type==='go' && finish.slat) addSlats(a,b,0,WALL_H);
    }
    else if(type==='door'){ put(a,b,2.15,WALL_H,wallM); }
    else if(type==='open'){ put(a,b,2.25,WALL_H,wallM); }
    else if(type==='railing'){
      put(a,b,0,.12,wallM);
      const n=Math.max(3,Math.round((b-a)/14));
      for(let i=0;i<=n;i++){
        const pos=a+(b-a)*i/n;
        put(pos-1.2,pos+1.2,.12,1.1,frameM,.04);
      }
      put(a,b,1.06,1.12,frameM,.06);
    }
    else { // window / glass
      const sill = type==='glass' ? .02 : .85;
      put(a,b,0,sill,wallM);
      if(sill>.05) put(a,b,0,.09,skirtM,T+.012);
      put(a,b,2.35,WALL_H,wallM);
      put(a,b,sill,2.35,glassM,.03);
      put(a,b,sill,sill+.04,frameM,.05);
      put(a,b,2.31,2.35,frameM,.05);
    }
  });
  g.userData.side=side; g.userData.room=r.id;
  return g;
}

/* ---------- thiết bị cố định: bếp, WC, tủ âm tường ---------- */
function td_fixtures(){
  const P=plan(), g=new THREE.Group();
  const stoneM=M({color:0xF0EEE9, map:stoneTex(), roughness:.28});
  const cabM  =M({color:0xE8E2D6, roughness:.55});
  const cabD  =M({color:0x8E7B63, map:woodTex(), roughness:.6});
  const white =M({color:0xFAFAFA, roughness:.22});
  const metal =M({color:0x9AA0A6, roughness:.25, metalness:.9});

  P.rooms.forEach(r=>(r.fixtures||[]).forEach(f=>{
    const W=f.w/100,D=f.d/100,cx=(r.x+f.x+f.w/2)/100,cz=(r.y+f.y+f.d/2)/100;
    if(f.name==='Bếp'){
      g.add(bx(W,.80,D,cabM,cx,.40,cz));
      g.add(bx(W+.02,.05,D+.02,stoneM,cx,.845,cz));
      const along = W>D;
      // tủ trên
      g.add(bx(along?W*.7:W, .62, along?D*.55:D*.7, cabM, cx, 1.85, cz - (along?D*.2:0)));
      if(along){ g.add(bx(W*.30,.02,.28, M({color:0x1D2124,roughness:.3,metalness:.6}), cx-W*.28,.876,cz)); 
        for(const dx of [-.09,.09]) g.add(cyl(.055,.055,.012, M({color:0x2B3033,roughness:.25}), cx-W*.28+dx,.884,cz));
        g.add(bx(.42,.03,.34, metal, cx+W*.18,.872,cz)); }
      else { g.add(bx(.30,.03,.42, metal, cx,.872,cz+D*.05)); }
    } else if(f.name==='Máy giặt'){
      g.add(bx(W*.62,.84,D*.62, white, cx,.42,cz));
      g.add(cyl(.16,.16,.03, M({color:0x8FA6B2, roughness:.1, metalness:.3}), cx, .5, cz+D*.31).rotateX(Math.PI/2));
    } else if(f.name==='Tủ âm tường'){
      g.add(bx(W,2.35,D,cabD,cx,1.175,cz));
      const n=3;
      for(let i=0;i<n;i++){
        const zz=cz-D/2+D/n*(i+.5);
        g.add(bx(.012,2.25,D/n*.93, M({color:0x7A6A55,roughness:.55}), cx+W/2+.008, 1.175, zz));
        g.add(cyl(.008,.008,.22, metal, cx+W/2+.03, 1.2, zz+D/n*.3).rotateZ(Math.PI/2));
      }
    }
  }));

  // thiết bị vệ sinh trong WC
  const wc=P.rooms.find(r=>r.id==='wc');
  if(wc){
    const X=x=>(wc.x+x)/100, Z=z=>(wc.y+z)/100;
    g.add(bx(.36,.42,.62, white, X(75), .21, Z(150)));
    g.add(rb(.37,.16,.42,.07, white, X(75), .46, Z(163)));
    g.add(bx(.16,.55,.22, white, X(75), .48, Z(120)));
    g.add(rb(.52,.13,.38,.05, white, X(45), .80, Z(228)));
    g.add(cyl(.016,.016,.16, metal, X(45), .92, Z(215)));
    g.add(bx(.5,.7,.02, new THREE.MeshPhysicalMaterial({color:0xE6F0F2,transparent:true,opacity:.2,roughness:.05,metalness:0}), X(45), 1.5, Z(230)));
    const glass=new THREE.MeshPhysicalMaterial({color:0xDCEAF0,transparent:true,opacity:.14,roughness:.04});
    g.add(bx(.02,2.0,1.0, glass, X(142), 1.0, Z(60)));
  }
  return g;
}

/* ---------- rèm, cây, đèn trần ---------- */
function td_decor(){
  const P=plan(), g=new THREE.Group();
  P.rooms.forEach(r=>{
    (r.openings||[]).forEach(o=>{
      if(o.type!=='window' && o.type!=='glass') return;
      const len=o.len/100+.3, h=o.type==='glass'?2.3:1.5, y0=o.type==='glass'?0:.85;
      const cur=curtain(len,h,0xF2EDE3, (o.wall==='N'||o.wall==='S'));
      const inset=.14;
      if(o.wall==='N') cur.position.set((r.x+o.pos+o.len/2)/100, y0+h/2, (r.y)/100+inset);
      else if(o.wall==='S') cur.position.set((r.x+o.pos+o.len/2)/100, y0+h/2, (r.y+r.d)/100-inset);
      else if(o.wall==='W') cur.position.set((r.x)/100+inset, y0+h/2, (r.y+o.pos+o.len/2)/100);
      else cur.position.set((r.x+r.w)/100-inset, y0+h/2, (r.y+o.pos+o.len/2)/100);
      g.add(cur);
    });
  });
  const lg=P.rooms.find(r=>r.id==='logia');
  if(lg){
    [[.35,.5],[.6,1.6],[.4,2.4]].forEach(([px,pz],i)=>{
      const pl=plant(1+ i*.25);
      pl.position.set((lg.x+px*100)/100, 0, (lg.y+pz*100)/100);
      g.add(pl);
    });
  }
  const kh=P.rooms.find(r=>r.type==='khach');
  if(kh){
    const pl=plant(1.15); pl.position.set((kh.x+kh.w-45)/100, 0, (kh.y+40)/100); g.add(pl);
    for(const [fx,fz] of [[.35,.3],[.72,.35],[.5,.75]]){
      const d=cyl(.09,.09,.02, M({color:0xFFF6E2, emissive:0xFFDCA0, emissiveIntensity:.9, roughness:.4}),
        (kh.x+kh.w*fx)/100, WALL_H-.03, (kh.y+kh.d*fz)/100);
      d.castShadow=false; g.add(d);
    }
  }
  return g;
}

/* ---------- dựng cảnh ---------- */
function td_build(){
  if(!TD.ready) return;
  TD.root.traverse(o=>{
    if(o.geometry) o.geometry.dispose();
    if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());
  });
  while(TD.root.children.length) TD.root.remove(TD.root.children[0]);

  const P=plan();
  const floorFinish=currentFloorFinish();
  TD.walls=[];
  P.rooms.forEach(r=>{
    const fm = floorFinish.type==='gach'
      ? M({color:floorFinish.color, map:tileTex(floorFinish.color, floorFinish.grout, 3), roughness:floorFinish.roughness})
      : M({color:floorFinish.color, map:(()=>{const t=woodTex(); t.repeat.set(r.w/160, r.d/160); return t;})(), roughness:floorFinish.roughness});
    const f=new THREE.Mesh(new THREE.PlaneGeometry(r.w/100,r.d/100), fm);
    f.rotation.x=-Math.PI/2;
    f.position.set((r.x+r.w/2)/100, 0, (r.y+r.d/2)/100);
    f.receiveShadow=true; TD.root.add(f);

    ['N','S','W','E'].forEach(sd=>{
      const w=td_wall(r,sd);
      w.position.set(r.x/100,0,r.y/100);
      /* toạ độ thật của MẶT tường đó (không phải góc gốc phòng dùng chung cho cả 4
         tường) — cần để ẩn đúng tường đang chắn giữa camera và trong phòng khi xoay */
      w.userData.ref = sd==='N' ? r.y/100 : sd==='S' ? (r.y+r.d)/100
                      : sd==='W' ? r.x/100 : (r.x+r.w)/100;
      TD.root.add(w); TD.walls.push(w);
    });
    itemsIn(r.id).forEach(it=>TD.root.add(td_furniture(it,r.x,r.y)));
  });
  TD.root.add(td_fixtures());
  TD.root.add(td_decor());

  if(S.sel!=null){
    const g=TD.root.children.find(o=>o.userData&&o.userData.uid===S.sel);
    if(g) TD.root.add(new THREE.BoxHelper(g,0xC08A2E));
  }
  const d=Math.max(P.w,P.d)/100;
  TD.sun.position.set(P.w/100+d*.5, d*1.5, P.d/200 - d*.35);
  TD.sun.target.position.set(P.w/200,0,P.d/200);
  const sc=TD.sun.shadow.camera;
  sc.left=-d; sc.right=d; sc.top=d; sc.bottom=-d; sc.near=.5; sc.far=d*5;
  sc.updateProjectionMatrix();
}

function td_cam(){
  const P=plan(), cx=P.w/200, cz=P.d/200, o=TD.orbit;
  TD.camera.position.set(
    cx+Math.sin(o.az)*Math.sin(o.pol)*o.dist,
    Math.max(.5, Math.cos(o.pol)*o.dist),
    cz+Math.cos(o.az)*Math.sin(o.pol)*o.dist);
  TD.camera.lookAt(cx,.8,cz);
}
function td_cullWalls(){
  const C=TD.camera.position;
  (TD.walls||[]).forEach(w=>{
    const s=w.userData.side, ref=w.userData.ref;
    w.visible=!((s==='N'&&C.z<ref)||(s==='S'&&C.z>ref+.01)||
                (s==='W'&&C.x<ref)||(s==='E'&&C.x>ref+.01));
  });
}
function td_resize(){
  const host=document.getElementById('three');
  const w=host.clientWidth||1,h=host.clientHeight||1;
  TD.renderer.setSize(w,h,false);
  TD.camera.aspect=w/h; TD.camera.updateProjectionMatrix();
}
function td_loop(){
  if(!TD.active){ TD.looping=false; return; }
  td_cam(); td_cullWalls();
  TD.renderer.render(TD.scene,TD.camera);
  requestAnimationFrame(td_loop);
}

function envMap(renderer){
  const W=64,H=32,c=cvs(W,H),x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#DCE9F5'); g.addColorStop(.45,'#F3F0E8');
  g.addColorStop(.55,'#E8DFCE'); g.addColorStop(1,'#8B7A63');
  x.fillStyle=g; x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,246,225,.95)'; x.beginPath(); x.arc(W*.72,H*.22,5,0,7); x.fill();
  const t=new THREE.CanvasTexture(c);
  t.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const env=pmrem.fromEquirectangular(t).texture;
  pmrem.dispose(); t.dispose();
  return env;
}

function td_init(){
  if(TD.ready||!HAS3D) return;
  const host=document.getElementById('three');
  TD.renderer=new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
  TD.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  TD.renderer.shadowMap.enabled=true;
  TD.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  if(THREE.sRGBEncoding) TD.renderer.outputEncoding=THREE.sRGBEncoding;
  if(THREE.ACESFilmicToneMapping){ TD.renderer.toneMapping=THREE.ACESFilmicToneMapping; TD.renderer.toneMappingExposure=1.05; }
  host.appendChild(TD.renderer.domElement);

  TD.scene=new THREE.Scene();
  TD.scene.background=new THREE.Color(0x171310);
  try{ TD.scene.environment=envMap(TD.renderer); }catch(e){}
  TD.camera=new THREE.PerspectiveCamera(38,1,.05,300);
  TD.root=new THREE.Group(); TD.scene.add(TD.root);
  TD.hemi=new THREE.HemisphereLight(0xF4F7FF,0x8A7A62,.55); TD.scene.add(TD.hemi);
  TD.sun=new THREE.DirectionalLight(0xFFF0D8,1.35);
  TD.sun.castShadow=true;
  TD.sun.shadow.mapSize.set(2048,2048);
  TD.sun.shadow.bias=-0.0006;
  TD.sun.shadow.radius=3;
  TD.scene.add(TD.sun); TD.scene.add(TD.sun.target);
  const fill=new THREE.DirectionalLight(0xCFE0FF,.35); fill.position.set(-4,5,6); TD.scene.add(fill);
  applyLightPreset();

  const el=TD.renderer.domElement;
  const ray=new THREE.Raycaster(), plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  const ptr=new THREE.Vector2(), hitPt=new THREE.Vector3();
  let mode=null,last=null,moveOff=null,pointers=new Map(),pinch0=0;
  const toPtr=e=>{ const b=el.getBoundingClientRect();
    ptr.x=(e.clientX-b.left)/b.width*2-1; ptr.y=-((e.clientY-b.top)/b.height*2-1); };
  const groundAt=e=>{ toPtr(e); ray.setFromCamera(ptr,TD.camera);
    return ray.ray.intersectPlane(plane,hitPt)?hitPt.clone():null; };

  el.addEventListener('pointerdown',e=>{
    el.setPointerCapture(e.pointerId); pointers.set(e.pointerId,e);
    if(pointers.size===2){ const [a,b]=[...pointers.values()];
      pinch0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY); mode='pinch'; return; }
    toPtr(e); ray.setFromCamera(ptr,TD.camera);
    const hits=ray.intersectObjects(TD.root.children,true);
    let uid=null;
    for(const h of hits){ let o=h.object;
      while(o&&!(o.userData&&o.userData.uid!=null)) o=o.parent;
      if(o){ uid=o.userData.uid; break; } }
    if(uid!=null){
      let host=null;
      plan().rooms.forEach(r=>{ if(itemsIn(r.id).some(i=>i.uid===uid)) host=r; });
      if(host&&host.id!==S.roomId){ S.roomId=host.id; renderAll(); }
      S.sel=uid; renderToolbar(); td_build();
      const it=items().find(i=>i.uid===uid), r0=room(), g=groundAt(e);
      moveOff=g?{dx:g.x*100-r0.x-it.x, dy:g.z*100-r0.y-it.y}:{dx:0,dy:0};
      mode='move';
    } else { mode='orbit'; last={x:e.clientX,y:e.clientY}; }
  });
  el.addEventListener('pointermove',e=>{
    if(pointers.has(e.pointerId)) pointers.set(e.pointerId,e);
    if(mode==='pinch'&&pointers.size===2){
      const [a,b]=[...pointers.values()];
      const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
      if(pinch0) TD.orbit.dist=Math.max(1.8,Math.min(34,TD.orbit.dist*pinch0/d));
      pinch0=d; return; }
    if(mode==='orbit'){
      TD.orbit.az-=(e.clientX-last.x)*.008;
      TD.orbit.pol=Math.max(.10,Math.min(1.45,TD.orbit.pol-(e.clientY-last.y)*.006));
      last={x:e.clientX,y:e.clientY};
    } else if(mode==='move'&&S.sel!=null){
      const g=groundAt(e); if(!g) return;
      const it=items().find(i=>i.uid===S.sel); if(!it) return;
      const r=room(), dm=dims(it);
      it.x=Math.max(-20,Math.min(Math.round((g.x*100-r.x-moveOff.dx)/5)*5, r.w+20-dm.w));
      it.y=Math.max(-20,Math.min(Math.round((g.z*100-r.y-moveOff.dy)/5)*5, r.d+20-dm.d));
      const grp=TD.root.children.find(o=>o.userData&&o.userData.uid===it.uid);
      if(grp) grp.position.set((r.x+it.x+dm.w/2)/100,0,(r.y+it.y+dm.d/2)/100);
    }
  });
  const endPtr=e=>{ pointers.delete(e.pointerId);
    if(mode==='move'){ draw(); renderChecks(); renderReceipt(); td_build(); }
    if(pointers.size<2) pinch0=0;
    mode=pointers.size?mode:null; };
  el.addEventListener('pointerup',endPtr);
  el.addEventListener('pointercancel',endPtr);
  el.addEventListener('wheel',e=>{ e.preventDefault();
    TD.orbit.dist=Math.max(1.8,Math.min(34,TD.orbit.dist+e.deltaY*.006)); },{passive:false});
  TD.ready=true;
}

function setView(v){
  const is3=(v==='3d');
  if(is3&&!HAS3D){
    const m=document.getElementById('threeMsg');
    m.classList.add('on');
    m.textContent='Không tải được thư viện 3D. Hãy dùng chế độ Mặt bằng 2D (đầy đủ tính năng).';
    return;
  }
  TD.active=is3;
  document.getElementById('btn2d').setAttribute('aria-pressed',String(!is3));
  document.getElementById('btn3d').setAttribute('aria-pressed',String(is3));
  document.getElementById('three').classList.toggle('on',is3);
  document.getElementById('cv').classList.toggle('off',is3);
  if(is3){
    td_init();
    const P=plan();
    if(!TD.seen){ TD.orbit.dist=Math.max(P.w,P.d)/100*1.5+1.2; TD.seen=true; }
    td_resize(); td_build();
    if(!TD.looping){ TD.looping=true; td_loop(); }
  } else draw();
}
document.getElementById('btn2d').onclick=()=>setView('2d');
document.getElementById('btn3d').onclick=()=>setView('3d');
document.getElementById('btnLight').onclick=()=>{
  const keys=Object.keys(LIGHT_PRESETS);
  S.lightPreset=keys[(keys.indexOf(S.lightPreset)+1)%keys.length];
  applyLightPreset(); saveState();
};
document.getElementById('btnResetView').onclick=()=>{
  setView('3d');
  const P=plan();
  TD.orbit.az=-0.62; TD.orbit.pol=0.72;
  TD.orbit.dist=Math.max(P.w,P.d)/100*1.5+1.2;
  TD.camera.fov=38; TD.camera.updateProjectionMatrix();
};
document.getElementById('btnDoll').onclick=()=>{
  setView('3d');
  const P=plan();
  TD.orbit.az=-0.30; TD.orbit.pol=0.30;
  TD.orbit.dist=Math.max(P.w,P.d)/100*1.75+1;
  TD.camera.fov=30; TD.camera.updateProjectionMatrix();
};
document.getElementById('btnShot').onclick=()=>{
  if(!TD.active){ setView('3d'); setTimeout(()=>document.getElementById('btnShot').click(),450); return; }
  td_cam(); td_cullWalls(); TD.renderer.render(TD.scene,TD.camera);
  const a=document.createElement('a');
  a.download='fithome-'+S.planId+'.png';
  a.href=TD.renderer.domElement.toDataURL('image/png');
  a.click();
};

/* =========================================================
   10. AR — dựng chính mô hình 3D đó lên hình ảnh camera
   ========================================================= */
const AR={ready:false,on:false,spin:0,idx:0,pos:{x:0,z:0},looping:false};
let stream=null;
function arItems(){
  const all=plan().rooms.flatMap(r=>itemsIn(r.id));
  return all.length?all:[{uid:-1,id:'s1',x:0,y:0,rot:0}];
}
function ar_init(){
  if(AR.ready||!HAS3D) return;
  const c=document.getElementById('arCanvas');
  AR.renderer=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true});
  AR.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  AR.renderer.shadowMap.enabled=true;
  AR.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  if(THREE.sRGBEncoding) AR.renderer.outputEncoding=THREE.sRGBEncoding;
  if(THREE.ACESFilmicToneMapping){ AR.renderer.toneMapping=THREE.ACESFilmicToneMapping; AR.renderer.toneMappingExposure=1.1; }
  AR.scene=new THREE.Scene();
  try{ AR.scene.environment=envMap(AR.renderer); }catch(e){}
  AR.camera=new THREE.PerspectiveCamera(52,1,.05,100);
  AR.scene.add(new THREE.HemisphereLight(0xFFFFFF,0x999999,.85));
  const d=new THREE.DirectionalLight(0xFFFFFF,.85);
  d.position.set(2,4,2); d.castShadow=true; d.shadow.mapSize.set(1024,1024); AR.scene.add(d);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(14,14), new THREE.ShadowMaterial({opacity:.3}));
  sh.rotation.x=-Math.PI/2; sh.receiveShadow=true; AR.scene.add(sh);
  AR.root=new THREE.Group(); AR.scene.add(AR.root);
  let dragging=false,last=null;
  c.addEventListener('pointerdown',e=>{dragging=true;last={x:e.clientX,y:e.clientY};c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{
    if(!dragging) return;
    AR.pos.x=Math.max(-2.5,Math.min(2.5,AR.pos.x+(e.clientX-last.x)*.006));
    AR.pos.z=Math.max(-3,Math.min(1.2,AR.pos.z+(e.clientY-last.y)*.006));
    last={x:e.clientX,y:e.clientY}; ar_place();
  });
  const up=()=>dragging=false;
  c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up);
  AR.ready=true;
}
function ar_place(){ if(AR.root){ AR.root.position.set(AR.pos.x,0,AR.pos.z); AR.root.rotation.y=AR.spin*Math.PI/180; } }
function ar_build(){
  if(!AR.ready) return;
  while(AR.root.children.length) AR.root.remove(AR.root.children[0]);
  const list=arItems();
  if(AR.idx>=list.length) AR.idx=0;
  const src=list[AR.idx], p=byId(src.id);
  AR.root.add(td_furniture({uid:-1,id:src.id,x:-p.w/2,y:-p.d/2,rot:0},0,0));
  ar_place();
  document.getElementById('arTag').textContent=
    p.name+' · '+p.brand+' · '+p.w+'×'+p.d+'×'+p.h+' cm · '+vnd(p.price);
}
function ar_resize(){
  const st=document.querySelector('.arstage');
  AR.renderer.setSize(st.clientWidth,st.clientHeight,false);
  AR.camera.aspect=st.clientWidth/st.clientHeight; AR.camera.updateProjectionMatrix();
}
function ar_loop(){
  if(!AR.on){ AR.looping=false; return; }
  const h=(+document.getElementById('arScale').value)/100;
  AR.camera.position.set(0,1.35,h);
  AR.camera.lookAt(AR.pos.x,.35,AR.pos.z);
  AR.renderer.render(AR.scene,AR.camera);
  requestAnimationFrame(ar_loop);
}
document.getElementById('btnAr').onclick=async()=>{
  document.getElementById('arView').classList.add('on');
  if(!HAS3D){ document.getElementById('arNote').textContent='Chế độ AR cần thư viện 3D.'; return; }
  ar_init(); AR.on=true;
  setTimeout(()=>{ ar_resize(); ar_build(); if(!AR.looping){AR.looping=true;ar_loop();} },30);
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    document.getElementById('arVideo').srcObject=stream;
  }catch(err){
    document.getElementById('arNote').textContent='Không mở được camera — mô hình vẫn hiện trên nền đen để trình bày. Trên điện thoại, mở qua HTTPS và cho phép truy cập camera.';
  }
};
document.getElementById('arClose').onclick=()=>{
  document.getElementById('arView').classList.remove('on'); AR.on=false;
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
};
document.getElementById('arPrev').onclick=()=>{ AR.idx=(AR.idx-1+arItems().length)%arItems().length; ar_build(); };
document.getElementById('arNext').onclick=()=>{ AR.idx=(AR.idx+1)%arItems().length; ar_build(); };
document.getElementById('arSpin').onclick=()=>{ AR.spin=(AR.spin+45)%360; ar_place(); };
window.addEventListener('resize',()=>{ if(AR.on) ar_resize(); });

/* =========================================================
   ĐĂNG NHẬP (MOCK) — chỉ minh hoạ luồng "phải đăng nhập mới dùng được"
   khi demo đồ án. KHÔNG PHẢI hệ thống xác thực thật: không có máy chủ,
   không kiểm tra mật khẩu đúng/sai, mật khẩu không được lưu lại ở bất kỳ
   đâu (kể cả localStorage) — chỉ tên đăng nhập được nhớ để lần sau vào
   thẳng, giống kiểu "ghi nhớ đăng nhập" thông thường.
   ========================================================= */
const AUTH_KEY = 'fithome_auth_v1';
function renderUserBar(username){
  $('#userTag').innerHTML = (isPremium() ? '<b>★ Premium</b> · ' : '') + 'Xin chào, ' + username;
}
function showApp(username){
  $('#authGate').classList.add('hidden');
  renderUserBar(username);
}
function checkAuth(){
  try{
    const saved = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    if (saved && saved.username){ showApp(saved.username); return; }
  }catch(e){}
  $('#authGate').classList.remove('hidden');
}
$('#authForm').addEventListener('submit', e => {
  e.preventDefault();
  const u = $('#authUser').value.trim();
  if (!u) return;
  try{ localStorage.setItem(AUTH_KEY, JSON.stringify({username:u})); }catch(err){}
  $('#authPass').value = '';
  showApp(u);
});
$('#btnLogout').onclick = () => {
  try{ localStorage.removeItem(AUTH_KEY); }catch(e){}
  location.reload();
};

/* =========================================================
   PREMIUM (MOCK) — hộp/nút nâng cấp chỉ minh hoạ giao diện gói trả phí,
   CHƯA nối cổng thanh toán thật: bấm "xác nhận" chỉ lưu 1 cờ ở máy bạn,
   không thu tiền, không hỏi thông tin thẻ / tài khoản ngân hàng.
   ========================================================= */
const PREMIUM_KEY = 'fithome_premium_v1';
const isPremium = () => { try{ return localStorage.getItem(PREMIUM_KEY) === '1'; }catch(e){ return false; } };
function renderPremiumBox(){
  const box = $('#premiumBox');
  if (isPremium()){
    box.innerHTML = `<div class="premiumHead"><b>FIT·HOME</b><span class="premiumTag">Premium</span></div>
      <p class="premiumOk">✓ Bạn đang dùng bản Premium (demo).</p>`;
  } else {
    box.innerHTML = `<div class="premiumHead"><b>FIT·HOME</b><span class="premiumTag">Premium</span></div>
      <p class="premiumDesc">Mở khoá ánh sáng 3D nâng cao, lưu không giới hạn mẫu bố trí, xuất ảnh độ phân giải cao.</p>
      <button class="btn primary sm" id="btnPremium">Nâng cấp Premium — 49.000 đ/tháng</button>`;
    $('#btnPremium').onclick = () => $('#premiumModal').classList.add('on');
  }
}
$('#premiumClose').onclick = () => $('#premiumModal').classList.remove('on');
$('#premiumConfirm').onclick = () => {
  try{ localStorage.setItem(PREMIUM_KEY, '1'); }catch(e){}
  $('#premiumModal').classList.remove('on');
  renderPremiumBox();
  try{
    const saved = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    if (saved && saved.username) renderUserBar(saved.username);
  }catch(e){}
};

/* =========================================================
   11. KHỞI ĐỘNG
   ========================================================= */
checkAuth();
renderPremiumBox();
const restoredSaved = loadState();
buildSelects();
buildNeeds();
buildCatalog();
$('#inpBudget').value = S.budget;
$('#inpYear').value = S.year;
resize();
if (restoredSaved) renderAll(); else autoLayoutAll();
window.addEventListener('beforeunload', saveState);
