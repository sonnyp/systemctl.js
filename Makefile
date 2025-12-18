SHELL:=/bin/bash -O globstar
.PHONY: setup lint unit
.DEFAULT_GOAL := setup

setup:
	npm install

lint:

unit:
	node --test systemctl.test.js

unit-setup:
	sudo cp polkit.js /etc/polkit-1/rules.d/re.sonny.systemctl.rules
	sudo cp re.sonny.systemctl.js /tmp/re.sonny.systemctl
	sudo cp re.sonny.systemctl.ini /etc/systemd/system/re.sonny.systemctl.service
	sudo systemctl daemon-reload

unit-teardown:
	sudo rm -f /etc/polkit-1/rules.d/re.sonny.systemctl.rules
	sudo rm -f /tmp/re.sonny.systemctl
	sudo rm -f /etc/systemd/system/re.sonny.systemctl.system

test: lint unit-setup unit unit-teardown
