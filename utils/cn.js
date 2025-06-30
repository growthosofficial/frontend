import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

// Vibrant, stepped color bands for scores (0-1)
export function getScoreGradientColor(score) {
  const percent = score * 100;
  if (percent <60) {
    return '#EB473D'; // Red
  } else if (percent < 70) {
    return '#F0965B'; // Orange
  } else if (percent < 80) {
    return '#F9DF70'; // Yellow
  } else if (percent < 90) {
    return '#82DEE4'; // Light blue
  } else {
    return '#37E020'; // Green
  }
}