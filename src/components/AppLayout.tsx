import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ApiError, getErrorMessage } from '../lib/api'
import { supabase } from '../lib/supabase'
import { getCurrentBusiness } from '../features/business/api'
import { BusinessForm } from '../features/business/BusinessForm'
import type { Business, BusinessOutletContext } from '../features/business/types'

type BusinessState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error'; message: string }
  | { status: 'ready'; business: Business }

type AppLayoutProps = {
  userEmail: string | undefined
}

/**
 * Layout das rotas autenticadas. Toda a aplicação depende do negócio do
 * usuário, então ele é carregado aqui; sem negócio, exibe o cadastro inicial.
 */
export function AppLayout({ userEmail }: AppLayoutProps) {
  const [businessState, setBusinessState] = useState<BusinessState>({ status: 'loading' })

  useEffect(() => {
    let ignore = false
    getCurrentBusiness()
      .then((business) => {
        if (!ignore) setBusinessState({ status: 'ready', business })
      })
      .catch((error: unknown) => {
        if (ignore) return
        if (error instanceof ApiError && error.status === 404) {
          setBusinessState({ status: 'missing' })
        } else {
          setBusinessState({ status: 'error', message: getErrorMessage(error) })
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  function handleBusinessSaved(business: Business) {
    setBusinessState({ status: 'ready', business })
  }

  function renderContent() {
    switch (businessState.status) {
      case 'loading':
        return <p className="muted">Carregando...</p>
      case 'error':
        return <p className="error">{businessState.message}</p>
      case 'missing':
        return (
          <section>
            <header className="page-header">
              <h1>Bem-vindo ao Orça Fácil</h1>
            </header>
            <p className="muted">
              Antes de criar orçamentos, cadastre os dados do seu negócio.
            </p>
            <BusinessForm business={null} onSaved={handleBusinessSaved} />
          </section>
        )
      case 'ready': {
        const context: BusinessOutletContext = {
          business: businessState.business,
          onBusinessUpdated: handleBusinessSaved,
        }
        return <Outlet context={context} />
      }
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <strong className="brand">
          {businessState.status === 'ready'
            ? businessState.business.displayName
            : 'Orça Fácil'}
        </strong>
        {businessState.status === 'ready' && (
          <nav>
            <NavLink to="/orcamentos">Orçamentos</NavLink>
            <NavLink to="/clientes">Clientes</NavLink>
            <NavLink to="/negocio">Meu negócio</NavLink>
          </nav>
        )}
        <div className="topbar-user">
          <span className="muted">{userEmail}</span>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Sair
          </button>
        </div>
      </header>
      <main className="content">{renderContent()}</main>
    </div>
  )
}
