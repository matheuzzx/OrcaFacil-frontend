import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '../../lib/api'
import { formatDate, formatMoney, formatQuoteNumber } from '../../utils/format'
import { listCustomers } from '../customers/api'
import type { Customer } from '../customers/types'
import { listQuotes } from './api'
import { QuoteStatusBadge } from './QuoteStatusBadge'
import { quoteStatusLabels } from './status'
import type { Quote, QuoteStatus } from './types'

const statusOptions: QuoteStatus[] = [
  'DRAFT',
  'SENT',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
]

export function QuotesPage() {
  const [status, setStatus] = useState<QuoteStatus | ''>('')
  const [quotes, setQuotes] = useState<Quote[] | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    listQuotes(status || undefined)
      .then((result) => {
        if (ignore) return
        setQuotes(result)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!ignore) setError(getErrorMessage(loadError))
      })
    return () => {
      ignore = true
    }
  }, [status])

  // Os orçamentos trazem só o customerId; os nomes vêm das duas listas de clientes.
  useEffect(() => {
    let ignore = false
    Promise.all([listCustomers(false), listCustomers(true)])
      .then(([active, deactivated]) => {
        if (!ignore) setCustomers([...active, ...deactivated])
      })
      .catch((loadError: unknown) => {
        if (!ignore) setError(getErrorMessage(loadError))
      })
    return () => {
      ignore = true
    }
  }, [])

  function customerName(customerId: string): string {
    return customers.find(({ id }) => id === customerId)?.name ?? ''
  }

  function changeStatus(value: string) {
    setQuotes(null)
    setStatus(statusOptions.find((option) => option === value) ?? '')
  }

  return (
    <section>
      <header className="page-header">
        <h1>Orçamentos</h1>
        <Link to="/orcamentos/novo" className="button primary">
          Novo orçamento
        </Link>
      </header>

      <label className="inline-filter">
        Status
        <select value={status} onChange={(event) => changeStatus(event.target.value)}>
          <option value="">Todos</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {quoteStatusLabels[option]}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}
      {quotes === null && !error && <p className="muted">Carregando...</p>}
      {quotes?.length === 0 && <p className="muted">Nenhum orçamento encontrado.</p>}

      {quotes && quotes.length > 0 && (
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Título</th>
                <th>Emissão</th>
                <th>Validade</th>
                <th className="number">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>
                    <Link to={`/orcamentos/${quote.id}`}>{formatQuoteNumber(quote.number)}</Link>
                  </td>
                  <td>{customerName(quote.customerId)}</td>
                  <td>{quote.title}</td>
                  <td>{formatDate(quote.issueDate)}</td>
                  <td>{formatDate(quote.validUntil)}</td>
                  <td className="number">{formatMoney(quote.total)}</td>
                  <td>
                    <QuoteStatusBadge status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
