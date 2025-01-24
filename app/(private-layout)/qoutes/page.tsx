import { Suspense } from "react"
import QuoteGenerator from "@/app/(private-layout)/qoutes/components/QuoteGenerator"
import Loading from "@/components/Loading"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-4">
      {/* <h1 className="mb-8 text-3xl font-bold">Quotes Generator</h1> */}
      <div className="grid grid-cols-1 gap-8">
        <Suspense fallback={<Loading />}>
          <QuoteGenerator />
        </Suspense>
      </div>
    </div>
  )
}

