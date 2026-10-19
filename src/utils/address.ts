import type { Address } from '../types/common'
import { onlyDigits } from './validation'

export type AddressFormValues = {
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  postalCode: string
}

export type AddressFormErrors = Partial<Record<'state' | 'postalCode', string>>

export function addressToFormValues(address: Address | null): AddressFormValues {
  return {
    street: address?.street ?? '',
    number: address?.number ?? '',
    complement: address?.complement ?? '',
    district: address?.district ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postalCode: address?.postalCode ?? '',
  }
}

export function validateAddress(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {}
  if (values.state && !/^[A-Z]{2}$/.test(values.state)) {
    errors.state = 'Use a sigla do estado (ex.: SP).'
  }
  if (values.postalCode && onlyDigits(values.postalCode).length !== 8) {
    errors.postalCode = 'O CEP deve ter 8 dígitos.'
  }
  return errors
}

/** Retorna undefined quando nenhum campo do endereço foi preenchido. */
export function formValuesToAddress(values: AddressFormValues): Address | undefined {
  const isEmpty = Object.values(values).every((value) => value.trim() === '')
  if (isEmpty) return undefined

  return {
    street: values.street.trim(),
    number: values.number.trim(),
    complement: values.complement.trim(),
    district: values.district.trim(),
    city: values.city.trim(),
    state: values.state || null,
    postalCode: onlyDigits(values.postalCode) || null,
  }
}
