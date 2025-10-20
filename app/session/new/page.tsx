import { SessionInterface } from "@/components/session-interface"
import { AuthGuard } from "@/components/auth-guard"

export default function NewSessionPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <SessionInterface />
      </div>
    </AuthGuard>
  )
}
