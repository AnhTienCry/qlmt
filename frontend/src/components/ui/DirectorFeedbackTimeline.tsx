// Component hiển thị phản hồi từ Giám đốc - dùng chung cho User, IT, Director

interface DirectorFeedbackTimelineProps {
  ghiChuGD: string | null
  viewerRole: 'user' | 'it' | 'director'
  className?: string
}

// Kiểm tra dòng có phải format phản hồi không
function isFeedbackLine(line: string): boolean {
  return line.includes('[GĐ→')
}

export default function DirectorFeedbackTimeline({ ghiChuGD, viewerRole, className = '' }: DirectorFeedbackTimelineProps) {
  if (!ghiChuGD) return null
  
  // Tách các dòng và chỉ lấy những dòng có format phản hồi
  const lines = ghiChuGD.split('\n').filter(l => l.trim() && isFeedbackLine(l))
  
  // Lọc theo role
  const filteredLines = lines.filter(line => {
    // Kiểm tra dòng này gửi cho ai
    const isForUser = line.includes('[GĐ→User]:')
    const isForIT = line.includes('[GĐ→IT]:')
    const isForBoth = line.includes('[GĐ→User+IT]:')
    
    // GĐ xem tất cả phản hồi đã gửi
    if (viewerRole === 'director') return true
    
    // User xem: phản hồi cho User hoặc User+IT
    if (viewerRole === 'user') {
      return isForUser || isForBoth
    }
    
    // IT xem: phản hồi cho IT hoặc User+IT
    if (viewerRole === 'it') {
      return isForIT || isForBoth
    }
    
    return false
  })

  // Loại bỏ dòng phản hồi thường nếu đã có dòng [Đã duyệt] hoặc [Từ chối] cùng nội dung
  const uniqueLines = filteredLines.filter((line, idx) => {
    // Lấy nội dung sau [GĐ→...]:
    const match = line.match(/\[GĐ→[^\]]+\]:\s*(.*)/)
    if (!match) return true
    
    let content = match[1].trim()
    // Nếu đây là dòng thường (không có [Đã duyệt]/[Từ chối])
    if (!content.startsWith('[Đã duyệt]') && !content.startsWith('[Từ chối]')) {
      // Kiểm tra xem có dòng nào khác có cùng nội dung với [Đã duyệt] hoặc [Từ chối] không
      const hasSameContentWithAction = filteredLines.some((other, otherIdx) => {
        if (otherIdx === idx) return false
        const otherMatch = other.match(/\[GĐ→[^\]]+\]:\s*\[(Đã duyệt|Từ chối)\]\s*(.*)/)
        if (!otherMatch) return false
        // So sánh nội dung (loại bỏ dấu cách thừa, lowercase)
        const otherContent = otherMatch[2].trim().toLowerCase().replace(/\s+/g, ' ')
        const thisContent = content.toLowerCase().replace(/\s+/g, ' ')
        return thisContent === otherContent
      })
      // Nếu có, ẩn dòng này (vì dòng [Đã duyệt]/[Từ chối] đã hiển thị)
      if (hasSameContentWithAction) return false
    }
    return true
  })

  if (uniqueLines.length === 0) return null

  // Parse và hiển thị từng dòng
  const parseAndDisplay = (line: string, idx: number) => {
    let time = ''
    let recipient = ''
    let content = line
    let isApproval = false
    let isRejection = false

    // Parse format: [2026-01-04 10:30][GĐ→User]: nội dung
    const timeMatch = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\]/)
    if (timeMatch) {
      time = timeMatch[1]
      content = line.substring(timeMatch[0].length)
    }

    // Parse recipient
    if (content.includes('[GĐ→User]:')) {
      recipient = 'User'
      content = content.replace(/\[GĐ→User\]:/, '').trim()
    } else if (content.includes('[GĐ→User+IT]:')) {
      recipient = 'User+IT'
      content = content.replace(/\[GĐ→User\+IT\]:/, '').trim()
    } else if (content.includes('[GĐ→IT]:')) {
      recipient = 'IT'
      content = content.replace(/\[GĐ→IT\]:/, '').trim()
    }

    // Check if this is an approval/rejection note
    if (content.startsWith('[Đã duyệt]')) {
      isApproval = true
      content = content.replace('[Đã duyệt]', '').trim()
    } else if (content.startsWith('[Từ chối]')) {
      isRejection = true
      content = content.replace('[Từ chối]', '').trim()
    }

    return (
      <div key={idx} className={`pl-3 border-l-2 ${
        isApproval ? 'border-green-500' : isRejection ? 'border-red-500' : 'border-purple-500'
      }`}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-xs font-medium ${
            isApproval ? 'text-green-400' : isRejection ? 'text-red-400' : 'text-purple-400'
          }`}>
            {isApproval ? '✓ GĐ duyệt' : isRejection ? '✗ GĐ từ chối' : '👔 GĐ'}
          </span>
          {!isApproval && !isRejection && (
            <>
              <span className="text-gray-500 text-xs">→</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                recipient === 'User' 
                  ? 'bg-blue-500/20 text-blue-400'
                  : recipient === 'IT'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-orange-500/20 text-orange-400'
              }`}>
                {recipient === 'User' ? '👤 User' : recipient === 'IT' ? '🔧 IT' : '👥 Cả hai'}
              </span>
            </>
          )}
          {time && <span className="text-gray-500 text-xs ml-auto">{time}</span>}
        </div>
        <p className="text-white text-sm">{content || (isApproval ? 'Đề xuất đã được duyệt' : isRejection ? 'Đề xuất đã bị từ chối' : '')}</p>
      </div>
    )
  }

  return (
    <div className={`bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 ${className}`}>
      <p className="text-purple-400 text-sm font-medium mb-3">
        💬 Phản hồi từ Giám đốc ({uniqueLines.length})
      </p>
      <div className="space-y-3">
        {uniqueLines.map((line, idx) => parseAndDisplay(line, idx))}
      </div>
    </div>
  )
}
