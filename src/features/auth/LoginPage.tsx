import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from './authErrors'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    // Em caso de sucesso, o App recebe a nova sessão e troca para as rotas internas.
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(getAuthErrorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Orça Fácil</h1>
        <p className="muted">Entre para gerenciar seus orçamentos.</p>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="auth-links">
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
          <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </main>
  )
}
