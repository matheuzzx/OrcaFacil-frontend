import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getErrorMessage } from '../../lib/api'
import { formatDate, formatQuoteNumber } from '../../utils/format'
import { getCustomer, listCustomers } from '../customers/api'
import type { Customer } from '../customers/types'
import {
  changeQuoteStatus,
  deleteQuote,
  getQuote,
  getQuotePdf,
  getQuotePreview,
  updateQuote,
} from './api'
import { QuoteDetailsForm } from './QuoteDetailsForm'
import { QuoteItems } from './QuoteItems'
import { QuoteStatusBadge } from './QuoteStatusBadge'
import { nextQuoteStatuses } from './status'
import type { Quote, QuoteInput, QuoteStatus } from './types'

const statusActionLabels: Record<QuoteStatus, string> = {
  DRAFT: 'Voltar para rascunho',
  SENT: 'Marcar como enviado',
  APPROVED: 'Marcar como aprovado',
  REJECTED: 'Marcar como recusado',
  EXPIRED: 'Marcar como expirado',
  CANCELLED: 'Cancelar orçamento',
}

const OBJECT_URL_LIFETIME_MS = 60_000

export function QuoteDetailPage() {
  const { quoteId = '' } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  // Clientes ativos (para trocar o cliente) mais o cliente atual, mesmo que inativo.
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let ignore = false

    async function load() {
      const loadedQuote = await getQuote(quoteId)
      const [currentCustomer, activeCustomers] = await Promise.all([
        getCustomer(loadedQuote.customerId),
        listCustomers(),
      ])
      if (ignore) return

      const isListed = activeCustomers.some(({ id }) => id === currentCustomer.id)
      setQuote(loadedQuote)
      setCustomers(isListed ? activeCustomers : [currentCustomer, ...activeCustomers])
    }

    load().catch((getError: unknown) => {
      if (!ignore) setLoadError(getErrorMessage(getError))
    })
    return () => {
      ignore = true
    }
  }, [quoteId])

  if (loadError) return <p className="error">{loadError}</p>
  if (!quote) return <p className="muted">Carregando...</p>

  const isDraft = quote.status === 'DRAFT'
  const customer = customers.find(({ id }) => id === quote.customerId)
  const quoteNumber = formatQuoteNumber(quote.number)

  function handleQuoteChange(updated: Quote) {
    setQuote(updated)
    setSaved(false)
  }

  async function handleUpdate(input: QuoteInput) {
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      setQuote(await updateQuote(quoteId, input))
      setSaved(true)
    } catch (updateError) {
      setError(getErrorMessage(updateError))
    } finally {
      setBusy(false)
    }
  }

  async function handleChangeStatus(status: QuoteStatus) {
    if (status === 'CANCELLED' && !window.confirm('Cancelar este orçamento?')) return

    setBusy(true)
    setError(null)
    try {
      setQuote(await changeQuoteStatus(quoteId, status))
    } catch (statusError) {
      setError(getErrorMessage(statusError))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir o orçamento ${quoteNumber}? Esta ação não pode ser desfeita.`)) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await deleteQuote(quoteId)
      navigate('/orcamentos', { replace: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
      setBusy(false)
    }
  }

  // Os documentos exigem o token, então são baixados via fetch e abertos como blob.
  // A aba é aberta antes da requisição para não ser bloqueada pelo navegador.
  async function openDocument(load: () => Promise<Blob>) {
    const documentWindow = window.open('', '_blank')
    setError(null)
    try {
      const url = URL.createObjectURL(await load())
      if (documentWindow) {
        documentWindow.opener = null
        documentWindow.location.href = url
      }
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_LIFETIME_MS)
    } catch (documentError) {
      documentWindow?.close()
      setError(getErrorMessage(documentError))
    }
  }

  async function downloadPdf() {
    setError(null)
    try {
      const url = URL.createObjectURL(await getQuotePdf(quoteId))
      const link = document.createElement('a')
      link.href = url
      link.download = `orcamento-${quoteNumber}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(getErrorMessage(downloadError))
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>
            Orçamento {quoteNumber} <QuoteStatusBadge status={quote.status} />
          </h1>
          <p className="muted">
            {customer?.name} · Emitido em {formatDate(quote.issueDate)} · Válido até{' '}
            {formatDate(quote.validUntil)}
          </p>
        </div>
        <Link to="/orcamentos" className="button">
          Voltar
        </Link>
      </header>

      <div className="toolbar">
        <button type="button" onClick={() => openDocument(() => getQuotePreview(quoteId))}>
          Visualizar
        </button>
        <button type="button" onClick={() => openDocument(() => getQuotePdf(quoteId))}>
          Abrir PDF
        </button>
        <button type="button" onClick={downloadPdf}>
          Baixar PDF
        </button>

        <span className="toolbar-separator" />

        {nextQuoteStatuses[quote.status].map((status) => (
          <button
            key={status}
            type="button"
            className={status === 'CANCELLED' ? 'danger' : 'primary'}
            onClick={() => handleChangeStatus(status)}
            disabled={busy || (status === 'SENT' && quote.items.length === 0)}
            title={
              status === 'SENT' && quote.items.length === 0
                ? 'Adicione ao menos um item antes de enviar.'
                : undefined
            }
          >
            {statusActionLabels[status]}
          </button>
        ))}
        {isDraft && (
          <button type="button" className="danger" onClick={handleDelete} disabled={busy}>
            Excluir
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {!isDraft && (
        <p className="notice">Apenas orçamentos em rascunho podem ser alterados.</p>
      )}

      <QuoteItems quote={quote} editable={isDraft} onQuoteChange={handleQuoteChange} />

      {isDraft ? (
        <>
          {saved && <p className="success">Orçamento salvo.</p>}
          <QuoteDetailsForm
            quote={quote}
            customers={customers}
            submitting={busy}
            submitLabel="Salvar dados do orçamento"
            onSubmit={handleUpdate}
          />
        </>
      ) : (
        <div className="card">
          <h2>Detalhes</h2>
          {quote.title && <p><strong>Título:</strong> {quote.title}</p>}
          {quote.notes && <p><strong>Observações:</strong> {quote.notes}</p>}
          {quote.terms && <p><strong>Condições:</strong> {quote.terms}</p>}
        </div>
      )}
    </section>
  )
}
