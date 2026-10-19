import { quoteStatusLabels } from './status'
import type { QuoteStatus } from './types'

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <span className={`badge status-${status.toLowerCase()}`}>{quoteStatusLabels[status]}</span>
}
