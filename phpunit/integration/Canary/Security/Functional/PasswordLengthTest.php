<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration\Canary\Security\Functional;

use GovCMS\Tests\Integration\ExistingSiteBase;

/**
 * Tests password length requirement for user.
 *
 * @group security
 * @group canary
 */
class PasswordLengthTest extends ExistingSiteBase {

  /**
   * {@inheritdoc}
   */
  protected $profile = 'govcms';

  /**
   * Tests that the password length must be at least 14 characters.
   */
  public function testPasswordLengthRequirement() {
    $user = $this->drupalCreateUser([
      'administer users',
    ]);
    $this->drupalLogin($user);

    // Test user creation page for valid password length.
    $name = $this->randomMachineName();
    $edit = [
      'name' => $name,
      'mail' => $this->randomMachineName() . '@example.com',
      'pass[pass1]' => $pass = $this->randomString(13),
      'pass[pass2]' => $pass,
      'notify' => FALSE,
    ];

    $this->drupalGet('admin/people/create');
    $this->submitForm($edit, 'Create new account');
    $this->assertSession()->pageTextContains('The password does not satisfy the password policies.');
    $this->assertSession()->pageTextContains('Password length must be at least 14 characters.');
  }

  /**
   * {@inheritdoc}
   */
  #[Override]
  protected function setUp(): void {
    parent::setUp();
    // Set up the test here.
  }

}