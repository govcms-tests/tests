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

// Drupal logout with confirmation.
Cypress.Commands.add('drupalLogout', () => {
    return cy.request('/user/logout');
// TODO: replace the above with the below once GovCMS is 
// back to using drupal >= 10.3.x
//    cy.request({
//        url: '/user/logout/confirm',
//        followRedirect: false,
//    }).then((res) => {
//        if (res.status === 200) {
//            cy.visit('/user/logout/confirm');
//            cy.get('#user-logout-confirm').submit();
//        } else {
//            cy.visit('/');
//        }
//   })
});
