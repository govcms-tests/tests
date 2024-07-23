<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration;

use Drupal\Tests\block\Traits\BlockCreationTrait;
use Drupal\Tests\node\Traits\ContentTypeCreationTrait;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\RandomGeneratorTrait;
use Drupal\Tests\UiHelperTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;
use PHPUnit\Framework\TestCase;

/**
 * Provides a test case for existing GovCMS site tests.
 */
abstract class ExistingSiteBase extends TestCase {

  use BlockCreationTrait {
    placeBlock as drupalPlaceBlock;
  }
  use ContentTypeCreationTrait {
    createContentType as drupalCreateContentType;
  }
  use NodeCreationTrait {
    getNodeByTitle as drupalGetNodeByTitle;
    createNode as drupalCreateNode;
  }
  use RandomGeneratorTrait;
  use UiHelperTrait;
  use UserCreationTrait {
    createRole as drupalCreateRole;
    createUser as drupalCreateUser;
  }

  use DrupalTrait;
  use BrowserKitTrait;

  /**
   * The database prefix.
   *
   * @var string
   */
  protected string $databasePrefix;

  /**
   * Indicates if the Shield module was enabled before the test.
   *
   * @var bool
   */
  protected bool $wasShieldEnabled;

  /**
   * {@inheritdoc}
   * @throws \Exception
   */
  protected function setUp(): void {
    parent::setUp();

    $this->setupMinkSession();
    $this->setupDrupal();

    // Check if the Shield module is enabled and disable it if it is.
    $shieldConfig = $this->config('shield.settings');
    $this->wasShieldEnabled = $shieldConfig->get('shield_enable');

    if ($this->wasShieldEnabled) {
      $shieldConfig->set('shield_enable', FALSE)->save();
    }
  }

  /**
   * Gets the configuration object.
   *
   * @param string $name
   *   The name of the configuration object.
   *
   * @return \Drupal\Core\Config\Config
   *   The configuration object.
   * @throws \Exception
   */
  protected function config(string $name): \Drupal\Core\Config\Config {
    return $this->container->get('config.factory')->getEditable($name);
  }

  /**
   * {@inheritdoc}
   */
  protected function tearDown(): void {
    // Re-enable the Shield module if it was originally enabled.
    if ($this->wasShieldEnabled) {
      $this->config('shield.settings')->set('shield_enable', TRUE)->save();
    }

    parent::tearDown();

    $this->tearDownDrupal();
    $this->tearDownMinkSession();
  }

  /**
   * Prepares the request for the test case.
   *
   * Override this method to modify the request before it is handled.
   */
  protected function prepareRequest() {}

}
