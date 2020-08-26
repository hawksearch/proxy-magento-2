/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'uiComponent',
    'jquery',
    'mage/mage',
    'mage/decorate'
], function (Component, $) {
    'use strict';

    var sidebarInitialized = false;

    /**
     * Initialize sidebar
     */
    function initSidebar() {
        if (sidebarInitialized) {
            return;
        }

        sidebarInitialized = true;
        $('[hawksearch-featured-products-sidebar]').decorate('list', true);
    }

    return Component.extend({
        /** @inheritdoc */
        initialize: function () {
            this._super();
            this.hawksearchFeaturedProducts = this.data;

            initSidebar();
        },

        test: function() {
            return {
                'count': 2,
                'countCaption': '2 items',
                'listUrl': 'http://google.com',
                'items': this.items
            };
        }
    });
});
