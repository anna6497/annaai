export interface AudioRecorderResult {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
}

export interface AudioRecorderOptions {
  maxDurationSeconds?: number;
  onTimeUpdate?: (seconds: number) => void;
  onAutoStop?: () => void;
}

const DEFAULT_MAX_DURATION_SECONDS = 30;

function getSupportedMimeType(): string {
  const preferredTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  for (const mimeType of preferredTypes) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(mimeType)
    ) {
      return mimeType;
    }
  }

  return "";
}

export class AudioRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  private startedAt = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private autoStopId: ReturnType<typeof setTimeout> | null = null;

  private readonly maxDurationSeconds: number;
  private readonly onTimeUpdate?: (seconds: number) => void;
  private readonly onAutoStop?: () => void;

  constructor(options: AudioRecorderOptions = {}) {
    this.maxDurationSeconds =
      options.maxDurationSeconds ??
      DEFAULT_MAX_DURATION_SECONDS;

    this.onTimeUpdate = options.onTimeUpdate;
    this.onAutoStop = options.onAutoStop;
  }

  public async start(): Promise<void> {
    if (this.isRecording()) {
      throw new Error("Recording is already in progress.");
    }

    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined"
    ) {
      throw new Error(
        "Audio recording is only available in the browser."
      );
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "This browser does not support microphone recording."
      );
    }

    if (typeof MediaRecorder === "undefined") {
      throw new Error(
        "This browser does not support MediaRecorder."
      );
    }

    try {
      this.stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
          video: false,
        });

      this.chunks = [];

      const mimeType = getSupportedMimeType();

      this.recorder = mimeType
        ? new MediaRecorder(this.stream, {
            mimeType,
            audioBitsPerSecond: 128000,
          })
        : new MediaRecorder(this.stream);

      this.recorder.ondataavailable = (
        event: BlobEvent
      ) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.recorder.onerror = () => {
        this.cleanup();
      };

      this.startedAt = Date.now();

      this.recorder.start(250);

      this.startTimer();
      this.startAutoStopTimer();
    } catch (error) {
      this.cleanup();

      if (error instanceof DOMException) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          throw new Error(
            "Microphone permission was denied. Please allow microphone access."
          );
        }

        if (error.name === "NotFoundError") {
          throw new Error(
            "No microphone was found on this device."
          );
        }

        if (error.name === "NotReadableError") {
          throw new Error(
            "The microphone is being used by another application."
          );
        }
      }

      throw error instanceof Error
        ? error
        : new Error("Unable to start microphone recording.");
    }
  }

  public stop(): Promise<AudioRecorderResult> {
    return new Promise((resolve, reject) => {
      if (
        !this.recorder ||
        this.recorder.state === "inactive"
      ) {
        reject(
          new Error("There is no active recording.")
        );
        return;
      }

      const activeRecorder = this.recorder;
      const mimeType =
        activeRecorder.mimeType || "audio/webm";

      activeRecorder.onstop = () => {
        const durationSeconds = Math.max(
          1,
          Math.round(
            (Date.now() - this.startedAt) / 1000
          )
        );

        const blob = new Blob(this.chunks, {
          type: mimeType,
        });

        this.cleanup();

        if (blob.size === 0) {
          reject(
            new Error(
              "The recording is empty. Please try again."
            )
          );
          return;
        }

        resolve({
          blob,
          mimeType,
          durationSeconds,
        });
      };

      try {
        activeRecorder.stop();
      } catch (error) {
        this.cleanup();

        reject(
          error instanceof Error
            ? error
            : new Error("Unable to stop recording.")
        );
      }
    });
  }

  public cancel(): void {
    if (
      this.recorder &&
      this.recorder.state !== "inactive"
    ) {
      this.recorder.onstop = null;
      this.recorder.stop();
    }

    this.cleanup();
  }

  public isRecording(): boolean {
    return (
      this.recorder !== null &&
      this.recorder.state === "recording"
    );
  }

  private startTimer(): void {
    this.stopTimer();

    this.onTimeUpdate?.(0);

    this.timerId = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - this.startedAt) / 1000
      );

      this.onTimeUpdate?.(elapsedSeconds);
    }, 1000);
  }

  private startAutoStopTimer(): void {
    this.stopAutoStopTimer();

    this.autoStopId = setTimeout(() => {
      if (this.isRecording()) {
        this.onAutoStop?.();
      }
    }, this.maxDurationSeconds * 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private stopAutoStopTimer(): void {
    if (this.autoStopId) {
      clearTimeout(this.autoStopId);
      this.autoStopId = null;
    }
  }

  private stopMediaTracks(): void {
    this.stream?.getTracks().forEach((track) => {
      track.stop();
    });

    this.stream = null;
  }

  private cleanup(): void {
    this.stopTimer();
    this.stopAutoStopTimer();
    this.stopMediaTracks();

    this.recorder = null;
    this.chunks = [];
    this.startedAt = 0;
  }
}