describe('Testing integration between webform and symfony mailer', () => {
   
    it('Set up the mailer module', () => {
        // Install webform and mailer modules
        cy.execDrush('-y pm:install webform, webform_node, webform_access, webform_ui, mailer_transport, symfony_mailer')
        
        cy.drupalLogin()
        // Go directly to the Mailer config page.
        cy.visit('/admin/config/system/mailer');

        // Click on the "Transport" tab.
        cy.get('a.tabs__link')
        .contains('Transport')
        .click();

         // Click "Edit" link for Sendmail transport.
        cy.get('a[href*="/admin/config/system/mailer/transport/sendmail"]').click();

        // Select the "/usr/sbin/sendmail -t -i" radio option.
        cy.get('input[type="radio"][value="/usr/sbin/sendmail -t -i"]').check({ force: true });

        // Click "Save".
        cy.get('input[data-drupal-selector="edit-submit"]').click();

        // Assert that the success message appears.
        cy.get('.messages--status')
        .should('be.visible')
        .and('contain', 'The transport configuration has been saved.');
    });

    it('Send test email', () => {
        cy.drupalLogin()
        // Go directly to the Mailer config page.
        cy.visit('/admin/config/system/mailer');

        // Click the "Test" tab.
        cy.get('a.tabs__link')
        .contains('Test')
        .click();

        // Type the recipient email.
        cy.get('input[data-drupal-selector="edit-recipient"]')
        .clear()
        .type('1234@example.com');

        // Click "Send".
        cy.get('input[data-drupal-selector="edit-actions-submit"]').click();

        // Verify Drupal shows a success message.
        cy.get('.messages--status')
        .should('be.visible')
        .and('contain', 'An attempt has been made to send an email to 1234@example.com.');

        // Fetch the latest messages from MailHog API.
        cy.request('http://localhost:8025/api/v2/messages').then((response) => {
        expect(response.status).to.eq(200);
        const messages = response.body.items;

        // Ensure at least one message exists.
        expect(messages.length).to.be.greaterThan(0);

        // Find the message sent to 1234@example.com
        const message = messages.find((m) =>
            m.Content.Headers.To?.some((to) => to.includes('1234@example.com'))
        );

        expect(message).to.exist;
        expect(message.Content.Headers.Subject[0]).to.contain('Test', 'Email subject contains expected word');
        expect(message.Content.Body).to.include('This is a test email');

        });

        //clear any emails to mailhog
        cy.request('DELETE', 'http://localhost:8025/api/v1/messages');

        // Ensure no messages exist.
        cy.request('http://localhost:8025/api/v2/messages').then((response) => {
            expect(response.status).to.eq(200);
        const messageCount = response.body.total;
        expect(messageCount).to.eq(0, 'MailHog inbox should be empty');
        });
    })

    it('Configure the Webform', () => {
        const webformTitle = 'A Test Webform';
        const recipient = '1234@example.com';
        cy.drupalLogin()

        // Visit the Webform overview page.
        cy.visit('/admin/structure/webform');

        // Click the "Add webform" button.
        cy.get('a[href="/admin/structure/webform/add"]').click();

        // The "Add webform" link opens a modal dialog via AJAX.
        // Wait for the modal to appear.
        cy.get('input[data-drupal-selector="title"]', { timeout: 10000 }).should('be.visible');

        // Type the title.
        cy.get('input[data-drupal-selector="title"]').type(webformTitle);

        // Click the "Save" button inside the modal.
        cy.get('button.button--primary.js-form-submit').click();

        // Verify that a success message appears.
        cy.get('.messages--status')
        .should('be.visible')
        .and('contain', 'Webform A Test Webform created.');

         // Click Build tab 
        cy.get('a[href="/admin/structure/webform/manage/a_test_webform"]').first().click();

        // Add element (opens modal)
        cy.get('a#webform-ui-add-element').click();
        cy.get('a[data-drupal-selector="edit-elements-managed-file-operation"]').click();

        // Configure the file field
        cy.get('input[data-drupal-selector="title"]').type('Upload File');

        // Click the Save button inside this modal only
        cy.get('.ui-dialog-off-canvas.webform-off-canvas', { timeout: 10000 })
        .should('be.visible')
        .within(() => {
            cy.get('input[data-drupal-selector="edit-submit"]').click();
        });

        // Save elements.
        cy.get('input[data-drupal-selector="edit-submit"][value="Save elements"]').click({force: true});

        // Go to Settings > Handlers 
        cy.get('a[href$="/settings"]').click();
        cy.get('a[href$="/handlers"]').first().click();

        // Add Email handler 
        cy.get('a[href$="/handlers/add/email"]').click();

        // Wait for the off-canvas panel to open.
        cy.get('input[data-drupal-selector="edit-label"]').should('be.visible').clear().type('Webform Email');

        // Select "Custom To email address..."
        cy.get('select[data-drupal-selector="edit-settings-to-mail-select"]').select('_other_');

        // Type the recipient address.
        cy.get('input[data-drupal-selector="edit-settings-to-mail-other"]').type(recipient);

        // Enable attachments.
        cy.get('input[data-drupal-selector="edit-settings-attachments"]').check({ force: true });

        // Save the handler.
        cy.get('input[data-drupal-selector="edit-submit"][value="Save"]').click({ force: true });

        cy.wait(500);

        // Save all handlers.
        cy.get('input[data-drupal-selector="edit-submit"][value="Save handlers"]').click();

        // Verify success message
        cy.get('.messages--status')
        .should('be.visible')
        .and('contain', 'saved');
    });

    it('Submit webform and check email for file attachment', () => {
        cy.drupalLogin()

        //Clear any existing emails in mailHog
        cy.request('DELETE', 'http://localhost:8025/api/v1/messages');
        
        // Visit the Webform overview page.
        cy.visit('/admin/structure/webform');

        // Navigate to the webform page
        cy.visit('/form/a-test-webform');

        // Upload the file
        cy.get('input[data-drupal-selector="edit-upload-file-upload"]')
        .attachFile('media/image_test.jpeg'); // path is relative to cypress/fixtures

        cy.wait(500);

        // Submit the form
        cy.get('input[data-drupal-selector="edit-submit"]').click();

         //Fetch latest MailHog message
        cy.request('http://localhost:8025/api/v2/messages')
        .then((response) => {
        expect(response.status).to.eq(200);

        const items = response.body.items;
        expect(items.length).to.be.greaterThan(0);

        // Get the most recent email
        const latest = items[0];
        const raw = latest.Raw.Data;

        // Assert attachment headers
        expect(raw).to.include('Content-Type: image/jpeg');
        expect(raw).to.include('Content-Disposition: attachment;');
        expect(raw).to.include('filename=image_test.jpeg');
      });

      //Clear any existing emails in mailhog
      cy.request('DELETE', 'http://localhost:8025/api/v1/messages');  
    });

    it('Clean up', () => {
        //Delete Webform 
        cy.execDrush('entity:delete webform a_test_webform');
        //Delete webform content type 
        cy.execDrush('entity:delete node_type webform')
        //Uninstall webform and mailer modules
        cy.execDrush('pm:uninstall webform_node webform_ui webform_access webform -y')
        cy.execDrush('pm:uninstall mailer_transport symfony_mailer -y')
    })
})
