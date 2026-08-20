export type GameStats = { spark: number; energy: number; clarity: number };
export type GamePersona = "spark" | "mystery" | "chill";
export type GameChoice = { label: string; note: string; delta: Partial<GameStats>; action: string };
export type InteractionQuestion = {
  id: string; phase: 0 | 1 | 2 | 3; theme: string; title: string; text: string;
  choices: GameChoice[]; affinity: GamePersona[]; follow?: string[]; minSpark?: number; maxSpark?: number;
};
export type EndingTemplate = {
  id: string; actions: string[]; tag: string; title: string; text: string; reason: string;
  minSpark?: number; maxSpark?: number; minClarity?: number; maxClarity?: number; match?: boolean;
};

const ACTIONS: Record<string, { note: string; delta: Partial<GameStats> }> = {
  curious:{note:"用具体问题表达兴趣，不越过私人边界",delta:{spark:1,clarity:1}},
  playful:{note:"用轻松幽默降低陌生感",delta:{spark:2,energy:1}},
  direct:{note:"清楚表达好感，也给对方拒绝空间",delta:{spark:2,clarity:1}},
  observe:{note:"先读懂现场和对方反馈",delta:{clarity:2,energy:-1}},
  group:{note:"把互动放进朋友可见的安全场景",delta:{spark:1,clarity:2}},
  dance:{note:"共同活动会升高能量，但靠近仍需确认",delta:{spark:2,energy:2}},
  water:{note:"换水或无酒精，让判断力回到前台",delta:{clarity:3,energy:-1}},
  boundary:{note:"明确边界会保护双方，也提高真实感",delta:{clarity:3,spark:-1}},
  decline:{note:"礼貌拒绝，不为制造剧情牺牲舒适",delta:{clarity:3,energy:-1}},
  assist:{note:"共同处理小状况，比表演魅力更可信",delta:{spark:1,clarity:2}},
  compliment:{note:"赞美具体选择，而不是评价身体",delta:{spark:2,clarity:1}},
  share_music:{note:"共享音乐偏好是低压力的自我披露",delta:{spark:2,energy:1}},
  share_drink:{note:"从风味谈偏好，不把酒量当成能力",delta:{spark:1,clarity:1}},
  quiet:{note:"允许沉默存在，保留自己的夜晚",delta:{clarity:2,energy:-1}},
  move_space:{note:"换到更安静或更明亮的位置再交流",delta:{spark:1,clarity:2}},
  ask_contact:{note:"把决定留到白天，而不是被凌晨催促",delta:{spark:2,clarity:2}},
  ask_kiss:{note:"先用完整问题确认亲密意愿",delta:{spark:2,clarity:2}},
  playlist:{note:"交换歌单，让联系保持轻量和可撤回",delta:{spark:1,clarity:2}},
  home:{note:"按自己的时间安全离开",delta:{clarity:3,energy:-2}},
  friend_check:{note:"确认朋友、交通与彼此状态",delta:{clarity:3}},
  open_up:{note:"分享真实但不过度暴露的信息",delta:{spark:2,clarity:1}},
  tease:{note:"带一点暧昧，但观察对方是否接得住",delta:{spark:2,energy:1}},
  photo_consent:{note:"镜头举起前先问，答案可以随时改变",delta:{clarity:3,spark:1}},
  change_topic:{note:"把不舒服的话题转回共同兴趣",delta:{clarity:2}},
  slow_down:{note:"降低速度比强行维持热度更成熟",delta:{clarity:3,energy:-1}},
  clarity:{note:"区分事实、感觉和假设，再决定是否推进",delta:{clarity:2,spark:1}},
};

const c = (label: string, action: string): GameChoice => ({ label, action, ...ACTIONS[action] });
const q = (
  id: string, phase: 0 | 1 | 2 | 3, theme: string, title: string, text: string,
  options: [string,string][], affinity: GamePersona[], extra: Partial<InteractionQuestion> = {},
): InteractionQuestion => ({ id, phase, theme, title, text, choices: options.map(([label,action])=>c(label,action)), affinity, ...extra });

