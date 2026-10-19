import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getErrorMessage } from '../../lib/api'
import { listCustomers } from '../customers/api'
import type { Customer } from '../customers/types'
import { createQuote } from './api'
import { QuoteDetailsForm } from './QuoteDetailsForm'
import type { QuoteInput } from './types'

export function QuoteNewPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false
    listCustomers()
      .then((result) => {
        if (!ignore) setCustomers(result)
      })
      .catch((loadError: unknown) => {
        if (!ignore) setError(getErrorMessage(loadError))
      })
    return () => {
      ignore = true
    }
  }, [])

  async function handleSubmit(input: QuoteInput) {
    setSubmitting(true)
    setError(null)
    try {
      const quote = await createQuote(input)
      navigate(`/orcamentos/${quote.id}`)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
      setSubmitting(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <h1>Novo orçamento</h1>
        <Link to="/orcamentos" className="button">
          Voltar
        </Link>
      </header>

      {error && <p className="error">{error}</p>}
      {customers === null && !error && <p className="muted">Carregando...</p>}
      {customers?.length === 0 && (
        <p className="notice">
          Você ainda não tem clientes ativos. <Link to="/clientes/novo">Cadastre um cliente</Link>{' '}
          para criar o orçamento.
        </p>
      )}
      {customers && customers.length > 0 && (
        <>
          <p className="muted">Os itens são adicionados na próxima etapa.</p>
          <QuoteDetailsForm
            quote={null}
            customers={customers}
            submitting={submitting}
            submitLabel="Criar e adicionar itens"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </section>
  )
}
