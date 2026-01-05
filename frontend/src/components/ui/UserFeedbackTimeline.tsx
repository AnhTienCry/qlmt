// Component hiển thị phản hồi từ User - dùng cho IT, Director, và User

interface UserFeedbackTimelineProps {
  ghiChuIT: string | null
  ghiChuGD: string | null
  viewerRole: 'it' | 'director' | 'user'
  className?: string
}

// Kiểm tra dòng có phải format phản hồi từ User không
function isUserFeedbackLine(line: string): boolean {
  return line.includes('[User→')
}

export default function UserFeedbackTimeline({ ghiChuIT, ghiChuGD, viewerRole, className = '' }: UserFeedbackTimelineProps) {
  // Thu thập phản hồi từ User từ cả ghiChuIT và ghiChuGD
  const allLines: { line: string; source: 'it' | 'gd' }[] = []
  
  if (ghiChuIT) {
    ghiChuIT.split('\n')
      .filter(l => l.trim() && isUserFeedbackLine(l))
      .forEach(line => allLines.push({ line, source: 'it' }))
  }
  
  if (ghiChuGD) {
    ghiChuGD.split('\n')
      .filter(l => l.trim() && isUserFeedbackLine(l))
      .forEach(line => allLines.push({ line, source: 'gd' }))
  }
  
  // Lọc theo role
  const filteredLines = allLines.filter(({ line }) => {
    const isForIT = line.includes('[User→IT]:')
    const isForGD = line.includes('[User→GĐ]:')
    const isForBoth = line.includes('[User→IT+GĐ]:')
    
    // IT xem: phản hồi cho IT hoặc IT+GĐ
    if (viewerRole === 'it') {
      return isForIT || isForBoth
    }
    
    // GĐ xem: phản hồi cho GĐ hoặc IT+GĐ
    if (viewerRole === 'director') {
      return isForGD || isForBoth
    }
    
    // User xem tất cả phản hồi của mình
    if (viewerRole === 'user') {
      return isForIT || isForGD || isForBoth
    }
    
    return false
  })

  // Loại bỏ trùng lặp (nếu cùng nội dung xuất hiện cả 2 nơi)
  const uniqueLines: { line: string; source: 'it' | 'gd' }[] = []
  filteredLines.forEach(item => {
    // Lấy nội dung sau timestamp để so sánh
    const content = item.line.replace(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\]/, '').trim()
    const exists = uniqueLines.some(u => {
      const uContent = u.line.replace(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\]/, '').trim()
      return uContent === content
    })
    if (!exists) {
      uniqueLines.push(item)
    }
  })

  if (uniqueLines.length === 0) return null

  // Parse và hiển thị từng dòng
  const parseAndDisplay = ({ line }: { line: string; source: 'it' | 'gd' }, idx: number) => {
    let time = ''
    let recipient = ''
    let content = line

    // Parse format: [2026-01-04 10:30][User→IT]: nội dung
    const timeMatch = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\]/)
    if (timeMatch) {
      time = timeMatch[1]
      content = line.substring(timeMatch[0].length)
    }

    // Parse recipient
    if (content.includes('[User→IT]:')) {
      recipient = 'IT'
      content = content.replace(/\[User→IT\]:/, '').trim()
    } else if (content.includes('[User→IT+GĐ]:')) {
      recipient = 'IT+GĐ'
      content = content.replace(/\[User→IT\+GĐ\]:/, '').trim()
    } else if (content.includes('[User→GĐ]:')) {
      recipient = 'GĐ'
      content = content.replace(/\[User→GĐ\]:/, '').trim()
    }

    return (
      <div key={idx} className="pl-3 border-l-2 border-blue-500">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-blue-400 text-xs font-medium">👤 User</span>
          <span className="text-gray-500 text-xs">→</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            recipient === 'IT' 
              ? 'bg-cyan-500/20 text-cyan-400'
              : recipient === 'GĐ'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-green-500/20 text-green-400'
          }`}>
            {recipient}
          </span>
          {time && (
            <span className="text-gray-500 text-xs">{time}</span>
          )}
        </div>
        <p className="text-white text-sm">{content}</p>
      </div>
    )
  }

  return (
    <div className={`bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 ${className}`}>
      <p className="text-blue-400 text-sm font-medium mb-3">💬 Phản hồi từ User:</p>
      <div className="space-y-3">
        {uniqueLines.map((item, idx) => parseAndDisplay(item, idx))}
      </div>
    </div>
  )
}
