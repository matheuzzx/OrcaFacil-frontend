import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from './authErrors'

const MIN_PASSWORD_LENGTH = 6

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (password !== passwordConfirmation) {
      setError('As senhas não conferem.')
      return
    }

    setSubmitting(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })
    setSubmitting(false)

    if (error) {
      setError(getAuthErrorMessage(error))
      return
    }
    // Sem sessão, o projeto exige confirmação de e-mail antes do primeiro login.
    if (!data.session) {
      setAwaitingConfirmation(true)
    }
  }

  if (awaitingConfirmation) {
    return (
      <main className="auth-page">
        <div className="card auth-card">
          <h1>Confirme seu e-mail</h1>
          <p>
            Enviamos um link de confirmação para <strong>{email}</strong>. Depois de
            confirmar, é só entrar.
          </p>
          <Link to="/entrar">Voltar para o login</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>

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
            autoComplete="new-password"
            required
          />
        </label>
        <label>
          Confirmar senha
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="auth-links">
          <Link to="/entrar">Já tenho conta</Link>
        </p>
      </form>
    </main>
  )
}
