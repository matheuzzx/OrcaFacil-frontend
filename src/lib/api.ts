import { supabase } from './supabase'

type FieldValidationError = {
  field: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly fieldErrors: FieldValidationError[]

  constructor(
    status: number,
    code: string | null,
    message: string,
    fieldErrors: FieldValidationError[],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

async function authorizedFetch(
  path: string,
  method: string,
  body?: unknown,
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const headers = new Headers()

  if (data.session) {
    headers.set('Authorization', `Bearer ${data.session.access_token}`)
  }
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401) {
    // Sessão inválida ou expirada: encerrar a sessão leva o usuário ao login.
    await supabase.auth.signOut()
  }
  if (!response.ok) {
    throw await toApiError(response)
  }
  return response
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // Respostas sem JSON (por exemplo, API fora do ar atrás do proxy).
  }

  if (typeof body !== 'object' || body === null) {
    return new ApiError(response.status, null, response.statusText, [])
  }

  const code = 'code' in body && typeof body.code === 'string' ? body.code : null
  const message =
    'message' in body && typeof body.message === 'string'
      ? body.message
      : response.statusText
  const fieldErrors =
    'fieldErrors' in body && Array.isArray(body.fieldErrors)
      ? body.fieldErrors.filter(isFieldValidationError)
      : []

  return new ApiError(response.status, code, message, fieldErrors)
}

function isFieldValidationError(value: unknown): value is FieldValidationError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'field' in value &&
    typeof value.field === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  )
}

export async function apiRequest<T>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await authorizedFetch(path, method, body)
  return response.json()
}

/** Para endpoints que respondem 204 No Content. */
export async function apiSend(path: string, method: string): Promise<void> {
  await authorizedFetch(path, method)
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await authorizedFetch(path, 'GET')
  return response.blob()
}

// Mensagens de conflito conhecidas da API, traduzidas para o usuário.
const conflictMessages: Record<string, string> = {
  'Business already exists for this owner': 'Você já cadastrou o seu negócio.',
  'Customer tax ID already exists for this business':
    'Já existe um cliente com este CPF/CNPJ.',
  'Only draft quotes can be edited':
    'Apenas orçamentos em rascunho podem ser alterados.',
  'Quote validity date cannot be before issue date':
    'A validade não pode ser anterior à data de emissão.',
  'Quote discount cannot be greater than subtotal':
    'O desconto não pode ser maior que o subtotal.',
  'A quote must have at least one item before being sent':
    'Adicione ao menos um item antes de enviar o orçamento.',
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível conectar ao servidor. Tente novamente.'
  }
  if (error.status === 401) {
    return 'Sua sessão expirou. Entre novamente.'
  }
  if (error.code === 'VALIDATION_ERROR' || error.code === 'MALFORMED_REQUEST') {
    return 'Verifique os dados informados.'
  }
  if (error.status === 404) {
    return 'Registro não encontrado.'
  }
  if (error.status === 409) {
    return conflictMessages[error.message] ?? 'A operação não pôde ser concluída.'
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}
