<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration;

use Drupal\Core\DrupalKernel;
use Symfony\Component\HttpFoundation\Request;
use Composer\Autoload\ClassLoader;

/**
 * Provides a trait for shared test setup functionality.
 */
trait DrupalTrait {

  /**
   * The base URL.
   *
   * @var string
   */
  protected string $baseUrl;

  /**
   * The class loader to use for installation and initialization of setup.
   *
   * @var ClassLoader
   */
  protected ClassLoader $classLoader;

  /**
   * The container.
   *
   * @var \Drupal\Core\DependencyInjection\ContainerBuilder
   */
  protected $container;

  /**
   * The Drupal kernel.
   *
   * @var DrupalKernel
   */
  protected DrupalKernel $kernel;

  /**
   * A flag to track when we've restored the error handler.
   *
   * @var bool
   */
  protected static bool $restoredErrorHandler = false;

  /**
   * Bootstrap Drupal.
   */
  protected function setupDrupal(): void {
    // Retrieve the base URL from the environment variable and set it globally.
    global $base_url;
    $base_url = getenv('SIMPLETEST_BASE_URL') ?: 'http://localhost';
    $this->baseUrl = $base_url;

    // Include the class loader.
    $this->classLoader = require '/app/web/autoload.php';

    // Parse the base URL.
    $parsedUrl = parse_url($this->baseUrl);
    $host = $parsedUrl['host'] . (isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '');
    $path = isset($parsedUrl['path']) ? rtrim($parsedUrl['path'], '/') : '';
    $port = $parsedUrl['port'] ?? 80;

    // Set up server variables.
    $server = [
      'HTTP_HOST' => $host,
      'SERVER_PORT' => $port,
      'REQUEST_URI' => $path . '/',
      'SCRIPT_FILENAME' => $path . '/index.php',
      'SCRIPT_NAME' => $path . '/index.php',
      'PHP_SELF' => $path . '/index.php',
    ];

    // Adjust server variables for HTTPS if necessary.
    if ($parsedUrl['scheme'] === 'https') {
      $server['HTTPS'] = 'on';
    }

    // Create the request object.
    $request = Request::create($this->baseUrl . '/', 'GET', [], [], [], $server);

    // Initialize the Drupal kernel.
    $this->kernel = DrupalKernel::createFromRequest($request, $this->classLoader, 'prod', TRUE, DRUPAL_ROOT);

    // The DrupalKernel only initializes the environment once which is where
    // it sets the Drupal error handler. We can therefore only restore it
    // once.
    if (!static::$restoredErrorHandler) {
      restore_error_handler();
      restore_exception_handler();
      static::$restoredErrorHandler = true;
    }

    // Change the working directory to Drupal root and boot the kernel.
    chdir(DRUPAL_ROOT);
    $this->kernel->boot();
    $this->kernel->preHandle($request);
    $this->container = $this->kernel->getContainer();
  }

  /**
   * Delete test data.
   */
  protected function tearDownDrupal(): void {
    // Invalidate cache.
    \Drupal::service('cache_tags.invalidator')->resetChecksums();

    // Destroy the testing kernel.
    if (isset($this->kernel)) {
      $this->kernel->shutdown();
    }

    \Drupal::unsetContainer();
    $this->container = NULL;
  }

}
