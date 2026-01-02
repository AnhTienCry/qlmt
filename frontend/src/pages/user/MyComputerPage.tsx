export default function MyComputerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Máy tính của tôi</h1>
        <p className="text-gray-400 mt-1">Thông tin máy tính được gán cho bạn</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-6">
        <p className="text-gray-400">Chưa có máy tính nào được gán cho bạn.</p>
      </div>
    </div>
  )
}
