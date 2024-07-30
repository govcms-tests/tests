<?php

namespace GovCMS\Tests\Integration\GovCMS\Security\Functional;

use Drupal\Tests\honeypot\Functional\HoneypotAdminFormTest;

/**
 * Test class for Honeypot functionality with GovCMS profile.
 */
class HoneypotAdminTest extends HoneypotAdminFormTest {

  /**
   * The installation profile to use with this test.
   *
   * @var string
   */
  protected $profile = 'govcms';

  /**
   * Overrides setUp to ensure GovCMS profile is used.
   */
  #[\Override]
  protected function setUp(): void {
    parent::setUp();
  }

}
