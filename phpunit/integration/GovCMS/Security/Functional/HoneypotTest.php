<?php

namespace GovCMS\Tests\Integration\GovCMS\Security\Functional;

use Drupal\Tests\honeypot\Functional\HoneypotFormTest;

/**
 * Test class for Honeypot functionality with GovCMS profile.
 */
class HoneypotTest extends HoneypotFormTest {

  /**
   * The installation profile to use with this test.
   *
   * @var string
   */
  protected $profile = 'govcms';

  /**
   * Skips the testProtectRegisterUserNormal test.
   *
   * @return void
   */
  #[\Override]
  public function testProtectRegisterUserNormal(): void {
    $this->markTestSkipped('This test is skipped in GovCMS profile.');
  }

  /**
   * Overrides setUp to ensure GovCMS profile is used.
   */
  #[\Override]
  protected function setUp(): void {
    parent::setUp();
  }

}