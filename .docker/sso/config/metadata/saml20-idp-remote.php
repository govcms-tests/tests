<?php

$metadata['http://localhost:8888/saml-idp'] = [
    'metadata-set' => 'saml20-idp-hosted',
    'entityid' => 'http://localhost:8888/saml-idp',
    'SingleSignOnService' => [
        [
            'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
            'Location' => 'http://localhost:8888/simplesaml/module.php/saml/idp/singleSignOnService',
        ],
    ],
    'SingleLogoutService' => [
        [
            'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
            'Location' => 'http://localhost:8888/simplesaml/module.php/saml/idp/singleLogout',
        ],
    ],
    'NameIDFormat' => [
        'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    ],
    'certData' => 'MIIDfTCCAmWgAwIBAgIUcHwnPsr7V3beQ10PeEAyobYwamcwDQYJKoZIhvcNAQELBQAwTjELMAkGA1UEBhMCQVUxDDAKBgNVBAgMA0FDVDERMA8GA1UEBwwIQ2FuYmVycmExHjAcBgNVBAoMFURlcGFydG1lbnQgb2YgRmluYW5jZTAeFw0yNDA3MjYwNjA1NDRaFw0yNTA3MjYwNjA1NDRaME4xCzAJBgNVBAYTAkFVMQwwCgYDVQQIDANBQ1QxETAPBgNVBAcMCENhbmJlcnJhMR4wHAYDVQQKDBVEZXBhcnRtZW50IG9mIEZpbmFuY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC4LA3NEQ3UW0v3t9Iim/doR+/LWsEyTd0WUTYIdQUDzY3YNLNLPT3XVfV58sXaAkZfW7KmsY8KnBFLQJ992lCe5YWfH5LYlvF+LWsvWzWesXBs4BJKA0GZKAzXz12uhG/kdcyVNoLH4F9XQ/YBHaZb4a9iwlY+eTpOLLTtBnSBShIPM/vVqRyXeTuQke50omPtNbOH9ueSRyoxeJOv93TucFjV4XFWODVAt1StbWz+FulrUDsbeO44UjTLOydPWmloHyq8T3slwHHi+PEqm8wYbijdv++yLcG3qppLFgu6gzNiiQ8I8J+MuMKtbQ7OnBGu8+LMA9S9fcIAE86EmKExAgMBAAGjUzBRMB0GA1UdDgQWBBQnFvP5y+8LS8QNtw+E+awVwYU6mzAfBgNVHSMEGDAWgBQnFvP5y+8LS8QNtw+E+awVwYU6mzAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQB32S+kA0Bckog+hO8XEsb0TDOluZd4oefZfe56JwEV9+xIgd3/mVm0c98YmNLrGKa0QI2qMeMycnui0eC/TKn3g6szXu3RhDEzYLQjDcvvW4MjM5LtI4Rx6eEj513uSz16rayRzNplkV2mxHCoAC86DlNnVbRK4kwgRz824OyZ6xV9ck0hWnU9cit0+hphEzW6VAHrydti08P+hSyPWg2xqitz2eGK4faivoXG01IOcE6Tu8X/sqkL66jb0dxvcYJ3qpEMBJrMXIzkSgLJDwcqVREcfzPHxz11vmgCyuX7Y2pTNsoIvHhE4mkszRF2ZaGJ8rti+yV4xuj/huPDW+n6',
];
