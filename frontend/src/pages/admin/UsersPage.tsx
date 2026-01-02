import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Key, UserCheck, UserX, Download } from 'lucide-react'
import { authApi } from '@/libs/auth'
import { AdminUser, UserRole, CreateUserRequest } from '@/types/auth.types'
import { PageHeader } from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import SearchInput from '@/components/ui/SearchInput'
import { exportUsers } from '@/libs/excel'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'it', label: 'IT' },
  { value: 'director', label: 'Giám đốc' },
  { value: 'user', label: 'Nhân viên' },
]

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return <Badge variant="danger">Quản trị viên</Badge>
    case 'it':
      return <Badge variant="info">IT</Badge>
    case 'director':
      return <Badge variant="warning">Giám đốc</Badge>
    default:
      return <Badge variant="default">Nhân viên</Badge>
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    password: '',
    role: 'user',
  })
  const [editRole, setEditRole] = useState<UserRole>('user')
  const [editActive, setEditActive] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await authApi.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user =>
    user.Username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      setFormError('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      setFormLoading(true)
      await authApi.createUser(formData)
      setShowCreateModal(false)
      setFormData({ username: '', password: '', role: 'user' })
      fetchUsers()
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Tạo người dùng thất bại')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return

    try {
      setFormLoading(true)
      await authApi.updateUser(selectedUser.UserId, {
        role: editRole,
        isActive: editActive,
      })
      setShowEditModal(false)
      fetchUsers()
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setFormLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      setFormError('Vui lòng nhập mật khẩu mới')
      return
    }

    try {
      setFormLoading(true)
      await authApi.resetPassword(selectedUser.UserId, newPassword)
      setShowResetModal(false)
      setNewPassword('')
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Đặt lại mật khẩu thất bại')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      setFormLoading(true)
      await authApi.deleteUser(selectedUser.UserId)
      setShowDeleteModal(false)
      fetchUsers()
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Xóa thất bại')
    } finally {
      setFormLoading(false)
    }
  }

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user)
    setEditRole(user.Role)
    setEditActive(user.IsActive)
    setFormError(null)
    setShowEditModal(true)
  }

  const openResetModal = (user: AdminUser) => {
    setSelectedUser(user)
    setNewPassword('')
    setFormError(null)
    setShowResetModal(true)
  }

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user)
    setFormError(null)
    setShowDeleteModal(true)
  }

  const columns = [
    {
      key: 'UserId',
      header: 'ID',
      render: (user: AdminUser) => (
        <span className="text-gray-400">#{user.UserId}</span>
      ),
    },
    {
      key: 'Username',
      header: 'Tên đăng nhập',
      render: (user: AdminUser) => (
        <span className="font-medium text-white">{user.Username}</span>
      ),
    },
    {
      key: 'Role',
      header: 'Vai trò',
      render: (user: AdminUser) => getRoleBadge(user.Role),
    },
    {
      key: 'IsActive',
      header: 'Trạng thái',
      render: (user: AdminUser) => (
        user.IsActive ? (
          <div className="flex items-center gap-1.5 text-green-400">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">Hoạt động</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-red-400">
            <UserX className="w-4 h-4" />
            <span className="text-sm">Khóa</span>
          </div>
        )
      ),
    },
    {
      key: 'LastLogin',
      header: 'Đăng nhập gần nhất',
      render: (user: AdminUser) => (
        <span className="text-gray-400 text-sm">
          {user.LastLogin ? new Date(user.LastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
        </span>
      ),
    },
    {
      key: 'NgayTao',
      header: 'Ngày tạo',
      render: (user: AdminUser) => (
        <span className="text-gray-400 text-sm">
          {new Date(user.NgayTao).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(user)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openResetModal(user)}
            className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
            title="Đặt lại mật khẩu"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(user)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`Tổng cộng ${users.length} người dùng trong hệ thống`}
        icon={<Users className="w-6 h-6" />}
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => exportUsers(users)}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={() => {
              setFormData({ username: '', password: '', role: 'user' })
              setFormError(null)
              setShowCreateModal(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        }
      />

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <div className="mb-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm kiếm theo tên đăng nhập..."
          />
        </div>

        <Table
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyText="Không có người dùng nào"
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm người dùng mới"
        icon={<Plus className="w-5 h-5" />}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên đăng nhập <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
              className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              placeholder="Nhập mật khẩu"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vai trò
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as UserRole }))}
              className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa người dùng"
        icon={<Edit2 className="w-5 h-5" />}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}
          
          <div className="bg-[#252525] rounded-xl p-4">
            <p className="text-sm text-gray-400">Tên đăng nhập</p>
            <p className="text-white font-medium">{selectedUser?.Username}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vai trò
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trạng thái
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={editActive}
                  onChange={() => setEditActive(true)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white">Hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!editActive}
                  onChange={() => setEditActive(false)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white">Khóa</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Đặt lại mật khẩu"
        icon={<Key className="w-5 h-5" />}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleResetPassword} disabled={formLoading}>
              {formLoading ? 'Đang xử lý...' : 'Đặt lại'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}
          
          <div className="bg-[#252525] rounded-xl p-4">
            <p className="text-sm text-gray-400">Đặt lại mật khẩu cho</p>
            <p className="text-white font-medium">{selectedUser?.Username}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mật khẩu mới <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
        icon={<Trash2 className="w-5 h-5" />}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-white mb-2">
            Bạn có chắc chắn muốn xóa người dùng
          </p>
          <p className="text-xl font-semibold text-red-400">
            {selectedUser?.Username}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>
    </div>
  )
}
