"use client";

import { useState } from "react";
import { generateQuote, saveToGoogleSheets } from "../actions/quoteActions";
import QuoteTable from "./QouteTable";

interface QuoteData {
  quote: string;
  hashtags: string[];
  author: string;
  authorBio: string;
  bigIdea: string;
  claim: string;
  counterclaim: string;
  essentialQuestion: string;
  bigIdeaExtended: string;
  storytellingPrompts: string[];
  authorImageUrl: string;
  imageLicense: string;
  imageAuthor: string;
}
interface QuoteTableProps {
  quoteData: QuoteData[];
}

export default function QuoteGenerator() {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [promptType, setPromptType] = useState("custom");
  const [number, setNumber] = useState(1);

  const handleGenerateQuote = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first.");
      return;
    }
    setLoading(true);
    const newQuote = await generateQuote(prompt, promptType, number);
    if (!newQuote) {
      alert("AI: Please try again.");
      setLoading(false);
      return;
    }
    setQuote(newQuote);
    setLoading(false);
  };

  const handleSaveToSheets = async () => {
    if (!quote) return;
    setSaving(true);
    await saveToGoogleSheets(quote);
    setSaving(false);
  };
  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Quote Generator
        </h2>
        <div className="mb-4">
          <label
            htmlFor="promptType"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Prompt Type:
          </label>
          <select
            id="promptType"
            value={promptType}
            onChange={(e) => setPromptType(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            <option value="custom">Custom Prompt</option>
            <option value="internet">Internet Scraping</option>
            <option value="trending">Trending Topics</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="promptInput"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {promptType === "custom"
              ? "Enter custom Text & Attributes:"
              : promptType === "internet"
              ? "Enter keywords for internet scraping:"
              : "Enter trending topic (optional):"}
          </label>

          <input
            type="text"
            id="promptInput"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mb-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            placeholder={
              promptType === "custom"
                ? "Type your prompt here..."
                : promptType === "internet"
                ? "Enter keywords for scraping..."
                : "Enter trending topic or leave blank for auto-detection"
            }
          />

          <label
            htmlFor="NumberInput"
            className="mb-2 mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {" "}
            Number of Quotes:
          </label>
          <input
            type="number"
            id="NumberInput"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            placeholder={"Enter number of quotes to generate"}
          />
        </div>
        <div className="text-md mb-6 flex flex-col gap-4 md:flex-row">
          <button
            onClick={handleGenerateQuote}
            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Generating.." : "Generate"}
          </button>
          {quote && (
            <button
              onClick={handleSaveToSheets}
              className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving.." : "Save Response"}
            </button>
          )}

          <button
            // onClick={window.location.reload}
            onClick={() => window.location.reload()}
            className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Restart
          </button>
        </div>
        {quote &&      <h6 className="py-4 text-start text-lg font-bold md:text-center">Results</h6>}
        {quote && <QuoteTable quoteData={quote} />}
      </div>

      <p className="text-xs">
        Note:
        <ul className="pl-5 text-xs">
          <li>AI GPT Models can make mistakes.</li>
          <li>Generating AI Responses can take long time.</li>
          <li>Best viewed on Desktop mode.</li>
        </ul>
      </p>
    </>
  );
}
