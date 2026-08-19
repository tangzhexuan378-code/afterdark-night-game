"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { BARS, DRINKS, MATCH_PROFILES, MUSIC, STORY_SEEDS, type MatchProfile, type StorySeed } from "./data";

type Stage = "landing" | "setup" | "game" | "ending";
type Persona = "spark" | "mystery" | "chill";
type Stats = { spark: number; energy: number; clarity: number };
type Choice = { label: string; note: string; delta: Partial<Stats>; action: string };
type LibraryTab = "bars" | "music" | "drinks" | "stories";
type PlayerGender = "woman" | "man" | "nonbinary" | "private";
type Interest = "opposite" | "women" | "men" | "all" | "none";
type HeightPreference = "similar" | "taller" | "shorter" | "none";
type ModelMode = "manual" | "photo";
type FeatureKey = "faceShape" | "eyes" | "brows" | "nose" | "lips" | "hair" | "outfit";
type MatchPart = { label: string; points: number; reason: string };

const PERSONAS: { id: Persona; icon: string; name: string; desc: string }[] = [
  { id: "spark", icon: "✦", name: "聚光体", desc: "主动、明亮，容易被看见" },
  { id: "mystery", icon: "◐", name: "谜面", desc: "克制、好奇，擅长留白" },
  { id: "chill", icon: "≈", name: "松弛派", desc: "随性、自在，不追赶剧情" },
];

const FEATURES: Record<FeatureKey, { value: string; label: string; reason: string }[]> = {
  faceShape: [
    {value:"oval",label:"椭圆",reason:"轮廓过渡柔和，适合用眉眼或耳饰建立视觉重点"},
    {value:"round",label:"圆润",reason:"面部重心集中，短发与纵向配饰会让轮廓更清楚"},
    {value:"square",label:"偏方",reason:"下颌线存在感较强，在侧光环境里更容易形成清晰剪影"},
    {value:"heart",label:"心形",reason:"额颞部较宽、下巴收束，发型会明显改变整体平衡"},
    {value:"long",label:"偏长",reason:"纵向比例突出，横向眉形与发量能平衡视觉重心"},
  ],
  eyes: [
    {value:"almond",label:"杏眼",reason:"眼裂长宽较均衡，平视时容易形成稳定眼神线"},
    {value:"round",label:"圆眼",reason:"眼部开合感明显，在低照度下仍有较强表情可读性"},
    {value:"upturned",label:"上扬",reason:"外眼角走势更利落，适合用克制眉形避免过度锐化"},
    {value:"narrow",label:"细长",reason:"横向线条突出，近距离交流时细微表情更有层次"},
    {value:"monolid",label:"单眼皮",reason:"眼睑线条简洁，侧光和眼神方向会成为主要视觉信息"},
  ],
  brows: [
    {value:"straight",label:"平直眉",reason:"横向稳定，整体气质更克制、清晰"},
    {value:"soft",label:"自然弯眉",reason:"线条柔和，更容易与圆润眼型形成连续表情"},
    {value:"bold",label:"浓眉",reason:"眉眼对比度高，在酒吧暗光里更容易保留轮廓"},
    {value:"arched",label:"挑眉",reason:"眉峰明确，会加强眉眼上扬趋势与视觉张力"},
  ],
  nose: [
    {value:"soft",label:"柔和鼻梁",reason:"面部中轴对比温和，视觉重点更容易落在眉眼或唇部"},
    {value:"straight",label:"直鼻",reason:"中轴线清晰，正面和三分之二侧面都较稳定"},
    {value:"defined",label:"立体鼻梁",reason:"侧光下明暗分区明显，会强化面部结构感"},
    {value:"rounded",label:"圆润鼻尖",reason:"中庭线条更柔软，与微笑表情的连接更自然"},
  ],
  lips: [
    {value:"balanced",label:"薄厚均衡",reason:"静态与微笑状态差异适中，表达重心较平衡"},
    {value:"full",label:"饱满唇形",reason:"唇部视觉权重较高，适合减少其他高对比元素"},
    {value:"thin",label:"偏薄唇形",reason:"线条感清晰，轻微表情变化会更细腻"},
    {value:"smile",label:"微笑唇",reason:"嘴角走势更容易被读成开放，但不代表真实性格"},
  ],
  hair: [
    {value:"short",label:"利落短发",reason:"露出下颌与眉眼，轮廓信息集中"},
    {value:"bob",label:"齐耳短发",reason:"在面部两侧形成框架，适合强化脸型平衡"},
    {value:"medium",label:"锁骨发",reason:"能在侧面形成柔和层次，转身时动态明显"},
    {value:"long",label:"长发",reason:"发量成为整体造型的重要面积，适合控制配饰数量"},
    {value:"curly",label:"自然卷",reason:"纹理丰富，在灯光移动时更容易产生动态层次"},
    {value:"tied",label:"束发",reason:"面部与颈部线条更开放，整体显得干净利落"},
  ],
  outfit: [
    {value:"minimal",label:"极简黑白",reason:"减少服装噪声，把注意力留给轮廓和交流"},
    {value:"street",label:"城市街头",reason:"颜色与廓形信息更强，适合高能量音乐空间"},
    {value:"retro",label:"复古质感",reason:"材质和配饰容易成为低压力的开场话题"},
    {value:"tailored",label:"利落剪裁",reason:"肩线与纵向比例清楚，在酒店吧或鸡尾酒吧更协调"},
    {value:"romantic",label:"柔软浪漫",reason:"面料和曲线更柔和，适合低能量音乐与坐席环境"},
  ],
};

