/**
 * Cleans text by removing non-printable characters and extra spaces.
 * @param {string} text - The input text to clean.
 * @returns {string} - Cleaned text.
 */
export const cleanText = (text) => {
    return text.replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();
};

/**
 * Counts the number of tokens (words) in the given text.
 * @param {string} text - The input text to count tokens for.
 * @returns {number} - Number of tokens.
 */
export const countTokens = (text) => text.split(" ").length;

/**
 * Summarizes the provided text using AI or falls back to a basic logic.
 * @param {string} text - Text to summarize.
 * @returns {string} - Summary of the text.
 */
export const summarizeText = async (text) => {
    try {
        const summarizer = await window.ai.summarizer.create();
        const prompt = `
            Summarize the following job description. Focus on key skills, qualifications, and responsibilities. Keep it concise and under 300 words.

            Job Description:
            ${text}

            Summary:
        `;
        return await summarizer.summarize(prompt);
    } catch (err) {
        console.error("Error in summarization API, falling back to basic summarizer:", err);
        return fallbackSummarize(text);
    }
};

/**
 * Basic fallback summarization logic.
 * @param {string} text - Text to summarize.
 * @param {number} maxWords - Maximum words for the summary.
 * @returns {string} - Summarized text.
 */
export const fallbackSummarize = (text, maxWords = 300) => {
    const sentences = text.split(/[.!?]/).filter((sentence) => sentence.trim().length > 0);
    const importantSentences = sentences.slice(0, Math.min(sentences.length, 5));
    return importantSentences.join(". ").split(" ").slice(0, maxWords).join(" ");
};
