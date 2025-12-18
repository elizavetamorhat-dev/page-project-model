import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/ar'
import { PASSWORD, USERNAME } from '../../config/env-data'

test('SignIn button disabled when incorrect data inserted', async ({ page }) => {
  const authPage = new LoginPage(page)

  await authPage.open()
  await authPage.usernameField.fill(faker.lorem.word(2))
  await authPage.passwordField.fill(faker.lorem.word(7))
  await expect(authPage.signInButton).toBeDisabled()
})

test('Login with correct credentials and verify order creation page', async ({ page }) => {
  const authPage = new LoginPage(page)

  await authPage.open()
  const orderCreationPage = await authPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.checkInnerComponentsVisible()
})
