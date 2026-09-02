import {randString} from "../../support/commands";

const testBlockTypeName = randString(7);
const testBlockName = randString(7);

describe('Site admin can create a new block', () => {
    beforeEach(() => {
        cy.drupalLogin()
    })

    it('Create new block type', () => {
        cy.visit('admin/structure/block-content/add')
        cy.get('#edit-label').type(testBlockTypeName)
        cy.wait(500)
        cy.get('#edit-description').type('lorem ipsum')
        cy.get('#edit-submit').click()
        cy.get('.responsive-enabled tbody tr').eq(0)
          .find('td').eq(0)
          .should('have.text', `${testBlockTypeName}`);
    })

    it('Create new block', () => {
        cy.visit(`block/add/${testBlockTypeName}?destination=/admin/content/block`)
        cy.get('#edit-info-0-value').type(testBlockName)
        cy.get('#edit-submit').click()
        cy.get('.messages-list__item').contains(`${testBlockTypeName} ${testBlockName} has been created.`)
    })

    it('Clean up', () => {
        // Delete block, generated with Cypress Studio
        cy.visit('admin/content/block')
        cy.get(':nth-child(1) > .views-field-operations > .dropbutton-wrapper > .dropbutton-widget > .dropbutton > .dropbutton-toggle > .dropbutton__toggle').click();
        cy.get(':nth-child(1) > .views-field-operations > .dropbutton-wrapper > .dropbutton-widget > .dropbutton > .delete > .use-ajax').click();
        cy.get('.ui-dialog-buttonset > .button--primary').click();
        // Delete block type
        cy.visit(`admin/structure/block-content/manage/${testBlockTypeName}/delete?destination=/admin/structure/block-content`)
        cy.confirm()
    })
})
