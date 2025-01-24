"use server"

import { getUser } from "@/lib/auth"
import { generateRandomId } from "@/lib/utils"
import prisma from "@/prisma/client"
import { JsonMessagesArraySchema } from "@/types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import OpenAI from "openai"
import { google } from "googleapis"
import axios from "axios"

async function scrapeInternet(keywords: string): Promise<string> {
  try {
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(keywords)}+quote`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    // Simple regex to extract text between quotation marks
    const quoteRegex = /"([^"]*)"/g
    const quotes = response.data.match(quoteRegex) || []

    return quotes.slice(0, 5).join(" ") // Return first 5 quotes
  } catch (error) {
    console.error("Error scraping internet:", error)
    return "Failed to scrape quotes from the internet."
  }
}

async function getTrendingTopics(): Promise<string> {
  try {
    const response = await axios.get("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US")
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(response.data, "text/xml")
    const titles = xmlDoc.getElementsByTagName("title")
    const topics = Array.from(titles)
      .slice(1, 6)
      .map((title) => title.textContent)
      .join(", ")
    return topics
  } catch (error) {
    console.error("Error fetching trending topics:", error)
    return "Failed to fetch trending topics."
  }
}

interface QuoteData {
  quote: string
  hashtags: string[]
  author: string
  authorBio: string
  bigIdea: string
  claim: string
  counterclaim: string
  essentialQuestion: string
  bigIdeaExtended: string
  storytellingPrompts: string[]
  authorImageUrl: string
  imageLicense: string
  imageAuthor: string
}
interface QuoteTableProps {
  quoteData: QuoteData[]
}


export async function generateQuote(userPrompt: string, promptType: string, number: number) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let prompt: string;
  let retry = 1;

  switch (promptType) {
    case "internet":
      const scrapedContent = await scrapeInternet(userPrompt);
      prompt = `Based on the following scraped content: "${scrapedContent}", generate 20 quotes and their attributes.`;
      break;
    case "trending":
      const trendingTopics = userPrompt || (await getTrendingTopics());
      prompt = `Generate ${number || 1} quotes based on the following trending topics: ${trendingTopics}`;
      break;
    default:
      prompt = userPrompt;
  }

  prompt += `

Generate ${number || 1} quotes based on the following attributes for each quote:
1. Quote
2. 5 Hashtags (based on Quote theme)
3. Quote Author (2 words)
4. Quote Author Bio (2-3 sentences)
5. Big Idea (1-2 sentences)
6. Claim
7. Counterclaim
8. Essential Question (2-3 questions)
9. Big Idea Extended (3-5 sentences)
10. Storytelling Prompts (7 different prompts for conversations, bulleted)
11. Quote Author Image (link to author picture on Internet)
12. Permission/License (description of license associated with author image)
13. Image Author (First name and last name)

Example of respone :

[
  {
    "quote": "Example quote",
    "hashtags": ["#example", "#quote"],
    "author": "Author Name",
    "authorBio": "A short bio about the author.",
    "bigIdea": "A summary of the big idea.",
    "claim": "A specific claim related to the quote.",
    "counterclaim": "An opposing viewpoint.",
    "essentialQuestion": ["Question 1?", "Question 2?"],
    "bigIdeaExtended": "A more detailed explanation of the big idea.",
    "storytellingPrompts": ["Prompt 1", "Prompt 2"],
    "authorImageUrl": "https://example.com/image.jpg",
    "imageLicense": "License description",
    "imageAuthor": "Image Author Name or wikimedia link"
  },
  ... other qoutes
]

Please adhere to the following guidelines:
- Return only a JSON array of objects.
- Each object must contain these keys: quote, hashtags, author, authorBio, bigIdea, claim, counterclaim, essentialQuestion, bigIdeaExtended, storytellingPrompts, authorImageUrl, imageLicense, imageAuthor.
- Ensure all values are valid and complete.
- Do not include any additional text outside of the JSON array.


Format the response as one array of Qoutes object.`;

console.log(prompt)

  while (retry > 0) {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    let quoteData: QuoteData[];
    try {
      quoteData = JSON.parse(chatCompletion.choices[0].message.content || "[]");
      // Validate the structure of the quoteData
      console.log(quoteData)
      if (!Array.isArray(quoteData)) {
        throw new Error("Invalid quote data structure");
      }

      // quoteData.forEach((quote) => {
      //   if (
      //     typeof quote.quote !== "string" ||
      //     !Array.isArray(quote.hashtags) ||
      //     typeof quote.author !== "string" ||
      //     typeof quote.authorBio !== "string" ||
      //     typeof quote.bigIdea !== "string" ||
      //     typeof quote.claim !== "string" ||
      //     typeof quote.counterclaim !== "string" ||
      //     typeof quote.essentialQuestion !== "string" ||
      //     typeof quote.bigIdeaExtended !== "string" ||
      //     !Array.isArray(quote.storytellingPrompts) ||
      //     typeof quote.authorImageUrl !== "string" ||
      //     typeof quote.imageLicense !== "string" ||
      //     typeof quote.imageAuthor !== "string"
      //   ) {
      //     throw new Error("Invalid quote data structure");
      //   }
      // });
      return quoteData;
    } catch (error) {
      console.error("Error validating quote data:", error);
      retry--;
      if (retry === 0) {
        // throw new Error("Failed to generate valid quote data after multiple attempts");
        return null;
      }
    }
  }
}

export async function saveToGoogleSheets(quoteData: any) {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  const sheets = google.sheets({ version: "v4", auth })

  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  const range = "Sheet1!A:N" // Adjust this range as needed

  const values = [
    [
      quoteData.quote,
      quoteData.hashtags.join(", "),
      quoteData.author,
      quoteData.authorBio,
      quoteData.bigIdea,
      quoteData.claim,
      quoteData.counterclaim,
      quoteData.essentialQuestion,
      quoteData.bigIdeaExtended,
      quoteData.storytellingPrompts.join("\n"),
      quoteData.authorImageUrl,
      quoteData.imageLicense,
      quoteData.imageAuthor,
    ],
  ]

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    })

    console.log("Quote saved to Google Sheets:", response.data)
    return { success: true, message: "Quote saved to Google Sheets" }
  } catch (error) {
    console.error("Error saving to Google Sheets:", error)
    return { success: false, message: "Error saving to Google Sheets" }
  }
}
