"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type AnnaMode =
  | "conversation"
  | "sentence";

export type ConversationStatus =
  | "ready"
  | "listening"
  | "thinking"
  | "speaking";

interface ChatBoxProps {
  onStatusChange?: (
    status: ConversationStatus
  ) => void;
}

interface RealtimeEvent {
  type?: string;
  delta?: string;
  transcript?: string;
  error?: {
    message?: string;
  };
  response?: {
    status_details?: {
      error?: {
        message?: string;
      };
    };
  };
}

interface DisplayReply {
  hanzi: string;
  pinyin: string;
  myanmar: string;
  alternativeHanzi?: string;
  alternativePinyin?: string;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence?: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult:
    | ((
        event: SpeechRecognitionEventLike
      ) => void)
    | null;
  onerror:
    | ((
        event: SpeechRecognitionErrorEventLike
      ) => void)
    | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?:
      SpeechRecognitionConstructor;
    webkitSpeechRecognition?:
      SpeechRecognitionConstructor;
  }
}

const RESTART_DELAY_MS = 700;
const REQUEST_TIMEOUT_MS = 45000;

const MODE_DETAILS: Record<
  AnnaMode,
  {
    label: string;
    description: string;
    startText: string;
    welcome: DisplayReply;
  }
> = {
  conversation: {
    label:
      "🇨🇳 Chinese — တရုတ်လို စကားပြောမယ်",
    description:
      "Chinese Mode က Realtime ဖြစ်ပါတယ်။ Start တစ်ကြိမ်နှိပ်ပြီး ဆက်တိုက်ပြောနိုင်ပါတယ်။",
    startText:
      "တရုတ်လို စကားပြောမယ်",
    welcome: {
      hanzi:
        "你好呀！我们像朋友一样用中文聊天吧！",
      pinyin:
        "Nǐ hǎo ya! Wǒmen xiàng péngyou yíyàng yòng Zhōngwén liáotiān ba!",
      myanmar:
        "ဟိုင်း။ သူငယ်ချင်းတွေလို တရုတ်လို စကားပြောကြမယ်နော်။",
    },
  },

  sentence: {
    label:
      "🇲🇲 Myanmar — မြန်မာလိုပြောပြီး တရုတ်စာကြောင်းစီမယ်",
    description:
      "Browser Myanmar voice recognition ကိုသုံးပါတယ်။ Start တစ်ကြိမ်နှိပ်ပြီး စာကြောင်းများများ ဆက်ပြောနိုင်ပါတယ်။",
    startText:
      "မြန်မာလို စကားပြောမယ်",
    welcome: {
      hanzi:
        "请用缅甸语说出你想表达的意思。",
      pinyin:
        "Qǐng yòng Miǎndiànyǔ shuō chū nǐ xiǎng biǎodá de yìsi.",
      myanmar:
        "ပြောချင်တဲ့အဓိပ္ပါယ်ကို မြန်မာလိုပြောပါ။",
    },
  },
};

