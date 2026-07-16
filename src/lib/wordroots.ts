/**
 * 常见英语词根词缀数据库
 * 格式：[词根/词缀, 中文含义, 例词]
 * 参考：墨墨背单词、词根词缀词典
 */

const PREFIXES: [string, string, string][] = [
  ["a", "不/无/非", "atypical不典型的"],
  ["ab", "离开/相反", "abnormal反常的"],
  ["ad", "朝向", "advance前进"],
  ["anti", "反对/抗", "antivirus抗病毒"],
  ["auto", "自己/自动", "automatic自动的"],
  ["bene", "好/善", "benefit好处"],
  ["bi", "两个/双", "bicycle自行车"],
  ["bio", "生命", "biology生物学"],
  ["circum", "周围", "circumstance环境"],
  ["co", "共同", "cooperate合作"],
  ["com", "共同/一起", "combine结合"],
  ["contra", "反对/相反", "contrary相反的"],
  ["de", "向下/去除", "delete删除"],
  ["dis", "否定/分离", "disappear消失"],
  ["en", "使成为", "enable使能够"],
  ["ex", "向外/前", "export出口"],
  ["extra", "超出/额外", "extraordinary非凡的"],
  ["fore", "前/预", "forecast预报"],
  ["geo", "地球/土地", "geography地理"],
  ["in", "不/无/向内", "incorrect不正确"],
  ["inter", "在…之间", "international国际的"],
  ["intra", "在…内部", "intranet内部网"],
  ["macro", "大/宏", "macroscopic宏观的"],
  ["micro", "微小", "microscope显微镜"],
  ["mid", "中间", "midnight午夜"],
  ["mis", "错误", "misunderstand误解"],
  ["mono", "单一", "monopoly垄断"],
  ["multi", "许多", "multiply乘"],
  ["non", "非/不", "nonsense胡扯"],
  ["out", "超过/向外", "outweigh超过"],
  ["over", "过度/在上", "overcome克服"],
  ["per", "贯穿/彻底", "perfect完美"],
  ["poly", "多", "polygon多边形"],
  ["post", "后", "postpone推迟"],
  ["pre", "前/预", "predict预测"],
  ["pro", "向前/赞成", "progress进步"],
  ["re", "再次/回", "return返回"],
  ["retro", "向后/倒退", "retrospect回顾"],
  ["se", "分开", "separate分开"],
  ["semi", "半", "semifinal半决赛"],
  ["sub", "在下面/次", "subway地铁"],
  ["super", "超/上", "superior优越的"],
  ["sur", "超过/在上", "surface表面"],
  ["tele", "远距离", "television电视"],
  ["trans", "跨越/转移", "transport运输"],
  ["tri", "三", "triangle三角形"],
  ["un", "否定", "unable不能的"],
  ["uni", "单一", "universe宇宙"],
  ["up", "向上", "upgrade升级"],
  ["with", "相反/向后", "withdraw撤回"],
];

const SUFFIXES: [string, string, string][] = [
  ["able", "能…的(形)", "readable可读的"],
  ["age", "状态/集合(名)", "marriage婚姻"],
  ["al", "…的(形)/动作(名)", "personal个人的"],
  ["ance", "状态/性质(名)", "importance重要性"],
  ["ant", "…的人/物(名)", "assistant助手"],
  ["ary", "…的/场所(形/名)", "library图书馆"],
  ["ate", "使成为(动)", "activate激活"],
  ["cy", "状态/性质(名)", "accuracy准确性"],
  ["dom", "领域/状态(名)", "freedom自由"],
  ["ed", "…的/已…的(形)", "excited兴奋的"],
  ["ee", "被…的人(名)", "employee雇员"],
  ["en", "使成为(动)", "strengthen加强"],
  ["ence", "状态/性质(名)", "difference差异"],
  ["ent", "…的(形)", "different不同的"],
  ["er", "…的人/物(名)", "teacher教师"],
  ["ese", "…人/语的(形)", "Chinese中国的"],
  ["ess", "女性/雌性(名)", "actress女演员"],
  ["ful", "充满…的(形)", "beautiful美丽的"],
  ["fy", "使成为(动)", "simplify简化"],
  ["hood", "状态/时期(名)", "childhood童年"],
  ["ian", "…的人(名)", "musician音乐家"],
  ["ible", "能…的(形)", "possible可能的"],
  ["ic", "…的(形)", "economic经济的"],
  ["ify", "使成为(动)", "clarify澄清"],
  ["ing", "正在/动作(形/名)", "interesting有趣的"],
  ["ion", "动作/状态(名)", "action行动"],
  ["ish", "…的/有点(形)", "childish幼稚的"],
  ["ism", "主义/学说(名)", "socialism社会主义"],
  ["ist", "…的人(名)", "scientist科学家"],
  ["ity", "状态/性质(名)", "ability能力"],
  ["ive", "…的(形)", "active活跃的"],
  ["ize", "使成为(动)", "realize实现"],
  ["less", "没有…的(形)", "endless无尽的"],
  ["logy", "…学(名)", "biology生物学"],
  ["ly", "…地(副)", "quickly快速地"],
  ["ment", "结果/状态(名)", "movement运动"],
  ["ness", "状态/性质(名)", "happiness幸福"],
  ["or", "…的人/物(名)", "actor演员"],
  ["ory", "…的/场所(形/名)", "factory工厂"],
  ["ous", "充满…的(形)", "famous著名的"],
  ["ship", "关系/状态(名)", "friendship友谊"],
  ["sion", "动作/状态(名)", "decision决定"],
  ["tion", "动作/状态(名)", "education教育"],
  ["ture", "动作/状态(名)", "culture文化"],
  ["ward", "朝…方向(形/副)", "forward向前"],
  ["wise", "…方式(副)", "otherwise否则"],
  ["y", "…的/充满(形)", "healthy健康的"],
];

