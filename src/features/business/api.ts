import { apiRequest } from '../../lib/api'
import type { Business, BusinessInput } from './types'

const BASE_PATH = '/api/businesses/me'

export function getCurrentBusiness(): Promise<Business> {
  return apiRequest<Business>(BASE_PATH)
}

export function createBusiness(input: BusinessInput): Promise<Business> {
  return apiRequest<Business>(BASE_PATH, 'POST', input)
}

export function updateBusiness(input: BusinessInput): Promise<Business> {
  return apiRequest<Business>(BASE_PATH, 'PATCH', input)
}
