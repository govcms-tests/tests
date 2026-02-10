<?php

namespace GovCMS\Tests\Integration\GovCMS\Security\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests the file uploaded by a Drupal form.
 *
 * @group file
 */
class HttpavServiceTest extends BrowserTestBase {

  use GovcmsTestFileCreationTrait {
    generateFile as govcmsGenerateTestFile;
  }

  /**
   * {@inheritdoc}
   */
  protected $strictConfigSchema = FALSE;

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['file', 'govcms_file_test', 'govcms_security', 'httpav'];

  /**
   * {@inheritdoc}
   */
  protected $profile = 'govcms';

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Test file.
   *
   * @var string
   */
  protected $testFile;

  /**
   * {@inheritdoc}
   */
  #[\Override]
  protected function setUp(): void {
    parent::setUp();
    $account = $this->drupalCreateUser([]);
    $this->drupalLogin($account);

    $this->testFile = $this->govcmsGenerateTestFile('image_1.png', $this->randomString());;
  }

  /**
   * {@inheritdoc}
   */
  #[\Override]
  protected function tearDown(): void {
    // Delete all test file.
    unlink($this->testFile);

    parent::tearDown();
  }

  /**
   * Tests that file uploads fail if the HTTPAV service is unavailble.
   */
  public function testMissingHttpavService() {
    $file = $this->testFile;

    $edit = [
      'files[file_test_upload][]' => $file,
    ];
    // Go to the file upload test form provided by govcms_file_test module.
    $this->drupalGet('govcms-file-test/save_upload_from_form_test');
    $this->submitForm($edit, 'Submit');

    $this->assertSession()->pageTextContains('The anti-virus scanner could not check the file, the file cannot be uploaded.');
    $this->assertSession()->pageTextContains('Epic upload FAIL!');
    $this->assertFileDoesNotExist('temporary://' . basename((string) $file));
  }

}
