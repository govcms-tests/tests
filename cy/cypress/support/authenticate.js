// --- Commands (Functions) ----------------------------------------------------

// Drupal login.
Cypress.Commands.add("drupalLogin", (user, password) => {
    cy.drupalLogout()
    // Try obtaining login details from env file first
    user = user || Cypress.env('user').super.username
    password = password || Cypress.env('user').super.password
    // If they cannot be found, use the default
    if (user == null || password == null) {
        user = "admin"
        password = "password"
    }
    // Attempt login
    cy.visit(`/user/login`)
    cy.get("#edit-name").type(user)
    cy.get("#edit-pass").type(password)
    cy.get("#edit-submit").click()
});

Cypress.Commands.add('drupalLogout', () => {
  cy.getDrupalVersion().then( (semver) => {
    if (semver.stdout == '10.2.7') {
      cy.visit('/user/logout');
    } else {
      cy.drupalLogoutConfirm();
    }
  })
});

Cypress.Commands.add('drupalLogoutConfirm', () => {
    cy.request({
        url: '/user/logout/confirm',
        followRedirect: false,
    }).then((res) => {
        if (res.status === 200) {
            cy.visit('/user/logout/confirm');
            cy.get('#user-logout-confirm').submit();
        } else {
            cy.visit('/');
        }
   })
})

Cypress.Commands.add('getDrupalVersion', () => {
  cy.execDrush("status | sed -nre 's/^Drupal version.* ([0-9]+\.[0-9]+\.[0-9]+)/\\1/p'")
})
