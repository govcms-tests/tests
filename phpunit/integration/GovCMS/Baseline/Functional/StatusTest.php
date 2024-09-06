<?php

namespace GovCMS\Tests\Integration\GovCMS\Baseline\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests output on the status overview page.
 *
 * @group govcms
 */
class StatusTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $profile = 'govcms';

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * @var \Drupal\user\Entity\User
   */
  protected $restrictedUser;

  /**
   * Tests that the status page returns.
   *
   * @group legacy
   */
  public function testStatusPage(): void {
    // Log in as the admin user and perform the initial checks.
    $this->drupalLogin($this->adminUser);

    // Verify if the 'Status report' is the first item link.
    $this->drupalGet('admin/reports');
    $this->assertEquals('GovCMS System Report', $this->cssSelect('.admin-item :first-child')[0]->getText());

    // Go to custom system report.
    $this->drupalGet('admin/reports/system-report');
    $this->assertSession()->statusCodeEquals(200);

    // Go to Drupal Administration.
    $this->drupalGet('admin/reports/status');
    $this->assertSession()->statusCodeEquals(403);

    // Check that the link admin/reports/system-report is not in the toolbar.
    $this->drupalGet('<front>');
    $this->assertSession()->linkExists('GovCMS System Report');

    // Log out the admin user.
    $this->drupalLogout();

    // Log in as the restricted user and attempt to access the status page.
    $this->drupalLogin($this->restrictedUser);

    // Attempt to access the status page and expect a 403 Forbidden status.
    // Go to custom system report.
    $this->drupalGet('admin/reports/system-report');
    $this->assertSession()->statusCodeEquals(403);

    $this->drupalGet('admin/reports/status');
    $this->assertSession()->statusCodeEquals(403);

    // Check that the link admin/reports/system-report is not in the toolbar.
    $this->drupalGet('<front>');
    $this->assertSession()->linkNotExists(Url::fromRoute('govcms.system_report')->toString());
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

    // Unset the sync directory in settings.php to trigger the error.
    $settings['settings']['config_sync_directory'] = (object) [
      'value' => '',
      'required' => TRUE,
    ];
    $this->writeSettings($settings);

    // Create an admin user with the necessary permissions.
    $this->adminUser = $this->drupalCreateUser([
      'access toolbar',
      'access site reports',
      'view the administration theme',
    ]);

    // Create a restricted user without any permissions.
    $this->restrictedUser = $this->drupalCreateUser([
      'access toolbar',
      'view the administration theme',
    ]);
  }

}
