"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { BARS, DRINKS, MUSIC, STORY_SEEDS, type StorySeed } from "./data";

type Stage = "landing" | "setup" | "game" | "ending";
type Persona = "spark" | "mystery" | "chill";
type Stats = { spark: number; energy: number; clarity: number };
type Choice = { label: string; note: string; delta: Partial<Stats>; action: string };
type LibraryTab = "bars" | "music" | "drinks" | "stories";

const PERSONAS: { id: Persona; icon: string; name: string; desc: string }[] = [
  { id: "spark", icon: "✦", name: "聚光体", desc: "主动、明亮，容易被看见" },
  { id: "mystery", icon: "◐", name: "谜面", desc: "克制、好奇，擅长留白" },
  { id: "chill", icon: "≈", name: "松弛派", desc: "随性、自在，不追赶剧情" },
];

const clamp = (n: number) => Math.max(0, Math.min(10, n));
const randomIndex = (length: number) => Math.floor(Math.random() * length);
const spotifyUrl = (title: string, artist: string, id?: string) => id
  ? `https://open.spotify.com/track/${id}`
  : `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;

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
  const [musicIndex, setMusicIndex] = useState(0);
  const [drinkIndex, setDrinkIndex] = useState(49);
  const [barIndex, setBarIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [fortune, setFortune] = useState(0);
  const [storyIndexes, setStoryIndexes] = useState([0, 25, 50, 75]);
  const [stats, setStats] = useState<Stats>({ spark: 2, energy: 2, clarity: 8 });
  const [history, setHistory] = useState<{ time: string; text: string }[]>([]);
  const [ending, setEnding] = useState({ tag: "", title: "", text: "" });

  const music = MUSIC[musicIndex];
  const drink = DRINKS[drinkIndex];
  const bar = BARS[barIndex];
  const seed = STORY_SEEDS[storyIndexes[round]] ?? STORY_SEEDS[round * 25];
  const personaName = PERSONAS.find((p) => p.id === persona)?.name ?? "谜面";

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
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const startNight = () => {
    setBarIndex(randomIndex(BARS.length));
    setFortune(randomIndex(7));
    setStoryIndexes([0, 1, 2, 3].map((phase) => phase * 25 + randomIndex(25)));
    setStats({
      spark: persona === "spark" ? 4 : persona === "mystery" ? 3 : 2,
      energy: clamp(2 + music.energy + (persona === "spark" ? 1 : 0)),
      clarity: clamp(9 - Math.round(drink.abv / 8)),
    });
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
              <div className="section-head"><span>01</span><div><h3>你的夜间建模</h3><p>上传照片或用字母头像。图片不会离开此设备。</p></div></div>
              <div className="profile-row">
                <label className="avatar-upload">{avatar ? <img src={avatar} alt="你的角色照片预览" /> : <span>{nickname.slice(0, 1).toUpperCase()}</span>}<i>＋</i><input type="file" accept="image/*" onChange={uploadAvatar} /></label>
                <div className="field-stack"><label>今晚的名字<input value={nickname} maxLength={12} onChange={(e) => setNickname(e.target.value)} /></label><small>支持 JPG / PNG / HEIC，最大 6MB</small></div>
              </div>
              <div className="height-field"><div><label htmlFor="height">身高</label><output>{height}<small> CM</small></output></div><input id="height" type="range" min="145" max="205" value={height} onChange={(e) => setHeight(Number(e.target.value))} /><div className="range-labels"><span>145</span><span>175</span><span>205</span></div></div>
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
            <div className="launch-bar"><div><span>今晚的你</span><b>{nickname || "夜行者"} · {height}cm · {personaName}</b><small>{music.title} × {drink.name}</small></div><button className="primary" onClick={startNight}>随机抽取目的地 <span>↗</span></button></div>
          </div>
        </section>
      )}

      {stage === "game" && (
        <section className="game-layout">
          <aside className="game-sidebar">
            <div className="mini-profile">{avatar ? <img src={avatar} alt="角色头像" /> : <span>{nickname.slice(0,1)}</span>}<div><small>TONIGHT AS</small><b>{nickname || "夜行者"}</b><p>{height}cm · {personaName}</p></div></div>
            <div className="destination-card"><small>DESTINATION · {String(barIndex + 1).padStart(2,"0")}/30</small><strong>{bar.name}</strong><span>{bar.city} · {bar.style}</span><i>{bar.badge}</i></div>
            <div className="stat-card"><div><span>心动</span><b>{stats.spark}/10</b></div><progress value={stats.spark} max="10"/><div><span>能量</span><b>{stats.energy}/10</b></div><progress value={stats.energy} max="10"/><div><span>清醒</span><b>{stats.clarity}/10</b></div><progress value={stats.clarity} max="10"/></div>
            <div className="now-playing"><span>♫</span><div><small>NOW PLAYING · {music.style}</small><b>{music.title}</b><p>{music.artist}</p></div><a href={spotifyUrl(music.title,music.artist,music.id)} target="_blank" rel="noreferrer" aria-label="在 Spotify 打开">↗</a></div>
          </aside>
          <div className="story-stage">
            <div className="story-progress">{[0,1,2,3].map((item) => <i key={item} className={item <= round ? "active" : ""}/>)}<span>CHAPTER {round + 1} / 4 · STORY #{storyIndexes[round] + 1}</span></div>
            <div className="time-stamp">{["22:47", "23:26", "00:18", "01:12"][round]}</div>
            <p className="eyebrow">{seed.tag}</p><h2>{seed.title}</h2>
            <p className="story-copy">{round === 0 ? `${heightLine} ` : ""}{fillStory(seed)}</p>
            <div className="choice-list">{choices.map((choice, index) => <button key={choice.action} onClick={() => choose(choice)}><span>{String(index + 1).padStart(2,"0")}</span><div><b>{choice.label}</b><small>{choice.note}</small></div><i>→</i></button>)}</div>
            {history.length > 0 && <details className="night-log"><summary>今晚已发生 · {history.length}</summary>{history.map((item, index) => <p key={index}><time>{item.time}</time>{item.text}</p>)}</details>}
            <p className="fiction-note">从 100 个细节剧情种子中随机组合。这是互动小说，不预测现实中的你；任何亲密互动都需要清楚、持续、可撤回的同意。</p>
          </div>
        </section>
      )}

      {stage === "ending" && (
        <section className="ending-screen grid-bg">
          <div className="ending-ticket"><div className="ticket-top"><span>YOUR NIGHT · {bar.city}</span><span>#{String(fortune * 137 + barIndex).padStart(4,"0")}</span></div><div className="ending-mark">{ending.title.includes("kiss") ? "KISS" : ending.tag.includes("QUIET") ? "SOLO" : "NEXT"}</div><p className="eyebrow">{ending.tag}</p><h1>{ending.title}</h1><p>{ending.text}</p><div className="ending-meta"><div><small>WHERE</small><b>{bar.name}</b></div><div><small>TRACK</small><b>{music.title}</b></div><div><small>DRINK</small><b>{drink.name}</b></div></div><div className="ending-actions"><button className="primary" onClick={shareEnding}>分享结局 <span>↗</span></button><button className="secondary" onClick={() => {setStage("setup");setHistory([]);setRound(0);}}>再玩一晚</button></div></div>
          <aside className="ending-stats"><small>NIGHT PROFILE</small><h3>{nickname} 的夜间曲线</h3><div><span>心动</span><b>{stats.spark}</b></div><div><span>能量</span><b>{stats.energy}</b></div><div><span>清醒</span><b>{stats.clarity}</b></div><p>你的照片从未上传。关闭页面后，故事不会被服务器保存。</p></aside>
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