export const INTERACTION_QUESTIONS: InteractionQuestion[] = [
  q("Q01",0,"第一印象","吧台边的同款选择",`{match}注意到你们点了同一类酒，问：“你也喜欢这种风味？”第一次回应会决定这段交流是礼貌、好奇还是暧昧。`,[["先问对方喜欢它的哪种味道","share_drink"],["笑说：看来今晚审美撞车了","playful"],["举杯示意，继续按自己的速度喝","observe"]],["mystery","chill"]),
  q("Q02",0,"眼神","第二次对视不是巧合",`在 {bar} 的灯光切换间，你和{match}第二次对视。对方没有靠近，只把选择权留在这几秒里。`,[["保持一秒微笑，再自然移开","tease"],["走近问：这边有人吗？","direct"],["先观察对方是否继续释放信号","observe"]],["spark","mystery"]),
  q("Q03",0,"音乐","副歌里的共同暗号",`{track}进入副歌时，你和{match}同时跟唱了同一句。声音很大，但共同反应已经替你们开了一个话题。`,[["问对方更喜欢现场版还是录音室版","share_music"],["做一个夸张口型逗对方笑","playful"],["把这份默契留在当下，不主动推进","quiet"]],["spark","chill"]),
  q("Q04",0,"座位","唯一的空位在对方旁边",`吧台只剩{match}旁边一个位置。对方收起外套让出空间，但这只是礼貌，不等于邀请你进入私人世界。`,[["坐下后先道谢，不急着提问","observe"],["问杯垫上的图案有什么故事","curious"],["把朋友叫来坐附近再加入交流","group"]],["mystery","chill"]),
  q("Q05",0,"赞美","怎样夸人不显得冒犯",`你注意到{match}的穿搭细节很用心。身体评价容易制造压力，而具体选择更适合作为陌生人之间的第一句话。`,[["夸耳饰和衣服配色很有想法","compliment"],["直接说：你是今晚最好看的人","direct"],["不评价外貌，先聊正在播放的歌","share_music"]],["spark","mystery"]),
  q("Q06",0,"朋友局","对方不是一个人来的",`{match}和三位朋友站在一起。单独切入容易像打断，加入整个小群体反而可能更自然。`,[["先和整桌打招呼，再回应对方","group"],["只看着对方，示意去旁边单聊","direct"],["等他们话题结束再决定是否靠近","observe"]],["spark","chill"]),
  q("Q07",0,"调酒师","一句推荐打开两个人的话题",`调酒师问你对 {drink} 的第一印象，{match}也刚好转头听答案。你的回答可以是知识展示，也可以是真实感受。`,[["诚实说一个喜欢和一个不习惯的味道","share_drink"],["把问题转给对方：你会怎么形容？","curious"],["开玩笑说自己的味觉还在加载","playful"]],["mystery","chill"]),
  q("Q08",0,"舞池","伸出的手停在半空",`音乐变快，{match}向舞池方向偏头示意，手停在没有碰到你的距离。你需要决定是否接受这次邀请。`,[["点头加入，并保持舒服的身体距离","dance"],["说想听完这首，再看状态","slow_down"],["笑着拒绝，留在朋友身边","decline"]],["spark","chill"]),
  q("Q09",0,"陌生帮助","一杯水被及时递过来",`你被人群挤到吧台边，{match}顺手把一杯水推到安全位置。这个小动作可以成为开场，也可以只停留在感谢。`,[["认真道谢，再问对方是否也需要水","assist"],["借机问：你经常来这里吗？","curious"],["道谢后回到自己的节奏","quiet"]],["chill","mystery"]),
  q("Q10",0,"幽默","端错酒后的十秒钟",`服务员把别桌的酒放到你面前，{match}正是那杯酒的主人。两个人同时发现错误，尴尬只会持续十秒。`,[["笑说：我们的故事差点从拿错酒开始","playful"],["先确认酒没有被碰过，再递回去","assist"],["请服务员处理，不主动延伸交流","observe"]],["spark","chill"]),
  q("Q11",0,"安静区","没有低音掩护的第一句话",`你在安静区遇到独自看酒单的{match}。这里不需要喊话，也更容易听见一句话是否真诚。`,[["问对方是否愿意推荐一杯低度酒","curious"],["分享自己为什么选了 {drink}","share_drink"],["保持安静，不假设独处的人想聊天","quiet"]],["mystery","chill"]),
  q("Q12",0,"边界","搭讪来得太快",`另一位陌生人连续追问你的住址和联系方式，{match}注意到你不舒服。现在最重要的不是维持气氛。`,[["明确说不回答，并走向工作人员","boundary"],["请朋友加入，结束这段对话","friend_check"],["用玩笑绕开问题但继续留下","change_topic"]],["mystery","chill"]),
  q("Q13",0,"自我介绍","不靠职业标签的认识方式",`{match}问你：“除了工作，你最近最投入的一件事是什么？”这比交换职位更接近真正的自我介绍。`,[["分享一个最近认真练习的小爱好","open_up"],["反问对方最近为什么会开心","curious"],["给一个轻松答案，暂时不深聊","playful"]],["spark","mystery","chill"]),

  q("Q14",1,"音乐偏好","歌单相似但最爱不同",`你们都喜欢电子音乐，但{match}偏爱低速氛围，你更喜欢能量清楚的 {track}。差异可能是冲突，也可能是交换入口。`,[["各选一首最能代表自己的歌","share_music"],["说服对方下一首一定听你的","tease"],["承认不同口味也可以一起玩","curious"]],["mystery","chill"],{follow:["share_music","curious"]}),
  q("Q15",1,"饮酒节奏","对方准备点第二杯",`{match}问你要不要再来一杯，而你的清醒度已经需要被认真考虑。拒绝加酒并不等于拒绝这个人。`,[["换气泡水，继续聊天","water"],["说自己今晚只喝这一杯","boundary"],["跟着点同样的酒保持同步","share_drink"]],["chill","mystery"]),
  q("Q16",1,"自我披露","最近一次改变计划",`{match}问：“最近有什么事让你临时改变了原本的计划？”问题不算私密，却能看见一个人如何面对变化。`,[["说一件真实但不涉及隐私的经历","open_up"],["先问对方为什么想知道","curious"],["用一个夸张小故事带过","playful"]],["mystery","chill"]),
  q("Q17",1,"身体距离","说话必须靠得很近吗",`音乐太响，{match}靠近一点才能听见。距离变小不自动意味着暧昧，你仍然可以选择更舒服的交流方式。`,[["提议换到安静区继续聊","move_space"],["靠近前先确认彼此都舒服","boundary"],["暂时结束话题，等下一首歌","slow_down"]],["mystery","chill"]),
  q("Q18",1,"手机","消息亮起但对方没追问",`你的手机屏幕亮起一条私人消息，{match}主动移开视线。尊重隐私本身，也是一种可被观察的品质。`,[["处理完消息后感谢对方的体贴","compliment"],["主动解释消息是谁发的","open_up"],["把手机扣下，继续原来的话题","clarity"]],["mystery","chill"]),
  q("Q19",1,"舞步","两个人的节奏不一样",`你们走进舞池后发现节奏习惯完全不同。比起表演技巧，是否能彼此调整更能决定这段互动舒不舒服。`,[["跟着对方学一个简单动作","dance"],["笑着承认不会，改成自由摇摆","playful"],["回到吧台，用聊天代替跳舞","move_space"]],["spark","chill"]),
  q("Q20",1,"过去关系","前任话题突然出现",`聊天自然绕到过去的关系。{match}没有逼你交代细节，只问你现在更看重怎样的相处方式。`,[["分享一条自己学会的边界","open_up"],["说今晚不想聊前任，换个话题","boundary"],["反问对方现在重视什么","curious"]],["mystery","chill"]),
  q("Q21",1,"社交媒体","要不要立刻互关",`{match}拿出手机问是否互相关注。账号会暴露更多日常信息，交换它不是每次搭讪的必选动作。`,[["先交换歌单，不急着开放社交账号","playlist"],["互关，但不翻看旧内容","ask_contact"],["说想再聊一会儿再决定","slow_down"]],["mystery","chill"]),
  q("Q22",1,"共同朋友","关系网突然重叠",`你们发现认识同一个朋友。熟人关系增加安全感，却不代表任何一方已经被“背书”。`,[["聊共同朋友带来的具体趣事","group"],["把注意力拉回彼此的直接感受","curious"],["先向朋友确认基本情况","friend_check"]],["spark","mystery"]),
  q("Q23",1,"旅行","如果明天突然空一天",`{match}问你：“如果明天完全不用工作，你会留在这座城还是立刻出发？”答案会透露节奏偏好，却没有标准答案。`,[["描述一条具体的城市散步路线","open_up"],["选一个目的地并问对方为什么","curious"],["说先睡到自然醒，再决定","playful"]],["chill","mystery"]),
  q("Q24",1,"照片","镜头对准舞池",`朋友准备拍短视频，{match}可能出现在画面里。夜店的热闹不应自动取消每个人对影像的决定权。`,[["拍摄前逐个确认是否愿意入镜","photo_consent"],["只拍灯光和杯子，不拍人脸","assist"],["先拍下来，之后再问能不能发","boundary"]],["chill","mystery"]),
  q("Q25",1,"价值观","迟到是一件小事吗",`你们聊到朋友约会迟到。看似普通的话题，实际会带出时间观、解释方式和对他人精力的尊重。`,[["说清自己能接受的迟到范围","open_up"],["先问迟到背后是否有原因","curious"],["用自己的离谱迟到经历缓和气氛","playful"]],["mystery","chill"]),
  q("Q26",1,"暧昧判断","对方的热情属于所有人",`你发现{match}对服务员、朋友和陌生人都很热情。你需要区分人格友好与只针对你的特殊信号。`,[["继续观察是否有持续而专属的回应","observe"],["直接表达好感，不猜暗号","direct"],["享受交流，不急着定义暧昧","slow_down"]],["spark","mystery"]),

  q("Q27",2,"深聊","什么会让你感觉被理解",`话题逐渐深入，{match}问：“别人做什么时，你会真的觉得被理解？”这是自我披露，也需要双方对等分享。`,[["给一个具体例子，也请对方回答","open_up"],["先说自己还没想好，需要一点时间","slow_down"],["把问题改成更轻松的版本","change_topic"]],["mystery","chill"],{minSpark:4}),
  q("Q28",2,"互相照顾","朋友看起来喝多了",`你注意到同行朋友状态不稳，{match}也看见了。真正重要的共同任务，是让朋友安全而不是继续制造浪漫。`,[["一起拿水并联系朋友的同伴","assist"],["暂停互动，亲自陪朋友离开","friend_check"],["认为工作人员会处理，继续约会","observe"]],["chill","spark"]),
  q("Q29",2,"嫉妒","另一位陌生人加入聊天",`有人明显对{match}感兴趣并加入话题。你们尚未建立关系，竞争感不等于拥有权。`,[["保持自然，让对方自己决定交流对象","clarity"],["用更强烈的暧昧抢回注意力","tease"],["暂时离开，照顾自己的情绪","slow_down"]],["mystery","chill"]),
  q("Q30",2,"边界测试","玩笑碰到不舒服的地方",`{match}开了一个让你稍微不舒服的玩笑，随后注意到你的表情。修复能力比“从不犯错”更容易被真实观察。`,[["直接说这类玩笑自己不喜欢","boundary"],["解释为什么不舒服，看对方如何回应","open_up"],["笑着带过，避免破坏气氛","change_topic"]],["mystery","chill"]),
  q("Q31",2,"未来节奏","你更想要短暂还是继续",`互动已经有明显好感，但两个人对今晚之后的期待还没有说清。模糊可以浪漫，也可能制造误解。`,[["坦白自己更想慢慢了解","direct"],["只谈今晚，不提前承诺","boundary"],["先交换联系方式，明天再聊","ask_contact"]],["spark","mystery"],{minSpark:5}),
  q("Q32",2,"钱与礼貌","谁来付这一轮",`账单来到桌边。请客可以是善意，也可能让人感到欠下人情，最好的答案取决于双方是否舒服。`,[["提出各付各的，不附加解释","boundary"],["请这一轮，并明确没有交换条件","direct"],["你请酒，对方请夜宵","playful"]],["chill","spark"]),
  q("Q33",2,"安静共处","十秒钟没人说话",`音乐间隙里你们同时沉默。舒服的关系不一定需要不停输出，沉默也能检验双方是否焦虑。`,[["不急着填空，和对方一起看舞池","quiet"],["说出此刻让自己放松的细节","open_up"],["用一个新问题重新启动话题","curious"]],["mystery","chill"]),
  q("Q34",2,"诚实","对方问你是不是常来",`你其实并不熟悉这家店。把自己说成夜场专家可能更酷，但诚实也可能让对方放下表演。`,[["承认第一次来，请对方推荐空间","open_up"],["含糊说来过几次，不继续展开","observe"],["反问对方最喜欢这里什么","curious"]],["mystery","chill"]),
  q("Q35",2,"身体接触","舞池里一只手靠近肩膀",`{match}的手在靠近前停住，等你的回应。真正的同意不是没有拒绝，而是有可以被看见的愿意。`,[["点头并主动示意舒服的位置","dance"],["说现在不想被碰，但愿意继续跳","boundary"],["离开舞池，换到更安静的位置","move_space"]],["spark","mystery"],{minSpark:4}),
  q("Q36",2,"个人空间","对方想看你的照片",`{match}问能不能看你手机里的旅行照片。愿意分享一张，不等于允许继续滑动整个相册。`,[["选一张主动展示，并自己拿着手机","photo_consent"],["递给对方看，但先说不要左右滑","boundary"],["说更愿意用语言讲这段旅行","open_up"]],["mystery","chill"]),
  q("Q37",2,"外部压力","朋友开始起哄",`身边朋友喊着“亲一个”，把你们推向并未共同决定的进度。群体热闹不能替代两个人的意愿。`,[["明确说别起哄，让节奏回到两个人","boundary"],["带{match}去安静处确认真实感受","move_space"],["顺着气氛完成这个挑战","tease"]],["spark","mystery"]),
  q("Q38",2,"信任","回程路线是否要一起",`你们发现回程方向相近。一起走可能更安全，也可能让人误以为已经同意更进一步。`,[["先确认目的地与各自期待，再决定","friend_check"],["各自叫车，到家后互报平安","home"],["一起走到地铁口，不默认之后安排","boundary"]],["chill","mystery"]),

  q("Q39",3,"明确同意","距离只剩半步",`你们的好感已经很明显，{track}进入最后一段。任何吻都不应该由音乐替你发问。`,[["看着对方问：我可以吻你吗？","ask_kiss"],["先交换联系方式，把靠近留到下次","ask_contact"],["拥抱告别前也先问是否愿意","boundary"]],["spark","mystery"],{minSpark:6}),
  q("Q40",3,"白天约会","凌晨的感觉要不要延续",`{match}说很想再见，但也承认酒吧的光线和音乐会放大情绪。你们可以给这份好感一个更清醒的场景。`,[["约周末白天喝咖啡或逛展","ask_contact"],["交换歌单，过两天再决定","playlist"],["感谢今晚，不预设下一次","home"]],["mystery","chill"],{minSpark:4}),
  q("Q41",3,"安全离场","手机只剩百分之八",`末班车将近，手机电量不多。最成熟的结局不一定戏剧化，而是让每个人都能安全回家。`,[["叫车并把行程分享给朋友","home"],["在明亮区域等车，互报到家","friend_check"],["为了继续聊天错过交通","tease"]],["chill","mystery"]),
  q("Q42",3,"联系选择","微信、电话还是歌单",`{match}问你想用什么方式保持联系。不同联系方式暴露的信息量不同，你可以选择最轻的那一种。`,[["只交换歌单链接","playlist"],["交换联系方式，并说明明天再聊","ask_contact"],["不交换，保留为一次完整相遇","home"]],["mystery","chill"]),
  q("Q43",3,"拒绝之后","对方说还想慢一点",`当你表达靠近意愿后，{match}说：“我喜欢今晚，但还不想进入身体接触。”如何回应会决定这段相遇是否仍然安全。`,[["回答当然，并把距离退回舒服位置","boundary"],["问是不是自己哪里做错了","curious"],["改为交换歌单，轻松结束","playlist"]],["mystery","chill"],{minSpark:5}),
  q("Q44",3,"没有火花","聊天很好但不够心动",`你喜欢{match}的谈吐，却没有明显浪漫冲动。友好和爱情不是同一条评分轴。`,[["诚实维持朋友式联系","group"],["交换歌单，但不制造暧昧承诺","playlist"],["礼貌结束，各自回家","home"]],["chill","mystery"],{maxSpark:6}),
  q("Q45",3,"夜宵","要不要去下一站",`有人提议一起吃夜宵。公共、明亮、有朋友的下一站，与去陌生私人空间有完全不同的安全结构。`,[["和朋友们一起去公开夜宵店","group"],["只约白天再见，今晚先回家","ask_contact"],["单独去对方家继续喝","tease"]],["spark","chill"]),
  q("Q46",3,"最后一杯","酒吧准备打烊",`调酒师提醒最后点单。你们的谈话还没结束，但延续连接不需要再增加酒精。`,[["点水，交换联系方式后离开","water"],["各自写下一首歌再告别","playlist"],["再点一杯高度酒延长时间","share_drink"]],["mystery","chill"]),
  q("Q47",3,"共同照片","要不要留下今晚的合照",`朋友提议拍一张合照。照片可能成为纪念，也可能进入不受控制的社交传播。`,[["确认所有人同意，并约定不公开发布","photo_consent"],["只拍背影或杯子，不记录人脸","assist"],["不拍，把记忆留在当下","quiet"]],["chill","mystery"]),
  q("Q48",3,"主动结束","好感存在，但你已经累了",`身体开始告诉你该休息。继续留下不一定增加浪漫，疲惫反而会降低判断与交流质量。`,[["坦白说累了，约清醒时再见","ask_contact"],["叫车回家，到家后报平安","home"],["强撑到对方先提出结束","slow_down"]],["chill","mystery"]),
  q("Q49",3,"关系定义","今晚需要一个答案吗",`{match}问：“你觉得我们今晚算什么？”你可以表达感受，但不必在凌晨替未来下定义。`,[["说有好感，想在白天继续了解","ask_contact"],["说享受当下，但暂时不做承诺","boundary"],["用玩笑避开所有真实回答","change_topic"]],["spark","mystery"],{minSpark:4}),
  q("Q50",3,"自己的结局","如果没有配对也成立",`你意识到，今晚的价值不必由任何配对证明。音乐、城市、朋友与清醒的选择都已经构成故事。`,[["独自把 {track} 听完再回家","home"],["给朋友发消息，分享今晚最好笑的事","friend_check"],["保存这份歌单，期待下一次随机夜晚","playlist"]],["chill","mystery","spark"]),
];

