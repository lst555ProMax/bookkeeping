import { FortuneRecord, FortuneLevel, FortuneAspect, AspectFortune } from '@/types';

// 幸运颜色列表
const LUCKY_COLORS = ['红色', '橙色', '黄色', '绿色', '蓝色', '紫色', '粉色', '白色', '金色', '银色'];

// 各等级的运势描述模板
const FORTUNE_DESCRIPTIONS: Record<FortuneLevel, Record<FortuneAspect, string[]>> = {
  [FortuneLevel.EXCELLENT]: {
    [FortuneAspect.OVERALL]: ['今日运势极佳，诸事顺利', '吉星高照，万事如意', '运势爆棚，心想事成'],
    [FortuneAspect.CAREER]: ['工作进展顺利，易获认可', '事业蒸蒸日上，贵人相助', '项目推进顺畅，成果显著'],
    [FortuneAspect.WEALTH]: ['财运亨通，有意外收获', '正财偏财皆旺，钱财滚滚', '投资有道，收益颇丰'],
    [FortuneAspect.LOVE]: ['桃花运旺，感情甜蜜', '爱情如蜜，情投意合', '单身者易遇良缘'],
    [FortuneAspect.HEALTH]: ['精神饱满，身体健康', '活力充沛，神采奕奕', '身心愉悦，元气满满'],
    [FortuneAspect.STUDY]: ['学习效率极高，一点就通', '考试运佳，金榜题名', '思维敏捷，学有所成']
  },
  [FortuneLevel.GOOD]: {
    [FortuneAspect.OVERALL]: ['今日运势不错，顺风顺水', '诸事顺遂，心情愉快', '运势良好，积极向上'],
    [FortuneAspect.CAREER]: ['工作顺利，表现出色', '职场表现获得肯定', '工作效率高，成绩显著'],
    [FortuneAspect.WEALTH]: ['财运不错，有小额进账', '收入稳定，略有盈余', '理财得当，小有收获'],
    [FortuneAspect.LOVE]: ['感情和睦，相处融洽', '恋爱顺利，温馨甜蜜', '感情稳定，彼此理解'],
    [FortuneAspect.HEALTH]: ['身体状况良好，精力充沛', '健康状态佳，心情舒畅', '体力充足，活力四射'],
    [FortuneAspect.STUDY]: ['学习状态良好，效果不错', '学业顺利，稳步提升', '理解力强，学习顺畅']
  },
  [FortuneLevel.FAIR]: {
    [FortuneAspect.OVERALL]: ['运势平稳，中规中矩', '今日平常，平淡如水', '运势一般，波澜不惊'],
    [FortuneAspect.CAREER]: ['工作平稳，按部就班', '职场表现中规中矩', '工作如常，无大起伏'],
    [FortuneAspect.WEALTH]: ['财运平平，收支平衡', '金钱运一般，需理性消费', '财务稳定，无大变化'],
    [FortuneAspect.LOVE]: ['感情平淡，需要用心经营', '爱情如水，细水长流', '感情稳定但缺少惊喜'],
    [FortuneAspect.HEALTH]: ['健康无大碍，注意休息', '身体状况一般，需保养', '体力尚可，勿过度劳累'],
    [FortuneAspect.STUDY]: ['学习状态一般，需加油', '学业平平，需要努力', '学习效率中等，可提升']
  },
  [FortuneLevel.POOR]: {
    [FortuneAspect.OVERALL]: ['运势稍弱，需谨慎行事', '今日不太顺利，需耐心', '运势低迷，保持乐观'],
    [FortuneAspect.CAREER]: ['工作有阻碍，需耐心应对', '职场不太顺利，小心为上', '工作有小麻烦，冷静处理'],
    [FortuneAspect.WEALTH]: ['财运欠佳，谨防破财', '金钱运不好，控制开支', '财务吃紧，需节约'],
    [FortuneAspect.LOVE]: ['感情有小波折，需沟通', '爱情不顺，需互相理解', '感情有小矛盾，多包容'],
    [FortuneAspect.HEALTH]: ['身体略有不适，多休息', '健康需注意，勿熬夜', '体力不济，需补充营养'],
    [FortuneAspect.STUDY]: ['学习有困难，需努力克服', '学业受阻，需调整方法', '学习效率低，需找对方法']
  },
  [FortuneLevel.BAD]: {
    [FortuneAspect.OVERALL]: ['运势不佳，诸事不顺', '今日多波折，需谨慎', '运势低谷，坚持就是胜利'],
    [FortuneAspect.CAREER]: ['工作阻力大，需小心应对', '职场不顺，避免冲突', '工作困难重重，需冷静'],
    [FortuneAspect.WEALTH]: ['破财之相，谨慎理财', '财运极差，勿投资', '金钱损失，需警惕'],
    [FortuneAspect.LOVE]: ['感情危机，需冷静处理', '爱情有大波折，需谨慎', '感情不顺，避免争吵'],
    [FortuneAspect.HEALTH]: ['健康告急，注意身体', '身体欠佳，需及时就医', '体力透支，必须休息'],
    [FortuneAspect.STUDY]: ['学习困难，需调整心态', '学业不顺，需寻求帮助', '学习受挫，保持信心']
  }
};

