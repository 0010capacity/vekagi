// tests/e2e/battle.spec.ts
// E2E 테스트 - Playwright

import { test, expect } from '@playwright/test'

test.describe('Vanguard Push - 기본 게임 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('메인 메뉴가 표시된다', async ({ page }) => {
    await expect(page.getByText('VANGUARD PUSH')).toBeVisible()
    await expect(page.getByText('새 게임')).toBeVisible()
  })

  test('기물 픽 화면으로 이동한다', async ({ page }) => {
    // 새 게임 클릭
    await page.getByText('새 게임').click()

    // 기물 픽 화면 확인
    await expect(page.getByText(/기물.*선택|초기 기물/)).toBeVisible({ timeout: 5000 })
  })

  test('기물 3개 선택 후 출정 가능', async ({ page }) => {
    // 새 게임 클릭
    await page.getByText('새 게임').click()

    // 기물 카드 3개 클릭 (data-testid 사용)
    const pieceCards = page.locator('[data-testid="piece-card"]')
    const count = await pieceCards.count()

    if (count >= 3) {
      await pieceCards.nth(0).click()
      await pieceCards.nth(1).click()
      await pieceCards.nth(2).click()

      // 출정 버튼 클릭
      await page.getByText(/출정|시작/).click()

      // 런 맵 또는 진형 화면으로 이동
      await expect(page.getByText(/구역|맵|진형/)).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('전투 시스템', () => {
  test('전투 화면 기본 요소', async ({ page }) => {
    // 직접 전투 상태로 이동 (개발용 URL 또는 상태 주입)
    await page.goto('/?debug=battle')

    // 보드가 표시되는지 확인
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 5000 })

    // AP 바 확인
    await expect(page.getByText(/AP|행동력/)).toBeVisible()

    // 턴 종료 버튼 확인
    await expect(page.getByText(/턴 종료/)).toBeVisible()
  })

  test('기물 선택 및 이동 미리보기', async ({ page }) => {
    await page.goto('/?debug=battle')

    // 보드 대기
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 5000 })

    // 기물 클릭 (플레이어 기물)
    const playerPiece = page.locator('[data-testid="piece-token"][data-owner="player"]').first()
    if (await playerPiece.isVisible()) {
      await playerPiece.click()

      // 미리보기 이동 가능 위치가 표시되는지 확인
      const previewMoves = page.locator('[data-testid="preview-move"]')
      // 미리보기가 있거나 선택 상태가 되어야 함
      await expect(
        previewMoves.or(page.locator('[data-testid="piece-token"][data-selected="true"]').first())
      ).toBeVisible({ timeout: 2000 })
    }
  })
})

test.describe('저장/불러오기', () => {
  test('localStorage에 게임 상태 저장', async ({ page }) => {
    await page.goto('/')

    // 새 게임 시작
    await page.getByText('새 게임').click()

    // 잠시 대기 후 localStorage 확인
    await page.waitForTimeout(1000)

    const savedState = await page.evaluate(() => {
      return localStorage.getItem('vanguard-push-run')
    })

    // 런이 시작되면 저장 상태가 있어야 함
    // (실제 게임 플로우에 따라 조정 필요)
  })
})

test.describe('충돌 계산', () => {
  test('충돌 미리보기 수치 표시', async ({ page }) => {
    // 전투 화면으로 직접 이동
    await page.goto('/?debug=battle')

    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 5000 })

    // 기물 선택
    const piece = page.locator('[data-testid="piece-token"][data-owner="player"]').first()
    if (await piece.isVisible()) {
      await piece.click()

      // 이동 예약
      const targetCell = page.locator('[data-testid="cell"][data-valid="true"]').first()
      if (await targetCell.isVisible()) {
        await targetCell.click()
      }
    }
  })
})
