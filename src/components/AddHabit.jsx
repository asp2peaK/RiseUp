import { useState, useEffect } from 'react'
import { 
  Paper, 
  TextField, 
  Button, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'

function AddHabit({ onAdd, onUpdate, editingHabit, onCancelEdit }) {
  const [habit, setHabit] = useState({
    name: '',
    goal: '',
    frequency: 'daily',
  })

  useEffect(() => {
    if (editingHabit) {
      setHabit(editingHabit)
    }
  }, [editingHabit])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!habit.name.trim() || !habit.goal.trim()) return
    
    if (editingHabit) {
      onUpdate(habit)
    } else {
      onAdd({
        ...habit,
        progress: 0,
        streak: 0,
        lastChecked: null
      })
    }
    
    setHabit({ name: '', goal: '', frequency: 'daily' })
  }

  const handleCancel = () => {
    setHabit({ name: '', goal: '', frequency: 'daily' })
    onCancelEdit()
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          mb: 3
        }}
      >
        <TextField
          required
          label="Habit Name"
          value={habit.name}
          onChange={(e) => setHabit({ ...habit, name: e.target.value })}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <TextField
          required
          label="Goal"
          value={habit.goal}
          onChange={(e) => setHabit({ ...habit, goal: e.target.value })}
          sx={{ width: 150 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Frequency</InputLabel>
          <Select
            required
            value={habit.frequency}
            label="Frequency"
            onChange={(e) => setHabit({ ...habit, frequency: e.target.value })}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={editingHabit ? <EditIcon /> : <AddIcon />}
            sx={{ mr: 1 }}
          >
            {editingHabit ? 'Update' : 'Add'} Habit
          </Button>
          {editingHabit && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default AddHabit
