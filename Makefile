.PHONY: buildx-setup build-php build-ci test-php test-ci push-php push-ci php ci all release-php release-ci release-all examples

# Default version variable
VERSION ?= latest

# PHP versions
PHP_VERSIONS := 8.3

# Supported architectures
ARCHS := linux/amd64,linux/arm64,linux/arm/v7,linux/arm/v8
CI_ARCHS := linux/amd64,linux/arm64

# Target to create and use Buildx builder if it doesn't already exist
buildx-setup:
	@echo "Setting up Docker Buildx"
	@if [ -z "$$(docker buildx ls | grep -w "govcms-tests" | head -n 1)" ]; then \
		echo "Creating new builder: govcms-tests"; \
		docker buildx create --name govcms-tests --use; \
	else \
		echo "Using existing builder: govcms-tests"; \
		docker buildx use govcms-tests; \
	fi
	docker buildx inspect --bootstrap

# Generic targets for building, testing, and pushing images
define make-targets
build-$(1)-%: buildx-setup
	@echo "Building Docker image for govcmstesting/$(1) with PHP $$*"
	docker buildx build --load --build-arg PHP_VERSION=$$* -t govcmstesting/$(1):$(VERSION)-php$$*$(2) -f $$(if $(filter $(1),ci),Dockerfile.ci,Dockerfile) .

test-$(1)-%:
	@echo "Testing Docker image for govcmstesting/$(1) with PHP $$*"
	$$(if $(filter $(1),ci),docker run --rm govcmstesting/$(1):$(VERSION)-php$$*$(2) php -v,@echo "Skipping test for govcmstesting/$(1) with PHP $$*")

push-$(1)-%: buildx-setup
	@echo "Pushing Docker image for govcmstesting/$(1) with PHP $$*"
	docker buildx build --push --build-arg PHP_VERSION=$$* --platform $(4) -t govcmstesting/$(1):$(VERSION)-php$$*$(2) $$(if $(filter $(1),tests),-t govcmstesting/$(1):latest-php$$*) -f $$(if $(filter $(1),ci),Dockerfile.ci,Dockerfile) .
endef

# Apply make-targets for tests and ci with architectures
$(eval $(call make-targets,tests,,, $(ARCHS)))
$(eval $(call make-targets,ci,-apache,.ci, $(CI_ARCHS)))

# Aggregate targets
tests: $(foreach v,$(PHP_VERSIONS),build-tests-$(v) test-tests-$(v))
ci: $(foreach v,$(PHP_VERSIONS),build-ci-$(v) test-ci-$(v))
all: tests ci

# Release targets
release-ci: $(foreach v,$(PHP_VERSIONS),release-ci-$(v))
release-tests: $(foreach v,$(PHP_VERSIONS),release-tests-$(v))
release-all: release-ci release-tests

# Individual release targets
define release-target
release-$(1)-$(2): build-$(1)-$(2) test-$(1)-$(2) push-$(1)-$(2)
endef

$(foreach type,tests ci,$(foreach v,$(PHP_VERSIONS),$(eval $(call release-target,$(type),$(v)))))

# Examples
examples:
	@echo "Examples of how to use this Makefile:"
	@echo "1. Build PHP 8.3 image for tests:"
	@echo "   make build-tests-8.3"
	@echo "2. Test CI image for PHP 8.3:"
	@echo "   make test-ci-8.3"
	@echo "3. Push PHP 8.3 image for tests:"
	@echo "   make push-tests-8.3"
	@echo "4. Build all PHP versions for tests and CI:"
	@echo "   make all"
	@echo "5. Release all images:"
	@echo "   make release-all"
	@echo "6. Build, test, and push PHP 8.3 CI image:"
	@echo "   make release-ci-8.3"
	@echo "7. Build, test, and push PHP 8.3 tests image:"
	@echo "   make release-tests-8.3"
	@echo "8. Release a specific version (e.g., v1.0.0) for PHP 8.3 CI image:"
	@echo "   make VERSION=1.0.0 release-ci-8.3"
	@echo "9. Release a specific version (e.g., v1.0.0) for PHP 8.3 tests image:"
	@echo "   make VERSION=1.0.0 release-tests-8.3"
	@echo "10. Release a specific version (e.g., v1.0.0) for all images:"
	@echo "   make VERSION=1.0.0 release-all"
