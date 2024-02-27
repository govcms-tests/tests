// *********************************************************
// As a GovCMS site administrator, I should be able to create new
// users with either a 'Content Author', 'Content Approver', or
// 'Site Administrator' role.
import {randString} from "../../support/commands";

const testRole = 'govcms-site-admin'
const testName = randString(10)

describe('User can create a new user with a role', () => {
    const roles = ['Content Author', 'Content Approver', 'Site Administrator']
    for (const userRole of roles) {
        it('Create a new user with ' + userRole + ' role', () => {
            cy.checkUserCreation(userRole, testRole)
        })
    }
    it('Clean up and log out', () => {
        cy.drupalLogout()
    })
})


// ***********************************************
// userrole is the plain english version of the role ie.
// govcms-content-author would be Content Author
// role is the user that should login to Drupal
Cypress.Commands.add('checkUserCreation', (userrole, testRole) => {
    let password = 'DY+T5R9K09+pRy84wZvlF4PjrBzGEXcRDA/NEV6B8/I='
    cy.userLogin(testRole).then(() => {

        //creating user account
        cy.get('#toolbar-link-entity-user-collection')
            .click({force: true})
        cy.get('.local-actions__item > .button')
            .click({force: true})
        cy.get('#edit-mail')
            .type(testName + '@test.com', {force: true})
        cy.get('#edit-name')
            .type(testName, {force: true})
        cy.get('#edit-pass-pass1', {force: true})
            .type(password, {force: true})
        cy.get('#edit-pass-pass2', {force: true})
            .type(password, {force: true})
        cy.get('#edit-submit')
            .click({force: true})
        cy.execDrush(`user:information ${testName} | grep ${testName}`)

        //Setting user role for account
        cy.get('#toolbar-link-entity-user-collection')
            .click({force: true})
        cy.get('#edit-user-bulk-form-0')
            .click({force: true})
        cy.get('#edit-action')
            .select('Add the ' + userrole + ' role to the selected user(s)')
        cy.get('#edit-submit')
            .click({force: true})

        //Deleting user account and its content 
        cy.get('#edit-user-bulk-form-0')
            .click({force: true})
        cy.get('#edit-action')
            .select('Cancel the selected user account(s)')
        cy.get('#edit-submit')
            .click({force: true})
        cy.get('#edit-user-cancel-method-user-cancel-delete')
            .click({force: true})
        cy.get('#edit-submit')
            .click({force: true})
    })
})
