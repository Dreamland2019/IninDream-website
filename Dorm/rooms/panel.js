/**
 * 房间选择面板（★ walk.html 和 hub.html 共用这一份）
 * ═══════════════════════════════════════════════════════════════════════════
 * 2026-10-13 用户需求 2：「新增一个按键，使得用户无论在何地都可以唤起终端页面」。
 *   为什么"无论何地"是硬需求（用户原话）：
 *     "之后要加很多宿舍，而走廊做很长不太现实，我打算走廊的 6 间只放我个人比较喜欢的。"
 *   ⇒ 走廊只放精选几间，剩下的房间【只能靠这个面板进】——
 *     所以面板必须两边都有，而且长得一样、按键一样。抽成一个模块就不会各改各的。
 *
 * ★★ 2026-10-15 用户需求 3：「宿舍选择页面需要加一个搜索功能」。
 *   起因同上：走廊固定 6 门位，新宿舍只能从这里进，而面板是全部房间平铺 ——
 *   房间一多，肉眼找一间就很费劲。搜索框 + 结果计数 + 数字键认搜索结果。
 *
 * 这个模块【只管 DOM 与交互】，不碰 three.js、不碰 localStorage、不碰指针锁：
 *   · 打开/关闭时的副作用（解锁鼠标、清空按键、停住移动）由调用方负责
 *   · 键位由调用方在它自己的 keydown 里调 panelKey(e)，返回 true 就 preventDefault
 *   · 面板的 z-index 固定 48 —— ★ 要低于 #fade(50)，切房间时淡出才盖得住它
 * ═══════════════════════════════════════════════════════════════════════════ */

const Z = 48;
let _opts = null;          // 当前这次打开的配置
let _open = false;
/* ★★ 2026-10-15 加（搜索功能）：
   `_allRooms` = 本次打开时调用方给的全部房间（**不修改调用方的数组**）；
   `_viewRooms` = 搜索过滤后的列表 —— ★ 数字键 1~9 认的就是它，
   所以"搜一下再按 3"选的是【搜索结果里的第 3 个】，和卡片上显示的角标一致。 */
let _allRooms = [];
let _viewRooms = [];
let _q = '';               // 当前搜索词
let _redraw = null;        // 当前打开的面板的"只重建网格"回调（搜索时用）

export function isRoomPanelOpen(){ return _open; }

