import { apiBlob, apiRequest, apiSend } from '../../lib/api'
import type { Quote, QuoteInput, QuoteItemInput, QuoteStatus } from './types'

const BASE_PATH = '/api/quotes'

export function listQuotes(status?: QuoteStatus): Promise<Quote[]> {
  const query = status ? `?status=${status}` : ''
  return apiRequest<Quote[]>(`${BASE_PATH}${query}`)
}

export function getQuote(quoteId: string): Promise<Quote> {
  return apiRequest<Quote>(`${BASE_PATH}/${quoteId}`)
}

export function createQuote(input: QuoteInput): Promise<Quote> {
  return apiRequest<Quote>(BASE_PATH, 'POST', input)
}

export function updateQuote(quoteId: string, input: QuoteInput): Promise<Quote> {
  return apiRequest<Quote>(`${BASE_PATH}/${quoteId}`, 'PATCH', input)
}

export function deleteQuote(quoteId: string): Promise<void> {
  return apiSend(`${BASE_PATH}/${quoteId}`, 'DELETE')
}

export function changeQuoteStatus(quoteId: string, status: QuoteStatus): Promise<Quote> {
  return apiRequest<Quote>(`${BASE_PATH}/${quoteId}/status`, 'PATCH', { status })
}

export function addQuoteItem(quoteId: string, input: QuoteItemInput): Promise<Quote> {
  return apiRequest<Quote>(`${BASE_PATH}/${quoteId}/items`, 'POST', input)
}

export function updateQuoteItem(
  quoteId: string,
  itemId: string,
  input: QuoteItemInput,
): Promise<Quote> {
  return apiRequest<Quote>(`${BASE_PATH}/${quoteId}/items/${itemId}`, 'PATCH', input)
}

export function removeQuoteItem(quoteId: string, itemId: string): Promise<void> {
  return apiSend(`${BASE_PATH}/${quoteId}/items/${itemId}`, 'DELETE')
}

export function reorderQuoteItems(quoteId: string, itemIds: string[]): Promise<Quote> {
  return apiRequest<Quote>(`${BASE_PATH}/${quoteId}/items/reorder`, 'PATCH', { itemIds })
}

export function getQuotePreview(quoteId: string): Promise<Blob> {
  return apiBlob(`${BASE_PATH}/${quoteId}/preview`)
}

export function getQuotePdf(quoteId: string): Promise<Blob> {
  return apiBlob(`${BASE_PATH}/${quoteId}/pdf`)
}
