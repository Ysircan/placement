"use client";

import styles from "./ResultScreen.module.css";

type Difficulty = "A" | "B" | "C";

type DifficultyBucket = {
  correct: number;
  total: number;
};

type DifficultyDistribution = Record<Difficulty, DifficultyBucket>;

type ResultScreenProps = {
  score: number;
  total: number;
  level?: string;
  difficultyStats: DifficultyDistribution;
  readingStats: DifficultyDistribution;
  listeningStats: DifficultyDistribution;
  studentName?: string;
  targetScore?: string;
  testDate?: string;
  selectedExam?: string;
  onRestart: () => void;
};

type ShortTermSuggestion = {
  label: string;
  description: string;
};

function toPercent(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function getScoreBand(score: number) {
  if (score < 15) return "Below 15";
  if (score < 30) return "15 - 30";
  if (score < 42) return "30 - 42";
  if (score < 50) return "42 - 50";
  if (score < 58) return "50 - 58";
  return "58+";
}

function getParsedTargetScore(targetScore?: string) {
  if (!targetScore) return null;
  const parsed = Number(targetScore);
  return Number.isFinite(parsed) ? parsed : null;
}

function getGapDisplay(score: number, targetScore?: string) {
  const parsedTarget = getParsedTargetScore(targetScore);

  if (parsedTarget === null) {
    return "—";
  }

  const gap = Math.max(0, parsedTarget - score);
  return `${gap} 分`;
}

function getRawGap(score: number, targetScore?: string) {
  const parsedTarget = getParsedTargetScore(targetScore);

  if (parsedTarget === null) {
    return null;
  }

  return Math.max(0, parsedTarget - score);
}

function getShortTermSuggestion(rawGap: number | null): ShortTermSuggestion {
  if (rawGap === null) {
    return {
      label: "待确认目标",
      description: "填写目标分数后，系统会给出更明确的短期冲分建议。",
    };
  }

  if (rawGap <= 10) {
    return {
      label: "可冲目标",
      description:
        "当前表现已经接近目标要求，短期内更适合通过系统训练稳定发挥并冲击目标分。",
    };
  }

  if (rawGap <= 15) {
    return {
      label: "有机会接近",
      description:
        "目前已经具备一定基础，完成系统训练后，短期内有机会进一步向目标分靠近。",
    };
  }

  if (rawGap <= 20) {
    return {
      label: "先提一档",
      description:
        "以当前表现来看，短期内更现实的方向是先完成一档提升，稳住核心板块后再继续向目标推进。",
    };
  }

  return {
    label: "分阶段提升",
    description:
      "当前与目标分仍有一定距离，短期内更适合先补强基础与薄弱板块，再逐步推进到更高分数区间。",
  };
}

function getOverallAccuracy(distribution: DifficultyDistribution) {
  const correct =
    distribution.A.correct + distribution.B.correct + distribution.C.correct;
  const total =
    distribution.A.total + distribution.B.total + distribution.C.total;

  return toPercent(correct, total);
}

function getActiveLevels(distribution: DifficultyDistribution) {
  return (["A", "B", "C"] as const).filter(
    (level) => distribution[level].total > 0
  );
}

function getSectionCopy(
  section: "foundation" | "reading" | "listening",
  overallPercent: number
) {
  if (section === "foundation") {
    if (overallPercent >= 70) {
      return {
        title: "基础板块整体较稳",
        description:
          "学生在基础词义、常见搭配与基础语法上的整体表现较稳定，说明底层语言基础已经具备一定支撑力。",
        suggestion:
          "建议继续保持基础正确率，同时把训练重心逐步转向更高阶的应用与稳定输出。",
      };
    }

    if (overallPercent >= 40) {
      return {
        title: "基础能力已有雏形",
        description:
          "学生并非完全缺乏基础，但当前正确率还不够稳定，说明知识点掌握存在波动。",
        suggestion:
          "建议通过高频词汇、核心句型和基础理解训练，把基础从“会一点”提升到“做得稳”。",
      };
    }

    return {
      title: "基础层仍是主要短板",
      description:
        "学生在基础词义、常见规则和句子理解层面的表现偏弱，这会直接影响后续中高难度题型的发挥。",
      suggestion:
        "建议优先补基础词汇、基础语法和常见句型理解，不要急着直接冲高难题。",
    };
  }

  if (section === "reading") {
    if (overallPercent >= 70) {
      return {
        title: "阅读板块整体较稳",
        description:
          "学生在信息定位、句意理解和逻辑处理上的整体表现较稳定，说明阅读能力已经具备较好的支撑基础。",
        suggestion:
          "建议继续保持稳定度，并逐步把训练重点放到高阶逻辑与阅读速度提升上。",
      };
    }

    if (overallPercent >= 40) {
      return {
        title: "阅读能力已有基础，但稳定性一般",
        description:
          "学生不是完全读不懂，但在复杂结构、逻辑连接或时间压力下仍容易出现波动。",
        suggestion:
          "建议通过定位、逻辑关系和段落结构训练，把阅读节奏与准确率进一步做稳。",
      };
    }

    return {
      title: "阅读整体处理偏弱",
      description:
        "学生在信息定位、基础理解和逻辑判断上的整体正确率偏低，说明当前阅读板块仍需要系统补强。",
      suggestion:
        "建议先从基础阅读理解、信息定位与常规逻辑关系训练开始，逐步建立阅读稳定度。",
    };
  }

  if (overallPercent >= 70) {
    return {
      title: "听力板块整体较稳",
      description:
        "学生在基础听辨、信息捕捉和中高层处理上的整体表现较稳定，说明听力板块已经具备较好的能力基础。",
      suggestion:
        "建议继续保持听力稳定度，并进一步强化高阶细节和速度适应能力。",
    };
  }

  if (overallPercent >= 40) {
    return {
      title: "听力有一定基础，但不够稳",
      description:
        "学生已经具备一定听力基础，但在信息密度上来之后，仍容易出现漏听、误判或反应变慢。",
      suggestion:
        "建议通过更多分层练习，把听力识别从“能听到一些”提升到“能稳定做对”。",
    };
  }

  return {
    title: "听力整体识别偏弱",
    description:
      "学生在基础听辨、关键词抓取和更复杂信息处理上的整体表现偏低，说明当前听力板块还需要继续打底。",
    suggestion:
      "建议先从基础听辨、关键词识别和简单信息抓取开始，逐步建立听力稳定度。",
  };
}

function SectionCard({
  section,
  title,
  distribution,
}: {
  section: "foundation" | "reading" | "listening";
  title: string;
  distribution: DifficultyDistribution;
}) {
  const overallPercent = getOverallAccuracy(distribution);
  const activeLevels = getActiveLevels(distribution);
  const copy = getSectionCopy(section, overallPercent);

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionEyebrow}>{title}</div>
          <h3 className={styles.sectionTitle}>{copy.title}</h3>
        </div>
        <div className={styles.sectionScore}>{overallPercent}%</div>
      </div>

      <p className={styles.sectionDescription}>{copy.description}</p>

      <div className={styles.levelList}>
        {activeLevels.map((level) => {
          const stat = distribution[level];
          const percent = toPercent(stat.correct, stat.total);

          return (
            <div key={level} className={styles.levelRow}>
              <div className={styles.levelLabel}>{level}</div>

              <div className={styles.levelBarTrack}>
                <div
                  className={styles.levelBarFill}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className={styles.levelValue}>
                {stat.correct}/{stat.total}
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.sectionSuggestion}>{copy.suggestion}</p>
    </section>
  );
}

export default function ResultScreen({
  score,
  total,
  difficultyStats,
  readingStats,
  listeningStats,
  studentName,
  targetScore,
  testDate,
  selectedExam,
  onRestart,
}: ResultScreenProps) {
  const currentBand = getScoreBand(score);
  const rawGap = getRawGap(score, targetScore);
  const gapDisplay = getGapDisplay(score, targetScore);
  const shortTermSuggestion = getShortTermSuggestion(rawGap);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.heroText}>
              <div className={styles.heroKicker}>Placement Result</div>
              <h1>能力分析与短期提升评估</h1>
              <p className={styles.heroSub}>
                结合当前表现与目标差距，系统给出更适合当前阶段的短期冲分建议。
              </p>
            </div>

            <div className={styles.heroHighlight}>
              <div className={styles.heroHighlightText}>
                <div className={styles.heroHighlightKicker}>短期冲分建议</div>
                <div className={styles.heroHighlightSub}>
                  只显示结论，不再显示容易失真的单点概率
                </div>
              </div>

              <div className={styles.heroHighlightValue}>
                {shortTermSuggestion.label}
              </div>
            </div>
          </div>

          <div className={styles.heroDesc}>{shortTermSuggestion.description}</div>
        </section>

        <section className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>当前预估表现</div>
            <div className={styles.metricValue}>{currentBand}</div>
            <div className={styles.metricHint}>
              原始得分 {score}/{total}
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>目标分数</div>
            <div className={styles.metricValue}>{targetScore || "—"}</div>
            <div className={styles.metricHint}>学生填写目标</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>目标差距</div>
            <div className={styles.metricValue}>{gapDisplay}</div>
            <div className={styles.metricHint}>当前预估与目标之间的差距</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>测试信息</div>
            <div className={styles.metricValue}>{selectedExam || "quick"}</div>
            <div className={styles.metricHint}>
              {studentName || "Student"} · {testDate || "—"}
            </div>
          </div>
        </section>

        <section className={styles.sectionGrid}>
          <SectionCard
            section="foundation"
            title="Vocabulary / Foundation"
            distribution={difficultyStats}
          />

          <SectionCard
            section="reading"
            title="Reading"
            distribution={readingStats}
          />

          <SectionCard
            section="listening"
            title="Listening"
            distribution={listeningStats}
          />
        </section>

        <div className={styles.footer}>
          <button className={styles.restartBtn} onClick={onRestart}>
            Restart Test
          </button>
        </div>
      </div>
    </main>
  );
}