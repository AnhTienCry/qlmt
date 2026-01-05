// Component hiển thị phản hồi User đã gửi - dùng cho User xem lại

interface UserSentFeedbackTimelineProps {
  ghiChuIT: string | null
  ghiChuGD: string | null
  className?: string
}

// Kiểm tra dòng có phải format phản hồi từ User không
function isUserFeedbackLine(line: string): boolean {
  return line.includes('[User→')
}

export default function UserSentFeedbackTimeline({ ghiChuIT, ghiChuGD, className = '' }: UserSentFeedbackTimelineProps) {
  // Thu thập phản hồi từ User từ cả ghiChuIT và ghiChuGD
  const allLines: string[] = []
  
  if (ghiChuIT) {
    ghiChuIT.split('\n')
      .filter(l => l.trim() && isUserFeedbackLine(l))
      .forEach(line => allLines.push(line))
  }
  
  if (ghiChuGD) {
    ghiChuGD.split('\n')
      .filter(l => l.trim() && isUserFeedbackLine(l))
      .forEach(line => allLines.push(line))
  }
  
  // Loại bỏ trùng lặp
  const uniqueLines: string[] = []
  allLines.forEach(line => {
    const content = line.replace(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\]/, '').trim()
    const exists = uniqueLines.some(u => {
      const uContent = u.replace(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\]/, '').trim()
      return uContent === content
    })
    if (!exists) {
      uniqueLines.push(line)
    }
  })

  if (uniqueLines.length === 0) return null

  // Parse và hiển thị từng dòng
  const parseAndDisplay = (line: string, idx: number) => {
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
      <div key={idx} className="pl-3 border-l-2 border-green-500">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-green-400 text-xs font-medium">📤 Bạn đã gửi</span>
          <span className="text-gray-500 text-xs">→</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            recipient === 'IT' 
              ? 'bg-cyan-500/20 text-cyan-400'
              : recipient === 'GĐ'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-orange-500/20 text-orange-400'
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
    <div className={`bg-green-500/10 border border-green-500/30 rounded-lg p-3 ${className}`}>
      <p className="text-green-400 text-sm font-medium mb-3">📤 Phản hồi bạn đã gửi:</p>
      <div className="space-y-3">
        {uniqueLines.map((line, idx) => parseAndDisplay(line, idx))}
      </div>
    </div>
  )
}
