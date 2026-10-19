import { useOutletContext } from 'react-router'
import { BusinessForm } from './BusinessForm'
import type { BusinessOutletContext } from './types'

export function BusinessPage() {
  const { business, onBusinessUpdated } = useOutletContext<BusinessOutletContext>()

  return (
    <section>
      <header className="page-header">
        <h1>Meu negócio</h1>
      </header>
      <p className="muted">Estes dados aparecem no cabeçalho dos seus orçamentos.</p>
      <BusinessForm business={business} onSaved={onBusinessUpdated} />
    </section>
  )
}
