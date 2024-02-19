import {randString} from "../../support/commands";

const pageTitle = randString(10)
const testUser = randString(10)

describe('User is able to create a new standard page', () => {

    it('Create test user', () => {
        cy.execDrush(`ucrt ${testUser} --password=password`)
        cy.execDrush(`user:role:add govcms_content_author ${testUser}`)
    })

    it('Create standard page', () => {
      cy.catch('Cannot read properties of null')

      cy.drupalLogin(testUser, 'password')
        cy.visit('node/add/govcms_standard_page')
        cy.get('[data-drupal-selector="edit-title-0-value"]').type(pageTitle)

        cy.get('.ck-content[contenteditable=true]').then(el => {
            const editor = el[0].ckeditorInstance
            editor.setData('Typing some stuff')
        })

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
