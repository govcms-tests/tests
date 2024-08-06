<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration\GovCMS\Modules\event_log_track\Functional;

use Drupal\Tests\event_log_track\Functional\EventsLogConfigChangeTest as BaseEventsLogTrackTest;

/**
 * Test class for Event log track test functionality with GovCMS profile.
 *
 * @group govcms
 * @group eventlogtrack
 */
class EventsLogTrackTest extends BaseEventsLogTrackTest {

  // Use the GovCMS profile
  protected $profile = 'govcms';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
  }

}
