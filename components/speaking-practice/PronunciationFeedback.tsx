import type {
  IncorrectCharacter,
  PronunciationCheckResponse,
} from "@/lib/speaking-practice/api";

type PronunciationFeedbackProps = {
  result: PronunciationCheckResponse;
  onTryAgain: () => void;
  onListenNormal: () => void;
  onListenSlow: () => void;
};

type CharacterStatus =
  | "correct"
  | "incorrect"
  | "missing";

type CharacterFeedback = {
  character: string;
  status: CharacterStatus;
  recognized?: string;
};

function normalizeChineseText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "")
    .replace(
      /[，。！？、,.!?;；:“”"'（）()【】《》<>…—\-]/g,
      ""
    );
}

function buildCharacterFeedback(
  targetText: string,
  recognizedText: string,
  incorrectCharacters: IncorrectCharacter[],
  missingCharacters: string[]
): CharacterFeedback[] {
  const targetCharacters = Array.from(
    normalizeChineseText(targetText)
  );

  const recognizedCharacters = Array.from(
    normalizeChineseText(recognizedText)
  );

  const incorrectQueue =
    incorrectCharacters.map((item) => ({
      ...item,
      used: false,
    }));

  const missingQueue = missingCharacters.map(
    (character) => ({
      character,
      used: false,
    })
  );

  return targetCharacters.map(
    (character, index) => {
      const incorrectMatch =
        incorrectQueue.find(
          (item) =>
            !item.used &&
            item.expected === character
        );

      if (incorrectMatch) {
        incorrectMatch.used = true;

        return {
          character,
          status: "incorrect",
          recognized:
            incorrectMatch.recognized,
        };
      }

      const missingMatch =
        missingQueue.find(
          (item) =>
            !item.used &&
            item.character === character
        );

      if (missingMatch) {
        missingMatch.used = true;

        return {
          character,
          status: "missing",
        };
      }

      if (
        recognizedCharacters[index] ===
        character
      ) {
        return {
          character,
          status: "correct",
        };
      }

      return {
        character,
        status: "correct",
      };
    }
  );
}

function getScoreMessage(score: number): {
  title: string;
  message: string;
} {
  if (score >= 90) {
    return {
      title: "Excellent!",
      message:
        "Your pronunciation was very clear. Keep practicing to make it even more natural.",
    };
  }

  if (score >= 75) {
    return {
      title: "Very good!",
      message:
        "You pronounced most of the sentence correctly. Practice the highlighted characters again.",
    };
  }

  if (score >= 60) {
    return {
      title: "Good try!",
      message:
        "Listen to the slow version and repeat the difficult characters.",
    };
  }

  return {
    title: "Keep practicing!",
    message:
      "Listen again, speak slowly, and try one more time.",
  };
}

function getCharacterClass(
  status: CharacterStatus
): string {
  if (status === "correct") {
    return "border-emerald-300/30 bg-emerald-400/15 text-emerald-100";
  }

  if (status === "incorrect") {
    return "border-amber-300/30 bg-amber-400/15 text-amber-100";
  }

  return "border-red-300/30 bg-red-400/15 text-red-100";
}

function getStatusLabel(
  status: CharacterStatus
): string {
  if (status === "correct") {
    return "Correct";
  }

  if (status === "incorrect") {
    return "Practice";
  }

  return "Missing";
}

export default function PronunciationFeedback({
  result,
  onTryAgain,
  onListenNormal,
  onListenSlow,
}: PronunciationFeedbackProps) {
  const feedback = buildCharacterFeedback(
    result.target_text,
    result.recognized_text,
    result.feedback.incorrect_characters,
    result.feedback.missing_characters
  );

  const scoreMessage = getScoreMessage(
    result.scores.overall
  );

  const hasProblems =
    result.feedback.incorrect_characters
      .length > 0 ||
    result.feedback.missing_characters
      .length > 0 ||
    result.feedback.extra_characters
      .length > 0;

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="text-center">
        <p className="text-sm font-medium text-white/55">
          Overall Score
        </p>

        <p className="mt-2 text-6xl font-bold text-white">
          {result.scores.overall}
        </p>

        <p className="mt-1 text-sm text-white/40">
          out of 100
        </p>

        <h3 className="mt-4 text-xl font-semibold text-white">
          {scoreMessage.title}
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/60">
          {scoreMessage.message}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ScoreCard
          label="Accuracy"
          value={result.scores.accuracy}
        />

        <ScoreCard
          label="Completeness"
          value={
            result.scores.completeness
          }
        />

        <ScoreCard
          label="Fluency"
          value={result.scores.fluency}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-black/15 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
          Target sentence
        </p>

        <p className="mt-2 text-2xl text-white">
          {result.target_text}
        </p>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/40">
          Anna heard
        </p>

        <p className="mt-2 text-2xl text-violet-200">
          {result.recognized_text}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-white">
          Character feedback
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {feedback.map((item, index) => (
            <div
              key={`${item.character}-${index}`}
              className={`min-w-20 rounded-2xl border px-4 py-3 text-center ${getCharacterClass(
                item.status
              )}`}
            >
              <p className="text-3xl font-semibold">
                {item.character}
              </p>

              <p className="mt-1 text-xs opacity-70">
                {getStatusLabel(
                  item.status
                )}
              </p>

              {item.status ===
                "incorrect" &&
              item.recognized ? (
                <p className="mt-2 text-xs">
                  Heard:{" "}
                  <span className="font-semibold">
                    {item.recognized}
                  </span>
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {!hasProblems ? (
        <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-center">
          <p className="font-semibold text-emerald-100">
            All characters were recognized
            correctly.
          </p>
        </div>
      ) : null}

      {result.feedback.incorrect_characters
        .length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-left">
          <p className="text-sm font-semibold text-amber-100">
            Practice these characters
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {result.feedback.incorrect_characters.map(
              (item, index) => (
                <span
                  key={`${item.expected}-${item.recognized}-${index}`}
                  className="rounded-xl bg-black/15 px-3 py-2 text-sm text-amber-50"
                >
                  Expected:{" "}
                  <strong>
                    {item.expected}
                  </strong>
                  {" · "}
                  Heard:{" "}
                  <strong>
                    {item.recognized ||
                      "—"}
                  </strong>
                </span>
              )
            )}
          </div>
        </div>
      ) : null}

      {result.feedback.missing_characters
        .length > 0 ? (
        <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-left">
          <p className="text-sm font-semibold text-red-100">
            Missing characters
          </p>

          <p className="mt-2 text-2xl text-red-50">
            {result.feedback.missing_characters.join(
              " "
            )}
          </p>
        </div>
      ) : null}

      {result.feedback.extra_characters
        .length > 0 ? (
        <div className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4 text-left">
          <p className="text-sm font-semibold text-blue-100">
            Extra characters
          </p>

          <p className="mt-2 text-2xl text-blue-50">
            {result.feedback.extra_characters.join(
              " "
            )}
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onListenNormal}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          ▶ Listen Again
        </button>

        <button
          type="button"
          onClick={onListenSlow}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          🐢 Listen Slowly
        </button>

        <button
          type="button"
          onClick={onTryAgain}
          className="rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
        >
          🎤 Try Again
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-white/35">
        Processing time:{" "}
        {result.processing_seconds}s
      </p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-black/15 p-4 text-center">
      <p className="text-xs text-white/50">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}