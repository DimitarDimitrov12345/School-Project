import React from 'react'

interface StatisticsData {
  team: { id: number; name: string; logo: string }
  statistics: Array<{ type: string; value: number | string }>
}

interface MatchStatisticsProps {
  statistics?: StatisticsData[]
}

const MatchStatistics: React.FC<MatchStatisticsProps> = ({ statistics }) => {
  if (!statistics || statistics.length === 0) {
    return null
  }

  // Get unique stat types from both teams
  const allStatTypes = new Set<string>()
  statistics.forEach(team => {
    team.statistics.forEach(stat => {
      allStatTypes.add(stat.type)
    })
  })

  const statTypes = Array.from(allStatTypes).sort()

  // Map of stat types to display names with icons
  const statLabels: Record<string, { label: string; icon: string }> = {
    'Shots on Goal': { label: 'Удари във вратата', icon: '🎯' },
    'Shots off Goal': { label: 'Удари извън вратата', icon: '🎯' },
    'Shots insidebox': { label: 'Удари от наказателното', icon: '🎯' },
    'Shots outsidebox': { label: 'Удари извън наказателното', icon: '🎯' },
    'Total Shots': { label: 'Общо удари', icon: '🎯' },
    'Blocked Shots': { label: 'Блокирани удари', icon: '🚫' },
    'Shots': { label: 'Удари', icon: '🎯' },
    'Ball Possession': { label: 'Притежание на топката', icon: '🔵' },
    'Passes %': { label: 'Точност на пасовете', icon: '✓' },
    'Total passes': { label: 'Общо пасове', icon: '⚽' },
    'Passes accurate': { label: 'Точни пасове', icon: '✓' },
    'Passes': { label: 'Пасове', icon: '⚽' },
    'Pass Accuracy': { label: 'Точност на пасовете', icon: '✓' },
    'Fouls': { label: 'Фаулове', icon: '🟨' },
    'Yellow Cards': { label: 'Жълти картони', icon: '🟨' },
    'Red Cards': { label: 'Червени картони', icon: '🟥' },
    'Offsides': { label: 'Засади', icon: '📍' },
    'Corner Kicks': { label: 'Корнери', icon: '🔄' },
    'Possession': { label: 'Притежание', icon: '🔵' },
    'Tackles': { label: 'Такъли', icon: '🛡️' },
    'Blocks': { label: 'Блокове', icon: '🚫' },
    'Saves': { label: 'Спасявания', icon: '🧤' },
    'Goalkeeper Saves': { label: 'Спасявания на вратаря', icon: '🧤' },
    'Clearances': { label: 'Избивания', icon: '👋' },
    'Throw-ins': { label: 'Аутове', icon: '📤' },
    'Goal Kicks': { label: 'Начални удари', icon: '🥅' },
    'Substitutions': { label: 'Смени', icon: '🔄' },
    'expected_goals': { label: 'Очаквани голове', icon: '⚽' },
    'goals_prevented': { label: 'Предотвратени голове', icon: '🧤' },
  }

  const getStatValue = (team: StatisticsData, statType: string): string => {
    const stat = team.statistics.find(s => s.type === statType)
    return stat ? String(stat.value) : '-'
  }

  const getStatLabel = (type: string): { label: string; icon: string } => {
    return statLabels[type] || { label: type, icon: '📊' }
  }

  const homeTeam = statistics[0]
  const awayTeam = statistics[1] || statistics[0]

  return (
    <div className="game-details-stats-wrap" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 className="game-details-stats-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#f9fafb' }}>📊 Статистика на мача</h3>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {statTypes.map(statType => {
          const homeValue = getStatValue(homeTeam, statType)
          const awayValue = getStatValue(awayTeam, statType)
          const { label, icon } = getStatLabel(statType)

          // Parse numeric values for comparison
          const homeNum = parseFloat(homeValue) || 0
          const awayNum = parseFloat(awayValue) || 0
          const maxValue = Math.max(homeNum, awayNum) || 100

          // Calculate percentages for bar display (for non-percentage stats)
          const isPercentage = statType.includes('Accuracy') || statType.includes('Possession')
          const homePercent = isPercentage ? homeNum : (maxValue > 0 ? (homeNum / maxValue) * 100 : 0)
          const awayPercent = isPercentage ? awayNum : (maxValue > 0 ? (awayNum / maxValue) * 100 : 0)

          return (
            <div key={statType} className="game-details-stat-row" style={{ padding: '16px 0', borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span className="game-details-stat-icon" style={{ fontSize: '14px' }}>{icon}</span>
                  <span className="game-details-stat-value" style={{ fontSize: '12px', color: '#f9fafb', fontWeight: '500', textAlign: 'right' }}>
                    {homeValue}
                  </span>
                </div>
                <div style={{ flex: 2, textAlign: 'center', minWidth: 0, padding: '0 16px' }}>
                  <p className="game-details-stat-label" style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                  </p>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', minWidth: 0 }}>
                  <span className="game-details-stat-value" style={{ fontSize: '12px', color: '#f9fafb', fontWeight: '500' }}>
                    {awayValue}
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="game-details-stat-bar" style={{ display: 'flex', gap: '4px', height: '24px', borderRadius: '4px', overflow: 'hidden', background: '#374151' }}>
                <div
                  style={{
                    flex: homePercent,
                    background: isPercentage || homeNum > awayNum ? 'linear-gradient(90deg, #3b82f6 0%, #3b82f6 100%)' : '#4b5563',
                    borderRadius: homePercent > 0 ? '4px 0 0 4px' : '0',
                    minWidth: homePercent > 0 ? '2px' : '0',
                  }}
                />
                <div
                  style={{
                    flex: awayPercent,
                    background: isPercentage || awayNum > homeNum ? 'linear-gradient(90deg, #ef4444 0%, #ef4444 100%)' : '#4b5563',
                    borderRadius: awayPercent > 0 ? '0 4px 4px 0' : '0',
                    minWidth: awayPercent > 0 ? '2px' : '0',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MatchStatistics
