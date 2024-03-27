import {randString} from "../../support/commands";

const formTitle = randString(10)

describe('User can create webforms with file attachment fields', () => {
    it('Set up the webform module', () => {
        // Ensure no existing files
        cy.execDrush('entity:delete file')
        // Install
        cy.execDrush('-y pm:install webform, webform_node')
    })

    it('Create test webform with file field', () => {
      cy.catch('Cannot read properties of null')

      cy.userLogin('govcms-site-admin')
        cy.visit('admin/structure/webform/add')
        cy.get('[data-drupal-selector="title"]').type(`${formTitle}`)
        cy.wait(500)
        cy.confirm()
        cy.visit(`admin/structure/webform/manage/${formTitle}`)
        cy.readFile('cypress/fixtures/webform.yml').then((str) => {
            cy.get('[data-drupal-selector="edit-elements"]').type(str, {force: true})
        })
        cy.confirm()
        // A second confirmation is needed for some reason. It appears typing into the CodeMirror element (done above)
        // isnt saved until the user clicks out of it such as by clicking the confirm button.
        cy.confirm()
        cy.get('.messages.messages--status').contains(`Webform ${formTitle} elements saved.`)
    })

    it('Test adding webform to standard page', () => {
      cy.on('uncaught:exception', (e, runnable) => {
        console.log('error', e)
        console.log('runnable', runnable)

        return false
      })

      cy.userLogin('govcms-site-admin')
        cy.visit('node/add/webform')
        cy.getDrupal('edit-title-0-value').type(`web${formTitle}`)
        cy.getDrupal('edit-webform-0-target-id').select(`${formTitle}`)
        cy.confirm()
        cy.get('.messages.messages--status').contains(`Webform web${formTitle} has been created.`)
        // Check webform is visible when not logged in, need to get webform node ID.
        cy.execDrush(`sql:query 'SELECT entity_id FROM node__webform WHERE webform_target_id="${formTitle}"'`).then((result) => {
            cy.drupalLogout()
            cy.visit(`node/${result.stdout}`)
          cy.getDrupal('edit-file-upload')
        })
    })

    it('Test file submission as authenticated user', () => {
        // Need to disable Honeypot minimum time limit to allow Cypress to fill form
        cy.execDrush('-y cset honeypot.settings time_limit 0')
        cy.drupalLogin()
        cy.execDrush(`sql:query 'SELECT entity_id FROM node__webform WHERE webform_target_id="${formTitle}"'`).then((result) => {
            cy.visit(`node/${result.stdout}`)
        })
        cy.getDrupal('edit-name').type(randString(10))
        cy.getDrupal('edit-file-upload').selectFile('cypress/fixtures/media/pdf_test.pdf')
        cy.getDrupal('edit-actions-submit').click()
        // Confirm file was uploaded to the DB
        cy.execDrush("sql:query 'SELECT filename FROM file_managed' | grep pdf_test.pdf").its('stdout').should('not.be.empty')
        // Confirm submission was created
        cy.execDrush(`sql:query 'SELECT sid,webform_id FROM webform_submission' | grep ${formTitle}`).its('stdout').should('not.be.empty')
    })

    it('Test file submission as anonymous user', () => {
        // Need to give anonymous user ability to create new webforms
        cy.execDrush('role:perm:add anonymous \'create webform content\'')
        // Need to disable Honeypot minimum time limit to allow Cypress to fill form
        cy.execDrush('-y cset honeypot.settings time_limit 0')

        cy.visit('user/logout')
        cy.execDrush(`sql:query 'SELECT entity_id FROM node__webform WHERE webform_target_id="${formTitle}"'`).then((result) => {
            cy.visit(`node/${result.stdout}`)
        })
        cy.getDrupal('edit-name').type(randString(10))
        cy.getDrupal('edit-file-upload').selectFile('cypress/fixtures/media/pdf_test.pdf')
        cy.getDrupal('edit-actions-submit').click()
        // Confirm file was uploaded to the DB
        cy.execDrush("sql:query 'SELECT filename FROM file_managed' | grep pdf_test.pdf").its('stdout').should('not.be.empty')
        // Confirm submission was created
        cy.execDrush(`sql:query 'SELECT sid,webform_id FROM webform_submission' | grep ${formTitle}`).its('stdout').should('not.be.empty')
    })


    it('Clean up', () => {
        cy.execDrush('entity:delete file')
        cy.execDrush('entity:delete webform')
        cy.execDrush('entity:delete node')
        cy.execDrush('-y pm:uninstall webform_node')
        cy.execDrush('-y pm:uninstall webform')
        cy.execDrush('-y cset honeypot.settings time_limit 5')
    })

})
