import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '../../lib/api'
import { formatMoney } from '../../utils/format'
import {
  addQuoteItem,
  getQuote,
  removeQuoteItem,
  reorderQuoteItems,
  updateQuoteItem,
} from './api'
import type { Quote, QuoteItem, QuoteItemInput } from './types'

type QuoteItemsProps = {
  quote: Quote
  editable: boolean
  onQuoteChange: (quote: Quote) => void
}

export function QuoteItems({ quote, editable, onQuoteChange }: QuoteItemsProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // A API devolve a posição de cada item, mas não garante a ordem da lista.
  const items = [...quote.items].sort((a, b) => a.position - b.position)

  async function run(operation: () => Promise<Quote>): Promise<boolean> {
    setBusy(true)
    setError(null)
    try {
      onQuoteChange(await operation())
      return true
    } catch (operationError) {
      setError(getErrorMessage(operationError))
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleAdd(input: QuoteItemInput): Promise<boolean> {
    return run(() => addQuoteItem(quote.id, input))
  }

  async function handleUpdate(itemId: string, input: QuoteItemInput): Promise<boolean> {
    const saved = await run(() => updateQuoteItem(quote.id, itemId, input))
    if (saved) setEditingItemId(null)
    return saved
  }

  async function handleRemove(item: QuoteItem) {
    if (!window.confirm(`Remover o item "${item.description}"?`)) return
    // A remoção responde sem corpo, então o orçamento é recarregado.
    await run(async () => {
      await removeQuoteItem(quote.id, item.id)
      return getQuote(quote.id)
    })
  }

  async function handleMove(index: number, offset: -1 | 1) {
    const itemIds = items.map(({ id }) => id)
    const [moved] = itemIds.splice(index, 1)
    itemIds.splice(index + offset, 0, moved)
    await run(() => reorderQuoteItems(quote.id, itemIds))
  }

  return (
    <div className="card">
      <h2>Itens</h2>
      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p className="muted">Nenhum item adicionado.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th className="number">Qtd.</th>
                <th>Unid.</th>
                <th className="number">Preço unit.</th>
                <th className="number">Total</th>
                {editable && <th aria-label="Ações" />}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) =>
                item.id === editingItemId ? (
                  <tr key={item.id}>
                    <td colSpan={6}>
                      <QuoteItemForm
                        item={item}
                        busy={busy}
                        submitLabel="Salvar item"
                        onSubmit={(input) => handleUpdate(item.id, input)}
                        onCancel={() => setEditingItemId(null)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td className="number">{item.quantity.toLocaleString('pt-BR')}</td>
                    <td>{item.unit}</td>
                    <td className="number">{formatMoney(item.unitPrice)}</td>
                    <td className="number">{formatMoney(item.total)}</td>
                    {editable && (
                      <td className="row-actions">
                        <button
                          type="button"
                          onClick={() => handleMove(index, -1)}
                          disabled={busy || index === 0}
                          aria-label="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 1)}
                          disabled={busy || index === items.length - 1}
                          aria-label="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(item.id)}
                          disabled={busy}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleRemove(item)}
                          disabled={busy}
                        >
                          Remover
                        </button>
                      </td>
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      <dl className="totals">
        <dt>Subtotal</dt>
        <dd>{formatMoney(quote.subtotal)}</dd>
        <dt>Desconto</dt>
        <dd>{formatMoney(quote.discount)}</dd>
        <dt>Total</dt>
        <dd className="grand-total">{formatMoney(quote.total)}</dd>
      </dl>

      {editable && (
        <>
          <h3>Adicionar item</h3>
          <QuoteItemForm item={null} busy={busy} submitLabel="Adicionar" onSubmit={handleAdd} />
        </>
      )}
    </div>
  )
}

type QuoteItemFormProps = {
  item: QuoteItem | null
  busy: boolean
  submitLabel: string
  /** Retorna true quando o item foi salvo, para limpar o formulário de inclusão. */
  onSubmit: (input: QuoteItemInput) => Promise<boolean>
  onCancel?: () => void
}

function QuoteItemForm({ item, busy, submitLabel, onSubmit, onCancel }: QuoteItemFormProps) {
  const [description, setDescription] = useState(item?.description ?? '')
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '1')
  const [unit, setUnit] = useState(item?.unit ?? '')
  const [unitPrice, setUnitPrice] = useState(item ? String(item.unitPrice) : '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const quantityValue = Number(quantity)
    const unitPriceValue = Number(unitPrice)

    if (!description.trim()) {
      setError('Informe a descrição.')
      return
    }
    if (!quantity || Number.isNaN(quantityValue) || quantityValue <= 0) {
      setError('A quantidade deve ser maior que zero.')
      return
    }
    if (!unitPrice || Number.isNaN(unitPriceValue) || unitPriceValue < 0) {
      setError('Informe um preço unitário válido.')
      return
    }

    setError(null)
    const saved = await onSubmit({
      description: description.trim(),
      quantity: quantityValue,
      unit: unit.trim(),
      unitPrice: unitPriceValue,
    })
    if (saved && !item) {
      setDescription('')
      setQuantity('1')
      setUnit('')
      setUnitPrice('')
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit} noValidate>
      <label className="item-description">
        Descrição
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={255}
        />
      </label>
      <label>
        Quantidade
        <input
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          min={0}
          step="any"
        />
      </label>
      <label>
        Unidade
        <input
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          maxLength={20}
          placeholder="un, m², h"
        />
      </label>
      <label>
        Preço unit. (R$)
        <input
          type="number"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
          min={0}
          step="0.01"
        />
      </label>
      <div className="actions">
        <button type="submit" className="primary" disabled={busy}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
        )}
      </div>
      {error && <p className="error item-error">{error}</p>}
    </form>
  )
}
