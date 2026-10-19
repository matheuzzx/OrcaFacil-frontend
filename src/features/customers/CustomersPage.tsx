import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '../../lib/api'
import { formatPhone, formatTaxId } from '../../utils/format'
import { listCustomers, reactivateCustomer } from './api'
import type { Customer } from './types'

export function CustomersPage() {
  const [showDeactivated, setShowDeactivated] = useState(false)
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    listCustomers(showDeactivated)
      .then((result) => {
        if (ignore) return
        setCustomers(result)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!ignore) setError(getErrorMessage(loadError))
      })
    return () => {
      ignore = true
    }
  }, [showDeactivated])

  function changeFilter(deactivated: boolean) {
    setCustomers(null)
    setShowDeactivated(deactivated)
  }

  async function handleReactivate(customer: Customer) {
    try {
      await reactivateCustomer(customer.id)
      setCustomers((current) => current?.filter(({ id }) => id !== customer.id) ?? null)
    } catch (reactivateError) {
      setError(getErrorMessage(reactivateError))
    }
  }

  return (
    <section>
      <header className="page-header">
        <h1>Clientes</h1>
        <Link to="/clientes/novo" className="button primary">
          Novo cliente
        </Link>
      </header>

      <div className="tabs">
        <button
          type="button"
          className={showDeactivated ? '' : 'active'}
          onClick={() => changeFilter(false)}
        >
          Ativos
        </button>
        <button
          type="button"
          className={showDeactivated ? 'active' : ''}
          onClick={() => changeFilter(true)}
        >
          Inativos
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {customers === null && !error && <p className="muted">Carregando...</p>}
      {customers?.length === 0 && (
        <p className="muted">
          {showDeactivated ? 'Nenhum cliente inativo.' : 'Nenhum cliente cadastrado ainda.'}
        </p>
      )}

      {customers && customers.length > 0 && (
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link to={`/clientes/${customer.id}`}>{customer.name}</Link>
                  </td>
                  <td>{formatTaxId(customer.taxId)}</td>
                  <td>{customer.email}</td>
                  <td>{formatPhone(customer.phone)}</td>
                  <td className="row-actions">
                    {!customer.active && (
                      <button type="button" onClick={() => handleReactivate(customer)}>
                        Reativar
                      </button>
                    )}
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