const e = (id:string, actions:string[], tag:string, title:string, text:string, reason:string, extra:Partial<EndingTemplate>={}):EndingTemplate => ({id,actions,tag,title,text,reason,...extra});

export const ENDING_TEMPLATES: EndingTemplate[] = [
  e("E01",["ask_kiss"],"MUTUAL YES · 明确同意","一个被认真问过的吻",`{match}清楚地点头。吻很短，像 {track} 最后一段鼓点；真正让它成立的不是氛围，而是问与答都足够明确。`,`高心动与高清醒同时出现，且你选择先询问。`,{minSpark:8,minClarity:6,match:true}),
  e("E02",["ask_kiss"],"SOFT KISS · 慢速靠近","先确认，再靠近一点",`对方说愿意，但希望慢一点。你们先牵手，在 {bar} 门口停留片刻，再决定一个轻柔而清醒的吻。`,`心动成立，但系统把节奏控制与持续同意放在高潮之前。`,{minSpark:7,minClarity:7,match:true}),
  e("E03",["ask_kiss"],"SOFT NO · 被尊重的边界","“我还不想吻。”你说：当然。",`边界没有毁掉气氛。你退回舒服距离，换成歌单和一句晚安，让{match}知道拒绝不会带来惩罚。`,`清醒反馈优先于戏剧高潮；尊重拒绝本身就是正向结局。`,{maxSpark:8,minClarity:6,match:true}),
  e("E04",["ask_kiss"],"TOO LATE · 先回家","今晚不适合替彼此决定",`你们都意识到已经疲惫，酒精和凌晨让判断变慢。于是取消身体接触，各自安全回家。`,`清醒度不足时，系统不会把接吻当成奖励。`,{maxClarity:5,match:true}),
  e("E05",["ask_kiss"],"LAUGH FIRST · 轻松化解","问题说出口，两个人先笑了",`紧张让你们同时笑场。这个笑比吻更真实，最后只交换联系方式，把答案留给下一次。`,`好感存在，但互动风格更适合用幽默释放压力。`,{minSpark:6,minClarity:6,match:true}),
  e("E06",["ask_kiss"],"RAIN KISS · 雨夜片段","雨声替代了低频",`走到门外时雨刚好落下。再次确认后，你们在屋檐下交换一个短吻，然后分别叫车。`,`高心动、清楚询问与安全离场共同满足。`,{minSpark:8,minClarity:7,match:true}),
  e("E07",["ask_kiss"],"FOREHEAD · 温柔边界","把吻换成额头前的一句晚安",`对方不想接吻，但愿意接受一个拥抱。你先问，再在得到肯定后靠近，结局依旧温柔。`,`系统允许亲密形式被重新协商，而不是只有成功或失败。`,{minClarity:7,match:true}),
  e("E08",["ask_kiss"],"UNFINISHED · 留白","半步距离留给下一次",`你问了，对方说想等到更清醒的白天。你们交换联系方式，半步距离成为未完成而非遗憾。`,`延迟满足与边界尊重提高了后续可信度。`,{minSpark:6,match:true}),
  e("E09",["ask_contact"],"DAYLIGHT DATE · 白天见","把暧昧带到自然光里",`你们约在周日下午喝咖啡。没有重低音和酒精，仍愿意出现，才是这段相遇真正的下一章。`,`你选择了低压力、可验证的后续接触。`,{minSpark:5,minClarity:6,match:true}),
  e("E10",["ask_contact"],"MUSEUM DATE · 共同兴趣","下一站不是另一家酒吧",`你们根据聊过的兴趣约了一场展览。{track}被放进共享歌单，成为见面前的预告。`,`共同兴趣和明确计划比模糊“下次约”更可执行。`,{minSpark:6,match:true}),
  e("E11",["ask_contact"],"COFFEE FIRST · 慢热","先从四十分钟咖啡开始",`双方都把第一次白天见面控制在一杯咖啡的长度。可以继续，也可以自然结束。`,`慢热人格与清晰退出机制被优先匹配。`,{maxSpark:7,minClarity:7,match:true}),
  e("E12",["ask_contact"],"VOICE NOTE · 到家消息","十秒钟语音确认平安",`到家后你们只交换一句“我到了”。第二天再继续聊天，没有人用凌晨消息制造压力。`,`安全确认和延迟交流共同降低误解。`,{minClarity:6,match:true}),
  e("E13",["ask_contact"],"NO RUSH · 三天之后","不是立刻，也不是消失",`你们约定过两天再联系。第三天，{match}发来一首与 {track} 相反风格的歌，话题重新开始。`,`音乐差异被转化成新的交流材料。`,{minSpark:4,match:true}),
  e("E14",["ask_contact"],"BRUNCH · 清醒续集","早午餐里的第二印象",`下一次见面没有酒，只有咖啡和热食。两个人发现白天的谈话速度依然合拍。`,`酒精未被当作吸引力来源，兼容性得到二次验证。`,{minSpark:6,minClarity:7,match:true}),
  e("E15",["ask_contact"],"POLITE MAYBE · 保留可能","联系方式留下，但承诺没有",`你们交换联系方式，也坦白不确定是否会继续。诚实的“也许”比凌晨的夸张承诺更可靠。`,`中等心动下，系统选择低承诺结局。`,{maxSpark:6,match:true}),
  e("E16",["ask_contact"],"FRIEND FIRST · 先做朋友","从共同活动开始",`你们决定先和共同朋友一起参加下一次活动。关系被放进更安全、压力更低的场景。`,`群体互动历史使朋友式续集得分更高。`,{minClarity:6,match:true}),
  e("E17",["playlist"],"TEN SONGS · 十首歌","一张比名片更诚实的歌单",`你们各选十首歌，最后一格留空。下一次见面时，再决定用哪首补上。`,`你以音乐进行轻量自我披露，同时保留隐私。`,{match:true}),
  e("E18",["playlist"],"ONE TRACK · 一首就够","只交换今晚最重要的一首",`没有互关所有社交账号，只发给彼此一首歌。连接很轻，却足够让明天有一个开场。`,`低信息量联系方式符合慢热与边界偏好。`,{match:true}),
  e("E19",["playlist"],"MIXED TASTE · 差异歌单","不相似也能好奇",`歌单几乎没有重合，但你们约好各自解释三首。差异没有扣分，反而变成继续了解的理由。`,`音乐能量相近、曲风不同，触发互补型结局。`,{minClarity:6,match:true}),
  e("E20",["playlist"],"NO REPLY NEEDED · 无压力","这条链接不要求回复",`你把歌单发出去，并注明不必立刻回应。对方第二天午后才收藏，没有任何凌晨考核。`,`清晰降低回复压力，提高边界分。`,{match:true}),
  e("E21",["playlist"],"DJ NOTE · 杯垫歌名","杯垫背面的一首歌",`你们没有交换账号，只在杯垫背面写下歌名。它可能没有续集，却会在某次随机播放时回来。`,`低心动或高独处倾向匹配短暂但完整的连接。`,{maxSpark:6}),
  e("E22",["playlist"],"SHARED QUEUE · 共同播放","下一首由两个人决定",`离开前，你们共同排好三首回程音乐。短歌单像一段协作，也像一场温和告别。`,`共同选择行为提高互动反馈，但不强行延伸关系。`,{match:true}),
  e("E23",["playlist"],"MORNING SONG · 清晨重播","最后一首成为第一首",`回家路上 {track} 再次播放。它从热门曲目变成了你记住 {city} 这一晚的坐标。`,`音乐偏好成为记忆线索，而非人格诊断。`),
  e("E24",["playlist"],"ARCHIVE · 私人收藏","歌单没有公开",`你保存歌单，但没有发到社交平台。今晚属于参与者，不需要被公开证明。`,`影像与社交边界选择推动私人纪念结局。`),
  e("E25",["home"],"QUIET LUXURY · 独处","没有艳遇，也是一场完整夜晚",`你听完几首歌、喝完 {drink}，并在想离开时离开。没有人需要替这个夜晚盖章。`,`低社交能量与高自主选择共同触发。`),
  e("E26",["home"],"SAFE RIDE · 安全到家","车牌、定位与一句平安",`你在明亮区域确认车牌，把行程分享给朋友。到家后发出一句平安，故事完整收束。`,`安全离场选择获得最高权重。`),
  e("E27",["home"],"FIRST TRAIN · 首班地铁","城市已经换了一批人",`你买水等到首班地铁，耳朵里还残留低频。清晨通勤者开始了完全不同的一天。`,`独处倾向和低能量匹配城市观察型结局。`),
  e("E28",["home"],"RAIN TAXI · 雨中车窗","把心动留在后视镜",`出租车驶离 {bar}，雨水把招牌拉成长线。你没有交换联系方式，却不觉得失去什么。`,`中等心动但主动结束，形成余韵结局。`),
  e("E29",["home"],"PHONE OFF · 勿扰模式","今晚到此为止",`手机调成勿扰，水杯放在床边。你决定明天再判断今晚，而不是在疲惫中继续消息。`,`高边界分与疲惫状态触发休息优先。`),
  e("E30",["home"],"FRIEND CAR · 一起回家","人数、外套、手机都在",`朋友们在门口清点人数和随身物品，一起回家。最好的团队结局，是所有人安全到达。`,`多次朋友检查选择提高群体安全权重。`),
  e("E31",["home"],"NO REGRET · 恰好结束","没有把一晚拖成遗憾",`你在气氛仍好时离开，没有等到身体和情绪透支。结束得恰好，也是一种能力。`,`主动结束和清醒度共同决定。`),
  e("E32",["group","friend_check"],"BREAKFAST TABLE · 清晨拼桌","陌生人变成一桌朋友",`最初互不认识的人一起吃早餐，没人追问关系，只认真讨论豆浆和面。`,`群体选择累计，浪漫让位于社区感。`),
  e("E33",["group","friend_check"],"NEW FRIENDS · 新群聊","没有暧昧，也有新关系",`你加入一个活动群，下一次可能是演出、展览或桌游。连接不只存在于两性配对。`,`朋友式互动得分高于浪漫推进。`),
  e("E34",["group"],"GROUP DATE · 低压续集","下一次仍然有人在旁边",`你们约好和共同朋友一起再见。熟悉感会慢慢增加，任何人都可以自然退出。`,`群体可见性与安全偏好匹配。`,{match:true}),
  e("E35",["friend_check"],"DESIGNATED FRIEND · 照顾者","你记住了谁需要水",`你暂停自己的剧情，先照顾状态不稳的朋友。浪漫没有发生，但信任在朋友之间增长。`,`帮助与朋友检查行动成为核心证据。`),
  e("E36",["group"],"PHOTO WITHOUT FACES · 只拍灯光","照片里没有人脸",`大家只拍下杯子、灯光和城市，没有把任何人未经同意放上网络。`,`影像同意与群体互动共同触发。`),
  e("E37",["friend_check"],"LOST FRIEND FOUND · 找回同伴","十分钟的共同任务",`你和工作人员一起找到走散的客人。两位朋友重逢时，全场压力才真正放下。`,`助人选择优先于配对高潮。`),
  e("E38",["group"],"DANCE CIRCLE · 舞圈","被接住的一个动作",`舞池为每个人留出空间，没有推搡和起哄。你记住的是一群人的善意，而不是某个名字。`,`高能量与群体安全同时满足。`),
  e("E39",["boundary","decline"],"CLEAR NO · 清楚拒绝","拒绝没有毁掉夜晚",`你说不，对方接受，谈话自然转回普通社交。边界被尊重后，空气没有变坏。`,`明确拒绝与对方退让被视为成功互动。`),
  e("E40",["boundary"],"STAFF HELP · 工作人员介入","求助不是扫兴",`当陌生人持续越界，你走向工作人员并得到陪同。安全计划启动，故事在被保护中结束。`,`多次边界信号触发安全优先结局。`),
  e("E41",["decline"],"POLITE EXIT · 礼貌离场","一句谢谢，然后转身",`你感谢对方的邀请，也清楚表达不想继续。没有解释义务，拒绝本身已经完整。`,`低心动与清晰拒绝匹配。`),
  e("E42",["boundary"],"REPAIR · 玩笑后的修复","一句道歉改变走向",`你指出玩笑越界，对方没有辩解，而是道歉并调整。关系未必继续，但修复被看见。`,`边界表达后得到正向反馈。`,{minClarity:6,match:true}),
  e("E43",["slow_down"],"SLOWER · 降速","把热度调低一格",`你们从舞池回到吧台，换水、坐下、重新确认状态。暧昧没有消失，只是不再失控。`,`降速选择保留心动并恢复清醒。`,{match:true}),
  e("E44",["water"],"ZERO PROOF · 清醒转场","第二杯是气泡水",`你们一起换成无酒精饮品，谈话反而更清楚。能继续交流的不是酒，而是彼此的兴趣。`,`清醒度回升且好感未下降。`,{match:true}),
  e("E45",["any","curious","open_up"],"DEEP TALK · 话题越过寒暄","一个问题让时间变快",`你们没有发生身体接触，却认真回答了一个彼此都在意的问题。夜晚因此有了重量。`,`递进、互惠的自我披露提高了亲近感。`,{minSpark:5,match:true}),
  e("E46",["any","playful","tease"],"LAUGHING · 笑场","最好的部分没有计划",`一句很冷的笑话让两个人同时笑场。你回家后记不清原句，只记得当时放松的感觉。`,`幽默与高能量选择占主导。`,{match:true}),
  e("E47",["any","assist"],"SMALL KINDNESS · 小事","被记住的是一个动作",`你帮忙护住手机、递水或扶住门。没有交换联系方式，但善意完成了自己的闭环。`,`帮助行为高于浪漫分数。`),
  e("E48",["any","observe","quiet"],"OBSERVER · 观察者","城市夜晚的旁观席",`你安静看完一场人群流动，记住调酒师的动作、灯光变化和 {track} 的低频。`,`观察与独处选择累计。`),
  e("E49",["any"],"OPEN ENDING · 未命名","故事没有被强行归类",`你无法确定这是艳遇、友谊还是一次普通交流。不给它名字，反而让记忆保持真实。`,`数值接近中间区间，系统保留模糊性。`,{minSpark:3,maxSpark:7}),
  e("E50",["any"],"AFTERDARK · 属于你的夜晚","下一次仍会不同",`酒吧、音乐、酒和选择只是坐标。真正改变结局的，是你何时靠近、何时停下，以及如何对待他人的答案。`,`综合所有选择生成的平衡结局。`),
];

