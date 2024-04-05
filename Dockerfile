# Define a build argument for PHP version, defaulting to 8.1 if not provided
ARG PHP_VERSION=8.1

# Stage 1: Build stage
# Use the build argument to specify the PHP version in the base image
FROM govcmstesting/php:${PHP_VERSION}-cli as builder

# Set the working directory
WORKDIR /tests

# Copy only the necessary files for dependency installation
COPY composer.json ./

# Install PHP dependencies using Composer
RUN --mount=type=cache,mode=0777,target=/root/.composer/cache composer update --no-scripts --no-autoloader

# Copy the rest of the application files
COPY . .

# Install Composer dependencies, generate autoloader, and run other build tasks
RUN composer install --no-dev --optimize-autoloader

# Stage 2: Final stage
FROM alpine:3

WORKDIR /tests/

COPY --from=builder /tests .
