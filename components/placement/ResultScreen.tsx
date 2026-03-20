"use client";

import styles from "./ResultScreen.module.css";
import type { ResultScreenProps } from "@/lib/types/resultTypes";

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

  const examLabelMap: Record<string, string> = {
    quick10: "快速10分钟",
    standard1h: "标准1小时",
    overview: "PTE概览",
    mock: "PTE测试",
  };

  const examLabel = examLabelMap[selectedExam] ?? "未选择考试";

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
                  <div className={styles.scoreBox}>
                    {score} / {total}
                  </div>
                  <div className={styles.scoreMeta}>
                    <h4>当前预估表现</h4>
                    <p>基于本次测评答题表现得到的当前能力区间参考。</p>
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
                    {examLabel}
                  </div>
                  <div className={styles.scoreMeta}>
                    <h4>考试入口</h4>
                    <p>当前学生选择进入的测试路径或考试模式。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.panelCard}>
              <div className={styles.sectionKicker}>推荐学习路径</div>

              <div className={styles.pathList}>
                <div className={styles.pathStep}>
                  <strong>第一阶段：听力基础</strong>
                  <span>
                    4周 · 提升识别准确率、语块捕捉能力与熟悉模式恢复能力
                  </span>
                </div>

                <div className={styles.pathStep}>
                  <strong>第二阶段：结构与作答控制</strong>
                  <span>
                    4周 · 强化句子响应、结构稳定性与分数转化能力
                  </span>
                </div>

                <div className={styles.pathStep}>
                  <strong>第三阶段：模考与精修</strong>
                  <span>
                    2周 · 定向纠错、时间控制与最后冲分
                  </span>
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
                <div className={styles.heroHighlightValue}>较高（78%）</div>
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