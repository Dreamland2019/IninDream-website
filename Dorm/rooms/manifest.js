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
 *
 * ★★★ kind / family（2026-10-13 加，**只加数据、UI 还没做**）
 *   用途 = 将来把「选择房间」菜单分两大类：
 *     · `kind:'function'` = **功能类房间** —— 基建里的功能房（控制中枢 / 发电站 /
 *       制造站 / 回收站 …）+ **会客室族**
 *     · `kind:'dorm'`     = **主题宿舍**
 *   family（可选）= 同族标识，供「在房间内切换主题」找兄弟。
 *     会客室族 = `'meeting'`，四套：basicRoom(1001) / taiko(1002) / amiya(1003) / velvet(1004)
 *     （主题宿舍不写这个字段）
 *
 *   ★★★ 归属判据（用户 2026-10-13 亲口定，**别用 tag 猜**）：
 *     **会客室在游戏里就是一个功能房间**（跟制造站同类），只是它是"能换家具"的那种
 *     —— 游戏早期会客室根本没有换家具系统，是后来更新才加的。
 *     ⇒ 所以**用 tag 归类不准确**（比如 `clmsRoom` 也叫「会客室」但它是主题宿舍）。
 *     真正的判据是【**房间尺寸** / 房型】：
 *       · **主题宿舍**：尺寸**全部相同**（房型 `s_room_dormitory_6x2`，34×10 格）
 *       · **功能房**：另有**几种不同的房型尺寸**（会客室 = `room_meeting_8x2`，46×16 格；
 *         其余功能房（发电站/制造站…）也各有自己的尺寸，**项目还没做、房型也还没去找**）
 *     ⇒ 做分类 UI 时，`kind` 应当**按房型给**（见 `3D渲染\import_theme.py` 的 `ROOM_PROFILES`），
 *       **不要**按 tag / 名字里的"会客室"字样。
 *
 *   ★ 现状备忘：**manifest 里其它 9 间还没有 `kind` 字段** —— 做分类菜单时统一回填。
 *     四套会客室**全部归「功能类」**；其中**非默认家具**的会客室加个备注
 *     （默认那套 = `basicRoom`，其余 amiya / taiko / velvet 都是"非默认"）。
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

  /* ★★ 2026-10-13 新增：阿米娅的寰宇记忆（furniM_set_amiya）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furniM_set_amiya.png（会客室族没有商店宣传卡，走官方主题卡）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'function' —— 功能类房间。**归属判据见文件顶部「★kind 判据」注释**
     · family:'meeting' —— 会客室族；将来「会客室内切换主题」靠它找兄弟主题
       四套同族：basicRoom(1001) / taiko(1002) / amiya(1003) / velvet(1004)
     · ★ 备注：这是**非默认家具**的会客室（默认那套 = basicRoom） */
  { theme: 'amiya', name: '阿米娅的寰宇记忆', tag: '阿米娅', inHub: false, hasRig: false,
    kind: 'function', family: 'meeting',
    desc: '复现阿米娅生日晚宴会场布置的房间。无论见证了多少宇宙中的故事，无论经历了多少天地间的浮沉，她都一定会穿过时空来到此处，守护朴实而纯真的希望。在她生日的这一天，为她，为大家的阿米娅，送上最诚挚的祝福吧。' },

  /* ★★ 2026-10-14 新增：“祭典的四拍子太鼓”（furniM_set_taiko）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furniM_set_taiko.png（会客室族没有商店宣传卡，走官方主题卡）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'function'　family:'meeting' —— 会客室族；「会客室内切换主题」靠它找兄弟主题
     · ★ 备注：这是**非默认家具**的会客室（默认那套 = basicRoom） */
  { theme: 'taiko', name: '“祭典的四拍子太鼓”', tag: '祭典的四拍', inHub: false, hasRig: false,
    kind: 'function', family: 'meeting',
    desc: '以节奏动人的祭典太鼓为主题布置的房间。无论你对音乐节奏的感知能力如何，只要走进来就会不由自主地跟上太鼓的拍子，与鼓点一起迎接欢快的时光。' },

  /* ★★ 2026-10-14 新增：蓝丝绒房间（furniM_set_velvet）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furniM_set_velvet.png（会客室族没有商店宣传卡，走官方主题卡）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'function'　family:'meeting' —— 会客室族；「会客室内切换主题」靠它找兄弟主题 */
  { theme: 'velvet', name: '蓝丝绒房间', tag: '蓝丝绒', inHub: false, hasRig: false,
    kind: 'function', family: 'meeting',
    desc: '以潜意识和回忆为基底，自然延展而成的房间。蓝丝绒主题搭配拉特兰式雕塑，自发光元件打造独特照明风格，不只是空间，更是一种场域。欢迎来到蓝丝绒房间，请安然入座，梳理思绪，在此处探寻精神中深藏的另一面。' },

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
