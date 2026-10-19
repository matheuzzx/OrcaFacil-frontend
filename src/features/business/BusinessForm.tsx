import { useState, type FormEvent } from 'react'
import { AddressFields } from '../../components/AddressFields'
import { getErrorMessage } from '../../lib/api'
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
import { createBusiness, updateBusiness } from './api'
import type { Business, BusinessInput } from './types'

type BusinessFormProps = {
  /** null para o cadastro inicial do negócio. */
  business: Business | null
  onSaved: (business: Business) => void
}

type FieldErrors = Partial<
  Record<'displayName' | 'taxId' | 'businessEmail' | 'phone', string>
>

export function BusinessForm({ business, onSaved }: BusinessFormProps) {
  const [personType, setPersonType] = useState<PersonType>(
    business?.personType ?? 'INDIVIDUAL',
  )
  const [displayName, setDisplayName] = useState(business?.displayName ?? '')
  const [legalName, setLegalName] = useState(business?.legalName ?? '')
  const [taxId, setTaxId] = useState(formatTaxId(business?.taxId ?? null))
  const [businessEmail, setBusinessEmail] = useState(business?.businessEmail ?? '')
  const [phone, setPhone] = useState(formatPhone(business?.phone ?? null))
  const [logoUrl, setLogoUrl] = useState(business?.logoUrl ?? '')
  const [address, setAddress] = useState(addressToFormValues(business?.address ?? null))

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [addressErrors, setAddressErrors] = useState<AddressFormErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(false)

    const errors: FieldErrors = {
      displayName: displayName.trim() ? undefined : 'Informe o nome do negócio.',
      taxId: validateTaxId(taxId, true),
      businessEmail: validateEmail(businessEmail),
      phone: validatePhone(phone),
    }
    const newAddressErrors = validateAddress(address)
    setFieldErrors(errors)
    setAddressErrors(newAddressErrors)
    if (Object.values({ ...errors, ...newAddressErrors }).some(Boolean)) return

    const input: BusinessInput = {
      personType,
      displayName: displayName.trim(),
      legalName: legalName.trim(),
      taxId: digitsOrUndefined(taxId) ?? '',
      businessEmail: businessEmail.trim(),
      phone: digitsOrUndefined(phone),
      logoUrl: logoUrl.trim(),
      address: formValuesToAddress(address),
    }

    setSubmitting(true)
    setError(null)
    try {
      const saved = business ? await updateBusiness(input) : await createBusiness(input)
      setSuccess(true)
      onSaved(saved)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-grid">
        <legend>Dados do negócio</legend>
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
          {personType === 'COMPANY' ? 'CNPJ' : 'CPF'} *
          <input
            value={taxId}
            onChange={(event) => setTaxId(event.target.value)}
            inputMode="numeric"
            maxLength={18}
          />
          {fieldErrors.taxId && <span className="error">{fieldErrors.taxId}</span>}
        </label>
        <label className="span-2">
          Nome de exibição *
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={150}
          />
          {fieldErrors.displayName && (
            <span className="error">{fieldErrors.displayName}</span>
          )}
        </label>
        <label className="span-2">
          Razão social
          <input
            value={legalName}
            onChange={(event) => setLegalName(event.target.value)}
            maxLength={150}
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={businessEmail}
            onChange={(event) => setBusinessEmail(event.target.value)}
            maxLength={254}
          />
          {fieldErrors.businessEmail && (
            <span className="error">{fieldErrors.businessEmail}</span>
          )}
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
        <label className="span-2">
          URL do logo
          <input
            type="url"
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            maxLength={2048}
          />
        </label>
      </fieldset>

      <AddressFields values={address} errors={addressErrors} onChange={setAddress} />

      {error && <p className="error">{error}</p>}
      {success && <p className="success">Dados salvos.</p>}

      <div className="actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Salvando...' : business ? 'Salvar alterações' : 'Cadastrar negócio'}
        </button>
      </div>
    </form>
  )
}
