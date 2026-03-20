"use client";

import { useState } from "react";
import styles from "./PreTestIntro.module.css";

type 考试类型 = "quick" | "full" | "";

type PreTestIntroProps = {
  onComplete: (payload: {
    studentName: string;
    targetScore: string;
    selectedExam: Exclude<考试类型, "">;
  }) => void;
};

export default function PreTestIntro({ onComplete }: PreTestIntroProps) {
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [selectedExam, setSelectedExam] = useState<考试类型>("");

  const handleNext = () => {
    if (step === 1 && !studentName.trim()) return;
    if (step === 2 && !targetScore.trim()) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSelectExam = (exam: 考试类型) => {
    setSelectedExam(exam);
  };

  const handleStart = () => {
    if (!studentName.trim()) return;
    if (!targetScore.trim()) return;
    if (!selectedExam) return;

    onComplete({
      studentName: studentName.trim(),
      targetScore: targetScore.trim(),
      selectedExam,
    });
  };

  const getStepTitle = () => {
    if (step === 1) return "请输入你的姓名";
    if (step === 2) return "请输入你的目标分数";
    return "请选择考试类型";
  };

  const getStepDesc = () => {
    if (step === 1) {
      return "开始测试前，请先填写姓名。结果页会显示你的姓名和当天日期。";
    }
    if (step === 2) {
      return "请输入你的目标分数，方便后续更清楚地展示你的测评结果。";
    }
    return "请选择你要参加的考试类型，系统会根据你的选择进入对应流程。";
  };

  const getStepLabel = () => {
    return `第 ${step} 步，共 3 步`;
  };

  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.step}>{getStepLabel()}</div>

          <h1 className={styles.title}>{getStepTitle()}</h1>

          <p className={styles.desc}>{getStepDesc()}</p>

          {step === 1 && (
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type="text"
                placeholder="请输入你的姓名"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type="text"
                placeholder="例如：50 / 58 / 65 / 79"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
              />
            </div>
          )}

          {step === 3 && (
            <div className={styles.optionGrid}>
              <button
                type="button"
                className={`${styles.optionCard} ${
                  selectedExam === "quick" ? styles.optionCardActive : ""
                }`}
                onClick={() => handleSelectExam("quick")}
              >
                <div className={styles.optionTitle}>快速测试</div>
                <div className={styles.optionDesc}>
                  用较短时间完成基础测评，适合快速初筛。
                </div>
              </button>

              <button
                type="button"
                className={`${styles.optionCard} ${
                  selectedExam === "full" ? styles.optionCardActive : ""
                }`}
                onClick={() => handleSelectExam("full")}
              >
                <div className={styles.optionTitle}>完整测试</div>
                <div className={styles.optionDesc}>
                  进入完整测评流程，适合正式分班与能力判断。
                </div>
              </button>
            </div>
          )}

          <div className={styles.footer}>
            <button
              className={styles.backBtn}
              type="button"
              onClick={handleBack}
              disabled={step === 1}
            >
              上一步
            </button>

            {step < 3 ? (
              <button className={styles.btn} type="button" onClick={handleNext}>
                下一步
              </button>
            ) : (
              <button
                className={styles.btn}
                type="button"
                disabled={!selectedExam}
                onClick={handleStart}
              >
                开始测试
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}