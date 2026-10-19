export type PersonType = 'INDIVIDUAL' | 'COMPANY'

export type Address = {
  street: string | null
  number: string | null
  complement: string | null
  district: string | null
  city: string | null
  state: string | null
  postalCode: string | null
}
