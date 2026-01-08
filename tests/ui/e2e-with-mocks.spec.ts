import { expect, test } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page'
import NotFoundPage from '../pages/not-found-page'


const jwt =
  'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbGl6YXZldGFtIiwiZXhwIjoxNzY3ODI2MzM2LCJpYXQiOjE3Njc4MDgzMzZ9.SxjyjDzB-_Zu9Q-uT7eJFNLRRUHKHvg1jpXlX-ytWUE2Us0z28LQi5uni5mnr1LusduEd0e542iFfYSO62iS2A'

test('TL-22-1 signIn with mocks', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const orderPage = new OrderPage(page)
  await loginPage.mockAuth()
  await loginPage.open()
  await loginPage.usernameField.fill('test')
  await loginPage.passwordField.fill('test1234')
  await loginPage.signInButton.click()
  await orderPage.checkElementVisibility(orderPage.trackButton)
})

test('TL-22-2 create and find order with mocks', async ({ context }) => {
  const newOrder = {
    status: 'OPEN',
    courierId: null,
    customerName: 'customerName',
    customerPhone: 'customerPhone',
    comment: 'comment',
    id: 100,
  }
  await context.addInitScript((token) => {
    localStorage.setItem('jwt', token)
  }, jwt)
  const page = await context.newPage()
  const loginPage = new LoginPage(page)
  const orderPage = new OrderPage(page)
  const foundPage = new FoundPage(page)
  await loginPage.open()

  await orderPage.nameField.fill(newOrder.customerName)
  await orderPage.phoneField.fill(newOrder.customerPhone)
  await orderPage.commentField.fill(newOrder.comment)
  await page.route('**/orders', async (route) => {
    await route.fulfill({
      status: 200,
      json: newOrder,
    })
  })
  const createOrderResponse = page.waitForResponse('**/orders')
  await orderPage.createOrderButton.click()
  await createOrderResponse
  await orderPage.checkElementVisibility(orderPage.successfulCreationPopup)
  expect(await orderPage.getOrderIdFromPopup()).toBe(newOrder.id)
  await orderPage.okButton.click()
  await orderPage.statusButton.click()
  await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id))

  await page.route('**/orders/*', async (route) => {
    await route.fulfill({
      status: 200,
      json: newOrder,
    })
  })
  const trackOrderResponse = page.waitForResponse('**/orders/*')
  await orderPage.trackButton.click()
  await trackOrderResponse
  expect(await foundPage.orderName.innerText()).toBe(newOrder.customerName)
})

test('TL-22-3  find order with status OPEN using mocks', async ({ context }) => {
  const order = {
    status: 'OPEN',
    courierId: null,
    customerName: 'testName',
    customerPhone: 'testPhone',
    comment: 'testComment',
    id: 100,
  }
  await context.addInitScript((token) => {
    localStorage.setItem('jwt', token)
  }, jwt)
  const page = await context.newPage()
  const orderPage = new OrderPage(page)
  const foundPage = new FoundPage(page)

  await orderPage.open()

  await page.route('**/orders/*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        json: order,
      })
    } else {
      await route.continue()
    }

    await orderPage.statusButton.click()
    await orderPage.fillElement(orderPage.orderIdInputField, String(order.id))

    const trackOrderResponse = page.waitForResponse('**/orders/*')
    await orderPage.trackButton.click()
    await trackOrderResponse

    expect(await foundPage.getStatusActive()).toBe('OPEN')
  })
})

test('TL-22-4 find order success DELIVERED with mocks', async ({ context }) => {
  const newOrder = {
    status: 'DELIVERED',
    courierId: null,
    customerName: 'customerName',
    customerPhone: 'customerPhone',
    comment: 'comment',
    id: 100,
  }
  await context.addInitScript((token) => {
    localStorage.setItem('jwt', token)
  }, jwt)
  const page = await context.newPage()
  const orderPage = new OrderPage(page)
  const foundPage = new FoundPage(page)

  await orderPage.open()

  await page.route('**/orders/*', async (route) => {
    await route.fulfill({
      status: 200,
      json: newOrder,
    })
  })
  await orderPage.statusButton.click()
  await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id))

  const trackOrderResponse = page.waitForResponse('**/orders/*')
  await orderPage.trackButton.click()
  await trackOrderResponse
  expect(await foundPage.getStatusActive()).toBe('DELIVERED')

  await expect(page.locator('.status-list__status_active')).toHaveText('DELIVERED')
  await expect(page.locator('.status-list__status.false').filter({ hasText: 'OPEN' })).toBeVisible()
})

test('TL-22-5 service error with status 500', async ({ context }) => {
  const newOrder = {
    status: 'OPEN',
    courierId: null,
    customerName: 'testName',
    customerPhone: 'testPhone',
    comment: 'testComment',
    id: 100,
  }
  await context.addInitScript((token) => {
    localStorage.setItem('jwt', token)
  }, jwt)
  const page = await context.newPage()
  const orderPage = new OrderPage(page)
  const notFoundPage = new NotFoundPage(page)

  await orderPage.open()

  await orderPage.statusButton.click({ force: true })
  await orderPage.fillElement(orderPage.orderIdInputField, String(newOrder.id))

  await page.route('**/orders/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 500,
      })
    }
  })

  await expect(orderPage.trackButton).toBeVisible()
  await expect(orderPage.trackButton).toBeEnabled()

  const trackOrderResponse = page.waitForResponse('**/orders/*')
  await orderPage.trackButton.click({ force: true })
  await trackOrderResponse

  await expect(notFoundPage.title).toBeVisible()
  await expect(notFoundPage.title).toHaveText('Order not found')
})