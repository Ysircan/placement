type ProgressBarProps = {
  sectionName: string;
  currentQuestion: number;
  totalQuestions: number;
};

export function ProgressBar({
  currentQuestion,
  sectionName,
  totalQuestions,
}: ProgressBarProps) {
  const widthPercent = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900">
        {sectionName} - 第 {currentQuestion} 题 / 共 {totalQuestions} 题
      </p>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
}
