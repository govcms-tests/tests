import 'cypress-file-upload';

// ***********************************************
// The Cypress recommendation is for selectors to use a variant of the following: <div data-cy="box"></div> to be used in tetst as cy.get('[data-cy=box]')
// For the most part you will be fetching data-* constantly so aliasing these elements is useful this done by: cy.get('[data-cy=box]').as('box') and then you can use cy.get('@box')
// The below command does the all the aliasing for you.
// @example beforeEach(() => cy.aliasAll())
Cypress.Commands.add("aliasAll", () =>
    cy.get("[data-cy]").then((list) => {
        list.each((i, {dataset: {cy: name}}) => {
            if (name) {
                cy.get(`[data-cy="${name}"]`).as(name)
            }
        })
    })
)

// Drupal drush command.
Cypress.Commands.add("execDrush", (command) => {
    var cmd = Cypress.env('drupalDrushCmdLine');

    if (cmd == null) {
        if (Cypress.env('localEnv') === "lando") {
            cmd = 'lando drush %command'
        } else {
            cmd = '$(which drush) %command'
        }
    }
    if (typeof command === 'string') {
        command = [command];
    }
    const execCmd = cmd.replace('%command', command.join(' '));
    return cy.exec(execCmd);
});

// Composer command.
Cypress.Commands.add("composerCommand", (command) => {
    var cmd = Cypress.env('composerCmdLine');

    if (cmd == null) {
        console.log(Cypress.env())
        if (Cypress.env('localEnv') === "lando") {
            cmd = 'cd ../../.; lando composer %command'
        } else {
            cmd = 'cd ../../.; composer %command'
        }
    }

    if (typeof command === 'string') {
        command = [command];
    }

    const execCmd = cmd.replace('%command', command.join(' '));

    return cy.exec(execCmd)
});

Cypress.Commands.add("createUser", (siteRole) => {
    cy.govcmsInitialLogin()
    cy.fixture(`users/${siteRole}.json`).then((user) => {
        const username = user.firstname + user.lastname
        const password = user.password
        const email = user.email
        cy.visit('admin/people/create')
        cy.get('#edit-mail')
            .type(email, {force: true})
        cy.get('#edit-name')
            .type(username, {force: true})
        cy.get('#edit-pass-pass1', {force: true})
            .type(password, {force: true})
        cy.get('#edit-pass-pass2', {force: true})
            .type(password, {force: true})
        cy.get('#edit-submit')
            .click({force: true})
        cy.get('.messages-list__item')
            .contains('Created a new user account')
        cy.get('#toolbar-link-entity-user-collection')
            .click({force: true})
        cy.get('#edit-user-bulk-form-0')
            .click({force: true})
        cy.get('#edit-action')
            .select('Add the ' + siteRole + ' role to the selected user(s)')
        cy.get('#edit-submit')
            .click({force: true})
    })
})

Cypress.Commands.add("deleteUser", (siteRole) => {
    cy.fixture(`users/${siteRole}.json`).then((user) => {
        const username = user.firstname + user.lastname
        cy.drupalDrushCommand(["ucan", "--delete-content", username, "-y"])
    })
})

Cypress.Commands.add("userLogin", (siteRole) => {
    if (siteRole === 'govcms-site-admin') {
        cy.drupalLogin()
    } else {
        cy.fixture(`users/${siteRole}.json`).then((user) => {
            const username = user.firstname + user.lastname
            const password = user.password
            cy.visit(`/user/login`)
            //cy.aliasAll()
            cy.get("#edit-name").type(username)
            cy.get("#edit-pass").type(password)
            cy.get("#edit-submit").click()
        })
    }
})


Cypress.Commands.add("type_ckeditor", (element, content) => {
    cy.window()
        .then(win => {
            win.CKEDITOR.instances[element].setData(content);
        });
})

Cypress.Commands.add("confirm", () => {
    cy.get('[data-drupal-selector="edit-submit"]').click()
})

Cypress.Commands.add("getDrupal", (element) => {
    cy.get(`[data-drupal-selector="${element}"]`)
})

Cypress.Commands.add("install", (module) => {
    cy.execDrush(`-y pm:install ${module}`)
})

Cypress.Commands.add("uninstall", (module) => {
    cy.execDrush(`-y pm:uninstall ${module}`)
})

Cypress.Commands.add("createTestUser", (testUser) => {
    cy.execDrush(`ucrt ${testUser} --password=password`)
    cy.execDrush(`user:role:add govcms_content_author ${testUser}`)
})

Cypress.Commands.add("removeTestFiles", () => {
    // Remove all test files
    cy.drupalLogin()
    cy.visit('admin/content/media')
    cy.get('.select-all > .form-checkbox').check()
    cy.get('#edit-action').select('media_delete_action')
    cy.get('#edit-submit').click()
    cy.get('#edit-also-delete-file').check()
    cy.confirm()

})

Cypress.Commands.add("deleteBlock", () => {
    // Delete block, generated with Cypress Studio
    cy.visit('admin/content/block')
    cy.get(':nth-child(1) > .views-field-operations > .dropbutton-wrapper > .dropbutton-widget > .dropbutton > .dropbutton-toggle > .dropbutton__toggle').click();
    cy.get(':nth-child(1) > .views-field-operations > .dropbutton-wrapper > .dropbutton-widget > .dropbutton > .delete > .use-ajax').click();
    cy.get('.ui-dialog-buttonset > .button--primary').click();

})


Cypress.Commands.add("ckeditorType", () => {
    // Type into CKEditor, cy.type() doesn't currently work with CKEditor
    cy.get('.ck-content[contenteditable=true]').then(el => {
        const editor = el[0].ckeditorInstance;
        editor.setData('Typing some stuff');
    });

})

 


export function randString(length) {
    return (Math.random() + 1).toString(36).substring(2, length + 2)
}


