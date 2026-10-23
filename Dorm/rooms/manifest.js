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
 * ★★★ kind / family（2026-10-13 加；★★★ **2026-10-23 语义变了一次，先看这段**）
 *   `kind` 现在 = **「选择房间」面板的分组键**（用户 2026-10-23 定的排序规则）：
 *     · `kind:'dorm'`     = **家具主题**（**139 套全部排在前面**）
 *       = 135 套主题宿舍 + 会客室族 4 套（`furniM_set_*`，它们本来就是"换家具"的主题）
 *     · `kind:'function'` = **基建功能房 8 间**（回收站 / 制造站 / 办公室 / 加工站 /
 *       训练室 / 贸易站 / 发电站 / 控制中枢）—— 全部排在后面，标「研究中」
 *   ★ 为什么把会客室族从 function 挪进 dorm（2026-10-23）：用户要求列表
 *     「最上面是最新那批」，而会客室族 `sortId` = 1001~1004（全库最新）。
 *     留在 function 组里就会掉到列表最底下，和「139 套家具主题在前」直接冲突。
 *   ★★ 历史（2026-10-13 ~ 10-22）`kind` 曾经表示【房型】：会客室 = 46×16 格 ⇒ 算功能房。
 *     那条判据本身没被推翻（房型确实不同），只是**菜单分组不再用它** ——
 *     现在按玩家视角分：「家具主题」vs「还在做的功能房」。
 *   ★★★ 排序规则（用户 2026-10-23 明确要求，别自己另定）：
 *     ① 先分两组：`dorm` 全部在前，`function` 全部在后（标「研究中」）
 *     ② `dorm` 组内按 `sortId` **降序**（游戏内上线时间，数值越大越新）
 *        · sortId 数据源 = `building_data.json` → `customData.themes[<themeId>].sortId`
 *        · 由 `网页原型\_fk_manifest_sortid.cjs` 批量回填，**别手改、别手工挪数组顺序**
 *        · 实测：warehouse=1（最早期）、s1_01=2、s1_02=3、s2_01=7、s2_02=8、
 *          classroom=61、clmsRoom=135、会客室族 furniM_* = 1001~1004（最新）
 *     ③ `function` 组内没有上线时间 → 按**本数组顺序**
 *        （回收站 → 制造站 → 办公室 → 加工站 → 训练室 → 贸易站 → 发电站 → 控制中枢）
 *     ⇒ 排序实现只在 `rooms/panel.js` 一处（walk.html / hub.html 都调它），
 *       本文件只负责把 `kind` 和 `sortId` 写对。
 *   family（可选）= 同族标识，供「在房间内切换主题」找兄弟。
 *     会客室族 = `'meeting'`，四套：basicRoom(1001) / taiko(1002) / amiya(1003) / velvet(1004)
 *     （主题宿舍不写这个字段）
 *   defaultFurni（可选，布尔）= **是不是"默认家具"那套**。会客室族四套里只有
 *     `basicRoom` 是游戏初始的默认家具，其余三套（amiya/taiko/velvet）都是后来
 *     用主题套装换装的版本。
 *     ★★ 2026-10-14 用户要求：「我希望同属于会客室的家具主题备注一下，
 *        比如**蓝丝绒房间（会客室）**，**默认的就不需要备注了**」
 *        ⇒ 面板（`panel.js`）按 **`family:'meeting'` + `!defaultFurni`** 在房间名后
 *          自动加一个灰色小字「（会客室）」；`basicRoom` 有 `defaultFurni:true`，**不加**。
 *        ★ 所以这个字段**有 UI 作用**（不再只是备注）—— 改它就会改面板显示。
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
 *     ★ 2026-10-23 更正：**菜单分组已经不用房型判据了**（改用"家具主题 / 基建功能房"，
 *       见上面 `kind` 那段）。房型判据保留给需要区分房间几何的场合（尺寸、出生点这类）。
 *
 *   ★ 现状（2026-10-23）：**147 条全部有 `kind`** ——
 *     家具主题 139（135 主题宿舍 + 会客室族 4 套）+ 基建功能房 8。
 *     ★★★ **兜底规则**：`kind` 缺失时 `panel.js` 按 **`'dorm'`（家具主题）**兜底 ——
 *       理由 = 以后新加的主题绝大多数是宿舍，只有做功能房时才必须显式写 `'function'`。
 *     ★★ `defaultFurni` / `family` 只有会客室族会用到；**分组只认 `kind`**，
 *       它们留给"会客室内切换主题"和后缀「（会客室）」那类 UI。
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ROOMS = [
  /* ★ 下面 6 间 = 用户 2026-10-13 时点的"走廊要放的"，顺序 = 走廊门位顺序：
       左0 → 右0 → 左1 → 右1 → 左2 → 右2 （DOORS 是按"3 模块 × 左右各一"生成的） */
  /* ★★ 2026-10-14：下面 6 间 + dessertShop 全部 `kind:'dorm'`（主题宿舍）。
     ★ 判据是【房型尺寸】不是 tag（见文件顶部「★★★ 归属判据」）：
       它们的房型都是 `s_room_dormitory_6x2`（34×10 格，全部相同）。
     ★★ 特别注意 `clmsRoom`（港都会客室）：名字里带"会客室"、tag 也是"会客室"，
        但它是**主题宿舍**（房型是宿舍 6x2），**不是**会客室族 —— 别被名字骗。
        （会客室族的房型是 `room_meeting_8x2`，46×16 格，见文件末尾那 4 间。） */
  { theme: 'classroom', name: '圣马尔索校内教室', tag: '教室', inHub: true, hasRig: true,
    kind: 'dorm',
    sortId: 61,
    desc: '圣马尔索校内的教室。黑板、课桌、讲台，还有一只狮子雕像。' },
  { theme: 'closureRoom', name: '可露希尔的万能空间', tag: '工作室', inHub: true, hasRig: true,
    kind: 'dorm',
    sortId: 127,
    desc: '可露希尔的工作室。书、仪器、瓶瓶罐罐，什么都往这儿堆。' },
  { theme: 'rabbitCinema', name: '"兔兔欢声"影音室', tag: '影音室', inHub: true, hasRig: true,
    kind: 'dorm',
    sortId: 128,
    desc: '以轻松的兔兔风格装点的罗德岛影音室。' },
  { theme: 'clmsRoom', name: '港都会客室', tag: '会客室', inHub: true, hasRig: true,
    kind: 'dorm',   // ★ 名字/tag 都叫"会客室"，但房型是主题宿舍 6x2 ⇒ 归 dorm
    sortId: 135,
    desc: '依照黄金时代港都的会客室复原出的房间。这些奢华的陈设沉默地见证了一个时代最后的辉煌。' },
  { theme: 'messengerCottage', name: '安洁莉娜的信笺小屋', tag: '小屋', inHub: true, hasRig: true,
    kind: 'dorm',
    sortId: 132,
    desc: '根据安洁莉娜的信使休息室复刻的房间。传递话语，寄送心愿，她每天都奔波在城市上空，送出一封封信、一份份包裹。当然，停下来休息休息也是很有必要的！' },
  { theme: 'YuKitchen', name: '余味居后厨', tag: '后厨', inHub: true, hasRig: true,
    kind: 'dorm',
    sortId: 124,
    desc: '根据余味居宣传单复刻的后厨房间。整洁光亮，条理有序，萦绕着令人垂涎的饭食香味。烟火正盛的夜晚，比起尝鲜，更令人赞不绝口的，是烹饪的过程。这方小天地，经余之手已然成了天下最好的烹具。' },

  /* ★★ 2026-10-15 新增：圣芭菲甜点店（furni_set_dessertShop · 活动套装 sortId 134）
     · inHub:false —— 用户 2026-10-15 决定：**走廊就保持现有 6 个门位 6 个房间不动**
       （原话："不然这么多套宿舍岂不是要做老长的走廊"）。
       新房间一律走 **Tab 终端面板**进 —— panel.js 里已加搜索框，房间多了也能找到。
     · hasRig:false —— 没做 `rooms\_rig\dessertShop.glb` 旧光照回退版（没这个必要）。
     · 预览图：`arts\shop\furngroup\dessertshop_2026\dessertShop_2026_1.png`（商店宣传卡，480×296） */
  { theme: 'dessertShop', name: '圣芭菲甜点店', tag: '甜点店', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 134,
    desc: '位于伊卡莱西亚区，备受本地人与游客欢迎的甜点店。附近的人常会来到这里度过一段悠闲时光。不仅周末，工作日也是如此——应该说，尤其是在工作日。' },

  /* ★★ 2026-10-13 新增：阿米娅的寰宇记忆（furniM_set_amiya）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furniM_set_amiya.png（会客室族没有商店宣传卡，走官方主题卡）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm'（★ 2026-10-23 从 function 改过来：会客室族本质是"换家具"的主题，见文件顶部排序规则）
     · family:'meeting' —— 会客室族；将来「会客室内切换主题」靠它找兄弟主题
       四套同族：basicRoom(1001) / taiko(1002) / amiya(1003) / velvet(1004)
     · ★ 备注：这是**非默认家具**的会客室（默认那套 = `basicRoom`，见它条目里的 `defaultFurni:true`） */
  { theme: 'amiya', name: '阿米娅的寰宇记忆', tag: '阿米娅', inHub: false, hasRig: false,
    kind: 'dorm', family: 'meeting',   // ★ 2026-10-23：会客室族归「家具主题」组（sortId 1001~1004 全库最新）
    defaultFurni: false,
    sortId: 1003,
    desc: '复现阿米娅生日晚宴会场布置的房间。无论见证了多少宇宙中的故事，无论经历了多少天地间的浮沉，她都一定会穿过时空来到此处，守护朴实而纯真的希望。在她生日的这一天，为她，为大家的阿米娅，送上最诚挚的祝福吧。' },

  /* ★★ 2026-10-14 新增：“祭典的四拍子太鼓”（furniM_set_taiko）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furniM_set_taiko.png（会客室族没有商店宣传卡，走官方主题卡）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm'（2026-10-23 改）　family:'meeting' —— 会客室族；「会客室内切换主题」靠它找兄弟主题
     · ★ 备注：这是**非默认家具**的会客室（默认那套 = `basicRoom`，见它条目里的 `defaultFurni:true`） */
  { theme: 'taiko', name: '“祭典的四拍子太鼓”', tag: '祭典的四拍', inHub: false, hasRig: false,
    kind: 'dorm', family: 'meeting',   // ★ 2026-10-23：会客室族归「家具主题」组（sortId 1001~1004 全库最新）
    defaultFurni: false,
    sortId: 1002,
    desc: '以节奏动人的祭典太鼓为主题布置的房间。无论你对音乐节奏的感知能力如何，只要走进来就会不由自主地跟上太鼓的拍子，与鼓点一起迎接欢快的时光。' },

  /* ★★ 2026-10-14 新增：蓝丝绒房间（furniM_set_velvet）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furniM_set_velvet.png（会客室族没有商店宣传卡，走官方主题卡）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm'（2026-10-23 改）　family:'meeting' —— 会客室族；「会客室内切换主题」靠它找兄弟主题
     · ★ 备注：这是**非默认家具**的会客室（默认那套 = `basicRoom`，见它条目里的 `defaultFurni:true`） */
  { theme: 'velvet', name: '蓝丝绒房间', tag: '蓝丝绒', inHub: false, hasRig: false,
    kind: 'dorm', family: 'meeting',   // ★ 2026-10-23：会客室族归「家具主题」组（sortId 1001~1004 全库最新）
    defaultFurni: false,
    sortId: 1004,
    desc: '以潜意识和回忆为基底，自然延展而成的房间。蓝丝绒主题搭配拉特兰式雕塑，自发光元件打造独特照明风格，不只是空间，更是一种场域。欢迎来到蓝丝绒房间，请安然入座，梳理思绪，在此处探寻精神中深藏的另一面。' },

  /* ★★ 2026-10-14 新增：12号生命循环舱（furni_set_cabin）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'cabin', name: '12号生命循环舱', tag: '12号生命循', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 5,
    desc: '由凯尔希主导建设的概念船舱，具备各类工作必需的机能。' },

  /* ★★ 2026-10-14 新增：魂灵秘会（furni_set_spirit）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'spirit', name: '魂灵秘会', tag: '魂灵秘会', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 17,
    desc: '用这些装饰将舱室装扮成特别的样子。连行巫秘会都认可的装饰风格。' },

  /* ★★ 2026-10-14 新增：飞空艇风格宿舍（furni_set_Airship）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'Airship', name: '飞空艇风格宿舍', tag: '飞空艇风格', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 91,
    desc: '根据特蕾西娅留下的资料而复现的飞空艇内部场景，做了一些符合宿舍需求的改造。萨卡兹冰冷的战争兵器在这里散发出些许温暖。' },

  /* ★★ 2026-10-14 新增：泡影国起居室（furni_set_Azuredream）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'Azuredream', name: '泡影国起居室', tag: '泡影国起居室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 129,
    desc: '根据梓兰的回忆复现的泡影国民居。在那个国家，人们行天之谕，狩地之兽，而他们的国主，完成了一次又一次的“试炼”，狩猎了一头又一头的“异兽”，将国家传承了下来。在那里，狩猎不只是一种生活方式，更是一种信仰。' },

  /* ★★ 2026-10-14 新增：黑钢国际安全屋（furni_set_BSsafehouse）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'BSsafehouse', name: '黑钢国际安全屋', tag: '黑钢国际安全', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 79,
    desc: '黑钢国际标准配置的安全屋。尽管人员有所变动，一切还是那时的模样，就算她推门而入，也不会有太多讶异。' },

  /* ★★ 2026-10-18 新增：深海猎人实验室（furni_set_HunterInstitute）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'HunterInstitute', name: '深海猎人实验室', tag: '深海猎人实验', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 93,
    desc: '根据西昆妲的速写复现的深海猎人实验室。限于罗德岛的技术水平，其中的多数设施都没能实现原本的功能，但对于远走他乡，在陆上驻足的阿戈尔人，或许这样就足够了。' },

  /* ★★ 2026-10-18 新增：人气快餐店肯德基（furni_set_KFC）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'KFC', name: '人气快餐店肯德基', tag: '人气快餐店肯', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 18,
    desc: '再现了肯德基餐厅内部陈设的概念房间。今天吃什么？' },

  /* ★★ 2026-10-18 新增：安布罗修休息室（furni_set_LAbbey）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'LAbbey', name: '安布罗修休息室', tag: '安布罗修休息', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 74,
    desc: '根据执行者里凯莱的描述复现的修道院休息室。圣餐用毕，尚有闲暇的居民会来到休息室，共享恩泽，度过静好时光。' },

  /* ★★ 2026-10-18 新增：魂灵印象（furni_set_MemoryCloister）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'MemoryCloister', name: '魂灵印象', tag: '魂灵印象', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 95,
    desc: '按照讲述者们在奇语探险中的见闻所布置的房间。后勤部设计师已充分调动了自己的想象力，但讲述者们仍认为其中的器具不如他们曾目睹的那般诡谲瑰丽。' },

  /* ★★ 2026-10-18 新增：拉特兰公证所休息室（furni_set_NHL）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'NHL', name: '拉特兰公证所休息室', tag: '拉特兰公证所', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 51,
    desc: '依据干员见行者的描述再现的拉特兰公证所休息室，但菲亚梅塔并没有太大兴趣。' },

  /* ★★ 2026-10-18 新增：特种装备展览室（furni_set_R6）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'R6', name: '特种装备展览室', tag: '特种装备展览', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 36,
    desc: '基于彩虹六号干员们回忆建造的装备展示厅，大部分装备只是个模型。' },

  /* ★★ 2026-10-18 新增：“兔兔大派对”宴会厅（furni_set_RhodesRabbit）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'RhodesRabbit', name: '“兔兔大派对”宴会厅', tag: '兔兔大派对宴', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 92,
    desc: '五周年庆典当天，大家在宴会厅为您筹备了一场盛大的派对。准备好了吗？愉快的庆典就要开始了！' },

  /* ★★ 2026-10-18 新增：阿尔萨兰旅行营帐（furni_set_SargonFair）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'SargonFair', name: '阿尔萨兰旅行营帐', tag: '阿尔萨兰旅行', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 88,
    desc: '在靠近焚风热土的阿尔萨兰地区，这样的营帐算是旅行必备。' },

  /* ★★ 2026-10-18 新增：“疤痕商场的回忆”（furni_set_ScarMarket）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'ScarMarket', name: '“疤痕商场的回忆”', tag: '疤痕商场的回', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 90,
    desc: '根据萨卡兹佣兵的讲述而复现的疤痕商场风格房间。往昔的疤痕商场以无序和杂乱著称，其视觉样式由某位掌管这里几十年之久的独眼巨人确立。' },

  /* ★★ 2026-10-18 新增：神农祭庙会（furni_set_TempleFair）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'TempleFair', name: '神农祭庙会', tag: '神农祭庙会', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 86,
    desc: '根据小满与禾生的描述建造的大荒城神农祭庙会的概念房间。热闹熙攘，诸事顺意。' },

  /* ★★ 2026-10-18 新增：大荒天师苑（furni_set_TianshiMansion）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'TianshiMansion', name: '大荒天师苑', tag: '大荒天师苑', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 87,
    desc: '大荒城内天师苑的精确再现。好比神农培入山河体肤间的第一抔沃土，天师们的理想在此处萌发，生长，结为现实。' },

  /* ★★ 2026-10-18 新增：伊比利亚度假村（furni_set_abyssal）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'abyssal', name: '伊比利亚度假村', tag: '伊比利亚度假', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 39,
    desc: '再现了伊比利亚海边度假村的概念房间。吹吹海风，尽享假日时光——我们如此想象着。' },

  /* ★★ 2026-10-18 新增：黄澄澄游戏室（furni_set_activity）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'activity', name: '黄澄澄游戏室', tag: '黄澄澄游戏室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 31,
    desc: '专为孩子们搭建的游戏室，希望他们能渡过一段快乐时光。' },

  /* ★★ 2026-10-18 新增：幽蓝午夜自助式清吧（furni_set_amuselounge）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'amuselounge', name: '幽蓝午夜自助式清吧', tag: '幽蓝午夜自助', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 98,
    desc: '为提升干员与病患的幸福感，后勤部耗时一年，对空置舱室进行了精心的设计与改造。疲惫不堪的人，可以在此享受难得的松弛。' },

  /* ★★ 2026-10-18 新增：源石应用实验室（furni_set_aphrissaRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'aphrissaRoom', name: '源石应用实验室', tag: '源石应用实验', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 130,
    desc: '根据谬因的手绘图复现的，她在卢米内斯大学任教时的独立实验室。里面仅装点着少量她的个人物品。' },

  /* ★★ 2026-10-18 新增：前卫街机厅（furni_set_arcadeHall）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'arcadeHall', name: '前卫街机厅', tag: '前卫街机厅', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 46,
    desc: '再现了哥伦比亚街机厅的概念房间。适度娱乐，有益身心。' },

  /* ★★ 2026-10-18 新增：哥伦比亚摩登酒店（furni_set_artdeco）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'artdeco', name: '哥伦比亚摩登酒店', tag: '哥伦比亚摩登', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 11,
    desc: '模仿了摩登时代酒店标准样式的概念房间，不禁令人回想起哥伦比亚步入现代前一闪即逝的别样繁华。' },

  /* ★★ 2026-10-18 新增：克里斯达尔展厅（furni_set_artmuseum）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'artmuseum', name: '克里斯达尔展厅', tag: '克里斯达尔展', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 89,
    desc: '根据克里斯达尔艺术馆内部某间私人展厅复原的概念房间。里面的展品都是现存艺术品的复制品。' },

  /* ★★ 2026-10-18 新增：沃尔特风潮居室（furni_set_bauhaus）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'bauhaus', name: '沃尔特风潮居室', tag: '沃尔特风潮居', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 37,
    desc: '一种源自莱塔尼亚的前卫建筑风格样板房。风格鲜明，饱受好评。' },

  /* ★★ 2026-10-18 新增：汐斯塔沙滩小屋（furni_set_beach）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'beach', name: '汐斯塔沙滩小屋', tag: '汐斯塔沙滩小', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 13,
    desc: '再现了内海城市汐斯塔假日风情的概念房间。派对还没开始吗？' },

  /* ★★ 2026-10-18 新增：七城风情餐厅（furni_set_beerhouse）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'beerhouse', name: '七城风情餐厅', tag: '七城风情餐厅', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 23,
    desc: '再现了七城风情餐厅的概念房间。味道如何？' },

  /* ★★ 2026-10-18 新增：部落风情旅舍（furni_set_bolivar）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'bolivar', name: '部落风情旅舍', tag: '部落风情旅舍', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 28,
    desc: '再现了部落旅舍的概念房间。一个用拳头说话的世界。' },

  /* ★★ 2026-10-18 新增：侦探的书房（furni_set_bookshop）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'bookshop', name: '侦探的书房', tag: '侦探的书房', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 64,
    desc: '某位侦探在朋友们的帮助下布置的房间，平时用作侦探开展工作的地点，兼营书店业务。' },

  /* ★★ 2026-10-18 新增：格拉斯哥帮拳馆（furni_set_boxing）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'boxing', name: '格拉斯哥帮拳馆', tag: '格拉斯哥帮拳', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 70,
    desc: '根据格拉斯哥帮几人的讲述复现的格拉斯哥帮拳馆。她们有时会来这里坐坐，一起喝下几罐啤酒。' },

  /* ★★ 2026-10-18 新增：哥伦比亚咖啡馆（furni_set_cafe）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'cafe', name: '哥伦比亚咖啡馆', tag: '哥伦比亚咖啡', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 6,
    desc: '哥伦比亚风格的咖啡馆。' },

  /* ★★ 2026-10-18 新增：茨沃涅克乡野营地（furni_set_camp）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'camp', name: '茨沃涅克乡野营地', tag: '茨沃涅克乡野', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 59,
    desc: '根据茨沃涅克城市宣传手册配图搭建的营地风房间。玛恩纳或许在这样的营地中歇息过片刻。' },

  /* ★★ 2026-10-18 新增：超级狂欢座驾舱室（furni_set_carnival）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'carnival', name: '超级狂欢座驾舱室', tag: '超级狂欢座驾', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 102,
    desc: '根据拉普兰德的描述，复现了货运陆行舰中狂欢节氛围的概念房间。“你们搞这个是要办狂欢节？嘁，没有我的狂欢节绝对很无聊。”' },

  /* ★★ 2026-10-18 新增：“古堡印象”（furni_set_castle）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'castle', name: '“古堡印象”', tag: '古堡印象', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 50,
    desc: '根据干员们收集的资料建造而成的古堡印象房。洋溢着不祥的气息。' },

  /* ★★ 2026-10-18 新增：陈的办公室（furni_set_chen）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'chen', name: '陈的办公室', tag: '陈的办公室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 12,
    desc: '仿照近卫局中陈长官的办公室制作的房间，交予陈本人使用。在罗德岛发挥着奇妙的作用。' },

  /* ★★ 2026-10-18 新增：哈迈米纳特花园（furni_set_citizengarden）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'citizengarden', name: '哈迈米纳特花园', tag: '哈迈米纳特花', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 97,
    desc: '参照米纳特哈玛仪博物馆风格设计的花园，游客们汇聚在这里，饱览古老文明十字路口那不灭的辉煌。' },

  /* ★★ 2026-10-18 新增：天空生活体验舱（furni_set_cloudRestaurant）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'cloudRestaurant', name: '天空生活体验舱', tag: '天空生活体验', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 121,
    desc: '根据哥伦比亚“螺旋桨天堂”浮空实验舱复刻的房间。最尖端的装置往往拥有别出心裁的外形，请不要擅自揣测它们的用途。参观者务必仔细阅读门口派发的说明手册，若因操作不当造成安全事故，请自行——或让您的保险公司负责。' },

  /* ★★ 2026-10-18 新增：“纯白火山”之旅（furni_set_coastCottage）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'coastCottage', name: '“纯白火山”之旅', tag: '纯白火山之旅', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 78,
    desc: '根据埃尼斯的手绘本与其他在汐斯塔度假的干员的印象复现的“纯白火山”餐吧。这家小店曾是孩子们最初的“探险地”。' },

  /* ★★ 2026-10-18 新增：维多利亚近卫学院宿舍（furni_set_college）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'college', name: '维多利亚近卫学院宿舍', tag: '维多利亚近卫', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 43,
    desc: '再现了陈和风笛在维多利亚皇家近卫学院时居住的学生宿舍，每一件家具都由学院精心挑选，在典雅之余又带有些许青春气息。' },

  /* ★★ 2026-10-18 新增：乌萨斯学生活动室（furni_set_community）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'community', name: '乌萨斯学生活动室', tag: '乌萨斯学生活', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 25,
    desc: '五位乌萨斯学生用工资置办的活动室。握手只是友谊的开始。' },

  /* ★★ 2026-10-18 新增：夕照区印象音乐室（furni_set_concertHall）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'concertHall', name: '夕照区印象音乐室', tag: '夕照区印象音', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 55,
    desc: '以车尔尼收藏的乐器为主体构成的音乐室，黑键和芙蓉也在布置的过程中贡献良多。不少小干员来这里找车尔尼学习乐器，因而也被称为“车尔尼的音乐教室”。' },

  /* ★★ 2026-10-18 新增：苇草的小屋（furni_set_countryside）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'countryside', name: '苇草的小屋', tag: '苇草的小屋', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 65,
    desc: '苇草根据自己理想中家的模样装扮的乡间小屋，里面溢散着蜂蜜、甜酒和浓汤的气味。' },

  /* ★★ 2026-10-18 新增：叙拉古正义法院（furni_set_court）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'court', name: '叙拉古正义法院', tag: '叙拉古正义法', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 63,
    desc: '每座叙拉古城市中都有一座法院，每一座法院的背后都有着同一个名字。' },

  /* ★★ 2026-10-18 新增：莱茵科技生态园（furni_set_cultureroom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'cultureroom', name: '莱茵科技生态园', tag: '莱茵科技生态', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 73,
    desc: '根据缪尔赛思描述和现场参考而复现的莱茵科技生态园。这里是她的实验室，也是她的家。' },

  /* ★★ 2026-10-18 新增：黑流印象（furni_set_darkForest）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'darkForest', name: '黑流印象', tag: '黑流印象', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 131,
    desc: '根据梅兰德基金会整理的影像资料复原的黑流树海内部生态模拟舱。可以在此欣赏这片大地其他区域不曾出现的植物，小憩之后，记得检查自身状态是否如常。' },

  /* ★★ 2026-10-18 新增：萨卡兹佣兵休息室（furni_set_dormW）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'dormW', name: '萨卡兹佣兵休息室', tag: '萨卡兹佣兵休', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 24,
    desc: '以萨卡兹风格建造的休息室。危险与舒适并存。' },

  /* ★★ 2026-10-18 新增：异变梦城堡大厅（furni_set_dreamCastle）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'dreamCastle', name: '异变梦城堡大厅', tag: '异变梦城堡大', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 117,
    desc: '根据经过异变的梦城堡大厅复刻的房间。虽然每一个走入梦城堡的人所见的环境都有所不同，但那些寻梦者留下的痕迹，将在这个精心布置的场景之中永久留存。' },

  /* ★★ 2026-10-19 新增：糖果仙子的宴会厅（furni_set_durin）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'durin', name: '糖果仙子的宴会厅', tag: '糖果仙子的宴', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 58,
    desc: '以罗德岛自制舞剧《木果夹子》的布景为原型设计的糖果仙子宴会厅，是一场梦境，但又意味深长。' },

  /* ★★ 2026-10-19 新增：红叶旅舍（furni_set_eastern）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'eastern', name: '红叶旅舍', tag: '红叶旅舍', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 69,
    desc: '富有东国乡野气息的房间，在温馨的木制空间中，客人们可以静享闲适的秋日时光。' },

  /* ★★ 2026-10-19 新增：罗德岛工作间（furni_set_elite）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'elite', name: '罗德岛工作间', tag: '罗德岛工作间', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 20,
    desc: '罗德岛工作间，主要供精英干员们进行各项开发、设计与维护任务。' },

  /* ★★ 2026-10-19 新增：精英干员休息室（furni_set_eliteLounge）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'eliteLounge', name: '精英干员休息室', tag: '精英干员休息', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 118,
    desc: '为罗德岛的精英干员们专门设立的休息室。精英干员们常年执行外勤任务，即便驻留本舰也随时有可能会离开。工程部在这间休息室的设计与建造上采用了最高标准，以期为短暂停留的精英干员们提供完美的休整环境。' },

  /* ★★ 2026-10-19 新增：仿临光家客厅（furni_set_fNearl）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'fNearl', name: '仿临光家客厅', tag: '仿临光家客厅', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 30,
    desc: '佐菲娅资助玛莉娅建造的客厅。和从前的家还是有所区别。' },

  /* ★★ 2026-10-19 新增：“叙拉古往事”（furni_set_gangster）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'gangster', name: '“叙拉古往事”', tag: '叙拉古往事', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 62,
    desc: '在叙拉古的许多房子中都能找到这样的小屋，屋的主人换了又换，而叙拉古的故事通常不会改变。' },

  /* ★★ 2026-10-19 新增：界园印象（furni_set_gardenFantasy）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'gardenFantasy', name: '界园印象', tag: '界园印象', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 113,
    desc: '以惊蛰等人在界园中的见闻为灵感布置的房间。界园中的一木一石，一灯一帘，皆是易自山河间俯拾拣选而来。世间不乏珍宝，但缺识趣之人。' },

  /* ★★ 2026-10-19 新增：愚人号会客室（furni_set_goldBoat）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'goldBoat', name: '愚人号会客室', tag: '愚人号会客室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 54,
    desc: '依据艾丽妮的描述而复现的愚人号会客室，金碧辉煌，灿如“旧伊比利亚”的荣光。' },

  /* ★★ 2026-10-19 新增：罗德岛现代音乐排练室（furni_set_guitar）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'guitar', name: '罗德岛现代音乐排练室', tag: '罗德岛现代音', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 14,
    desc: '罗德岛的现代音乐练习室之一，免费向热爱吉他的干员开放。' },

  /* ★★ 2026-10-19 新增：潘格尼尼的铳械工坊（furni_set_gunworkshop）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'gunworkshop', name: '潘格尼尼的铳械工坊', tag: '潘格尼尼的铳', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 110,
    desc: '根据铳械大师潘格尼尼的工坊复刻的房间。工坊的铳械质量在拉特兰数一数二，但工坊的整洁程度在拉特兰倒数第一。客户曾留言：“在铳管里发现店主的羽毛是质量的证明！”' },

  /* ★★ 2026-10-19 新增：东国夏日宅邸（furni_set_higashiYard）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'higashiYard', name: '东国夏日宅邸', tag: '东国夏日宅邸', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 114,
    desc: '根据御机城娱乐小报《周刊星川》中介绍的东国豪华宅邸复现的房间。小报宣称只有豪族、巨贾，还有全民崇拜的偶像才有资格享受这样的居所。无视这些无聊的噱头，面对真实的自我才是处世之道。' },

  /* ★★ 2026-10-19 新增：佣兵们的落脚处（furni_set_hodrerStudy）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'hodrerStudy', name: '佣兵们的落脚处', tag: '佣兵们的落脚', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 80,
    desc: '根据赫德雷的描述复现的他曾在卡兹戴尔的落脚处，伊内丝补充了不少细节。至于那些回忆里没有的东西，别乱碰——W添上的，可能会炸。' },

  /* ★★ 2026-10-19 新增：急救专家组办公室（furni_set_icu）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'icu', name: '急救专家组办公室', tag: '急救专家组办', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 38,
    desc: '罗德岛急救专家医疗组的办公场所，总负责人是凯尔希。' },

  /* ★★ 2026-10-19 新增：大水坑快活体验屋（furni_set_idealCity）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'idealCity', name: '大水坑快活体验屋', tag: '大水坑快活体', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 57,
    desc: '在至简不情不愿的描述下复现的大水坑观光小屋。在嘉维尔监工之后，至简的效率提升了一倍不止。' },

  /* ★★ 2026-10-19 新增：丹青阁（furni_set_inkArt）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'inkArt', name: '丹青阁', tag: '丹青阁', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 35,
    desc: '夕小姐画室无数布局中的一种，有幸被造访的干员记录并重现。' },

  /* ★★ 2026-10-19 新增：“趁呼吸逗留”（furni_set_kaltsroom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'kaltsroom', name: '“趁呼吸逗留”', tag: '趁呼吸逗留', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 108,
    desc: '根据Mon3tr等罗德岛干员的回忆复原的凯尔希的特殊办公区域。复原此处不在凯尔希的预案当中，但Mon3tr仍然认为，一切的重建应由此开始。' },

  /* ★★ 2026-10-19 新增：卡西米尔直播间（furni_set_kazimierz）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'kazimierz', name: '卡西米尔直播间', tag: '卡西米尔直播', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 45,
    desc: '骑士竞技的直播间，为您带来竞技比赛实况内容。' },

  /* ★★ 2026-10-19 新增：白色旷野（furni_set_kitchen）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'kitchen', name: '白色旷野', tag: '白色旷野', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 32,
    desc: '由某设计大奖作品复制而来的概念房间。获奖者没有感言，一切尽在不言中。' },

  /* ★★ 2026-10-19 新增：红松骑士团休息室（furni_set_knights）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'knights', name: '红松骑士团休息室', tag: '红松骑士团休', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 44,
    desc: '红松骑士团在罗德岛的休憩场所，大多数家具经过了骑士团成员的改造加工。' },

  /* ★★ 2026-10-19 新增：罗德岛洗衣间（furni_set_laundry）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'laundry', name: '罗德岛洗衣间', tag: '罗德岛洗衣间', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 84,
    desc: '罗德岛最常见的洗衣间设计，每到休息日，这里就会变得十分拥挤。' },

  /* ★★ 2026-10-19 新增：卡拉顿花草灯艺屋（furni_set_lightArt）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'lightArt', name: '卡拉顿花草灯艺屋', tag: '卡拉顿花草灯', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 49,
    desc: '在夏栎的描述下再现的某间花草灯艺屋，澄闪看到后非常开心。' },

  /* ★★ 2026-10-19 新增：健康快餐店（furni_set_lightFood）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'lightFood', name: '健康快餐店', tag: '健康快餐店', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 22,
    desc: '新概念快餐店，店员招募中。美味与健康总可兼得。' },

  /* ★★ 2026-10-19 新增：路德维格大学讲演厅（furni_set_magicAcademy）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'magicAcademy', name: '路德维格大学讲演厅', tag: '路德维格大学', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 81,
    desc: '根据止颂的描述还原的路德维格大学讲演厅，求知者们的豪言在厅中回响。“上前来！踏入求知的殿堂！”' },

  /* ★★ 2026-10-19 新增：玉门医馆（furni_set_martialClub）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'martialClub', name: '玉门医馆', tag: '玉门医馆', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 66,
    desc: '根据槐琥描述复现的玉门医馆。武具比药具占地更多的医馆，或许只有在玉门才能一见。' },

  /* ★★ 2026-10-19 新增：炎式厅堂（furni_set_midAutumn）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'midAutumn', name: '炎式厅堂', tag: '炎式厅堂', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 29,
    desc: '再现了炎国节日氛围的概念房间。明月将升，佳节已至。' },

  /* ★★ 2026-10-19 新增：心像空间（furni_set_mindsanctum）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'mindsanctum', name: '心像空间', tag: '心像空间', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 94,
    desc: '一个之前从未存在过的房间，由一位工程部干员在受到妮芙心灵启示之后设计完成，体现了那位笞心魔对于心灵的见解。' },

  /* ★★ 2026-10-19 新增：雅赛努斯的新生诗篇（furni_set_minosMed）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'minosMed', name: '雅赛努斯的新生诗篇', tag: '雅赛努斯的新', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 122,
    desc: '根据调香师在雅赛努斯建立的罗德岛办事处复现的房间。在这座被青翠山峦环绕的城市中，莱娜将驱散过往的迷惘，踏上写下复苏与新生的旅程。' },

  /* ★★ 2026-10-19 新增：乐器维修工坊（furni_set_mis）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'mis', name: '乐器维修工坊', tag: '乐器维修工坊', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 52,
    desc: '为满足罗德岛上音乐爱好者的需求而建造的房间，兼营售卖业务。' },

  /* ★★ 2026-10-19 新增：料理研究中心（furni_set_molKitchen）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'molKitchen', name: '料理研究中心', tag: '料理研究中心', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 72,
    desc: '罗德岛内部用于研发前卫菜品的研究中心。科技在进步，制作食物的方式也在进步。' },

  /* ★★ 2026-10-19 新增：“移山庙”（furni_set_msVillage）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'msVillage', name: '“移山庙”', tag: '移山庙', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 67,
    desc: '根据谋善村用补助款修缮一新的移山庙复刻的房间。室内常有线香点起，青烟缭绕，陈设朦朦胧胧，不大能看清楚。' },

  /* ★★ 2026-10-19 新增：秋日乐器行（furni_set_musicalStore）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'musicalStore', name: '秋日乐器行', tag: '秋日乐器行', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 82,
    desc: '音乐爱好者们干脆将莱塔尼亚的乐器行搬上了罗德岛。这里不仅按莱塔尼亚风格装点，乐器也一应俱全——既要身临其境，也要声如其境。' },

  /* ★★ 2026-10-19 新增：“岁岁平安”活动厅（furni_set_niansroom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'niansroom', name: '“岁岁平安”活动厅', tag: '岁岁平安活动', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 105,
    desc: '根据炎国影像资料复刻的尚蜀风格房间。年十分感兴趣，用让人无法拒绝的热情参与了部分家具的设计。年的兄弟姐妹经常受邀前来休憩。' },

  /* ★★ 2026-10-19 新增：莱塔尼亚之夜（furni_set_nightView）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'nightView', name: '莱塔尼亚之夜', tag: '莱塔尼亚之夜', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 26,
    desc: '再现了莱塔尼亚都市夜生活的概念房间。夜帷撒下，旋律与之为伴。' },

  /* ★★ 2026-10-19 新增：天灾观测研究站（furni_set_observation）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'observation', name: '天灾观测研究站', tag: '天灾观测研究', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 71,
    desc: '根据普罗旺斯的描述复现的天灾观测研究站，地灵补充了一些普罗旺斯不愿提起的细节。' },

  /* ★★ 2026-10-19 新增：食事处·御影（furni_set_odenShop）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'odenShop', name: '食事处·御影', tag: '食事处·御影', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 115,
    desc: '根据森内彻的构想复现的他曾经准备开在锻冶町的关东煮摊位。“不知道锻冶町重建之后会是什么样子，不过我想，应该不会再有这样的小店了吧。”' },

  /* ★★ 2026-10-19 新增：罗德岛人事办公室（furni_set_office）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'office', name: '罗德岛人事办公室', tag: '罗德岛人事办', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 27,
    desc: '罗德岛人事部门使用的办公室之一，每日都在为罗德岛筛选合适干员。' },

  /* ★★ 2026-10-19 新增：海滨印象（furni_set_outdoor）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'outdoor', name: '海滨印象', tag: '海滨印象', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 60,
    desc: '水月和同伴们搭建起的夏日海边印象房。或许这才是海洋应有的模样。' },

  /* ★★ 2026-10-19 新增：企鹅物流安全屋（furni_set_penguin）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'penguin', name: '企鹅物流安全屋', tag: '企鹅物流安全', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 19,
    desc: '合作组织企鹅物流的特制安全屋，设计与建造图纸已交付给罗德岛。' },

  /* ★★ 2026-10-19 新增：“沙洲下”奢华客房（furni_set_pepesroom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'pepesroom', name: '“沙洲下”奢华客房', tag: '沙洲下奢华客', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 96,
    desc: '根据佩佩提供的影像资料复现的米纳特哈玛仪豪华酒店地下客房，部分器物直接从相关酒店购买。要不是罗德岛采购部的预算有限，它一定会比太阳还闪耀。' },

  /* ★★ 2026-10-19 新增：莱娜的憩所（furni_set_perfumer）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'perfumer', name: '莱娜的憩所', tag: '莱娜的憩所', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 40,
    desc: '根据调香师莱娜在疗养庭院中的新房复制的概念房间。一年四季花香溢。' },

  /* ★★ 2026-10-20 新增：摄影爱好者影棚（furni_set_photoStudio）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'photoStudio', name: '摄影爱好者影棚', tag: '摄影爱好者影', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 41,
    desc: '罗德岛摄影爱好者们搭建的影棚。设备齐全,手法专业,只为拍摄好作品。' },

  /* ★★ 2026-10-20 新增：快捷连锁披萨店（furni_set_pizza）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'pizza', name: '快捷连锁披萨店', tag: '快捷连锁披萨', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 9,
    desc: '时兴的连锁披萨店。' },

  /* ★★ 2026-10-20 新增：威尔德披萨餐厅（furni_set_pizzeria）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'pizzeria', name: '威尔德披萨餐厅', tag: '威尔德披萨餐', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 125,
    desc: '根据叙拉古老牌餐厅“威尔德”的内部装潢复刻的房间。即便是最挑剔的美食家，也会对这家老店制作出的叙拉古披萨赞不绝口。经典而独特的绿色墙壁令人印象深刻，对无数美食爱好者来说更是值得信赖的店铺的象征。' },

  /* ★★ 2026-10-20 新增：雪山小邮局（furni_set_postOffice）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'postOffice', name: '雪山小邮局', tag: '雪山小邮局', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 83,
    desc: '雪山列车送来的观光游客一批又一批，从新开设的小邮局寄出的旅游纪念品一件又一件。' },

  /* ★★ 2026-10-20 新增：曼斯菲尔德囚室（furni_set_prison）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'prison', name: '曼斯菲尔德囚室', tag: '曼斯菲尔德囚', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 33,
    desc: '本不应该出现在罗德岛内部的标准囚室，可能真的有人想住进去换换口味吧。' },

  /* ★★ 2026-10-20 新增：大涌泉镇欢迎你！（furni_set_rabbitTown）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'rabbitTown', name: '大涌泉镇欢迎你！', tag: '大涌泉镇欢迎', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 133,
    desc: '根据安洁莉娜一行人的描述复现的大涌泉镇常见民居的内景。走进来一闻，空气中似乎都飘荡着胡萝卜的甜香，还有温泉所散发的淡淡硫磺味。' },

  /* ★★ 2026-10-20 新增：龙门风情茶室（furni_set_reception）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'reception', name: '龙门风情茶室', tag: '龙门风情茶室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 68,
    desc: '龙门颇具人气的一家茶室的高层包厢，据说常有大人物进出。陈设的用色传统而热烈，在城市冷峻的夜色中显得格外温暖。' },

  /* ★★ 2026-10-20 新增：天镜阁会客堂（furni_set_receptionRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'receptionRoom', name: '天镜阁会客堂', tag: '天镜阁会客堂', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 123,
    desc: '根据天镜阁底层对外开放的高级厅堂复刻的房间。会客堂平日专用于承接各类会谈事务，往来的不同立场者于此解决矛盾，筹措、商议民间的大小事务，或是开办棋弈、宣讲等活动。不过其在很长一段时日里大门紧闭，那期间使用者是何人也不曾有人听说。' },

  /* ★★ 2026-10-20 新增：龙门食坊（furni_set_restaurant）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'restaurant', name: '龙门食坊', tag: '龙门食坊', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 21,
    desc: '再现了龙门食坊的概念房间。欢庆佳节，恭迎宾客。' },

  /* ★★ 2026-10-20 新增：莱茵实验培养舱（furni_set_rhineLab）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'rhineLab', name: '莱茵实验培养舱', tag: '莱茵实验培养', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 56,
    desc: '根据多萝西干员等人描述再现的莱茵实验室。舱内培育着梦想，梦想反哺着人类，但偶尔也会反噬。' },

  /* ★★ 2026-10-20 新增：兰赛拉尔宴会厅（furni_set_rococo）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'rococo', name: '兰赛拉尔宴会厅', tag: '兰赛拉尔宴会', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 16,
    desc: '再现了偏远小国兰赛拉尔王城宴会厅的概念房间。群山之间一点光。' },

  /* ★★ 2026-10-20 新增：气密防化安全舱（furni_set_safetyZone）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'safetyZone', name: '气密防化安全舱', tag: '气密防化安全', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 15,
    desc: '配有防毒防化设施的消毒安全舱。仅适用于紧急时刻和极危任务。' },

  /* ★★ 2026-10-20 新增：萨米印象（furni_set_samiRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'samiRoom', name: '萨米印象', tag: '萨米印象', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 76,
    desc: '根据麦哲伦的笔记和其他参与科考的干员的补充报告复现的萨米林地小屋。宁静，古朴，从来如此。' },

  /* ★★ 2026-10-20 新增：“宝宝摇篮”号船舱（furni_set_shipRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'shipRoom', name: '“宝宝摇篮”号船舱', tag: '宝宝摇篮号船', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 103,
    desc: '根据棘刺的描述复现的“宝宝摇篮”号船舱内景。盐漠虽然一片苍白了无生机，但船舱内的生活总是多彩有趣的。' },

  /* ★★ 2026-10-20 新增：“驰骋荒野运载车”（furni_set_shuttle）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'shuttle', name: '“驰骋荒野运载车”', tag: '驰骋荒野运载', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 85,
    desc: '根据阿兰娜的描述复现的运载车客舱。阿兰娜本来想用全称“土石开掘与瓶树移栽及人员城际运载车”来命名这个房间，但后勤部的表格实在写不开这么长的名字。' },

  /* ★★ 2026-10-20 新增：“大海的后嗣们”（furni_set_skadisp）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'skadisp', name: '“大海的后嗣们”', tag: '大海的后嗣们', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 109,
    desc: '根据海洋印象所创作出的，富有生活气息的房间。两个不相容的灵魂在此浸染对彼此的感受。' },

  /* ★★ 2026-10-20 新增：“冷冽节奏”体验馆（furni_set_snowVenue）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'snowVenue', name: '“冷冽节奏”体验馆', tag: '冷冽节奏体验', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 75,
    desc: '冷酷冰爽的冰原生活，在此呈现。不要走开，还有说唱。' },

  /* ★★ 2026-10-20 新增：幻想生物纪实（furni_set_specimen）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'specimen', name: '幻想生物纪实', tag: '幻想生物纪实', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 4,
    desc: '由凯尔希主导建立的概念休息区，掺杂了超现实的博物馆结构。' },

  /* ★★ 2026-10-20 新增：鼎丰楼茶室（furni_set_springfeast）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'springfeast', name: '鼎丰楼茶室', tag: '鼎丰楼茶室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 104,
    desc: '根据煌的描述复现的百灶鼎丰楼茶室。百灶酒楼里有专供饮茶的区域，令煌干员印象深刻。“坐在里面喝一口茶，感觉能喝出六七八种滋味来。”' },

  /* ★★ 2026-10-20 新增：谢拉格风情旅店（furni_set_stage）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'stage', name: '谢拉格风情旅店', tag: '谢拉格风情旅', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 47,
    desc: '开设在希瓦艾什领铁道车站附近的旅店，罗德岛复制了其中一间房间。' },

  /* ★★ 2026-10-20 新增：老叙拉古裁缝店（furni_set_tailorShop）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'tailorShop', name: '老叙拉古裁缝店', tag: '老叙拉古裁缝', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 101,
    desc: '根据裁度描述复现的定制叙拉古风格传统套装的裁缝店。不论是家族的头面人物，还是最普通的叙拉古人，体面的衣装对每一个人都很重要。' },

  /* ★★ 2026-10-20 新增：“纳斯尔纱之夜”（furni_set_tarahouse）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'tarahouse', name: '“纳斯尔纱之夜”', tag: '纳斯尔纱之夜', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 107,
    desc: '以某位作家笔下的纳斯尔纱民居为蓝本还原的塔拉传统石屋。炉火燃烧，故事里的旧屋依然是主人离开时的模样，似乎已被时间遗忘。' },

  /* ★★ 2026-10-20 新增：祥苑冰室（furni_set_teaCanteen）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'teaCanteen', name: '祥苑冰室', tag: '祥苑冰室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 116,
    desc: '复现龙门茶餐厅样式的休息室。正如茶餐厅能提供多样风格的饮食，包容各种身份的顾客，这间休息室也不问访客来自何处，只为能让他们感受同样的舒适与惬意。' },

  /* ★★ 2026-10-20 新增：山城茶馆（furni_set_teaHouse）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'teaHouse', name: '山城茶馆', tag: '山城茶馆', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 48,
    desc: '在克洛丝和乌有的强烈推荐下，依照他们的描述而再现的尚蜀茶馆。山水饮茶，尽显蜀地韵味。' },

  /* ★★ 2026-10-20 新增：喀兰贸易接待室（furni_set_tradeLounge）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'tradeLounge', name: '喀兰贸易接待室', tag: '喀兰贸易接待', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 119,
    desc: '根据喀兰贸易的接待室复刻的房间。台前是一纸纸商业契约的签订，幕后是一场场危机变革的推进。外观上坚如磐石，内里却风起云涌。' },

  /* ★★ 2026-10-20 新增：伦蒂尼姆火车站台（furni_set_trainStation）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'trainStation', name: '伦蒂尼姆火车站台', tag: '伦蒂尼姆火车', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 100,
    desc: '根据多位干员的描述复现的傍晚的火车站台。经常有维多利亚干员来此喝茶、闲谈，或是什么都不做，就只是安静地坐在那里。' },

  /* ★★ 2026-10-20 新增：乌萨斯学生自治团活动处（furni_set_ursusRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'ursusRoom', name: '乌萨斯学生自治团活动处', tag: '乌萨斯学生自', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 126,
    desc: '根据乌萨斯学生自治团在圣骏堡的新活动据点复刻的房间。自治团在大学剧院中找到了一间可供社团活动的屋子，在这片烛火照耀的空间里，驱散附着在身体与心灵上寒意的意志之火永远不会熄灭。' },

  /* ★★ 2026-10-20 新增：风暴突击队作战室（furni_set_vcWarRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'vcWarRoom', name: '风暴突击队作战室', tag: '风暴突击队作', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 53,
    desc: '根据号角等人的描述而复现的维多利亚风暴突击队作战室，军情机动，方寸之间。' },

  /* ★★ 2026-10-20 新增：蓝卡坞摄影棚（furni_set_videoStudio）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'videoStudio', name: '蓝卡坞摄影棚', tag: '蓝卡坞摄影棚', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 111,
    desc: '根据蒂比描述复现的一座蓝卡坞摄影棚。还在寻找一炮而红的机会？还梦想着过富丽堂皇的生活？别再犹豫纠结，不论地位和出身，来蓝卡坞，你就是下一个璀璨之星！' },

  /* ★★ 2026-10-20 新增：凝思庭（furni_set_village）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'village', name: '凝思庭', tag: '凝思庭', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 34,
    desc: '以季节为主题，融合东方风格与西方设计理念的休息室之一。在征求文月小姐同意后，罗德岛提取概念复制了其中一间。' },

  /* ★★ 2026-10-20 新增：“玫瑰河畔安全屋”（furni_set_villagemanor）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'villagemanor', name: '“玫瑰河畔安全屋”', tag: '玫瑰河畔安全', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 106,
    desc: '以卡兹戴尔传奇间谍组织“玫瑰河畔”的安全屋为主题布置的房间。后勤部干员们对“玫瑰河畔”了解甚少，但好在，他们都有丰富的间谍小说阅读履历。只是，卡兹戴尔真的会有这样的地方吗？' },

  /* ★★ 2026-10-20 新增：“求索者之梦”科考小屋（furni_set_volcaRoom）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'volcaRoom', name: '“求索者之梦”科考小屋', tag: '求索者之梦科', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 77,
    desc: '艾雅法拉回忆中的火山科考小屋。大地温和似父亲的怀抱，云霭轻柔如母亲的安慰。' },

  /* ★★ 2026-10-20 新增：货运仓库（furni_set_warehouse）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'warehouse', name: '货运仓库', tag: '货运仓库', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 1,
    desc: '各物流公司仓库的基础布置。' },

  /* ★★ 2026-10-20 新增：谢拉格游客体验中心（furni_set_winterHouse）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'winterHouse', name: '谢拉格游客体验中心', tag: '谢拉格游客体', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 120,
    desc: '根据谢拉格某处游客体验中心的内部装潢复刻的房间。和宣传的不一样，眼前的许多陈设明显地受到了外来文化的影响，这正是如今雪境处于变局的缩影。' },

  /* ★★ 2026-10-20 新增：萨米乡野别墅（furni_set_wooden）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'wooden', name: '萨米乡野别墅', tag: '萨米乡野别墅', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 10,
    desc: '模仿萨米传统木屋风格的概念房间，建设时使用了些久置仓库的装饰。' },

  /* ★★ 2026-10-20 新增：黛青山房（furni_set_yanPrivateSchool）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'yanPrivateSchool', name: '黛青山房', tag: '黛青山房', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 112,
    desc: '根据惊蛰的描述复现的置锥学塾收藏室。这个炎国小镇上发生的故事极少为外人所知，幸好还有人试图将它们记住、留下来。' },

  /* ★★ 2026-10-20 新增：多索雷斯私人水疗室（furni_set_westCoast）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 'westCoast', name: '多索雷斯私人水疗室', tag: '多索雷斯私人', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 42,
    desc: '再现了多索雷斯高端休闲会所水疗室的概念房间。在这里享受生活时，最好不要用金钱来衡量品质。' },

  /* ★★ 2026-10-21 新增：边线/纯色简约家居（furni_set_s1_01）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 's1_01', name: '边线/纯色简约家居', tag: '边线/纯色简', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 2,
    desc: '萨米知名家居公司售卖的经典主题，以纯色作为设计理念。' },

  /* ★★ 2026-10-21 新增：边线/橘色简约家居（furni_set_s1_02）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 's1_02', name: '边线/橘色简约家居', tag: '边线/橘色简', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 3,
    desc: '萨米知名家居公司售卖的经典主题，加入了橘色元素。' },

  /* ★★ 2026-10-21 新增：近卫局休息室（furni_set_s2_01）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 's2_01', name: '近卫局休息室', tag: '近卫局休息室', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 7,
    desc: '龙门近卫局休息室，现代而庄重。' },

  /* ★★ 2026-10-21 新增：仿龙门式休息室（furni_set_s2_02）—— inHub:false（走廊门位固定 6 个，新房间走 Tab 面板）
     · 预览图：arts\shop\furngroup\（商店宣传卡，480×296）
     · hasRig:false —— 没做 rooms\_rig 旧光照回退版
     · kind:'dorm' —— 主题宿舍 */
  { theme: 's2_02', name: '仿龙门式休息室', tag: '仿龙门式休息', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 8,
    desc: '仿照龙门装修风格设计的休息室。' },

  /* ★ 会客室 = 第 7 间，是网站的初始场地。
       inHub:false —— 走廊尽头那扇走的是 hub.html 里单独的 END_DOOR，
       不是 DOORS 数组那 6 个门位（塞进去会让 DOOR_THEME 下标全部错位）。
     ★★★ 2026-10-14 回填：`family:'meeting'` ——
        ★★ 2026-10-23 起 `kind` 改回 `'dorm'`（家具主题组）：本套是 `furniM_set_basicRoom`，
           sortId=1001（全库最新），留在 function 组会掉到列表最后，
           与用户要的「139 套家具主题全部在前」冲突。房型判据（46×16）仍成立，
           只是**菜单分组不再用它** —— 见文件顶部「排序规则」。
       会客室在游戏里**就是一个功能房间**（跟制造站同类，房型 `room_meeting_8x2` / 46×16 格），
       只是它是"能换家具"的那种（游戏早期它根本没有换家具系统，后来更新才加的）。
     ★★ 备注：这一套是**默认家具**的会客室 —— 会客室族四套里的基准套
       （basicRoom 1001 / taiko 1002 / amiya 1003 / velvet 1004），
       另外三套是"非默认家具"的换装版本（见各自条目的备注）。 */
  { theme: 'basicRoom', name: '会客室', tag: '会客室', inHub: false, hasRig: false, terminal: true,
    kind: 'dorm', family: 'meeting',   // ★ 2026-10-23：会客室族归「家具主题」组（sortId 1001~1004 全库最新）
    defaultFurni: true,
    sortId: 1001,
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
  /* ★★★ 2026-10-23 补录：干员才艺展示餐厅（furni_set_rhodesKitchen, sortId 99）——
     GLB 早就导出了（`rooms\rhodesKitchen.glb`），walk.html 的 ROOM_TITLE / 光照表里也早就写了它，
     但 manifest 里一直没这一条 ⇒「139 套家具主题」实际只有 138 套。
     补上之后：139 套家具主题 + 8 间基建功能房 = 147 条。
     · 预览图：spritepack\building_diy_theme_ui_h1_0\furni_set_rhodesKitchen.png（官方主题卡） */
  { theme: 'rhodesKitchen', name: '干员才艺展示餐厅', tag: '干员才艺展示', inHub: false, hasRig: false,
    kind: 'dorm',
    sortId: 99,
    desc: '罗德岛用于展示各位干员手艺的概念房间。你有什么关于料理的想法，在这里都可以实现！' },

  /* ═══════════════════════════════════════════════════════════════════════════
     ★★★ 基建功能房 8 间（2026-10-22 导出）—— 全部 `kind:'function'`
     ───────────────────────────────────────────────────────────────────────────
     · 面板里排在家具主题【后面】，单独一组并标「研究中」
       （动态效果还没还原：机械臂 / 传送带；控制中枢甚至只有一块背景板）
     · 组内顺序 = **本数组顺序**，用户 2026-10-23 明确指定：
         回收站 → 制造站 → 办公室 → 加工站 → 训练室 → 贸易站 → 发电站 → 控制中枢
       ⚠️ 别按字母/导出时间重排 —— 用户说过「别自己另定顺序」。
     · 这些房间没有游戏内 sortId（不是主题套组）⇒ 不写 sortId 字段。
     ═══════════════════════════════════════════════════════════════════════════ */

  /* ★★ 2026-10-22 新增：回收站（基建功能房，非主题套组）—— 3D 资产在 vault/[uc]rooms */
  { theme: 'recycle', name: '回收站', tag: '回收站', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：回收无人机与原津重利用。' },

  /* ★★ 2026-10-22 新增：制造站（基建功能房，非主题套组）—— 房壳/设备在 vault/[uc]rooms + [uc]arts */
  { theme: 'manufacture', name: '制造站', tag: '制造站', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：用源石碎片制造作战记录与赤金。' },

  /* ★★ 2026-10-22 新增：办公室 / 加工站 / 训练室（4x2x2 静态三间，结构与回收站同族） */
  { theme: 'hire', name: '办公室', tag: '办公室', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：招募与人事处理。' },
  { theme: 'workshop', name: '加工站', tag: '加工站', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：加工材料与合成。' },
  { theme: 'training', name: '训练室', tag: '训练室', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：干员技能训练。' },

  /* ★★ 2026-10-22 新增：贸易站 / 发电站（先出静态姿势，动态等解包）
     ⚠️ 这两间的 prefab 里没有 room_01/room_02，房壳是设备层里的一块（trading→`room`、power→`polySurface74`）；
        贸易站的 `polySurface2/3` 网格是毫米单位，且设备相对房壳偏出约 1.8 m，待目视确认。 */
  { theme: 'trading', name: '贸易站', tag: '贸易站', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：消耗赤金换取订单收益。' },
  { theme: 'power', name: '发电站', tag: '发电站', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：为基建提供电力。' },

  /* ★★ 2026-10-22 新增：控制中枢（8x4 = 46×16 格）—— ★ 用户 2026-10-23 拍板「不拼了」，
     网页端只保留「研究中」提示。它只有一块 8.81×2.33 m 的背板（`background`，贴图是仪表盘 UI），
     `room`/`room_01` 只有几厘米，不是可走动的房间。 */
  { theme: 'control', name: '控制中枢', tag: '控制中枢', inHub: false, hasRig: false,
    kind: 'function',
    desc: '基建功能房：基建全局调度。' },

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
    /* ★★ 2026-10-14 加：`kind` 拼错/写了别的值时提示一句 ——
       面板的分组只认 'function'，其它值（含缺省）一律按 'dorm' 兜底（见顶部注释），
       所以这里【不报错，只提醒】，免得手滑打错字却看不出分组为什么不对。 */
    if (r.kind != null && r.kind !== 'function' && r.kind !== 'dorm'){
      console.warn('★ manifest.js：%s 的 kind 是 %o —— 只认 "function"/"dorm"，' +
        '其它值会被当成主题宿舍（dorm）', r.theme, r.kind);
    }
    // ★ family 只该出现在会客室族上（2026-10-23：会客室族已归入 kind:'dorm'，所以不再按 kind 判）
    if (r.family && r.family !== 'meeting'){
      console.warn('★ manifest.js：%s 写了 family:%s —— 目前只定义过 meeting（会客室族）',
        r.theme, r.family);
    }
    /* ★★★ 2026-10-23 加：家具主题必须有 `sortId`（面板按它降序排）。
       漏写不会崩，但那一间会被当成 sortId 0 掉到列表最下面 —— 很像"房间消失了"。
       sortId 用 `node 网页原型\_fk_manifest_sortid.cjs` 回填，别手编。 */
    if (r.kind !== 'function' && typeof r.sortId !== 'number'){
      console.warn('★ manifest.js：%s 是家具主题但没有 sortId —— ' +
        '跑一次 `node 网页原型\\_fk_manifest_sortid.cjs` 回填', r.theme);
    }
    /* ★★ 2026-10-14 加：会客室族的 `defaultFurni` 必须显式写。
       面板靠它决定"要不要加（会客室）后缀"（默认那套不加）——
       漏写时它是 undefined ⇒ 会被当成"非默认" ⇒ 名字后面多一个（会客室），
       而 basicRoom（默认那套）多这个后缀是**错的**。这种错很不起眼，所以在这里点名。 */
    if (r.family === 'meeting' && r.defaultFurni === undefined){
      console.warn('★ manifest.js：%s 是会客室族但没写 defaultFurni —— ' +
        '会客室族的每一套都要显式写它（默认家具那套写 true，它不会加"（会客室）"后缀）',
        r.theme);
    }
  }
  const hubN = ROOMS.filter((r) => r.inHub).length;
  const fnN = ROOMS.filter((r) => r.kind === 'function').length;
  console.log('%c★ 房间清单（rooms/manifest.js）：共 %d 间（家具主题 %d / 基建功能房 %d），其中走廊有门 %d 间',
    'color:#5fd8e8', ROOMS.length, ROOMS.length - fnN, fnN, Math.min(hubN, 6));
  /* ★ 2026-10-23：顺手把"排序前后各是谁"打出来，一眼能核对用户要的
     「最上面是最新那批 / 功能房之前最下面是 warehouse、s1_01…」。 */
  const dorm = ROOMS.filter((r) => r.kind !== 'function').sort((a, b) => (b.sortId || 0) - (a.sortId || 0));
  if (dorm.length){
    console.log('   列表最前：%s ｜ 功能房之前最后：%s',
      dorm.slice(0, 3).map((r) => r.theme + '(' + r.sortId + ')').join(' → '),
      dorm.slice(-3).map((r) => r.theme + '(' + r.sortId + ')').join(' → '));
  }
})();
