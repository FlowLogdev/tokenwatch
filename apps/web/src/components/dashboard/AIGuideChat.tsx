'use client'

import { useState } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  mode?: string
}

const starterQuestions = [
  'How do I install and configure the TokenWatch agent?',
  'How do I register my API token?',
  'Why are my tokens showing zero?',
  'How do I track Claude, ChatGPT, and Codex subscriptions?',
  'How do provider integrations work?',
]

export default function AIGuideChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ask me how to set up TokenWatch, register an API key, install the agent, connect provider integrations, track subscriptions, or understand dashboard totals.',
      mode: 'guided',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed || loading) return

    setMessages(current => [...current, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)
    setError('')

    const res = await fetch('/api/ai-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      setError(data?.error ?? 'The guide could not answer right now.')
      return
    }

    setMessages(current => [...current, {
      role: 'assistant',
      content: data.answer ?? 'I could not generate an answer.',
      mode: data.mode,
    }])
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px', alignItems: 'start' }}>
      <section className="card" style={{ minHeight: '560px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>TokenWatch Guide</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '6px 0 0' }}>
            Self-service onboarding and product help for customers.
          </p>
        </div>

        <div style={{ flex: 1, padding: '18px 20px', display: 'grid', gap: '14px', alignContent: 'start', overflowY: 'auto' }}>
          {messages.map((message, index) => (
            <div key={index} style={{
              justifySelf: message.role === 'user' ? 'end' : 'start',
              maxWidth: '82%',
              background: message.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
              color: message.role === 'user' ? 'white' : 'var(--text)',
              border: message.role === 'user' ? 'none' : '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 14px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: '14px',
            }}>
              <MessageContent content={message.content} isUser={message.role === 'user'} />
              {message.role === 'assistant' && message.mode && (
                <div style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                  {message.mode === 'ai' ? 'AI answer' : 'Built-in guide'}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Thinking...</div>
          )}
        </div>

        <form onSubmit={e => { e.preventDefault(); ask(input) }} style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <input
            className="input-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask how to configure TokenWatch..."
            style={{ flex: 1 }}
          />
          <button className="btn-primary" disabled={loading || !input.trim()} style={{ minWidth: '96px', justifyContent: 'center' }}>
            Ask
          </button>
        </form>

        {error && (
          <div style={{ color: 'var(--red)', fontSize: '13px', padding: '0 20px 16px' }}>{error}</div>
        )}
      </section>

      <aside className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 12px' }}>Common Questions</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {starterQuestions.map(question => (
            <button
              key={question}
              onClick={() => ask(question)}
              disabled={loading}
              className="btn-ghost"
              style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '13px', lineHeight: 1.4, padding: '10px 12px' }}
            >
              {question}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const parts = content.split(/```(?:bash)?\n?|\n?```/g)
  if (parts.length === 1) return <>{content}</>

  return (
    <>
      {parts.map((part, index) => {
        const isCode = index % 2 === 1
        if (isCode) {
          return (
            <pre key={index} style={{
              background: isUser ? 'rgba(0,0,0,0.16)' : 'var(--bg)',
              border: isUser ? '1px solid rgba(255,255,255,0.24)' : '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 12px',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              margin: '10px 0',
            }}>
              {part.trim()}
            </pre>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
