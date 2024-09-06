<?php

$metadata['http://localhost:8888'] = [
    'entityID' => 'http://localhost:8888',
    'SingleLogoutService' => [
        [
            'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
            'Location' => 'http://localhost:8888/simplesaml/module.php/saml/sp/saml2-logout.php/default-sp',
        ],
        [
            'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:SOAP',
            'Location' => 'http://localhost:8888/simplesaml/module.php/saml/sp/saml2-logout.php/default-sp',
        ],
    ],
    'AssertionConsumerService' => [
        [
            'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
            'Location' => 'http://localhost:8888/simplesaml/module.php/saml/sp/saml2-acs.php/default-sp',
            'index' => 0,
        ],
        [
            'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact',
            'Location' => 'http://localhost:8888/simplesaml/module.php/saml/sp/saml2-acs.php/default-sp',
            'index' => 1,
        ],
    ],
];
