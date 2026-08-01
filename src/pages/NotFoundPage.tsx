import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-muted-foreground mt-4 text-lg">Page not found</p>
      <Button asChild className="mt-6 rounded-xl">
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
