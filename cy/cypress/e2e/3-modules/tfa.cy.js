// Test setup TFA module.
import {randString} from "../../support/commands";

const testKey = randString(10);
const testProfile = randString(10);
const testUsername = randString(10);
const encryption_profile_key = "DY+T5R9K09+pRy84wZvlF4PjrBzGEXcRDA/NEV6B8/I=";


describe('Check TFA setup', () => {

    it('Create encryption key', () => {
        cy.drupalLogin()
        cy.visit('admin/config/system/keys')
        cy.visit('admin/config/system/keys/add')
        cy.get('input[name="label"]').type(testKey)
        // For some reason the site needs time here otherwise an error is thrown.
        // Something to do with the verification of #edit-label being machine-readable.
        cy.wait(500)
        cy.get('select[name="key_type"]').select('encryption')
        cy.get('select[name="key_type_settings[key_size]"]').select('256')
        cy.get('[data-drupal-selector="edit-key-provider"]').select('config')
        cy.get('select[name="key_provider"]').select('config')
        cy.get('input[name="key_input_settings[key_value]"]').type(encryption_profile_key)
        cy.get('input[name="key_input_settings[base64_encoded]"]').check()
        cy.get('input[name="op').submit()
        cy.get('.responsive-enabled tbody tr').eq(0)
          .find('td').eq(0)
          .should('have.text', '${testKey}');
    })

    it('Create encryption profile', () => {
        cy.drupalLogin()
        cy.visit('admin/config/system/encryption/profiles/add')
        cy.get('input[name="label"]').type(testProfile)
        cy.wait(250)
        cy.get('select[name="encryption_method"]').select('Authenticated AES (Real AES)')
        cy.wait(250)
        cy.get('select[name="encryption_key"]').select(testKey)
        cy.wait(250)
        cy.get('input[name="op').submit()
        cy.get('.responsive-enabled tbody tr').eq(0)
          .find('td').eq(0)
          .should('have.text', '${testProfile}');
    })

    it('Check user is not asked to set up TFA', () => {
        cy.visit('user/logout')
        cy.execDrush(`user:create ${testUsername} --password=password`)
        cy.execDrush(`user:role:add govcms_content_author ${testUsername}`)
        cy.execDrush(`user:role:remove authenticated ${testUsername}`)
        cy.execDrush('role:perm:add govcms_content_author \'setup own tfa\'')
        // Log in as the new user.
        cy.visit('user')
        cy.get("#edit-name").type(`${testUsername}`)
        cy.get("#edit-pass").type('password')
        cy.get("#edit-submit").click()
        // Check message is not there
        cy.get('.messages.messages--error').should('not.exist')
    })

    it('Set up TFA', () => {
        cy.drupalLogin()
        // Configure TFA settings
        cy.execDrush('-y cset tfa.settings validation_skip 10')
        // Enforce TFA set up for Content Author, Content Approver, and Site Admin roles.
        cy.execDrush('-y cset tfa.settings required_roles.govcms_content_author govcms_content_author')
        cy.execDrush('-y cset tfa.settings required_roles.govcms_content_approver govcms_content_approver')
        cy.execDrush('-y cset tfa.settings required_roles.govcms_site_administrator govcms_site_administrator')
        cy.execDrush('-y cset tfa.settings required_roles.authenticated authenticated')
        // Set Encryption profile
        cy.execDrush(`-y cset tfa.settings encryption ${testProfile}`)
        // Enable TFA module.
        cy.get('#toolbar-link-system-admin_config').click();
        cy.get(':nth-child(1) > :nth-child(1) > .panel__content > .admin-list--panel > :nth-child(3) > .admin-item__title > .admin-item__link').click();
        cy.get('[data-drupal-selector="edit-tfa-enabled"]').click()
        cy.get('#edit-submit').click();
    })

    it('Check new user is asked to enable TFA', () => {
        cy.visit('user/logout')
        // Log in as the new user.
        cy.visit('user')
        cy.get("#edit-name").type(`${testUsername}`)
        cy.get("#edit-pass").type('password')
        cy.get("#edit-submit").click()
        // Check user is prompted to set up TFA.
        cy.get('.messages.messages--error').contains(`You are required to setup two-factor authentication.`)
    })

    it('Check user can set up TFA', () => {
        let SECRET_KEY;
        // Login
        cy.visit('user/logout')
        cy.visit('user')
        cy.get("#edit-name").type(`${testUsername}`)
        cy.get("#edit-pass").type('password')
        cy.get("#edit-submit").click()
        // Set up TFA
        cy.get('.messages.messages--error').within(() => {
            cy.get('a').click()
        })
        cy.get('[data-drupal-selector="edit-link"]').within(() => {
            cy.get('a').click()
        })
        cy.get('[data-drupal-selector="edit-current-pass"]').type('password')
        cy.get('#edit-submit').click()
        cy.get('[data-drupal-selector="edit-seed"]').invoke('val').then((val) => {
            SECRET_KEY = val
            cy.log(SECRET_KEY)
            cy.task("generateOTP", SECRET_KEY).then(token => {
                cy.get('[data-drupal-selector="edit-code"]').type(token)
            })
        })
        cy.get('[data-drupal-selector="edit-login"]').click()

    })

    it('Clean up', () => {
        // Disable TFA.
        cy.execDrush('-y cset tfa.settings enabled 0')
        cy.drupalLogin()
        // Remove created key, which automatically deletes the created profile as well.
        cy.visit(`admin/config/system/keys/manage/${testKey}/delete?destination=/admin/config/system/keys`)
        cy.get('#edit-submit').click()
        cy.get('.messages-list__item').contains(`The key ${testKey} has been deleted.`)
        // Remove user created for testing purposes
        cy.execDrush(`-y user:cancel --delete-content ${testUsername}`)
    })

})
