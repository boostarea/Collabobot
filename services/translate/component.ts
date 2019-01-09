import { BaseComponent, IApp } from "../../types/basicTypes";
import { TranslateServiceConfig } from "./config";
import { Translator, TranslateResult, DetectResult } from "./types";
const googleTranslate = require("google-translate");

export default class TranslateService extends BaseComponent {
    private config: TranslateServiceConfig;
    private translator: Translator;

    async init(app: IApp): Promise<void> {
        await super.init(app);
        this.config = this.app.config.getConfig(TranslateServiceConfig);
        if (this.config.key === "") {
            this.logger.error("Please set your google translate API key.");
            let rejectPromise = () => Promise.reject("No valid API key provided");
            this.translator = {
                translate: rejectPromise,
                translateArray: rejectPromise,
                detect: rejectPromise
            }
            return;
        }
        let translator = googleTranslate(this.config.key);
        this.translator = {
            translate: (strings: string, target: string): Promise<TranslateResult> => {
                return new Promise<TranslateResult>(resolve => {
                    translator.translate(strings, target, (err: any, result: any): void => {
                        if (err) {
                            this.logger.error(`Error happened when translate. err=${JSON.stringify(err)}, strings=${strings}`);
                            resolve();
                        } else {
                            resolve({
                                translatedText: result.translatedText,
                                originalText: result.originalText,
                                detectedSourceLanguage: result.detectedSourceLanguage
                            });
                        }
                    });
                });
            },
            translateArray: (strings: string[], target: string): Promise<TranslateResult[]> => {
                return new Promise<TranslateResult[]>(resolve => {
                    translator.translate(strings, target, (err: any, result: any[]): void => {
                        if (err) {
                            this.logger.error(`Error happened when translateArray. err=${JSON.stringify(err)}, strings=${strings}`);
                            resolve();
                        } else {
                            resolve(result.map((res: any) => {
                                return {
                                    translatedText: res.translatedText,
                                    originalText: res.originalText,
                                    detectedSourceLanguage: res.detectedSourceLanguage
                                }
                            }));
                        }
                    });
                });
            },
            detect: (strings: string): Promise<DetectResult> => {
                return new Promise<DetectResult>(resolve => {
                    translator.detect(strings, (err: any, result: any) => {
                        if (err) {
                            this.logger.error(`Error happened when detect language. err=${err}, strings=${strings}`);
                            resolve();
                        } else {
                            resolve({
                                language: result.language,
                                isReliable: result.isReliable,
                                confidence: result.confidence,
                                originalText: result.originalText
                            });
                        }
                    });
                });
            }
        }
        this.logger.debug(`TranslatorService init done.`);
    }

    translate(strings: string, target: string): Promise<TranslateResult> {
        return this.translator.translate(strings, target);
    }

    translateArray(strings: string[], target: string): Promise<TranslateResult[]> {
        return this.translator.translateArray(strings, target);
    }

    detect(strings: string): Promise<DetectResult> {
        return this.translator.detect(strings);
    }
}