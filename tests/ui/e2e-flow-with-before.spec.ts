import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/ar'
import { PASSWORD, SERVICE_URL, USERNAME } from '../../config/env-data'
import NotFoundPage from '../pages/not-found-page'
import { OrderPage } from '../pages/order-page'
import FoundPage from '../pages/found-page'

let authPage: LoginPage

test.beforeEach(async ({ page }) => {
  authPage = new LoginPage(page)
  await authPage.open()
})

test('SignIn button disabled when incorrect data inserted', async ({}) => {
  await authPage.usernameField.fill(faker.lorem.word(2))
  await authPage.passwordField.fill(faker.lorem.word(7))
  await expect(authPage.signInButton).toBeDisabled()
})

test('Login with correct credentials and verify order creation page', async ({}) => {
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await expect(orderCreationPage.statusButton).toBeVisible()
  await orderCreationPage.checkInnerComponentsVisible()
})

test('Login and create order', async ({}) => {
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.nameField.fill('test')
  await orderCreationPage.phoneField.fill('test1234')
  await orderCreationPage.commentField.fill('1234123')
  await orderCreationPage.createOrderButton.click()
  await orderCreationPage.checkCreationPopupVisible(true)
})

test('Logout', async () => {
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.checkInnerComponentsVisible()
  await orderCreationPage.logoutButton.click()
  await expect(authPage.signInButton).toBeVisible()
})

test('1. Login with correct credentials and verify order creation page', async ({}) => {
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await expect(orderCreationPage.statusButton).toBeVisible()
  await orderCreationPage.checkInnerComponentsVisible()
})

test('2. Login and create order and check order found page', async ({ page }) => {
  const foundPage = new FoundPage(page)
  const orderInfo = {
    name: 'order',
    phoneField: '789789789',
    comment: 'comment',
  }

  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.nameField.fill(orderInfo.name)
  await orderCreationPage.phoneField.fill(orderInfo.phoneField)
  await orderCreationPage.commentField.fill(orderInfo.comment)
  await orderCreationPage.checkCreationPopupVisible(false)
  await orderCreationPage.createOrderButton.click()
  await page.waitForTimeout(1500)
  await orderCreationPage.checkCreationPopupVisible(true)
  const orderId = await orderCreationPage.getOrderIdFromPopup()
  await orderCreationPage.closeCreationPopup()
  await orderCreationPage.findOrderById(orderId)
  await foundPage.checkElementVisibility(foundPage.orderName)
})

test('3. Check not found page', async ({ page }) => {
  const notFoundPage = new NotFoundPage(page, `${SERVICE_URL}/orders/12341234123412341234`)
  const orderPage = new OrderPage(page)

  await authPage.signIn(USERNAME, PASSWORD)
  await orderPage.findOrderById(-1)
  await notFoundPage.checkElementVisibility(notFoundPage.title)
  await notFoundPage.checkElementVisibility(notFoundPage.description)
})