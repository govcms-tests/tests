<?php

$config = [
    /*
     * When multiple authentication sources are defined, you can specify one to use by default
     * in order to authenticate users. In order to do that, you just need to name it "default"
     * here. That authentication source will be used by default then when a user reaches the
     * SimpleSAMLphp installation from the web browser, without passing through the API.
     *
     * If you already have named your auth source with a different name, you don't need to change
     * it in order to use it as a default. Just create an alias by the end of this file:
     *
     * $config['default'] = &$config['your_auth_source'];
     */

    // This is a authentication source which handles admin authentication.
    'admin' => [
        // The default is to use core:AdminPassword, but it can be replaced with
        // any authentication source.

        'core:AdminPassword',
    ],

    'default-sp' => [
        'saml:SP',
        'entityID' => 'http://localhost:8888',
        'idp' => 'http://localhost:8888/saml-idp',
    ],

    'example-userpass' => [
        'exampleauth:UserPass',
        'users' => [
            'user1:user1pass' => [
                'uid' => ['1'],
                'eduPersonPrincipalName' => 'user1',
                'mail' => 'user1@example.com',
            ],
            'user2:user2pass' => [
                'uid' => ['2'],
                'eduPersonPrincipalName' => 'user2',
                'mail' => 'user2@example.com',
            ],
        ],
    ],
];
