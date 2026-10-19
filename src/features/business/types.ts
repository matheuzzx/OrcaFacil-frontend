import type { Address, PersonType } from '../../types/common'

export type Business = {
  id: string
  ownerId: string
  personType: PersonType
  displayName: string
  legalName: string | null
  taxId: string
  businessEmail: string | null
  phone: string | null
  logoUrl: string | null
  address: Address | null
  createdAt: string
  updatedAt: string
}

export type BusinessInput = {
  personType: PersonType
  displayName: string
  legalName: string
  taxId: string
  businessEmail: string
  phone?: string
  logoUrl: string
  address?: Address
}

/** Disponibilizado pelo layout às páginas internas via useOutletContext. */
export type BusinessOutletContext = {
  business: Business
  onBusinessUpdated: (business: Business) => void
}
