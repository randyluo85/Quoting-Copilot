// frontend/lib/api/client.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`)
  }
  return res.json()
}