export function chooseQuestion(input:{phase:0|1|2|3;persona:GamePersona;stats:GameStats;lastAction?:string;musicEnergy:number;drinkAbv:number;fortune:number;usedIds:string[];venueEnergy:number;venueSocial:number;venueIntimacy:number;venueTags:string[]}) {
  const eligible = INTERACTION_QUESTIONS.filter((item)=>item.phase===input.phase&&!input.usedIds.includes(item.id)&&(item.minSpark===undefined||input.stats.spark>=item.minSpark)&&(item.maxSpark===undefined||input.stats.spark<=item.maxSpark));
  const ranked = eligible.map((item)=>{
    let score = item.affinity.includes(input.persona) ? 5 : 1;
    if (input.lastAction && item.follow?.includes(input.lastAction)) score += 5;
    if (item.theme.includes("舞") && input.musicEnergy>=4) score += 3;
    if (item.theme.includes("舞") && input.venueTags.includes("dance")) score += 5;
    if (item.theme.includes("音乐") && input.venueTags.some((tag)=>["music","live","dance"].includes(tag))) score += 4;
    if (["朋友局","共同朋友"].some((theme)=>item.theme.includes(theme)) && input.venueTags.some((tag)=>["group","community","inclusive"].includes(tag))) score += 4;
    if (["安静","深聊","自我披露","个人空间","未来节奏","关系定义"].some((theme)=>item.theme.includes(theme)) && input.venueIntimacy>=4) score += 4;
    if (["第一印象","赞美","照片"].some((theme)=>item.theme.includes(theme)) && input.venueTags.some((tag)=>["style","photo","design","skyline","color"].includes(tag))) score += 3;
    if (["调酒师","饮酒节奏","夜宵"].some((theme)=>item.theme.includes(theme)) && input.venueTags.some((tag)=>["bartender","tasting","food","tea","agave","whisky"].includes(tag))) score += 4;
    if (["座位","旅行","白天约会"].some((theme)=>item.theme.includes(theme)) && input.venueTags.some((tag)=>["terrace","skyline","date","explore"].includes(tag))) score += 3;
    if (["眼神","幽默","自我介绍","暧昧判断"].some((theme)=>item.theme.includes(theme)) && input.venueSocial>=4) score += 2;
    if ((item.theme.includes("边界")||item.theme.includes("安全")||item.theme.includes("身体距离")) && input.venueEnergy>=5 && input.venueIntimacy<=2) score += 4;
    if ((item.theme.includes("酒")||item.theme.includes("清醒")) && input.drinkAbv>=18) score += 3;
    if ((item.theme.includes("边界")||item.theme.includes("安全")) && input.stats.clarity>=6) score += 2;
    score += (Number(item.id.slice(1)) + input.fortune + input.usedIds.length) % 4;
    return {item,score};
  }).sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
  if (!ranked.length) return INTERACTION_QUESTIONS.find((item)=>item.phase===input.phase)!;
  const topSize = Math.min(4,ranked.length);
  const explore = input.fortune%5===4 && ranked.length>topSize;
  const start = explore ? topSize : 0;
  const width = explore ? ranked.length-topSize : topSize;
  const pick = (input.fortune*7+input.usedIds.length*3+input.phase)%width;
  return ranked[start+pick].item;
}

