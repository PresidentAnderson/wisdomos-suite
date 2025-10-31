import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)

  if (error) {
    return { url: null, error }
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return { url: urlData.publicUrl, error: null }
}
