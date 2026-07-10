export type AudioSourceKind = "none" | "file" | "microphone";

export interface AudioBands {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
}

const BASS_RANGE: [number, number] = [0, 0.1];
const MID_RANGE: [number, number] = [0.1, 0.4];
const TREBLE_RANGE: [number, number] = [0.4, 1.0];

/**
 * Wraps the Web Audio API so the visualizer can read frequency/waveform
 * data every animation frame without routing it through React state.
 */
export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private objectUrl: string | null = null;

  private freqData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;

  sourceKind: AudioSourceKind = "none";

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === "suspended") {
      void this.context.resume();
    }
    return this.context;
  }

  private ensureAnalyser(): AnalyserNode {
    const ctx = this.ensureContext();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.82;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
    }
    return this.analyser;
  }

  private disconnectSource() {
    this.sourceNode?.disconnect();
    this.sourceNode = null;

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = "";
      this.audioElement = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  async loadFile(file: File): Promise<void> {
    this.disconnectSource();
    const ctx = this.ensureContext();
    const analyser = this.ensureAnalyser();

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    this.objectUrl = URL.createObjectURL(file);
    audio.src = this.objectUrl;
    audio.loop = true;

    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    this.audioElement = audio;
    this.sourceNode = source;
    this.sourceKind = "file";

    await audio.play();
  }

  async useMicrophone(): Promise<void> {
    this.disconnectSource();
    const ctx = this.ensureContext();
    const analyser = this.ensureAnalyser();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    // Intentionally not connected to destination to avoid feedback/echo.

    this.mediaStream = stream;
    this.sourceNode = source;
    this.sourceKind = "microphone";
  }

  play() {
    void this.audioElement?.play();
  }

  pause() {
    this.audioElement?.pause();
  }

  get isFileSource() {
    return this.sourceKind === "file";
  }

  get isPaused(): boolean {
    return this.audioElement?.paused ?? true;
  }

  stop() {
    this.disconnectSource();
    this.sourceKind = "none";
  }

  /** Reads current frequency + waveform data into internal buffers and returns band energies (0..1). */
  sample(): AudioBands {
    if (!this.analyser || !this.freqData || !this.timeData) {
      return { bass: 0, mid: 0, treble: 0, overall: 0 };
    }
    this.analyser.getByteFrequencyData(this.freqData as Uint8Array<ArrayBuffer>);
    this.analyser.getByteTimeDomainData(this.timeData as Uint8Array<ArrayBuffer>);

    const n = this.freqData.length;
    const bandAverage = (range: [number, number]) => {
      const start = Math.floor(range[0] * n);
      const end = Math.max(start + 1, Math.floor(range[1] * n));
      let sum = 0;
      for (let i = start; i < end; i++) sum += this.freqData![i];
      return sum / (end - start) / 255;
    };

    const bass = bandAverage(BASS_RANGE);
    const mid = bandAverage(MID_RANGE);
    const treble = bandAverage(TREBLE_RANGE);
    const overall = (bass + mid + treble) / 3;

    return { bass, mid, treble, overall };
  }

  getFrequencyData(): Uint8Array | null {
    return this.freqData;
  }

  getTimeDomainData(): Uint8Array | null {
    return this.timeData;
  }
}