export default function ChatBox({
  onStatusChange,
}: ChatBoxProps) {
  const [mode, setMode] =
    useState<AnnaMode>("conversation");

  const [isConnected, setIsConnected] =
    useState(false);
  const [isConnecting, setIsConnecting] =
    useState(false);
  const [isMuted, setIsMuted] =
    useState(false);

  const [isUserSpeaking, setIsUserSpeaking] =
    useState(false);
  const [isAnnaSpeaking, setIsAnnaSpeaking] =
    useState(false);
  const [isFormatting, setIsFormatting] =
    useState(false);

  const [myanmarActive, setMyanmarActive] =
    useState(false);
  const [isMyanmarListening, setIsMyanmarListening] =
    useState(false);
  const [isBuildingSentence, setIsBuildingSentence] =
    useState(false);

  const [userTranscript, setUserTranscript] =
    useState("");
  const [interimTranscript, setInterimTranscript] =
    useState("");

  const [liveHanzi, setLiveHanzi] =
    useState("");
  const [reply, setReply] =
    useState<DisplayReply>(
      MODE_DETAILS.conversation.welcome
    );

  const [error, setError] =
    useState("");

  const pcRef =
    useRef<RTCPeerConnection | null>(null);
  const dcRef =
    useRef<RTCDataChannel | null>(null);
  const realtimeStreamRef =
    useRef<MediaStream | null>(null);
  const remoteAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const realtimeReplyRef =
    useRef("");
  const realtimeTranscriptRef =
    useRef("");

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );
  const myanmarActiveRef =
    useRef(false);
  const myanmarBusyRef =
    useRef(false);
  const myanmarStoppingRef =
    useRef(false);
  const restartTimerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const playbackAudioRef =
    useRef<HTMLAudioElement | null>(null);
  const playbackUrlRef =
    useRef<string | null>(null);

  const formatAbortRef =
    useRef<AbortController | null>(null);
  const sentenceAbortRef =
    useRef<AbortController | null>(null);

  const mountedRef = useRef(true);

  const currentMode =
    MODE_DETAILS[mode];

  function changeStatus(
    status: ConversationStatus
  ) {
    onStatusChange?.(status);
  }

  function clearRestartTimer() {
    if (restartTimerRef.current) {
      clearTimeout(
        restartTimerRef.current
      );
      restartTimerRef.current = null;
    }
  }

  function cleanPlayback() {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.onended =
        null;
      playbackAudioRef.current.onerror =
        null;
      playbackAudioRef.current.pause();
      playbackAudioRef.current.removeAttribute(
        "src"
      );
      playbackAudioRef.current.load();
      playbackAudioRef.current = null;
    }

    if (playbackUrlRef.current) {
      URL.revokeObjectURL(
        playbackUrlRef.current
      );
      playbackUrlRef.current = null;
    }
  }

  function cleanMyanmarRecognition() {
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      return;
    }

    recognition.onstart = null;
    recognition.onspeechstart = null;
    recognition.onspeechend = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    try {
      recognition.abort();
    } catch {}

    recognitionRef.current = null;
  }

  function closeRealtimeSession() {
    formatAbortRef.current?.abort();
    formatAbortRef.current = null;

    dcRef.current?.close();
    dcRef.current = null;

    pcRef.current?.close();
    pcRef.current = null;

    realtimeStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );
    realtimeStreamRef.current = null;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject =
        null;
      remoteAudioRef.current.remove();
      remoteAudioRef.current = null;
    }

    realtimeReplyRef.current = "";
    realtimeTranscriptRef.current = "";

    setIsConnected(false);
    setIsConnecting(false);
    setIsMuted(false);
    setIsUserSpeaking(false);
    setIsAnnaSpeaking(false);
    setIsFormatting(false);
    setLiveHanzi("");

    changeStatus("ready");
  }

  function stopMyanmarMode() {
    myanmarStoppingRef.current = true;
    myanmarActiveRef.current = false;
    myanmarBusyRef.current = false;

    setMyanmarActive(false);
    setIsMyanmarListening(false);
    setIsBuildingSentence(false);
    setIsAnnaSpeaking(false);
    setInterimTranscript("");

    clearRestartTimer();
    cleanMyanmarRecognition();
    cleanPlayback();

    sentenceAbortRef.current?.abort();
    sentenceAbortRef.current = null;

    changeStatus("ready");

    window.setTimeout(() => {
      myanmarStoppingRef.current = false;
    }, 300);
  }

  function stopEverything() {
    closeRealtimeSession();
    stopMyanmarMode();
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stopEverything();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function formatRealtimeReply(
    hanzi: string
  ) {
    const clean = hanzi.trim();

    if (!clean) {
      return;
    }

    formatAbortRef.current?.abort();

    const controller =
      new AbortController();
    formatAbortRef.current = controller;

    setIsFormatting(true);

    try {
      const response = await fetch(
        "/api/format-reply",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            hanzi: clean,
          }),
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Format error (${response.status})`
        );
      }

      if (!mountedRef.current) {
        return;
      }

      setReply({
        hanzi:
          typeof data?.hanzi === "string" &&
          data.hanzi.trim()
            ? data.hanzi.trim()
            : clean,
        pinyin:
          typeof data?.pinyin === "string"
            ? data.pinyin.trim()
            : "",
        myanmar:
          typeof data?.myanmar === "string"
            ? data.myanmar.trim()
            : "",
      });

      setLiveHanzi("");
    } catch (formatError) {
      if (
        formatError instanceof DOMException &&
        formatError.name === "AbortError"
      ) {
        return;
      }

      setError(
        formatError instanceof Error
          ? formatError.message
          : "Pinyin/Myanmar ပြောင်းမရပါ။"
      );

      setReply((previous) => ({
        ...previous,
        hanzi: clean,
      }));
    } finally {
      if (
        formatAbortRef.current ===
        controller
      ) {
        formatAbortRef.current = null;
      }

      if (mountedRef.current) {
        setIsFormatting(false);
      }
    }
  }

  function handleRealtimeEvent(
    event: RealtimeEvent
  ) {
    switch (event.type) {
      case "session.created":
      case "session.updated":
        setError("");
        return;

      case "input_audio_buffer.speech_started":
        realtimeTranscriptRef.current = "";
        setUserTranscript("");
        setIsUserSpeaking(true);
        setIsAnnaSpeaking(false);
        changeStatus("listening");
        return;

      case "input_audio_buffer.speech_stopped":
        setIsUserSpeaking(false);
        changeStatus("thinking");
        return;

      case "conversation.item.input_audio_transcription.delta": {
        const delta =
          typeof event.delta === "string"
            ? event.delta
            : "";

        if (!delta) {
          return;
        }

        realtimeTranscriptRef.current +=
          delta;

        setUserTranscript(
          realtimeTranscriptRef.current
        );

        return;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const transcript =
          typeof event.transcript ===
            "string"
            ? event.transcript.trim()
            : realtimeTranscriptRef.current.trim();

        if (transcript) {
          setUserTranscript(transcript);
        }

        realtimeTranscriptRef.current = "";
        return;
      }

      case "response.created":
        realtimeReplyRef.current = "";
        setLiveHanzi("");
        changeStatus("thinking");
        return;

      case "response.output_audio_transcript.delta":
      case "response.output_text.delta": {
        const delta =
          typeof event.delta === "string"
            ? event.delta
            : "";

        if (!delta) {
          return;
        }

        realtimeReplyRef.current += delta;
        setLiveHanzi(
          realtimeReplyRef.current
        );
        setIsAnnaSpeaking(true);
        changeStatus("speaking");
        return;
      }

      case "response.output_audio_transcript.done":
      case "response.output_text.done": {
        const finalHanzi =
          typeof event.transcript ===
            "string" &&
          event.transcript.trim()
            ? event.transcript.trim()
            : realtimeReplyRef.current.trim();

        if (finalHanzi) {
          realtimeReplyRef.current =
            finalHanzi;
          setLiveHanzi(finalHanzi);
          void formatRealtimeReply(
            finalHanzi
          );
        }

        return;
      }

      case "response.done": {
        const responseError =
          event.response?.status_details
            ?.error?.message;

        if (responseError) {
          setError(responseError);
        }

        const finalHanzi =
          realtimeReplyRef.current.trim();

        if (finalHanzi) {
          setLiveHanzi(finalHanzi);
          void formatRealtimeReply(
            finalHanzi
          );
        }

        realtimeReplyRef.current = "";
        setIsAnnaSpeaking(false);
        changeStatus("listening");
        return;
      }

      case "error":
        setError(
          event.error?.message ||
            "Realtime API error ဖြစ်သွားပါတယ်။"
        );
        setIsAnnaSpeaking(false);
        setIsUserSpeaking(false);
        changeStatus("ready");
        return;

      default:
        return;
    }
  }

  async function startRealtimeSession() {
    if (
      isConnecting ||
      isConnected
    ) {
      return;
    }

    if (
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      setError(
        "ဒီ Browser မှာ microphone မရပါ။"
      );
      return;
    }

    setIsConnecting(true);
    setError("");
    setUserTranscript("");
    setLiveHanzi("");

    realtimeReplyRef.current = "";
    realtimeTranscriptRef.current = "";

    changeStatus("thinking");

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });

      realtimeStreamRef.current =
        stream;

      const pc =
        new RTCPeerConnection();
      pcRef.current = pc;

      const audio =
        document.createElement("audio");

      audio.autoplay = true;
      audio.setAttribute("playsinline", "true");
      audio.muted = false;

      document.body.appendChild(audio);
      remoteAudioRef.current = audio;

      pc.ontrack = (event) => {
        const [remoteStream] =
          event.streams;

        if (!remoteStream) {
          return;
        }

        audio.srcObject = remoteStream;

        void audio.play().catch(() => {
          setError(
            "Anna အသံမထွက်ရင် ဖုန်း Silent Mode ကိုပိတ်ပြီး Start ပြန်နှိပ်ပါ။"
          );
        });
      };

      const microphoneTrack =
        stream.getAudioTracks()[0];

      if (!microphoneTrack) {
        throw new Error(
          "Microphone track မတွေ့ပါ။"
        );
      }

      pc.addTrack(
        microphoneTrack,
        stream
      );

      const dc =
        pc.createDataChannel(
          "oai-events"
        );

      dcRef.current = dc;

      dc.addEventListener(
        "message",
        (messageEvent) => {
          try {
            handleRealtimeEvent(
              JSON.parse(
                messageEvent.data
              ) as RealtimeEvent
            );
          } catch (parseError) {
            console.error(
              "Realtime event parse error:",
              parseError
            );
          }
        }
      );

      dc.addEventListener(
        "open",
        () => {
          if (!mountedRef.current) {
            return;
          }

          setIsConnected(true);
          setIsConnecting(false);
          setError("");
          changeStatus("listening");
        }
      );

      dc.addEventListener(
        "close",
        () => {
          if (mountedRef.current) {
            closeRealtimeSession();
          }
        }
      );

      pc.addEventListener(
        "connectionstatechange",
        () => {
          if (
            pc.connectionState ===
              "failed" ||
            pc.connectionState ===
              "disconnected"
          ) {
            if (mountedRef.current) {
              setError(
                "Realtime connection ပြတ်သွားပါတယ်။"
              );
              closeRealtimeSession();
            }
          }
        }
      );

      const offer =
        await pc.createOffer();

      await pc.setLocalDescription(
        offer
      );

      if (!offer.sdp) {
        throw new Error(
          "WebRTC SDP မရပါ။"
        );
      }

      const response = await fetch(
        "/api/realtime/session",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/sdp",
          },
          body: offer.sdp,
          cache: "no-store",
        }
      );

      const responseBody =
        await response.text();

      if (!response.ok) {
        let apiMessage =
          responseBody;

        try {
          const parsed =
            JSON.parse(responseBody);

          apiMessage =
            parsed.error ||
            responseBody;
        } catch {}

        throw new Error(apiMessage);
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: responseBody,
      });
    } catch (startError) {
      console.error(
        "Realtime start error:",
        startError
      );

      closeRealtimeSession();

      setError(
        startError instanceof
            DOMException &&
          startError.name ===
            "NotAllowedError"
          ? "Microphone permission ကို Allow လုပ်ပေးပါ။"
          : startError instanceof Error
            ? startError.message
            : "Realtime session စမရပါ။"
      );

      setIsConnecting(false);
      changeStatus("ready");
    }
  }

  function scheduleMyanmarRestart(
    delay = RESTART_DELAY_MS
  ) {
    clearRestartTimer();

    if (
      !myanmarActiveRef.current ||
      myanmarStoppingRef.current ||
      myanmarBusyRef.current ||
      mode !== "sentence"
    ) {
      return;
    }

    restartTimerRef.current =
      setTimeout(() => {
        restartTimerRef.current = null;

        if (
          myanmarActiveRef.current &&
          !myanmarStoppingRef.current &&
          !myanmarBusyRef.current &&
          !recognitionRef.current &&
          mode === "sentence"
        ) {
          startMyanmarRecognition();
        }
      }, delay);
  }

  async function speakMyanmarModeChinese(
    text: string
  ) {
    const clean = text.trim();

    if (!clean) {
      scheduleMyanmarRestart();
      return;
    }

    cleanPlayback();

    myanmarBusyRef.current = true;
    setIsAnnaSpeaking(true);
    changeStatus("speaking");

    try {
      const response = await fetch(
        "/api/speech",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: clean,
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.error ||
            `အသံထုတ်မရပါ။ (${response.status})`
        );
      }

      const blob =
        await response.blob();
      const url =
        URL.createObjectURL(blob);
      const audio =
        new Audio(url);

      audio.setAttribute("playsinline", "true");

      playbackAudioRef.current =
        audio;
      playbackUrlRef.current =
        url;

      let finished = false;

      const finish = () => {
        if (finished) {
          return;
        }

        finished = true;
        cleanPlayback();

        setIsAnnaSpeaking(false);
        myanmarBusyRef.current = false;

        scheduleMyanmarRestart();
      };

      audio.onended = finish;
      audio.onerror = finish;

      await audio.play();
    } catch (speechError) {
      console.error(
        "Myanmar mode speech error:",
        speechError
      );

      setError(
        speechError instanceof Error
          ? speechError.message
          : "အသံထုတ်မရပါ။"
      );

      setIsAnnaSpeaking(false);
      myanmarBusyRef.current = false;

      scheduleMyanmarRestart();
    }
  }

  async function buildMyanmarSentence(
    transcript: string
  ) {
    const clean =
      transcript.trim();

    if (
      !clean ||
      myanmarBusyRef.current
    ) {
      scheduleMyanmarRestart();
      return;
    }

    myanmarBusyRef.current = true;
    setIsBuildingSentence(true);
    setError("");
    setUserTranscript(clean);
    changeStatus("thinking");

    sentenceAbortRef.current?.abort();

    const controller =
      new AbortController();
    sentenceAbortRef.current =
      controller;

    const timeout =
      setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );

    try {
      const response = await fetch(
        "/api/sentence-builder",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            burmese: clean,
          }),
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `တရုတ်စာကြောင်း စီမရပါ။ (${response.status})`
        );
      }

      const nextReply: DisplayReply = {
        hanzi:
          typeof data?.hanzi === "string"
            ? data.hanzi.trim()
            : "",
        pinyin:
          typeof data?.pinyin === "string"
            ? data.pinyin.trim()
            : "",
        myanmar:
          typeof data?.myanmar === "string"
            ? data.myanmar.trim()
            : clean,
        alternativeHanzi:
          typeof data?.alternativeHanzi ===
            "string"
            ? data.alternativeHanzi.trim()
            : "",
        alternativePinyin:
          typeof data?.alternativePinyin ===
            "string"
            ? data.alternativePinyin.trim()
            : "",
      };

      if (!nextReply.hanzi) {
        throw new Error(
          "Chinese sentence မရပါ။"
        );
      }

      setReply(nextReply);
      setIsBuildingSentence(false);
      myanmarBusyRef.current = false;

      await speakMyanmarModeChinese(
        nextReply.hanzi
      );
    } catch (buildError) {
      console.error(
        "Sentence builder error:",
        buildError
      );

      setError(
        buildError instanceof Error
          ? buildError.name ===
            "AbortError"
            ? "တရုတ်စာကြောင်း စီတာကြာသွားပါတယ်။"
            : buildError.message
          : "တရုတ်စာကြောင်း စီမရပါ။"
      );

      setIsBuildingSentence(false);
      myanmarBusyRef.current = false;

      scheduleMyanmarRestart();
    } finally {
      clearTimeout(timeout);

      if (
        sentenceAbortRef.current ===
        controller
      ) {
        sentenceAbortRef.current = null;
      }
    }
  }

  function startMyanmarRecognition() {
    clearRestartTimer();

    if (
      mode !== "sentence" ||
      !myanmarActiveRef.current ||
      myanmarStoppingRef.current ||
      myanmarBusyRef.current ||
      recognitionRef.current
    ) {
      return;
    }

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setError(
        "ဒီ Browser မှာ Myanmar voice recognition မရပါ။ Desktop Chrome သို့မဟုတ် Android Chrome သုံးပါ။"
      );

      myanmarActiveRef.current = false;
      setMyanmarActive(false);
      changeStatus("ready");
      return;
    }

    try {
      const recognition =
        new Recognition();

      recognitionRef.current =
        recognition;

      recognition.lang = "my-MM";

      /*
       * false is intentionally used:
       * the browser returns one clear sentence,
       * then the code automatically starts a new recognition session.
       * This is usually more stable than continuous=true.
       */
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsMyanmarListening(true);
        setInterimTranscript("");
        changeStatus("listening");
      };

      recognition.onspeechstart = () => {
        setIsMyanmarListening(true);
        changeStatus("listening");
      };

      recognition.onspeechend = () => {
        setIsMyanmarListening(false);
        changeStatus("thinking");
      };

      recognition.onresult = (
        event
      ) => {
        let interim = "";
        let finalTranscript = "";

        for (
          let index =
            event.resultIndex;
          index <
          event.results.length;
          index += 1
        ) {
          const result =
            event.results[index];

          const bestAlternative =
            result[0];

          const transcript =
            bestAlternative?.transcript?.trim() ??
            "";

          if (!transcript) {
            continue;
          }

          if (result.isFinal) {
            finalTranscript +=
              `${transcript} `;
          } else {
            interim +=
              `${transcript} `;
          }
        }

        setInterimTranscript(
          interim.trim()
        );

        const cleanFinal =
          finalTranscript.trim();

        if (cleanFinal) {
          recognitionRef.current =
            null;
          setIsMyanmarListening(false);
          setInterimTranscript("");

          void buildMyanmarSentence(
            cleanFinal
          );
        }
      };

      recognition.onerror = (
        event
      ) => {
        recognitionRef.current = null;
        setIsMyanmarListening(false);
        setInterimTranscript("");

        if (
          event.error ===
            "not-allowed" ||
          event.error ===
            "service-not-allowed"
        ) {
          myanmarActiveRef.current =
            false;
          setMyanmarActive(false);

          setError(
            "Microphone permission ကို Allow လုပ်ပေးပါ။"
          );

          changeStatus("ready");
          return;
        }

        if (
          event.error ===
            "no-speech" ||
          event.error ===
            "audio-capture" ||
          event.error ===
            "network"
        ) {
          if (
            event.error ===
            "audio-capture"
          ) {
            setError(
              "Microphone အသံမရပါ။ Browser permission ကိုစစ်ပါ။"
            );
          }

          myanmarBusyRef.current =
            false;
          scheduleMyanmarRestart(900);
          return;
        }

        if (
          event.error ===
          "aborted"
        ) {
          if (
            !myanmarStoppingRef.current
          ) {
            scheduleMyanmarRestart();
          }
          return;
        }

        setError(
          `Myanmar voice error: ${event.error}`
        );

        myanmarBusyRef.current =
          false;
        scheduleMyanmarRestart(1000);
      };

      recognition.onend = () => {
        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current =
            null;
        }

        setIsMyanmarListening(false);
        setInterimTranscript("");

        if (
          myanmarStoppingRef.current ||
          !myanmarActiveRef.current
        ) {
          return;
        }

        if (!myanmarBusyRef.current) {
          scheduleMyanmarRestart();
        }
      };

      recognition.start();
    } catch (recognitionError) {
      console.error(
        "Myanmar recognition start error:",
        recognitionError
      );

      recognitionRef.current = null;
      setIsMyanmarListening(false);
      myanmarBusyRef.current = false;

      scheduleMyanmarRestart(1000);
    }
  }

  function startMyanmarMode() {
    if (myanmarActive) {
      stopMyanmarMode();
      return;
    }

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setError(
        "ဒီ Browser မှာ Myanmar Speech Recognition မရပါ။ Desktop/Android Chrome ကိုသုံးပါ။"
      );
      return;
    }

    myanmarStoppingRef.current =
      false;
    myanmarActiveRef.current =
      true;
    myanmarBusyRef.current =
      false;

    setMyanmarActive(true);
    setError("");
    setUserTranscript("");
    setInterimTranscript("");

    startMyanmarRecognition();
  }

  function toggleMute() {
    const track =
      realtimeStreamRef.current
        ?.getAudioTracks()[0];

    if (!track) {
      return;
    }

    track.enabled =
      !track.enabled;

    setIsMuted(
      !track.enabled
    );
  }

  function changeMode(
    nextMode: AnnaMode
  ) {
    stopEverything();

    setMode(nextMode);
    setReply(
      MODE_DETAILS[nextMode].welcome
    );
    setUserTranscript("");
    setInterimTranscript("");
    setLiveHanzi("");
    setError("");
  }

  function statusText() {
    if (isConnecting) {
      return "⏳ Connecting…";
    }

    if (isUserSpeaking) {
      return "🎙️ တရုတ်လို နားထောင်နေပါတယ်…";
    }

    if (isMyanmarListening) {
      return "🎙️ မြန်မာလို နားထောင်နေပါတယ်…";
    }

    if (isBuildingSentence) {
      return "✍️ တရုတ်စာကြောင်း စီနေပါတယ်…";
    }

    if (isAnnaSpeaking) {
      return "🔊 Anna ပြောနေပါတယ်…";
    }

    if (isFormatting) {
      return "📝 Pinyin နဲ့ မြန်မာဘာသာပြန် ထည့်နေပါတယ်…";
    }

    if (isConnected) {
      return "🟢 Connected — ဆက်ပြောလို့ရပါတယ်";
    }

    if (myanmarActive) {
      return "🟢 Myanmar listening active — နောက်စာကြောင်း ဆက်ပြောလို့ရပါတယ်";
    }

    return currentMode.description;
  }

  const shownHanzi =
    liveHanzi || reply.hanzi;

  const shownUserTranscript =
    interimTranscript ||
    userTranscript;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-black/20 p-5">
        <label
          htmlFor="anna-mode"
          className="mb-3 block text-sm font-bold text-purple-200"
        >
          ပြောမယ့် Mode ရွေးပါ
        </label>

        <select
          id="anna-mode"
          value={mode}
          onChange={(event) =>
            changeMode(
              event.target
                .value as AnnaMode
            )
          }
          disabled={
            isConnected ||
            isConnecting ||
            myanmarActive
          }
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-base font-semibold text-white outline-none disabled:opacity-50"
        >
          <option value="conversation">
            {
              MODE_DETAILS
                .conversation.label
            }
          </option>

          <option value="sentence">
            {
              MODE_DETAILS
                .sentence.label
            }
          </option>
        </select>

        <p className="mt-3 text-sm leading-6 text-white/55">
          {currentMode.description}
        </p>
      </section>

      {shownUserTranscript && (
        <section className="rounded-3xl border border-purple-300/20 bg-purple-500/20 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-purple-200">
            You said
          </p>

          <p className="mt-2 whitespace-pre-line text-left text-lg font-semibold leading-8 text-white">
            {shownUserTranscript}
          </p>

          {interimTranscript && (
            <p className="mt-2 text-xs text-purple-200">
              နားထောင်နေဆဲ…
            </p>
          )}
        </section>
      )}

      <section className="min-h-64 max-h-[40rem] overflow-y-auto rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="space-y-5 text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-purple-300">
              中文 · Hanzi
            </p>

            <p className="mt-2 whitespace-pre-line text-xl font-bold leading-9 text-white">
              {shownHanzi}
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-300">
              拼音 · Pinyin
            </p>

            <p className="mt-2 whitespace-pre-line text-base font-semibold leading-8 text-purple-100">
              {isFormatting
                ? "Pinyin ထည့်နေပါတယ်…"
                : reply.pinyin}
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-300">
              မြန်မာ
            </p>

            <p className="mt-2 whitespace-pre-line text-base font-semibold leading-8 text-white/90">
              {isFormatting
                ? "မြန်မာဘာသာပြန်နေပါတယ်…"
                : reply.myanmar}
            </p>
          </div>

          {reply.alternativeHanzi && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-300">
                ပိုသဘာဝကျတဲ့ပြောပုံ
              </p>

              <p className="mt-2 text-lg font-bold leading-8 text-white">
                {
                  reply.alternativeHanzi
                }
              </p>

              {reply.alternativePinyin && (
                <p className="mt-2 text-base leading-8 text-purple-100">
                  {
                    reply.alternativePinyin
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/20 px-4 py-3 text-sm leading-6 text-red-100">
          {error}
        </p>
      )}

      <div className="text-center">
        {mode === "conversation" ? (
          <button
            type="button"
            onClick={
              isConnected
                ? closeRealtimeSession
                : () =>
                    void startRealtimeSession()
            }
            disabled={isConnecting}
            className={`rounded-full px-8 py-4 text-lg font-bold transition disabled:opacity-50 ${
              isConnected
                ? "bg-red-500 hover:bg-red-400"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            {isConnecting
              ? "⏳ Connecting…"
              : isConnected
                ? "⏹ Stop Conversation"
                : "🎤 တရုတ်လို စကားပြောမယ်"}
          </button>
        ) : (
          <button
            type="button"
            onClick={startMyanmarMode}
            disabled={
              isBuildingSentence ||
              isAnnaSpeaking
            }
            className={`rounded-full px-8 py-4 text-lg font-bold transition disabled:opacity-50 ${
              myanmarActive
                ? "bg-red-500 hover:bg-red-400"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            {myanmarActive
              ? "⏹ Stop Conversation"
              : "🎤 မြန်မာလို စကားပြောမယ်"}
          </button>
        )}

        <p className="mt-3 text-sm leading-6 text-purple-200">
          {statusText()}
        </p>
      </div>

      {mode === "conversation" &&
        isConnected && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold"
            >
              {isMuted
                ? "🎤 Unmute"
                : "🔇 Mute"}
            </button>
          </div>
        )}
    </div>
  );
}