/**
 * Copyright (c) 2022 Hawksearch (www.hawksearch.com) - All Rights Reserved
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
    'jquery',
    'Magento_Ui/js/lib/view/utils/bindings'
], function ($) {
    'use strict';

    HawkSearch.customEvent = function () {
        //HawkSearch.jQuery.fn.applyBindings = $.fn.applyBindings;
    }

    /**
     * Update Multiple wishlist widget on PLP after ajax content reloading
     */
    function triggerUpdateMultipleWishlist (widgetData) {
        $('.popup-tmpl').remove();
        $('.split-btn-tmpl').remove();
        $('#form-tmpl-multiple').replaceWith(widgetData);

        var wishlistWidget;
        wishlistWidget = $('body').data('mageMultipleWishlist');

        if (wishlistWidget !== undefined) {
            wishlistWidget.destroy();
        }
        var uiRegistry = require('uiRegistry');
        if (uiRegistry !== undefined) {
            uiRegistry.remove('multipleWishlist');
        }

        $('.page-wrapper').trigger('contentUpdated');
        $('#form-tmpl-multiple').trigger('contentUpdated');
    }

    /**
     * Update Requisition list widget on PLP after ajax content reloading
     */
    function triggerUpdateRequisitionList()  {
        var uiRegistry = require('uiRegistry');
        if (uiRegistry !== undefined) {
            $(uiRegistry.filter({
                "component": "Magento_RequisitionList/js/requisition/action/product/add"
            })).each(function () {
                uiRegistry.remove(this.index);
            });

            $(uiRegistry.filter({
                "component": "Magento_RequisitionList/js/requisition/list/edit"
            })).each(function () {
                uiRegistry.remove(this.index);
            });
        }

        $('.page-wrapper').trigger('contentUpdated');
        $('.block-requisition-list.social-button').applyBindings();
    }

    /**
     * Register processFacetsCopyValue hook
     */
    HawkSearchHooks.register('processFacetsCopyValue', function(json){
        triggerUpdateMultipleWishlist(json.multiple_wishlist);
        triggerUpdateRequisitionList();
        return json;
    });

    /**
     * Register processFacetsAfter hook
     */
    HawkSearchHooks.register('processFacetsAfter', function(json){
        $('#hawkitemlist').trigger('contentUpdated');
        return json;
    });

});
