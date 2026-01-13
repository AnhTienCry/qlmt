import { useState, useEffect, useCallback } from 'react'
import axios from '@/libs/axios'
import { Button, Input, Card, Modal, Table, PageHeader, SearchInput, Select, Badge } from '@/components/ui'

interface TrangThai {
  MaTrangThai: number
  MaTrangThaiText: string
  TenTrangThai: string
  MauSac?: string
  MoTa?: string
  NgayTao?: string
}

const MAU_SAC_OPTIONS = [
  { value: 'green', label: 'Xanh lá (Mới, Tốt)' },
  { value: 'blue', label: 'Xanh dương (Đang dùng)' },
  { value: 'yellow', label: 'Vàng (Cảnh báo)' },
  { value: 'orange', label: 'Cam (Cần chú ý)' },
  { value: 'red', label: 'Đỏ (Hỏng, Lỗi)' },
  { value: 'gray', label: 'Xám (Thanh lý)' },
]

const TrangThaiPage = () => {
  const [trangThais, setTrangThais] = useState<TrangThai[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<TrangThai | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    MaTrangThaiText: '',
    TenTrangThai: '',
    MauSac: 'blue',
    MoTa: ''
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchKeyword) params.search = searchKeyword
      
      const res = await axios.get('/trangthai', { params })
      setTrangThais(res.data.data || [])
    } catch (error) {
      console.error('Lỗi:', error)
    } finally {
      setLoading(false)
    }
  }, [searchKeyword])

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      MaTrangThaiText: '',
      TenTrangThai: '',
      MauSac: 'blue',
      MoTa: ''
    })
    setShowModal(true)
  }

  const openEditModal = (item: TrangThai) => {
    setEditingItem(item)
    setFormData({
      MaTrangThaiText: item.MaTrangThaiText,
      TenTrangThai: item.TenTrangThai,
      MauSac: item.MauSac || 'blue',
      MoTa: item.MoTa || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.MaTrangThaiText || !formData.TenTrangThai) {
      alert('Vui lòng điền đầy đủ mã và tên trạng thái')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await axios.put(`/trangthai/${editingItem.MaTrangThai}`, formData)
      } else {
        await axios.post('/trangthai', formData)
      }
      setShowModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa trạng thái này?')) return

    try {
      await axios.delete(`/trangthai/${id}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const getBadgeVariant = (mauSac?: string): 'success' | 'info' | 'warning' | 'danger' | 'default' => {
    switch (mauSac) {
      case 'green': return 'success'
      case 'blue': return 'info'
      case 'yellow':
      case 'orange': return 'warning'
      case 'red': return 'danger'
      default: return 'default'
    }
  }

  const columns = [
    { key: 'MaTrangThai', header: 'ID', className: 'w-16' },
    { key: 'MaTrangThaiText', header: 'Mã trạng thái' },
    { 
      key: 'TenTrangThai', 
      header: 'Tên trạng thái',
      render: (item: TrangThai) => (
        <Badge variant={getBadgeVariant(item.MauSac)}>
          {item.TenTrangThai}
        </Badge>
      )
    },
    { 
      key: 'MauSac', 
      header: 'Màu sắc',
      render: (item: TrangThai) => {
        const color = MAU_SAC_OPTIONS.find(o => o.value === item.MauSac)
        return color?.label || item.MauSac || '-'
      }
    },
    { key: 'MoTa', header: 'Mô tả' },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'w-32',
      render: (item: TrangThai) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(item)}>
            Sửa
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item.MaTrangThai)}>
            Xóa
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      <PageHeader 
        title="Quản lý Trạng thái" 
        subtitle="Thêm, sửa, xóa các trạng thái hàng hóa trong hệ thống"
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              value={searchKeyword}
              onChange={setSearchKeyword}
              onSearch={fetchData}
              placeholder="Tìm kiếm trạng thái..."
            />
          </div>
          <Button onClick={openAddModal}>+ Thêm trạng thái</Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={trangThais}
          loading={loading}
          emptyText="Chưa có trạng thái nào"
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Sửa trạng thái' : 'Thêm trạng thái'}
      >
        <div className="space-y-4">
          <Input
            label="Mã trạng thái *"
            placeholder="Ví dụ: moi, dang_dung, hong"
            value={formData.MaTrangThaiText}
            onChange={(e) => setFormData({ ...formData, MaTrangThaiText: e.target.value })}
          />
          <Input
            label="Tên trạng thái *"
            placeholder="Ví dụ: Mới, Đang dùng, Hỏng"
            value={formData.TenTrangThai}
            onChange={(e) => setFormData({ ...formData, TenTrangThai: e.target.value })}
          />
          <Select
            label="Màu hiển thị"
            options={MAU_SAC_OPTIONS}
            value={formData.MauSac}
            onChange={(v) => setFormData({ ...formData, MauSac: v })}
          />
          <Input
            label="Mô tả"
            placeholder="Mô tả thêm về trạng thái"
            value={formData.MoTa}
            onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TrangThaiPage
