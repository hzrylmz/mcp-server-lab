describe('MCP Demo', () => {
  it('should find and interact with the login form', () => {
    cy.visit('https://example.cypress.io/commands/actions')

    cy.get('#email1')
      .type('test@example.com')

    cy.get('#password1')
      .type('password123')

    cy.get('#actions')
      .should('be.visible')
  })
})