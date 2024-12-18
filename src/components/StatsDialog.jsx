import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box,
  LinearProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const LEVELS = {
  0: { name: 'Novice', color: '#9e9e9e', requiredStreak: 0 },
  1: { name: 'Beginner', color: '#4caf50', requiredStreak: 3 },
  2: { name: 'Advanced', color: '#2196f3', requiredStreak: 7 },
  3: { name: 'Expert', color: '#f44336', requiredStreak: 14 },
  4: { name: 'Master', color: '#ff9800', requiredStreak: 30 },
  5: { name: 'Legend', color: '#9c27b0', requiredStreak: 60 }
}

const getLevel = (streak) => {
  return Object.entries(LEVELS)
    .reverse()
    .find(([_, level]) => streak >= level.requiredStreak)?.[0] || 0
}

const getLevelProgress = (streak) => {
  const currentLevel = parseInt(getLevel(streak))
  if (currentLevel === 5) return 100

  const currentRequired = LEVELS[currentLevel].requiredStreak
  const nextRequired = LEVELS[currentLevel + 1].requiredStreak
  const progress = ((streak - currentRequired) / (nextRequired - currentRequired)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

const formatStreak = (streak, frequency) => {
  if (streak === 0) return '0'
  
  switch (frequency) {
    case 'daily':
      return `${streak} ${streak === 1 ? 'day' : 'days'}`
    case 'weekly':
      return `${streak} ${streak === 1 ? 'week' : 'weeks'}`
    case 'monthly':
      return `${streak} ${streak === 1 ? 'month' : 'months'}`
    default:
      return `${streak}`
  }
}

function StatsDialog({ open, onClose, habit }) {
  if (!habit) return null

  const currentLevel = parseInt(getLevel(habit.streak))
  const levelInfo = LEVELS[currentLevel]
  const nextLevel = currentLevel < 5 ? LEVELS[currentLevel + 1] : null
  const progress = getLevelProgress(habit.streak)

  const formatNextLevel = (streak, requiredStreak, frequency) => {
    const remaining = requiredStreak - streak
    
    switch (frequency) {
      case 'daily':
        return `${remaining} ${remaining === 1 ? 'day' : 'days'}`
      case 'weekly':
        return `${remaining} ${remaining === 1 ? 'week' : 'weeks'}`
      case 'monthly':
        return `${remaining} ${remaining === 1 ? 'month' : 'months'}`
      default:
        return `${remaining}`
    }
  }

  const getChartData = (habit) => {
    const now = new Date()
    const startDate = new Date(habit.createdAt || now)
    const data = new Array(7).fill(0)
    const labels = new Array(7).fill('')

    if (startDate.toDateString() === now.toDateString()) {
      data[6] = habit.progress
      labels[6] = 'Today'
      return { data, labels }
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      
      if (date < startDate) {
        data[i] = 0
      } else if (i === 6) {
        data[i] = habit.progress
      } else {
        data[i] = 0
      }

      labels[i] = i === 6 ? 'Today' : 
                 i === 5 ? 'Yesterday' :
                 `${date.getDate()}/${date.getMonth() + 1}`
    }

    return { data, labels }
  }

  const chartData = {
    labels: getChartData(habit).labels,
    datasets: [
      {
        label: 'Progress',
        data: getChartData(habit).data,
        borderColor: levelInfo.color,
        tension: 0.1,
        fill: false
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Progress History'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Progress %'
        }
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Habit Statistics: {habit.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Level
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ color: levelInfo.color }}>
                    {levelInfo.name}
                  </Typography>
                </Box>
                {nextLevel && (
                  <>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: 'grey.300',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: levelInfo.color
                        }
                      }} 
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formatNextLevel(habit.streak, nextLevel.requiredStreak, habit.frequency)} until "{nextLevel.name}"
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Achievements
                </Typography>
                <Typography variant="body1">
                  🔥 Current Streak: {formatStreak(habit.streak, habit.frequency)}
                </Typography>
                <Typography variant="body1">
                  📅 Frequency: {habit.frequency}
                </Typography>
                <Typography variant="body1">
                  🎯 Goal: {habit.goal}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Line data={chartData} options={chartOptions} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default StatsDialog
