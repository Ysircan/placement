export type ScoreBand =
  | "Below 15"
  | "15 - 30"
  | "30 - 42"
  | "42 - 50"
  | "50 - 58"
  | "58+";

export type CourseTheme = "D" | "A" | "B" | "C";

export interface CourseRecommendation {
  theme: CourseTheme;
  className: string;
  duration: string;
  subLabel: string;
  intro: string;
  feature1: string;
  feature2: string;
}

export function getScoreBand(score: number): ScoreBand {
  if (score < 15) return "Below 15";
  if (score < 30) return "15 - 30";
  if (score < 42) return "30 - 42";
  if (score < 50) return "42 - 50";
  if (score < 58) return "50 - 58";
  return "58+";
}

export function getScoreBandLabel(scoreBand: ScoreBand): string {
  switch (scoreBand) {
    case "Below 15":
      return "15分以下";
    case "15 - 30":
      return "15-30分";
    case "30 - 42":
      return "30-42分";
    case "42 - 50":
      return "42-50分";
    case "50 - 58":
      return "50-58分";
    default:
      return "58分以上";
  }
}

export function getCourseRecommendation(
  scoreBand: ScoreBand
): CourseRecommendation {
  switch (scoreBand) {
    case "Below 15":
      return {
        theme: "D",
        className: "诊断班",
        duration: "1-2 周入门诊断",
        subLabel: "先诊断 · 再分班",
        intro:
          "适合当前答题结果低、存在猜题成分。该成绩暂时不适合直接进入常规提分班，更需要先做基础诊断与学习衔接。",
        feature1:
          "先排查词汇、基础语法、阅读理解和听辨能力，快速判断学生当前最核心的短板在哪里。",
        feature2:
          "建议先进行短期诊断与入门训练，再根据实际表现决定进入基础班或专项辅导。",
      };

    case "15 - 30":
      return {
        theme: "D",
        className: "入门班",
        duration: "8-10 周入门课",
        subLabel: "先建立最基础能力",
        intro:
          "适合有少量基础、但整体能力非常薄弱的学生。这个阶段重点不是冲分，而是先把最基础的做题能力和理解能力建立起来。",
        feature1:
          "课程会从高频基础词汇、核心语法、句子理解和基础听力识别开始，帮助学生先听懂、读懂、做对基础题。",
        feature2:
          "配套更细的练习节奏和阶段跟进，帮助学生先脱离乱做、乱猜状态，再逐步进入标准提分路径。",
      };

    case "30 - 42":
      return {
        theme: "A",
        className: "基础班",
        duration: "8 周体系课",
        subLabel: "基础重建 · 稳步补强",
        intro:
          "适合基础薄弱、三科整体不稳的学生，先把底层能力补起来，再进入更高档位训练。",
        feature1:
          "从高频词汇、基础语法、听力识别入手，优先修正最容易拖分的核心问题。",
        feature2:
          "课程节奏更稳，配套阶段练习与老师跟进，帮助学生建立持续做题能力与正确习惯。",
      };

    case "42 - 50":
      return {
        theme: "B",
        className: "提升班",
        duration: "6-8 周强化课",
        subLabel: "稳基础 · 过线提升",
        intro:
          "适合已有一定基础、接近 50 但表现还不稳定的学生，重点是把分数先稳住。",
        feature1:
          "围绕高频题型、做题结构和输出稳定性展开训练，减少忽高忽低的情况。",
        feature2:
          "课程会同时补基础与控节奏，帮助学生把已有能力真正转化为更稳定的分数表现。",
      };

    case "50 - 58":
      return {
        theme: "B",
        className: "桥梁班",
        duration: "6 周进阶课",
        subLabel: "补短板 · 冲主流分",
        intro:
          "适合已经具备一定过线潜力、但还需要继续补短板和提升稳定性的学生。",
        feature1:
          "重点处理拉分板块，强化题型策略、时间控制与中高分段作答稳定度。",
        feature2:
          "通过专项训练与阶段模考，把原本接近目标的学生往更高区间继续推进。",
      };

    default:
      return {
        theme: "C",
        className: "冲刺班",
        duration: "4-6 周冲刺课",
        subLabel: "冲高分 · 提速提稳",
        intro:
          "适合基础已成型的学生，主要目标不是重补基础，而是进一步提速、提稳、冲高分。",
        feature1:
          "课程聚焦高频失分点、答题效率与临场稳定性，帮助学生把能力发挥得更完整。",
        feature2:
          "更强调模考节奏、错题精修与冲刺策略，适合已经进入高分段的学生继续突破。",
      };
  }
}

export function getScoreProjection(score: number) {
  const scoreBand = getScoreBand(score);
  const scoreBandLabel = getScoreBandLabel(scoreBand);
  const courseRecommendation = getCourseRecommendation(scoreBand);

  return {
    scoreBand,
    scoreBandLabel,
    courseRecommendation,
  };
}