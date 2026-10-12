/**
 * 房间清单 —— ★★★ 以后加房间【只改这一个文件】
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要有这个文件（2026-10-13 用户需求）：
 *   原来"有哪些房间"分散在两处硬编码：
 *     · `hub.html` 的 `DOOR_THEME`（走廊 6 个门位）
 *     · `walk.html` 的 `ROOM_MENU`（终端面板里的列表）
 *   加一间房要改两个文件，迟早会漏一个。
 *   ★ 而且用户明确说了下一步的计划："以后要加很多宿舍，走廊做很长不太现实，
 *     我打算走廊的 6 间只放我个人比较喜欢的。"
 *   ⇒ 于是"全部房间"和"走廊上放哪几间"成了两个不同的集合，必须分开表达：
 *       全部房间   = 本文件的 ROOMS（终端面板列它）
 *       走廊门位   = ROOMS 里 inHub:true 的那几间（最多 6 个，见 hubSlots()）
 *
 * 字段说明
 *   theme    对应 `rooms/<theme>.glb`（也是 URL 参数 ?theme= 的值）
 *   name     中文名
 *   tag      短标签（面板上做小字用；可省）
 *   desc     官方介绍 —— ★ 逐字抄 `3D渲染\_akdata\building_data.json`
 *            → customData.themes['furni_set_<主题>'] 的 desc（别自己编）
 *   inHub    走廊里【有没有门】。★ 走廊只有 6 个门位（3 模块 × 左右各一），
 *            所以 inHub 最多 6 个；超了会在控制台报警并只取前 6 个。
 *            门外没放的那些房间，靠「Tab 终端面板」进入。
 *   hasRig   `rooms\_rig\<theme>.glb` 有没有旧光照版 —— 决定 `&mode=rig`
 *            能不能带过去。★★ 带错会拼出 404 的 URL（本项目踩过）。
 *   terminal （可选）这间房里有没有"主题终端"（目前只有会客室）
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ROOMS = [
  /* ★ 下面 6 间 = 用户 2026-10-13 时点的"走廊要放的"，顺序 = 走廊门位顺序：
       左0 → 右0 → 左1 → 右1 → 左2 → 右2 （DOORS 是按"3 模块 × 左右各一"生成的） */
  { theme: 'classroom', name: '圣马尔索校内教室', tag: '教室', inHub: true, hasRig: true,
    desc: '圣马尔索校内的教室。黑板、课桌、讲台，还有一只狮子雕像。' },
  { theme: 'closureRoom', name: '可露希尔的万能空间', tag: '工作室', inHub: true, hasRig: true,
    desc: '可露希尔的工作室。书、仪器、瓶瓶罐罐，什么都往这儿堆。' },
  { theme: 'rabbitCinema', name: '"兔兔欢声"影音室', tag: '影音室', inHub: true, hasRig: true,
    desc: '以轻松的兔兔风格装点的罗德岛影音室。' },
  { theme: 'clmsRoom', name: '港都会客室', tag: '会客室', inHub: true, hasRig: true,
    desc: '依照黄金时代港都的会客室复原出的房间。这些奢华的陈设沉默地见证了一个时代最后的辉煌。' },
  { theme: 'messengerCottage', name: '安洁莉娜的信笺小屋', tag: '小屋', inHub: true, hasRig: true,
    desc: '根据安洁莉娜的信使休息室复刻的房间。传递话语，寄送心愿，她每天都奔波在城市上空，送出一封封信、一份份包裹。当然，停下来休息休息也是很有必要的！' },
  { theme: 'YuKitchen', name: '余味居后厨', tag: '后厨', inHub: true, hasRig: true,
    desc: '根据余味居宣传单复刻的后厨房间。整洁光亮，条理有序，萦绕着令人垂涎的饭食香味。烟火正盛的夜晚，比起尝鲜，更令人赞不绝口的，是烹饪的过程。这方小天地，经余之手已然成了天下最好的烹具。' },

  /* ★★ 2026-10-15 新增：圣芭菲甜点店（furni_set_dessertShop · 活动套装 sortId 134）
     · inHub:false —— 用户 2026-10-15 决定：**走廊就保持现有 6 个门位 6 个房间不动**
       （原话："不然这么多套宿舍岂不是要做老长的走廊"）。
       新房间一律走 **Tab 终端面板**进 —— panel.js 里已加搜索框，房间多了也能找到。
     · hasRig:false —— 没做 `rooms\_rig\dessertShop.glb` 旧光照回退版（没这个必要）。
     · 预览图：`arts\shop\furngroup\dessertshop_2026\dessertShop_2026_1.png`（商店宣传卡，480×296） */
  { theme: 'dessertShop', name: '圣芭菲甜点店', tag: '甜点店', inHub: false, hasRig: false,
    desc: '位于伊卡莱西亚区，备受本地人与游客欢迎的甜点店。附近的人常会来到这里度过一段悠闲时光。不仅周末，工作日也是如此——应该说，尤其是在工作日。' },

  /* ★ 会客室 = 第 7 间，是网站的初始场地。
       inHub:false —— 走廊尽头那扇走的是 hub.html 里单独的 END_DOOR，
       不是 DOORS 数组那 6 个门位（塞进去会让 DOOR_THEME 下标全部错位）。 */
  { theme: 'basicRoom', name: '会客室', tag: '会客室', inHub: false, hasRig: false, terminal: true,
    desc: '为了营造良好的会客环境，提升业务洽谈成功率，罗德岛准备重新装修一遍会客室。可露希尔向你提交了一张财务报表，详细描述了此次装修的规划设计，并要走了一笔经费。' },

  /* ★★ 以后加房间就照上面追加一行。加完记得：
       ① 把 GLB 放进 `网页原型\rooms\<theme>.glb`
       ② 房间预览图放 `网页原型\assets\previews\<theme>.png`
          ★★★ 2026-10-14 起：**放 .png 源图之后必须再转一份 .webp**，
             网页只加载 .webp（见文件末尾 previewOf 的注释）——
             不转的话该房间在走廊门上和 Tab 面板里都会是破图。
             重转命令：`python 3D渲染\tools\_fk_previews_to_webp.py`
          ★★★ 图源有两套，**优先用第 ① 套**（用户 2026-10-13 拍板：商店图更有游戏特色、
              分辨率也更高）：
          ┌ ① 家具商店宣传卡 —— 480×296，图上带「罗德岛采购部 家居套装」+ 主题名
          │    路径：`解包根\arts\shop\furngroup\<组>_<年>\<组>_<年>_1.png`
          │    ⚠️ 只覆盖【商店套装】。组名 ≠ 主题名，要按主题去推组名
          │    ⚠️ 别把 `receptionroom_2026`（中式「天镜阁会客堂」）当成会客室
          └ ② 官方主题卡（"主题选择"界面用的干净渲染图）—— 226×169 / 228×172，无文字
               路径：`解包根\spritepack\building_diy_theme_ui_h1_0\<游戏主题ID>.png`
               ★★ **文件名就是游戏主题 ID**（`furni_set_classroom` / `furniM_set_basicRoom` …）
               ★★ 实测覆盖游戏里【全部 139 个主题】→ 商店图找不到时就用它，
                  而且没有更高分辨率版本（客户端里就这个尺寸）
               ★ `furniM_` 家族（会客室/蓝丝绒/阿米娅/太鼓）**只能**用它
          取图（PowerShell，$id 换成游戏主题 ID）：
            Copy-Item "$unpacked\spritepack\building_diy_theme_ui_h1_0\$id.png" "网页原型\assets\previews\<主题>.png"
          ★ 两套图宽高比不同（1.62 vs 1.33），面板用 `object-fit: contain` 自动留边，
            所以**不用为了统一比例去改图**，原样复制即可。
          ★ 两套都找不到时面板显示 NO PREVIEW 占位，不会留破图。
       ③ 想让它在走廊也占一个门位 → inHub:true（注意最多 6 个）
       ④ 想让它在走廊有 rig 回退 → 先把旧 GLB 放进 `rooms\_rig\`，再 hasRig:true */
];

