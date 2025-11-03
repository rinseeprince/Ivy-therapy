import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TextSessionClient } from "@/components/text-session/TextSessionClient"

export const metadata = {
  title: "Text Therapy Session | Ivy Therapy",
  description: "Start a text-based therapy session",
}

export default async function TextSessionPage() {
  const supabase = await getSupabaseServerClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user data
  const userData = {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url,
  }

  return <TextSessionClient user={userData} />
}
