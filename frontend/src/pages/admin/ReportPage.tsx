import { useState } from 'react'
import api from '@/libs/axios'
import { Download, FileSpreadsheet, Search } from 'lucide-react'
import { exportBaoCaoNhapXuatTon } from '@/libs/excel'

interface BaoCaoItem {
  MaHang: string
  TenHang: string
  DauKy: number
  Nhap: number
  Xuat: number
  Ton: number
}

const ReportPage = () => {
  const [data, setData] = useState<BaoCaoItem[]>([])
  const [loading, setLoading] = useState(false)
  
  // Mặc định từ đầu tháng đến hôm nay
  const today = new Date()
  const firstDayOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const todayStr = today.toISOString().split('T')[0]
  
  const [tuNgay, setTuNgay] = useState(firstDayOfMonth)
  const [denNgay, setDenNgay] = useState(todayStr)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    try {
      setLoading(true)
      const res = await api.get('/stock/baocao/nhapxuatton', {
        params: { tuNgay, denNgay }
      })
      setData(res.data?.data || [])
      setHasSearched(true)
    } catch (error) {
      console.error('Error fetching report:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (data.length === 0) {
      alert('Không có dữ liệu để xuất')
      return
    }
    exportBaoCaoNhapXuatTon(data, tuNgay, denNgay)
  }

  // Tính tổng
  const totals = {
    dauKy: data.reduce((sum, item) => sum + (item.DauKy || 0), 0),
    nhap: data.reduce((sum, item) => sum + (item.Nhap || 0), 0),
    xuat: data.reduce((sum, item) => sum + (item.Xuat || 0), 0),
    ton: data.reduce((sum, item) => sum + (item.Ton || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-500" />
            Báo cáo nhập xuất tồn
          </h1>
          <p className="text-gray-500 text-sm mt-1">Xem báo cáo nhập xuất tồn kho theo khoảng thời gian</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Từ ngày</label>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
              className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Đến ngày</label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
              className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </button>
          {data.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* Report Table */}
      {hasSearched && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
          {/* Report Header */}
          <div className="p-4 border-b border-[#2e2e2e] text-center">
            <h2 className="text-lg font-semibold text-white">BÁO CÁO NHẬP XUẤT TỒN</h2>
            <p className="text-gray-400 text-sm mt-1">
              Từ ngày {new Date(tuNgay).toLocaleDateString('vi-VN')} đến ngày {new Date(denNgay).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-16">STT</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mã hàng</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tên hàng</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Đầu kỳ</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Nhập</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Xuất</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Tồn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e2e]">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 font-medium">Không có dữ liệu</p>
                      <p className="text-gray-500 text-sm mt-1">Chưa có giao dịch nhập xuất trong khoảng thời gian này</p>
                    </td>
                  </tr>
                ) : (
                  <>
                    {data.map((item, index) => (
                      <tr key={item.MaHang} className="hover:bg-[#252525] transition">
                        <td className="px-4 py-3 text-sm text-gray-300 text-center">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{item.MaHang}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenHang}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-center">{item.DauKy}</td>
                        <td className="px-4 py-3 text-sm text-green-400 text-center font-medium">
                          {item.Nhap > 0 ? `+${item.Nhap}` : item.Nhap}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-400 text-center font-medium">
                          {item.Xuat > 0 ? `-${item.Xuat}` : item.Xuat}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-400 text-center font-semibold">{item.Ton}</td>
                      </tr>
                    ))}
                    {/* Tổng cộng */}
                    <tr className="bg-[#0f0f0f] font-semibold">
                      <td className="px-4 py-3 text-sm text-white text-center" colSpan={3}>TỔNG CỘNG</td>
                      <td className="px-4 py-3 text-sm text-white text-center">{totals.dauKy}</td>
                      <td className="px-4 py-3 text-sm text-green-400 text-center">{totals.nhap}</td>
                      <td className="px-4 py-3 text-sm text-red-400 text-center">{totals.xuat}</td>
                      <td className="px-4 py-3 text-sm text-blue-400 text-center">{totals.ton}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info box khi chưa search */}
      {!hasSearched && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8 text-center">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-white mb-2">Chọn khoảng thời gian để xem báo cáo</h3>
          <p className="text-gray-500">
            Chọn ngày bắt đầu và ngày kết thúc, sau đó nhấn "Xem báo cáo" để xem báo cáo nhập xuất tồn kho.
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportPage
