SERVICE_NAME ?= card-studio-backend
SERVER_DIR ?= $(abspath server)
SYSTEMD_DIR ?= /etc/systemd/system
SERVICE_FILE := $(SYSTEMD_DIR)/$(SERVICE_NAME).service
TEMPLATE := systemd/card-studio.service.template

.PHONY: install-service uninstall-service

install-service:
	@echo "Installing systemd service to $(SERVICE_FILE)"
	@sed "s|__SERVER_DIR__|$(SERVER_DIR)|g; s|__SERVICE_NAME__|$(SERVICE_NAME)|g" $(TEMPLATE) | sudo tee $(SERVICE_FILE) > /dev/null
	@sudo systemctl daemon-reload
	@sudo systemctl enable --now $(SERVICE_NAME)

uninstall-service:
	@sudo systemctl disable --now $(SERVICE_NAME) || true
	@sudo rm -f $(SERVICE_FILE)
	@sudo systemctl daemon-reload
