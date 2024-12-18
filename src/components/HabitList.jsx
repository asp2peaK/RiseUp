import { useState } from 'react'
import { 
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Tooltip,
  Zoom
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BarChartIcon from '@mui/icons-material/BarChart'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import StatsDialog from './StatsDialog'

function HabitList({ habits, onDelete, onEdit, onComplete, setHabits }) {
  const [selectedHabit, setSelectedHabit] = useState(null)
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeadlineInfo = (habit) => {
    if (!habit.lastChecked) return ''
    
    const now = new Date()
    const lastChecked = new Date(habit.lastChecked)
    const deadline = new Date(lastChecked)
    deadline.setHours(23, 59, 59, 999)

    switch (habit.frequency) {
      case 'daily':
        return `Until end of day`
      
      case 'weekly':
        deadline.setDate(deadline.getDate() + 7)
        const nextWeekDay = deadline.toLocaleDateString('en-US', { weekday: 'long' })
        return `Until next ${nextWeekDay}`
      
      case 'monthly':
        deadline.setMonth(deadline.getMonth() + 1)
        const nextMonth = deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        return `Until ${nextMonth}`
    }

    const timeLeft = deadline - now
    if (timeLeft < 0) return 'Deadline passed'

    return getDeadlineInfo(habit)
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success'
    if (progress >= 50) return 'warning'
    return 'primary'
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

  const exportHabits = () => {
    const data = JSON.stringify(habits, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'habits.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedHabits = JSON.parse(e.target.result)
          setHabits(importedHabits)
        } catch (error) {
          console.error('Error importing habits:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<FileUploadIcon />}
          color="primary"
        >
          Import Habits
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportHabits}
          color="primary"
        >
          Export Habits
        </Button>
      </Box>

      <Stack spacing={2}>
        {habits.map((habit) => (
          <Card 
            key={habit.id}
            sx={{ 
              position: 'relative',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {habit.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip 
                      label={`🔥 ${formatStreak(habit.streak, habit.frequency)}`}
                      color={habit.streak > 0 ? "primary" : "default"}
                      size="small"
                    />
                    <Chip 
                      label={habit.frequency}
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label={getDeadlineInfo(habit)}
                      variant="outlined"
                      size="small"
                      color={getDeadlineInfo(habit).includes('passed') ? 'error' : 'default'}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Last completed: {formatDate(habit.lastChecked)}
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <Tooltip title="View Stats" TransitionComponent={Zoom}>
                    <IconButton 
                      size="small"
                      onClick={() => setSelectedHabit(habit)}
                      color="primary"
                    >
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Complete" TransitionComponent={Zoom}>
                    <IconButton 
                      size="small"
                      onClick={() => onComplete(habit.id)}
                      color="success"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit" TransitionComponent={Zoom}>
                    <IconButton 
                      size="small"
                      onClick={() => onEdit(habit)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" TransitionComponent={Zoom}>
                    <IconButton 
                      size="small"
                      onClick={() => onDelete(habit.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <LinearProgress 
                variant="determinate" 
                value={habit.progress} 
                color={getProgressColor(habit.progress)}
                sx={{ 
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
      </Stack>

      <StatsDialog 
        open={!!selectedHabit} 
        onClose={() => setSelectedHabit(null)} 
        habit={selectedHabit}
      />
    </>
  )
}

export default HabitList