/** 打开面板
 *  opts = {
 *    rooms:   [{ theme, name, desc, tag? }]  必填，要列出的房间（调用方自己决定排除哪些）
 *    title:   '房 间 选 择'            可选
 *    onPick:  (theme) => {}            必填，点了某间房
 *    onHub:   () => {} | null          传 null/省略 = 不显示"回走廊"按钮
 *    onClose: () => {}                 可选，关闭时回调
 *    hubLabel: string                  可选，"回走廊"按钮上的字
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

    /* ★★★ 2026-10-15 加：搜索栏（用户需求原文："宿舍选择页面需要加一个搜索功能"）
       为什么必需：走廊固定只有 6 个门位，新宿舍【只能靠这个面板进】，
       而面板是"全部房间"平铺 —— 房间一多，肉眼找一间就很费劲。
       匹配范围：中文名 / 主题 key（英文）/ 短标签 / 官方简介，全部大小写不敏感。
       ★ 只做"包含"匹配，不做拼音/模糊 —— 用户输入中文或主题 key 都能中
         （示例：`甜点`、`dessertShop`、`dessert`、`工作室` 都能定位到对应房间）。 */
    const bar = document.createElement('div');
    bar.id = 'roomPanelSearchBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:10px;margin:-4px 0 14px';
    const si = document.createElement('input');
    si.id = 'roomPanelSearch';
    si.type = 'search';
    si.autocomplete = 'off';
    si.spellcheck = false;
    si.placeholder = '搜索房间：中文名 / 主题名（英文）/ 标签 / 简介…';
    /* ★ 字号必须 ≥16px：iOS Safari 对 <16px 的输入框会在聚焦时【自动放大整页】，
       手机端体验会突然跳一下。（本项目手机端是重点，这条别再改小。） */
    si.style.cssText = 'flex:1 1 auto;min-width:0;padding:9px 12px;border:1px solid #33506a;' +
      'border-radius:4px;background:#0b1620;color:#dfeaf5;font-size:16px;font-family:inherit;' +
      'outline:none';
    si.addEventListener('focus', () => { si.style.borderColor = '#5fd8e8'; });
    si.addEventListener('blur',  () => { si.style.borderColor = '#33506a'; });
    si.addEventListener('input', () => { _q = si.value; if (_redraw) _redraw(); });
    si.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter'){
        // ★ 回车 = 进第一个匹配（搜索结果保持调用方给的顺序）
        if (_viewRooms.length){
          const t = _viewRooms[0].theme;
          const pick = _opts && _opts.onPick;
          closeRoomPanel();
          if (pick) pick(t);
        }
        ev.preventDefault();
        ev.stopPropagation();
      } else if (ev.key === 'Escape'){
        // Esc 在输入框里：先清空搜索，清空后再按才关面板（防手滑关掉整个面板）
        if (si.value){ si.value = ''; _q = ''; if (_redraw) _redraw(); }
        else closeRoomPanel();
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
    const sCount = document.createElement('span');
    sCount.id = 'roomPanelSearchCount';
    sCount.style.cssText = 'flex:0 0 auto;font-size:11.5px;color:#7d97ae;' +
      'font-family:ui-monospace,Consolas,monospace';
    bar.appendChild(si);
    bar.appendChild(sCount);
    card.appendChild(bar);

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

  // ── 标题（★ 2026-10-15：把"共 N 间"挪到搜索栏右侧的计数里，这里只留操作提示）
  const head = document.getElementById('roomPanelHead');
  head.style.cssText = 'display:flex;align-items:baseline;gap:12px;padding-bottom:12px;' +
    'margin-bottom:14px;border-bottom:1px solid #2c4a63;flex-wrap:wrap';
  head.innerHTML = '<span style="font-size:16px;font-weight:600;letter-spacing:.18em;color:#e8f4ff">' +
    (opts.title || '房 间 选 择') + '</span>' +
    '<span style="font-size:11px;letter-spacing:.14em;color:#7d97ae">' +
    '点了直接过去　·　Tab 关闭　·　Esc 关闭　·　按 / 搜索</span>';

  // ── ★ 2026-10-15：搜索状态复位（每次打开都从"全部房间 + 空搜索词"开始）
  _allRooms = Array.isArray(opts.rooms) ? opts.rooms.slice() : [];
  _q = '';
  const siEl = document.getElementById('roomPanelSearch');
  if (siEl) siEl.value = '';

  // ── 卡片（每次重建：房间清单可能变）
  const grid = document.getElementById('roomPanelGrid');
  const sCount = document.getElementById('roomPanelSearchCount');

  /** 只重建网格 —— 搜索框的 input 事件通过模块级 `_redraw` 调它。
   *  ★ 过滤只影响【显示 / 角标 / 数字键】，不动调用方给的数组（`_allRooms` 是副本）。 */
  const draw = () => {
    const q = _q.trim().toLowerCase();
    _viewRooms = !q ? _allRooms.slice() : _allRooms.filter((r) => {
      const hay = [r.name, r.theme, r.tag, r.desc].filter(Boolean).join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    if (sCount){
      sCount.textContent = q ? (_viewRooms.length + ' / ' + _allRooms.length + ' 间')
                             : ('共 ' + _allRooms.length + ' 间');
      sCount.style.color = (q && !_viewRooms.length) ? '#e8845f' : '#7d97ae';
    }
    grid.innerHTML = '';
    if (!_viewRooms.length){
      const none = document.createElement('div');
      none.style.cssText = 'grid-column:1/-1;padding:26px 8px;text-align:center;' +
        'color:#6d879e;font-size:12.5px';
      none.textContent = '没有匹配的房间 —— 换个关键词，或清空搜索框看全部';
      grid.appendChild(none);
      return;
    }
    _viewRooms.forEach((r, i) => {
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
  };
  _redraw = draw;
  draw();

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
  tip.textContent = opts.note || ('也可以按 1~9 直接选（认的是搜索结果）　·　' +
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
  _redraw = null;
  if (cb) { try { cb(); } catch (e) {} }
  return true;
}

/** 键位 —— 调用方在 keydown 里调它；返回 true 表示"这个键我吃了，请 preventDefault"
 *  ★ 这里只处理【面板已经开着】时的键（Esc / 1~9 / 0 / /）。
 *    "Tab 打开"那一下【不在这里】—— 面板自己不知道要列哪些房间，
 *    得由调用方去 openRoomPanel()。调用方照这个写法接：
 *      if (e.code === 'Tab'){ isRoomPanelOpen() ? closeRoomPanel() : openMyPanel(); return true; }
 *      if (panelKey(e)) return true;   */
export function panelKey(e){
  if (!_open) return false;
  const code = e.code || '';
  /* ★★ 2026-10-15 加：焦点在搜索框里时，数字键是【打字】不能拿去选房间。
     （输入框自己的 keydown 只处理 Enter/Escape，数字键会冒泡到这里 —— 
      若不放行，用户想搜 "134" 会一路被当成"选第 1 间/第 3 间/第 4 间"。） */
  const inSearch = !!(document.activeElement && document.activeElement.id === 'roomPanelSearch');

  if (code === 'Escape'){ closeRoomPanel(); return true; }

  if (code === 'Slash' && !inSearch){
    const si = document.getElementById('roomPanelSearch');
    if (si){ si.focus(); si.select(); return true; }
  }

  if (code.indexOf('Digit') === 0){
    if (inSearch) return true;                 // 打字中：吃掉但不动房间
    const n = parseInt(code.slice(5), 10);
    const rooms = _viewRooms;                  // ★ 认的是【搜索结果】，和卡片角标一致
    if (n >= 1 && n <= 9 && n <= rooms.length){
      const t = rooms[n - 1].theme;
      const pick = _opts && _opts.onPick;
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
