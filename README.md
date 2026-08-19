# AFTERDARK

一款移动端优先的互动夜生活叙事游戏：玩家建立本地角色形象，选择身高、夜间人格、真实曲目与酒类，系统再随机抽取酒吧并生成四幕分支故事。

## 内容规模

- 30 家真实酒吧与夜生活目的地（含上海 INS；官方榜单名次与编辑精选明确区分）
- 50 种音乐风格与真实代表曲目
- 50 种鸡尾酒、啤酒、葡萄酒、清酒、白酒、烈酒及无酒精选
- 100 个细节剧情种子：入场、相遇、升温、结局各 25 个
- 多结局：搭讪、心动、明确同意后的 kiss、交换联系方式、独处、朋友同行、安全离场等

## 隐私与安全

角色照片只通过浏览器 `FileReader` 在本机预览，不上传、不持久化、不做人脸识别。项目为 18+ 娱乐性虚构体验，不声称预测现实；亲密情节强调清楚、持续、可撤回的同意，并提供 0% 酒款选项。

## 数据资料

- [Asia’s 50 Best Bars 2026](https://mmx.prnewswire.com/media/MS1890898/A50BB2026-Results-The-List.pdf)
- [Spotify 2026 Songs of Summer](https://newsroom.spotify.com/2026-05-29/songs-of-summer-predictions/)
- [International Bartenders Association Cocktails](https://iba-world.com/cocktails/)
- [腾讯音乐榜](https://chart.tencentmusic.com/)

中国目前没有覆盖所有酒吧和夜店的统一“全国 Top 30”官方榜单。本项目以 2026 Asia’s 50 Best Bars 的中国上榜酒吧为锚点，补充城市知名场所，作为游戏编辑池；不宣称是官方全国排名。营业状态和入场规则请在现实出行前核实。

## 本地运行

```bash
pnpm install
pnpm dev
```

Vercel 使用 `pnpm build:vercel` 输出静态单页版本；Sites/Cloudflare 兼容构建使用 `pnpm build`。
