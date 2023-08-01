/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
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
