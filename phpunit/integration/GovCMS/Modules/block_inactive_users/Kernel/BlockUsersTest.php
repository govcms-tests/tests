<?php

namespace GovCMS\Tests\Integration\GovCMS\block_inactive_users\Kernel;

use Drupal\Tests\block_inactive_users\Kernel\BlockUsersTest as BaseBlockUsersTest;

/**
 * Checks that automatic block of old users works as expected.
 *
 * @group block_inactive_users
 * @group govcms
 */

class BlockUsersTest extends BaseBlockUsersTest {

    // Use the GovCMS profile
    protected $profile = 'govcms';

    /**
     * {@inheritdoc}
     */
    protected function setUp(): void {
        parent::setUp();
    }
}
