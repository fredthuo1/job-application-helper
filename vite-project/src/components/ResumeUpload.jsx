import React, { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import { cleanText, countTokens, summarizeText } from "./utils";

const ResumeUpload = () => {
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jdSummary, setJdSummary] = useState("");
    const [enhancedResume, setEnhancedResume] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [areAiModelsReady, setAreAiModelsReady] = useState(false);
    const [isJdConfirmed, setIsJdConfirmed] = useState(false);

    // Initialize AI models
    useEffect(() => {
        const initializeModels = async () => {
            try {
                if (!window.ai ?.rewriter ?.create || !window.ai ?.summarizer ?.create || !window.ai ?.writer ?.create) {
                    throw new Error("Chrome AI APIs are not fully available. Ensure required flags are enabled.");
                }
                console.log("Initializing AI models...");
                await window.ai.rewriter.create();
                await window.ai.summarizer.create();
                await window.ai.writer.create();
                console.log("AI models initialized successfully.");
                setAreAiModelsReady(true);
            } catch (err) {
                console.error("Error initializing AI models:", err);
                setError("Failed to initialize AI models. Please check your setup.");
            }
        };
        initializeModels();
    }, []);

    // File upload handler
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setError("No file selected.");
            return;
        }

        try {
            const fileType = file.type;
            console.log("Processing file type:", fileType);

            if (fileType === "text/plain") {
                const reader = new FileReader();
                reader.onload = (event) => setResumeText(event.target.result);
                reader.readAsText(file);
            } else if (fileType === "application/pdf") {
                const pdfBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBuffer);
                const text = await Promise.all(
                    pdfDoc.getPages().map(async (page) => {
                        const content = await page.getTextContent();
                        return content.items.map((item) => item.str).join(" ");
                    })
                );
                setResumeText(text.join("\n"));
            } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const docBuffer = await file.arrayBuffer();
                const docData = await mammoth.extractRawText({ arrayBuffer: docBuffer });
                setResumeText(docData.value);
            } else {
                setError("Unsupported file type. Please upload .txt, .pdf, or .docx.");
            }
        } catch (err) {
            console.error("Error processing file:", err);
            setError("Failed to process the file. Please try again.");
        }
    };

    // Summarize job description
    const handleSummarizeJobDescription = async () => {
        try {
            setLoading(true);
            setError("");
            const cleanedJobDescription = cleanText(jobDescription);

            if (!cleanedJobDescription) {
                throw new Error("Job description is empty. Please provide a valid job description.");
            }

            const summary = await summarizeText(cleanedJobDescription);
            console.log("Generated Job Description Summary:", summary);
            setJdSummary(summary);
            setIsJdConfirmed(false);
        } catch (err) {
            console.error("Error summarizing job description:", err);
            setError(err.message || "Failed to summarize the job description.");
        } finally {
            setLoading(false);
        }
    };

    // Enhance resume
    const handleEnhanceResume = async () => {
        if (!isJdConfirmed) {
            setError("Please confirm the summarized job description before enhancing the resume.");
            return;
        }

        const cleanedResumeText = cleanText(resumeText);
        const cleanedJdSummary = cleanText(jdSummary);

        if (countTokens(cleanedResumeText) + countTokens(cleanedJdSummary) > 2048) {
            setError("Combined inputs exceed token limits. Please shorten the resume or job description.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const inputPrompt = `
                Rewrite the following resume to align it with the provided job description. Ensure:
                - A strong Summary Section highlighting technical expertise and achievements.
                - Relevant skills aligned with job description requirements.
                - Action-oriented bullet points in the Experience Section.

                **Job Description Summary**:
                ${cleanedJdSummary}

                **Candidate's Resume**:
                ${cleanedResumeText}

                **Enhanced Resume**:
            `;

            const rewriter = await window.ai.rewriter.create();
            const result = await rewriter.rewrite(inputPrompt);

            console.log("Enhanced Resume Generated:", result);
            setEnhancedResume(result);
        } catch (err) {
            console.error("Error enhancing resume:", err);
            setError(`Error enhancing resume: ${err.message || "Unknown error."}`);
        } finally {
            setLoading(false);
        }
    };

    // Generate cover letter
    const handleGenerateCoverLetter = async () => {
        setLoading(true);
        setError("");

        try {
            if (!resumeText || !jobDescription) {
                throw new Error("Resume and job description must be provided.");
            }

            const cleanedResumeText = cleanText(resumeText);
            const cleanedJobDescription = cleanText(jdSummary || jobDescription);

            const inputPrompt = `
                Write a cover letter based on the following resume and job description:
                - Address to "Dear Hiring Manager".
                - Strong opening paragraph explaining interest in the role.
                - Highlight relevant skills and experiences.
                - End with enthusiasm and a call to action.

                **Job Description**:
                ${cleanedJobDescription}

                **Candidate's Resume**:
                ${cleanedResumeText}

                **Cover Letter**:
            `;

            const writer = await window.ai.writer.create();
            const result = await writer.write(inputPrompt);

            console.log("Generated Cover Letter:", result);
            setCoverLetter(result);
        } catch (err) {
            console.error("Error generating cover letter:", err);
            setError(`Error generating cover letter: ${err.message || "Unknown error."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
            <input
                type="file"
                accept=".txt, .pdf, .docx"
                onChange={handleUpload}
                className="mb-2 block"
            />
            <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full p-2 border rounded mb-4"
                rows={4}
            />
            <button
                onClick={handleSummarizeJobDescription}
                className={`mb-2 px-4 py-2 rounded bg-blue-500 text-white`}
                disabled={loading}
            >
                {loading ? "Summarizing..." : "Summarize Job Description"}
            </button>
            {jdSummary && (
                <>
                    <h3 className="text-lg font-semibold mb-2">Summarized Job Description</h3>
                    <textarea
                        value={jdSummary}
                        readOnly
                        className="w-full p-2 border rounded mb-2"
                        rows={4}
                    />
                    <button
                        onClick={() => setIsJdConfirmed(true)}
                        className="mb-4 px-4 py-2 rounded bg-green-500 text-white"
                    >
                        Confirm and Enhance
                    </button>
                </>
            )}
            {error && <p className="text-red-500">{error}</p>}
            <textarea
                value={resumeText}
                readOnly
                className="w-full p-2 border rounded mb-4"
                rows={8}
            />
            <button
                onClick={handleEnhanceResume}
                disabled={loading || !areAiModelsReady || !isJdConfirmed}
                className={`mt-2 px-4 py-2 rounded ${loading ? "bg-gray-500" : "bg-blue-500 text-white"}`}
            >
                {loading ? "Enhancing..." : "Enhance Resume"}
            </button>
            <textarea
                value={enhancedResume}
                readOnly
                className="w-full p-2 border rounded mt-4"
                rows={8}
                placeholder="Enhanced resume will appear here..."
            />
            <button
                onClick={handleGenerateCoverLetter}
                disabled={loading || !resumeText || !jobDescription}
                className={`mb-2 px-4 py-2 rounded ${loading ? "bg-gray-500" : "bg-blue-500 text-white"}`}
            >
                {loading ? "Generating..." : "Generate Cover Letter"}
            </button>
            <textarea
                value={coverLetter}
                readOnly
                className="w-full p-2 border rounded mt-4"
                rows={8}
                placeholder="Cover letter will appear here..."
            />
        </div>
    );
};

export default ResumeUpload;
