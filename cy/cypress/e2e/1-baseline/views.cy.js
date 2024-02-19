import {randString} from "../../support/commands";

const viewName = randString(10)

// ****************************************************************************
// As a GovCMS site admin I should be able to create new views
// ****************************************************************************
describe('Site admin can create a view', () => {

    it('Log the user in then create a new view', () => {
        cy.drupalLogin()
        cy.visit('/admin/structure/views/add')
        cy.getDrupal('edit-label').type(`${viewName}`, {force: true})
        cy.getDrupal('edit-page-create').click({force: true})
        cy.confirm()
        cy.get('#edit-actions-submit')
            .click({force: true})
        cy.get('.messages-list__item')
            .contains(`The view ${viewName} has been saved`)
        cy.visit(`/${viewName}`)
        cy.visit(`/admin/structure/views/view/${viewName}/delete?destination=/admin/structure/views`)
        cy.get('#edit-submit')
            .click({force: true})
    })

})
