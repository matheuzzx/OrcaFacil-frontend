import type { Address, PersonType } from '../../types/common'

export type Customer = {
  id: string
  businessId: string
  personType: PersonType
  name: string
  taxId: string | null
  email: string | null
  phone: string | null
  address: Address | null
  notes: string | null
  active: boolean
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CustomerInput = {
  personType: PersonType
  name: string
  taxId?: string
  email: string
  phone?: string
  address?: Address
  notes: string
}
