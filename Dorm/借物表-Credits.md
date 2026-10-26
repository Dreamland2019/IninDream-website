# 借物表 / Credits · 素材与代码来源

> 本项目是**个人非商业性质**的明日方舟主题个人网站。
> 所有游戏素材版权归 **上海鹰角网络科技有限公司（Hypergryph）** 所有。
> 本项目**不开源游戏素材**，仅作个人展示用途。

---

## 一、游戏素材（模型 / 贴图 / 数据）

### 1.1 宿舍家具模型与贴图

| 项目 | 说明 |
|---|---|
| 来源 | 本机安装的《明日方舟》客户端，自行解包 |
| 游戏路径 | `Arknights_Data\StreamingAssets\AB\Windows\` |
| 涉及内容 | 家具 3D 模型（`.obj`）、家具图集贴图（`.png`）、房间模板、墙纸/地板贴图 |
| 解包后位置 | `building\diy\prefabs\furnitures\`、`building\diy\materials\`、`building\diy\arts\models\room\` |
| 用途 | 在 Blender 中重建宿舍场景，导出 GLB 供网页第一人称漫游 |
| 版权 | © 上海鹰角网络科技有限公司（Hypergryph） |

### 1.2 基建走廊素材

| 项目 | 说明 |
|---|---|
| 来源 | 同上，解包自本机游戏客户端 |
| 解包后位置 | `building\vault\[uc]arts\`、`building\vault\[uc]rooms\`、`building\[pack]room\` |
| 用到的贴图 | `TX_room_door_01.png`（金属门）、`TX_corridor_room_01.png`（走廊配色参考）、`TX_room_corridor_2x2_01.png`（走廊布局参考） |
| ★ 说明 | **走廊的 3D 几何体在解包数据中不完整**（`room_inner_2x2x2_corridor_01.obj` 只是个小配件），因此走廊是由本项目**参照游戏截图和美工配色、用 Blender 自行搭建**的，只使用了游戏的原贴图（门）与原配色 |
| 版权 | © 上海鹰角网络科技有限公司（Hypergryph） |

### 1.3 家具预设布局数据

| 项目 | 说明 |
|---|---|
| 数据文件 | `building_data.json`（5.0 MB） |
| 来源仓库 | **[Kengxxiao/ArknightsGameData](https://github.com/Kengxxiao/ArknightsGameData)** |
| 具体路径 | `zh_CN/gamedata/excel/building_data.json` |
| 用途 | 读取 **139 套家具主题的官方预设摆放坐标**（`customData.themes.<id>.quickSetup`），实现"一键还原游戏内布局"<br>（`_akdata\building_data.json` 实测 **139 themes / 2871 furnitures**） |
| 引用方式 | 原始 JSON 未修改，仅提取坐标后转换为 Blender 世界坐标 |
| 致谢 | 感谢该仓库维护者长期同步游戏数据 |

### 1.4 Spine 骨骼动画（手部光标）

> ⚠️ **当前状态：参考素材 / 站点未接入**（2026-10-12 核实）
> `网页原型\` 下**没有** `spine-canvas.js`，任何 HTML 都**没有**引用 spine；
> `anim_active_finger.png` 也不在 `网页原型\assets\` 里。
> 本包当前只作为**参考实现**留在 `参考素材\物件参考\手\`，**线上并未使用第三方 Spine 运行时**。

| 项目 | 说明 |
|---|---|
| 文件 | `enemy_10072_mpprhd.skel` / `.atlas` / `.png` |
| 来源 | `PRTS鼠标指针-Windows-1.1.4`（第三方明日方舟主题鼠标指针包） |
| 该包内 `Credits.txt` 原文 | *"非官方自用衍生工具。明日方舟及角色/界面素材归原权利人。迷迭香模型取自本机 ArkPets 已解包资源，行为为独立窗口适配实现，未运行 ArkPets 程序。Spine 运行库保留源码内许可证；WebView2 来自微软官方 NuGet 包。"* |
| 用途 | ~~网页中"悬停/按住可交互物件"时显示的手部光标~~ → **当前未接入**，仅作光标逻辑的参考实现 |
| 版权 | 素材 © Hypergryph；指针包为第三方非官方作品 |

### 1.5 其他游戏素材

| 项目 | 说明 |
|---|---|
| `anim_active_finger.png` | 游戏内"可点击"提示手指图标，来源 `building\[pack]room\`（★ 当前不在 `网页原型\assets\`，未接入） |
| **背景音乐** | `bgm.mp3` —— 曲名 **《生命流》**，作曲 **塞壬唱片-MSR / BaoUner**（© Hypergryph）<br>源文件为 FLAC（19 MB），站内转 MP3（5.2 MB）+ 一份 `bgm_low.mp3`（低码率备选） |
| 干员立绘/头像 | 用于彩蛋（博士），来源游戏素材（© Hypergryph）—— `assets\doctor_head/face/face_sq/hand.webp` |

---

## 二、第三方代码与工具

### 2.1 运行时库

| 名称 | 版本 | 许可证 | 用途 | 链接 |
|---|---|---|---|---|
| **three.js** | 0.160.0 | MIT | 网页 3D 渲染（`lib\three.module.js` 实测 `REVISION='160'` ✓） | https://threejs.org |
| **GLTFLoader** | 随 three.js | MIT | 加载 GLB 模型 | https://threejs.org |
| **three.js 后处理**（EffectComposer / RenderPass / ShaderPass / UnrealBloomPass / OutputPass / MaskPass …） | 随 three.js | MIT | 网页端泛光（Bloom）与色调映射 | https://threejs.org |
| ~~**Spine Runtimes (spine-canvas.js)**~~ | — | Spine Runtimes License | ~~渲染手部 Spine 动画~~ → ★ **当前站点未接入**，详见 §1.4 | http://esotericsoftware.com |

### 2.1.1 three.js 的 MIT 许可全文

> `网页原型\lib\three.module.js` 头部保留了原版权与 SPDX 标识：
> `Copyright 2010-2023 Three.js Authors` / `SPDX-License-Identifier: MIT`。
> `lib\` 下的 `GLTFLoader.js`、`OrbitControls.js`、`BufferGeometryUtils.js`、
> `postprocessing\*`、`shaders\*` 均为 three.js **r160 官方 examples/addons**，
> 随 three.js 采用同一 MIT 许可。以下为随附的完整许可文本：

```text
MIT License

