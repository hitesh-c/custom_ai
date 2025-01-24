"use client";

import { chat } from "@/actions/chat";
import Submit from "@/components/submit";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { generateRandomId } from "@/lib/utils";
import { JSONMessage } from "@/types";
import { useRouter } from "next/navigation";
import { ElementRef, useEffect, useOptimistic, useRef } from "react";

type ChatProps = {
  messages: JSONMessage[];
  id: string;
};

export default function Chat({ messages, id }: ChatProps) {
  const scrollRef = useRef<ElementRef<"div">>(null);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: string) => [
      ...state,
      {
        answer: undefined,
        id: generateRandomId(4),
        question: newMessage,
      },
    ]
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [optimisticMessages]);

  return (
    <div className="grow">
      <div className="flex min-h-[75vh] flex-col items-start gap-12 pb-10 sm:w-[95%]">
        {optimisticMessages.map((message) => (
          <div className="flex flex-col items-start gap-4" key={message.id}>
            <h4 className="text-xl font-medium text-sky-700 dark:text-sky-200">
              {message.question}
            </h4>
            {!message.answer ? (
              <div className="flex w-96 flex-col gap-3">
                <Skeleton className="h-[20px] w-[90%] rounded-md" />
                <Skeleton className="h-[20px] w-[60%] rounded-md" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-slate-900 dark:text-slate-300">
                {message.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      <div ref={scrollRef}></div>
      <div className="sticky bottom-0 mt-5 bg-background pb-8 pt-1">
        <ChatInput id={id} addMessage={addOptimisticMessage} />
      </div>
    </div>
  );
}

type ConversationComponent = {
  id: string;
  addMessage: (msg: string) => void;
};

function ChatInput({ addMessage, id }: ConversationComponent) {
  const inputRef = useRef<ElementRef<"input">>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    const message = formData.get("message") as string;
    if (!message) return;
    const apiKey = localStorage.getItem("apiKey");
    if (!apiKey) {
      toast({
        title: "No API key found!",
        description: 'Please add API key from "My account" section',
      });
      return;
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    addMessage(message);
    const err = await chat({
      apiKey,
      conversationId: id,
      message,
    });

    if (err?.message) {
      toast({
        title: err.message,
      });
    }
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-row items-center gap-2 sm:pr-5"
    >
      <Input
        ref={inputRef}
        autoComplete="off"
        name="message"
        placeholder="Ask me something..."
        className="h-12"
      />
      <Submit />
    </form>
  );
}
