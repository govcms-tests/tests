# Stage 1: Build stage
ARG PHP_VERSION=8.4
FROM govcmstesting/php:${PHP_VERSION}-cli AS builder

# Set the working directory
WORKDIR /tests

# Copy only necessary files and directories explicitly
COPY behat/ behat/
COPY cy/ cy/
COPY phpunit/ phpunit/
COPY phpcs.govcms.xml phpcs.govcms.xml
COPY phpcs.xml phpcs.xml

# Copy only the necessary files for dependency installation
COPY composer.json ./

# Install PHP dependencies using Composer
RUN --mount=type=cache,mode=0777,target=/root/.cache composer update --no-dev --optimize-autoloader

# Stage 2: Final stage
FROM scratch

WORKDIR /tests/

COPY --from=builder /tests /tests