const clamp = (n: number) => Math.max(0, Math.min(10, n));
const randomIndex = (length: number) => Math.floor(Math.random() * length);
const spotifyUrl = (title: string, artist: string, id?: string) => id
  ? `https://open.spotify.com/track/${id}`
  : `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;
const feature = (key: FeatureKey, value: string) => FEATURES[key].find((item) => item.value === value) ?? FEATURES[key][0];
const heightFits = (preference: HeightPreference, playerHeight: number, matchHeight: number) => {
  if (preference === "none") return true;
  if (preference === "similar") return Math.abs(playerHeight - matchHeight) <= 6;
  if (preference === "taller") return matchHeight > playerHeight;
  return matchHeight < playerHeight;
};
const genderFits = (profile: MatchProfile, playerGender: PlayerGender, interest: Interest) => {
  if (interest === "none") return false;
  if (interest === "all") return true;
  if (interest === "women") return profile.gender === "woman";
  if (interest === "men") return profile.gender === "man";
  if (playerGender === "man") return profile.gender === "woman";
  if (playerGender === "woman") return profile.gender === "man";
  return profile.gender !== "nonbinary";
};
const matchParts = (
  profile: MatchProfile, musicStyle: string, musicEnergy: number, drinkFamily: string, drinkAbv: number,
  persona: Persona, playerHeight: number, preference: HeightPreference, stats: Stats,
): MatchPart[] => {
  const exactMusic = profile.musicStyles.includes(musicStyle);
  const energyGap = Math.abs(profile.musicEnergy - musicEnergy);
  const exactDrink = profile.drinkFamilies.includes(drinkFamily);
  const abvGap = Math.abs(profile.drinkAbv - drinkAbv);
  const heightMatch = heightFits(preference, playerHeight, profile.height);
  return [
    { label:"音乐共鸣", points:exactMusic ? 14 : energyGap <= 1 ? 9 : 5, reason:exactMusic ? `你们都选择 ${musicStyle}，共同曲风能直接成为开场话题。` : `曲风不同，但能量差为 ${energyGap} 级，互动节拍仍可对齐。` },
    { label:"酒饮节奏", points:exactDrink ? 10 : abvGap <= 8 ? 7 : 3, reason:exactDrink ? `你们偏好的酒都落在“${drinkFamily}”，风味语言相近。` : `酒精度相差约 ${abvGap} 个百分点；分数只反映饮用节奏，不把酒量当魅力。` },
    { label:"社交模式", points:profile.vibe === persona ? 8 : 5, reason:profile.vibe === persona ? "两人的夜间人格一致，靠近和停顿的速度更容易互相理解。" : "社交风格不同，保留互补空间，但需要更明确地表达边界。" },
    { label:"身高偏好", points:heightMatch ? 6 : 3, reason:preference === "none" ? `你选择不设身高偏好，${profile.height}cm 仅用于场景构图。` : heightMatch ? `${profile.height}cm 符合你主动填写的身高偏好；这不是系统替你假设。` : `${profile.height}cm 不完全符合偏好，因此只给少量场景分，不否定交流可能。` },
    { label:"互动反馈", points:Math.max(3, Math.min(6, Math.round((stats.spark + stats.clarity) / 4))), reason:`根据本局“心动 ${stats.spark}/10、清醒 ${stats.clarity}/10”计算；清醒反馈与心动同等重要。` },
  ];
};
const matchScore = (parts: MatchPart[]) => Math.min(94, 52 + parts.reduce((sum, item) => sum + item.points, 0));

function StoryLogo() {
  return <span className="wordmark">AFTER<span>DARK</span></span>;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("landing");
  const [adult, setAdult] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("bars");
  const [nickname, setNickname] = useState("夜行者");
  const [height, setHeight] = useState(172);
  const [persona, setPersona] = useState<Persona>("mystery");
  const [avatar, setAvatar] = useState("");
  const [modelMode, setModelMode] = useState<ModelMode>("manual");
  const [playerGender, setPlayerGender] = useState<PlayerGender>("private");
  const [interest, setInterest] = useState<Interest>("all");
  const [heightPreference, setHeightPreference] = useState<HeightPreference>("none");
  const [faceShape, setFaceShape] = useState("oval");
  const [eyes, setEyes] = useState("almond");
  const [brows, setBrows] = useState("straight");
  const [nose, setNose] = useState("straight");
  const [lips, setLips] = useState("balanced");
  const [hair, setHair] = useState("short");
  const [outfit, setOutfit] = useState("minimal");
  const [musicIndex, setMusicIndex] = useState(0);
  const [drinkIndex, setDrinkIndex] = useState(49);
  const [barIndex, setBarIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [fortune, setFortune] = useState(0);
  const [storyIndexes, setStoryIndexes] = useState([0, 25, 50, 75]);
  const [matchIndex, setMatchIndex] = useState(-1);
  const [stats, setStats] = useState<Stats>({ spark: 2, energy: 2, clarity: 8 });
  const [history, setHistory] = useState<{ time: string; text: string }[]>([]);
  const [ending, setEnding] = useState({ tag: "", title: "", text: "" });

  const music = MUSIC[musicIndex];
  const drink = DRINKS[drinkIndex];
  const bar = BARS[barIndex];
  const match = matchIndex >= 0 ? MATCH_PROFILES[matchIndex] : null;
  const seed = STORY_SEEDS[storyIndexes[round]] ?? STORY_SEEDS[round * 25];
  const personaName = PERSONAS.find((p) => p.id === persona)?.name ?? "谜面";
  const modelSummary = `${feature("faceShape",faceShape).label}脸 · ${feature("eyes",eyes).label} · ${feature("brows",brows).label} · ${feature("nose",nose).label} · ${feature("lips",lips).label} · ${feature("hair",hair).label}`;
  const finalMatchParts = match ? matchParts(match,music.style,music.energy,drink.family,drink.abv,persona,height,heightPreference,stats) : [];
  const finalMatchScore = match ? matchScore(finalMatchParts) : 0;

  const heightLine = useMemo(() => {
    if (height >= 182) return "你在人群上方更容易捕捉到视线，但真正留下印象的是你的节奏。";
    if (height <= 164) return "你自然融进人群，靠近时才会让人发现细节。";
    return "你的视线刚好越过杯沿，灯光把轮廓切成安静的一笔。";
  }, [height]);

  const fillStory = (story: StorySeed) => story.text
    .replaceAll("{bar}", bar.name).replaceAll("{city}", bar.city)
    .replaceAll("{track}", music.title).replaceAll("{drink}", drink.name)
    .replaceAll("{name}", nickname || "夜行者");

  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 6 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatar(String(reader.result)); setModelMode("photo"); };
    reader.readAsDataURL(file);
  };

  const startNight = () => {
    const initialStats = {
      spark: persona === "spark" ? 4 : persona === "mystery" ? 3 : 2,
      energy: clamp(2 + music.energy + (persona === "spark" ? 1 : 0)),
      clarity: clamp(9 - Math.round(drink.abv / 8)),
    };
    const ranked = MATCH_PROFILES
      .map((profile, index) => ({ index, profile, score: matchScore(matchParts(profile,music.style,music.energy,drink.family,drink.abv,persona,height,heightPreference,initialStats)) }))
      .filter(({profile}) => genderFits(profile,playerGender,interest))
      .sort((a,b) => b.score - a.score);
    const shortlist = ranked.slice(0,Math.min(3,ranked.length));
    setBarIndex(randomIndex(BARS.length));
    setFortune(randomIndex(7));
    setStoryIndexes([0, 1, 2, 3].map((phase) => phase * 25 + randomIndex(25)));
    setMatchIndex(shortlist.length ? shortlist[randomIndex(shortlist.length)].index : -1);
    setStats(initialStats);
    setHistory([]);
    setRound(0);
    setStage("game");
  };

  const choices = useMemo<Choice[]>(() => {
    if (round === 0) return [
      { label: "向灯光更亮的地方走", note: "让音乐先替你开场", delta: { spark: 1, energy: 2 }, action: "light" },
      { label: "坐到吧台，先观察三分钟", note: "把安静也当作一种选择", delta: { clarity: 2 }, action: "watch" },
      { label: "问调酒师：今晚有什么故事？", note: "从一个真实问题开始", delta: { spark: 1, clarity: 1 }, action: "bartender" },
    ];
    if (round === 1) return [
      { label: "接住话题，再问一个具体问题", note: "让搭讪变成真正的对话", delta: { spark: 2, energy: 1 }, action: "talk" },
      { label: "把朋友也拉进话题", note: "让气氛更安全、松弛", delta: { spark: 1, clarity: 1 }, action: "group" },
      { label: "礼貌点头，继续听完整首歌", note: "今晚也可以只属于自己", delta: { energy: -1, clarity: 2 }, action: "quiet" },
    ];
    if (round === 2) return [
      { label: "一起去舞池，先确认彼此舒服", note: "靠近，但保留随时说停的自由", delta: { spark: 2, energy: 2 }, action: "dance" },
      { label: "换成气泡水，去安静处聊", note: "清醒也能让暧昧升温", delta: { spark: 2, clarity: 2 }, action: "water" },
      { label: "享受自己的节奏，暂时不社交", note: "让夜晚向内生长", delta: { energy: -1, clarity: 2 }, action: "solo" },
    ];
    return [
      { label: stats.spark >= 6 ? "问：我可以吻你吗？" : "问：要不要交换歌单？", note: "答案可以是愿意，也可以是慢一点", delta: { clarity: 1 }, action: stats.spark >= 6 ? "kiss" : "playlist" },
      { label: "交换联系方式，约在白天见", note: "把可能性留到明天", delta: { spark: 1, clarity: 2 }, action: "contact" },
      { label: "叫车回家，把歌听完", note: "完整地结束自己的夜晚", delta: { clarity: 2 }, action: "home" },
    ];
  }, [round, stats.spark]);

  const finish = (action: string, next: Stats) => {
    if (action === "kiss") {
      const mutual = next.spark + (fortune % 3) >= 8;
      setEnding(mutual ? {
        tag: "MUTUAL SPARK · 明确同意",
        title: "一个被问过、也被回答过的 kiss",
        text: `对方看着你，点了点头。这个吻很短，像 ${music.title} 结束前那一下鼓点。你们没有许诺未来，但都知道这不是误会。`,
      } : {
        tag: "SOFT BOUNDARY · 被尊重的答案",
        title: "“我想慢一点。”你说：当然。",
        text: `边界没有毁掉气氛，反而让这段相遇变得可信。你们交换了歌单，在 ${bar.name} 门口说晚安。`,
      });
    } else if (action === "contact" || action === "playlist") {
      setEnding({
        tag: "TO BE CONTINUED · 轻微心动",
        title: "白天见，或许比凌晨更浪漫",
        text: `你们交换了${action === "playlist" ? "歌单" : "联系方式"}。没有急着定义关系，只约好下次在没有酒精和重低音的地方，把话继续聊完。`,
      });
    } else {
      setEnding({
        tag: next.spark >= 5 ? "A GOOD EXIT · 余韵" : "QUIET LUXURY · 独处结局",
        title: next.spark >= 5 ? "你带着一点心动，准时离场" : "没有艳遇，也是一场完整的夜晚",
        text: next.spark >= 5
          ? `车门关上时，${bar.city} 的灯从窗外退后。有人记住了你的名字，而你保留了清醒和期待。`
          : `你安静喝完一杯，认真听完几首歌，并在想离开时离开。不是每个夜晚都要被别人证明。`,
      });
    }
    setStage("ending");
  };

  const choose = (choice: Choice) => {
    const next = {
      spark: clamp(stats.spark + (choice.delta.spark ?? 0)),
      energy: clamp(stats.energy + (choice.delta.energy ?? 0)),
      clarity: clamp(stats.clarity + (choice.delta.clarity ?? 0)),
    };
    setStats(next);
    setHistory((items) => [...items, { time: ["22:47", "23:26", "00:18", "01:12"][round], text: choice.label }]);
    if (round === 3) finish(choice.action, next);
    else setRound((value) => value + 1);
  };

  const shareEnding = async () => {
    const text = `我的 AFTERDARK 结局：${ending.title}｜${bar.city} ${bar.name}｜${music.title}`;
    if (navigator.share) await navigator.share({ title: "AFTERDARK 夜晚结局", text, url: location.href });
    else await navigator.clipboard.writeText(`${text} ${location.href}`);
  };

  const openLibrary = (tab: LibraryTab) => { setLibraryTab(tab); setShowLibrary(true); };

  return (
    <main className={`app stage-${stage}`}>
      <header className="topbar">
        <button className="logo-button" onClick={() => setStage("landing")} aria-label="返回首页"><StoryLogo /></button>
        <div className="nav-actions">
          <button className="text-button" onClick={() => openLibrary("bars")}>真实数据图鉴</button>
          <span className="live-pill"><i /> LIVE STORY</span>
        </div>
      </header>

      {stage === "landing" && (
        <section className="landing grid-bg">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <p className="eyebrow">CHINA NIGHTLIFE · INTERACTIVE FICTION</p>
          <h1>今晚，<em>会发生什么？</em></h1>
          <p className="lede">抽取 30 家真实热门酒吧中的一站，从 50 种音乐与 50 种酒类中做选择。100 个细节剧情种子，会随你的每一步重新组合。</p>
          <div className="landing-cta">
            <button className="primary" disabled={!adult} onClick={() => setStage("setup")}>开始今晚 <span>↗</span></button>
            <label className="age-check"><input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} /><span>我已满 18 岁，并同意理性饮酒、尊重边界</span></label>
          </div>
          <div className="landing-proof">
            <button onClick={() => openLibrary("bars")}><b>30</b><span>真实目的地</span></button>
            <button onClick={() => openLibrary("music")}><b>50</b><span>音乐风格与曲目</span></button>
            <button onClick={() => openLibrary("drinks")}><b>50</b><span>酒类与无酒精选</span></button>
            <button onClick={() => openLibrary("stories")}><b>100</b><span>细节剧情种子</span></button>
          </div>
          <p className="disclaimer">娱乐性虚构体验，不是现实预测。照片只在你的设备内预览，不上传、不做人脸识别。</p>
        </section>
      )}

      {stage === "setup" && (
        <section className="setup-layout">
          <aside className="setup-intro">
            <p className="eyebrow">BUILD YOUR NIGHT</p><h2>先成为今晚的你</h2>
            <p>没有颜值评分，也不判断真实人格。形象与身高只改变叙事视角，决定权始终在你手里。</p>
            <div className="step-rail"><span className="active">01 建模</span><span>02 音乐</span><span>03 酒</span></div>
          </aside>
          <div className="setup-form">
            <section className="form-section">
              <div className="section-head"><span>01</span><div><h3>精细夜间建模</h3><p>真人照片只作本机头像；逻辑分析来自你亲自填写的特征，不从脸推断颜值或人格。</p></div><i className="privacy-badge">LOCAL ONLY</i></div>
              <div className="model-mode-tabs">
                <button className={modelMode === "manual" ? "selected" : ""} onClick={() => setModelMode("manual")}><b>手动精细建模</b><small>不传照片也能完整分析</small></button>
                <button className={modelMode === "photo" ? "selected" : ""} onClick={() => setModelMode("photo")}><b>上传真人照片</b><small>仅本机预览，不参与识别</small></button>
              </div>
              <div className="model-workbench">
                <div className="model-preview">
                  {modelMode === "photo" && avatar ? <img src={avatar} alt="真人照片本地预览" /> : <div className={`face-blueprint shape-${faceShape} hair-${hair}`}><i className="hair-shape"/><span className={`brow brow-${brows}`}/><span className={`eye eye-${eyes}`}/><span className={`nose nose-${nose}`}/><span className={`mouth lips-${lips}`}/></div>}
                  <div><small>{modelMode === "photo" && avatar ? "LOCAL PHOTO PREVIEW" : "MANUAL FACE BLUEPRINT"}</small><b>{modelSummary}</b></div>
                </div>
                <div className="profile-controls">
                  <div className="field-stack"><label>今晚的名字<input value={nickname} maxLength={12} onChange={(e) => setNickname(e.target.value)} /></label></div>
                  {modelMode === "photo" && <label className="photo-drop"><input type="file" accept="image/*" onChange={uploadAvatar} /><b>{avatar ? "更换真人照片" : "选择真人照片"}</b><span>JPG / PNG / HEIC · 最大 6MB</span></label>}
                  <p className="privacy-copy">照片不会上传、保存或做人脸识别。即使上传照片，下面的脸部细节仍由你手动填写，避免系统从外貌猜测敏感信息。</p>
                </div>
              </div>
              <div className="feature-heading"><div><b>脸部与造型细节</b><span>每一项都会在结局中给出视觉逻辑，但不做“美/丑”评分。</span></div><span>7 DIMENSIONS</span></div>
              <div className="feature-grid">
                <label>脸型<select value={faceShape} onChange={(e) => setFaceShape(e.target.value)}>{FEATURES.faceShape.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("faceShape",faceShape).reason}</small></label>
                <label>眼型<select value={eyes} onChange={(e) => setEyes(e.target.value)}>{FEATURES.eyes.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("eyes",eyes).reason}</small></label>
                <label>眉形<select value={brows} onChange={(e) => setBrows(e.target.value)}>{FEATURES.brows.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("brows",brows).reason}</small></label>
                <label>鼻部<select value={nose} onChange={(e) => setNose(e.target.value)}>{FEATURES.nose.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("nose",nose).reason}</small></label>
                <label>唇形<select value={lips} onChange={(e) => setLips(e.target.value)}>{FEATURES.lips.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("lips",lips).reason}</small></label>
                <label>发型<select value={hair} onChange={(e) => setHair(e.target.value)}>{FEATURES.hair.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("hair",hair).reason}</small></label>
                <label>穿搭<select value={outfit} onChange={(e) => setOutfit(e.target.value)}>{FEATURES.outfit.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><small>{feature("outfit",outfit).reason}</small></label>
              </div>
              <div className="identity-grid">
                <label>你的性别<select value={playerGender} onChange={(e) => setPlayerGender(e.target.value as PlayerGender)}><option value="private">不透露</option><option value="woman">女生</option><option value="man">男生</option><option value="nonbinary">非二元</option></select></label>
                <label>希望互动对象<select value={interest} onChange={(e) => setInterest(e.target.value as Interest)}><option value="opposite">异性</option><option value="women">女生</option><option value="men">男生</option><option value="all">不限</option><option value="none">不要配对</option></select></label>
                <label>对象身高偏好<select value={heightPreference} onChange={(e) => setHeightPreference(e.target.value as HeightPreference)}><option value="none">不设偏好</option><option value="similar">相近（±6cm）</option><option value="taller">比我高</option><option value="shorter">比我矮</option></select></label>
              </div>
              {interest === "opposite" && playerGender === "private" && <p className="preference-note">你选择了“异性”但未透露自己的性别，因此本局会在虚构男生与女生档案中共同筛选；如需精确异性筛选，请填写性别。</p>}
              <div className="height-field"><div><label htmlFor="height">你的身高 · 只影响空间叙事和主动填写的身高匹配</label><output>{height}<small> CM</small></output></div><input id="height" type="range" min="145" max="205" value={height} onChange={(e) => setHeight(Number(e.target.value))} /><div className="range-labels"><span>145</span><span>175</span><span>205</span></div></div>
              <div className="persona-grid">{PERSONAS.map((item) => <button key={item.id} className={persona === item.id ? "selected" : ""} onClick={() => setPersona(item.id)}><i>{item.icon}</i><b>{item.name}</b><span>{item.desc}</span></button>)}</div>
            </section>

            <section className="form-section">
              <div className="section-head"><span>02</span><div><h3>从 50 种音乐里选一首</h3><p>前 30 首来自 Spotify 2026 夏日编辑推荐，另含跨年代热门舞池风格。</p></div><button className="shuffle" onClick={() => setMusicIndex(randomIndex(MUSIC.length))}>↻ 随机</button></div>
              <div className="track-picker"><div className="album-art"><span>{String(musicIndex + 1).padStart(2, "0")}</span><b>{music.style}</b><i /></div><div className="track-info"><small>NOW SELECTED · {music.energy}/5 ENERGY</small><h4>{music.title}</h4><p>{music.artist}</p><div className="equalizer"><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
              <label className="select-label">浏览全部 50 种音乐<select value={musicIndex} onChange={(e) => setMusicIndex(Number(e.target.value))}>{MUSIC.map((item, index) => <option key={`${item.title}-${index}`} value={index}>{String(index + 1).padStart(2,"0")} · {item.style} — {item.title} / {item.artist}</option>)}</select></label>
              {music.id ? <iframe className="spotify" src={`https://open.spotify.com/embed/track/${music.id}?utm_source=generator&theme=0`} title={`${music.title} Spotify 播放器`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /> : <a className="listen-link" href={spotifyUrl(music.title, music.artist, music.id)} target="_blank" rel="noreferrer">在 Spotify 搜索并播放 {music.title} ↗</a>}
              <button className="browse-data" onClick={() => openLibrary("music")}>查看完整音乐分类与来源 →</button>
            </section>

            <section className="form-section">
              <div className="section-head"><span>03</span><div><h3>从 50 种酒类里选一杯</h3><p>从 IBA 经典鸡尾酒，到啤酒、葡萄酒、清酒、白酒与 0% 选项。</p></div><button className="shuffle" onClick={() => setDrinkIndex(randomIndex(DRINKS.length))}>↻ 随机</button></div>
              <label className="select-label">浏览全部 50 种酒类<select value={drinkIndex} onChange={(e) => setDrinkIndex(Number(e.target.value))}>{DRINKS.map((item, index) => <option key={item.name} value={index}>{String(index + 1).padStart(2,"0")} · {item.family} — {item.name} ({item.abv}% ABV)</option>)}</select></label>
              <div className="drink-feature"><i>{drink.mark}</i><div><small>{drink.family} · {drink.abv}% ABV</small><h4>{drink.name}</h4><p>{drink.base}</p></div><span>{drink.abv === 0 ? "保持清醒" : drink.abv >= 30 ? "高酒精，慢饮并补水" : "建议每杯之间补水"}</span></div>
              <div className="drink-shortlist">{DRINKS.slice(0,8).map((item,index) => <button key={item.name} className={index === drinkIndex ? "selected" : ""} onClick={() => setDrinkIndex(index)}><b>{item.name}</b><small>{item.family}</small></button>)}<button className={drinkIndex === 49 ? "selected" : ""} onClick={() => setDrinkIndex(49)}><b>Zero-proof</b><small>无酒精</small></button></div>
              <button className="browse-data" onClick={() => openLibrary("drinks")}>查看完整酒类分类与来源 →</button>
            </section>
            <div className="launch-bar"><div><span>今晚的你</span><b>{nickname || "夜行者"} · {height}cm · {personaName}</b><small>{modelSummary} · {music.title} × {drink.name}</small></div><button className="primary" onClick={startNight}>生成夜晚与配对 <span>↗</span></button></div>
          </div>
        </section>
      )}

      {stage === "game" && (
        <section className="game-layout">
          <aside className="game-sidebar">
            <div className="mini-profile">{modelMode === "photo" && avatar ? <img src={avatar} alt="角色头像" /> : <span>{nickname.slice(0,1)}</span>}<div><small>TONIGHT AS</small><b>{nickname || "夜行者"}</b><p>{height}cm · {personaName}</p></div></div>
            <div className="destination-card"><small>DESTINATION · {String(barIndex + 1).padStart(2,"0")}/30</small><strong>{bar.name}</strong><span>{bar.city} · {bar.style}</span><i>{bar.badge}</i></div>
            {match && round >= 1 && <div className="match-teaser"><small>POSSIBLE MATCH · FICTIONAL</small><div><span>{match.name.slice(0,1)}</span><div><b>{match.name} · {match.age}</b><p>{match.height}cm · {match.role}</p></div><strong>{matchScore(matchParts(match,music.style,music.energy,drink.family,drink.abv,persona,height,heightPreference,stats))}%</strong></div><p>{match.meetScene}</p></div>}
            <div className="stat-card"><div><span>心动</span><b>{stats.spark}/10</b></div><progress value={stats.spark} max="10"/><div><span>能量</span><b>{stats.energy}/10</b></div><progress value={stats.energy} max="10"/><div><span>清醒</span><b>{stats.clarity}/10</b></div><progress value={stats.clarity} max="10"/></div>
            <div className="now-playing"><span>♫</span><div><small>NOW PLAYING · {music.style}</small><b>{music.title}</b><p>{music.artist}</p></div><a href={spotifyUrl(music.title,music.artist,music.id)} target="_blank" rel="noreferrer" aria-label="在 Spotify 打开">↗</a></div>
          </aside>
          <div className="story-stage">
            <div className="story-progress">{[0,1,2,3].map((item) => <i key={item} className={item <= round ? "active" : ""}/>)}<span>CHAPTER {round + 1} / 4 · STORY #{storyIndexes[round] + 1}</span></div>
            <div className="time-stamp">{["22:47", "23:26", "00:18", "01:12"][round]}</div>
            <p className="eyebrow">{seed.tag}</p><h2>{seed.title}</h2>
            <p className="story-copy">{round === 0 ? `${heightLine} ` : ""}{fillStory(seed)}{round === 1 && match ? ` ${match.meetScene}` : ""}</p>
            <div className="choice-list">{choices.map((choice, index) => <button key={choice.action} onClick={() => choose(choice)}><span>{String(index + 1).padStart(2,"0")}</span><div><b>{choice.label}</b><small>{choice.note}</small></div><i>→</i></button>)}</div>
            {history.length > 0 && <details className="night-log"><summary>今晚已发生 · {history.length}</summary>{history.map((item, index) => <p key={index}><time>{item.time}</time>{item.text}</p>)}</details>}
            <p className="fiction-note">从 100 个细节剧情种子中随机组合。这是互动小说，不预测现实中的你；任何亲密互动都需要清楚、持续、可撤回的同意。</p>
          </div>
        </section>
      )}

      {stage === "ending" && (
        <section className="ending-screen grid-bg">
          <div className="ending-main">
            <div className="ending-ticket"><div className="ticket-top"><span>YOUR NIGHT · {bar.city}</span><span>#{String(fortune * 137 + barIndex).padStart(4,"0")}</span></div><div className="ending-mark">{ending.title.includes("kiss") ? "KISS" : ending.tag.includes("QUIET") ? "SOLO" : "NEXT"}</div><p className="eyebrow">{ending.tag}</p><h1>{ending.title}</h1><p>{ending.text}</p><div className="ending-meta"><div><small>WHERE</small><b>{bar.name}</b></div><div><small>TRACK</small><b>{music.title}</b></div><div><small>DRINK</small><b>{drink.name}</b></div></div><div className="ending-actions"><button className="primary" onClick={shareEnding}>分享结局 <span>↗</span></button><button className="secondary" onClick={() => {setStage("setup");setHistory([]);setRound(0);}}>再玩一晚</button></div></div>

            <section className="logic-report">
              <header><p className="eyebrow">WHY THIS NIGHT · 可解释结果</p><h2>这场推演为什么这样发生</h2><p>以下只解释游戏变量如何组合，不把外貌、身高、音乐或酒类当成现实人格诊断。</p></header>
              <div className="reason-grid">
                <article><span>01 · 建模</span><h3>{modelMode === "photo" && avatar ? "真人照片作为视觉锚点" : "七维手动面部建模"}</h3><p>{modelMode === "photo" && avatar ? "照片仅显示在你的设备上，不进入计分，也不做人脸识别。真正参与逻辑的是你自填的七项特征。" : "你没有上传真人照片，因此系统完全使用你主动填写的脸部与造型细节。"}</p><ul><li><b>{feature("faceShape",faceShape).label}脸：</b>{feature("faceShape",faceShape).reason}</li><li><b>{feature("eyes",eyes).label}＋{feature("brows",brows).label}：</b>{feature("eyes",eyes).reason}；{feature("brows",brows).reason}</li><li><b>{feature("nose",nose).label}＋{feature("lips",lips).label}：</b>{feature("nose",nose).reason}；{feature("lips",lips).reason}</li><li><b>{feature("hair",hair).label}＋{feature("outfit",outfit).label}：</b>{feature("hair",hair).reason}；{feature("outfit",outfit).reason}</li></ul></article>
                <article><span>02 · 身高</span><h3>{height}cm 的空间作用</h3><p>{heightLine}</p><ul><li>身高只用于模拟视线高度、在人群中的可见范围和移动路径。</li><li>{heightPreference === "none" ? "你没有设置对象身高偏好，所以身高不用于筛除任何候选。" : `你主动设置了“${heightPreference === "similar" ? "相近" : heightPreference === "taller" ? "比我高" : "比我矮"}”，匹配中最多只占 6 分。`}</li><li>系统没有采用“男性必须更高”等性别刻板规则。</li></ul></article>
                <article><span>03 · 音乐</span><h3>{music.style} · 能量 {music.energy}/5</h3><p>你选择 {music.title}，因此起始能量为 {clamp(2 + music.energy + (persona === "spark" ? 1 : 0))}/10。高能量曲目增加舞池型分支，低能量曲目增加坐席和深聊型分支。</p><ul><li>音乐相似度只作为共同话题与节奏同步线索。</li><li>共同音乐偏好可能帮助陌生人识别共享兴趣，但不能据此推断完整人格。</li><li>你的“{personaName}”模式让同一首歌产生不同社交节奏。</li></ul></article>
                <article><span>04 · 酒</span><h3>{drink.name} · {drink.family}</h3><p>{drink.base}，常见估算约 {drink.abv}% ABV。游戏把它转换为初始清醒度 {clamp(9-Math.round(drink.abv/8))}/10。</p><ul><li>酒精不会增加魅力或配对分，只可能降低“清醒”指标。</li><li>{drink.abv === 0 ? "你选择 0%，保留了最高的初始判断空间。" : drink.abv >= 30 ? "这是高酒精选择，因此结果更强调慢饮、补水和安全离场。" : "这是中低度选择，系统仍建议每杯之间补水。"}</li><li>亲密同意要求清楚、持续、可撤回；饮酒状态不会替代同意。</li></ul></article>
              </div>

              {match && <section className="match-report">
                <div className="match-profile-head"><div className="match-avatar">{match.name.slice(0,1)}</div><div><span>FICTIONAL ADULT PROFILE · 虚构成年角色</span><h2>{match.name}，{match.age} 岁</h2><p>{match.city} · {match.height}cm · {match.role}</p></div><strong>{finalMatchScore}%<small>游戏兼容度</small></strong></div>
                <div className="match-facts"><div><small>建模</small><b>{match.face}</b><p>{match.hair}；{match.outfit}</p></div><div><small>音乐</small><b>{match.favoriteTrack}</b><p>{match.musicStyles.join(" · ")} · 能量 {match.musicEnergy}/5</p></div><div><small>酒</small><b>{match.favoriteDrink}</b><p>{match.drinkFamilies.join(" · ")} · 约 {match.drinkAbv}% ABV</p></div><div><small>交流方式</small><b>{match.conversation}</b><p>边界：{match.boundary}</p></div></div>
                <div className="match-scene"><small>你们如何遇见</small><p>{match.meetScene}</p></div>
                <div className="score-method"><h3>为什么是 {finalMatchScore}%</h3><p>系统先按你填写的互动对象与身高偏好，从 14 个虚构成年档案中筛出前三名，再随机选一位，所以展示分数以 52 为候选池基础值并保证超过 50。它是可解释的游戏指数，不是现实搭讪成功率或关系预测。</p><div>{finalMatchParts.map(part=><article key={part.label}><span>{part.label}</span><b>+{part.points}</b><p>{part.reason}</p></article>)}</div></div>
              </section>}

              <div className="evidence-box"><h3>推演依据与边界</h3><p>伴侣相似性研究支持把“共享兴趣”作为轻量线索，但也强调共享环境与混杂因素；音乐研究支持把共同音乐偏好当作社交话题和亲近线索。酒精资料则支持把判断力下降单独建模。因此本游戏不从脸预测性格，也不把兼容度冒充统计概率。</p><div><a href="https://www.nature.com/articles/s41562-023-01672-z" target="_blank" rel="noreferrer">Nature Human Behaviour · 伴侣特征相似性 ↗</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10899422/" target="_blank" rel="noreferrer">音乐与亲密关系综述 ↗</a><a href="https://iba-world.com/cocktails/" target="_blank" rel="noreferrer">IBA 官方酒类资料 ↗</a><a href="https://www.niaaa.nih.gov/alcohols-effects-health/alcohol-topics/health-topics-alcohol-and-brain" target="_blank" rel="noreferrer">NIAAA · 酒精与判断 ↗</a><a href="https://rainn.org/strategies-to-reduce-risk-increase-safety/alcohol-safety/" target="_blank" rel="noreferrer">RAINN · 酒精与同意 ↗</a></div></div>
            </section>
          </div>
          <aside className="ending-stats"><small>NIGHT PROFILE</small><h3>{nickname} 的夜间曲线</h3><div><span>心动</span><b>{stats.spark}</b></div><div><span>能量</span><b>{stats.energy}</b></div><div><span>清醒</span><b>{stats.clarity}</b></div>{match && <div className="match-score-mini"><span>兼容度</span><b>{finalMatchScore}%</b></div>}<p>{modelMode === "photo" && avatar ? "你的照片只在本机内存中预览，从未上传。" : "你没有使用真人照片；结果来自手动特征。"} 关闭页面后，故事不会被服务器保存。</p></aside>
        </section>
      )}

      <footer className="global-footer"><span>18+ · 理性饮酒 · 尊重同意 · 娱乐性虚构</span><div><a href="https://www.theworlds50best.com/bars/best-in-asia/list/1-50" target="_blank" rel="noreferrer">酒吧来源</a><a href="https://newsroom.spotify.com/2026-05-29/songs-of-summer-predictions/" target="_blank" rel="noreferrer">音乐来源</a><a href="https://iba-world.com/cocktails/" target="_blank" rel="noreferrer">酒款来源</a></div></footer>

      {showLibrary && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowLibrary(false)}><section className="data-modal" role="dialog" aria-modal="true" aria-labelledby="library-title" onMouseDown={(e) => e.stopPropagation()}><header><div><p className="eyebrow">RESEARCHED GAME LIBRARY</p><h2 id="library-title">真实数据图鉴</h2></div><button onClick={() => setShowLibrary(false)} aria-label="关闭">×</button></header><nav className="library-tabs">{(["bars","music","drinks","stories"] as LibraryTab[]).map((tab) => <button key={tab} className={libraryTab === tab ? "active" : ""} onClick={() => setLibraryTab(tab)}>{tab === "bars" ? "酒吧 30" : tab === "music" ? "音乐 50" : tab === "drinks" ? "酒类 50" : "剧情 100"}</button>)}</nav>
        {libraryTab === "bars" && <><p className="modal-note">中国没有覆盖所有酒吧与夜店的统一“全国 Top 30”官方榜单。本池以 2026 Asia’s 50 Best Bars 的中国上榜酒吧为锚点，补充城市知名场所；不宣称是官方全国排名。营业状态与入场规则请出行前核实。</p><div className="data-list bars-list">{BARS.map((item,index) => <article key={`${item.city}-${item.name}`}><span>{String(index+1).padStart(2,"0")}</span><div><b>{item.name}</b><small>{item.city} · {item.style}</small></div><i>{item.badge}</i></article>)}</div><a className="source-link" href="https://mmx.prnewswire.com/media/MS1890898/A50BB2026-Results-The-List.pdf" target="_blank" rel="noreferrer">查看 2026 Asia’s 50 Best Bars 原始榜单 ↗</a></>}
        {libraryTab === "music" && <><p className="modal-note">前 30 首来自 Spotify 全球编辑的 2026 Songs of Summer 推荐及当季代表曲；后 20 首补齐 K-Pop、华语、EDM、City Pop 等常见夜生活风格。点击即可前往 Spotify。</p><div className="data-list music-list">{MUSIC.map((item,index) => <a key={`${item.title}-${index}`} href={spotifyUrl(item.title,item.artist,item.id)} target="_blank" rel="noreferrer"><span>{String(index+1).padStart(2,"0")}</span><div><b>{item.title}</b><small>{item.artist}</small></div><i>{item.style} · E{item.energy}</i></a>)}</div><a className="source-link" href="https://newsroom.spotify.com/2026-05-29/songs-of-summer-predictions/" target="_blank" rel="noreferrer">查看 Spotify 2026 夏日官方推荐 ↗</a></>}
        {libraryTab === "drinks" && <><p className="modal-note">覆盖 IBA 忘不了、当代经典与新时代鸡尾酒，并加入啤酒、葡萄酒、清酒、白酒、纯饮烈酒和无酒精选。ABV 为常见估算值，实际配方以酒吧为准。</p><div className="data-list drinks-list">{DRINKS.map((item,index) => <article key={item.name}><span>{String(index+1).padStart(2,"0")}</span><div><b>{item.name}</b><small>{item.base}</small></div><i>{item.family} · {item.abv}%</i></article>)}</div><a className="source-link" href="https://iba-world.com/cocktails/" target="_blank" rel="noreferrer">查看 IBA 官方鸡尾酒资料 ↗</a></>}
        {libraryTab === "stories" && <><p className="modal-note">100 个独立剧情种子按入场、相遇、升温与结局四阶段各 25 个编写，覆盖搭讪、独处、朋友、安全、边界、舞池、调酒师、交通与亲密同意等情境。</p><div className="data-list story-list">{STORY_SEEDS.map((item,index) => <article key={`${item.phase}-${item.title}-${index}`}><span>{String(index+1).padStart(3,"0")}</span><div><b>{item.title}</b><small>{item.text}</small></div><i>CH.{item.phase+1} · {item.tag}</i></article>)}</div></>}
      </section></div>}
    </main>
  );
}
