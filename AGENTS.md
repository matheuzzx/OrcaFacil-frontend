# Frontend Engineering Guidelines — React + TypeScript

## 1. Objetivo principal

Desenvolva um frontend React + TypeScript com código legível, previsível, fácil de manter e simples de entender por outro desenvolvedor.

Priorize:

1. Simplicidade antes de abstrações.
2. Legibilidade antes de concisão excessiva.
3. Responsabilidades bem definidas.
4. Tipagem segura com TypeScript.
5. Reutilização somente quando houver uma necessidade real.
6. Soluções idiomáticas do React, evitando complexidade desnecessária.

O objetivo não é produzir a arquitetura mais sofisticada possível, mas a solução mais simples que atenda corretamente aos requisitos atuais e permita evolução futura.

## 2. Evite overengineering e código genérico gerado por IA

Não adicione complexidade sem uma justificativa concreta.

Evite:

- Criar hooks personalizados para operações simples utilizadas uma única vez.
- Criar abstrações genéricas para cenários que ainda não existem.
- Criar factories, registries, providers ou sistemas de configuração desnecessários.
- Criar interfaces e classes apenas para reproduzir padrões comuns do backend Java.
- Adicionar múltiplas camadas de wrappers em torno de operações simples.
- Criar componentes que aceitam dezenas de props para atender a casos hipotéticos.
- Implementar estados de loading, error, retry, cancellation e cache manualmente quando a solução existente já oferece esses recursos.
- Adicionar comentários que apenas repetem o que o código faz.
- Usar `useMemo`, `useCallback` ou `useRef` preventivamente, sem uma necessidade demonstrável.
- Criar tipos, arquivos ou funções que não são necessários para o comportamento atual.

Antes de criar uma abstração, pergunte:

- Existe duplicação real que precisa ser eliminada?
- Há uma regra de negócio ou responsabilidade que justifique a separação?
- Essa abstração torna o código mais fácil de compreender?
- A complexidade introduzida compensa o benefício?

Se não houver uma justificativa clara, prefira uma implementação direta.

## 3. Divisão de responsabilidades

Cada módulo deve ter uma responsabilidade clara.

### Components

Os componentes devem cuidar da interface, da interação com o usuário e da composição de outros componentes.

- Prefira componentes pequenos quando isso melhorar a compreensão.
- Mantenha a lógica de apresentação próxima da interface correspondente.
- Não extraia cada elemento JSX para um componente separado sem necessidade.
- Evite componentes enormes que misturam interface, requisições HTTP, validações e regras de negócio.
- Não transforme componentes em componentes genéricos de configuração complexa sem um caso de uso real.

### Pages

As páginas devem representar telas ou rotas da aplicação.

- Organize os componentes necessários para montar cada tela.
- Faça a integração entre os componentes e as funcionalidades da página.
- Evite colocar todas as regras de negócio e todas as chamadas de API diretamente no componente da página.
- Não crie uma camada adicional de controllers para reproduzir a arquitetura MVC do backend.

### Services / API

Centralize a comunicação HTTP e as integrações externas em módulos apropriados.

- Mantenha a configuração do cliente HTTP em um único lugar quando fizer sentido.
- Organize as funções de API por domínio ou recurso, como `customers`, `quotes` e `businesses`.
- Use nomes que expressem a operação realizada.
- Mantenha detalhes de endpoints e serialização fora dos componentes de interface.
- Não crie uma arquitetura de cliente HTTP genérica e complexa quando uma função simples resolver o problema.
- Trate erros de maneira consistente, preservando informações úteis para diagnóstico.

### Hooks

Utilize hooks personalizados quando eles encapsularem uma lógica reutilizável ou tornarem um componente significativamente mais simples.

- Não crie um hook para cada chamada de API por obrigação.
- Não utilize `useEffect` para calcular valores derivados de props ou state.
- Não introduza `useCallback`, `useMemo` ou `useRef` sem necessidade.
- Evite hooks genéricos com muitos parâmetros, callbacks e estados que atendam a cenários hipotéticos.
- Prefira a API nativa do React quando ela já for suficiente.

### Types

Organize os tipos conforme o domínio e a necessidade de reutilização.

- Prefira tipos explícitos para entidades e contratos importantes.
- Evite duplicar definições de tipos em diferentes módulos.
- Não crie interfaces para cada objeto trivial sem benefício claro.
- Evite `any`; prefira tipos concretos, `unknown` quando apropriado e narrowing seguro.
- Não utilize type assertions para esconder erros de tipagem que deveriam ser corrigidos.

### Utils

Utilize funções utilitárias para operações puras e reutilizáveis, como formatação de moeda, datas e valores.

Não transforme regras de negócio, requisições HTTP ou lógica de interface em uma coleção indiscriminada de funções genéricas.

## 4. TypeScript

Utilize TypeScript como ferramenta de segurança e documentação do código.

