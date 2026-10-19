import { apiRequest } from '../../lib/api'
import type { Customer, CustomerInput } from './types'

const BASE_PATH = '/api/customers'

export function listCustomers(deactivated = false): Promise<Customer[]> {
  return apiRequest<Customer[]>(`${BASE_PATH}?deactivated=${deactivated}`)
}

export function getCustomer(customerId: string): Promise<Customer> {
  return apiRequest<Customer>(`${BASE_PATH}/${customerId}`)
}

export function createCustomer(input: CustomerInput): Promise<Customer> {
  return apiRequest<Customer>(BASE_PATH, 'POST', input)
}

export function updateCustomer(customerId: string, input: CustomerInput): Promise<Customer> {
  return apiRequest<Customer>(`${BASE_PATH}/${customerId}`, 'PATCH', input)
}

export function deactivateCustomer(customerId: string): Promise<Customer> {
  return apiRequest<Customer>(`${BASE_PATH}/${customerId}/deactivate`, 'PATCH')
}

export function reactivateCustomer(customerId: string): Promise<Customer> {
  return apiRequest<Customer>(`${BASE_PATH}/${customerId}/reactivate`, 'PATCH')
}
