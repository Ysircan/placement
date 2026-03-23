"use client";

import styles from "./ResultScreen.module.css";
import type { ResultScreenProps } from "@/lib/types/resultTypes";
import { getScoreProjection } from "@/lib/placement/resultBand";
import {
  getSectionDiagnosis,
  type DifficultyDistribution,
} from "@/lib/placement/resultDiagnosis";

function getBandRangeFromScore(score: number) {
  if (score < 15) return { min: 0, max: 15 };
  if (score < 30) return { min: 15, max: 30 };
  if (score < 42) return { min: 30, max: 42 };
  if (score < 50) return { min: 42, max: 50 };
  if (score < 58) return { min: 50, max: 58 };
  return { min: 58, max: null as number | null };
}

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
  const { scoreBandLabel, courseRecommendation } = getScoreProjection(score);

const normalizedReadingStats: DifficultyDistribution = {
  A: readingStats.A ?? { correct: 0, total: 0 },
  B: readingStats.B ?? { correct: 0, total: 0 },
  C: readingStats.C ?? { correct: 0, total: 0 },
};
  const foundationDiagnosis = getSectionDiagnosis(
    "foundation",
    difficultyStats
  );
  const readingDiagnosis = getSectionDiagnosis(
    "reading",
    normalizedReadingStats
  );
  const listeningDiagnosis = getSectionDiagnosis("listening", listeningStats);

  const numericTarget = Number(targetScore);
  const hasTarget = Number.isFinite(numericTarget) && numericTarget > 0;
  const rawGap = hasTarget ? numericTarget - score : null;

  // 直接根据 score 算区间，不再依赖 scoreBandLabel 文案格式
  const bandRange = getBandRangeFromScore(score);

  const gapDisplay =
    !hasTarget
      ? "未计算"
      : bandRange.max === null
      ? numericTarget <= bandRange.min
        ? "0分"
        : `差${numericTarget - bandRange.min}分以上`
      : numericTarget <= bandRange.min
      ? "0分"
      : numericTarget <= bandRange.max
      ? `差0-${numericTarget - bandRange.min}分`
      : `差${numericTarget - bandRange.max}-${numericTarget - bandRange.min}分`;

  const shortTermSuggestion =
    !hasTarget || rawGap === null
      ? "待确认目标"
      : rawGap <= 10
      ? "可冲目标"
      : rawGap <= 15
      ? "有机会接近"
      : rawGap <= 20
      ? "先提一档"
      : "分阶段提升";

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
                  <div className={styles.scoreBox}>{scoreBandLabel}</div>
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

                <div className={`${styles.scoreRow} ${styles.scoreRowTight}`}>
                <div className={`${styles.scoreBox} ${styles.redText} ${styles.scoreBoxGap}`}>
  {gapDisplay}
</div>
                  <div className={styles.scoreMeta}>
                    <h4>目标差距</h4>
                    <p>目标分数与当前预估区间之间的参考差距。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.panelCard}>
              <div className={styles.sectionKicker}>推荐班级方案</div>

              <div
                className={`${styles.courseCard} ${
                  courseRecommendation.theme === "D"
                    ? styles.courseD
                    : courseRecommendation.theme === "A"
                    ? styles.courseA
                    : courseRecommendation.theme === "B"
                    ? styles.courseB
                    : styles.courseC
                }`}
              >
                <div className={styles.courseHeader}>
                  <div className={styles.courseHeaderMain}>
                    <h3 className={styles.courseName}>
                      {courseRecommendation.className}
                    </h3>
                    <p className={styles.courseSubtitle}>
                      {courseRecommendation.subLabel}
                    </p>
                  </div>

                  <div className={styles.courseMeta}>
                    {courseRecommendation.duration}
                  </div>
                </div>

                <div className={styles.courseDivider} />

                <div className={styles.courseSection}>
                  <div className={styles.courseSectionLabel}>班级定位</div>
                  <p className={styles.courseText}>{courseRecommendation.intro}</p>
                </div>

                <div className={styles.courseSection}>
                  <div className={styles.courseSectionLabel}>课程特点</div>

                  <div className={styles.courseFeatures}>
                    <div className={styles.courseFeature}>
                      {courseRecommendation.feature1}
                    </div>
                    <div className={styles.courseFeature}>
                      {courseRecommendation.feature2}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.ctaWrap}>
              <div className={styles.ctaNote}>推荐下一步</div>
              <button className={styles.cta} type="button" onClick={onRestart}>
                重新测试
              </button>
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroMain}>
              <div className={styles.heroText}>
                <h1>能力分析与短期提升评估</h1>
              </div>

              <div className={styles.heroHighlight}>
                <div className={styles.heroHighlightText}>
                  <div className={styles.heroHighlightKicker}>短期冲分建议</div>
                  <div className={styles.heroHighlightSub}>
                    结合当前表现与目标差距，短期内更现实的提升方向
                  </div>
                </div>

                <div className={styles.heroHighlightValue}>
                  {shortTermSuggestion}
                </div>
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
                {foundationDiagnosis.overallPercent}
              </div>
              <div className={styles.metricStatus}>
                {foundationDiagnosis.title}
              </div>
              <div className={styles.metricDesc}>
                {foundationDiagnosis.description}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: `${foundationDiagnosis.aPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>
                    {foundationDiagnosis.aPercent}%
                  </div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${foundationDiagnosis.bPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>
                    {foundationDiagnosis.bPercent}%
                  </div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${foundationDiagnosis.cPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>
                    {foundationDiagnosis.cPercent}%
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>阅读处理</div>
                <div className={styles.miniTag}>评分指数</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.redText}`}>
                {readingDiagnosis.overallPercent}
              </div>
              <div className={styles.metricStatus}>{readingDiagnosis.title}</div>
              <div className={styles.metricDesc}>
                {readingDiagnosis.description}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: `${readingDiagnosis.aPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{readingDiagnosis.aPercent}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${readingDiagnosis.bPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{readingDiagnosis.bPercent}%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${readingDiagnosis.cPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>{readingDiagnosis.cPercent}%</div>
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>听力识别</div>
                <div className={styles.miniTag}>评分指数</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.redText}`}>
                {listeningDiagnosis.overallPercent}
              </div>
              <div className={styles.metricStatus}>
                {listeningDiagnosis.title}
              </div>
              <div className={styles.metricDesc}>
                {listeningDiagnosis.description}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${listeningDiagnosis.aPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>
                    {listeningDiagnosis.aPercent}%
                  </div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: `${listeningDiagnosis.bPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>
                    {listeningDiagnosis.bPercent}%
                  </div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: `${listeningDiagnosis.cPercent}%` }}
                    />
                  </div>
                  <div className={styles.pct}>
                    {listeningDiagnosis.cPercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomGrid}></div>
        </section>
      </div>
    </div>
  );
}