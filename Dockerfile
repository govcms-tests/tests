# Stage 1: Build stage
FROM govcmstesting/php:8.2-cli as builder

# Set the working directory
WORKDIR /tests

# Copy only the necessary files for dependency installation
COPY composer.json composer.lock ./

# Install PHP dependencies using Composer
RUN --mount=type=cache,mode=0777,target=/root/.composer/cache composer install --no-scripts --no-autoloader

# Copy the rest of the application files
COPY . .

# Install Composer dependencies, generate autoloader, and run other build tasks
RUN composer install --no-dev --optimize-autoloader

# Stage 2: Final stage
FROM alpine:3

WORKDIR /tests/

COPY --from=builder /tests .

# The final image contains the build artifacts