// 建议模板
const ADVICE_TEMPLATES = [
  '保持积极心态，微笑面对生活',
  '多与朋友交流，放松心情',
  '适当运动，增强体质',
  '早睡早起，规律作息',
  '多读书学习，充实自己',
  '保持耐心，静待花开',
  '乐于助人，广结善缘',
  '踏实工作，稳步前进'
];

// 禁忌模板
const WARNING_TEMPLATES = [
  '避免冲动消费',
  '勿与人争执',
  '不宜做重大决策',
  '避免熬夜',
  '少食辛辣刺激',
  '勿过度劳累',
  '避免情绪化',
  '不宜长途旅行'
];

/**
 * 根据日期生成随机但稳定的种子
 * @param date 日期字符串
 * @param useMicroseconds 是否使用微秒时间戳（用于重置后生成新结果）
 */
const getDateSeed = (date: string, useMicroseconds: boolean = false): number => {
  let hash = 0;
  const seedString = useMicroseconds ? `${date}_${Date.now()}` : date;
  
  for (let i = 0; i < seedString.length; i++) {
    hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * 基于种子的随机数生成器
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

/**
 * 根据分数获取运势等级
 */
const getFortuneLevel = (score: number): FortuneLevel => {
  if (score >= 90) return FortuneLevel.EXCELLENT;
  if (score >= 75) return FortuneLevel.GOOD;
  if (score >= 60) return FortuneLevel.FAIR;
  if (score >= 40) return FortuneLevel.POOR;
  return FortuneLevel.BAD;
};

/**
 * 生成单个方面的运势
 */
const generateAspectFortune = (aspect: FortuneAspect, random: SeededRandom): AspectFortune => {
  // 分数范围 0-100，完整覆盖所有运势等级
  const score = random.nextInt(0, 100);
  const level = getFortuneLevel(score);
  const descriptions = FORTUNE_DESCRIPTIONS[level][aspect];
  const description = random.choice(descriptions);

  return {
    aspect,
    level,
    score,
    description
  };
};

/**
 * 生成今日运势
 * @param forceNew 是否强制生成新的运势（用于重置后重新生成）
 */
export const generateTodayFortune = (forceNew: boolean = false): FortuneRecord => {
  const today = new Date().toISOString().split('T')[0];
  const seed = getDateSeed(today, forceNew);
  const random = new SeededRandom(seed);

  // 生成各方面运势
  const aspects: AspectFortune[] = [
    generateAspectFortune(FortuneAspect.CAREER, random),
    generateAspectFortune(FortuneAspect.WEALTH, random),
    generateAspectFortune(FortuneAspect.LOVE, random),
    generateAspectFortune(FortuneAspect.HEALTH, random),
    generateAspectFortune(FortuneAspect.STUDY, random)
  ];

  // 计算综合得分（各方面平均）
  const overallScore = Math.round(
    aspects.reduce((sum, aspect) => sum + aspect.score, 0) / aspects.length
  );
  const overallLevel = getFortuneLevel(overallScore);

  // 生成综合运势描述
  const overallDescriptions = FORTUNE_DESCRIPTIONS[overallLevel][FortuneAspect.OVERALL];
  const overallDescription = random.choice(overallDescriptions);

  // 添加综合运到列表开头
  aspects.unshift({
    aspect: FortuneAspect.OVERALL,
    level: overallLevel,
    score: overallScore,
    description: overallDescription
  });

  // 生成其他属性
  const luckyColor = random.choice(LUCKY_COLORS);
  const luckyNumber = random.nextInt(1, 99);
  const advice = random.choice(ADVICE_TEMPLATES);
  const warning = random.choice(WARNING_TEMPLATES);

  return {
    id: `fortune_${Date.now()}`,
    date: today,
    overallLevel,
    overallScore,
    aspects,
    luckyColor,
    luckyNumber,
    advice,
    warning,
    createdAt: new Date()
  };
};
