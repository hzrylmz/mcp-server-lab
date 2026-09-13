describe('Vehicle Search', () => {

  it('should filter BMW vehicles', () => {

    cy.visit('/')

    const brokenLocator = '[data-testid="brand-filter"]'

    cy.task('healLocator', brokenLocator).then((result) => {
      const healingResult = JSON.parse(result)

      expect(healingResult.healed).to.equal(true)

      cy.get(healingResult.replacement)
        .select('BMW')
    })

    cy.get('[data-testid="vehicle-search-button"]')
      .click()

    cy.get('[data-vehicle-id="bmw-320i-2023"]')
      .should('be.visible')

  })

})
