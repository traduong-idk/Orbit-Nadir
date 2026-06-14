/**
 * Translation utilities for multilingual company name handling.
 * Uses Gemini when available, otherwise returns original text.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-1.5-flash";

/**
 * Translate text to English for consistent matching.
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language hint (e.g. "vi", "zh")
 * @returns {Promise<string>} Translated text or original on failure
 */
export async function translateToEnglish(text, sourceLang = "auto") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !text) return text;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const prompt = `Translate this company name to English. Return ONLY the translation, no explanation.
Language hint: ${sourceLang}
Text: ${text}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim() || text;
  } catch {
    return text;
  }
}

/**
 * Detect likely country from company name patterns.
 * @param {string} companyName
 * @returns {string} Country guess
 */
export function detectCountryFromName(companyName) {
  const name = companyName || "";

  if (/Công ty|TNHH|Cổ phần|DNTN|[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(name)) {
    return "Vietnam";
  }
  if (/广东|浙江|福建|有限公司|Co\.?,?\s*Ltd|Guangdong|Zhejiang|Fujian|[\u4e00-\u9fff]/.test(name)) {
    return "China";
  }
  if (/股份有限公司|台灣|Taiwan/i.test(name)) {
    return "Taiwan";
  }
  if (/주식회사|韩国|Korea/i.test(name)) {
    return "South Korea";
  }
  if (/株式会社|Japan/i.test(name)) {
    return "Japan";
  }
  return "others";
}
