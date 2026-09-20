import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { authHeader, cleanupTestData, closePrisma, registerUser, uniqueEmail } from './helpers.js'

const app = await buildApp({ logger: false })

describe('orders', () => {
  const createdUserIds: string[] = []
  const createdProductIds: string[] = []
  const createdOrderIds: string[] = []

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await cleanupTestData({
      userIds: createdUserIds,
      productIds: createdProductIds,
      orderIds: createdOrderIds,
    })
    await app.close()
    await closePrisma()
  })

  it('creates an order for the authenticated user', async () => {
    const email = uniqueEmail('buyer')
    const password = 'senha123'
    const user = await registerUser(app, { email, password })
    createdUserIds.push(user.body.id)

    const headers = await authHeader(app, email, password)
    const productResponse = await app.inject({
      method: 'POST',
      url: '/products',
      headers,
      payload: {
        name: 'Teclado',
        description: 'Teclado mecânico',
        price: 250,
        stock: 4,
      },
    })

    const product = productResponse.json()
    createdProductIds.push(product.id)

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      headers,
      payload: {
        items: [{ productId: product.id, quantity: 2 }],
      },
    })

    const body = response.json()
    expect(response.statusCode).toBe(201)
    expect(body.userId).toBe(user.body.id)
    expect(body.total).toBe(500)
    expect(body.items[0].unitPrice).toBe(250)
    expect(body.items[0].quantity).toBe(2)
    createdOrderIds.push(body.id)

    const updatedProduct = await app.inject({
      method: 'GET',
      url: `/products/${product.id}`,
    })

    expect(updatedProduct.json().stock).toBe(2)
  })

  it('prevents a user from reading another users order', async () => {
    const ownerEmail = uniqueEmail('owner')
    const otherEmail = uniqueEmail('other')
    const password = 'senha123'

    const owner = await registerUser(app, { email: ownerEmail, password })
    const other = await registerUser(app, { email: otherEmail, password })
    createdUserIds.push(owner.body.id, other.body.id)

    const ownerHeaders = await authHeader(app, ownerEmail, password)
    const productResponse = await app.inject({
      method: 'POST',
      url: '/products',
      headers: ownerHeaders,
      payload: {
        name: 'Headset',
        description: 'Headset gamer',
        price: 180,
        stock: 3,
      },
    })

    const product = productResponse.json()
    createdProductIds.push(product.id)

    const orderResponse = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: ownerHeaders,
      payload: {
        items: [{ productId: product.id, quantity: 1 }],
      },
    })

    const order = orderResponse.json()
    createdOrderIds.push(order.id)

    const otherHeaders = await authHeader(app, otherEmail, password)
    const forbidden = await app.inject({
      method: 'GET',
      url: `/orders/${order.id}`,
      headers: otherHeaders,
    })

    expect(forbidden.statusCode).toBe(404)
  })
})
