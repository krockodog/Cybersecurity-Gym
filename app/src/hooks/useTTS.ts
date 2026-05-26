import { useState, useCallback, useRef } from 'react';

const ELEVENLABS_API_KEY = 'sk_75f0f2d5116025abf0a9a1f82dec04670fb402cc4e23a646';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

/** Map each professor to a unique ElevenLabs voice */
const PROFESSOR_VOICES: Record<string, string> = {
  cipher: 'ErXwobaYiN019PkySvjV',       // Antoni - male, challenging
  shield: 'AZnzlk1XvdvUeBnXmlld',       // Domi - female, calm/protective
  recon: 'VR6AewLTigWG4xSOukaG',        // Arnold - male, analytical
  codemaster: 'TxGEqnHWrfWFTfGW9XjX',   // Josh - male, practical
  sage: '21m00Tcm4TlvDq8ikWAM',         // Rachel - female, wise
  fixit: 'MF3mGyEYCl7XYWbV9V6O',        // Elli - female, encouraging
  guardian: 'EXAVITQu4vr4xnSDxMaL',     // Bella - female, cautious
  netrunner: 'ErXwobaYiN019PkySvjV',    // Antoni - male, technical
  benny: 'TxGEqnHWrfWFTfGW9XjX',        // Josh - male, patient
};

interface TTSState {
  speaking: boolean;
  loading: boolean;
}

/**
 * Custom hook for text-to-speech using ElevenLabs API.
 * Falls back to Web Speech API if ElevenLabs fails.
 *
 * @param professorId - Optional professor ID for voice mapping
 * @returns TTS controls and state
 */
export function useTTS(professorId?: string) {
  const [state, setState] = useState<TTSState>({
    speaking: false,
    loading: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /** Determine the voice ID based on professor mapping */
  const getVoiceId = useCallback((): string => {
    if (professorId && PROFESSOR_VOICES[professorId]) {
      return PROFESSOR_VOICES[professorId];
    }
    return DEFAULT_VOICE_ID;
  }, [professorId]);

  /** Fallback to Web Speech API when ElevenLabs fails */
  const speakWithWebSpeech = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find((v) => v.lang.startsWith('de'));
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    utterance.voice = deVoice || enVoice || voices[0] || null;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setState({ speaking: true, loading: false });
    utterance.onend = () => setState({ speaking: false, loading: false });
    utterance.onerror = () => setState({ speaking: false, loading: false });
    window.speechSynthesis.speak(utterance);
  }, []);

  /** Stop any ongoing speech or audio playback */
  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState({ speaking: false, loading: false });
  }, []);

  /**
   * Speak the given text using ElevenLabs TTS.
   * Falls back to Web Speech API on error.
   */
  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Stop any ongoing playback
      stop();

      setState({ speaking: false, loading: true });

      try {
        const voiceId = getVoiceId();
        const abortController = new AbortController();
        abortRef.current = abortController;

        const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text.slice(0, 5000), // ElevenLabs limit safety
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setState({ speaking: true, loading: false });
        audio.onended = () => {
          setState({ speaking: false, loading: false });
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setState({ speaking: false, loading: false });
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        await audio.play();
      } catch (error) {
        // AbortError means user stopped manually — don't fallback
        if (error instanceof DOMException && error.name === 'AbortError') {
          setState({ speaking: false, loading: false });
          return;
        }

        console.warn('[useTTS] ElevenLabs failed, falling back to Web Speech API:', error);
        speakWithWebSpeech(text);
      }
    },
    [getVoiceId, stop, speakWithWebSpeech]
  );

  return {
    speaking: state.speaking,
    loading: state.loading,
    speak,
    stop,
  };
}
