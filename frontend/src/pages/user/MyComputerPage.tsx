import { useState, useEffect } from 'react'
import axios from '@/libs/axios'

interface ThietBi {
  MaHang: number
  MaHangText?: string
  TenHang: string
  LoaiHang?: string
  TrangThai?: string
  NgayCap?: string
  TuKho?: string
  NguoiGiao?: string
}

export default function MyComputerPage() {
  const [devices, setDevices] = useState<ThietBi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const res = await axios.get('/stock/my-devices')
      setDevices(res.data.data || [])
    } catch (error) {
      console.error('Lỗi khi lấy thiết bị:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Thiết bị của tôi</h1>
        <p className="text-gray-400 mt-1">Danh sách thiết bị được cấp cho bạn</p>
      </div>

      {devices.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">Chưa có thiết bị nào được cấp cho bạn</p>
          <p className="text-gray-500 text-sm mt-2">Liên hệ IT để được hỗ trợ cấp thiết bị</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <div key={device.MaHang} className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 hover:border-green-500/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{device.TenHang}</h3>
                    {device.MaHangText && (
                      <p className="text-gray-500 text-sm">Mã: {device.MaHangText}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {device.NgayCap && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ngày cấp: {formatDate(device.NgayCap)}
                        </span>
                      )}
                      {device.TuKho && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                          Từ kho: {device.TuKho}
                        </span>
                      )}
                      {device.NguoiGiao && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Người giao: {device.NguoiGiao}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                  Đang sử dụng
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
        <p className="text-gray-400 text-sm">
          💡 <span className="text-gray-300">Lưu ý:</span> Nếu thiết bị gặp sự cố, vui lòng tạo đề xuất sửa chữa để IT hỗ trợ.
        </p>
      </div>
    </div>
  )
}
