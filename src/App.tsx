import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { supabase } from './lib/supabase'
import { AppLayout } from './components/AppLayout'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { LoginPage } from './features/auth/LoginPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { SignUpPage } from './features/auth/SignUpPage'
import { BusinessPage } from './features/business/BusinessPage'
import { CustomerFormPage } from './features/customers/CustomerFormPage'
import { CustomersPage } from './features/customers/CustomersPage'
import { QuoteDetailPage } from './features/quotes/QuoteDetailPage'
import { QuoteNewPage } from './features/quotes/QuoteNewPage'
import { QuotesPage } from './features/quotes/QuotesPage'
import './App.css'

function App() {
  // undefined: sessão ainda não verificada; null: usuário deslogado.
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // O SDK emite o evento inicial com a sessão salva e mantém o token atualizado.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <p className="muted centered">Carregando...</p>
  }

  return (
    <BrowserRouter>
      {session ? (
        <Routes>
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route element={<AppLayout userEmail={session.user.email} />}>
            <Route path="/orcamentos" element={<QuotesPage />} />
            <Route path="/orcamentos/novo" element={<QuoteNewPage />} />
            <Route path="/orcamentos/:quoteId" element={<QuoteDetailPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/clientes/novo" element={<CustomerFormPage />} />
            <Route path="/clientes/:customerId" element={<CustomerFormPage />} />
            <Route path="/negocio" element={<BusinessPage />} />
            <Route path="*" element={<Navigate to="/orcamentos" replace />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<SignUpPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/entrar" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
