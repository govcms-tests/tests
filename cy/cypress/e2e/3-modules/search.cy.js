import {randString} from "../../support/commands";

const blogName = "test " + randString(10)

describe('Search functionality works as expected', () => {
    it('Install search and set up dummy content', () => {
      cy.catch('Cannot read properties of null')

      cy.install('search')
        // Create dummy content
        cy.drupalLogin()
        cy.visit('node/add/govcms_blog_article')
        cy.getDrupal('edit-title-0-value').type(`${blogName}`)
        cy.get('.ck-content[contenteditable=true]').then(el => {
            const editor = el[0].ckeditorInstance
            editor.setData('Typing some stuff')
        })
        cy.confirm()
        // Confirm again to change moderation state to needs review
        cy.confirm()
        // Now we can change moderation state to published
        cy.getDrupal('edit-new-state').select('Published')
        cy.confirm()
        // Tell site to re-index search
        cy.visit('admin/config/search/pages')
        cy.getDrupal('edit-wipe').click()
        cy.visit('admin/config/system/cron')
        cy.getDrupal('edit-run').click()

        // Give users access to search
        cy.execDrush('-y role:perm:add anonymous \'search content\'')
        cy.execDrush('-y role:perm:add authenticated \'search content\'')
    })

    it('Check anonymous user can search', () => {
        // Search for blog.
        cy.visit('search')
        cy.getDrupal('edit-keys').type('test')
        cy.confirm()
        // Test blog should appear
        cy.get('#content > section > div > div.item-list').contains(`${blogName}`)
    })

    it('Clean up', () => {
        cy.uninstall('search')
        cy.execDrush('entity:delete node')
    })

})
