import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getErrorMessage } from '../../lib/api'
import {
  createCustomer,
  deactivateCustomer,
  getCustomer,
  reactivateCustomer,
  updateCustomer,
} from './api'
import { CustomerForm } from './CustomerForm'
import type { Customer, CustomerInput } from './types'

/** Cadastro (/clientes/novo) e edição (/clientes/:customerId) de cliente. */
export function CustomerFormPage() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!customerId) return
    let ignore = false
    getCustomer(customerId)
      .then((result) => {
        if (!ignore) setCustomer(result)
      })
      .catch((getError: unknown) => {
        if (!ignore) setLoadError(getErrorMessage(getError))
      })
    return () => {
      ignore = true
    }
  }, [customerId])

  async function handleSubmit(input: CustomerInput) {
    setSubmitting(true)
    setError(null)
    try {
      if (customerId) {
        await updateCustomer(customerId, input)
      } else {
        await createCustomer(input)
      }
      navigate('/clientes')
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(current: Customer) {
    if (current.active && !window.confirm(`Desativar o cliente ${current.name}?`)) return

    setError(null)
    try {
      const updated = current.active
        ? await deactivateCustomer(current.id)
        : await reactivateCustomer(current.id)
      setCustomer(updated)
    } catch (toggleError) {
      setError(getErrorMessage(toggleError))
    }
  }

  const isEditing = Boolean(customerId)

  if (isEditing && loadError) {
    return <p className="error">{loadError}</p>
  }
  if (isEditing && !customer) {
    return <p className="muted">Carregando...</p>
  }

  return (
    <section>
      <header className="page-header">
        <h1>{customer ? customer.name : 'Novo cliente'}</h1>
        <div className="actions">
          {customer && (
            <button type="button" onClick={() => handleToggleActive(customer)}>
              {customer.active ? 'Desativar' : 'Reativar'}
            </button>
          )}
          <Link to="/clientes" className="button">
            Voltar
          </Link>
        </div>
      </header>

      {customer && !customer.active && (
        <p className="notice">Cliente inativo. Reative-o para editar ou usá-lo em orçamentos.</p>
      )}
      {error && <p className="error">{error}</p>}

      {/* key: recria o formulário com os dados atualizados após reativar */}
      <CustomerForm
        key={customer ? `${customer.id}-${customer.active}` : 'new'}
        customer={customer}
        submitting={submitting}
        disabled={customer ? !customer.active : false}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
