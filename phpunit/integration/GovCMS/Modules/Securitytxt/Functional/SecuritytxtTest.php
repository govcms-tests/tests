<?php

namespace GovCMS\Tests\Integration\GovCMS\Modules\Securitytxt\Functional;

use GovCMS\Tests\Integration\GovCMS\Baseline\Functional\GovCMSTestBase;

/**
 * Test GovCMS's custom Securitytxt requirements
 *
 * @group securitytxt
 * @group govcms
 */
class SecuritytxtTest extends GovCMSTestBase {

    /**
     * {@inheritdoc}
     */
    protected function setUp(): void {
        parent::setUp();
        $user = $this->drupalCreateUser([
            'administer securitytxt'
        ]);
        $this->drupalLogin($user);
    }
    /**
    * Ensure that Securitytxt is enabled and the button to disable it is
    * hidden.
    */
    public function testGovcmsRequirements() {
        // Check Securitytxt is enabled
        $config = \Drupal::config('securitytxt.settings');
        $enabled_status = $config->get('enabled');
        $this->assertTrue($enabled_status);

        // Enable/disable button should be hidden.
        $this->drupalGet('admin/config/system/securitytxt');
        $this->assertSession()->elementNotExists('css', 'input#edit-enabled');
    }
}
