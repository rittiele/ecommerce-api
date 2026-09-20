import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { cleanupTestData, closePrisma, loginUser, registerUser, uniqueEmail } from './helpers.js'

const app = await buildApp({ logger: false })

describe('auth', () => {
  const createdUserIds: string[] = []

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await cleanupTestData({ userIds: createdUserIds })
    await app.close()
    await closePrisma()
  })

  it('registers a user without returning the password', async () => {
    const email = uniqueEmail('signup')
    const { response, body } = await registerUser(app, { email })

    expect(response.statusCode).toBe(201)
    expect(body.email).toBe(email)
    expect(body.password).toBeUndefined()
    createdUserIds.push(body.id)
  })

  it('rejects a duplicated email', async () => {
    const email = uniqueEmail('dup')
    const first = await registerUser(app, { email })
    createdUserIds.push(first.body.id)

    const second = await registerUser(app, { email })
    expect(second.response.statusCode).toBe(409)
  })

  it('logs in with valid credentials', async () => {
    const email = uniqueEmail('login')
    const password = 'senha123'
    const created = await registerUser(app, { email, password })
    createdUserIds.push(created.body.id)

    const { response, body } = await loginUser(app, { email, password })

    expect(response.statusCode).toBe(200)
    expect(body.token).toEqual(expect.any(String))
    expect(body).not.toHaveProperty('password')
  })

  it('rejects an invalid password', async () => {
    const email = uniqueEmail('wrong')
    const created = await registerUser(app, { email, password: 'senha123' })
    createdUserIds.push(created.body.id)

    const { response, body } = await loginUser(app, {
      email,
      password: 'outra-senha',
    })

    expect(response.statusCode).toBe(401)
    expect(body.message).toBe('Invalid credentials')
  })
})
