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
import * as cheerio from "cheerio"

async function scrapeInternet(keywords: string): Promise<string> {
  // This is a simplified example. In a real-world scenario, you'd want to use a more robust
  // and ethical scraping method, respecting robots.txt and website terms of service.
  const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(keywords)}+quote`)
  const $ = cheerio.load(response.data)
  const quotes = $('div:contains("quote")').text()
  return quotes.slice(0, 500) // Limit to first 500 characters for this example
}

async function getTrendingTopics(): Promise<string> {
  // This is a placeholder. In a real-world scenario, you'd want to use a proper API
  // for trending topics, such as Google Trends API or Twitter API.
  const response = await axios.get("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US")
  const $ = cheerio.load(response.data, { xmlMode: true })
  const topics = $("title")
    .map((i, el) => $(el).text())
    .get()
    .slice(1, 6)
    .join(", ")
  return topics
}

export async function generateQuote(userPrompt: string, promptType: string) {

  const apiKey = localStorage.getItem("apiKey") || undefined;
  const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY || apiKey) })


  let prompt: string

  switch (promptType) {
    case "internet":
      const scrapedContent = await scrapeInternet(userPrompt)
      prompt = `Based on the following scraped content: "${scrapedContent}", generate a quote and its attributes.`
      break
    case "trending":
      const trendingTopics = userPrompt || (await getTrendingTopics())
      prompt = `Generate a quote based on the following trending topics: ${trendingTopics}`
      break
    default:
      prompt = userPrompt
  }

  prompt += `

  Generate the following attributes based on this quote:
  1. Quote (if not already provided)
  2. 5 Hashtags (based on Quote theme)
  3. Quote Author (2 words)
  4. Quote Author Bio (2-3 sentences)
  5. Big Idea (2-3 sentences)
  6. Claim
  7. Counterclaim
  8. Essential Question (2-3 questions)
  9. Big Idea Extended (3-5 sentences)
  10. Storytelling Prompts (7 different prompts for conversations, bulleted)
  11. Quote Author Image (link to author picture on Internet)
  12. Permission/License (description of license associated with author image)
  13. Image Author (First name and last name)

  Format the response as a JSON object, including the original quote.`

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  })

  const quoteData = JSON.parse(chatCompletion.choices[0].message.content || "{}")

  return quoteData
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

export type Message = {
  message: string
  apiKey: string
  conversationId: string
}

export type NewMessage = Omit<Message, "conversationId">

export async function newChat(params: NewMessage) {
  const session = await getUser()
  if (!session?.user) redirect("/login")
  let id: string | undefined
  let error: undefined | { message: string }
  try {
    const responseMessage = await createCompletion(params.apiKey, params.message)
    const newConversationId = generateRandomId(8)
    const newMessageJson = [
      {
        id: newConversationId,
        question: params.message,
        answer: responseMessage.message.content,
      },
    ]
    const dataRef = await prisma.conversation.create({
      data: {
        messages: newMessageJson,
        name: params.message,
        userId: session.user.id,
      },
    })
    id = dataRef.id
  } catch (err) {
    if (err instanceof Error) error = { message: err.message }
  }
  console.log(error)

  if (error) return error
  redirect(`/chat/${id}`)
}

export async function chat(params: Message) {
  let error: undefined | { message: string }
  try {
    const responseMessage = await createCompletion(params.apiKey, params.message)
    const newConversationId = generateRandomId(8)
    const dataRef = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId,
      },
    })
    const updatedMessageJson = [
      ...JsonMessagesArraySchema.parse(dataRef?.messages),
      {
        id: newConversationId,
        question: params.message,
        answer: responseMessage.message.content,
      },
    ]
    await prisma.conversation.update({
      where: {
        id: params.conversationId,
      },
      data: {
        messages: updatedMessageJson,
      },
    })
  } catch (err) {
    if (err instanceof Error) error = { message: err.message }
  }
  console.log(error)

  if (error) return error
  revalidatePath(`/chat/${params.conversationId}`)
}

declare global {
  var ai_map: undefined | Map<string, OpenAI>
}

const map = globalThis.ai_map ?? new Map<string, OpenAI>()

async function createCompletion(apiKey: string, message: string) {
  let ai: OpenAI
  if (map.has(apiKey)) {
    ai = map.get(apiKey)!
  } else {
    ai = new OpenAI({
      apiKey,
    })
    map.set(apiKey, ai)
  }
  const chatCompletion = await ai.chat.completions.create({
    messages: [{ role: "user", content: message }],
    model: "gpt-3.5-turbo",
  })
  return chatCompletion.choices[0]
}

