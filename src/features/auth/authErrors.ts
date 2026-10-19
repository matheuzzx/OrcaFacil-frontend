import type { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos.'
    case 'email_not_confirmed':
      return 'Confirme seu e-mail antes de entrar.'
    case 'user_already_exists':
      return 'Já existe uma conta com este e-mail.'
    case 'weak_password':
      return 'Escolha uma senha mais forte.'
    case 'same_password':
      return 'A nova senha deve ser diferente da atual.'
    case 'over_email_send_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    default:
      return 'Não foi possível concluir a operação. Tente novamente.'
  }
}
