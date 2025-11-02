export interface TrackAnalysis {
  id: string;
  name: string;
  tempo: number;
  key: string;
  energy: number;
  duration: number;
  waveform: number[];
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

let sharedAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") {
    throw new Error("Audio analysis is only available in the browser environment");
  }

  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio API is not supported in this browser");
    }

    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
};

const mergeChannels = (buffer: AudioBuffer) => {
  const { length, numberOfChannels } = buffer;

  if (numberOfChannels === 1) {
    return buffer.getChannelData(0);
  }

  const merged = new Float32Array(length);

  for (let channel = 0; channel < numberOfChannels; channel += 1) {
    const channelData = buffer.getChannelData(channel);

    for (let i = 0; i < length; i += 1) {
      merged[i] += channelData[i];
    }
  }

  for (let i = 0; i < length; i += 1) {
    merged[i] /= numberOfChannels;
  }

  return merged;
};

const estimateTempo = (data: Float32Array, sampleRate: number) => {
  if (data.length === 0) {
    return 0;
  }

  const targetSampleRate = 1000;
  const step = Math.max(1, Math.floor(sampleRate / targetSampleRate));
  const filteredLength = Math.floor(data.length / step);

  if (filteredLength === 0) {
    return 0;
  }

  const filtered = new Float32Array(filteredLength);

  for (let i = 0; i < filteredLength; i += 1) {
    filtered[i] = data[i * step];
  }

  const effectiveSampleRate = sampleRate / step;
  const analysisDurationSeconds = 20;
  const analysisLength = Math.min(
    filteredLength,
    Math.max(2, Math.floor(effectiveSampleRate * analysisDurationSeconds))
  );

  const segment = analysisLength === filteredLength ? filtered : filtered.subarray(0, analysisLength);

  let mean = 0;
  for (let i = 0; i < analysisLength; i += 1) {
    mean += segment[i];
  }
  mean /= analysisLength;

  const normalized = new Float32Array(analysisLength);
  for (let i = 0; i < analysisLength; i += 1) {
    normalized[i] = segment[i] - mean;
  }

  const minBpm = 60;
  const maxBpm = 180;
  const minLag = Math.max(1, Math.floor((effectiveSampleRate * 60) / maxBpm));
  const maxLag = Math.min(analysisLength - 1, Math.floor((effectiveSampleRate * 60) / minBpm));

  if (minLag >= maxLag) {
    return Math.round((effectiveSampleRate * 60) / Math.max(minLag, 1));
  }

  let bestLag = minLag;
  let bestCorrelation = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;

    for (let i = lag; i < analysisLength; i += 1) {
      correlation += normalized[i] * normalized[i - lag];
    }

    const normalizedCorrelation = correlation / (analysisLength - lag);

    if (normalizedCorrelation > bestCorrelation) {
      bestCorrelation = normalizedCorrelation;
      bestLag = lag;
    }
  }

  const tempo = Math.round((effectiveSampleRate * 60) / bestLag);

  return tempo;
};

const estimateEnergy = (data: Float32Array) => {
  if (data.length === 0) {
    return 0;
  }

  let sumSquares = 0;

  for (let i = 0; i < data.length; i += 1) {
    sumSquares += data[i] * data[i];
  }

  const rms = Math.sqrt(sumSquares / data.length);
  const normalized = Math.min(1, rms);

  return Math.round(normalized * 100);
};

const estimateKey = (data: Float32Array, duration: number, energy: number) => {
  if (data.length === 0 || duration === 0) {
    return "Unknown";
  }

  let zeroCrossings = 0;

  for (let i = 1; i < data.length; i += 1) {
    if ((data[i - 1] <= 0 && data[i] > 0) || (data[i - 1] >= 0 && data[i] < 0)) {
      zeroCrossings += 1;
    }
  }

  const frequency = zeroCrossings / (2 * duration);

  if (!Number.isFinite(frequency) || frequency <= 0) {
    return "Unknown";
  }

  const midiNumber = Math.round(12 * Math.log2(frequency / 440) + 69);
  const noteIndex = ((midiNumber % 12) + 12) % 12;
  const noteName = NOTE_NAMES[noteIndex];
  const mode = energy > 45 ? "maj" : "min";

  return `${noteName} ${mode}`;
};

const buildWaveform = (data: Float32Array, buckets = 120) => {
  if (data.length === 0) {
    return new Array(buckets).fill(0);
  }

  const bucketSize = Math.max(1, Math.floor(data.length / buckets));
  const waveform: number[] = [];

  for (let i = 0; i < buckets; i += 1) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, data.length);

    let peak = 0;

    for (let j = start; j < end; j += 1) {
      const value = Math.abs(data[j]);
      if (value > peak) {
        peak = value;
      }
    }

    waveform.push(Number(peak.toFixed(3)));
  }

  return waveform;
};

export const analyzeTrack = async (file: File, trackId: string): Promise<TrackAnalysis> => {
  const audioContext = getAudioContext();
  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch (error) {
      throw new Error("Unable to initialize audio context for analysis");
    }
  }
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

  const merged = mergeChannels(audioBuffer);
  const tempo = estimateTempo(merged, audioBuffer.sampleRate);
  const energy = estimateEnergy(merged);
  const key = estimateKey(merged, audioBuffer.duration, energy);
  const waveform = buildWaveform(merged);

  return {
    id: trackId,
    name: file.name.replace(/\.[^/.]+$/, ""),
    tempo,
    key,
    energy,
    duration: audioBuffer.duration,
    waveform,
  };
};
