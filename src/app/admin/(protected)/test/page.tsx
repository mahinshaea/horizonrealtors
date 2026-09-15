import { SupabaseDiagnostics } from '@/components/supabase-diagnostics'

export default function AdminTestPage() {
  return (
    <div className="p-6 md:p-10">
      <p className="text-sm text-stone-500">Diagnostics</p>
      <h1 className="font-serif text-3xl font-bold text-emerald-950">Supabase test</h1>
      <p className="mt-1 text-sm text-stone-600">Check authentication, admin permissions, and property inserts.</p>
      <div className="mt-8">
        <SupabaseDiagnostics />
      </div>
    </div>
  )
}
