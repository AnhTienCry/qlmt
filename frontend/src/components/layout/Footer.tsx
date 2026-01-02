export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#2e2e2e] mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Hệ Thống Quản Lý Máy Tính</p>
        </div>
      </div>
    </footer>
  )
}
