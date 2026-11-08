# Vitórias

O Vitórias é um app Android de conscientização, orientação e apoio a mulheres em situação de violência. Ele vem com um painel web que permite atualizar o conteúdo do app sem publicar uma nova versão.

Tudo roda localmente, sem servidor na nuvem: o painel fica no seu computador e o app busca o conteúdo nele quando estão na mesma rede.

---

## Sumário

1. [Como o projeto funciona](#1-como-o-projeto-funciona)
2. [Estrutura das pastas](#2-estrutura-das-pastas)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Rodando o painel (`admin/`)](#4-rodando-o-painel-admin)
5. [Rodando o app (`mobile/`)](#5-rodando-o-app-mobile)
6. [O caminho do conteúdo: do painel ao celular](#6-o-caminho-do-conteúdo-do-painel-ao-celular)
7. [Privacidade e segurança](#7-privacidade-e-segurança)
8. [Comandos do dia a dia](#8-comandos-do-dia-a-dia)
9. [Problemas comuns](#9-problemas-comuns)

---

## 1. Como o projeto funciona

O repositório tem **dois projetos independentes**, que não compartilham código:

| Projeto   | O que é | Quem usa | Tecnologias |
|-----------|---------|----------|-------------|
| `admin/`  | Painel web onde se cadastra e publica o conteúdo | A equipe do projeto | Next.js 16, React 19, PostgreSQL (Docker), Drizzle, Better Auth, Tailwind 4 |
| `mobile/` | App que a usuária instala no celular | Mulheres em situação de violência e quem as apoia | Expo SDK 58, React Native, Expo Router, SQLite/SQLCipher |

Eles se comunicam de um único jeito: o app **baixa** o conteúdo publicado no painel. Nada vai do celular para o painel.

```
┌──────────────────────────── Seu computador ────────────────────────────┐
│                                                                         │
│   Equipe ──► Painel web (Next.js) ──► PostgreSQL (Docker)              │
│              http://localhost:3000                                      │
│                     │                                                   │
│                     ├── GET /api/public/content  (só itens publicados) │
│                     │                                                   │
│                     └── npm run content:export                          │
│                           grava mobile/assets/content/snapshot.json     │
└─────────────────────┬───────────────────────────────────┬──────────────┘
                      │ Wi-Fi (quando disponível)          │ embutido no build
                      ▼                                     ▼
              ┌──────────────────────── Celular ────────────────────────┐
              │  content.db  ← conteúdo público (leis, vídeos, rede...) │
              │  relatos.db  ← relatos da usuária, criptografados       │
              └──────────────────────────────────────────────────────────┘
```

### O que o app oferece

- **Informação e Direitos:** tipos de violência, leis e vídeos explicativos.
- **Denúncia:** registro de relatos que ficam **só no aparelho**, criptografados e protegidos por PIN.
- **Apoio:** rede de serviços (delegacias, centros de referência etc.), ordenada pela proximidade quando a usuária permite usar a localização.
- **Emergência:** atalhos para 180, 190 e 100, que funcionam sem internet.
- **Saída rápida:** um botão em todas as telas que troca o app, em menos de um segundo, por uma tela neutra que só mostra a data.

### O que o painel oferece

- Login de um único administrador (não existe cadastro público).
- Cadastro de **tipos de violência**, **leis**, **vídeos** e **rede de apoio**.
- Cada item pode ser publicado ou ocultado. Só os publicados chegam ao app.

---

## 2. Estrutura das pastas

```
vitorias/
├── admin/                      # Painel web
│   ├── src/app/                # Páginas (App Router)
│   │   ├── (painel)/           # Telas do painel: leis, vídeos, rede-apoio, tipos-violencia
│   │   ├── api/public/content/ # Endpoint que o app consulta
│   │   ├── login/              # Tela de login
│   │   └── trocar-senha/       # Troca obrigatória da senha temporária
│   ├── src/db/schema.ts        # Tabelas do banco
│   ├── src/lib/snapshot.ts     # Monta o pacote de conteúdo enviado ao app
│   ├── scripts/                # seed, reset de senha, exportação do snapshot
│   ├── drizzle/                # Migrações do banco
│   └── docker-compose.yml      # PostgreSQL
│
└── mobile/                     # App Android
    ├── src/app/                # Rotas (cada arquivo é uma tela)
    ├── src/features/           # Implementação de cada tela, por módulo
    ├── src/components/         # app-shell.tsx: cabeçalho, abas, saída rápida
    ├── src/data/               # Bancos locais e sincronização
    ├── src/security/           # PIN e dados que vivem só em memória
    ├── src/constants/          # Tema e números de emergência
    └── assets/content/snapshot.json   # Conteúdo embutido para a primeira abertura
```

> **Contrato entre os projetos:** o formato do conteúdo é definido em `admin/src/lib/snapshot.ts` e espelhado em `mobile/src/data/content-types.ts`. Ao mudar um, mude o outro.

---

## 3. Pré-requisitos

| Ferramenta | Para quê | Como conferir |
|------------|----------|---------------|
| Node.js (versão LTS recente) | Os dois projetos | `node -v` |
| Docker com Docker Compose | Banco do painel | `docker compose version` |
| Android Studio com Android SDK | Compilar o app | `adb --version` |
| Emulador Android **ou** celular com depuração USB | Rodar o app | `adb devices` |
| OpenSSL | Gerar o segredo de autenticação | `openssl version` |

> O app **não roda no Expo Go**, porque usa SQLCipher (SQLite criptografado), que precisa de código nativo próprio. É preciso compilar uma *development build* com `npx expo run:android`.

---

## 4. Rodando o painel (`admin/`)

Todos os comandos abaixo são executados **dentro da pasta `admin/`**.

### Passo 1: instalar as dependências

```bash
cd admin
npm install
```

### Passo 2: configurar o `.env`

```bash
cp .env.example .env
```

Abra o `.env` e preencha:

| Variável | O que colocar |
|----------|---------------|
| `DATABASE_URL` | Já vem pronta, com as mesmas credenciais do `docker-compose.yml`. |
| `ADMIN_EMAIL` | O e-mail que será usado para entrar no painel. Nenhum e-mail é enviado; é só o login. |
| `BETTER_AUTH_SECRET` | Um segredo aleatório. Gere com `openssl rand -base64 32` e cole o resultado. |
| `BETTER_AUTH_URL` | Deixe `http://localhost:3000`. |

### Passo 3: subir o banco de dados

```bash
npm run db:up
```

Isso inicia um PostgreSQL no Docker, acessível só pelo próprio computador (`127.0.0.1:5432`). Os dados ficam num volume do Docker e sobrevivem a reinicializações.

### Passo 4: criar as tabelas

```bash
npm run db:migrate
```

### Passo 5: criar o administrador e o conteúdo inicial

```bash
npm run db:seed
```

> ⚠️ **Anote a senha que aparece no terminal.** Ela é temporária e é mostrada **uma única vez**.

Pode rodar o seed de novo sem medo: ele não duplica dados.

### Passo 6: iniciar o painel

```bash
npm run dev
```

Abra http://localhost:3000, entre com o `ADMIN_EMAIL` e a senha temporária. No primeiro acesso, o painel pede uma senha nova.

### Esqueci a senha

Não há recuperação por e-mail. Gere uma nova senha temporária com:

```bash
npm run db:reset-admin-password
```

### Sobre a rede de apoio

Os serviços da rede de apoio entram **ocultos e não verificados**, porque as fontes públicas divergem nos telefones e endereços. Para publicar um serviço:

1. Confira os dados do serviço (telefone, endereço, horário).
2. Marque **"Dados conferidos"**.
3. Só então ative a publicação. O painel não deixa publicar antes disso.

---

## 5. Rodando o app (`mobile/`)

Todos os comandos abaixo são executados **dentro da pasta `mobile/`**.

### Passo 1: instalar as dependências

```bash
cd mobile
npm install
```

> Para **adicionar** um pacote, use sempre `npx expo install <pacote>` em vez de `npm install <pacote>`. Assim a versão instalada é compatível com o SDK 58.

### Passo 2: dizer ao app onde está o painel

```bash
cp .env.example .env
```

A variável `EXPO_PUBLIC_API_URL` aponta para o painel. O valor depende de onde o app vai rodar:

| Onde o app roda | Valor |
|-----------------|-------|
| Emulador Android | `http://10.0.2.2:3000` (é assim que o emulador enxerga o `localhost` do computador) |
| Celular físico | `http://<IP-do-computador>:3000`, com celular e computador na mesma rede Wi-Fi e a porta 3000 liberada no firewall |

Para descobrir o IP do computador no Linux: `hostname -I`.

> O valor é **embutido no app** no momento da compilação. Se trocar de rede, atualize o `.env` e recarregue o app; num APK de release, gere o APK de novo.

### Passo 3: compilar e abrir o app

Com o emulador aberto ou o celular conectado por USB:

```bash
npx expo run:android
```

A primeira compilação demora alguns minutos. Nas próximas vezes, se você só mudou código JavaScript/TypeScript, basta:

```bash
npx expo start
```

e abrir o app que já está instalado. É preciso recompilar com `npx expo run:android` quando mudar algo nativo: `app.json`, plugins, fontes ou pacotes com código nativo.

### E se o painel estiver desligado?

O app continua funcionando normalmente. Ele usa o conteúdo embutido na primeira abertura e, depois, o último conteúdo que conseguiu sincronizar. Falta de rede é tratada como algo normal, nunca como erro.

---

## 6. O caminho do conteúdo: do painel ao celular

1. **A equipe publica** um item no painel. Ele fica salvo no PostgreSQL.
2. **O painel expõe** os itens publicados em `GET /api/public/content`. A resposta tem uma `version` (um hash do conteúdo), usada como `ETag`.
3. **O app, ao abrir,** chama esse endereço enviando a versão que já tem. Se nada mudou, o painel responde `304` e nada é baixado. Se mudou, o app substitui todo o conteúdo local de uma vez.
4. **Sem rede**, o app simplesmente segue com o que tem. A tentativa desiste depois de 8 segundos.

### Atualizar o conteúdo embutido

Na primeira abertura, inclusive sem internet, o app usa o arquivo `mobile/assets/content/snapshot.json`. Para atualizá-lo com o que está publicado no painel:

```bash
cd admin
npm run content:export
```

Faça isso antes de gerar uma nova versão do app, para que quem instalar já receba o conteúdo mais recente.

---

## 7. Privacidade e segurança

O app foi pensado para alguém que pode estar sendo vigiada por quem a agride. Por isso, algumas regras orientam todo o código:

| Regra | Como é garantida |
|-------|------------------|
| **O servidor nunca recebe dados da usuária.** | O endpoint público não aceita parâmetros e não registra IP nem identificador. A localização é usada só no aparelho para ordenar a rede de apoio. |
| **Relatos ficam só no celular, criptografados.** | Ficam em `relatos.db`, um banco SQLCipher (AES-256) cuja chave vive no armazenamento seguro do Android. Se o SQLCipher não estiver disponível, o app **se recusa a salvar** em vez de gravar texto puro. |
| **Relatos protegidos por PIN.** | Após 5 tentativas erradas, o acesso trava por 30 segundos. Com PIN errado, a tela é a mesma existindo ou não relatos. |
| **Nada de rastro de navegação.** | A busca e a localização ficam só na memória e nunca são gravadas. |
| **Saída rápida em qualquer tela.** | O botão leva a uma tela neutra, sem marca do app. Voltar fecha o app em vez de mostrar a tela anterior. |
| **Emergência sempre disponível.** | Os números 180, 190 e 100 estão fixos no código (`src/constants/emergency-channels.ts`) e não dependem de rede, banco ou sincronização. |
| **Sem capturas de tela.** | Em builds de release, o app bloqueia prints e deixa a prévia em "apps recentes" em branco. Em desenvolvimento essa proteção fica desligada, para permitir espelhar a tela. |
| **Sem backup automático.** | `allowBackup` está desligado no `app.json`. |
| **Banco do painel fechado para a rede.** | O PostgreSQL só aceita conexões do próprio computador, e não existe cadastro público no painel. |

---

## 8. Comandos do dia a dia

Ainda não há testes automatizados em nenhum dos projetos. Antes de concluir uma alteração, rode lint e checagem de tipos.

### Painel (`admin/`)

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia o painel em http://localhost:3000 |
| `npm run build` | Gera a versão de produção |
| `npm run lint` | Verifica o estilo do código |
| `npx tsc --noEmit` | Verifica os tipos TypeScript |
| `npm run db:up` | Sobe o PostgreSQL no Docker |
| `npm run db:generate` | Cria uma migração depois de alterar `src/db/schema.ts` |
| `npm run db:migrate` | Aplica as migrações pendentes |
| `npm run db:seed` | Cria o administrador e o conteúdo inicial (pode repetir) |
| `npm run db:reset-admin-password` | Gera uma nova senha temporária |
| `npm run content:export` | Atualiza o conteúdo embutido no app |

### App (`mobile/`)

| Comando | O que faz |
|---------|-----------|
| `npx expo run:android` | Compila e instala a development build |
| `npx expo start` | Inicia o servidor de desenvolvimento para a build já instalada |
| `npx expo install <pacote>` | Adiciona um pacote na versão compatível com o SDK |
| `npx expo install --fix` | Corrige versões incompatíveis |
| `npx expo-doctor` | Diagnostica problemas de dependências e configuração |
| `npx expo lint` | Verifica o estilo do código |
| `npx tsc --noEmit` | Verifica os tipos TypeScript |

---

## 9. Problemas comuns

**O app não mostra o conteúdo que acabei de publicar.**
Confira se o painel está rodando e se `EXPO_PUBLIC_API_URL` está certo para o seu caso (emulador ou celular). No celular, teste abrindo `http://<IP>:3000/api/public/content` no navegador dele. Se não abrir, o problema é de rede ou firewall.

**Mudei o `.env` do app e nada aconteceu.**
O valor é embutido na compilação. Reinicie o `npx expo start` limpando o cache (`npx expo start -c`) ou recompile.

**`npm run db:up` falha.**
Verifique se o Docker está rodando e se a porta 5432 não está ocupada por outro PostgreSQL.

**Perdi a senha temporária do seed.**
Rode `npm run db:reset-admin-password`.

**O app abriu no Expo Go e deu erro.**
É esperado. Use `npx expo run:android`.

**Mudei uma fonte, ícone ou o `app.json` e não apareceu.**
Essas mudanças são nativas. Recompile com `npx expo run:android`.

**Como confirmo que o bloqueio de prints funciona?**
Só numa build de release. Em desenvolvimento ele fica desligado de propósito.

---

## Para quem vai desenvolver

Os dois frameworks são recentes e mudam rápido. Antes de escrever código, leia:

- `admin/AGENTS.md` e a documentação do Next.js em `admin/node_modules/next/dist/docs/`
- `mobile/AGENTS.md` e a documentação do Expo SDK 58 em https://docs.expo.dev/versions/v58.0.0/
