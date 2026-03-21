"use client";

import styles from "./ResultScreen.module.css";
import type { ResultScreenProps } from "@/lib/types/resultTypes";

export default function ResultScreen({
  score,
  difficultyStats,
  readingStats,
  listeningStats,
  studentName,
  targetScore,
  testDate,
  onRestart,
}: ResultScreenProps) {
  const toPercent = (correct: number, totalCount: number) => {
    if (!totalCount) return 0;
    return Math.round((correct / totalCount) * 100);
  };

  const foundationA = toPercent(
    difficultyStats.A.correct,
    difficultyStats.A.total
  );
  const foundationB = toPercent(
    difficultyStats.B.correct,
    difficultyStats.B.total
  );
  const foundationC = toPercent(
    difficultyStats.C.correct,
    difficultyStats.C.total
  );
  const foundationScore = Math.round(
    (foundationA + foundationB + foundationC) / 3
  );

  const transitionA = 0;
  const transitionB = toPercent(readingStats.B.correct, readingStats.B.total);
  const transitionC = toPercent(readingStats.C.correct, readingStats.C.total);
  const transitionScore = Math.round(
    (transitionA + transitionB + transitionC) / 3
  );

  const listeningA = toPercent(
    listeningStats.A.correct,
    listeningStats.A.total
  );
  const listeningB = toPercent(
    listeningStats.B.correct,
    listeningStats.B.total
  );
  const listeningC = toPercent(
    listeningStats.C.correct,
    listeningStats.C.total
  );
  const listeningScore = Math.round(
    (listeningA + listeningB + listeningC) / 3
  );

  const scoreBand =
    score < 42 ? "30 - 42" : score < 50 ? "42 - 50" : score < 58 ? "50 - 58" : "58+";

  const courseRecommendation = (() => {
    switch (scoreBand) {
      case "30 - 42":
        return {
          className: "A 基础班",
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
          className: "B 提升班",
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
          className: "B 提升班",
          duration: "6 周进阶课",
          subLabel: "补短板 · 稳输出",
          intro:
            "适合已经具备过线潜力、但还需要继续补短板和提升稳定性的学生。",
          feature1:
            "重点处理拉分板块，强化题型策略、时间控制与中高分段作答稳定度。",
          feature2:
            "通过专项训练与阶段模考，把原本接近目标的学生往更高区间继续推进。",
        };

      default:
        return {
          className: "C 冲刺班",
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
  })();

  const numericTarget = Number(targetScore || 0);
  const hasTarget = Number.isFinite(numericTarget) && numericTarget > 0;
  const rawGap = hasTarget ? numericTarget - score : null;

  const gapDisplay =
    rawGap === null
      ? "未计算"
      : rawGap > 0
      ? `差 ${rawGap} 分`
      : rawGap < 0
      ? `超出 ${Math.abs(rawGap)} 分`
      : "已达目标";

  let predictionLabel = "较低";
  let predictionPercent = 35;

  if (rawGap !== null) {
    if (rawGap <= 5) {
      predictionLabel = "较高";
      predictionPercent = 78;
    } else if (rawGap <= 10) {
      predictionLabel = "中等";
      predictionPercent = 62;
    } else if (rawGap <= 20) {
      predictionLabel = "一般";
      predictionPercent = 48;
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <div className={styles.brand}>测评结果总览</div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.pill}>学生：{studentName || "未填写"}</div>
          <div className={styles.pill}>日期：{testDate}</div>
        </div>
      </header>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.stack}>
            <div className={styles.panelCard}>
              <div className={styles.sectionKicker}>测评结果投射</div>

              <div className={styles.scoreGrid}>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreBox}>{scoreBand}</div>
                  <div className={styles.scoreMeta}>
                    <h4>当前预估表现</h4>
                    <p>基于本次测评答题表现映射得到的当前分数区间参考。</p>
                  </div>
                </div>

                <div className={styles.scoreRow}>
                  <div className={styles.scoreBox}>{targetScore || "未填写"}</div>
                  <div className={styles.scoreMeta}>
                    <h4>目标分数</h4>
                    <p>学生当前希望达到的目标分，用于判断提升空间。</p>
                  </div>
                </div>

                <div className={styles.scoreRow}>
                  <div className={`${styles.scoreBox} ${styles.redText}`}>
                    {gapDisplay}
                  </div>
                  <div className={styles.scoreMeta}>
                    <h4>目标差距</h4>
                    <p>目标分数与当前预估分数之间的实际差值。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.panelCard}>
              <div className={styles.sectionKicker}>推荐班级方案</div>

              <div className={styles.pathList}>
                <div className={styles.pathStep}>
                  <strong>{courseRecommendation.className}</strong>
                  <span>
                    {courseRecommendation.duration} · {courseRecommendation.subLabel}
                  </span>
                </div>

                <div className={styles.pathStep}>
                  <strong>班级定位</strong>
                  <span>{courseRecommendation.intro}</span>
                </div>

                <div className={styles.pathStep}>
                  <strong>课程特点 01</strong>
                  <span>{courseRecommendation.feature1}</span>
                </div>

                <div className={styles.pathStep}>
                  <strong>课程特点 02</strong>
                  <span>{courseRecommendation.feature2}</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaWrap}>
              <div className={styles.ctaNote}>推荐下一步</div>
              <button className={styles.cta} type="button">
                进入系统提升课程
              </button>
              <button className={styles.cta} type="button" onClick={onRestart}>
                重新测试
              </button>
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroMain}>
              <div className={styles.heroHighlight}>
                <div className={styles.heroHighlightKicker}>提升概率</div>
                <div className={styles.heroHighlightSub}>
                  完成系统训练后的预估表现
                </div>
                <div className={styles.heroHighlightValue}>
                  {predictionLabel}（{predictionPercent}%）
                </div>
              </div>

              <div className={styles.heroText}>
                <h1>能力分析与提升预测</h1>
                <p>
                  这个结果页用于把原始测试结果转化为更清晰的能力区间、差距判断和后续建议，方便沟通分班与课程推荐。
                </p>
              </div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>基础稳定度</div>
                <div className={styles.miniTag}>评分指数</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.orangeText}`}>
                {foundationScore}
              </div>
              <div className={styles.metricStatus}>低于目标稳定区间</div>
              <div className={styles.metricDesc}>
                用于衡量学生在基础词汇与语法响应上的整体稳定程度。
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: `${foundationA}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{foundationA}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${foundationB}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{foundationB}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${foundationC}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{foundationC}%</div>
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>过渡能力</div>
                <div className={styles.miniTag}>评分指数</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.redText}`}>
                {transitionScore}
              </div>
              <div className={styles.metricStatus}>当前升级能力受阻</div>
              <div className={styles.metricDesc}>
                用于判断学生是否能把基础语言能力转化为更高分段的作答表现。
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: `${transitionA}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{transitionA}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${transitionB}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{transitionB}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${transitionC}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{transitionC}%</div>
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>听力识别</div>
                <div className={styles.miniTag}>评分指数</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.redText}`}>
                {listeningScore}
              </div>
              <div className={styles.metricStatus}>检测到明显短板</div>
              <div className={styles.metricDesc}>
                用于评估学生在限时条件下的实时听辨与信息捕捉能力。
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${listeningA}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{listeningA}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${listeningB}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{listeningB}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${listeningC}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{listeningC}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <div className={styles.summaryCard}>
              <h3>测评总结</h3>
              <p>
                当前学生仍处于基础能力搭建阶段，主要短板集中在听力识别与高分段转化能力。若目标是达到更高分数，建议先补强听力基础，再进入结构化作答训练，最后再通过模考与精修完成冲分。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}