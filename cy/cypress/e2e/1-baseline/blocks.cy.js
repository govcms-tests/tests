import { randString } from "../../support/commands";

describe('Site admin can create a new block', () => {
    const testBlockTypeName = randString(7);
    const testBlockName = randString(7);

    beforeEach(() => {
        cy.drupalLogin();
    });

    it('Create new block type', () => {
        createNewBlockType(testBlockTypeName);
    });

    it('Create new block', () => {
        createNewBlock(testBlockTypeName, testBlockName);
    });

    after('Clean up', () => {
        cleanUp(testBlockTypeName);
    });
});

function createNewBlockType(blockTypeName) {
    cy.visit('admin/structure/block-content/add');
    cy.get('#edit-label').type(blockTypeName);
    cy.wait(500);
    cy.get('#edit-description').type('lorem ipsum');
    cy.get('#edit-submit').click();
    cy.get('.messages-list__item').contains(`Block type ${blockTypeName} has been added.`);
}

function createNewBlock(blockTypeName, blockName) {
    cy.visit(`block/add/${blockTypeName}?destination=/admin/content/block`);
    cy.get('#edit-info-0-value').type(blockName);
    // Type into CKEditor, cy.type() doesn't currently work with CKEditor
    cy.ckeditorType();

    cy.get('#edit-submit').click();
    cy.get('.messages-list__item').contains(`${blockTypeName} ${blockName} has been created.`);
}

function cleanUp(blockTypeName) {
    // Delete block, generated with Cypress Studio
    cy.deleteBlock()

    // Delete block type
    cy.visit(`admin/structure/block-content/manage/${blockTypeName}/delete?destination=/admin/structure/block-content`);
    cy.confirm();
}



