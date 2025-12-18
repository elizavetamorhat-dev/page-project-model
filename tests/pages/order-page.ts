import { expect, Page } from '@playwright/test'
import type { Locator } from '@playwright/test'

export class OrderPage {
  readonly page: Page
  readonly statusButton: Locator
  readonly nameField: Locator
  readonly phoneField: Locator
  readonly commentField: Locator
  readonly createOrderButton: Locator
  readonly successfulCreationPopup: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.statusButton = page.getByTestId('openStatusPopup-button')
    this.nameField = page.getByTestId('username-input')
    this.phoneField = page.getByTestId('phone-input')
    this.commentField = page.getByTestId('comment-input')
    this.createOrderButton = page.getByTestId('createOrder-button')
    this.successfulCreationPopup = page.locator('main > .popup')
    this.logoutButton = page.getByTestId('logout-button')
  }

  async checkInnerComponentsVisible(): Promise<void> {
    await expect(this.statusButton).toBeVisible()
    await expect(this.statusButton).toBeEnabled()
    await expect(this.nameField).toBeVisible()
    await expect(this.phoneField).toBeVisible()
    await expect(this.commentField).toBeVisible()
    await expect(this.createOrderButton).toBeVisible()
    await expect(this.logoutButton).toBeVisible()
  }

  async checkCreationPopupVisible(visible = true): Promise<void> {
    await expect(await this.successfulCreationPopup).toBeVisible({ visible })
  }
}
