<?php

namespace GovCMS\Tests\Integration\GovCMS\Modules\event_log_track\Functional;

use Drupal\Tests\event_log_track\Functional\EventsLogConfigChangeTest;

/**
 * Test class for Event log track test functionality with GovCMS profile.
 *
 * @group govcms
 * @group events_log_track
 */
class BaseEventsLogTrackTest extends EventsLogConfigChangeTest {

    // Use the GovCMS profile
    protected $profile = 'govcms';

    /**
     * Overrides setUp to ensure GovCMS profile is used.
     */
    protected function setUp(): void {
        parent::setUp();
    }
}
