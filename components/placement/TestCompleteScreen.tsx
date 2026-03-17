type TestCompleteScreenProps = {
  onViewResults: () => void;
};

export function TestCompleteScreen({ onViewResults }: TestCompleteScreenProps) {
  return (
    <div className="space-y-5 text-center font-sans text-gray-900">
      <h2 className="text-3xl font-semibold text-gray-900">Test Completed</h2>
      <p className="text-base text-gray-700">You have finished all questions.</p>
      <button
        className="rounded-lg border border-blue-300 bg-blue-100 px-5 py-2.5 font-medium text-gray-900 hover:bg-blue-200"
        onClick={onViewResults}
        type="button"
      >
        View Results
      </button>
    </div>
  );
}
