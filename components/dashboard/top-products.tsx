import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const products = [
  { name: "Viso Suite Platform", value: "$52,318", change: "+1.2%" },
  { name: "ChatGPT Software", value: "$45,111", change: "+1.1%" },
  { name: "Jupyter Notebooks", value: "$34,839", change: "+0.8%" },
  { name: "Infosys Nia", value: "$22,000", change: "+0.5%" },
]

export function TopProducts() {
  return (
    <Card className="bg-[#1a1c1e] text-gray-100 border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal text-gray-300">Top products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-gray-200">{product.name}</p>
                <p className="text-sm text-gray-400">{product.value}</p>
              </div>
              <div className="text-sm text-green-400">{product.change}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
