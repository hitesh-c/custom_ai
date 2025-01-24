import ChatInput from "./ChatInput"

export default function Chat() {
  return (
    <div className="grow rounded-lg bg-white p-6 shadow-md">
      <div className="flex min-h-[75vh] flex-col items-start gap-4 pb-10 sm:w-[95%]">
        <div className="text-xl font-medium text-sky-700">How can I help you today?</div>
        <div className="text-slate-900">ChatGPT can make mistakes. Consider checking important information.</div>
      </div>
      <div className="sticky bottom-0 mt-5 bg-background pb-8 pt-1">
        <ChatInput />
      </div>
    </div>
  )
}

