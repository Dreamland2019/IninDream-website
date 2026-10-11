/**
 * 房间选择面板（★ walk.html 和 hub.html 共用这一份）
 * ═══════════════════════════════════════════════════════════════════════════
 * 2026-10-13 用户需求 2：「新增一个按键，使得用户无论在何地都可以唤起终端页面」。
 *   为什么"无论何地"是硬需求（用户原话）：
 *     "之后要加很多宿舍，而走廊做很长不太现实，我打算走廊的 6 间只放我个人比较喜欢的。"
 *   ⇒ 走廊只放精选几间，剩下的房间【只能靠这个面板进】——
 *     所以面板必须两边都有，而且长得一样、按键一样。抽成一个模块就不会各改各的。
 *
 * 这个模块【只管 DOM 与交互】，不碰 three.js、不碰 localStorage、不碰指针锁：
 *   · 打开/关闭时的副作用（解锁鼠标、清空按键、停住移动）由调用方负责
 *   · 键位由调用方在它自己的 keydown 里调 panelKey(e)，返回 true 就 preventDefault
 *   · 面板的 z-index 固定 48 —— ★ 要低于 #fade(50)，切房间时淡出才盖得住它
 * ═══════════════════════════════════════════════════════════════════════════ */

const Z = 48;
let _opts = null;          // 当前这次打开的配置
let _open = false;

export function isRoomPanelOpen(){ return _open; }

/** 打开面板
 *  opts = {
 *    rooms:   [{ theme, name, desc }]  必填，要列出的房间（调用方自己决定排除哪些）
 *    title:   '房 间 选 择'            可选
 *    onPick:  (theme) => {}            必填，点了某间房
 *    onHub:   () => {} | null          传 null/省略 = 不显示"回走廊"按钮
 *    onClose: () => {}                 可选，关闭时回调
 *    note:    string                   可选，底部额外说明
 *  } */
