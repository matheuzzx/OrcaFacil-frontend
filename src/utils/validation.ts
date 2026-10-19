export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function validateTaxId(value: string, required: boolean): string | undefined {
  const digits = onlyDigits(value)
  if (!digits) return required ? 'Informe o CPF ou CNPJ.' : undefined
  if (digits.length !== 11 && digits.length !== 14) {
    return 'O CPF deve ter 11 dígitos e o CNPJ, 14.'
  }
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const digits = onlyDigits(value)
  if (digits && (digits.length < 10 || digits.length > 11)) {
    return 'Informe o telefone com DDD (10 ou 11 dígitos).'
  }
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Informe um e-mail válido.'
  }
  return undefined
}

/** Campos com padrão fixo na API não aceitam string vazia: envia-se undefined. */
export function digitsOrUndefined(value: string): string | undefined {
  return onlyDigits(value) || undefined
}
