<?php

namespace GovCMS\Tests\Integration\GovCMS\Modules\Minisite\Functional;

use Drupal\Tests\minisite\Functional\FieldValidationTest as BaseFieldValidationTest;

/**
 * Test class for Minisite functionality with GovCMS profile.
 *
 * @group govcms
 * @group minisite
 */
class MinisiteFieldValidationTest extends BaseFieldValidationTest {

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
