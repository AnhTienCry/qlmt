// Component hiển thị phản hồi từ IT - dùng chung cho User, IT, Director

interface FeedbackTimelineProps {
  ghiChuIT: string | null
  viewerRole: 'user' | 'it' | 'director'
  className?: string
}

// Kiểm tra dòng có phải format phản hồi không
function isFeedbackLine(line: string): boolean {
  return line.includes('[IT→') || line.includes('[Phản hồi ')
}

export default function FeedbackTimeline({ ghiChuIT, viewerRole, className = '' }: FeedbackTimelineProps) {
  if (!ghiChuIT) return null
  
  // Tách các dòng và chỉ lấy những dòng có format phản hồi
  const lines = ghiChuIT.split('\n').filter(l => l.trim() && isFeedbackLine(l))
  
  // Lọc theo role
  const filteredLines = lines.filter(line => {
    // Kiểm tra dòng này gửi cho ai
    const isForUser = line.includes('[IT→User]:') || line.includes('[Phản hồi User]:')
    const isForGD = line.includes('[IT→GĐ]:') || line.includes('[Phản hồi GĐ]:')
    const isForBoth = line.includes('[IT→User+GĐ]:') || line.includes('[Phản hồi User+GĐ]:')
    
    // IT xem tất cả phản hồi
    if (viewerRole === 'it') return true
    
    // User xem: phản hồi cho User hoặc User+GĐ
    if (viewerRole === 'user') {
      return isForUser || isForBoth
    }
    
    // GĐ xem: phản hồi cho GĐ hoặc User+GĐ
    if (viewerRole === 'director') {
      return isForGD || isForBoth
    }
    
    return false
  })

  if (filteredLines.length === 0) return null

  // Parse và hiển thị từng dòng
  const parseAndDisplay = (line: string, idx: number) => {
    let time = ''
    let recipient = ''
    let content = line

    // Parse format mới: [2026-01-04 10:30][IT→User]: nội dung
    const timeMatch = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\]/)
    if (timeMatch) {
      time = timeMatch[1]
      content = line.substring(timeMatch[0].length)
    }

    // Parse recipient
    if (content.includes('[IT→User]:') || content.includes('[Phản hồi User]:')) {
      recipient = 'User'
      content = content.replace(/\[IT→User\]:|\[Phản hồi User\]:/, '').trim()
    } else if (content.includes('[IT→User+GĐ]:') || content.includes('[Phản hồi User+GĐ]:')) {
      recipient = 'User+GĐ'
      content = content.replace(/\[IT→User\+GĐ\]:|\[Phản hồi User\+GĐ\]:/, '').trim()
    } else if (content.includes('[IT→GĐ]:') || content.includes('[Phản hồi GĐ]:')) {
      recipient = 'GĐ'
      content = content.replace(/\[IT→GĐ\]:|\[Phản hồi GĐ\]:/, '').trim()
    }

    return (
      <div key={idx} className="pl-3 border-l-2 border-cyan-500">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-cyan-400 text-xs font-medium">🔧 IT</span>
          <span className="text-gray-500 text-xs">→</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            recipient === 'User' 
              ? 'bg-blue-500/20 text-blue-400'
              : recipient === 'GĐ'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-orange-500/20 text-orange-400'
          }`}>
            {recipient === 'User' ? '👤 User' : recipient === 'GĐ' ? '👔 GĐ' : '👥 Cả hai'}
          </span>
          {time && <span className="text-gray-500 text-xs ml-auto">{time}</span>}
        </div>
        <p className="text-white text-sm">{content}</p>
      </div>
    )
  }

  return (
    <div className={`bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 ${className}`}>
      <p className="text-orange-400 text-sm font-medium mb-3">
        💬 Phản hồi từ IT ({filteredLines.length})
      </p>
      <div className="space-y-3">
        {filteredLines.map((line, idx) => parseAndDisplay(line, idx))}
      </div>
    </div>
  )
}