/** 预览图路径（约定：一张图 = assets/previews/<theme>.webp）
 *  ★★★ 2026-10-14 性能优化：.png → .webp
 *    走廊首页把这 6 张图当【门贴图】加载，PNG 合计 1529 KB —— 占首页总流量 3857 KB 的 40%。
 *    换 WebP q88 后 249 KB（−83.7%；最差 PSNR 35.1 dB，2x 放大肉眼无差，
 *    对比图见 `3D渲染\_fk_render\接走廊\preview_webp_compare.png`）。
 *    ★ 磁盘上的 .png 是【源图】，保留作重转底稿，但不再发布（见 _fk_stage_deploy.cjs）。
 *    ★ 重转：`python 3D渲染\tools\_fk_previews_to_webp.py` */
export function previewOf(theme){ return './assets/previews/' + theme + '.webp'; }

/** 这间房有没有 rig 回退版（决定能不能带 &mode=rig） */
export function hasRigBackup(theme){
  const r = ROOMS.find((x) => x.theme === theme);
  return !!(r && r.hasRig);
}

/** 走廊门位 —— ★ 长度恰好 6，和 hub.html 的 DOORS 数组一一对齐；不足的补空位 */
export function hubSlots(){
  const picked = ROOMS.filter((r) => r.inHub);
  if (picked.length > 6){
    console.warn('★ manifest.js：inHub:true 的房间有 %d 个，但走廊只有 6 个门位 → 只取前 6 个：%s',
      picked.length, picked.slice(0, 6).map((r) => r.theme).join(', '));
  }
  const out = picked.slice(0, 6).map((r) => ({
    theme: r.theme, name: r.name, desc: r.desc, pic: previewOf(r.theme),
  }));
  // ★ 空门位也要占坑，否则 DOOR_THEME 的下标会和 DOORS 错位
  while (out.length < 6) out.push({ theme: '', name: '', desc: '', pic: null });
  return out;
}

/* ══════════════════ 自检（只在出错时吭声，正常时不刷屏） ══════════════════ */
(function selfCheck(){
  const seen = new Set();
  for (const r of ROOMS){
    if (!r.theme){ console.error('★ manifest.js：有一项没有 theme', r); continue; }
    if (seen.has(r.theme)) console.error('★ manifest.js：theme 重复了 →', r.theme);
    seen.add(r.theme);
    if (!r.name) console.warn('★ manifest.js：%s 没有 name', r.theme);
    if (!r.desc) console.warn('★ manifest.js：%s 没有 desc（应该从 building_data.json 抄）', r.theme);
  }
  const hubN = ROOMS.filter((r) => r.inHub).length;
  console.log('%c★ 房间清单（rooms/manifest.js）：共 %d 间，其中走廊有门 %d 间',
    'color:#5fd8e8', ROOMS.length, Math.min(hubN, 6));
})();
