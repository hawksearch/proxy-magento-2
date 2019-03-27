define([
        'jquery',
        'matchMedia',
        'jquery/ui'
    ],
    function ($, mediaCheck) {
        $.widget(
            'mage.quickSearch',
            {
                options: {
                    isExpandable: null,
                    searchLabel: '[data-role=minisearch-label]',
                },
                _create: function () {
                    this.searchForm = $(this.options.formSelector);
                    this.searchLabel = this.searchForm.find(this.options.searchLabel);

                    mediaCheck({
                        media: '(max-width: 768px)',
                        entry: function () {
                            this.isExpandable = true;
                        }.bind(this),
                        exit: function () {
                            this.isExpandable = false;
                            this.element.removeAttr('aria-expanded');
                        }.bind(this)
                    });

                    this.searchLabel.on('click', function (e) {
                        // allow input to lose its' focus when clicking on label
                        if (this.isExpandable && this.isActive()) {
                            e.preventDefault();
                        }
                    }.bind(this));

                    this.element.on('blur', $.proxy(function () {
                        if (!this.searchLabel.hasClass('active')) {
                            return;
                        }
                        setTimeout($.proxy(function () {
                            this.setActiveState(false);
                            this._updateAriaHasPopup(false);
                        }, this), 250);
                    }, this));

                    this.element.on('focus', this.setActiveState.bind(this, true));
                },
                setActiveState: function (isActive) {
                    this.searchForm.toggleClass('active', isActive);
                    this.searchLabel.toggleClass('active', isActive);

                    if (this.isExpandable) {
                        this.element.attr('aria-expanded', isActive);
                    }
                },
                isActive: function () {
                    return this.searchLabel.hasClass('active');
                },
                _updateAriaHasPopup: function (show) {
                    if (show) {
                        this.element.attr('aria-haspopup', 'true');
                    } else {
                        this.element.attr('aria-haspopup', 'false');
                    }
                }
            }
        );
        return $.mage.quickSearch;

    });
