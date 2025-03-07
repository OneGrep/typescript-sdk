import ora, { type Color } from 'ora'

export const spinner = ora({
  text: 'Loading...',
  color: 'yellow'
})

export const getSpinner = (text: string, color: Color = 'yellow') => {
  return ora({
    text: text,
    color: color
  })
}
