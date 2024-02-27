import {randString} from "../../support/commands";

const pageTitle = randString(10)
const testUser = randString(10)

describe('User is able to create a new standard page', () => {

    it('Create test user', () => {
        cy.createTestUser(testUser);
    })

    it('Create standard page', () => {
        cy.drupalLogin(testUser, 'password')
        cy.visit('node/add/govcms_standard_page')
        cy.get('[data-drupal-selector="edit-title-0-value"]').type(pageTitle)

        cy.ckeditorType();

        cy.get('[data-drupal-selector="edit-moderation-state-0-state"]').select('needs_review')

        cy.confirm()

        cy.get('.messages.messages--status').contains(`Standard page ${pageTitle} has been created.`)
    })

    it('Check page creation was successful', () => {
        cy.drupalLogin(testUser, 'password')
        cy.visit(`${pageTitle}`)
    })

    it('Clean up', () => {
        cy.execDrush(`user:cancel -y --delete-content ${testUser}`)
    })

})
