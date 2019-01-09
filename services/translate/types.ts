export type Translator = {
    translate(strings: string, target: string): Promise<TranslateResult>;
    translateArray(strings: string[], target: string): Promise<TranslateResult[]>;
    detect(strings: string): Promise<DetectResult>;
}

export type TranslateResult = {
    translatedText: string;
    originalText: string;
    detectedSourceLanguage: string;
}

export type DetectResult = {
    language: string;
    isReliable: boolean;
    confidence: number;
    originalText: string;
}