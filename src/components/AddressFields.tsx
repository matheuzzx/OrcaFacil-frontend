import type { AddressFormErrors, AddressFormValues } from '../utils/address'

type AddressFieldsProps = {
  values: AddressFormValues
  errors: AddressFormErrors
  onChange: (values: AddressFormValues) => void
  disabled?: boolean
}

export function AddressFields({ values, errors, onChange, disabled }: AddressFieldsProps) {
  function update(field: keyof AddressFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  return (
    <fieldset className="form-grid" disabled={disabled}>
      <legend>Endereço</legend>
      <label>
        CEP
        <input
          value={values.postalCode}
          onChange={(event) => update('postalCode', event.target.value)}
          inputMode="numeric"
          maxLength={9}
        />
        {errors.postalCode && <span className="error">{errors.postalCode}</span>}
      </label>
      <label className="span-2">
        Rua
        <input
          value={values.street}
          onChange={(event) => update('street', event.target.value)}
          maxLength={150}
        />
      </label>
      <label>
        Número
        <input
          value={values.number}
          onChange={(event) => update('number', event.target.value)}
          maxLength={20}
        />
      </label>
      <label>
        Complemento
        <input
          value={values.complement}
          onChange={(event) => update('complement', event.target.value)}
          maxLength={100}
        />
      </label>
      <label>
        Bairro
        <input
          value={values.district}
          onChange={(event) => update('district', event.target.value)}
          maxLength={100}
        />
      </label>
      <label>
        Cidade
        <input
          value={values.city}
          onChange={(event) => update('city', event.target.value)}
          maxLength={100}
        />
      </label>
      <label>
        UF
        <input
          value={values.state}
          onChange={(event) => update('state', event.target.value.toUpperCase())}
          maxLength={2}
        />
        {errors.state && <span className="error">{errors.state}</span>}
      </label>
    </fieldset>
  )
}
