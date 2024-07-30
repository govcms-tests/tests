<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration\GovCMS\Baseline\Functional;

use Drupal\Tests\BrowserTestBase;

abstract class GovCMSTestBase extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['govcms_security'];

  /**
   * The installation profile to use with this test.
   *
   * @var string
   */
  protected $profile = 'govcms';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
      parent::setUp();
  }
}
