import { useState, type FormEvent } from 'react'
import type { Customer } from '../customers/types'
import { todayIsoDate } from '../../utils/format'
import type { Quote, QuoteInput } from './types'

type QuoteDetailsFormProps = {
  /** null no cadastro de um novo orçamento. */
  quote: Quote | null
  customers: Customer[]
  submitting: boolean
  submitLabel: string
  onSubmit: (input: QuoteInput) => void
}

type FieldErrors = Partial<Record<'customerId' | 'validUntil' | 'discount', string>>

export function QuoteDetailsForm({
  quote,
  customers,
  submitting,
  submitLabel,
  onSubmit,
}: QuoteDetailsFormProps) {
  const [customerId, setCustomerId] = useState(quote?.customerId ?? '')
  const [title, setTitle] = useState(quote?.title ?? '')
  const [issueDate, setIssueDate] = useState(quote?.issueDate ?? todayIsoDate())
  const [validUntil, setValidUntil] = useState(quote?.validUntil ?? '')
  const [discount, setDiscount] = useState(quote ? String(quote.discount) : '')
  const [notes, setNotes] = useState(quote?.notes ?? '')
  const [terms, setTerms] = useState(quote?.terms ?? '')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // O desconto só faz sentido depois que o orçamento já tem itens.
  const showDiscount = quote !== null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const discountValue = discount.trim() === '' ? 0 : Number(discount)
    const errors: FieldErrors = {}
    if (!customerId) {
      errors.customerId = 'Selecione o cliente.'
    }
    if (!validUntil) {
      errors.validUntil = 'Informe a validade.'
    } else if (validUntil < issueDate) {
      errors.validUntil = 'A validade não pode ser anterior à emissão.'
    }
    if (Number.isNaN(discountValue) || discountValue < 0) {
      errors.discount = 'Informe um desconto válido.'
    } else if (quote && discountValue > quote.subtotal) {
      errors.discount = 'O desconto não pode ser maior que o subtotal.'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    onSubmit({
      // Na edição, só envia o cliente quando ele muda: a API exige cliente ativo.
      customerId: customerId !== quote?.customerId ? customerId : undefined,
      title: title.trim(),
      issueDate,
      validUntil,
      discount: showDiscount ? discountValue : undefined,
      notes: notes.trim(),
      terms: terms.trim(),
    })
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-grid">
        <legend>Dados do orçamento</legend>
        <label className="span-2">
          Cliente *
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="">Selecione...</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.active ? customer.name : `${customer.name} (inativo)`}
              </option>
            ))}
          </select>
          {fieldErrors.customerId && <span className="error">{fieldErrors.customerId}</span>}
        </label>
        <label className="span-2">
          Título
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={150}
            placeholder="Ex.: Reforma do banheiro"
          />
        </label>
        <label>
          Emissão
          <input
            type="date"
            value={issueDate}
            onChange={(event) => setIssueDate(event.target.value)}
            required
          />
        </label>
        <label>
          Validade *
          <input
            type="date"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            min={issueDate}
          />
          {fieldErrors.validUntil && <span className="error">{fieldErrors.validUntil}</span>}
        </label>
        {showDiscount && (
          <label>
            Desconto (R$)
            <input
              type="number"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              min={0}
              step="0.01"
            />
            {fieldErrors.discount && <span className="error">{fieldErrors.discount}</span>}
          </label>
        )}
      </fieldset>

      <fieldset>
        <label>
          Observações
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={3}
          />
        </label>
        <label>
          Condições (pagamento, prazo, garantia...)
          <textarea
            value={terms}
            onChange={(event) => setTerms(event.target.value)}
            maxLength={2000}
            rows={3}
          />
        </label>
      </fieldset>

      <div className="actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
