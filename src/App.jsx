import { useState, useEffect } from 'react'
import { Container, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Header from './components/Header'
import HabitList from './components/HabitList'
import AddHabit from './components/AddHabit'
import { saveHabits, loadHabits } from './services/habitStorage'

function App() {
  const [habits, setHabits] = useState([])
  const [editingHabit, setEditingHabit] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
    },
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    const savedHabits = loadHabits()
    if (savedHabits.length > 0) {
      const updatedHabits = savedHabits.map(habit => {
        if (shouldResetProgress(habit)) {
          return { 
            ...habit, 
            progress: 0,
            streak: 0 
          }
        }
        return habit
      })
      setHabits(updatedHabits)
    }
  }, [])

  useEffect(() => {
    if (habits.length > 0) {
      saveHabits(habits)
    }
  }, [habits])

  const shouldResetProgress = (habit) => {
    if (!habit.lastChecked) return false
    
    const now = new Date()
    const lastChecked = new Date(habit.lastChecked)
    
    switch (habit.frequency) {
      case 'daily':
        return now.getDate() !== lastChecked.getDate() ||
               now.getMonth() !== lastChecked.getMonth() ||
               now.getFullYear() !== lastChecked.getFullYear()
      
      case 'weekly':
      case 'monthly':
        const deadline = new Date(lastChecked)
        deadline.setHours(23, 59, 59, 999)
        
        if (habit.frequency === 'weekly') {
          deadline.setDate(deadline.getDate() + 7) 
        } else {
          deadline.setMonth(deadline.getMonth() + 1) 
        }
        
        return now > deadline
      
      default:
        return false
    }
  }

  const addHabit = (newHabit) => {
    const habit = {
      ...newHabit,
      id: Date.now(),
      progress: 0,
      streak: 0,
      createdAt: new Date().toISOString(),
      lastChecked: null
    }
    setHabits([...habits, habit])
  }

  const updateHabit = (updatedHabit) => {
    setHabits(habits.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    ))
    setEditingHabit(null)
  }

  const deleteHabit = (id) => {
    setHabits(habits.filter(habit => habit.id !== id))
  }

  const startEditing = (habit) => {
    setEditingHabit(habit)
  }

  const toggleComplete = (id) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const now = new Date()
        let progress = habit.progress || 0
        
        if (shouldResetProgress(habit)) {
          progress = 0 
        }
        
        progress = progress === 0 ? 100 : 0
        
        if (progress === 100) {
          const lastChecked = habit.lastChecked ? new Date(habit.lastChecked) : null
          const shouldIncrementStreak = !lastChecked || shouldResetProgress({ ...habit, lastChecked: lastChecked?.toISOString() })
          
          return {
            ...habit,
            progress,
            lastChecked: now.toISOString(),
            streak: shouldIncrementStreak ? (habit.streak || 0) + 1 : habit.streak || 0
          }
        } else {
          return {
            ...habit,
            progress,
            lastChecked: null,
            streak: Math.max(0, (habit.streak || 0) - 1) 
          }
        }
      }
      return habit
    }))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        flexGrow: 1,
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        <Header darkMode={darkMode} onThemeToggle={() => setDarkMode(!darkMode)} />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <AddHabit 
            onAdd={addHabit} 
            editingHabit={editingHabit}
            onUpdate={updateHabit}
            onCancelEdit={() => setEditingHabit(null)}
          />
          <HabitList 
            habits={habits} 
            onDelete={deleteHabit}
            onEdit={startEditing}
            onComplete={toggleComplete}
            setHabits={setHabits}
          />
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
