type SessionCardProps = {
    title: string | null
    sessionDate: string
    startTime: string
    endTime: string
    label?: string
  }
  
  function SessionCard({
    title,
    sessionDate,
    startTime,
    endTime,
    label,
  }: SessionCardProps) {
    const date = new Date(
      `${sessionDate}T00:00:00`
    )
  
    return (
      <div className="session-card">
  
        <div className="session-date-box">
  
          <span>
            {date.toLocaleDateString(
              'en-US',
              {
                month: 'short',
              }
            )}
          </span>
  
          <strong>
            {date.getDate()}
          </strong>
  
        </div>
  
  
        <div className="session-card-info">
  
          {label && (
            <span className="session-card-label">
              {label}
            </span>
          )}
  
          <h3>
            {title || 'Tutoring Session'}
          </h3>
  
          <p>
            {startTime.slice(0, 5)}
            {' – '}
            {endTime.slice(0, 5)}
          </p>
  
        </div>
  
      </div>
    )
  }
  
  export default SessionCard