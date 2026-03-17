"use client";

import styles from "./ResultScreen.module.css";

export default function ResultScreen() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <div className={styles.brand}>English Diagnostic Dashboard</div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.pill}>Student: Li Wei</div>
          <div className={styles.pill}>Session: Mar 09</div>
        </div>
      </header>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.stack}>
            <div className={styles.panelCard}>
              <div className={styles.sectionKicker}>Diagnostic Projection</div>

              <div className={styles.scoreGrid}>
                <div className={styles.scoreRow}>
                  <div className={styles.scoreBox}>50–55</div>
                  <div className={styles.scoreMeta}>
                    <h4>Estimated Score Range</h4>
                    <p>
                      Current projected performance band based on the
                      diagnostic response pattern.
                    </p>
                  </div>
                </div>

                <div className={styles.scoreRow}>
                  <div className={styles.scoreBox}>65+</div>
                  <div className={styles.scoreMeta}>
                    <h4>Target Requirement</h4>
                    <p>
                      Recommended score threshold for the student&apos;s current
                      study objective.
                    </p>
                  </div>
                </div>

                <div className={styles.scoreRow}>
                  <div className={`${styles.scoreBox} ${styles.redText}`}>
                    15–20
                  </div>
                  <div className={styles.scoreMeta}>
                    <h4>Improvement Gap</h4>
                    <p>
                      Estimated score increase required before the student is
                      target-ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.panelCard}>
              <div className={styles.sectionKicker}>Recommended Path</div>

              <div className={styles.pathList}>
                <div className={styles.pathStep}>
                  <strong>Phase 1 — Listening Foundation</strong>
                  <span>
                    4 weeks · recognition accuracy, chunk tracking, familiar
                    pattern recovery
                  </span>
                </div>

                <div className={styles.pathStep}>
                  <strong>Phase 2 — Structure &amp; Response Control</strong>
                  <span>
                    4 weeks · sentence response, pattern stability, score
                    conversion ability
                  </span>
                </div>

                <div className={styles.pathStep}>
                  <strong>Phase 3 — Mock &amp; Refinement</strong>
                  <span>
                    2 weeks · targeted correction, timing control, final score
                    lift
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.ctaWrap}>
              <div className={styles.ctaNote}>Recommended next step</div>
              <button className={styles.cta} type="button">
                Enroll in Structured Upgrade Program
              </button>
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.hero}>
            <div className={styles.heroMain}>
              <div className={styles.heroHighlight}>
                <div className={styles.heroHighlightKicker}>
                  Upgrade Probability
                </div>
                <div className={styles.heroHighlightSub}>
                  After structured training program
                </div>
                <div className={styles.heroHighlightValue}>High (78%)</div>
              </div>

              <div className={styles.heroText}>
                <h1>Performance Analysis &amp; Upgrade Projection</h1>
                <p>
                  This dashboard is designed to support enrolment conversations
                  by turning raw test results into a clear performance range,
                  gap estimate, and recommended training path.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>Foundation Stability</div>
                <div className={styles.miniTag}>Score Index</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.orangeText}`}>
                50
              </div>
              <div className={styles.metricStatus}>
                Below Target Stability Range
              </div>
              <div className={styles.metricDesc}>
                Measures the consistency of the student&apos;s base vocabulary
                and grammar response pattern.
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: "50%" }}
                    />
                  </div>
                  <div className={styles.pct}>50%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: "13%" }}
                    />
                  </div>
                  <div className={styles.pct}>13%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: "33%" }}
                    />
                  </div>
                  <div className={styles.pct}>33%</div>
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>Transition Readiness</div>
                <div className={styles.miniTag}>Score Index</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.redText}`}>
                13
              </div>
              <div className={styles.metricStatus}>
                Level Progression Currently Blocked
              </div>
              <div className={styles.metricDesc}>
                Indicates whether the student can convert basic language ability
                into higher-score responses.
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillGreen}`}
                      style={{ width: "50%" }}
                    />
                  </div>
                  <div className={styles.pct}>50%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: "13%" }}
                    />
                  </div>
                  <div className={styles.pct}>13%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: "33%" }}
                    />
                  </div>
                  <div className={styles.pct}>33%</div>
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricTitle}>Listening Recognition</div>
                <div className={styles.miniTag}>Score Index</div>
              </div>

              <div className={`${styles.metricNumber} ${styles.redText}`}>
                18
              </div>
              <div className={styles.metricStatus}>Critical Gap Detected</div>
              <div className={styles.metricDesc}>
                Evaluates real-time listening capture and the ability to
                identify meaning under timed conditions.
              </div>

              <div className={styles.divider}></div>

              <div className={styles.barStack}>
                <div className={styles.barRow}>
                  <div className={styles.grade}>A</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: "22%" }}
                    />
                  </div>
                  <div className={styles.pct}>22%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>B</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillRed}`}
                      style={{ width: "15%" }}
                    />
                  </div>
                  <div className={styles.pct}>15%</div>
                </div>

                <div className={styles.barRow}>
                  <div className={styles.grade}>C</div>
                  <div className={styles.track}>
                    <div
                      className={`${styles.fill} ${styles.fillOrange}`}
                      style={{ width: "0%" }}
                    />
                  </div>
                  <div className={styles.pct}>0%</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <div className={styles.summaryCard}>
              <h3>Diagnostic Summary</h3>
              <p>
                The student is currently operating in the 50–55 range, with the
                biggest gap appearing in listening recognition and score
                transition ability. This means the student is not yet ready for
                a 65+ target without guided intervention. A structured program
                should focus first on listening foundation, then on response
                control, before moving into mock-based refinement.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}