- Ative e respeite o modo `strict`.
- Evite `any` e coerções de tipo desnecessárias.
- Utilize unions discriminadas quando representarem estados realmente diferentes.
- Prefira tipos inferidos quando forem claros; declare tipos explicitamente quando melhorarem a compreensão ou definirem contratos.
- Valide dados externos em tempo de execução quando a segurança depender dessa validação.
- Não suponha que uma resposta HTTP ou um objeto JSON esteja correto apenas porque recebeu uma anotação de tipo.
- Não utilize generics sem um benefício real de reutilização ou segurança.

## 5. Estado e efeitos no React

Escolha a ferramenta mais simples adequada a cada necessidade.

- Utilize `useState` para estado local de interface.
- Utilize `useEffect` para sincronização com sistemas externos, não como mecanismo genérico para executar lógica.
- Calcule valores derivados diretamente durante a renderização quando possível.
- Evite duplicar o mesmo estado em vários lugares.
- Não crie contextos globais para estados utilizados em apenas uma parte da aplicação.
- Não introduza bibliotecas de gerenciamento de estado ou de data fetching sem necessidade concreta.
- Evite requisições duplicadas e atualizações de estado após operações inválidas.
- Prefira bibliotecas estabelecidas quando funcionalidades complexas de cache, sincronização e retry realmente forem necessárias.

## 6. Formulários e validação

- Mantenha os formulários fáceis de ler.
- Separe schemas de validação quando houver regras relevantes ou reutilizadas.
- Utilize validação no frontend para melhorar a experiência do usuário.
- Nunca trate validação no frontend como substituta da validação no backend.
- Evite abstrações genéricas de formulário para telas simples.
- Exiba mensagens de erro compreensíveis e preserve os dados preenchidos quando apropriado.

## 7. Autenticação e segurança

- Não exponha segredos ou credenciais administrativas no frontend.
- Utilize o Supabase Auth conforme sua documentação oficial.
- Centralize a inicialização do cliente Supabase.
- Mantenha os fluxos de autenticação claros, incluindo login, cadastro, logout e recuperação de senha.
- Proteja rotas na interface para melhorar a navegação, mas nunca dependa disso como única camada de autorização.
- Não armazene tokens manualmente quando o SDK já gerenciar a sessão de forma apropriada.
- Não registre senhas, tokens ou informações sensíveis nos logs.
- Trate falhas de autenticação e expiração de sessão de maneira previsível.

## 8. Estrutura de pastas

Organize os arquivos por funcionalidade e responsabilidade, sem criar pastas vazias ou camadas obrigatórias.

Uma estrutura inicial possível:

src/
  app/
    App.tsx
    routes.tsx
  components/
    ui/
  features/
    auth/
      components/
      pages/
      services/
      types.ts
    customers/
      components/
      pages/
      services/
      types.ts
    quotes/
      components/
      pages/
      services/
      types.ts
  lib/
    supabase.ts
    api.ts
  utils/
  types/

Adapte a estrutura ao tamanho real do projeto.

Não crie todos esses diretórios antecipadamente se eles não forem necessários. Evite tanto um único arquivo gigante quanto uma fragmentação excessiva.

## 9. Tratamento de erros e legibilidade

- Escreva código que possa ser entendido sem depender de comentários extensos.
- Utilize nomes descritivos para funções, variáveis e componentes.
- Prefira fluxo de execução explícito a encadeamentos excessivamente complexos.
- Trate erros nos limites adequados da aplicação.
- Não silencie exceções sem uma justificativa.
- Não utilize `catch` genéricos que escondam falhas.
- Não exiba mensagens técnicas ou informações internas diretamente ao usuário.
- Evite abstrações que obriguem o leitor a navegar por muitos arquivos para entender uma operação simples.

## 10. Testes e qualidade

- Teste regras de negócio importantes, transformações de dados e fluxos críticos.
- Não escreva testes superficiais apenas para aumentar a quantidade de arquivos.
- Não altere configurações existentes de lint, formatação ou TypeScript sem necessidade.
- Siga os padrões já estabelecidos no projeto.
- Antes de adicionar uma dependência, verifique se a funcionalidade pode ser resolvida adequadamente com os recursos existentes.

## 11. Processo de implementação

Antes de implementar uma funcionalidade:

1. Examine a estrutura e os padrões existentes no projeto.
2. Identifique os módulos que realmente precisam ser alterados.
3. Escolha a solução mais simples que satisfaça os requisitos.
4. Reutilize componentes e funções existentes quando apropriado.
5. Implemente apenas o escopo solicitado.
6. Execute as verificações disponíveis, como lint, TypeScript e build.
7. Informe as decisões relevantes, as alterações realizadas e eventuais limitações.

Não reescreva arquivos ou módulos não relacionados à tarefa.

Não adicione funcionalidades hipotéticas, dependências ou abstrações por iniciativa própria.

Se houver mais de uma solução válida, prefira a mais simples, desde que mantenha segurança, legibilidade e comportamento correto.

## 12. Regra final

O código deve parecer escrito por um desenvolvedor cuidadoso que conhece o problema, e não por uma ferramenta que tenta demonstrar sofisticação.

**Simplicidade não significa ignorar problemas reais. Significa resolver os problemas existentes sem inventar outros.**

Toda abstração deve ter um propósito identificável. Toda camada deve possuir uma responsabilidade clara. Toda dependência deve justificar sua presença.