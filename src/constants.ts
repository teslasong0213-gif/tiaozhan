import { LevelConfig, BarcodeDefinition } from "./types";

export const BARCODE_DEFINITIONS: BarcodeDefinition[] = [
  {
    id: 1,
    name: "早八码",
    icon: "☀️",
    bgColor: "bg-amber-100",
    description: "早早起床，狂风与清晨寒气将刘海吹成立体死结条形码。"
  },
  {
    id: 2,
    name: "通勤码",
    icon: "💼",
    bgColor: "bg-emerald-100",
    description: "早高峰地铁疯狂挤撞，刘海不幸在他人肩膀上碾压为坚实宽幅条线。"
  },
  {
    id: 3,
    name: "加班码",
    icon: "💻",
    bgColor: "bg-orange-100",
    description: "深夜两点写代码，油脂分泌率攀升至99%，油光闪闪可扫码付款。"
  },
  {
    id: 4,
    name: "答辩码",
    icon: "🐰",
    bgColor: "bg-purple-100",
    description: "面对台下评委的灵魂拷问，额头冷汗直冒，刘海瞬间拧成六股硬毛。"
  },
  {
    id: 5,
    name: "续命码",
    icon: "☕",
    bgColor: "bg-amber-900/10",
    description: "咖啡蒸汽和额头油脂完美乳化，刘海形成了类似焦糖拿铁的斑驳痕迹。"
  },
  {
    id: 6,
    name: "下班码",
    icon: "🎉",
    bgColor: "bg-sky-100",
    description: "欢庆自由的狂跑时刻，刘海四分五裂，但今晚终于有机会彻底清洗！"
  }
];

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    key: "cut",
    title: "第一关：刘海切码挑战",
    subtitle: "滑动手指/鼠标，切掉所有顽固刘海条形码！",
    actionText: "开始切码",
    statusText: "掉落中...",
    completeText: "切码完成！",
    nextLevel: "suck",
    hint: "提示：用手指或指针在空中划过飘落的刘海条形码进行物理切割！"
  },
  {
    id: 2,
    key: "suck",
    title: "第二关：刘海吸码挑战",
    subtitle: "点击屏幕任意处，启动超强力吸盘吸走刘海码！",
    actionText: "开始吸码",
    statusText: "全力吸附中...",
    completeText: "吸附完成！",
    nextLevel: "melt",
    hint: "提示：点击或长按屏幕，漩涡会爆发出黄色重力气流将条形码卷入！"
  },
  {
    id: 3,
    key: "melt",
    title: "第三关：刘海溶码挑战",
    subtitle: "点击或按住条形码喷洒去油泡沫，溶解深层污渍！",
    actionText: "开始溶码",
    statusText: "深度溶解中...",
    completeText: "所有刘海大洗如初！",
    nextLevel: "result",
    hint: "提示：不停点击覆盖着油垢水渍的条形码。洗面奶和去油泡沫能迅速溶解它！"
  }
];
