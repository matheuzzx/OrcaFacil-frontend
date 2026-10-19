export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'

export type QuoteItem = {
  id: string
  position: number
  description: string
  quantity: number
  unit: string | null
  unitPrice: number
  total: number
  createdAt: string
  updatedAt: string
}

export type Quote = {
  id: string
  businessId: string
  customerId: string
  number: number
  title: string | null
  status: QuoteStatus
  issueDate: string
  validUntil: string
  subtotal: number
  discount: number
  total: number
  notes: string | null
  terms: string | null
  items: QuoteItem[]
  createdAt: string
  updatedAt: string
}

/** customerId é omitido na edição quando o cliente não muda. */
export type QuoteInput = {
  customerId?: string
  title: string
  issueDate: string
  validUntil: string
  discount?: number
  notes: string
  terms: string
}

export type QuoteItemInput = {
  description: string
  quantity: number
  unit: string
  unitPrice: number
}
