# Vitórias

App de conscientização, orientação e apoio a mulheres em situação de violência (`mobile/`), com um painel web que publica conteúdo sem exigir nova versão do app (`admin/`). Tudo roda localmente, sem hospedagem.

## Painel (`admin/`)

Precisa de Docker e Node.

```bash
cd admin
npm install
cp .env.example .env     # preencha ADMIN_EMAIL e BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:up            # PostgreSQL no Docker
npm run db:migrate
npm run db:seed          # mostra a senha temporária do administrador UMA única vez
npm run dev              # http://localhost:3000
```

No primeiro acesso, o painel exige a troca da senha temporária. Se a senha se perder, `npm run db:reset-admin-password` gera outra; não há recuperação por e-mail.

A rede de apoio entra **oculta e não verificada**: as fontes públicas divergem nos telefones. Confira cada serviço, marque "Dados conferidos" e só então publique.

## App (`mobile/`)

Precisa do Android SDK. O Expo Go não serve, porque o app usa SQLCipher.

```bash
cd mobile
npm install
cp .env.example .env     # veja abaixo
npx expo run:android
```

`EXPO_PUBLIC_API_URL` no `.env` aponta para o painel:

- Emulador Android: `http://10.0.2.2:3000`
- Aparelho físico: IP do computador, na mesma rede Wi-Fi, com a porta 3000 liberada no firewall

O valor é embutido no bundle. Ao trocar de rede, atualize o `.env` e recarregue; em APK de release, gere de novo.

Com o computador desligado, o app continua funcionando com o conteúdo embutido e o último sincronizado.

## Atualizar o conteúdo embutido

O conteúdo que o app traz para a primeira abertura, inclusive offline, é gerado a partir do que está publicado no painel:

```bash
cd admin
npm run content:export   # grava mobile/assets/content/snapshot.json
```
