<?php

namespace GovCMS\Tests\Integration\GovCMS\Baseline\Functional;

use Drupal\Tests\BrowserTestBase;
use Drupal\user\Entity\User;

/**
 * Tests UID 1 access to the GovCMS system and Drupal status reports.
 *
 * @group govcms
 */
class UID1ReportAccessTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $profile = 'govcms';

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Tests that UID 1 has access to the GovCMS system report and Drupal status
   * report.
   */
  public function testUid1Access(): void {
    // Log out the current user to ensure a clean state.
    $this->drupalLogout();

    // Load the real user object from UserSession object.
    $admin_account = User::load($this->rootUser->id());
    // Check if the password is null.
    $this->assertNull($admin_account->passRaw);
    // Set the password and save the User.
    $new_password = $this->randomString();
    $admin_account->setPassword($new_password);
    $admin_account->save();
    // Set the passRaw directly on the User.
    $admin_account->passRaw = $new_password;
    $this->drupalLogin($admin_account);

    // Ensure the current user is the root user.
    $this->assertEquals(1, \Drupal::currentUser()->id());

    // Check that UID 1 can access the GovCMS system report page.
    $this->drupalGet('admin/reports/system-report');
    $this->assertSession()->statusCodeEquals(200);

    // Verify that UID 1 can access the standard Drupal status page.
    $this->drupalGet('admin/reports/status');
    $this->assertSession()->statusCodeEquals(200);

    // Log out to clean up the test environment.
    $this->drupalLogout();
  }

  /**
   * {@inheritdoc}
   */
  #[\Override]
  protected function setUp(): void {
    if (!class_exists('Drupal\govcms\Controller\SystemReportController')) {
      $this->markTestSkipped();
    }

    parent::setUp();
  }

}