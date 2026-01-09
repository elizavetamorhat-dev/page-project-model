import { Page, Locator } from '@playwright/test'
import { OrderPage } from './order-page'
import { SERVICE_URL } from '../../config/env-data'
import BasePage from './base-page'

const jwt =
  'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlbGl6YXZldGFtIiwiZXhwIjoxNzY3ODI2MzM2LCJpYXQiOjE3Njc4MDgzMzZ9.SxjyjDzB-_Zu9Q-uT7eJFNLRRUHKHvg1jpXlX-ytWUE2Us0z28LQi5uni5mnr1LusduEd0e542iFfYSO62iS2A'

export class LoginPage extends BasePage {
  readonly signInButton: Locator
  readonly usernameField: Locator
  readonly passwordField: Locator

  constructor(page: Page) {
    super(page, `${SERVICE_URL}/signin`)
    this.signInButton = page.getByTestId('signIn-button')
    this.usernameField = page.getByTestId('username-input')
    this.passwordField = page.getByTestId('password-input')
  }


  async signIn(username: string, password: string) {
    await this.fillElement(this.usernameField, username)
    await this.fillElement(this.passwordField, password)
    await this.clickElement(this.signInButton)

    return new OrderPage(this.page)
  }

  async mockAuth(): Promise<void> {
    await this.page.route('**/login/student', async (route) => {
      await route.fulfill({
        status: 200,
        body: jwt,
      })
    })
  }
}