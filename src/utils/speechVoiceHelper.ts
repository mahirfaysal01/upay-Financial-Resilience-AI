// Browser Native Speech-to-Text and Text-to-Speech Helper for Bangla & English

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startSpeechListening(
  lang: 'bn' | 'en',
  onResult: (transcript: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError(new Error('Speech recognition not supported in this browser.'));
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error || event);
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch (e) {
    onError(e);
    return null;
  }
}

export function speakText(text: string, lang: 'bn' | 'en'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // cancel previous speech
    const cleanText = text.replace(/[*#_~`]/g, '').slice(0, 300); // speak first concise sentence
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Text-to-speech playback error', e);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
