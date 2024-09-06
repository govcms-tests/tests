<?php

declare(strict_types=1);

namespace GovCMS\Tests\Integration\GovCMS\Security\Functional;

use GovCMS\Tests\Integration\GovCMS\Baseline\Functional\GovCMSTestBase;

class PasswordPolicyTest extends GovCMSTestBase {

    const MSG_LENGTH_ERROR = 'Password length must be at least 14 characters.';

    const MSG_CHARACTER_TYPE_ERROR = 'Password must contain at least 3 types of characters from'
        . ' the following character types: lowercase letters, uppercase letters,'
        . ' digits, special characters.';

    const MSG_PREVIOUS_PASSWD_ERROR = 'Previous passwords cannot be reused. Choose a different password.';
    /**
     * {@inheritdoc}
     */
    protected function setUp(): void {
        parent::setUp();
        $user = $this->drupalCreateUser([
            'administer users',
        ]);
        $this->drupalLogin($user);
    }

    protected function createUserWithPassword(string $password): void {
        $this->drupalGet('admin/people/create');
        $edit = [
            'name' => 'test-user',
            'pass[pass1]' => $password,
            'pass[pass2]' => $password,
        ];
        $this->submitForm($edit, 'Create new account');
    }

    protected function assertUserCreation(): void {
        $this->assertSession()->responseContains('Created a new user account');
    }

    public function testMinimumPasswordLength(): void {
        $this->createUserWithPassword('Aa1.');
        $this->assertSession()->responseContains(self::MSG_LENGTH_ERROR);

        // Test that meeting the length requirement now passes the test.
        $this->createUserWithPassword('Aa1.12345678910');
        $this->assertUserCreation();
    }

    public function testMinimumNumberCharacterTypes(): void {
        $this->createUserWithPassword('12345678901234');
        $this->assertSession()->responseContains(self::MSG_CHARACTER_TYPE_ERROR);

        // Test only two character types.
        $this->createUserWithPassword('1234567890123A');
        $this->assertSession()->responseContains(self::MSG_CHARACTER_TYPE_ERROR);

        // Test three character types.
        $this->createUserWithPassword('123456789012Aa');
        $this->assertUserCreation();
    }


    public function testResetingToPreviousPassword() {
        $this->createUserWithPassword('123456789012Aa');
        $this->assertUserCreation();

        $testUser = user_load_by_name('test-user');
        $id = $testUser->id();

        $this->drupalGet("user/{$id}/edit");
        $edit = [
            'pass[pass1]' => '123456789012Aa',
            'pass[pass2]' => '123456789012Aa',
        ];
        $this->submitForm($edit, 'Save');
        $this->assertSession()->responseContains('The password does not satisfy the password policies.');
        $this->assertSession()->responseContains(self::MSG_PREVIOUS_PASSWD_ERROR);
    }
}
