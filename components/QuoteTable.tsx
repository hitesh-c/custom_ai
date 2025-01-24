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
  quoteData: QuoteData
}

export default function QuoteTable({ quoteData }: QuoteTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <tbody>
          {Object.entries(quoteData).map(([key, value]) => (
            <tr key={key} className="border-b">
              <td className="py-2 px-4 font-semibold">{key}</td>
              <td className="py-2 px-4">
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside">
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
        </tbody>
      </table>
    </div>
  )
}

