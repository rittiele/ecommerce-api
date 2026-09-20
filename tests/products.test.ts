import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { authHeader, cleanupTestData, closePrisma, registerUser, uniqueEmail } from './helpers.js'

const app = await buildApp({ logger: false })

describe('products', () => {
  const createdUserIds: string[] = []
  const createdProductIds: string[] = []

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await cleanupTestData({
      userIds: createdUserIds,
      productIds: createdProductIds,
    })
    await app.close()
    await closePrisma()
  })

  it('creates a product when authenticated', async () => {
    const email = uniqueEmail('seller')
    const password = 'senha123'
    const user = await registerUser(app, { email, password })
    createdUserIds.push(user.body.id)

    const headers = await authHeader(app, email, password)
    const response = await app.inject({
      method: 'POST',
      url: '/products',
      headers,
      payload: {
        name: 'Notebook',
        description: 'Notebook para estudos',
        price: 3499.9,
        stock: 5,
      },
    })

    const body = response.json()
    expect(response.statusCode).toBe(201)
    expect(body.name).toBe('Notebook')
    expect(body.price).toBe(3499.9)
    createdProductIds.push(body.id)
  })

  it('rejects product creation without a token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/products',
      payload: {
        name: 'Mouse',
        description: 'Mouse sem fio',
        price: 99.9,
        stock: 10,
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
