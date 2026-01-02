import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-700 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Trang không tồn tại</p>
        <Link 
          to={ROUTES.HOME} 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
