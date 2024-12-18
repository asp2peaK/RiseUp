const STORAGE_KEY = 'habits'

export const saveHabits = (habits) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

export const loadHabits = () => {
  const habits = localStorage.getItem(STORAGE_KEY)
  return habits ? JSON.parse(habits) : []
}