Copyright (c) 2010-2023 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 2.2 参考的第三方代码

| 项目 | 说明 |
|---|---|
| `grab-cursor.js` | 来自 `PRTS鼠标指针-Windows-1.1.4` 包，是"手部光标随鼠标移动 + 悬停/按下/松开三态切换"的完整参考实现。本项目的网页光标逻辑**参考了它的状态机与动画调度思路**，并按其做法（`Grab_Begin` 定格 0.65 → `Grab_Loop` 循环 → `Grab_End`）实现 |
| `spine-canvas.js` | 同上包内附带的 Spine 运行时（Canvas 渲染器）—— ★ 参考用，未接入本站 |

### 2.3 第三方工具

| 工具 | 版本 | 用途 |
|---|---|---|
| **ArkUnpacker** | **v5.2.0** | ★★ **贯穿整条素材管线**：从游戏 AB 包导出 typetree（材质/shader/prefab 层级）、OBJ、PNG。<br>项目里所有"权威表"都源自它的 typetree 输出（`building_data.json` 之外的素材链全靠它） |
| **Blender** | 4.5 LTS | 3D 场景重建、材质制作、渲染出图、导出 GLB |
| **Python** | 3.12 | 数据解析（`building_data.json`）、图集分析（PIL）、批量脚本 |
| **PowerShell** | 5.1 / 7 | 自动化流程 |
| **ffmpeg** | 6.0 | 音视频处理 |

### 2.4 资料出处

| 来源 | 用途 |
|---|---|
| **[PRTS Wiki](https://prts.wiki)** | 干员资料、家具主题中文名/文案的交叉核对 |

---

## 三、本项目自己写的部分

### 3.1 素材管线（`3D渲染\`）

| 内容 | 说明 |
|---|---|
| **通用导入器** `import_theme.py` | ★ 把游戏 OBJ + 图集贴图按官方预设坐标导入 Blender；处理 7 种摆放类型（FLOOR/WALL/POSTER/CEILING/CARPET/CEILINGDECAL/NONE）、多分件材质、透明与发光材质、**多房型档案**（`ROOM_PROFILES`）<br>★ 早期版本 `import_theme_v4.py` / `import_theme_rabbit*.py` / `import_theme_clmsroom.py` **已弃用**（文件头有横幅） |
| **按【家具+分件】的材质表生成器** `_fk_piece_variants.py` | ★ 解决"同名分件跨家具用不同图集"（`shelf_04` 在三件家具下是三个不同分件）—— 输出 `_akdata\<主题>_piece_material.json`，导入器优先读它 |
| **权威链工具** `blend_tools\furni_texmap.py` · `furni_parts_from_texmap.py` | 从 AB 包 typetree 自动生成"家具→分件→材质→贴图"权威表（252 主题） |
| **shader→alphaMode 权威表** `_fk_game_mat_shader_map.py` | ★ 生成"件名→游戏材质→shader→应有 alphaMode"，并据此修正 GLB（`_fk_fix_alphamode.py`） |
| **unlit 直出改造** `_fk_apply_unlit_mode.py` | 把 .blend 改成"贴图直出"（贴图接 Emission + Base Color 置黑），与游戏一致 |
| **网页 GLB 导出器** `blend_tools\export_theme_web_glb.py` | 按网页端约定重排材质、打 `KHR_materials_unlit`、导点光、写加色片 `extras` |
| **阴影配对** `_fk_shadow_pair.py` | 13 件家具各自的 `shadow_01$N` 网格配对（顶点数 + 几何） |
| **图集判定流程** | 自动识别不可靠（试过"透明占比""边缘密度"两种判据均失败）→ 最终走**权威表 + 人工判读兜底**的流程 |

### 3.2 网站本体（`网页原型\`）

| 内容 | 说明 |
|---|---|
| **走廊 Hub** `hub.html` + `build_corridor.py` | 参照游戏风格自行搭建的 6 门走廊（门牌图取自游戏原图 480×296） |
| **网页第一人称漫游** `walk.html` | three.js 实现：移动 / 信赖度彩蛋（博士）、**unlit 直出房间**、泛光（`B`）、现场调参面板（`L`，1-8 通道）、定点相机（`?cam=`/`?look=`）、GLB 版本回退（`?mode=rig` / `?fix=0`） |
| **本地静态服务器** `serve.js` | 含 `POST /__save_tune` 端点（把网页里调好的光照参数直接落盘） |

---

## 四、免责声明

1. 本项目为**个人学习与非商业用途**，不对游戏素材主张任何权利。
2. 所有《明日方舟》相关的模型、贴图、音乐、角色形象等，版权归 **上海鹰角网络科技有限公司（Hypergryph）** 所有。
3. 本项目**不提供游戏素材的下载**，网站上的素材仅用于在线展示。
4. 若权利方认为本项目存在侵权，请联系删除。

---

*最后更新：2026-10-12（★ 索引里记的"2026-10-13 补齐 BGM/ArkUnpacker 署名"是同一批改动，日期以本行为准）*（补充 BGM 曲名/作曲、ArkUnpacker 署名、Spine 未接入说明、现行工具链）
