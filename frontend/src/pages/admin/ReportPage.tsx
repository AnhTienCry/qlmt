import { useState, useEffect } from 'react'
import api from '@/libs/axios'
import { Download, FileSpreadsheet, Search, Package, History, Users } from 'lucide-react'
import { exportBaoCaoNhapXuatTon, exportToExcel, exportBaoCaoThietBiSuDung } from '@/libs/excel'

interface BaoCaoItem {
  MaHang: string
  TenHang: string
  MaKho: string
  TenKho: string
  DauKy: number
  Nhap: number
  Xuat: number
  Ton: number
}

interface NhapKhoItem {
  SoPhieuN: string
  NgayNhap: string
  MaHang: string
  TenHang: string
  TenKho: string
  TenNCC: string
  TenNguoiGiao: string
  TenNguoiNhan: string
  SoLuong: number
  DonGia: number
  DienGiai: string
}

interface XuatKhoItem {
  SoPhieuX: string
  NgayXuat: string
  MaHang: string
  TenHang: string
  TenKho: string
  TenNguoiGiao: string
  TenNguoiNhan: string
  SoLuong: number
  DonGia: number
  DienGiai: string
}

interface LichSuThietBi {
  LoaiNV: string
  NgayGD: string
  SoPhieu: string
  TuKho: string
  DenKho: string
  NguoiGiao: string
  NguoiNhan: string
  SoLuong: number
  DienGiai: string
}

interface ThietBiSuDung {
  MaHang: number
  MaTS: string
  TenHang: string
  LoaiHang: string
  TrangThai: string
  NguoiHoacKhoDangGiu: string
  MaNV_DangDung: number | null
  GiaoDichCuoi: string
  NgayGiaoDichCuoi: string
}

interface HangHoa {
  MaHang: number
  MaTS: string
  TenHang: string
}

interface Kho {
  maKho: number
  tenKho: string
}

interface NhanVien {
  maNV: number
  maNVText: string
  tenNV: string
}

interface NCC {
  MaNCC: number
  TenNCC: string
}

