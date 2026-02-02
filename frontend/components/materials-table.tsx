// frontend/components/materials-table.tsx
'use client'

import { useState, useEffect } from 'react'
import { Material, getMaterials, deleteMaterial } from '@/lib/api/materials'

export function MaterialsTable() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const data = await getMaterials(page, 20)
      setMaterials(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error('Failed to load materials:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [page])

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此物料？')) return
    try {
      await deleteMaterial(id)
      loadMaterials()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const formatPrice = (price?: string) => {
    if (!price) return '-'
    return `¥${parseFloat(price).toFixed(2)}`
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">物料库</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          新增物料
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无数据</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left text-sm font-semibold">物料编码</th>
                <th className="border p-3 text-left text-sm font-semibold">名称</th>
                <th className="border p-3 text-left text-sm font-semibold">规格</th>
                <th className="border p-3 text-right text-sm font-semibold">标准价</th>
                <th className="border p-3 text-right text-sm font-semibold">VAVE价</th>
                <th className="border p-3 text-left text-sm font-semibold">供应商等级</th>
                <th className="border p-3 text-center text-sm font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="border p-3">{m.id}</td>
                  <td className="border p-3">{m.name}</td>
                  <td className="border p-3">{m.spec || '-'}</td>
                  <td className="border p-3 text-right">{formatPrice(m.std_price)}</td>
                  <td className="border p-3 text-right">{formatPrice(m.vave_price)}</td>
                  <td className="border p-3">{m.supplier_tier || '-'}</td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>共 {total} 条记录</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span>第 {page} 页</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  )
}
