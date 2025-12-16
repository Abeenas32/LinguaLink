import { InferenceClient } from "@huggingface/inference";
import { SUPPORTED_LANGUAGES } from "../utils/supportedLanguage";
SUPPORTED_LANGUAGES
const hf = new InferenceClient(process.env.HF_API_TOKEN!);

const model = "facebook/nllb-200-distilled-600M";;
const TIMEOUT = 10000;


export const translateText = async (text: string, sLanguage: string, rLanguage: string): Promise<{ success: boolean; translatedText: string; error?: string }> => {
    try {
        if (!text || text.trim().length === 0) {
            return {
                success: false,
                translatedText: text,
                error: " Empty  text provided"
            }
        }

        if (sLanguage === rLanguage) {
            return {
                success: true,
                translatedText: text
            }
        }
       
        if(!process.env.HF_API_TOKEN) {
            console.error(" API key is missing");
            return {
                 success : false,
                 translatedText:text ,
                 error : "Translation service not configured"
            }     
        }
        const sLanCode = SUPPORTED_LANGUAGES[sLanguage];
        const rLanCode = SUPPORTED_LANGUAGES[rLanguage];
        console.log(`🌐 Translating from ${sLanguage} (${sLanCode}) to ${rLanguage} (${rLanCode})...`);
        if(!sLanCode || !rLanCode) {
             console.error (`Unsupported language ${sLanCode} to ${rLanCode} `);
             return  {
                 success :false ,
                 translatedText :text,
                 error : "Unsupported language"
             }
        }
        
       const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Translation timeout")), TIMEOUT)
    );

    // Translation promise
    const translationPromise = hf.translation({
      model: model,
      inputs: text,
      parameters: {
        src_lang: sLanCode,
        tgt_lang: rLanCode,
      },
    });

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
    } else if (error.message.includes("401") || error.message.includes("403")) {
      errorMsg = "Invalid API key";
    } else if (error.message.includes("429")) {
      errorMsg = "Rate limit exceeded";
    } else if (error.message.includes("model")) {
      errorMsg = "Model error";
    }

    // Return original text on error
    return {
      success: false,
      translatedText: text,
      error: errorMsg,
    };
  }
};

// language validation
export const isValidLanguage = (lang: string): boolean => {
  return lang in SUPPORTED_LANGUAGES;
};
