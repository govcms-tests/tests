// Test setup TFA module.
import {randString} from "../../support/commands";

const testKey = randString(10);
const testProfile = randString(10);
const testUsername = randString(10);
const encryption_profile_key = "DY+T5R9K09+pRy84wZvlF4PjrBzGEXcRDA/NEV6B8/I=";


describe('Check TFA setup', () => {

    it('Create encryption key', () => {
        cy.drupalLogin();
        cy.visit('admin/config/system/keys/add');
        cy.get('input[name="label"]').type(testKey);
        cy.get('select[name="key_type"]').select('encryption');
        cy.get('select[name="key_type_settings[key_size]"]').select('256');
        cy.get('[data-drupal-selector="edit-key-provider"]').select('config');
        cy.get('select[name="key_provider"]').select('config');
        cy.get('input[name="key_input_settings[key_value]"]').type(encryption_profile_key);
        cy.get('input[name="key_input_settings[base64_encoded]"]').check();
        cy.get('input[name="op"]').click();
        cy.get('.responsive-enabled tbody tr').eq(0)
          .find('td').eq(0)
          .should('have.text', `${testKey}`);
    })

    it('Create encryption profile', () => {
        cy.drupalLogin();
        cy.visit('admin/config/system/encryption/profiles/add');
        cy.get('input[name="label"]').type(testProfile).blur();
        cy.get('.machine-name-value', { timeout: 5000 }).should('be.visible');
        cy.intercept('POST', '**/admin/config/system/encryption/profiles/add**').as('ajaxFormRefresh');
        cy.get('select[name="encryption_method"]').select('Authenticated AES (Real AES)');
        cy.wait('@ajaxFormRefresh');
        cy.get('select[name="encryption_key"]')
          .should('be.visible')
          .and('contain', testKey) 
          .select(testKey);
        cy.get('input[name="op"]').click();
        cy.get('.responsive-enabled tbody tr').eq(0)
          .find('td').eq(0)
          .should('have.text', `${testProfile}`);
    })

    it('Check user is not asked to set up TFA', () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.execDrush(`user:create ${testUsername} --password=password`);
        cy.execDrush(`user:role:add govcms_content_author ${testUsername}`);
        cy.execDrush(`user:role:remove authenticated ${testUsername}`);
        cy.execDrush('role:perm:add govcms_content_author \'setup own tfa\'');
        // Log in as the new user.
        cy.visit('user')
        cy.get('input[name="name"]').type(`${testUsername}`);
        cy.get('input[name="pass"]').type('password');
        cy.get('input[name="op"]').click();
        // Check message is not there
        cy.get('h1.title.page-title')
          .should('have.text', `${testUsername}`)
          .and('be.visible');
    })

    it('Set up TFA', () => {
        cy.drupalLogin();
        // Configure TFA settings
        cy.execDrush('-y cset tfa.settings validation_skip 10');
        // Enforce TFA set up for Content Author, Content Approver, and Site Admin roles.
        cy.execDrush('-y cset tfa.settings required_roles.govcms_content_author govcms_content_author');
        cy.execDrush('-y cset tfa.settings required_roles.govcms_content_approver govcms_content_approver');
        cy.execDrush('-y cset tfa.settings required_roles.govcms_site_administrator govcms_site_administrator');
        cy.execDrush('-y cset tfa.settings required_roles.authenticated authenticated');
        // Set Encryption profile
        cy.execDrush(`-y cset tfa.settings encryption ${testProfile}`);
        // Enable TFA module.
        cy.visit('/admin/config/people/tfa');
        cy.get('input[name="tfa_enabled"]').check();
        cy.get('input[name="op"]').click();
    })

    it('Check new user is asked to enable TFA', () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        // Log in as the new user.
        cy.visit('user');
        cy.get('input[name="name"]').type(`${testUsername}`);
        cy.get('input[name="pass"]').type('password');
        cy.get('input[name="op"]').click();
        // Check user is prompted to set up TFA.
        cy.get('[data-drupal-selector="messages-container"]')
          .find('.messages__content')
          .should('contain.text', 'You are required to setup two-factor authentication');
    })

    it('Check user can set up TFA', () => {
        let SECRET_KEY;
        // Login
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit('user');
        cy.get('input[name="name"]').type(`${testUsername}`);
        cy.get('input[name="pass"]').type('password');
        cy.get('input[name="op"]').click();
        // Set up TFA
        cy.get('[data-drupal-selector="messages-container"]')
          .contains('a', 'setup two-factor authentication')
          .click();
        cy.get('ul[data-drupal-selector="edit-link"]')
          .contains('a', 'Set up application')
          .click();
        cy.get('input[data-drupal-selector="edit-current-pass"]').type('passwordd');
        cy.get('input[name="op"]').click();
        cy.get('[data-drupal-selector="edit-seed"]').invoke('val').then((val) => {
            SECRET_KEY = val
            cy.log(SECRET_KEY)
            cy.task("generateOTP", SECRET_KEY).then(token => {
                cy.get('[data-drupal-selector="edit-code"]').type(token)
            })
        });
        cy.get('input[name="op"]').click();

    })

    it('Clean up', () => {
        // Disable TFA.
        cy.execDrush('-y cset tfa.settings enabled 0');
        cy.drupalLogin();
        // Remove created key, which automatically deletes the created profile as well.
        cy.visit(`admin/config/system/keys/manage/${testKey}/delete?destination=/admin/config/system/keys`);
        cy.get('#edit-delete').click();
        cy.wait('@openDeleteModal');
        cy.contains('button', 'Delete')
          .should('be.visible')
          .click();
        cy.get('.messages--status')
          .should('be.visible')
          .and('contain.text', `The key ${testKey} has been deleted.`);
        // Remove user created for testing purposes
        cy.execDrush(`-y user:cancel --delete-content ${testUsername}`);
    })

})
