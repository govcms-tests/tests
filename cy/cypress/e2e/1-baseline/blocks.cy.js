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
    cy.get('.messages-list__item').contains(`Block type ${testBlockTypeName} has been added.`)
  })

  it('Create new block', () => {
    cy.catch('Cannot read properties of null')

    cy.visit(`block/add/${testBlockTypeName}?destination=/admin/content/block`)
    cy.get('#edit-info-0-value').type(testBlockName)
    // Type into CKEditor, cy.type() doesnt currently work with CKEditor
    cy.get('.ck-content[contenteditable=true]').then(el => {
      const editor = el[0].ckeditorInstance
      editor.setData('Typing some stuff')
    })
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
