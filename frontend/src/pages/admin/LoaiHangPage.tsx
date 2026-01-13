import { useState, useEffect, useCallback } from 'react'
import axios from '@/libs/axios'
import { Button, Input, Card, Modal, Table, PageHeader, SearchInput } from '@/components/ui'

interface LoaiHang {
  MaLoai: number
  MaLoaiText: string
  TenLoai: string
  MoTa?: string
  NgayTao?: string
}

const LoaiHangPage = () => {
  const [loaiHangs, setLoaiHangs] = useState<LoaiHang[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LoaiHang | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    MaLoaiText: '',
    TenLoai: '',
    MoTa: ''
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchKeyword) params.search = searchKeyword
      
      const res = await axios.get('/loaihang', { params })
      setLoaiHangs(res.data.data || [])
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
      MaLoaiText: '',
      TenLoai: '',
      MoTa: ''
    })
    setShowModal(true)
  }

  const openEditModal = (item: LoaiHang) => {
    setEditingItem(item)
    setFormData({
      MaLoaiText: item.MaLoaiText,
      TenLoai: item.TenLoai,
      MoTa: item.MoTa || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.MaLoaiText || !formData.TenLoai) {
      alert('Vui lòng điền đầy đủ mã loại và tên loại')
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await axios.put(`/loaihang/${editingItem.MaLoai}`, formData)
      } else {
        await axios.post('/loaihang', formData)
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
    if (!confirm('Bạn có chắc muốn xóa loại hàng này?')) return

    try {
      await axios.delete(`/loaihang/${id}`)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const columns = [
    { key: 'MaLoai', header: 'ID', className: 'w-16' },
    { key: 'MaLoaiText', header: 'Mã loại' },
    { key: 'TenLoai', header: 'Tên loại hàng' },
    { key: 'MoTa', header: 'Mô tả' },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'w-32',
      render: (item: LoaiHang) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(item)}>
            Sửa
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item.MaLoai)}>
            Xóa
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      <PageHeader 
        title="Quản lý Loại hàng" 
        subtitle="Thêm, sửa, xóa các loại hàng hóa trong hệ thống"
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              value={searchKeyword}
              onChange={setSearchKeyword}
              onSearch={fetchData}
              placeholder="Tìm kiếm loại hàng..."
            />
          </div>
          <Button onClick={openAddModal}>+ Thêm loại hàng</Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={loaiHangs}
          loading={loading}
          emptyText="Chưa có loại hàng nào"
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Sửa loại hàng' : 'Thêm loại hàng'}
      >
        <div className="space-y-4">
          <Input
            label="Mã loại *"
            placeholder="Ví dụ: may_tinh, man_hinh"
            value={formData.MaLoaiText}
            onChange={(e) => setFormData({ ...formData, MaLoaiText: e.target.value })}
          />
          <Input
            label="Tên loại hàng *"
            placeholder="Ví dụ: Máy tính, Màn hình"
            value={formData.TenLoai}
            onChange={(e) => setFormData({ ...formData, TenLoai: e.target.value })}
          />
          <Input
            label="Mô tả"
            placeholder="Mô tả thêm về loại hàng"
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

export default LoaiHangPage
