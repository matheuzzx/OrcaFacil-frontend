import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../lib/supabase'
import { getAuthErrorMessage } from './authErrors'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    setSubmitting(false)

    if (error) {
      setError(getAuthErrorMessage(error))
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <main className="auth-page">
        <div className="card auth-card">
          <h1>Verifique seu e-mail</h1>
          <p>
            Se existir uma conta para <strong>{email}</strong>, você receberá um link
            para redefinir a senha.
          </p>
          <Link to="/entrar">Voltar para o login</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Recuperar senha</h1>
        <p className="muted">Informe seu e-mail para receber o link de redefinição.</p>

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

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar link'}
        </button>

        <p className="auth-links">
          <Link to="/entrar">Voltar para o login</Link>
        </p>
      </form>
    </main>
  )
}
