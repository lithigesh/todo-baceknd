<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Todo API (no DB)

This project includes a very small Todo backend.

- Base URL: `https://todo-baceknd.onrender.com`
- Data is stored in Postgres using Prisma.

### Simple UI

- Open `https://todo-baceknd.onrender.com/ui/`

### Endpoints

- `GET /todos` → list todos
- `GET /todos/:id` → get one todo
- `POST /todos` → create `{ "title": "Buy milk" }`
- `PATCH /todos/:id` → update `{ "title"?: string, "completed"?: boolean }`
- `DELETE /todos/:id` → delete (returns `204`)

### Quick try (curl)

```bash
curl -s https://todo-baceknd.onrender.com/todos

curl -s -X POST https://todo-baceknd.onrender.com/todos \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Buy milk\"}"

curl -s -X PATCH https://todo-baceknd.onrender.com/todos/1 \
  -H "Content-Type: application/json" \
  -d "{\"completed\":true}"

curl -i -X DELETE https://todo-baceknd.onrender.com/todos/1
```

## Project setup

```bash
$ npm install
```

## Database setup (Postgres + Prisma)

1) Create a Postgres database (example name: `todo`)

2) Set `DATABASE_URL`

- Copy `.env.example` to `.env`
- Update the connection string for your Postgres instance

3) Create tables via Prisma migrate

```bash
npx prisma migrate dev --name init
```

## Google OAuth (browser login)

This project supports Google login via cookie sessions.

### 1) Create OAuth credentials in Google Cloud Console

1) Go to Google Cloud Console → APIs & Services
2) Configure **OAuth consent screen** (External is fine for dev)
3) Create Credentials → **OAuth client ID** → **Web application**
4) Add these values:

- **Authorized JavaScript origins**: `https://todo-baceknd.onrender.com`
- **Authorized redirect URIs**: `https://todo-baceknd.onrender.com/auth/google/callback`

### 2) Configure environment variables

- Copy `.env.example` to `.env` (or update your existing `.env`)
- Set:
  - `SESSION_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - (optional) `GOOGLE_CALLBACK_URL`

### 3) Try it

- Start: `npm run start`
- Visit: `https://todo-baceknd.onrender.com/auth/google`
- Check: `GET https://todo-baceknd.onrender.com/auth/me`

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
