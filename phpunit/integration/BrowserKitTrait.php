<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration;

use Behat\Mink\Driver\BrowserKitDriver;
use Behat\Mink\Driver\DriverInterface;
use Behat\Mink\Element\DocumentElement;
use Behat\Mink\Mink;
use Behat\Mink\Selector\SelectorsHandler;
use Behat\Mink\Session;
use Drupal\Tests\DrupalTestBrowser;
use Drupal\Tests\HiddenFieldSelector;
use Drupal\Tests\XdebugRequestTrait;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides a browser trait for shared test setup functionality.
 */
trait BrowserKitTrait {
  use XdebugRequestTrait;

  protected ?Mink $mink;
  protected DriverInterface $driver;
  protected string $baseUrl;

  /**
   * Gets the Mink session.
   *
   * @param string|null $name
   *   The session name. If not provided, the default session will be returned.
   *
   * @return \Behat\Mink\Session
   *   The Mink session.
   */
  protected function getSession(?string $name = null): Session {
    return $this->mink->getSession($name);
  }

  /**
   * Returns the driver instance.
   *
   * @return \Behat\Mink\Driver\DriverInterface
   *   The driver instance.
   */
  protected function getDriverInstance(): DriverInterface {
    if (!isset($this->driver)) {
      $client = new DrupalTestBrowser();
      $client->followMetaRefresh();
      $this->driver = new BrowserKitDriver($client);
    }
    return $this->driver;
  }

  /**
   * Gets the current page.
   *
   * @return \Behat\Mink\Element\DocumentElement
   *   The current page.
   */
  protected function getCurrentPage(): DocumentElement {
    return $this->getSession()->getPage();
  }

  /**
   * Gets the content of the current page.
   *
   * @return string
   *   The content of the current page.
   */
  protected function getCurrentPageContent(): string {
    return $this->getCurrentPage()->getContent();
  }

  /**
   * Sets-up a Mink session.
   */
  protected function setupMinkSession(): void
  {
    if (empty($this->baseUrl)) {
      $this->baseUrl = getenv('SIMPLETEST_BASE_URL') ?: 'http://localhost';
    }

    $driver = $this->getDriverInstance();
    $selectors_handler = new SelectorsHandler([
      'hidden_field_selector' => new HiddenFieldSelector(),
    ]);
    $session = new Session($driver, $selectors_handler);
    $this->mink = new Mink([
      'default' => $session,
    ]);
    $this->mink->setDefaultSessionName('default');
    $session->start();

    // Create the artifacts directory if necessary.
    $output_dir = getenv('BROWSERTEST_OUTPUT_DIRECTORY');
    if ($output_dir && !is_dir($output_dir)) {
      mkdir($output_dir, 0777, true);
    }

    if ($driver instanceof BrowserKitDriver) {
      // Inject a Guzzle middleware to generate debug output for every request
      // performed in the test.

      // Turn off curl timeout. Having a timeout is not a problem in a normal
      // test running, but it is a problem when debugging. Also, disable SSL
      // peer verification so that testing under HTTPS always works.
      $handler_stack = HandlerStack::create();
      $handler_stack->push($this->getResponseLogHandler());
      $client = new Client(['timeout' => null, 'verify' => false, 'handler' => $handler_stack]);
      $driver->getClient()->setClient($client);
    }

    // According to the W3C WebDriver specification a cookie can only be set if
    // the cookie domain is equal to the domain of the active document. When the
    // browser starts up the active document is not our domain but 'about:blank'
    // or similar. To be able to set our User-Agent and Xdebug cookies at the
    // start of the test we now do a request to the front page so the active
    // document matches the domain.
    // @see https://w3c.github.io/webdriver/webdriver-spec.html#add-cookie
    // @see https://www.w3.org/Bugs/Public/show_bug.cgi?id=20975
    $this->visit($this->baseUrl . '/core/misc/druplicon.png');

    // Copies cookies from the current environment, for example, XDEBUG_SESSION
    // in order to support Xdebug.
    $cookies = $this->extractCookiesFromRequest(Request::createFromGlobals());
    if (isset($cookies['XDEBUG_SESSION'][0])) {
      $session->setCookie('XDEBUG_SESSION', $cookies['XDEBUG_SESSION'][0]);
    }
  }

  /**
   * Stops the Mink session.
   */
  protected function tearDownMinkSession(): void {
    $this->getSession()->stop();
    // Avoid leaking memory in test cases (which are retained for a long time)
    // by removing references to all the things.
    $this->mink = null;
  }

  /**
   * Visits the specified URL.
   *
   * @param string $url
   *   The URL to visit. If the URL does not contain a scheme, the base URL will be prepended.
   */
  protected function visit(string $url): void {
    if (!parse_url($url, PHP_URL_SCHEME)) {
      $url = $this->baseUrl . $url;
    }
    $this->getSession()->visit($url);
  }

}
