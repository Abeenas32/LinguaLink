// translation.service.ts
import { pipeline, env } from '@xenova/transformers';
import { SUPPORTED_LANGUAGES } from "../utils/supportedLanguage";

// Enable quantization for lower RAM usage
env.allowLocalModels = true;

const TRANSLATION_TIMEOUT = 10000; // 10 seconds for translation

// Cache the translator
let translatorCache: any = null;

// Pre-load function (call this on server startup)
export const preloadTranslationModel = async () => {
  if (translatorCache) {
    console.log("✅ Translation model already loaded!");
    return translatorCache;
  }

  console.log("🔄 Pre-loading translation model...");
  console.log("⏳ This will take 2-5 minutes on first startup...");

  try {
    translatorCache = await pipeline(
      'translation',
      'Xenova/nllb-200-distilled-600M',
      {
        quantized: true
      }
    );
    
    console.log("✅ Translation model loaded successfully!");
    console.log("🚀 Server is ready for translations!");
    return translatorCache;
  } catch (error) {
    console.error("❌ Failed to load translation model:", error);
    throw error;
  }
};

// Get translator (assumes already loaded)
const getTranslator = () => {
  if (!translatorCache) {
    throw new Error("Translation model not loaded. Call preloadTranslationModel() first!");
  }
  return translatorCache;
};

export const translateText = async (
  text: string,
  sLanguage: string,
  rLanguage: string
): Promise<{ success: boolean; translatedText: string; error?: string }> => {
  try {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        translatedText: text,
        error: "Empty text provided"
      };
    }

    if (sLanguage === rLanguage) {
      return {
        success: true,
        translatedText: text
      };
    }

    const sLanCode = SUPPORTED_LANGUAGES[sLanguage];
    const rLanCode = SUPPORTED_LANGUAGES[rLanguage];
    
    console.log(`🌐 Translating from ${sLanguage} (${sLanCode}) to ${rLanguage} (${rLanCode})...`);
    
    if (!sLanCode || !rLanCode) {
      console.error(`Unsupported language ${sLanCode} to ${rLanCode}`);
      return {
        success: false,
        translatedText: text,
        error: "Unsupported language"
      };
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Translation timeout")), TRANSLATION_TIMEOUT)
    );

    // Translation promise
    const translationPromise = (async () => {
      const translator = getTranslator();
      
      const result = await translator(text, {
        src_lang: sLanCode,
        tgt_lang: rLanCode,
      });

      return {
        translation_text: result[0].translation_text
      };
    })();

    // Race between translation and timeout
    const result = await Promise.race([translationPromise, timeoutPromise]);

    console.log(`✅ Translated: "${result.translation_text.substring(0, 30)}..."`);

    return {
      success: true,
      translatedText: result.translation_text,
    };
  } catch (error: any) {
    console.error("❌ Translation failed:", error.message);

    // Error handling
    let errorMsg = "Translation failed";

    if (error.message.includes("timeout")) {
      errorMsg = "Translation timeout";
    } else if (error.message.includes("not loaded")) {
      errorMsg = "Translation service not ready";
    } else if (error.message.includes("model")) {
      errorMsg = "Model error";
    } else if (error.message.includes("memory")) {
      errorMsg = "Out of memory";
    }

    // Return original text on error
    return {
      success: false,
      translatedText: text,
      error: errorMsg,
    };
  }
};

// Check if model is ready
export const isTranslationReady = (): boolean => {
  return translatorCache !== null;
};

// language validation
export const isValidLanguage = (lang: string): boolean => {
  return lang in SUPPORTED_LANGUAGES;
};