const WORD_ROOTS: [string, string, string][] = [
  ["act", "做/行动", "action行动,react反应"],
  ["agri", "田地/农业", "agriculture农业"],
  ["aqua", "水", "aquarium水族馆"],
  ["astro", "星", "astronomy天文学"],
  ["audi", "听", "audience听众,audio音频"],
  ["bell", "战争", "rebel反叛"],
  ["brev", "短", "brief简短,abbreviate缩写"],
  ["cap", "头/拿", "capital首都,capture抓住"],
  ["cede", "走/离开", "precede先于"],
  ["cent", "百", "century世纪,percent百分之"],
  ["chron", "时间", "chronic长期的"],
  ["cide", "杀", "suicide自杀"],
  ["circ", "圆/环", "circle圆,circulate循环"],
  ["claim", "喊/叫", "exclaim呼喊"],
  ["clar", "清楚", "clarify澄清"],
  ["cogn", "知道", "recognize认出"],
  ["corp", "身体", "corporate公司的"],
  ["cred", "相信", "credit信用"],
  ["cur", "关心/注意", "curious好奇的"],
  ["cycl", "圆/环", "recycle回收"],
  ["dem", "人民", "democracy民主"],
  ["dent", "牙齿", "dentist牙医"],
  ["dict", "说", "predict预测,dictionary词典"],
  ["don", "给予", "donate捐赠"],
  ["duc", "引导", "educate教育,produce生产"],
  ["dur", "持久", "durable耐用的"],
  ["equ", "相等", "equal相等的"],
  ["fact", "做/制造", "factory工厂"],
  ["fer", "带来/运送", "transfer转移"],
  ["fid", "信任", "confident自信的"],
  ["fin", "结束/边界", "finish完成"],
  ["flex", "弯曲", "flexible灵活的"],
  ["flu", "流动", "fluent流利的"],
  ["form", "形状/形成", "transform改变"],
  ["fort", "强/力量", "effort努力"],
  ["gen", "产生/出生", "generate产生"],
  ["gress", "步/行走", "progress进步"],
  ["grad", "步/级", "gradual逐渐的"],
  ["graph", "写/画", "photograph照片"],
  ["grat", "感谢/高兴", "grateful感激的"],
  ["grav", "重", "gravity重力"],
  ["habit", "居住/习惯", "habitat栖息地"],
  ["hydr", "水", "dehydrate脱水"],
  ["ject", "投/抛", "project项目"],
  ["junct", "连接", "junction连接"],
  ["lect", "收集/选", "collect收集"],
  ["leg", "法律", "legal合法的"],
  ["liter", "文字", "literature文学"],
  ["loc", "地方", "location位置"],
  ["log", "说话/思想", "dialogue对话"],
  ["luc", "光", "illuminate照亮"],
  ["man", "手", "manual手动的"],
  ["mand", "命令", "command命令"],
  ["memor", "记忆", "memory记忆"],
  ["ment", "心/思考", "mental精神的"],
  ["merg", "沉/浸", "emerge浮现"],
  ["meter", "测量", "kilometer千米"],
  ["migr", "迁移", "immigrate移入"],
  ["min", "小", "minimum最小的"],
  ["miss", "发送/放出", "dismiss解雇"],
  ["mob", "移动", "mobile移动的"],
  ["mort", "死", "mortal必死的"],
  ["nat", "出生/天生", "nation国家,nature自然"],
  ["norm", "规则/标准", "normal正常的"],
  ["nov", "新", "novel小说,innovate创新"],
  ["oper", "工作", "operate操作"],
  ["opt", "选择/光", "option选择"],
  ["para", "旁边/反对", "parallel平行"],
  ["path", "感觉/病", "sympathy同情"],
  ["ped", "脚", "pedestrian行人"],
  ["pel", "推动/驱使", "compel强迫"],
  ["pend", "悬挂/衡量", "depend依赖"],
  ["phil", "爱", "philosophy哲学"],
  ["phon", "声音", "telephone电话"],
  ["pict", "画", "picture图片"],
  ["plac", "使高兴/放置", "place地方"],
  ["plic", "折叠", "complicated复杂的"],
  ["popul", "人民", "popular流行的"],
  ["port", "搬运", "import进口,export出口"],
  ["pos", "放置", "position位置"],
  ["preci", "价值", "precious珍贵的"],
  ["prim", "第一", "primary主要的"],
  ["psych", "心理/精神", "psychology心理学"],
  ["punct", "点", "punctual准时的"],
  ["quer", "询问/寻求", "query查询"],
  ["rect", "直/正", "correct正确"],
  ["reg", "统治/规则", "regular规则的"],
  ["rupt", "破裂", "interrupt打断"],
  ["sci", "知道", "science科学"],
  ["scope", "看/镜", "microscope显微镜"],
  ["scrib", "写", "describe描述"],
  ["sens", "感觉", "sensitive敏感的"],
  ["sequ", "跟随", "sequence顺序"],
  ["serv", "服务/保存", "service服务"],
  ["sign", "标记", "signal信号,design设计"],
  ["simil", "相似", "similar相似的"],
  ["sol", "单独/太阳", "solo独奏,solar太阳的"],
  ["soph", "智慧", "philosophy哲学"],
  ["spec", "看", "inspect检查"],
  ["spir", "呼吸", "inspire激励"],
  ["st", "站/立", "stable稳定的"],
  ["struct", "建造", "structure结构"],
  ["sume", "拿/取", "consume消费"],
  ["tact", "接触", "contact联系"],
  ["tempor", "时间", "temporary临时的"],
  ["tend", "延伸/倾向", "extend延伸"],
  ["terr", "土地/恐吓", "territory领土"],
  ["test", "证明/测试", "protest抗议"],
  ["therm", "热", "thermal热的"],
  ["tract", "拉/拖", "attract吸引"],
  ["vac", "空", "vacation假期"],
  ["val", "价值/力量", "value价值"],
  ["vari", "变化", "variety多样性"],
  ["ven", "来", "event事件"],
  ["ver", "真实", "verify验证"],
  ["vers", "转", "reverse反转"],
  ["vid", "看", "video视频"],
  ["vis", "看", "visible可见的"],
  ["vit", "生命", "vital至关重要的"],
  ["voc", "声音/呼唤", "voice声音"],
  ["vol", "意愿/卷", "volunteer志愿者"],
  ["volv", "转/滚", "involve涉及"],
];