type TabType = 'nhapxuatton' | 'nhapkho' | 'xuatkho' | 'theodoi' | 'thietbisudung'

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('nhapxuatton')
  const [loading, setLoading] = useState(false)
  
  // Filters
  const today = new Date()
  const firstDayOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const todayStr = today.toISOString().split('T')[0]
  const [tuNgay, setTuNgay] = useState(firstDayOfMonth)
  const [denNgay, setDenNgay] = useState(todayStr)
  const [maKho, setMaKho] = useState<number | undefined>()
  const [nguoiGiaoFilter, setNguoiGiaoFilter] = useState<string>('') // format: ncc-123 or nv-456
  const [nguoiNhan, setNguoiNhan] = useState<number | undefined>()
  const [maHang, setMaHang] = useState<number | undefined>()

  // Data
  const [dataBC, setDataBC] = useState<BaoCaoItem[]>([])
  const [dataNhap, setDataNhap] = useState<NhapKhoItem[]>([])
  const [dataXuat, setDataXuat] = useState<XuatKhoItem[]>([])
  const [lichSu, setLichSu] = useState<LichSuThietBi[]>([])
  const [thietBiInfo, setThietBiInfo] = useState<any>(null)
  const [dataThietBiSuDung, setDataThietBiSuDung] = useState<ThietBiSuDung[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Lookup data
  const [hangHoas, setHangHoas] = useState<HangHoa[]>([])
  const [khos, setKhos] = useState<Kho[]>([])
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([])
  const [nccs, setNccs] = useState<NCC[]>([])

  useEffect(() => {
    fetchLookupData()
  }, [])

  const fetchLookupData = async () => {
    try {
      const [hhRes, khoRes, nvRes, nccRes] = await Promise.all([
        api.get('/hanghoa'),
        api.get('/warehouses'),
        api.get('/employees'),
        api.get('/ncc'),
      ])
      setHangHoas(hhRes.data?.data || [])
      setKhos(khoRes.data?.data || [])
      setNhanViens(nvRes.data?.data || [])
      setNccs(nccRes.data?.data || [])
    } catch (error) {
      console.error('Error fetching lookup:', error)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      switch (activeTab) {
        case 'nhapxuatton': {
          const res = await api.get('/stock/baocao/nhapxuatton', { params: { tuNgay, denNgay, maKho } })
          setDataBC(res.data?.data || [])
          break
        }
        case 'nhapkho': {
          // Parse nguoiGiaoFilter: ncc-123 -> maNCC=123, nv-456 -> maNV=456
          let maNCC, maNV
          if (nguoiGiaoFilter.startsWith('ncc-')) {
            maNCC = parseInt(nguoiGiaoFilter.replace('ncc-', ''))
          } else if (nguoiGiaoFilter.startsWith('nv-')) {
            maNV = parseInt(nguoiGiaoFilter.replace('nv-', ''))
          }
          const res = await api.get('/stock/baocao/nhapkho', {
            params: { tuNgay, denNgay, maKho, maNCC, maNV }
          })
          setDataNhap(res.data?.data || [])
          break
        }
        case 'xuatkho': {
          const res = await api.get('/stock/baocao/xuatkho', {
            params: { tuNgay, denNgay, maKho, nguoiGiao: nguoiGiaoFilter.startsWith('nv-') ? parseInt(nguoiGiaoFilter.replace('nv-', '')) : undefined, nguoiNhan }
          })
          setDataXuat(res.data?.data || [])
          break
        }
        case 'theodoi': {
          if (!maHang) {
            alert('Vui lòng chọn thiết bị')
            setLoading(false)
            return
          }
          const res = await api.get(`/stock/baocao/theodoi/${maHang}`)
          if (res.data?.data) {
            setThietBiInfo(res.data.data.thietBi)
            setLichSu(res.data.data.lichSu || [])
          }
          break
        }
        case 'thietbisudung': {
          const res = await api.get('/stock/baocao/thietbi-sudung')
          setDataThietBiSuDung(res.data?.data || [])
          break
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    switch (activeTab) {
      case 'nhapxuatton':
        if (dataBC.length === 0) return alert('Không có dữ liệu')
        exportBaoCaoNhapXuatTon(dataBC, tuNgay, denNgay)
        break
      case 'nhapkho':
        if (dataNhap.length === 0) return alert('Không có dữ liệu')
        exportToExcel(dataNhap.map((d, i) => ({
          stt: i + 1, soPhieu: d.SoPhieuN, ngay: new Date(d.NgayNhap).toLocaleDateString('vi-VN'),
          maHang: d.MaHang, tenHang: d.TenHang, kho: d.TenKho, nguoiGiao: d.TenNCC || d.TenNguoiGiao || '',
          nguoiNhan: d.TenNguoiNhan, soLuong: d.SoLuong, donGia: d.DonGia
        })), [
          { key: 'stt', title: 'STT' }, { key: 'soPhieu', title: 'Số phiếu' },
          { key: 'ngay', title: 'Ngày nhập' }, { key: 'maHang', title: 'Mã hàng' },
          { key: 'tenHang', title: 'Tên hàng' }, { key: 'kho', title: 'Kho' },
          { key: 'nguoiGiao', title: 'Người giao' }, { key: 'nguoiNhan', title: 'Người nhận' },
          { key: 'soLuong', title: 'SL' }, { key: 'donGia', title: 'Đơn giá' }
        ], { filename: `BaoCaoNhapKho_${tuNgay}_${denNgay}` })
        break
      case 'xuatkho':
        if (dataXuat.length === 0) return alert('Không có dữ liệu')
        exportToExcel(dataXuat.map((d, i) => ({
          stt: i + 1, soPhieu: d.SoPhieuX, ngay: new Date(d.NgayXuat).toLocaleDateString('vi-VN'),
          maHang: d.MaHang, tenHang: d.TenHang, kho: d.TenKho, nguoiGiao: d.TenNguoiGiao,
          nguoiNhan: d.TenNguoiNhan, soLuong: d.SoLuong, donGia: d.DonGia
        })), [
          { key: 'stt', title: 'STT' }, { key: 'soPhieu', title: 'Số phiếu' },
          { key: 'ngay', title: 'Ngày xuất' }, { key: 'maHang', title: 'Mã hàng' },
          { key: 'tenHang', title: 'Tên hàng' }, { key: 'kho', title: 'Kho' },
          { key: 'nguoiGiao', title: 'Người giao' }, { key: 'nguoiNhan', title: 'Người nhận' },
          { key: 'soLuong', title: 'SL' }, { key: 'donGia', title: 'Đơn giá' }
        ], { filename: `BaoCaoXuatKho_${tuNgay}_${denNgay}` })
        break
    }
  }

  const getLoaiNVBadge = (loai: string) => {
    const map: Record<string, { label: string; color: string }> = {
      'NHAP': { label: 'Nhập kho', color: 'bg-green-500/20 text-green-400' },
      'XUAT': { label: 'Xuất kho', color: 'bg-red-500/20 text-red-400' },
      'DIEU_CHUYEN': { label: 'Điều chuyển', color: 'bg-blue-500/20 text-blue-400' },
      'Nhập kho': { label: 'Nhập kho', color: 'bg-green-500/20 text-green-400' },
      'Xuất kho': { label: 'Xuất kho', color: 'bg-red-500/20 text-red-400' },
      'Điều chuyển': { label: 'Điều chuyển', color: 'bg-blue-500/20 text-blue-400' },
      '-': { label: '-', color: 'bg-gray-500/20 text-gray-400' },
    }
    const info = map[loai] || { label: loai, color: 'bg-gray-500/20 text-gray-400' }
    return <span className={`px-2 py-1 rounded-full text-xs ${info.color}`}>{info.label}</span>
  }

  const tabs = [
    { id: 'nhapxuatton', label: 'Nhập xuất tồn', icon: FileSpreadsheet },
    { id: 'nhapkho', label: 'Báo cáo nhập kho', icon: Package },
    { id: 'xuatkho', label: 'Báo cáo xuất kho', icon: Package },
    { id: 'theodoi', label: 'Theo dõi thiết bị', icon: History },
    { id: 'thietbisudung', label: 'TB đang sử dụng', icon: Users },
  ]

  // Tính tổng NXT
  const totals = {
    dauKy: dataBC.reduce((sum, item) => sum + (item.DauKy || 0), 0),
    nhap: dataBC.reduce((sum, item) => sum + (item.Nhap || 0), 0),
    xuat: dataBC.reduce((sum, item) => sum + (item.Xuat || 0), 0),
    ton: dataBC.reduce((sum, item) => sum + (item.Ton || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-blue-500" />
          Báo cáo
        </h1>
        <p className="text-gray-500 text-sm mt-1">Xem các loại báo cáo nhập xuất kho</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2e2e2e] pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as TabType); setHasSearched(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2e2e2e]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          {activeTab !== 'theodoi' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Từ ngày</label>
                <input type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)}
                  className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Đến ngày</label>
                <input type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)}
                  className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500" />
              </div>
            </>
          )}

          {(activeTab === 'nhapkho' || activeTab === 'xuatkho' || activeTab === 'nhapxuatton') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Kho</label>
              <select value={maKho || ''} onChange={(e) => setMaKho(e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500 min-w-[150px]">
                <option value="">Tất cả</option>
                {khos.map(k => <option key={k.maKho} value={k.maKho}>{k.tenKho}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'nhapkho' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Người giao</label>
              <select value={nguoiGiaoFilter} onChange={(e) => setNguoiGiaoFilter(e.target.value)}
                className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500 min-w-[180px]">
                <option value="">Tất cả</option>
                <optgroup label="Nhà cung cấp">
                  {nccs.map(n => <option key={`ncc-${n.MaNCC}`} value={`ncc-${n.MaNCC}`}>{n.TenNCC}</option>)}
                </optgroup>
                <optgroup label="Nhân viên">
                  {nhanViens.map(n => <option key={`nv-${n.maNV}`} value={`nv-${n.maNV}`}>{n.maNVText} - {n.tenNV}</option>)}
                </optgroup>
              </select>
            </div>
          )}

          {activeTab === 'xuatkho' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Người giao</label>
                <select value={nguoiGiaoFilter} onChange={(e) => setNguoiGiaoFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500 min-w-[150px]">
                  <option value="">Tất cả</option>
                  {nhanViens.map(n => <option key={n.maNV} value={`nv-${n.maNV}`}>{n.maNVText} - {n.tenNV}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Người nhận</label>
                <select value={nguoiNhan || ''} onChange={(e) => setNguoiNhan(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500 min-w-[150px]">
                  <option value="">Tất cả</option>
                  {nhanViens.map(n => <option key={n.maNV} value={n.maNV}>{n.maNVText} - {n.tenNV}</option>)}
                </select>
              </div>
            </>
          )}

          {activeTab === 'theodoi' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Chọn thiết bị</label>
              <select value={maHang || ''} onChange={(e) => setMaHang(e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-3 py-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg text-white focus:outline-none focus:border-blue-500 min-w-[250px]">
                <option value="">-- Chọn thiết bị --</option>
                {hangHoas.map(h => <option key={h.MaHang} value={h.MaHang}>{h.MaTS} - {h.TenHang}</option>)}
              </select>
            </div>
          )}

          <button onClick={handleSearch} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition">
            <Search className="w-4 h-4" />
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </button>

          {hasSearched && activeTab !== 'theodoi' && (
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* Report Content */}
      {hasSearched && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden">
          {activeTab === 'nhapxuatton' && (
            <>
              <div className="p-4 border-b border-[#2e2e2e] text-center">
                <h2 className="text-lg font-semibold text-white">BÁO CÁO NHẬP XUẤT TỒN</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Từ {new Date(tuNgay).toLocaleDateString('vi-VN')} đến {new Date(denNgay).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-16">STT</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Kho</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mã hàng</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tên hàng</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Đầu kỳ</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Nhập</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Xuất</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase w-24">Tồn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2e2e]">
                    {dataBC.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">Không có dữ liệu</td></tr>
                    ) : (
                      <>
                        {dataBC.map((item, index) => (
                          <tr key={`${item.MaHang}-${item.MaKho}`} className="hover:bg-[#252525]">
                            <td className="px-4 py-3 text-sm text-gray-300 text-center">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-purple-400 font-medium">{item.TenKho}</td>
                            <td className="px-4 py-3 text-sm text-white font-medium">{item.MaHang}</td>
                            <td className="px-4 py-3 text-sm text-gray-300">{item.TenHang}</td>
                            <td className="px-4 py-3 text-sm text-gray-300 text-center">{item.DauKy}</td>
                            <td className="px-4 py-3 text-sm text-green-400 text-center font-medium">{item.Nhap > 0 ? `+${item.Nhap}` : item.Nhap}</td>
                            <td className="px-4 py-3 text-sm text-red-400 text-center font-medium">{item.Xuat > 0 ? `-${item.Xuat}` : item.Xuat}</td>
                            <td className="px-4 py-3 text-sm text-blue-400 text-center font-semibold">{item.Ton}</td>
                          </tr>
                        ))}
                        <tr className="bg-[#0f0f0f] font-semibold">
                          <td className="px-4 py-3 text-sm text-white text-center" colSpan={4}>TỔNG CỘNG</td>
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
            </>
          )}

          {activeTab === 'nhapkho' && (
            <>
              <div className="p-4 border-b border-[#2e2e2e] text-center">
                <h2 className="text-lg font-semibold text-white">BÁO CÁO NHẬP KHO</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Từ {new Date(tuNgay).toLocaleDateString('vi-VN')} đến {new Date(denNgay).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">STT</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Số phiếu</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ngày nhập</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Hàng hóa</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Kho</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người giao</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người nhận</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">SL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2e2e]">
                    {dataNhap.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">Không có dữ liệu</td></tr>
                    ) : dataNhap.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#252525]">
                        <td className="px-4 py-3 text-sm text-gray-300 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{item.SoPhieuN}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{new Date(item.NgayNhap).toLocaleDateString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.MaHang} - {item.TenHang}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenKho}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenNCC || item.TenNguoiGiao || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenNguoiNhan || '-'}</td>
                        <td className="px-4 py-3 text-sm text-green-400 text-center font-medium">{item.SoLuong}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'xuatkho' && (
            <>
              <div className="p-4 border-b border-[#2e2e2e] text-center">
                <h2 className="text-lg font-semibold text-white">BÁO CÁO XUẤT KHO</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Từ {new Date(tuNgay).toLocaleDateString('vi-VN')} đến {new Date(denNgay).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">STT</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Số phiếu</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ngày xuất</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Hàng hóa</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Kho</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người giao</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người nhận</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">SL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2e2e]">
                    {dataXuat.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">Không có dữ liệu</td></tr>
                    ) : dataXuat.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#252525]">
                        <td className="px-4 py-3 text-sm text-gray-300 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{item.SoPhieuX}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{new Date(item.NgayXuat).toLocaleDateString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.MaHang} - {item.TenHang}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenKho}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenNguoiGiao || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenNguoiNhan || '-'}</td>
                        <td className="px-4 py-3 text-sm text-red-400 text-center font-medium">{item.SoLuong}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'theodoi' && thietBiInfo && (
            <>
              <div className="p-4 border-b border-[#2e2e2e]">
                <h2 className="text-lg font-semibold text-white">THEO DÕI THIẾT BỊ</h2>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-gray-400">Mã: <span className="text-white">{thietBiInfo.MaTS}</span></span>
                  <span className="text-gray-400">Tên: <span className="text-white">{thietBiInfo.TenHang}</span></span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Loại</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ngày</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Số phiếu</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Từ kho</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Đến kho</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người giao</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người nhận</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Diễn giải</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2e2e]">
                    {lichSu.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">Chưa có lịch sử</td></tr>
                    ) : lichSu.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#252525]">
                        <td className="px-4 py-3">{getLoaiNVBadge(item.LoaiNV)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{new Date(item.NgayGD).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{item.SoPhieu}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TuKho || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.DenKho || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.NguoiGiao || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.NguoiNhan || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{item.DienGiai || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'thietbisudung' && (
            <>
              <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between">
                <div className="text-center flex-1">
                  <h2 className="text-lg font-semibold text-white">BÁO CÁO THIẾT BỊ ĐANG SỬ DỤNG</h2>
                  <p className="text-gray-400 text-sm mt-1">Danh sách thiết bị và người/kho đang giữ</p>
                </div>
                <button
                  onClick={() => exportBaoCaoThietBiSuDung(dataThietBiSuDung)}
                  disabled={dataThietBiSuDung.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white text-sm"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2e2e2e] bg-[#0f0f0f]">
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">STT</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Mã TS</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Tên thiết bị</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Loại</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Trạng thái</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Người/Kho đang giữ</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">GD cuối</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2e2e]">
                    {dataThietBiSuDung.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">Không có dữ liệu</td></tr>
                    ) : dataThietBiSuDung.map((item, idx) => (
                      <tr key={item.MaHang} className="hover:bg-[#252525]">
                        <td className="px-4 py-3 text-sm text-gray-300 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{item.MaTS}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{item.TenHang}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{item.LoaiHang || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.TrangThai === 'Trong kho' 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {item.TrangThai || 'Chưa giao dịch'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-purple-400 font-medium">{item.NguoiHoacKhoDangGiu || '-'}</td>
                        <td className="px-4 py-3 text-center">{item.GiaoDichCuoi ? getLoaiNVBadge(item.GiaoDichCuoi) : '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {item.NgayGiaoDichCuoi ? new Date(item.NgayGiaoDichCuoi).toLocaleDateString('vi-VN') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info box khi chưa search */}
      {!hasSearched && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8 text-center">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-white mb-2">
            {activeTab === 'theodoi' ? 'Chọn thiết bị để xem lịch sử' : 
             activeTab === 'thietbisudung' ? 'Nhấn "Xem báo cáo" để xem danh sách thiết bị' :
             'Chọn khoảng thời gian để xem báo cáo'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'theodoi' 
              ? 'Chọn thiết bị từ danh sách, sau đó nhấn "Xem báo cáo" để xem toàn bộ lịch sử nghiệp vụ.' 
              : activeTab === 'thietbisudung'
              ? 'Xem danh sách tất cả thiết bị và trạng thái hiện tại (đang ai giữ, trong kho nào).'
              : 'Chọn ngày bắt đầu và ngày kết thúc, sau đó nhấn "Xem báo cáo" để xem chi tiết.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportPage
