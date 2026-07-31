export type SpeakChineseOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

export function stopSpeaking(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.speechSynthesis.cancel();
}

export function speakChinese(
  text: string,
  options: SpeakChineseOptions = {}
): void {
  if (
    typeof window === "undefined" ||
    !text.trim()
  ) {
    return;
  }

  stopSpeaking();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "zh-CN";
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  const voices =
    window.speechSynthesis.getVoices();

  const chineseVoice = voices.find(
    (voice) =>
      voice.lang.toLowerCase() ===
        "zh-cn" ||
      voice.lang
        .toLowerCase()
        .startsWith("zh")
  );

  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }

  window.speechSynthesis.speak(
    utterance
  );
}