export function openRoomPanel(opts){
  if (!opts || !opts.rooms || !opts.rooms.length) return false;
  _opts = opts;
  _open = true;

  let box = document.getElementById('roomPanel');
  if (!box){
    box = document.createElement('div');
    box.id = 'roomPanel';
    box.style.cssText = 'position:fixed;inset:0;z-index:' + Z + ';display:none;' +
      'align-items:center;justify-content:center;background:rgba(4,8,12,.72)';
    const card = document.createElement('div');
    card.id = 'roomPanelCard';
    card.style.cssText = 'width:min(900px,94vw);max-height:88vh;overflow:auto;' +
      'padding:20px 22px;border:1px solid #4b7fa8;border-radius:8px;' +
      'background:rgba(9,13,19,.97);color:#cfe6f7;' +
      'font-family:"HarmonyOS Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;' +
      'box-shadow:0 16px 50px rgba(0,0,0,.7)';
    card.appendChild(document.createElement('div')).id = 'roomPanelHead';
    const grid = document.createElement('div');
    grid.id = 'roomPanelGrid';
    /* ★ 自适应列数（不写死 3 列）—— 房间加到十几间时会自动多排几列，
       不会变成一条又长又窄的列表 */
    grid.style.cssText = 'display:grid;gap:14px;' +
      'grid-template-columns:repeat(auto-fill,minmax(190px,1fr))';
    card.appendChild(grid);
    card.appendChild(document.createElement('div')).id = 'roomPanelFoot';
    box.appendChild(card);
    // 点遮罩空白处关闭
    box.addEventListener('click', (ev) => { if (ev.target === box) closeRoomPanel(); });
    document.body.appendChild(box);
  }

  // ── 标题
  const head = document.getElementById('roomPanelHead');
  head.style.cssText = 'display:flex;align-items:baseline;gap:12px;padding-bottom:12px;' +
    'margin-bottom:14px;border-bottom:1px solid #2c4a63;flex-wrap:wrap';
  head.innerHTML = '<span style="font-size:16px;font-weight:600;letter-spacing:.18em;color:#e8f4ff">' +
    (opts.title || '房 间 选 择') + '</span>' +
    '<span style="font-size:11px;letter-spacing:.14em;color:#7d97ae">' +
    '共 ' + opts.rooms.length + ' 间　·　点了直接过去　·　Tab 关闭　·　Esc 关闭</span>';

  // ── 卡片（每次重建：房间清单可能变）
  const grid = document.getElementById('roomPanelGrid');
  grid.innerHTML = '';
  opts.rooms.forEach((r, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.theme = r.theme;
    b.style.cssText = 'display:flex;flex-direction:column;gap:0;padding:0;cursor:pointer;' +
      'border:1px solid #33506a;border-radius:6px;overflow:hidden;background:#0d1a26;' +
      'color:#cfe6f7;text-align:left;font:inherit;transition:border-color .16s,transform .16s';
    b.addEventListener('mouseenter', () => { b.style.borderColor = '#5fd8e8'; b.style.transform = 'translateY(-2px)'; });
    b.addEventListener('mouseleave', () => { b.style.borderColor = '#33506a'; b.style.transform = 'none'; });
    const img = document.createElement('img');
    /* ★★★ 2026-10-13（用户拍板）图源顺序：
         ① `assets\previews\<主题>.webp` —— **首选**。这是游戏【家具商店的宣传卡】
            （480×296，分辨率更高，图上带「罗德岛采购部 家居套装」+ 主题名，有游戏特色）
            ⚠️ 但只有【商店套装】才有这套图
         ② `assets\theme_cards\<主题>.png` —— 备用。游戏「主题选择」界面的**干净渲染图**
            （226×169 / 228×172，无文字）。★ 它覆盖游戏里【全部 139 个主题】，
            所以 `furniM_` 家族（会客室 / 蓝丝绒 / 阿米娅 / 太鼓）只能从这儿取
         ③ 两套都没有 → 显示 NO PREVIEW 占位（不留破图）
       ★ 两套图【宽高比不同】（480×296 ≈ 1.62 vs 228×172 ≈ 1.33），
         所以下面用 `object-fit: contain` —— 高的那张填满，扁的那张自动左右留边，
         两种都不裁切、不变形。（原来写的是 cover，会把 theme_cards 那套上下裁掉 18%。） */
    /* ★★★ 2026-10-14 性能优化：.png → .webp（见 manifest.js 的 previewOf 注释）
       7 张图 1529 KB → 249 KB，省 1.28 MB。图本身、分辨率、比例都没动。 */
    const CARD_SRC     = './assets/previews/' + r.theme + '.webp';
    const FALLBACK_SRC = './assets/theme_cards/' + r.theme + '.png';
    img.src = CARD_SRC;
    img.alt = r.name;
    img.style.cssText = 'display:block;width:100%;aspect-ratio:480/296;object-fit:contain;' +
      'background:#12212e;border-bottom:1px solid #24405a';
    let _tried = 0;
    img.addEventListener('error', () => {
      _tried++;
      if (_tried === 1){ img.src = FALLBACK_SRC; return; }
      img.style.display = 'none';
      const ph = document.createElement('div');
      ph.style.cssText = 'display:flex;align-items:center;justify-content:center;' +
        'aspect-ratio:480/296;background:#12212e;border-bottom:1px solid #24405a;' +
        'color:#3f5a72;font:11px ui-monospace,Consolas,monospace;letter-spacing:.16em';
      ph.textContent = 'NO PREVIEW';
      if (img.parentNode) img.parentNode.insertBefore(ph, img);
    });
    const cap = document.createElement('div');
    cap.style.cssText = 'display:flex;align-items:center;gap:8px;padding:9px 11px;font-size:12.5px';
    // ★ 只有前 9 间显示数字角标（数字键只有 1~9）；第 10 间起靠鼠标点
    const badge = (i < 9)
      ? '<span style="flex:0 0 auto;min-width:20px;height:20px;line-height:20px;' +
        'text-align:center;border:1px solid #4b7fa8;border-radius:3px;background:#16324a;' +
        'color:#a8d4f0;font:600 11px/20px ui-monospace,Consolas,monospace">' + (i + 1) + '</span>'
      : '';
    cap.innerHTML = badge + '<span style="color:#dfeaf5">' + r.name + '</span>';
    b.appendChild(img); b.appendChild(cap);
    if (r.desc) b.title = r.desc;
    b.addEventListener('click', () => { const t = r.theme; closeRoomPanel(); opts.onPick && opts.onPick(t); });
    grid.appendChild(b);
  });

  // ── 底部
  const foot = document.getElementById('roomPanelFoot');
  foot.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:16px;' +
    'padding-top:14px;border-top:1px solid #2c4a63;flex-wrap:wrap';
  foot.innerHTML = '';
  if (opts.onHub){
    const dormBtn = document.createElement('button');
    dormBtn.type = 'button';
    dormBtn.textContent = opts.hubLabel || '← 回走廊（宿舍走廊）';
    dormBtn.style.cssText = 'padding:9px 16px;cursor:pointer;border:1px solid #5fd8e8;' +
      'border-radius:4px;background:rgba(95,216,232,.12);color:#9fe8ff;font:12.5px inherit';
    dormBtn.addEventListener('click', () => { const f = opts.onHub; closeRoomPanel(); f(); });
    foot.appendChild(dormBtn);
  }
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '关闭（Esc / Tab）';
  closeBtn.style.cssText = 'margin-left:auto;padding:9px 16px;cursor:pointer;' +
    'border:1px solid #33506a;border-radius:4px;background:transparent;color:#8fa8bf;font:12.5px inherit';
  closeBtn.addEventListener('click', () => closeRoomPanel());
  foot.appendChild(closeBtn);
  const tip = document.createElement('span');
  tip.style.cssText = 'font-size:11px;color:#6d879e;width:100%';
  tip.textContent = opts.note || ('也可以按 1~9 直接选　·　' +
    (opts.onHub ? '按 0 回走廊　·　' : '') + '关闭后点一下画面继续走动');
  foot.appendChild(tip);

  box.style.display = 'flex';
  return true;
}

