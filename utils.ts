import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDateString(): string {
  const now = new Date()
  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`
}

export function parseMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^→ (.+)/gm, '<li class="arrow-item">→ $1</li>')
    .replace(/^\s*[-*] (.+)/gm, '<li>$1</li>')
    .replace(/^\s*\d+\. (.+)/gm, '<li>$1</li>')
    .replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')

  html = html
    .split(/\n\n+/)
    .map((para) => {
      para = para.trim()
      if (!para) return ''
      if (/^<(h[123]|blockquote|pre|ul|ol)/.test(para)) return para
      if (para.includes('<li')) return `<ul>${para}</ul>`
      return `<p>${para.replace(/\n/g, '<br/>')}</p>`
    })
    .join('')

  return html
}
