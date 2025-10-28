describe('Check View creation', () => {
    //Create dummy content for each content type
    it('Create content for each content type', () => {
        cy.drupalLogin()   
        const contentTypes = [
        { name: 'Blog article', path: '/node/add/govcms_blog_article' },
        { name: 'Event', path: '/node/add/govcms_event' },
        { name: 'FOI', path: '/node/add/govcms_foi' },
        { name: 'News and Media', path: '/node/add/govcms_news_and_media' },
        { name: 'Standard page', path: '/node/add/govcms_standard_page' },
        ];

        // Visit content page first
        cy.visit('/admin/content');

        contentTypes.forEach((type) => {
            // Select add content 
            cy.get('a[data-drupal-link-system-path="node/add"]').click();
            // Click on the specific content type link
            cy.get(`a[href="${type.path}"]`).click();
            // Fill in Title
            cy.get('input[name="title[0][value]"]').type(`${type.name} Title`);
            // Fill in Body
            cy.get('div.ck-editor__editable_inline[contenteditable="true"]').type(`This is the body text for the ${type.name} content type`);
            // Save the node
            cy.get('input#edit-submit').click();

            // Confirm creation
            cy.contains(`${type.name} Title`).should('exist');
            cy.contains('has been created').should('exist');

            // Click Apply to change state to Draft
            cy.get('input[data-drupal-selector="edit-submit"]').contains('Apply').click({ force: true });
            // Change state to Published
            cy.get('select[data-drupal-selector="edit-new-state"]').select('published');
            // Click Apply again to publish
            cy.get('input[data-drupal-selector="edit-submit"]').contains('Apply').click({ force: true });
            // Go back to Content page for next iteration
            cy.visit('/admin/content');
        });
    })

    it('Create View listing content', () => {
        cy.drupalLogin()   
        //Add new view
        cy.visit('/admin/structure');
        cy.get('a[href="/admin/structure/views"]').click();
        cy.get('a[href="/admin/structure/views/add"]').click();

        // Name view 'Test Menu'
        cy.get('input[data-drupal-selector="edit-label"]').type('Test Menu');
        // Create a page display
        cy.get('input[data-drupal-selector="edit-page-create"]').check({ force: true });
        // Wait a bit for dependent form elements to appear
        cy.wait(500);
        // Change display style to Table
        cy.get('select[data-drupal-selector="edit-page-style-style-plugin"]').select('Table');
        //Check the Menu link checkbox 
        cy.get('input[data-drupal-selector="edit-page-link"]').click({ force: true })
        cy.wait(500);
        //For some unknown reason, the menu link checkbox gets unchecked, so we have to check it again
        cy.get('input[data-drupal-selector="edit-page-link"]').click({ force: true })
        //select Main navigation from the dropdown.
        cy.get('select[data-drupal-selector="edit-page-link-properties-parent"]').should('be.visible').select('<Main navigation>', { force: true })

        // Save the view
        cy.get('input[data-drupal-selector="edit-submit"]').contains('Save and edit').click({ force: true });
        // Verify success
        cy.contains('The view Test Menu has been saved').should('exist');
    });

    it('Configure View', () => {
        //login and select view
        cy.drupalLogin()   
        cy.visit('/admin/structure');
        cy.get('a[href="/admin/structure/views"]').click();
        cy.get('a[href="/admin/structure/views/view/test_menu"]').first().click();

        //Click "Content: Title (Title)"
        cy.get('a[href="/admin/structure/views/nojs/handler/test_menu/page_1/field/title"]').first().click();
        // Click "Link to the content" to uncheck option
        cy.get('input[name="options[settings][link_to_entity]"]').click({ force: true });
        // Click "Apply"
        cy.get('button.js-form-submit').contains('Apply').click({ force: true });

        // Click "Add filter criteria"
        cy.get('a#views-add-filter').click();
        // Select "Content: Type"
        cy.get('input[name="name[node_field_data.type]"]').check({ force: true });
        // Click "Add and configure filter criteria"
        cy.get('button.js-form-submit').contains('Add and configure filter criteria').click({ force: true });
        // Expose the filter to visitors
        cy.get('input[name="options[expose_button][checkbox][checkbox]"]').check({ force: true });
        // Click "Apply"
        cy.get('button.js-form-submit').contains('Apply').click({ force: true });

        //Add "Content Type" field
        cy.get('a[href="/admin/structure/views/nojs/add-handler/test_menu/page_1/field"]').first().click();
        cy.get('input[data-drupal-selector="edit-name-node-field-datatype"]').check();
        cy.contains('button', 'Add and configure fields').click();
        cy.get('input[data-drupal-selector="edit-options-settings-link"]').should('be.visible');
        cy.get('input[data-drupal-selector="edit-options-settings-link"]').click();
        cy.contains('button', 'Apply').click();

        //Add "Authored on" field
        cy.get('a[href="/admin/structure/views/nojs/add-handler/test_menu/page_1/field"]').first().click();
        cy.get('input[data-drupal-selector="edit-name-node-field-datacreated"]').check();
        cy.contains('button', 'Add and configure fields').click();
        cy.contains('button', 'Apply').click();

        //Add "Link to content" field
        cy.get('a[href="/admin/structure/views/nojs/add-handler/test_menu/page_1/field"]').first().click();
        cy.get('input[data-drupal-selector="edit-name-nodeview-node"]').check();
        cy.contains('button', 'Add and configure fields').click();
        cy.contains('button', 'Apply').click();
        cy.wait(500);
        
        //include reset option
        cy.get('summary.claro-details__summary').contains('Advanced').click({ force: true });
        cy.wait(500);
        cy.get('a.views-ajax-link.views-button-configure[href*="test_menu/page_1/exposed_form_options"]').should('be.visible') .click({ force: true });
        cy.get('input[data-drupal-selector="edit-exposed-form-options-reset-button"]').check({ force: true });
        cy.contains('button', 'Apply').click({ force: true });

        //save the view
        cy.get('input[data-drupal-selector="edit-actions-submit"]').should('be.visible').click({ force: true });
        // Verify the view was saved
        cy.contains('The view Test Menu has been saved').should('exist');
        
    });

    it('Confirm view display from front-end', () => {
        //Visit homepage
        cy.visit('http://localhost:8888/');

        //Confirm the Test Menu link exists and click it
        cy.get('a[href="/test-menu"][data-drupal-link-system-path="test-menu"]')
        .should('exist')
        .and('contain.text', 'Test Menu')
        .first()
        .click();

        // Confirm the headers exist
        cy.get('th.views-field-title')
        .should('exist')
        .and('contain.text', 'Title');

        cy.get('th.views-field-type')
        .should('exist')
        .and('contain.text', 'Content type');

        cy.get('th.views-field-created')
        .should('exist')
        .and('contain.text', 'Authored on');

        cy.get('th.views-field-view-node')
        .should('exist')
        .and('contain.text', 'Link to Content');

        //Confirm titles are correct
        const titles = [
        'Standard page Title',
        'News and Media Title',
        'FOI Title',
        'Event Title',
        'Blog article Title'
        ];

        titles.forEach(title => {
            cy.get('td.views-field-title').should('contain.text', title);
        });
    });

    it('Confirm that the view filtering works', () => {
        const contentTypes = [
        { label: 'Standard page', value: 'govcms_standard_page' },
        { label: 'News and Media', value: 'govcms_news_and_media' },
        { label: 'FOI', value: 'govcms_foi' },
        { label: 'Event', value: 'govcms_event' },
        { label: 'Blog article', value: 'govcms_blog_article' }
        ];
            
        cy.visit('http://localhost:8888/test-menu');

        //For each content type, confirm that the filtering works
        contentTypes.forEach(({ label, value }) => {
            // Step 1: Select the content type
            cy.get('select[data-drupal-selector="edit-type"]')
                .should('be.visible')
                .select(value, { force: true });

            // Step 2: Click Apply
            cy.get('input[data-drupal-selector="edit-submit-test-menu"]')
                .should('be.visible')
                .click({ force: true });

            // Step 3: Verify only that content type appears
            cy.get('td.views-field-type')
                .should('exist')
                .and('contain.text', label);

            // Ensure no other types are present
            contentTypes
                .filter(t => t.label !== label)
                .forEach(({ label: otherLabel }) => {
                    cy.get('td.views-field-type').should('not.contain.text', otherLabel);
                });

            // Step 4: Click Reset
            cy.get('input[data-drupal-selector="edit-reset"]')
                .should('be.visible')
                .click({ force: true });

            // Step 5: Confirm all content types reappear
            contentTypes.forEach(({ label: typeLabel }) => {
                cy.get('td.views-field-type').should('contain.text', typeLabel);
            });
        });
    });

    //Delete dummy content and test_menu view 
    it('Clean up', () => {
        cy.execDrush('entity:delete node -y')
        cy.execDrush('entity:delete view test_menu')
    });

})