export function closeRoomPanel(){
  if (!_open) return false;
  _open = false;
  const box = document.getElementById('roomPanel');
  if (box) box.style.display = 'none';
  const cb = _opts && _opts.onClose;
  _opts = null;
  if (cb) { try { cb(); } catch (e) {} }
  return true;
}

/** 键位 —— 调用方在 keydown 里调它；返回 true 表示"这个键我吃了，请 preventDefault"
 *  ★ 这里只处理【面板已经开着】时的键（Esc / 1~9 / 0）。
 *    "Tab 打开"那一下【不在这里】—— 面板自己不知道要列哪些房间，
 *    得由调用方去 openRoomPanel()。调用方照这个写法接：
 *      if (e.code === 'Tab'){ isRoomPanelOpen() ? closeRoomPanel() : openMyPanel(); return true; }
 *      if (panelKey(e)) return true;   */
export function panelKey(e){
  if (!_open) return false;
  const code = e.code || '';
  if (code === 'Escape'){ closeRoomPanel(); return true; }
  if (code.indexOf('Digit') === 0){
    const n = parseInt(code.slice(5), 10);
    const rooms = (_opts && _opts.rooms) || [];
    if (n >= 1 && n <= 9 && n <= rooms.length){
      const t = rooms[n - 1].theme;
      const pick = _opts.onPick;
      closeRoomPanel();
      if (pick) pick(t);
      return true;
    }
    if (code === 'Digit0' && _opts && _opts.onHub){
      const hub = _opts.onHub;
      closeRoomPanel();
      hub();
      return true;
    }
    return true;      // 面板开着时数字键一律别漏到游戏里
  }
  return false;
}
