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
  
  export default function QuoteTable({ quoteData }: QuoteTableProps) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white p-2 dark:bg-slate-700">
          <tbody>
            {quoteData.map((quote, index) => (
              <div className="rounded-xl" key={index}>
                <h6 className="bg-gray-800 px-4 py-4 text-start text-lg font-bold text-white md:text-center">Quote {index + 1}</h6>
              {Object.entries(quote).map(([key, value]) => (
                <tr key={key} className="border-b">
                <td className="px-4 py-2 font-semibold">{key}</td>
                <td className="px-4 py-2">
                  {Array.isArray(value) ? (
                  <ul className="list-inside list-disc">
                    {value.map((item, index) => (
                    <li key={index}>{item}</li>
                    ))}
                  </ul>
                  ) : (
                  value
                  )}
                </td>
                </tr>
              ))}
              </div>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  