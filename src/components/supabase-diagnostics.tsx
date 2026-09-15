'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Check = {
  label: string
  value: string
  ok: boolean
}

export function SupabaseDiagnostics() {
  const [checks, setChecks] = useState<Check[]>([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [testPropertyId, setTestPropertyId] = useState<string | null>(null)

  const inspect = async () => {
    setBusy(true)
    setStatus('Checking Supabase...')
    const client = createClient()
    const { data: authData, error: authError } = await client.auth.getUser()
    const user = authData.user
    const { data: profile, error: profileError } = user
      ? await client.from('profiles').select('role').eq('id', user.id).single()
      : { data: null, error: null }
    const { count, error: propertiesError } = await client
      .from('properties')
      .select('id', { count: 'exact', head: true })

    setChecks([
      { label: 'Auth user', value: user?.email ?? authError?.message ?? 'Missing', ok: Boolean(user) },
      { label: 'Profile role', value: profile?.role ?? profileError?.message ?? 'Missing', ok: profile?.role === 'admin' },
      { label: 'Properties table', value: propertiesError?.message ?? `${count ?? 0} row(s)`, ok: !propertiesError },
    ])
    setStatus('')
    setBusy(false)
  }

  const insertTestProperty = async () => {
    setBusy(true)
    setStatus('Inserting test property...')
    const client = createClient()
    const slug = `supabase-test-${crypto.randomUUID()}`
    const { data, error } = await client
      .from('properties')
      .insert({
        title: 'Supabase connection test',
        slug,
        description: 'Temporary property created by the admin diagnostics page.',
        property_type: 'apartment',
        location: 'Test location',
        address: 'Test address',
        city: 'Kochi',
        state: 'Kerala',
        postal_code: '682001',
        monthly_rent: 1,
        security_deposit: 0,
        bedrooms: 1,
        bathrooms: 1,
        area: 1,
        area_unit: 'sq ft',
        furnishing: 'unfurnished',
        availability: false,
        featured: false,
        amenities: [],
      })
      .select('id')
      .single()

    if (error) {
      setStatus(`Insert failed: ${error.message}`)
      setBusy(false)
      return
    }

    setTestPropertyId(data.id)
    setStatus(`Insert succeeded. Test property ID: ${data.id}`)
    setBusy(false)
    await inspect()
  }

  const deleteTestProperty = async () => {
    if (!testPropertyId) return
    setBusy(true)
    setStatus('Deleting test property...')
    const { error } = await createClient().from('properties').delete().eq('id', testPropertyId)
    setStatus(error ? `Delete failed: ${error.message}` : 'Test property deleted successfully.')
    if (!error) setTestPropertyId(null)
    setBusy(false)
    await inspect()
  }

  useEffect(() => {
    void inspect()
  }, [])

  return (
    <div className="grid gap-6">
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-emerald-950">Connection checks</h2>
        <div className="mt-5 grid gap-3">
          {checks.map((check) => (
            <div key={check.label} className="flex flex-wrap justify-between gap-2 border-b pb-3 text-sm">
              <span className="font-semibold">{check.label}</span>
              <span className={check.ok ? 'text-emerald-700' : 'text-red-700'}>{check.value}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => void inspect()} disabled={busy} className="mt-5 rounded bg-stone-200 px-4 py-2 text-sm font-semibold">
          Refresh checks
        </button>
      </section>
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-emerald-950">Database insert test</h2>
        <p className="mt-2 text-sm text-stone-600">Creates one temporary property to test the RLS insert policy, then lets you remove it.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => void insertTestProperty()} disabled={busy || Boolean(testPropertyId)} className="rounded bg-emerald-800 px-4 py-2 text-sm font-bold text-white">
            Insert test property
          </button>
          <button type="button" onClick={() => void deleteTestProperty()} disabled={busy || !testPropertyId} className="rounded bg-red-700 px-4 py-2 text-sm font-bold text-white">
            Delete test property
          </button>
        </div>
        {status && <p role="status" className="mt-4 text-sm text-stone-700">{status}</p>}
      </section>
    </div>
  )
}
