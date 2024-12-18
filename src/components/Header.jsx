import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

function Header({ darkMode, onThemeToggle }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <TrendingUpIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          RiseUp
        </Typography>
        <IconButton 
          color="inherit" 
          onClick={onThemeToggle}
          sx={{ ml: 1 }}
          aria-label="toggle theme"
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Header
