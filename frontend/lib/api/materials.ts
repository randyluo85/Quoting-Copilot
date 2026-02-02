// frontend/lib/api/materials.ts
import { fetcher } from './client'

export interface Material {
  id: string
  name: string
  spec?: string
  std_price: string
  vave_price?: string
  supplier_tier?: string
  created_at: string
  updated_at: string
}

export interface MaterialListResponse {
  total: number
  items: Material[]
  page: number
  page_size: number
}

export async function getMaterials(page = 1, pageSize = 20, search?: string) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })
  if (search) params.set('search', search)

  return fetcher(`/api/v1/materials?${params}`) as Promise<MaterialListResponse>
}

export async function getMaterial(id: string) {
  return fetcher(`/api/v1/materials/${id}`) as Promise<Material>
}

export async function createMaterial(data: Partial<Material>) {
  return fetcher('/api/v1/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<Material>
}

export async function updateMaterial(id: string, data: Partial<Material>) {
  return fetcher(`/api/v1/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<Material>
}

export async function deleteMaterial(id: string) {
  return fetcher(`/api/v1/materials/${id}`, { method: 'DELETE' })
}

export async function importMaterials(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/materials/import`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Import failed')
  return res.json()
}
