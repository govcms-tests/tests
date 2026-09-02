describe('Views Data Export functionality test', () => {

  //Create a few standard pages
    it('Create sample content', () => {
        cy.drupalLogin()
        for (let i = 1; i <= 3; i++) {
            cy.visit('/node/add/govcms_standard_page');
            cy.get('input[name="title[0][value]"]').type(`Test Standard Page ${i}`);
            // Fill CKEditor 5 body field
            cy.get('div.ck-editor__editable_inline[contenteditable="true"]').type(`This is the body text for the page ${i}`);
            cy.get('input#edit-submit').click();
            cy.contains('Test Standard Page').should('exist');
        }
    });

    //Create View listing standard pages
    it('Create a view for Standard Pages', () => {
        cy.drupalLogin()
        // Import the config directly from mounted fixtures
        cy.execDrush('config:import --partial --source=/app/tests/cy/cypress/fixtures/views/view_views_data_export -y');
        // Verify the view exists
        cy.execDrush('views:list').then((output) => {
          expect(output.stdout).to.include('standard_pages_test');
        });      
    });

    it('Add Data export tab to view', () => {
        cy.drupalLogin()
        //enable views_data_export module
        cy.execDrush('-y pm:install views_data_export') 
        // Visit the existing view edit page
        cy.visit('/admin/structure/views/view/standard_pages_test');
        // Add a Data Export display
        cy.get('li.add > a:contains("Add")').first().click();
        cy.get('input#edit-displays-top-add-display-data-export').should('be.visible').click();
        // Confirm that the Data export tab was added to the view
        cy.get('ul#views-display-menu-tabs').should('contain.text', 'Data export').within(() => {
        // Confirm that the tab link exists 
        cy.get('li[data-drupal-selector^="edit-displays-top-tabs-data-export"]').should('exist');
        });
    });

    const viewPath = '/admin/structure/views/view/standard_pages_test';
    const exportPath = '/export-view';

    const setExportFormat = (format) => {
        cy.drupalLogin();
        cy.visit(viewPath);

        //Click Data export tab
        cy.get('a.js-tabs-link').contains('Data export').click({ force: true });

        //If the formate is csv, we need to set the path for the data export view to /export-view
        if (format === 'csv') {
            //cy.log('Setting export path for CSV format...');
            cy.get('a.views-ajax-link[title="No path is set"]').should('be.visible').click({ force: true });

            cy.get('input[data-drupal-selector="edit-path"]')
              .should('be.visible')
              .clear()
              .type('/export-view', { delay: 50 });

             cy.get('button.button--primary.js-form-submit.form-submit.ui-button')
               .contains('Apply')
               .click({ force: true });

            // Verify that the new path appears
            cy.get('a.views-ajax-link').should('contain.text', '/export-view');
        }

        cy.get('a.views-ajax-link.views-button-configure[title="Change settings for this format"]')
          .should('be.visible')
          .click({ force: true });

        cy.get(`input[data-drupal-selector^="edit-style-options-formats-${format}"]`)
          .should('exist')
          .check({ force: true });

        cy.get('button.button--primary.js-form-submit.form-submit.ui-button')
          .contains('Apply')
          .click({ force: true });

        cy.get('input[data-drupal-selector="edit-actions-submit"]').should('be.visible').click({ force: true });
        //cy.get('.messages__content').should('contain.text', 'has been saved');
        cy.contains(/You have unsaved changes./i).should('not.exist');
    };

    const testExport = (format, assertions) => {
        cy.intercept('GET', exportPath).as(`export${format.toUpperCase()}`);
        cy.get(`a[href="${exportPath}"]`).click({ force: true });

        cy.wait(`@export${format.toUpperCase()}`).then((interception) => {
        const { body, headers, statusCode } = interception.response;
        expect(statusCode).to.eq(200);
        assertions(body, headers);
        });
    };

    it('Test exporting view in CSV format', () => {
        setExportFormat('csv');

        testExport('csv', (body, headers) => {
        expect(headers['content-type']).to.include('text/csv');
        expect(body).to.include('Title');
        expect(body).to.include('Standard Page 1');
        expect(body).to.include('Standard Page 2');
        expect(body).to.include('Standard Page 3');
        });
    });

    it('Test exporting view in XML format', () => {
        setExportFormat('xml');

        testExport('xml', (body, headers) => {
        expect(headers['content-type']).to.include('xml');
        expect(body).to.include('>Test Standard Page 1<');
        expect(body).to.include('>Test Standard Page 2<');
        expect(body).to.include('>Test Standard Page 3<');
        });
    });

    it('Test exporting view in JSON format', () => {
        setExportFormat('json');

        testExport('json', (body, headers) => {
            expect(headers['content-type']).to.include('json');
            expect(body[0].title).to.include('Test Standard Page 3');
            expect(body[1].title).to.include('Test Standard Page 2');
            expect(body[2].title).to.include('Test Standard Page 1');
        });
    });
  
   //Delete content and view, and uninstall module, and delete any downloads
    it('Clean up', () => {
        cy.execDrush('entity:delete node -y')
        cy.execDrush('entity:delete view standard_pages_test')
        cy.execDrush('-y pm:uninstall views_data_export')
        //If a csv file was downloaded, we need to delete the cypress/downloads folder
        cy.exec('rm -rf cypress/downloads')
    });

});