/** 从手写词库加载记忆法（懒加载） */
let mnemonicDB: Record<string, string> | null = null;
let mnemonicPromise: Promise<void> | null = null;

async function loadMnemonics(): Promise<Record<string, string>> {
  if (mnemonicDB) return mnemonicDB;
  if (!mnemonicPromise) {
    mnemonicPromise = fetch("/data/mnemonics.json")
      .then((r) => r.json())
      .then((data) => {
        mnemonicDB = data;
      })
      .catch(() => {
        mnemonicDB = {};
      });
  }
  await mnemonicPromise;
  return mnemonicDB || {};
}

/** 根据单词查找词根词缀记忆法 */
export async function findMnemonicAsync(word: string): Promise<string> {
  const lower = word.toLowerCase();
  // 1. 优先查手写词库
  const db = await loadMnemonics();
  if (db[lower]) return db[lower];
  // 2. 算法兜底
  return findMnemonic(word);
}

/** 根据单词查找词根词缀记忆法（同步版本） */
export function findMnemonic(word: string): string {
  const lower = word.toLowerCase();
  const parts: string[] = [];
  let remaining = lower;

  // 按长度降序匹配前缀（长前缀优先）
  const sortedPrefixes = [...PREFIXES].sort((a, b) => b[0].length - a[0].length);
  for (const [pref, meaning] of sortedPrefixes) {
    if (remaining.startsWith(pref) && remaining.length >= pref.length + 2) {
      parts.push(`${pref}(${meaning})`);
      remaining = remaining.slice(pref.length);
      break;
    }
  }

  // 按长度降序匹配词根
  const sortedRoots = [...WORD_ROOTS].sort((a, b) => b[0].length - a[0].length);
  for (const [root, meaning] of sortedRoots) {
    if (root.length < 3) continue;
    const idx = lower.indexOf(root);
    if (idx >= 1) {
      // 检查不是后缀的一部分：词根长度应大于后缀
      const isNotSuffix = !SUFFIXES.some(([suff]) => root === suff);
      if (isNotSuffix) {
        parts.push(`${root}(${meaning})`);
        break;
      }
    }
  }

  // 按长度降序匹配后缀
  const sortedSuffixes = [...SUFFIXES].sort((a, b) => b[0].length - a[0].length);
  for (const [suff, meaning] of sortedSuffixes) {
    if (lower.endsWith(suff) && lower.length >= suff.length + 3) {
      // 排除后缀本身就是词根的情况
      const isNotRoot = !WORD_ROOTS.some(([root]) => root === suff);
      if (isNotRoot) {
        parts.push(`${suff}(${meaning})`);
        break;
      }
    }
  }

  if (parts.length >= 2) {
    return `词根记忆: ${parts.join(" + ")}\n→ ${word}`;
  }
  if (parts.length === 1) {
    return `词根记忆: ${parts[0]}\n→ ${word}`;
  }
  return "";
}