export function chooseEnding(input:{action:string;stats:GameStats;fortune:number;hasMatch:boolean;historyActions:string[];venueEnergy:number;venueSocial:number;venueIntimacy:number;venueTags:string[]}) {
  const eligible = ENDING_TEMPLATES.filter((item)=>(item.actions.includes(input.action)||item.actions.includes("any"))&&(item.minSpark===undefined||input.stats.spark>=item.minSpark)&&(item.maxSpark===undefined||input.stats.spark<=item.maxSpark)&&(item.minClarity===undefined||input.stats.clarity>=item.minClarity)&&(item.maxClarity===undefined||input.stats.clarity<=item.maxClarity)&&(item.match===undefined||item.match===input.hasMatch));
  const ranked = eligible.map((item)=>{
    let score = item.actions.includes(input.action) ? 8 : 1;
    score += input.historyActions.filter((action)=>item.actions.includes(action)).length*2;
    const venueText = `${item.tag} ${item.title}`;
    if (input.venueTags.includes("dance") && (venueText.includes("DANCE")||venueText.includes("舞"))) score += 5;
    if (input.venueTags.some((tag)=>["group","community","inclusive"].includes(tag)) && (venueText.includes("FRIEND")||venueText.includes("GROUP")||venueText.includes("拼桌")||venueText.includes("群聊"))) score += 4;
    if (input.venueIntimacy>=4 && (venueText.includes("DEEP")||venueText.includes("QUIET")||venueText.includes("慢")||venueText.includes("白天")||venueText.includes("咖啡"))) score += 4;
    if (input.venueTags.some((tag)=>["music","live"].includes(tag)) && (venueText.includes("SONG")||venueText.includes("歌")||venueText.includes("DJ"))) score += 4;
    if (input.venueEnergy>=5 && (venueText.includes("LAUGH")||venueText.includes("DANCE")||venueText.includes("早餐"))) score += 3;
    if (input.venueSocial<=3 && (venueText.includes("OBSERVER")||venueText.includes("独处")||venueText.includes("留白"))) score += 3;
    score += (Number(item.id.slice(1))+input.fortune)%5;
    return {item,score};
  }).sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
  if (!ranked.length) return ENDING_TEMPLATES[49];
  const topSize = Math.min(4,ranked.length);
  const explore = input.fortune%3===2 && ranked.length>topSize;
  const start = explore ? topSize : 0;
  const width = explore ? ranked.length-topSize : topSize;
  const pick = (input.fortune*11+input.historyActions.length*5)%width;
  return ranked[start+pick].item;
}
