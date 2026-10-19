import { useState, type FormEvent } from 'react'
import { AddressFields } from '../../components/AddressFields'
import type { PersonType } from '../../types/common'
import {
  addressToFormValues,
  formValuesToAddress,
  validateAddress,
  type AddressFormErrors,
} from '../../utils/address'
import { formatPhone, formatTaxId } from '../../utils/format'
import {
  digitsOrUndefined,
  validateEmail,
  validatePhone,
  validateTaxId,
} from '../../utils/validation'
import type { Customer, CustomerInput } from './types'

type CustomerFormProps = {
  customer: Customer | null
  submitting: boolean
  disabled?: boolean
  onSubmit: (input: CustomerInput) => void
}

type FieldErrors = Partial<Record<'name' | 'taxId' | 'email' | 'phone', string>>

export function CustomerForm({ customer, submitting, disabled, onSubmit }: CustomerFormProps) {
  const [personType, setPersonType] = useState<PersonType>(
    customer?.personType ?? 'INDIVIDUAL',
  )
  const [name, setName] = useState(customer?.name ?? '')
  const [taxId, setTaxId] = useState(formatTaxId(customer?.taxId ?? null))
  const [email, setEmail] = useState(customer?.email ?? '')
  const [phone, setPhone] = useState(formatPhone(customer?.phone ?? null))
  const [notes, setNotes] = useState(customer?.notes ?? '')
  const [address, setAddress] = useState(addressToFormValues(customer?.address ?? null))

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [addressErrors, setAddressErrors] = useState<AddressFormErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors: FieldErrors = {
      name: name.trim() ? undefined : 'Informe o nome do cliente.',
      taxId: validateTaxId(taxId, false),
      email: validateEmail(email),
      phone: validatePhone(phone),
    }
    const newAddressErrors = validateAddress(address)
    setFieldErrors(errors)
    setAddressErrors(newAddressErrors)
    if (Object.values({ ...errors, ...newAddressErrors }).some(Boolean)) return

    onSubmit({
      personType,
      name: name.trim(),
      taxId: digitsOrUndefined(taxId),
      email: email.trim(),
      phone: digitsOrUndefined(phone),
      address: formValuesToAddress(address),
      notes: notes.trim(),
    })
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-grid" disabled={disabled}>
        <legend>Dados do cliente</legend>
        <label>
          Tipo
          <select
            value={personType}
            onChange={(event) =>
              setPersonType(event.target.value === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL')
            }
          >
            <option value="INDIVIDUAL">Pessoa física</option>
            <option value="COMPANY">Pessoa jurídica</option>
          </select>
        </label>
        <label>
          {personType === 'COMPANY' ? 'CNPJ' : 'CPF'}
          <input
            value={taxId}
            onChange={(event) => setTaxId(event.target.value)}
            inputMode="numeric"
            maxLength={18}
          />
          {fieldErrors.taxId && <span className="error">{fieldErrors.taxId}</span>}
        </label>
        <label className="span-2">
          Nome *
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={150}
          />
          {fieldErrors.name && <span className="error">{fieldErrors.name}</span>}
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
          />
          {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
        </label>
        <label>
          Telefone
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            maxLength={15}
          />
          {fieldErrors.phone && <span className="error">{fieldErrors.phone}</span>}
        </label>
      </fieldset>

      <AddressFields
        values={address}
        errors={addressErrors}
        onChange={setAddress}
        disabled={disabled}
      />

      <fieldset disabled={disabled}>
        <label>
          Observações
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            rows={3}
          />
        </label>
      </fieldset>

      {!disabled && (
        <div className="actions">
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}
    </form>
  )
}
