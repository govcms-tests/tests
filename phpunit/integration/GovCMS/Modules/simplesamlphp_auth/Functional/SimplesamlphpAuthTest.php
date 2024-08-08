<?php
namespace GovCMS\Tests\Integration\GovCMS\Modules\simplesamlphp_auth\Functional;

use GovCMS\Tests\Integration\GovCMS\Baseline\Functional\GovCMSTestBase;

/**
 * Test the simplesamlphp_auth module's specific configurations.
 *
 * @group simplesamlphp_auth
 * @group govcms
 */
class SimplesamlphpAuthTest extends GovCMSTestBase {

    /**
     * Modules to enable during the test.
     *
     * This property specifies the modules that should be enabled for this test class.
     * The testing framework ensures these modules are available and enabled before the tests are run.
     * If the module is not available, the test will be skipped.
     *
     * @var array
     */
    public static $modules = ['simplesamlphp_auth'];

    /**
     * {@inheritdoc}
     *
     * This method is called before each test method to set up the necessary environment.
     * It ensures a clean state by logging out any currently logged-in user, then creates
     * a new user with the necessary permissions and logs them in.
     */
    protected function setUp(): void {
        // TODO: Remove this skip test once the module and configs are integrated into the distro.
        $this->markTestSkipped();
        
        parent::setUp();

        // Log out any currently logged-in user to ensure a clean state.
        if (\Drupal::currentUser()->isAuthenticated()) {
            $this->drupalLogout();
        }

        // Create a user with specific permissions and log them in.
        $user = $this->drupalCreateUser([
            'administer simplesamlphp authentication',
        ]);
        $this->drupalLogin($user);
    }

    /**
     * Test disallowing SAML users to set Drupal passwords.
     *
     * This test verifies that the configuration setting for disallowing SAML users
     * from setting Drupal passwords is correctly set to false and that the user
     * interface does not provide an option for these users to set passwords.
     */
    public function testDisallowDrupalPasswordSetting() {
        // Retrieve the current configuration for the simplesamlphp_auth module.
        $config = \Drupal::config('simplesamlphp_auth.settings');
        $set_drupal_pwd = $config->get('set_drupal_pwd');

        // Assert that the setting is false, meaning SAML users cannot set Drupal passwords.
        $this->assertFalse($set_drupal_pwd, 'SAML users should not be allowed to set Drupal passwords.');

        // Check the user login form to ensure the option to set a Drupal password is not available.
        $this->drupalGet('user/login');
        $this->assertSession()->elementNotExists('css', 'input#edit-allow-drupal-password-setting');
    }

    /**
     * Test hiding the Federated Login link on the user login form.
     *
     * This test checks that the configuration setting for showing the Federated Login link
     * is set to false, and confirms that the link is not displayed on the user login page.
     */
    public function testHideFederatedLoginLink() {
        // Retrieve the current configuration for the simplesamlphp_auth module.
        $config = \Drupal::config('simplesamlphp_auth.settings');
        $login_link_show = $config->get('login_link_show');

        // Assert that the setting is false, meaning the Federated Login link should be hidden.
        $this->assertFalse($login_link_show, 'The Federated Login link should be hidden.');

        // Check the user login form to ensure the Federated Login link is not displayed.
        $this->drupalGet('user/login');
        $this->assertSession()->elementNotExists('css', 'a#federated-login-link');
    }

    /**
     * Test that auto-provisioning (automatic registration) of users is disabled.
     *
     * This test ensures that the auto-provisioning feature, which automatically registers
     * SSO users in Drupal, is disabled.
     */
    public function testAutoProvisioningDisabled() {
        // Retrieve the current configuration for the simplesamlphp_auth module.
        $config = \Drupal::config('simplesamlphp_auth.settings');
        $register_users = $config->get('register_users');

        // Assert that the setting is false, meaning auto-provisioning of users is disabled.
        $this->assertFalse($register_users, 'Auto-provisioning of users should be disabled.');

        // Check that a non-existing SSO user is not automatically registered.
        $username = 'non_existing_user';
        $user_exists = user_load_by_name($username);
        $this->assertFalse($user_exists, 'SSO users should not be automatically registered.');
    }

    /**
     * Test that cookies are only transmitted over HTTPS.
     *
     * This test verifies that the module's configuration ensures cookies are transmitted
     * only over secure HTTPS connections.
     */
    public function testCookiesOnlyOverHttps() {
        // Retrieve the current configuration for the simplesamlphp_auth module.
        $config = \Drupal::config('simplesamlphp_auth.settings');
        $secure = $config->get('secure');

        // Assert that the setting is true, meaning cookies are only transmitted over HTTPS.
        $this->assertTrue($secure, 'Cookies should only be transmitted over HTTPS.');
    }

    /**
     * Test that cookies are set with the HttpOnly attribute.
     *
     * This test checks that cookies are configured with the HttpOnly attribute,
     * which prevents them from being accessed via JavaScript, enhancing security.
     */
    public function testCookiesHttpOnly() {
        // Retrieve the current configuration for the simplesamlphp_auth module.
        $config = \Drupal::config('simplesamlphp_auth.settings');
        $httponly = $config->get('httponly');

        // Assert that the setting is true, meaning cookies have the HttpOnly attribute set.
        $this->assertTrue($httponly, 'Cookies should be set with the HttpOnly attribute.');

        // Verify that the HttpOnly attribute is present in the Set-Cookie headers.
        $this->drupalGet('user/login');
        $cookies = $this->getSession()->getResponseHeaders()['set-cookie'];
        foreach ($cookies as $cookie) {
            $this->assertStringContainsString('HttpOnly', $cookie, 'Cookie should have the HttpOnly attribute set.');
        }
    }

}
