import {randString} from "../../support/commands";

const testUser = randString(10)
const testFileName = randString(10)

describe('User can upload files', () => {

    before('Create test user', () => {
        cy.createTestUser(testUser);
    })

    it('Test audio file upload', () => {
        uploadFileAndConfirm('audio', testFileName, 'audio_test.mp3'); 
    })

    it('Test video file upload', () => {
        uploadFileAndConfirm('video', testFileName, 'video_test.mp4');
    })

    it('Test image file upload', () => {
        uploadFileAndConfirm('image', testFileName, 'image_test.jpeg', 'blah blah');
    })

    it('Test PDF file upload', () => {
        uploadFileAndConfirm('document', `pdf${testFileName}`, 'pdf_test.pdf');
    })

    it('Test DOCX file upload', () => {
        uploadFileAndConfirm('document', `docx${testFileName}`, 'docx_test.docx');
    })

    after('Clean up', () => {
        // Remove all test files
        cy.removeTestFiles();
        
        // Delete test user
        cy.execDrush(`user:cancel -y --delete-content ${testUser}`)
    })

})


function uploadFileAndConfirm(type, fileName, filePath, altText = '') {
    cy.drupalLogin(testUser, 'password');
    cy.visit(`media/add/${type}`);

    // Input the file name
    cy.get('[data-drupal-selector="edit-name-0-value"]').type(fileName);

    // Determine the correct selector for the upload input based on the type
    const uploadSelector = getUploadSelector(type);
    cy.get(uploadSelector).selectFile(`cypress/fixtures/media/${filePath}`);
    cy.wait(500);

    // If additional fields are present (e.g., alt text for images), fill them out
    if (type === 'image' && altText) {
        cy.get('[data-drupal-selector="edit-field-media-image-0-alt"]').type(altText);
    }

    // Confirm the upload and verify
    cy.confirm();
    cy.execDrush(`sql:query 'SELECT * FROM media_field_data' | grep ${type} | grep ${fileName}`);
}

function getUploadSelector(type) {
    switch (type) {
        case 'audio':
        case 'video':
            return `[data-drupal-selector="edit-field-media-${type}-file-0-upload"]`;
        case 'image':
            return '[data-drupal-selector="edit-field-media-image-0-upload"]';
        case 'document':
            return '[data-drupal-selector="edit-field-media-document-0-upload"]';
        default:
            throw new Error(`Unsupported media type: ${type}`);
    }
}


