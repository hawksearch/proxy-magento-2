﻿/*
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

HawkSearch.Dictionary = (function () {
    function Dictionary() {
        if (!(this instanceof Dictionary))
            return new Dictionary();
    }

    Dictionary.prototype.count = function () {
        var key,
            count = 0;

        for (key in this) {
            if (this.hasOwnProperty(key))
                count += 1;
        }
        return count;
    };

    Dictionary.prototype.keys = function () {
        var key,
            keys = [];

        for (key in this) {
            if (this.hasOwnProperty(key))
                keys.push(key);
        }
        return keys;
    };

    Dictionary.prototype.values = function () {
        var key,
            values = [];

        for (key in this) {
            if (this.hasOwnProperty(key))
                values.push(this[key]);
        }
        return values;
    };

    Dictionary.prototype.keyValuePairs = function () {
        var key,
            keyValuePairs = [];

        for (key in this) {
            if (this.hasOwnProperty(key))
                keyValuePairs.push({
                    Key: key,
                    Value: this[key]
                });
        }
        return keyValuePairs;
    };

    Dictionary.prototype.add = function (key, value) {
        this[key] = value;
    }

    Dictionary.prototype.clear = function () {
        var key,
            dummy;

        for (key in this) {
            if (this.hasOwnProperty(key))
                dummy = delete this[key];
        }
    }

    Dictionary.prototype.containsKey = function (key) {
        return this.hasOwnProperty(key);
    }

    Dictionary.prototype.containsValue = function (value) {
        var key;

        for (key in this) {
            if (this.hasOwnProperty(key) && this[key] === value)
                return true;
        }
        return false;
    }

    Dictionary.prototype.remove = function (key) {
        var dummy;

        if (this.hasOwnProperty(key)) {
            dummy = delete this[key];
            return true;
        } else
            return false;
    }

    return Dictionary;
}());

HawkSearch.ContextObj = function () {
};
HawkSearch.ContextObj.prototype = new HawkSearch.Dictionary();
HawkSearch.ContextObj.prototype.Custom = new HawkSearch.Dictionary();
HawkSearch.Context = new HawkSearch.ContextObj();

(function (HawkSearchLoader, undefined) {
    var jQuery;

    //if true, HawkSearch's jQuery will be loaded dynamically in noConflict mode.
    HawkSearchLoader.loadjQuery = (HawkSearch.loadjQuery === undefined ? true : HawkSearch.loadjQuery);

    //if true, some messages will be sent to the console.
    HawkSearchLoader.debugMode = (HawkSearch.debugMode === undefined ? false : HawkSearch.debugMode);

    //if true, will disable AJAX.
    HawkSearchLoader.disableAjax = (HawkSearch.disableAjax === undefined ? false : HawkSearch.disableAjax);

    HawkSearch.SuggesterGlobal = {
        qf: '',
        lookupURL: '',
        divName: '',
        lastVal: '',
        searching: false,
        globalDiv: null,
        divFormatted: false,
        focus: false,
        defaultKeyword: []
    };


    HawkSearch.GetQueryStringValue = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    HawkSearch.getTrackingUrl = function () {
        if (HawkSearch.TrackingUrl === undefined || HawkSearch.TrackingUrl === "") {
            return HawkSearch.BaseUrl;
        } else if (HawkSearch.Tracking.Version.none === HawkSearch.Tracking.CurrentVersion()) {
            return HawkSearch.HawkUrl;
        } else {
            return HawkSearch.TrackingUrl;
        }
    };

    HawkSearch.getHawkUrl = function () {
        if (HawkSearch.HawkUrl === undefined || HawkSearch.HawkUrl === "") {
            return HawkSearch.BaseUrl;
        } else {
            return HawkSearch.HawkUrl;
        }
    };

    HawkSearch.getClientGuid = function () {
        if (HawkSearch.ClientGuid !== undefined) {
            return HawkSearch.ClientGuid;
        } else {
            return '';
        }
    }

    HawkSearch.RecommendationContext = {
        visitId: "",
        visitorId: "",
        baseUrl: HawkSearch.getHawkUrl(),
        clientGuid: HawkSearch.getClientGuid(),
        enablePreview: false,
        widgetUids: [],
        contextProperties: [],
        customProperties: []
    };

    // and we can set up a data structure that contains information
    // that the server retrieved from long term storage to send
    // along with our clicks
    HawkSearch.EventBase = {
        version: '0.1a',
        event_type: 'PageLoad'
    };

    HawkSearch.Tracking = {}
    HawkSearch.Tracking.eventQueue = [];
    HawkSearch.Tracking.isReady = false;
    HawkSearch.Tracking.ready = function (callback) {
        if (HawkSearch.Tracking.isReady) {
            callback(HawkSearch.jQuery);
        } else {
            HawkSearch.Tracking.eventQueue.push(callback);
        }
    }

    HawkSearch.Tracking.setReady = function ($) {
        var callback;
        while (callback = HawkSearch.Tracking.eventQueue.shift()) {
            callback($);
        }
        HawkSearch.Tracking.isReady = true;
    }

    HawkSearch.Tracking.CurrentVersion = function () {
        return HawkSearch.jQuery("#hdnhawktrackingversion").val();
    }

    HawkSearch.Tracking.Version = {
        none: "none",
        v1: "v1",
        v2: "v2",
        v2AndSQL: "v2AndSQL"
    }

    HawkSearch.Tracking.writePageLoad = function (pageType) {
        var callback = function () {
            if (pageType === undefined) {
                pageType = "";
            }

            var pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.itemDetails;
            switch (pageType.toLowerCase()) {
                case "page":
                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.landingPage;
                    break;
                case "item":
                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.itemDetails;
                    break;
                case "cart":
                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.shoppingCart;
                    break;
                case "order":
                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.orderConfirmation;
                    break;
                case "custom":
                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.custom;
                    break;
                default:
                    pageTypeVal = HawkSearch.LilBro.Schema.PageLoad.PageType.itemDetails;
            }
            var trackingValues = null;
            if (trackingValues != null) {
                return;
            }
            log("Tracking: write page load");
            var trackingContextValues = null;
            if (HawkSearch.Context) {
                trackingContextValues = HawkSearch.Context.keyValuePairs()
            }
            if ((HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) || (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSql)) {
                HawkSearch.lilBro.write({
                    event_type: 'PageLoad',
                    tracking_properties: JSON.stringify(trackingContextValues),
                    page_type_id: pageTypeVal
                });
            }
        }
        HawkSearch.Tracking.ready(callback);
    }


    HawkSearch.Tracking.writeSearchTracking = function (trackingId) {
        var callback = function (jQuery) {
            var $ = jQuery;

            if (trackingId == null || trackingId === "") {
                return;
            }

            var typeId = HawkSearch.LilBro.Schema.Search.SearchType["Refinement"];
            if ($("#hdnhawkquery").length === 0) {
                $('<input>').attr({
                    type: 'hidden',
                    id: 'hdnhawkquery',
                    name: 'hdnhawkquery'
                }).appendTo('body');
                $("#hdnhawkquery").val(HawkSearch.lilBro.event.createUUID());
                typeId = HawkSearch.LilBro.Schema.Search.SearchType["Search"];
            }


            var mpp = HawkSearch.getHashOrQueryVariable("mpp");
            var pg = HawkSearch.getHashOrQueryVariable("pg");
            var sort = HawkSearch.getHashOrQueryVariable("sort");

            var spellingSuggestion = HawkSearch.getHashOrQueryVariable("hawks") === "1";
            var lpurl = HawkSearch.getCustomUrl();
            if (lpurl == "/") {
                lpurl = "";
            }

            log("Tracking: write search type" + typeId);
            HawkSearch.lilBro.write({
                event_type: 'Search',
                tracking_id: trackingId,
                query_id: $('#hdnhawkquery').val(),
                type_id: typeId,
                lpurl: lpurl
            });
        }
        HawkSearch.Tracking.ready(callback);
    }


    HawkSearch.Tracking.writeSearch = function () {
        var callback = function (jQuery) {
            var $ = jQuery;
            var trackingId = HawkSearch.lilBro.getTrackingId();
            if (trackingId == null) {
                return;
            }
            HawkSearch.Tracking.writeSearchTracking(trackingId);
        }
        HawkSearch.Tracking.ready(callback);
    }

    HawkSearch.Tracking.writeClick = function (event, elementNo, mlt, uniqueId, trackingId) {
        log("Tracking: write click");

        if (trackingId == null) {
            return;
        }

        var $ = $ || jQuery;
        var maxPerPage = $("#hdnhawkmpp").val();
        var pageNo = $("#hdnhawkpg").val();

        if (pageNo > 1) {
            elementNo = elementNo + maxPerPage * (pageNo - 1);
        }


        var url = event.currentTarget.href;
        var location = escape(event.currentTarget.href.href).replace(/\+/g, "%2B");
        HawkSearch.lilBro.write({
            url: url,
            event_type: 'Click',
            tracking_id: trackingId,
            element_no: elementNo,
            mlt: mlt === true,
            unique_id: uniqueId,
            location: location,
            ev: event
        });
    };

    HawkSearch.Tracking.writeBannerClick = function (el, id) {
        log("Tracking: banner click id:" + id);
        HawkSearch.lilBro.write({
            event_type: 'BannerClick',
            banner_id: id,
            tracking_id: HawkSearch.lilBro.getTrackingId()
        });
    }

    HawkSearch.Tracking.writeBannerImpression = function (id) {
        var callback = function () {
            log("Tracking: banner impression id:" + id);
            HawkSearch.lilBro.write({
                event_type: 'BannerImpression',
                banner_id: id,
                tracking_id: HawkSearch.lilBro.getTrackingId()
            });
        }

        HawkSearch.Tracking.ready(callback);
    };

    HawkSearch.Tracking.writeSale = function (orderNo, itemList, total, subTotal, tax, currency) {
        var callback = function () {
            log("Tracking: write sale");
            HawkSearch.lilBro.write({
                event_type: 'Sale',
                order_no: orderNo,
                item_list: JSON.stringify(itemList),
                total: total,
                tax: tax,
                currency: currency,
                sub_total: subTotal
            }, function () {
                HawkSearch.lilBro.event.clearVisitId();
                log("Tracking visit id clared after order.");
            });
        }
        HawkSearch.Tracking.ready(callback);
    };

    HawkSearch.Tracking.writeAdd2Cart = function (uniqueId, price, quantity, currency) {
        var callback = function () {
            log("Tracking: write Add2Cart");
            HawkSearch.lilBro.write({
                event_type: 'Add2Cart',
                unique_id: uniqueId,
                price: price,
                quantity: quantity,
                currency: currency
            });
        }

        HawkSearch.Tracking.ready(callback);
    }

    /**
     * @param {{uniqueId: string, price: number, quantity: number, currency: number}[]} itemsList
     */
    HawkSearch.Tracking.writeAdd2CartMultiple = function (itemsList) {
        if (!itemsList) {
            throw "Items list cannot be null.";
        }

        if (Object.prototype.toString.call(itemsList) !== '[object Array]') {
            throw "Items list has to be an array.";
        }

        if (itemsList.length == 0) {
            throw "Items list cannot be empty.";
        }

        var callback = function () {
            log("Tracking: write Add2CartMultiple");
            HawkSearch.lilBro.write({
                event_type: 'Add2CartMultiple',
                items_list: JSON.stringify(itemsList)
            });
        };

        HawkSearch.Tracking.ready(callback);
    };

    HawkSearch.Tracking.writeRate = function (uniqueId, value) {
        if (value < 1 || value > 5) {
            return;
        }
        var callback = function () {
            log("Tracking: write Rate");
            HawkSearch.lilBro.write({
                event_type: 'Rate',
                unique_id: uniqueId,
                value: value
            });
        }

        HawkSearch.Tracking.ready(callback);
    }


    HawkSearch.Tracking.writeRecommendationClick = function (widgetGuid, uniqueId, itemIndex, requestId) {
        var callback = function () {
            log("Tracking: write RecommendationClick");
            HawkSearch.lilBro.write({
                event_type: 'RecommendationClick',
                widget_guid: widgetGuid,
                unique_id: uniqueId,
                item_index: itemIndex,
                request_id: requestId
            });
        }
        HawkSearch.Tracking.ready(callback);
    }

    HawkSearch.Tracking.writeAutoCompleteClick = function (keyword, event, type, name, itemUrl) {
        log("AutoComplete: item click id:" + name);
        var $ = $ || jQuery;

        HawkSearch.lilBro.write({
            event_type: 'AutoCompleteClick',
            url: itemUrl,
            suggest_type: type,
            name: name,
            keyword: keyword
        });
    }

    HawkSearch.Tracking.track = function (eventName, args) {
        var ns = HawkSearch.Tracking;
        switch (eventName.toLowerCase()) {
            case 'pageload':
                return ns.writePageLoad(args.pageType);
            case 'search':
                return ns.writeSearch();
            case 'searchtracking':
                return ns.writeSearchTracking(args.trackingId);
            case 'click':
                return ns.writeClick(args.event, args.elementNo, args.mlt, args.uniqueId, args.trackingId);
            case 'bannerclick':
                return ns.writeBannerClick(args.el, args.id);
            case 'bannerimpression':
                return ns.writeBannerImpression(args.id);
            case 'sale':
                return ns.writeSale(args.orderNo, args.itemList, args.total, args.subTotal, args.tax, args.currency);
            case 'add2cart':
                return ns.writeAdd2Cart(args.uniqueId, args.price, args.quantity, args.currency);
            case 'add2cartmultiple':
                return ns.writeAdd2CartMultiple(args);
            case 'rate':
                return ns.writeRate(args.uniqueId, args.value);
            case 'recommendationclick':
                return ns.writeRecommendationClick(args.widgetGuid, args.uniqueId, args.itemIndex, args.requestId);
            case 'autocompleteclick':
                return ns.writeAutoCompleteClick(args.keyword, args.event, args.suggest_type, args.name, args.itemUrl);
        }

        throw 'No such tracking event: ' + eventName;
    };

    HawkSearch.Tracking.V1 = {};

    HawkSearch.Tracking.V1.bannerLink = function (el, id) {
        el.href = HawkSearch.getTrackingUrl() + '/banners.aspx?BannerId=' + id; el.mousedown = '';
        return true;
    };

    HawkSearch.Tracking.V1.autosuggestClick = function (keyword, name, url, type) {
        var args = '&keyword=' + encodeURIComponent(keyword) + '&name=' + encodeURIComponent(name) + '&type=' + type + '&url=' + encodeURIComponent(url);
        var getUrl = HawkSearch.BaseUrl + "?fn=ajax&f=GetAutoCompleteClick" + args;
        var $ = $ || jQuery;

        $.ajax({
            "type": "GET",
            "data": "",
            "async": "false",
            "contentType": "application/json; charset=utf-8",
            "url": getUrl,
            "dataType": "jsonp",
            success: function (data) {
                var json = $.parseJSON(data);
                if (json.success === 'True') {
                    log("success added tracking autocomplete click");
                }
                else {
                    log("failed added tracking autocomplete click");
                }
            },
            error: function (error) {
                log(error);
            }
        });
    };

    HawkSearch.Tracking.V1.link = function (el, id, i, pk, mlt) {
        var full = HawkSearch.getTrackingUrl() + "/link.aspx?id=" + escape(id) + "&q=" + escape(el.currentTarget.href).replace(/\+/g, "%2B") + "&i=" + i + "&pk=" + pk + "&mlt=" + mlt;
        el.currentTarget.href = full;
        return true;
    };

    // LilBro schemas
    HawkSearch.initLilBroSchema = function () {

        var root = this;

        root.LilBro = root.LilBro || {
        };
        root.LilBro.Schema = {
        };

        root.LilBro.Schema.version = "default";

        root.LilBro.Schema.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            mouse_x: 6,
            mouse_y: 7,
            viewport_width: 8,
            viewport_height: 9,
            scroll_x: 10,
            scroll_y: 11,
            element_id: 12,
            element_id_from: 13,
            element_class: 14,
            element_class_from: 15,
            element_name: 16,
            element_tag: 17,
            element_type: 18,
            element_checked: 19,
            element_value: 20,
            element_x: 21,
            element_y: 22,
            browser: 23,
            browser_version: 24,
            operating_system: 25,
            request_path: 26,
            qs: 27,
            tracking_id: 28,
            unique_id: 29,
            element_no: 30,
            mlt: 31,
            keyword: 32,
            current_page: 33,
            max_per_page: 34,
            items_count: 35,
            sorting: 36,
            is_custom: 37
        };

        root.LilBro.Schema.type_map = {
            PageLoad: 1,
            Search: 2,
            Click: 3,
            Add2Cart: 4,
            Rate: 5,
            Sale: 6,
            BannerClick: 7,
            BannerImpression: 8,
            Login: 9,
            RecommendationClick: 10,
            AutoCompleteClick: 11,
            Add2CartMultiple: 14
        };

        root.LilBro.Schema.PageLoad = {
        };
        root.LilBro.Schema.PageLoad.version = "pl01a";
        root.LilBro.Schema.PageLoad.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            viewport_width: 6,
            viewport_height: 7,
            browser: 8,
            browser_version: 9,
            operating_system: 10,
            request_path: 11,
            qs: 12,
            tracking_properties: 13,
            page_type_id: 14
        }
        root.LilBro.Schema.PageLoad.PageType = {
            itemDetails: 1,
            landingPage: 2,
            shoppingCart: 3,
            orderConfirmation: 4,
            custom: 5
        }

        root.LilBro.Schema.Search = {
        };
        root.LilBro.Schema.Search.version = "ref01a";
        root.LilBro.Schema.Search.SearchType = {
            Search: 1,
            Refinement: 2
        };

        root.LilBro.Schema.Search.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            viewport_width: 6,
            viewport_height: 7,
            browser: 8,
            browser_version: 9,
            operating_system: 10,
            request_path: 11,
            qs: 12,
            tracking_id: 13,
            query_id: 14,
            type_id: 15
        }

        root.LilBro.Schema.Click = {
        };
        root.LilBro.Schema.Click.version = "cli01a";
        root.LilBro.Schema.Click.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            mouse_x: 6,
            mouse_y: 7,
            viewport_width: 8,
            viewport_height: 9,
            scroll_x: 10,
            scroll_y: 11,
            element_id: 12,
            element_id_from: 13,
            element_class: 14,
            element_class_from: 15,
            element_name: 16,
            element_tag: 17,
            element_type: 18,
            element_checked: 19,
            element_value: 20,
            element_x: 21,
            element_y: 22,
            browser: 23,
            browser_version: 24,
            operating_system: 25,
            request_path: 26,
            qs: 27,
            tracking_id: 28,
            unique_id: 29,
            mlt: 30,
            element_no: 31,
            url: 32
        }

        root.LilBro.Schema.Rate = {
        };
        root.LilBro.Schema.Rate.version = "rat01a";
        root.LilBro.Schema.Rate.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            value: 6,
            unique_id: 7
        }

        root.LilBro.Schema.Sale = {
        };
        root.LilBro.Schema.Sale.version = "sal01a";
        root.LilBro.Schema.Sale.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            order_no: 6,
            item_list: 7,
            total: 8,
            tax: 9,
            currency: 10,
            sub_total: 11
        }

        root.LilBro.Schema.Add2Cart = {
        };
        root.LilBro.Schema.Add2Cart.version = "a2c01a";
        root.LilBro.Schema.Add2Cart.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            unique_id: 6,
            price: 7,
            quantity: 8,
            currency: 9
        }

        root.LilBro.Schema.BannerClick = {
        }
        root.LilBro.Schema.BannerClick.version = "banclk01a";
        root.LilBro.Schema.BannerClick.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            tracking_id: 6,
            banner_id: 7
        }

        root.LilBro.Schema.BannerImpression = {
        }
        root.LilBro.Schema.BannerImpression.version = "banimp01a";
        root.LilBro.Schema.BannerImpression.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            tracking_id: 6,
            banner_id: 7
        }



        root.LilBro.Schema.RecommendationClick = {
        }
        root.LilBro.Schema.RecommendationClick.version = "recClick01a";
        root.LilBro.Schema.RecommendationClick.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            widget_guid: 6,
            unique_id: 7,
            item_index: 8,
            request_id: 9
        }

        root.LilBro.Schema.AutoCompleteClick = {
        }
        root.LilBro.Schema.AutoCompleteClick.version = "autoComplClick01a";
        root.LilBro.Schema.AutoCompleteClick.key_map = {
            // leave slot 0 for the server timestamp
            version: 1,
            timestamp: 2,
            event_type: 3,
            visitor_id: 4,
            visit_id: 5,
            suggest_type: 6,
            url: 7,
            name: 8,
            keyword: 9
        }
        root.LilBro.Schema.AutoCompleteClick.AutoCompleteType = {
            popular: 1,
            category: 2,
            product: 3,
            content: 4
        }

        root.LilBro.Schema.Add2CartMultiple = {
            version: "a2cm01a",
            key_map: {
                // leave slot 0 for the server timestamp
                version: 1,
                timestamp: 2,
                event_type: 3,
                visitor_id: 4,
                visit_id: 5,
                items_list: 6
            }
        };
    }

    // LilBro code
    HawkSearch.LilBro = function (args) {
        HawkSearch.initLilBroSchema();
        var self = this;
        var $ = null;

        this.initialize = function (args) {
            this.ensureBase64Encoding();
            if (args) {
                if (!args.server) {
                    return;
                }

                $ = args.jQuery;
                this.watch_container(args.element, args.watch_focus);

                this.freshEvent = function () {
                    var base = {};
                    if (args.event_base) {
                        for (var p in args.event_base) {
                            if (args.event_base.hasOwnProperty(p)) {
                                base[p] = args.event_base[p];
                            }
                        }
                    }

                    var eventType = args.event_type || args.event_base.event_type || "PageLoad";
                    return new HawkSearch.LilBro.Event({
                        base: base,
                        key_map: args.key_map || HawkSearch.LilBro.Schema[eventType].key_map || HawkSearch.LilBro.Schema.key_map,
                        type_map: args.type_map || HawkSearch.LilBro.Schema.type_map,
                        server: args.server,
                        ssl_server: args.ssl_server,
                        visit_id_cookie: args.visit_id_cookie || 'visit_id',
                        visitor_id_cookie: args.visitor_id_cookie || 'visitor_id'
                    });
                };
            } else {
                return;
            }

            try {
                if (sessionStorage && sessionStorage.getItem('lilbrobug' + window.location.protocol)) {
                    var src = decodeURIComponent(sessionStorage.getItem('lilbrobug' + window.location.protocol));
                    var bug = new Image();
                    bug.onload = function () {
                        sessionStorage.removeItem('lilbrobug' + window.location.protocol);
                    };
                    bug.src = src;
                }
            } catch (e) {
                log('ERROR: ' + e);
            }

            this.event = this.freshEvent();
            HawkSearch.RecommendationContext.visitorId = this.event.getVisitorId();
            HawkSearch.RecommendationContext.visitId = this.event.getVisitId();
        };

        this.watch_container = function (el, focus) {
            if (!el) {
                return;
            }
            if (el.addEventListener) {
                el.addEventListener('click', _doer_maker('click'), false);
                if (focus) {
                    el.addEventListener('focusin', _doer_maker('focusin'), false);
                    el.addEventListener('focusout', _doer_maker('focusout'), false);
                }
            } else {
                el.attachEvent('onclick', _doer_maker('click'), false);
                if (focus) {
                    el.attachEvent('onfocusin', _doer_maker('focusin'), false);
                    el.attachEvent('onfocusout', _doer_maker('focusout'), false);
                }
            }
        };

        this.watch = function (args) {
            if (!args) {
                return;
            }
            if (!args.element) {
                return;
            }
            if (args.element.addEventListener) {
                args.element.addEventListener(
                    'click',
                    _doer_maker('click', args.callback, args.bubble),
                    false
                );
            } else {
                args.element.attachEvent(
                    'onclick',
                    _doer_maker('click', args.callback, args.bubble),
                    false
                );
            }
        };

        function _doer_maker(type, callback, bubble) {
            return function (ev) {
                if (!ev) {
                    ev = window.event;
                }
                var targ = self._findTarget(ev);
                self.event.fill({
                    type: type,
                    event: ev,
                    target: targ
                });
                if (callback) {
                    try {
                        callback(self.event);
                    } catch (e) {
                    }
                }
                if (bubble != null && !bubble) {
                    ev.cancelBubble = true;
                    if (ev.stopPropagation) {
                        ev.stopPropagation();
                    }
                }
                self.event.write();
                self.event = self.freshEvent();
            };
        };

        this.createObjectProps = function (obj) {
            var key_map = obj._key_map;
            for (var key in key_map) {
                if (!obj._event.hasOwnProperty(key)) {
                    obj._event[key] = "";
                }
            }
        };

        this.write = function (obj, callback) {
            var schema = HawkSearch.LilBro.Schema[obj.event_type];
            var key_map = args.key_map || schema.key_map;
            var version = schema.version || HawkSearch.LilBro.Schema.version;
            self.event._key_map = key_map;
            this.createObjectProps(self.event);
            var ev = obj.ev;
            if (!obj.ev && window.event) {
                ev = window.event;
            }
            var targ = self._findTarget(ev);
            self.event.fill({
                type: obj.event_type,
                event: ev,
                target: targ,
                version: version
            });

            for (var key in obj) {
                self.event.set(key, obj[key]);
            }

            self.event.write(callback);
            self.event = self.freshEvent();
        };

        // event target lifted from quirksmode
        this._findTarget = function (ev) {
            var targ = null;
            if (ev && ev.target) {
                targ = ev.target;
            } else if (ev && ev.srcElement) {
                targ = ev.srcElement;
            }
            // defeat Safari bug
            if (targ && targ.nodeType == 3) {
                targ = targ.parentNode;
            }
            return targ;
        };

        this.getTrackingId = function () {
            if ($("#hdnhawktrackingid").length == 0 || $("#hdnhawktrackingid").val() === "") {
                return null;
            }
            return $("#hdnhawktrackingid").val();
        };

        this.ensureBase64Encoding = function () {
            /*base 64*/
            !function () {
                function t(t) { this.message = t } var r = "undefined" != typeof exports ? exports : this, e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; t.prototype = new Error, t.prototype.name = "InvalidCharacterError", r.btoa || (r.btoa = function (r) {
                    for (var o, n, a = String(r), i = 0, c = e, d = ""; a.charAt(0 | i) || (c = "=", i % 1); d += c.charAt(63 & o >> 8 - i % 1 * 8)) {
                        if (n = a.charCodeAt(i += .75), n > 255) throw new t("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."); o = o << 8 | n
                    } return d
                }), r.atob || (r.atob = function (r) {
                    var o = String(r).replace(/=+$/, ""); if (o.length % 4 == 1) throw new t("'atob' failed: The string to be decoded is not correctly encoded."); for (var n, a, i = 0, c = 0, d = ""; a = o.charAt(c++); ~a && (n = i % 4 ? 64 * n + a : a, i++ % 4) ? d += String.fromCharCode(255 & n >> (-2 * i & 6)) : 0) a = e.indexOf(a); return d
                })
            }();
        }

        this.initialize(args);
    };

    HawkSearch.LilBro.Event = function (args) {

        this.initialize = function (args) {
            this._event = args.base;
            this._key_map = args.key_map;
            this._type_map = args.type_map;
            this.server = args.server;
            this.ssl_server = args.ssl_server;
            this.visit_id_cookie = args.visit_id_cookie;
            this.visitor_id_cookie = args.visitor_id_cookie;
        };

        this.set = function (prop, val) {
            if (!this._event.hasOwnProperty(prop)) {
                return;
            }
            return this._event[prop] = val;
        };

        this.get = function (prop) {
            return this._event[prop];
        };

        this.write = function (callback) {
            var isExpand = HawkSearch.GetQueryStringValue["expand"] !== undefined;
            if (isExpand) {
                return;
            }
            var event = [];
            var et = "";
            for (var key in this._key_map) {
                if (key === "event_type") {
                    event[this._key_map[key]] = this._type_map[this.get(key)] || 0;
                    et = event[this._key_map[key]];
                } else {
                    event[this._key_map[key]] = this.get(key);
                }
            }
            var protocol = window.location.protocol;
            var customDictionaryString = JSON.stringify(HawkSearch.Context.Custom.keyValuePairs());
            var clientIdentifyToken;
            if (HawkSearch.getClientGuid() !== "") {
                clientIdentifyToken = '&cg=' + HawkSearch.getClientGuid();
            } else {
                clientIdentifyToken = '&bu=' + HawkSearch.getHawkUrl();
            }
            if ((HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) || (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSql)) {
                var src = HawkSearch.getTrackingUrl() + '/hawk.png?t=' + encodeURIComponent(btoa(event.join('\x01'))) + '&et=' + et + clientIdentifyToken + '&cd=' + encodeURIComponent(customDictionaryString) + '&' + this.randomHexBlocks(1);

                log(src);
                try {
                    if (sessionStorage) {
                        sessionStorage.setItem(
                            'lilbrobug' + protocol,
                            encodeURIComponent(src)
                        );
                    }
                } catch (e) {
                    log('Tracking: ERROR ' + e);
                }

                var bug = new Image();
                bug.onload = function () {
                    log("Tracking sent. " + src);
                    try {
                        sessionStorage.removeItem('lilbrobug' + protocol);
                    } catch (e) {
                        log('Tracking: ERROR ' + e);
                    }
                    if (callback) {
                        callback();
                    }
                };
                bug.src = src;
            }
        };

        this.fill
            = function (args) {
                //version
                if (args && args.version) {
                    this.set('version', args.version);
                } else {
                    this.set('version', HawkSearch.LilBro.Schema.version);
                }

                if (args && args.type) {
                    // event type
                    this.set('event_type', args.type);
                };
                if (args && args.event) {

                    // mouse coordinates
                    var mouse_x = '';
                    var mouse_y = '';
                    if (args.event.pageX || args.event.pageY) {
                        mouse_x = args.event.pageX;
                        mouse_y = args.event.pageY;
                    } else if (args.event.clientX || args.event.clientY) {
                        mouse_x = args.event.clientX + document.body.scrollLeft
                            + document.documentElement.scrollLeft;
                        mouse_y = args.event.clientY + document.body.scrollTop
                            + document.documentElement.scrollTop;
                    }
                    this.set('mouse_x', mouse_x);
                    this.set('mouse_y', mouse_y);
                }

                // viewport
                this.set('viewport_width', document.documentElement.clientWidth);
                this.set('viewport_height', document.documentElement.clientHeight);

                // scroll, snaked from http://webcodingeasy.com/Javascript/Get-scroll-position-of-webpage--crossbrowser
                var scroll_x = 0, scroll_y = 0;
                if (typeof (window.pageYOffset) == 'number') {
                    scroll_x = window.pageXOffset;
                    scroll_y = window.pageYOffset;
                } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                    scroll_x = document.body.scrollLeft;
                    scroll_y = document.body.scrollTop;
                } else if (document.documentElement && (document.documentElement.scrollLeft
                    || document.documentElement.scrollTop)) {
                    scroll_x = document.documentElement.scrollLeft;
                    scroll_y = document.documentElement.scrollTop;
                }
                this.set('scroll_x', scroll_x || 0);
                this.set('scroll_y', scroll_y || 0);

                // element goodies
                if (args && args.target) {
                    // element id and class, or their closest ancestors
                    var el_id = args.target.id;
                    var el_class = args.target.className;
                    var id_from_ancestor = !el_id;
                    var class_from_ancestor = !el_class;
                    var id_path, class_path;
                    if (!el_id || !el_class) {
                        var targ_orig = args.target;
                        id_path = args.target.tagName;
                        class_path = args.target.tagName;
                        do {
                            args.target = args.target.parentNode;
                            if (args.target === null || args.target == undefined) {
                                break;
                            }
                            if (!el_id && args.target.tagName) {
                                id_path = args.target.tagName + '/' + id_path;
                                el_id = args.target.id;
                            }
                            if (!el_class && args.target.tagName) {
                                class_path = args.target.tagName + '/' + class_path;
                                el_class = args.target.className;
                            }
                        } while ((!el_id || !el_class) && args.target.parentNode);
                        args.target = targ_orig;
                    }
                    this.set('element_id', el_id);
                    this.set('element_class', el_class);
                    if (el_id && id_from_ancestor) {
                        this.set('element_id_from', id_path);
                    }
                    if (el_class && class_from_ancestor) {
                        this.set('element_class_from', class_path);
                    }

                    // element sundry
                    this.set('element_name', args.target.name || '');
                    this.set('element_tag', args.target.tagName || '');
                    this.set('element_type', args.target.type || '');
                    this.set('element_checked', args.target.checked ? 1 : '');
                    // by default, ignore typed input
                    if (args.target.type && args.target.type.toLowerCase() !== 'text'
                        && args.target.type.toLowerCase() !== 'password') {
                        this.set('element_value', args.target.value || '');
                    }

                    // including the position best effort (http://stackoverflow.com/a/442474)
                    var element_x = 0;
                    var element_y = 0;
                    var targ_orig = args.target;
                    while (args.target && !isNaN(args.target.offsetLeft) && !isNaN(args.target.offsetTop)) {
                        element_x += args.target.offsetLeft - args.target.scrollLeft;
                        element_y += args.target.offsetTop - args.target.scrollTop;
                        args.target = args.target.offsetParent;
                    }
                    args.target = targ_orig;
                    this.set('element_x', element_x);
                    this.set('element_y', element_y);
                }

                // browser
                if (HawkSearch.LilBro.BrowserDetect) {
                    this.set('browser', HawkSearch.LilBro.BrowserDetect.browser);
                    this.set('browser_version', HawkSearch.LilBro.BrowserDetect.version);
                    this.set('operating_system', HawkSearch.LilBro.BrowserDetect.OS);
                }

                // path part of url
                this.set('request_path', window.location.pathname);

                // other client bits
                var d = new Date();
                this.set('timestamp', d.getTime());
                var visitorId = this.getVisitorId();
                var visitId = this.getVisitId();
                this.set('visitor_id', visitorId);
                this.set('visit_id', visitId);
                this.set('qs', encodeURIComponent(HawkSearch.getHash()));
            };

        this.getVisitorId = function () {
            var visitor_id = this.getCookie(this.visitor_id_cookie);
            if (!visitor_id) {
                visitor_id = this.createUUID();
            }
            this.setCookie(this.visitor_id_cookie, visitor_id, this.getVisitorExpiry());
            return visitor_id;
        };

        this.getVisitId = function () {
            var visit_id = this.getCookie(this.visit_id_cookie);
            if (!visit_id) {
                visit_id = this.createUUID();
            }
            this.setCookie(this.visit_id_cookie, visit_id, this.getVisitExpiry());
            return visit_id;
        };

        this.clearVisitId = function () {
            this.setCookie(this.visit_id_cookie, "", 'Thu, 01 Jan 1970 00:00:01 GMT');
        };

        this.getVisitorExpiry = function () {
            var d = new Date();
            // 1 year
            d.setTime(d.getTime() + (360 * 24 * 60 * 60 * 1000));
            return d.toGMTString();
        };

        this.getVisitExpiry = function () {
            var d = new Date();
            // 4 hours
            d.setTime(d.getTime() + (4 * 60 * 60 * 1000));
            return d.toGMTString();
        };

        this.randomHexBlocks = function (blocks) {
            if (!blocks) {
                blocks = 4;
            }
            var hex = '';
            for (var i = 0; i < blocks; i++) {
                hex += parseInt(Math.random() * (Math.pow(2, 32))).toString(16);
            }
            return hex;
        };

        this.createUUID = function () {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        }


        // cookies borrowed from quirksmode
        this.setCookie = function (name, value, expiry) {
            var expires;
            if (expiry) {
                expires = "; expires=" + expiry;
            } else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        };

        this.getCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        };

        this.initialize(args);
    };

    // browser detection lifted from quirksmode
    HawkSearch.LilBro.BrowserDetect = {
        init: function () {
            this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
            this.version = this.searchVersion(navigator.userAgent)
                || this.searchVersion(navigator.appVersion)
                || "an unknown version";
            this.OS = this.searchString(this.dataOS) || "an unknown OS";
        },
        searchString: function (data) {
            for (var i = 0; i < data.length; i++) {
                var dataString = data[i].string;
                var dataProp = data[i].prop;
                this.versionSearchString = data[i].versionSearch || data[i].identity;
                if (dataString) {
                    if (dataString.indexOf(data[i].subString) != -1)
                        return data[i].identity;
                }
                else if (dataProp)
                    return data[i].identity;
            }
        },
        searchVersion: function (dataString) {
            var index = dataString.indexOf(this.versionSearchString);
            if (index == -1) return;
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        },
        dataBrowser: [
            {
                string: navigator.userAgent,
                subString: "BlackBerry",
                identity: "BlackBerry"
            },
            {
                string: navigator.userAgent,
                subString: "BB10",
                identity: "BlackBerry"
            },
            {
                string: navigator.userAgent,
                subString: "PlayBook",
                identity: "BlackBerry"
            },
            {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            },
            {
                string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            },
            {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            },
            {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            },
            {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            },
            {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            },
            {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            },
            {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            },
            {// for newer Netscapes (6+)
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            },
            {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            },
            {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            },
            { // for older Netscapes (4-)
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            }
        ],
        dataOS: [
            {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.userAgent,
                subString: "iPod",
                identity: "iPhone/iPod"
            },
            {
                string: navigator.userAgent,
                subString: "iPad",
                identity: "iPad"
            },
            {
                string: navigator.userAgent,
                subString: "BlackBerry",
                identity: "BlackBerry"
            },
            {
                string: navigator.userAgent,
                subString: "BB10",
                identity: "BlackBerry"
            },
            {
                string: navigator.userAgent,
                subString: "PlayBook",
                identity: "BlackBerry"
            },
            {
                string: navigator.userAgent,
                subString: "Android",
                identity: "Android"
            },
            {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            },
            {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            },
            {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            }
        ]
    };

    try {
        HawkSearch.LilBro.BrowserDetect.init();
    } catch (e) { }

    HawkSearch.Recommender = function (jQuery) {

        var self = this;
        this._uniqueId = null;
        var $ = jQuery;

        this.Init = function () {
            if (!HawkSearch.getRecommenderUrl()) {
                return;
            }

            log("Recommender init");

            if (HawkSearch.Context.containsKey("uniqueid")) {
                self._uniqueId = HawkSearch.Context["uniqueid"];
            }

            self._context = HawkSearch.RecommendationContext;
            self._context.enablePreview = HawkSearch.Recommender.IsPreviewEnabled();

            self._context.contextProperties = HawkSearch.Context;
            self._context.customProperties = HawkSearch.Context.Custom;
            $(".hawk-recommendation").each(function () {
                var uid = HawkSearch.Recommender.GetWidgetUid($(this).data("widgetguid"), $(this).data("uniqueid"));
                if ($(this).data("uniqueid") === undefined || uid.uniqueId === "") {
                    uid.uniqueId = self._uniqueId;
                }
                var widgetExists = false;
                $(self._context.widgetUids).each(function () {
                    var currentWidgetGuid = this.widgetGuid;
                    if (currentWidgetGuid == uid.widgetGuid) {
                        widgetExists = true;
                        return;
                    }
                })
                if (!widgetExists) {
                    self._context.widgetUids.push(uid);
                }
            });

            if (self._context.widgetUids.length == 0) {
                return;
            }
            var recommenderUrl = HawkSearch.getRecommenderUrl() + "/api/recommendation/";

            var previewVisitorTargets = HawkSearch.Recommender.PreviewVisitorTarget();

            if (HawkSearch.Recommender.IsPreviewEnabled() && previewVisitorTargets != null && previewVisitorTargets !== "") {
                recommenderUrl = recommenderUrl + "?hawkb=" + previewVisitorTargets;
            }

            $.ajax({
                type: 'POST',
                url: recommenderUrl,
                data: JSON.stringify(self._context),
                contentType: "application/json",
                dataType: 'json'
            })
                .done(self.RegWidgets);
        }

        bindRecommendationPopover = function (container, ruleExplainDictionary, triggerRuleExplainDictionary) {
            container.find(".hawk-recommendation-item").each(function () {
                var modelType = $(this).data("hawk-modeltype");
                var modelName = $(this).data("hawk-modelname");
                var modelGuid = $(this).data("hawk-modelguid");
                var recInfoContainer = $(this).find(".hawk-recommendation-info");
                if (recInfoContainer.length === 0) {
                    recInfoContainer = $("<div class='hawk-recommendation-info' data-trigger='hover'></div>");
                    recInfoContainer.append($("<div class='hawk-recommendation-model-icon hawk-" + modelType.toLowerCase() + "'></div>"));
                    $(this).prepend(recInfoContainer);
                }

                var ruleString = ruleExplainDictionary[modelGuid];
                var triggerRuleString = triggerRuleExplainDictionary[modelGuid];

                var content = "<b>Strategy Name:</b> " + modelName;
                if (ruleString !== undefined && ruleString !== "") {
                    content += "<div class=''>"
                    content += "<div class=''><b>Rule:</b></div>";
                    content += ruleString;
                    content += "</div>";
                }

                if (triggerRuleString !== undefined && triggerRuleString !== "") {
                    content += "<div class=''>"
                    content += "<div class=''><b>Trigger Rule:</b></div>";
                    content += triggerRuleString;
                    content += "</div>";
                }

                HawkSearch.Popover($(recInfoContainer), HawkSearch.getTipPlacementFunction('top', 230, 200), content);

            });
        }

        this.RegWidgets = function (data) {
            if (!data.isSuccess) {
                HawkSearch.hideRecsBlockUI();
                return;
            }

            $(data.items).each(function () {
                var item = this;
                var contaierSelector = '.hawk-recommendation[data-widgetguid="' + item.widgetGuid + '"]';
                var widgetContainer = $(contaierSelector);
                if (widgetContainer.length > 0) {
                    widgetContainer.attr("data-hawk-requestid", data.requestId);
                    var layoutClass = "hawk-recommendation-" + (item.isVertical ? "vertical" : "horizontal");
                    widgetContainer.addClass(layoutClass);
                    widgetContainer.append("<div class='hawk-recommendation-inner'></div>");
                    var widgetContainerInner = widgetContainer.find(".hawk-recommendation-inner");
                    widgetContainerInner.css('visibility', 'hidden');
                    widgetContainerInner.html(item.html);
                    var hawkRecommendationItems = widgetContainerInner.find(".hawk-recommendation-item");
                    widgetContainerInner.waitForImages(function () {
                        var itemContainer = widgetContainerInner.find(".hawk-recommendation-list")

                        hawkRecommendationItems.matchHeights({ includeMargin: true });

                        if (!itemContainer.children().length) {
                            widgetContainer.hide();
                        }

                        var container = $("#hawkitemlist");

                        HawkSearch.ExposeEvents("RecommenderAfterWidgetImagesLoaded", { widgetContainer: widgetContainer });


                        if (item.isCarousel) {
                            if (item.carouselData.showNextPrevButtons) {
                                widgetContainerInner.addClass("has-arrows");
                            }
                            if (item.carouselData.showDots) {
                                widgetContainerInner.addClass("has-dots vertical-dots");
                            }

                            var autoRotateSpeed = item.carouselData.autoRotate ? item.carouselData.autoRotateSpeed : 0;
                            var showDots = item.carouselData.showDots;
                            var hawkslickOptions = {
                                speed: item.carouselData.animationSpeed,
                                autoplay: item.carouselData.autoRotate,
                                autoplaySpeed: item.carouselData.autoRotateSpeed,
                                vertical: item.isVertical,
                                slidesToShow: item.carouselData.nofVisible,
                                arrows: item.carouselData.showNextPrevButtons,
                                nextArrow: '<button type="button" class="hawk-carousel-next"><span>Next</span></button>',
                                prevArrow: '<button type="button" class="hawk-carousel-prev"><span>Prev</span></button>',
                                slidesToScroll: item.carouselData.scrollNumber,
                                infinite: item.carouselData.isCircular,
                                dots: item.carouselData.showDots,
                                //variableWidth: (!item.isVertical),
                                slide: ".hawk-recommendation-item",
                                pauseOnHover: true,
                                pauseOnDotsHover: true,
                                mobileFirst: true
                            };
                            if (item.carouselData.enableResponsive) {
                                var responsiveConfig = null;
                                try {
                                    responsiveConfig = eval("(" + item.carouselData.responseiveConfig + ")");

                                } catch (e) {
                                    log("Responsive data is corupted. WidgetGuid: " + item.widgetGuid + " Error:" + e);
                                }
                                if (responsiveConfig != null) {
                                    hawkslickOptions.responsive = responsiveConfig;
                                }
                            }

                            itemContainer.hawkslick(hawkslickOptions);

                            if (!item.isVertical) {
                                var itemWidth = itemContainer.find(".hawk-recommendation-item:visible").first().outerWidth(true);
                                var itemCount = item.carouselData.nofVisible;

                            }
                            else {
                                var itemWidth = itemContainer.find(".hawk-recommendation-item:visible").first().outerWidth(true);
                            }

                            $(window).on("debouncedresize", function () {
                                itemContainer.hawkslick('hawkslickGoTo', itemContainer.hawkslick('hawkslickCurrentSlide'), true);
                            });
                        } else {
                            if (!item.isVertical) {
                                var itemWidth = itemContainer.find(".hawk-recommendation-item:visible").first().outerWidth(true);
                                var itemCount = itemContainer.find(".hawk-recommendation-item").length;
                                itemContainer.width(itemWidth * itemCount);
                                widgetContainer.height(widgetContainerInner.height() + "px");
                            }
                            else {
                                widgetContainer.width(widgetContainerInner.width() + "px");
                            }
                        }
                        widgetContainer.append("<div class='clearfix'></div>");
                        widgetContainerInner.css('visibility', 'visible');

                        var enablePreview = HawkSearch.Recommender.IsPreviewEnabled();

                        if (enablePreview) {
                            var ruleExplainDictionary = new HawkSearch.Dictionary();
                            var triggerRuleExplainDictionary = new HawkSearch.Dictionary();
                            var bindPreview = function (data) {

                                for (i = 0; i < data.length; i++) {
                                    var item = data[i];
                                    ruleExplainDictionary[item.ModelGuid] = item.RuleString;
                                    triggerRuleExplainDictionary[item.ModelGuid] = item.TriggerRuleString;
                                }
                                bindRecommendationPopover(widgetContainerInner, ruleExplainDictionary, triggerRuleExplainDictionary);
                            };

                            $(window).on("debouncedresize", function () {
                                $(".hawk-recommendation-info").each(function (index, item) {
                                    HawkSearch.PopoverAction($(item), 'destroy');
                                });

                                setTimeout(function () {
                                    bindRecommendationPopover(widgetContainerInner, ruleExplainDictionary, triggerRuleExplainDictionary);
                                }, 10);

                            });
                            var uriParser = document.createElement("a");
                            var url = uriParser.href = HawkSearch.HawkUrl || HawkSearch.BaseUrl;
                            var apiUrl = uriParser.protocol + "//" + uriParser.hostname + "/api/v3/RecommendationModel/getruleexplain?widgetGuid=" + item.widgetGuid + "&bu=" + encodeURIComponent(HawkSearch.getHawkUrl()) + "&cg=" + HawkSearch.getClientGuid();
                            $.ajax({
                                url: apiUrl,
                                dataType: "jsonp",
                                success: bindPreview
                            });
                        }
                    });
                }
            });
            HawkSearch.hideRecsBlockUI();
            HawkSearch.ExposeEvents('RecommenderAfterInit');
        }
        this.Init();
    }
    HawkSearch.Recommender.PreviewInfoCookieName = "EnableRecommendationPreviewInfo";
    HawkSearch.Recommender.HawkPreviewBucket = "hawkPreviewBucket";

    HawkSearch.Recommender.GetWidgetUid = function (widgetGuid, uniqueId) {
        var uid = new Object();
        uid.widgetGuid = widgetGuid;
        uid.uniqueId = uniqueId;

        if (uniqueId !== undefined && uniqueId.match(/{{.+}}/)) {
            uid.uniqueId = "";
        }

        return uid;
    }

    HawkSearch.Recommender.SetWidget = function (widgetGuid, uniqueId) {
        HawkSearch.RecommendationContext.widgetUids.push(HawkSearch.Recommender.GetWidgetUid(widgetGuid, uniqueId));
    }

    HawkSearch.Recommender.IsPreviewEnabled = function () {
        var enablePreview = HawkSearch.lilBro.event.getCookie(HawkSearch.Recommender.PreviewInfoCookieName)

        return (enablePreview !== null && enablePreview.toLowerCase() === 'true');
    }

    HawkSearch.Recommender.ToggleRecPreview = function () {
        HawkSearch.Tracking.ready(function () {
            var toggleVal = HawkSearch.getHashOrQueryVariable("hawkToggleRecPreview");
            if (toggleVal !== "") {
                HawkSearch.lilBro.event.setCookie(HawkSearch.Recommender.PreviewInfoCookieName, toggleVal, HawkSearch.lilBro.event.getVisitorExpiry());
                var hawkb = HawkSearch.getHashOrQueryVariable("hawksetb");
                HawkSearch.lilBro.event.setCookie(HawkSearch.Recommender.HawkPreviewBucket, hawkb, HawkSearch.lilBro.event.getVisitorExpiry());
            }
        });
    }

    HawkSearch.Recommender.PreviewVisitorTarget = function () {
        return HawkSearch.lilBro.event.getCookie(HawkSearch.Recommender.HawkPreviewBucket);
    }

    HawkSearch.Recommender.Track = function (el, uniqueId, itemIndex) {
        var widgetGuid = HawkSearch.jQuery(el).parents(".hawk-recommendation").data("widgetguid");
        var recommendation = HawkSearch.jQuery(el).parents(".hawk-recommendation");
        var requestId = recommendation.data("hawk-requestid");
        HawkSearch.Tracking.writeRecommendationClick(widgetGuid, uniqueId, itemIndex, requestId);
    }

    function log(msg) {
        if (HawkSearchLoader.debugMode && window.console && console.log) {
            console.log('HawkSearch: ' + msg);
        };
    }

    if (HawkSearchLoader.loadjQuery) {
        log('Loading jQuery/jQuery UI.');
        // set document head to varible
        var head = (document.getElementsByTagName("head")[0] || document.documentElement),
            script = "//manage.hawksearch.com/sites/shared/includes/jquery-1.11.0_jquery-ui-slider-1.10.4.min.js";

        var jqScriptTag = document.createElement('script');
        jqScriptTag.type = 'text/javascript';
        jqScriptTag.src = script;

        // Handle Script loading
        // IE9+ supports both script.onload AND script.onreadystatechange (bit.ly/18gsqtw)
        // so both events will be triggered (that's 2 calls), which is why "jqLoadDone" is needed
        var jqLoadDone = false;

        // Attach handlers for all browsers
        jqScriptTag.onload = jqScriptTag.onreadystatechange = function () {
            if (!jqLoadDone && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                jqLoadDone = true;

                log("jQuery applied and ready");
                jQueryLoaded();

                // Handle memory leak in IE
                jqScriptTag.onload = jqScriptTag.onreadystatechange = null;
                if (head && jqScriptTag.parentNode) {
                    head.removeChild(jqScriptTag);
                }
            }
        };


        // add script to page's head tag.
        // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
        // This arises when a base node is used (#2709 and #4378).
        head.insertBefore(jqScriptTag, head.firstChild);

    } else {
        jQuery = window.jQuery;

        HawkSearch.loadPlugins = jQuery.extend({
            jQueryUI: true,
            slider: true,
            wNumb: true,
            matchHeights: true,
            blockUI: true,
            imagesLoaded: true,
            jQueryCookie: true,
            indexOf: true,
            webUIPopover: true,
            debounce: true,
            hawkslick: true,
            numeric: true,
            waitForImages: true,
            alertify: true
        }, HawkSearch.loadPlugins);

        containedHawkSearchInitializer(jQuery);
    }

    function jQueryLoaded() {
        log('Finalizing JS Component Binding');
        jQuery = window.jQuery.noConflict(true);

        log('Local jQuery version: ' + jQuery.fn.jquery);

        if (window.jQuery)
            log('Global jQuery version: ' + window.jQuery.fn.jquery);
        else {
            log('No Global jQuery present. Adding current jQuery');
            window.jQuery = jQuery;
        }

        HawkSearch.loadPlugins = {
            jQueryUI: true,
            slider: true,
            wNumb: true,
            matchHeights: true,
            blockUI: true,
            imagesLoaded: true,
            jQueryCookie: true,
            indexOf: true,
            webUIPopover: true,
            debounce: true,
            hawkslick: true,
            numeric: true,
            waitForImages: true,
            alertify: true
        }

        containedHawkSearchInitializer(jQuery);
    };

    //Since we're loading jQuery dynamically and are using callbacks, we need to store all of our
    //plugins inside a single function that passes $ aliased from our version of jQuery.
    function containedHawkSearchInitializer($) {

        // BEGIN Namespaced HawkSearch block.

        (function (HawkSearch, $) {
            HawkSearch.loadingtpl = '<img src="//manage.hawksearch.com/sites/shared/images/global/load.gif" style="margin:0 5px;vertical-align:middle; height:16px; width:16px; max-width:none;" />';
            HawkSearch.loadtimer = null;
            HawkSearch.scroll = false;
            HawkSearch.processing = false;

            HawkSearch.getHash = function () {
                var hashSplit = window.location.toString().split("#");
                if (hashSplit.length > 1) return hashSplit[1];
                return window.location.search.substring(1);
            };

            HawkSearch.lilBro = new HawkSearch.LilBro({
                server: HawkSearch.getHawkUrl(),
                server_ssl: HawkSearch.getHawkUrl() + ':443',
                watch_focus: false,
                watch_click: false,
                event_base: HawkSearch.EventBase,
                qs: encodeURIComponent(HawkSearch.getHash()),
                jQuery: $
            });

            HawkSearch.jQuery = $;

            HawkSearch.normalizeHeights = function () {
                var container = $("#hawkitemlist");
                var topcontainer = $("#hawkbannertop");
                var targetElement = container.find(".itemWrapper");

                // use imagesLoaded() plugin to detect if images are fully loaded
                // http://imagesloaded.desandro.com/
                var imgLoad = imagesLoaded(container);

                // Triggered after all images have been either loaded or confirmed broken.
                imgLoad.on("always", function (instance) {
                    log("Heights Normalize; No broken images");
                    // match heights of specified elements
                    container.find(".itemWrapper .itemImage").matchHeights();
                    container.find(".itemWrapper .itemTitle").matchHeights();
                    topcontainer.find(".itemWrapper .itemImage").matchHeights();
                    topcontainer.find(".itemWrapper .itemTitle").matchHeights();
                    targetElement.matchHeights({
                        extension: 3
                    });
                });

                // Triggered after all images have been loaded with at least one broken image.
                imgLoad.on('fail', function (instance) {
                    log("Heights Normalize; Broken image(s)");
                });

                // Triggered after each image has been loaded.
                imgLoad.on("progress", function (instance, image) {
                    var result = image.isLoaded ? 'loaded' : 'broken';
                    // check if image is broken
                    if (result === "broken") {
                        // in debug mode log broken image src
                        log('Image Broken: ' + image.img.src);
                        // change broken image src with spacer.gif and apply broken image class
                        image.img.src = "/sites/shared/images/spacer.gif";
                        image.img.className = "itemImage hawk-brokenImage";
                    };
                });
            };

            HawkSearch.regTracking = function () {
                log("Register Tracking");

                $(".hawk-bannerLink").each(function () {
                    var bannerId = $(this).data("bannerid");
                    HawkSearch.Tracking.writeBannerImpression(bannerId);
                });
            };

            HawkSearch.regSmartBug = function () {
                $('#aBug').click(function () {
                    if ($('#divSmartBug > ul').children().length > 0) {
                        $('#divSmartBugEye').hide();
                        $('#divSmartBugPinning').hide();
                        $('#divSmartBug').toggle('fast');
                        return false;
                    }
                    return true;
                });

                $('#aEye').click(function () {
                    if ($('#divSmartBugEye > ul').children().length > 0) {
                        $('#divSmartBug').hide();
                        $('#divSmartBugPinning').hide();
                        $('#divSmartBugEye').toggle('fast');
                        return false;
                    }
                    return true;
                });

                $('#aRefresh').off("click");
                $('#aRefresh').click(function () {
                    HawkSearch.resetSearch();
                });

                $("#divSmartBugEye .hawk-mutilbucket input[type=checkbox]").click(function (e) {
                    e.stopPropagation();
                });

                $("#divSmartBugEye a.hawk-mutilbucket").click(function (e) {
                    e.preventDefault();
                    var checkBox = $(this).find("input[type=checkbox]");
                    checkBox.prop("checked", !checkBox.prop("checked"));
                });


                $("#hawkBtnApplayVisitorTarget").click(function () {
                    var url = $("#hawkHdnBucketUrl").val();
                    var selectedBuckets = [];
                    $("#divSmartBugEye .hawk-mutilbucket input[type=checkbox]:checked").each(function () {
                        selectedBuckets.push($(this).data("hawkbucketid"));
                    });

                    if ($("#divSmartBugEye .hawk-mutilbucket input[type=checkbox]:checked").length === 0) {
                        selectedBuckets.push(0);
                    }

                    url = url.replace(/__bucket_ids__/i, selectedBuckets.join());
                    window.location.href = url;
                });

                if (typeof HawkPreviewDateTime !== 'undefined') {
                    HawkPreviewDateTime.registerPreviewDatetime();
                }
            }

            HawkSearch.regFacets = function () {
                log("Register Facets");

                // normalize heights across items in results list
                HawkSearch.normalizeHeights();

                HawkSearch.CurrencyFormat = function (n) {
                    var Format = wNumb({
                        prefix: '$',
                        decimals: 2,
                    });
                    return Format.to(n)
                }

                // initializes slider configuration for use with price range
                $("div.hawk-slideRange").each(function () {
                    var container = $(this),
                        options = container.data(),
                        minRange = options.minRange,
                        maxRange = options.maxRange,
                        stepSlide = options.stepRange,
                        minValueDisplay = container.siblings(".slider-min-value"),
                        maxValueDisplay = container.siblings(".slider-max-value");

                    var values = $(this).parent().find("input.hawk-sliderRangeInput").val().split(','),
                        minValue = parseInt(values[0]),
                        maxValue = parseInt(values[1]);

                    var numericFrom = $($(this).parent().find(".numeric-from"));
                    var numericTo = $($(this).parent().find(".numeric-to"));

                    var format = true;
                    var pips = {
                        mode: 'positions',
                        values: [0, 50, 100],
                        density: 4,
                    }

                    if ($(container).parent().find("input:last").val().toLowerCase() == "currency") {
                        format = wNumb({ decimals: 2, prefix: '$' });
                        pips = {
                            mode: 'positions',
                            values: [0, 50, 100],
                            density: 4,
                            format: format
                        }
                    }

                    noUiSlider.create(container[0], {
                        start: [minValue, maxValue],
                        connect: true,
                        tooltips: [format, format],
                        range: {
                            'min': minRange,
                            'max': maxRange
                        },
                        step: 1,
                        pips: pips
                    });

                    HawkSearch.PrefixClasses(container, "hawk-");
                    container[0].noUiSlider.on('update', function (values, handle) {
                        if ($(container).parent().find("input:last").val().toLowerCase() == "currency") {
                            $(numericFrom).val(HawkSearch.CurrencyFormat(parseFloat(values[0])));
                            $(numericTo).val(HawkSearch.CurrencyFormat(parseFloat(values[1])));
                        }
                        else {
                            $(numericFrom).val(parseFloat(values[0]));
                            $(numericTo).val(parseFloat(values[1]));
                        }
                    });

                    container[0].noUiSlider.on('change', function (values, handle) {
                        $(container).parent().find(".hawk-sliderRangeInput").val(values[0] + "," + values[1]);
                        HawkSearch.refreshUrl();
                    });
                });

                $("div.hawk-sliderNumeric").each(function () {
                    $(this).find(".hawk-numericInput").each(function (e) {
                        $(this).numeric();
                        $(this).blur(function () {
                            var val = parseFloat($(this).val().replace(/[^0-9\.]+/g, ""));

                            var type = $(this).data("type");
                            if (type == 'currency') {
                                $(this).val(HawkSearch.CurrencyFormat(parseFloat(val)));
                            }
                        })

                        $(this).on("focus", function () {
                            $(this).attr("data-orgval", $(this).val().replace(/[^0-9\.]+/g, ""));
                        });

                        $(this).on("change", function () {
                            var val = parseFloat($(this).val().replace(/[^0-9\.]+/g, ""));
                            var minValue = parseFloat($(this).data("min"));
                            var maxValue = parseFloat($(this).data("max"));
                            var isInvalid = false;

                            var numericFrom = $($(this).parent().find(".numeric-from"));
                            var numericTo = $($(this).parent().find(".numeric-to"));

                            var fromVal = parseFloat(numericFrom.val().replace(/[^0-9\.]+/g, ""));
                            var toVal = parseFloat(numericTo.val().replace(/[^0-9\.]+/g, ""));

                            var orgval = parseFloat($(this).data("orgval"));
                            if (val < minValue || val > maxValue || fromVal > toVal) {
                                val = orgval;
                                isInvalid = true;
                            }

                            var type = $(this).data("type");
                            if (type == 'currency') {
                                $(this).val(HawkSearch.CurrencyFormat(parseFloat(val)));
                            } else {
                                $(this).val(val);
                            }
                            if (isInvalid) {
                                return;
                            }

                            //Set Slider Values
                            $(this).parents(".hawk-slideFacet").find("input.hawk-sliderRangeInput").val(fromVal + ',' + toVal);
                            HawkSearch.refreshUrl();
                        });
                    })
                });

                // configures truncated list functionality
                $(".hawk-navTruncateList").each(function () {
                    var cont = $(this);
                    var listItems = cont.children("li");
                    var options = cont.data().options;

                    var moreItems = listItems.filter(function (index) {
                        return index >= options.cutoff;
                    });

                    if (moreItems.length == 0) {
                        return;
                    }
                    // only hide if not already expanded
                    if (!window["hawkexpfacet_" + cont.attr("id")])
                        moreItems.hide();

                    var moreLess = $("<li class='hawk-navMore'><span>" + options.moreText + "</span></li>");
                    cont.append(moreLess);
                    moreLess.children("span").click(function (event) {
                        var moreTrigger = $(this);
                        if ($(this).hasClass("hawk-navMoreActive")) {
                            moreItems.hide();
                            moreTrigger.removeClass("hawk-navMoreActive").closest("span").text(options.moreText);
                            window["hawkexpfacet_" + cont.attr("id")] = null;
                        } else {
                            moreItems.show();
                            moreTrigger.addClass("hawk-navMoreActive").closest("span").text(options.lessText);
                            window["hawkexpfacet_" + cont.attr("id")] = true;
                        };
                    });

                    if (window["hawkexpfacet_" + cont.attr("id")]) cont.find(".hawk-navMore span").click();

                });




                // this handles the mouse hovers and click states for the hawk nav
                $(".hawkRailNav").delegate(".hawk-navGroup li > a", "mouseover mouseout click", function (event) {

                    var facetCont = $(this).parent();

                    if (event.type == "mouseover") {
                        facetCont.addClass("hawkFacet-hover");
                    } else if (event.type == "mouseout") {
                        facetCont.removeClass("hawkFacet-hover");
                    } else if (event.type == "click") {
                        event.preventDefault();
                        if (facetCont.hasClass("hawkFacet-indetermined")) {
                            facetCont.removeClass("hawkFacet-indetermined")
                            facetCont.addClass("hawkFacet-active");
                            facetCont.find("> ul > li ").removeClass("hawkFacet-active");
                        } else {
                            facetCont.toggleClass("hawkFacet-active");
                        }

                        $(facetCont).find(".hawkFacet-active").removeClass("hawkFacet-active");
                        $(facetCont).parentsUntil(".hawk-navGroupContent", "ul").each(function () {
                            var parentUl = $(this);
                            var activeCount = parentUl.find("li.hawkFacet-active").length;
                            var allCount = parentUl.find("li").length;
                            if (allCount > 0) {
                                var closestLi = $(this).closest("li");
                                closestLi.removeClass("hawkFacet-active");
                                closestLi.addClass("hawkFacet-indetermined");
                            }
                        });
                    };
                });

                // initializes filter quicksearch
                $('.hawk-quickSearch input').each(function () {
                    var searchInput = $(this);
                    searchInput.filterThatList({
                        list: searchInput.parent().next()
                    });
                });

                // handles collapsible display on larger screens
                $(".hawk-guidedNavWrapper .hawk-collapsible .hawk-groupHeading").on("click", function () {
                    var facetGroup = $(this).closest(".hawk-navGroup");
                    var fgHeightBefore = facetGroup.outerHeight();
                    facetGroup.toggleClass("hawk-collapsed");
                    var fgHeightAfter = facetGroup.outerHeight();
                    if ($(".hawk-facetScollingContainer").length && $(".hawk-facetScollingContainer").position().top > 0) {
                        var menuHeight = $(".hawk-facetScollingContainer").outerHeight();
                        var maxOffset = $(".footer").offset().top;
                        var menuOffset = $(".hawk-facetScollingContainer").offset().top;
                        if (menuHeight + menuOffset > maxOffset) {
                            var offset = $(".hawk-facetScollingContainer").position().top;
                            offset = offset - (menuHeight + menuOffset - maxOffset) - 10;
                            $(".hawk-facetScollingContainer").css("top", offset + "px");
                        }

                        HawkSearch.SetFacetScrollPosition();
                    }

                    var fieldName = facetGroup.attr("data-field");
                    var collapsed = false;
                    if (facetGroup.hasClass("hawk-collapsed")) {
                        collapsed = true;
                    }
                    $.cookie(fieldName, collapsed, { expires: 365 });
                });

                // Handles Expanding and Collapsing of the nested facet
                $(".hawk-nestedfacet .hawk-collapseState").on("click", function () {
                    $(this).toggleClass("hawk-collapsed");
                    $(this).next().toggleClass("hawk-collapse");
                });

                $(".hawk-guidedNavWrapper .hawk-collapsible").each(function () {
                    var fieldName = $(this).attr("data-field");
                    var visible = $.cookie(fieldName);
                    if (visible == 'true') {
                        $(this).addClass("hawk-collapsed");
                    } else if (visible == 'false') {
                        $(this).removeClass("hawk-collapsed");
                    }
                });

                // bind click event to filter heading to hide/show for small devices
                $(".hawk-railNavHeading").on("click", function () {
                    var railNavHeading = $(this);
                    var hawkNavFilters = railNavHeading.next(".hawkRailNav");
                    railNavHeading.toggleClass("hawk-railNavHeadingActive");
                    hawkNavFilters.toggleClass("hawk-notCollapsed");
                });

                // bind click event to filter group heading to hide/show for small devices
                $(".hawk-guidedNavWrapper .hawk-navGroup .hawk-groupHeading").on("click", function () {
                    var facetGroup = $(this).closest(".hawk-navGroup");
                    facetGroup.toggleClass("hawk-notCollapsed");
                });

                HawkSearch.regSmartBug();

                $("table.compTbl div.itemWrapper .itemPrice").matchHeights();

                $(".hawk-nestedfacet .hawkFacet-active").each(function () {
                    $(this).children("ul").removeClass("hawk-collapse")
                    $(this).children(".hawk-collapseState").removeClass("hawk-collapsed");

                    $(this).parentsUntil(".hawk-navGroup", ".hawk-facetgroup").removeClass("hawk-collapse");
                    $(this).parentsUntil(".hawk-navGroup", "li").each(function () {
                        $(this).children(".hawk-collapseState").removeClass("collapsed");
                    });
                });

                $(".hawk-nestedfacet ul >.hawkFacet-active").each(function () {
                    var parents = $(this).parentsUntil(".hawk-navGroupContent", "ul").each(function () {
                        var parentUl = $(this);
                        var activeCount = parentUl.find("li.hawkFacet-active").length;
                        var allCount = parentUl.find("li").length;
                        if (allCount > 0) {
                            var closestLi = $(this).closest("li");
                            closestLi.removeClass("hawkFacet-active");
                            closestLi.addClass("hawkFacet-indetermined");
                        }
                    });

                });

                // initialize bootstrap datepicker
                $('.bootstrap-datepicker').each(function () {
                    $(this).datepicker({
                        orientation: "top",
                        autoclose: true,
                        format: "mm/dd/yyyy",
                        startDate: new Date($(this).attr("data-date-min")),
                        endDate: new Date($(this).attr("data-date-max")),
                    });
                    $(this).datepicker().on('changeDate', function (ev) {
                        var date = ev.date;
                        var yyyy = date.getFullYear().toString();
                        var mm = (date.getMonth() + 1).toString();
                        var dd = date.getDate().toString();
                        var mmChars = mm.split('');
                        var ddChars = dd.split('');
                        var datestring = yyyy + (mmChars[1] ? mm : "0" + mmChars[0]) + (ddChars[1] ? dd : "0" + ddChars[0]);
                        var datefrom, dateto;
                        if ($(this).hasClass("numeric-from")) {
                            //$(this).attr('data-min', datestring);
                            datefrom = datestring;
                            var datetoarr = $("#enddate").val().split("/");
                            dateto = datetoarr[2] + datetoarr[0] + datetoarr[1];
                        }
                        else if ($(this).hasClass("numeric-to")) {
                            //$(this).attr('data-max', datestring);
                            dateto = datestring;
                            var datefromarr = $("#startdate").val().split("/");
                            datefrom = datefromarr[2] + datefromarr[0] + datefromarr[1];
                        }
                        $(this).parent().find(".hawk-dateSliderInput").val(datefrom + "," + dateto);
                        HawkSearch.refreshUrl();
                    });
                });


                if ($(window).scrollTop() > 0) {
                    $('html,body').animate({ scrollTop: 0 }, 500, function () { HawkSearch.scroll = false; HawkSearch.hideBlockUI(); });
                } else {
                    HawkSearch.scroll = false; HawkSearch.hideBlockUI();
                }
            };

            HawkSearch.refreshUrl = function (event, forceReload) {
                $("#hdnhawkcompare").val(window['hawktocompare'].join(","));

                var qs = "";
                var prevName = "";
                var vals = "";
                var keyword = $("#hdnhawkkeyword").val();
                var prv = $("#hdnhawkprv").val();
                var lp = $("#hdnhawklp").val();
                var adv = $("#hdnhawkadv").val();
                var searchWithin = $("#searchWithin").val();
                var pg = $("#hdnhawkpg").val();
                var mpp = $("#hdnhawkmpp").val();
                var sort = $("#hdnhawksortby").val();
                var it = $("#hdnhawkit").val();
                var items = $("#hdnhawkcompare").val();
                var operator = $("#hdnhawkoperator").val();
                var expand = $("#hdnhawkexpand").val();
                var hawkb = $("#hdnhawkb").val();
                var defaultmpp = $("#hdnhawkdefaultmpp").val();
                var keywordfield = $("#hdnhawkkeywordfield").val();
                var previewDate = typeof smartbugDatetimepicker != 'undefined' ? smartbugDatetimepicker.hawkDate : null;
                var hawkflags = $('#hdnhawkflags').val();
                var aid = $("#hdnhawkaid").val();
                var hawkp = $("#hdnhawkp").val();
                var product_list_mode = $("#hdnproductlistmode").val();

                if (keyword && keyword !== "") qs += (qs === "" ? "" : "&") + keywordfield + "=" + encodeURIComponent(keyword);
                if (prv && prv !== "") qs += (qs === "" ? "" : "&") + "prv=" + encodeURIComponent(prv);
                if (lp && lp !== "") qs += (qs === "" ? "" : "&") + "lp=" + encodeURIComponent(lp);
                if (adv && adv !== "") qs += (qs === "" ? "" : "&") + "adv=" + encodeURIComponent(adv);
                if (searchWithin && searchWithin !== "") qs += (qs === "" ? "" : "&") + "searchWithin=" + encodeURIComponent(searchWithin);
                if (sort && sort !== "") qs += (qs === "" ? "" : "&") + "sort=" + encodeURIComponent(sort);
                if (it && it !== "") qs += (qs === "" ? "" : "&") + "it=" + encodeURIComponent(it);
                if (items && items !== "") qs += (qs === "" ? "" : "&") + "items=" + encodeURIComponent(items);
                if (operator && operator !== "") qs += (qs === "" ? "" : "&") + "operator=" + encodeURIComponent(operator);
                if (expand && expand !== "") qs += (qs === "" ? "" : "&") + "expand=" + encodeURIComponent(expand);
                if (hawkb && hawkb !== "") qs += (qs === "" ? "" : "&") + "hawkb=" + encodeURIComponent(hawkb);
                if (previewDate) qs += (qs === "" ? "" : "&") + "HawkDate=" + previewDate;
                if (hawkflags && hawkflags !== "") qs += (qs === "" ? "" : "&") + "hawkflags=" + encodeURIComponent(hawkflags);
                if (aid && aid !== "") qs += (qs === "" ? "" : "&") + "hawkaid=" + encodeURIComponent(aid);
                if (hawkp && hawkp !== "") qs += (qs === "" ? "" : "&") + "hawkp=" + encodeURIComponent(hawkp);
                if (product_list_mode && product_list_mode !== "") qs += (qs === "" ? "" : "&") + "product_list_mode=" + encodeURIComponent(product_list_mode);

                $(".hawk-facetFilters li.hawkFacet-active > a").each(function () {
                    var options = $(this).data().options;
                    if (options.name !== prevName) {
                        if (vals !== "") qs += (qs === "" ? "" : "&") + encodeURIComponent(prevName) + '=' + vals;
                        vals = "";
                    }
                    vals += (vals === "" ? "" : ",") + encodeURIComponent(options.value.replace(/,/g, "%c%"));
                    prevName = options.name;
                });

                if (prevName !== "" && vals !== "") qs += (qs === "" ? "" : "&") + encodeURIComponent(prevName) + '=' + vals;
                $(".hawk-sliderRangeInput").each(function () {
                    if ($(this).val() !== "") {
                        var values = $(this).val().split(",");
                        if (values.length === 2) {
                            var sliderRange = $(this).parent().find(".hawk-slideRange");
                            var min = sliderRange.data().minRange;
                            var max = sliderRange.data().maxRange;
                            if (parseFloat(values[0]) !== parseFloat(min) || parseFloat(values[1]) !== parseFloat(max)) {
                                qs += (qs === "" ? "" : "&") + encodeURIComponent($(this).attr("name")) + '=' + encodeURIComponent(values[0]) + ',' + encodeURIComponent(values[1]);
                            }
                        }
                    }
                });

                $(".hawk-dateSliderInput").each(function () {
                    if ($(this).val() !== "") {
                        var values = $(this).val().split(",");
                        if (values.length === 2) {
                            var min = $(this).parent().find(".hawk-dateMinRange").val();
                            var max = $(this).parent().find(".hawk-dateMaxRange").val();
                            if (parseFloat(values[0]) !== parseFloat(min) || parseFloat(values[1]) !== parseFloat(max)) {
                                qs += (qs === "" ? "" : "&") + encodeURIComponent($(this).attr("name")) + '=' + encodeURIComponent(values[0]) + ',' + encodeURIComponent(values[1]);
                            }
                        }
                    }
                });

                if (mpp && mpp !== "" && mpp !== defaultmpp) qs += (qs === "" ? "" : "&") + "mpp=" + encodeURIComponent(mpp);
                if (pg && pg !== "" && pg !== "1") qs += (qs === "" ? "" : "&") + "pg=" + encodeURIComponent(pg);

                // cancel refresh if hash is not changed
                if (window.location.hash === "#" + qs) {
                    return;
                }

                if (HawkSearchLoader.disableAjax || forceReload) {
                    var url = window.location.toString();
                    if (url.indexOf("?") > -1) url = url.substring(0, url.indexOf("?"));
                    if (url.indexOf("#") > -1) url = url.substring(0, url.indexOf("#"));
                    window.location = url + '?' + qs;
                } else {
                    if (window.location.hash !== "" || qs !== "") {
                        var scroll = $(document).scrollTop();

                        window.history.pushState({}, {}, "?" + qs);
                        HawkSearch.refreshResults();

                        if (qs === "") {
                            $(document).scrollTop(scroll);
                        }
                    }
                    else if (qs === "") {
                        window.history.pushState({}, {}, window.location.pathname);
                        HawkSearch.refreshResults();
                    }

                }

            };

            HawkSearch.resetSearch = function () {
                $("#hdnhawkpg").val(1);
                if (window.location.hash !== "") {
                    window.location.hash += "&";
                }
                HawkSearch.clearAllFacets();
            }

            HawkSearch.getCustomUrl = function () {
                var lpurl = window.location.pathname;
                if (lpurl.indexOf('/preview.aspx') >= 0) {
                    lpurl = '';
                }
                if (lpurl.indexOf('/search/') >= 0) {
                    lpurl = '';
                }
                return lpurl;
            };
            HawkSearch.IsExplainPopupOpen = false;

            HawkSearch.getPinFunctionUrl = function (f, itemId) {
                var keywordField = $('#hdnhawkkeywordfield').val();
                var keyword = HawkSearch.getHashOrQueryVariable(keywordField);
                var lpurl = HawkSearch.getCustomUrl();
                var lpId = $("#hdnhawklp").val();
                var ssfid = $("#hdnhawkssfid").val();
                var previewDate = typeof smartbugDatetimepicker != 'undefined' ? smartbugDatetimepicker.hawkDate : '';
                return HawkSearch.BaseUrl + "/?fn=ajax&f=" + f + "&itemId=" + encodeURIComponent(itemId) + "&" + keywordField + "=" + keyword + "&lp=" + encodeURIComponent(lpId) + "&lpurl=" + encodeURIComponent(lpurl) + "&hawkb=" + HawkSearch.getHashOrQueryVariable("hawkb") + "&hawkaid=" + HawkSearch.getHashOrQueryVariable("hawkaid") + "&hawkp=" + HawkSearch.getHashOrQueryVariable("hawkp") + "&HawkDate=" + previewDate + "&ssfid=" + encodeURIComponent(ssfid);
            }

            HawkSearch.addToTop = function (el, itemId) {

                var url = HawkSearch.getPinFunctionUrl("AddItemToTop", itemId);
                var currentEl = el;
                $.ajax({
                    type: "GET",
                    async: true,
                    context: el,
                    contentType: "application/json; charset=utf-8",
                    url: url,
                    dataType: "jsonp",
                    success: function () {
                        log("Added item to top");
                        var parentContainer = $(this).parents(".grid_3");
                        parentContainer.addClass("hawk-itemPinned");
                        parentContainer.find(".hawk-preview-info").append("<span class='hawkIcon-itemPinned'></span>");
                        $(".itemWrapper.hawk-itemWrapper").removeClass("hawk-itemPinned hawk-preview-info");
                        HawkSearch.PopoverAction($(this).parents(".popover"), 'hide');
                    },
                    error: function (e) {
                        log("ERROR: Add item to top " + e);
                    }
                });
            }

            HawkSearch.unpinItem = function (el, itemId) {
                var keywordField = $('#hdnhawkkeywordfield').val();
                var keyword = HawkSearch.getHashOrQueryVariable(keywordField);
                var lpurl = HawkSearch.getCustomUrl();
                var lpId = $("#hdnhawklp").val();
                var url = HawkSearch.getPinFunctionUrl("UnpinItem", itemId);

                $.ajax({
                    type: "GET",
                    async: true,
                    contentType: "application/json; charset=utf-8",
                    url: url,
                    context: el,
                    dataType: "jsonp",
                    success: function () {
                        log("Unpin item");
                        var parentContainer = $(this).parents(".grid_3");
                        parentContainer.removeClass("hawk-itemPinned");
                        parentContainer.find(".hawkIcon-itemPinned").remove();
                        HawkSearch.PopoverAction($(this).parents(".popover"), 'hide');
                    },
                    error: function (e) {
                        log("ERROR: Unpin item " + e);
                    }
                });
            };

            HawkSearch.updatePinOrder = function (itemOrder) {
                var url = HawkSearch.getPinFunctionUrl("UpdateItemPinOrder", 0);
                url += "&itemList=" + encodeURIComponent(itemOrder);

                $.ajax({
                    type: "GET",
                    async: true,
                    contentType: "application/json; charset=utf-8",
                    url: url,
                    dataType: "jsonp",
                    success: function () {
                        log("UpdateItemPinOrder");
                    },
                    error: function (e) {
                        log("ERROR: UpdateItemPinOrder " + e);
                    }
                });
            }

            HawkSearch.explain = function (docid) {
                if (HawkSearch.IsExplainPopupOpen) {
                    return;
                }

                HawkSearch.IsExplainPopupOpen = true;

                var keyword = $("#hdnhawkkeyword").val();
                var keywordField = $("#hdnhawkkeywordfield").val();
                var keywordfromQuery = HawkSearch.getHashOrQueryVariable(keywordField);
                var hash = window.location.search.substring(1);
                if (keyword.toLowerCase() != decodeURIComponent(keywordfromQuery.toLowerCase().replace(/\+/g, " "))) {
                    hash = hash.replace(keywordField + '=' + keywordfromQuery, keywordField + '=' + encodeURIComponent(keyword));
                }
                if (hash === "" || (window.location.search.substring(1) !== "" && window.location.href.indexOf("#") > -1)) hash = HawkSearch.getHash();

                var lpurl = HawkSearch.getCustomUrl();
                var hawkcustom = $("#hdnhawkcustom").val();
                var full = HawkSearch.BaseUrl + "/?" + hash + "&ajax=1&json=1&docid=" + encodeURIComponent(docid) + (lpurl != '' ? "&lpurl=" + encodeURIComponent(lpurl) : "") + (hawkcustom != '' ? "&hawkcustom=" + encodeURIComponent(hawkcustom) : "");
                full += "&hawkvisitorid=" + HawkSearch.lilBro.event.getVisitorId()

                $.ajax({ "type": "GET", "data": "", "async": "false", "contentType": "application/json; charset=utf-8", "url": full, "dataType": "jsonp", "success": HawkSearch.showAjaxPopup });
            };

            HawkSearch.loadMoreLikeThis = function (event, arg) {
                var argsArr = arg.split('|');
                var pk = argsArr[0];
                var trackingId = HawkSearch.lilBro.getTrackingId();
                if (argsArr.length >= 3) {
                    trackingId = argsArr[2];
                }
                HawkSearch.Tracking.writeClick(event, 0, true, pk, trackingId);

                var url = HawkSearch.BaseUrl + "/default.aspx?fn=ajax&f=MoreLikeThis&args=" + arg;

                $.ajax({
                    "type": "GET",
                    "data": "",
                    "async": "false",
                    "contentType": "application/json; charset=utf-8",
                    "url": url,
                    "dataType": "jsonp",
                    "success": function (data) {
                        HawkSearch.showDialog("More Like This", data.Html);
                    }
                });
            };

            HawkSearch.HawkSubmit = (function (e) {
                var field = $(e).find('input[name=' + $('#hdnhawkkeywordfield').val() + ']');
                var keywords = $(field).val();
                var id = $(field).attr('id')
                if (!(field.length == 0 && $('#hdnhawkkeyword').length == 0)) {
                    if ((keywords == HawkSearch.SuggesterGlobal.defaultKeyword[id]) || (keywords == $('#hdnhawkkeyword').val())) {
                        return false;
                    }
                }
                return true;
            });

            HawkSearch.showAjaxPopup = function (json) {
                var html = json.html;
                var objs = $(html);

                var obj = objs.find("#hawkexplain");
                if (obj != null && obj.length > 0) $("#divAjaxPopupContent").html(obj.html());
                HawkSearch.showDialog("Item Information", obj.html());
                HawkSearch.IsExplainPopupOpen = false;
            };

            HawkSearch.hideBlockUI = function () {
                if (HawkSearch.processing || HawkSearch.scroll) {
                    return;
                }
                $.unblockUI({ "fadeOut": 0 });
            };

            HawkSearch.showBlockUI = function () {
                $.blockUI({ "message": HawkSearch.loadingtpl, "fadeIn": 0, overlayCSS: { backgroundColor: '#fff', opacity: 0.5, cursor: 'wait' }, "css": { "borderWidth": "0px", top: ($(window).height() - 100) / 2 + 'px', left: ($(window).width()) / 2 + 'px', width: '0px' } });
            };

            HawkSearch.showRecsBlockUI = function () {
                $(".hawk-recommendation").css("height", "100px");
                $(".hawk-recommendation").block({ "message": HawkSearch.loadingtpl, "fadeIn": 0, overlayCSS: { backgroundColor: '#fff', opacity: 0.5, cursor: 'wait' }, "css": { "borderWidth": "0px", top: ($(window).height() - 100) / 2 + 'px', left: ($(window).width()) / 2 + 'px', width: '0px' } });
            };

            HawkSearch.showDialog = function (title, message) {
                if (!alertify.myAlert) {
                    //setting defaults
                    alertify.defaults.transition = "slide";
                    alertify.defaults.theme.ok = "btn btn-primary";
                    alertify.defaults.theme.cancel = "btn btn-danger";
                    alertify.defaults.theme.input = "form-control";
                    alertify.defaults.glossary.title = title;

                    //define a new dialog
                    alertify.dialog('myAlert', function () {
                        return {
                            main: function (message) {
                                this.message = message;
                            },
                            setup: function () {
                                return {
                                    buttons: [{ text: "Close", key: 27 }],
                                    options: {
                                        maximizable: false,
                                        resizable: false,
                                        movable: false
                                    }
                                };
                            },
                            prepare: function () {
                                this.setContent(this.message);
                            },
                            build: function () {
                                HawkSearch.PrefixClasses(this.elements.root, "hawk-");
                            }

                        }
                    });
                }
                alertify.myAlert(message);
            }




            HawkSearch.hideRecsBlockUI = function () {
                $(".hawk-recommendation").css("height", "auto");
                $(".hawk-recommendation").unblock({ "fadeOut": 0 });
            };

            HawkSearch.refreshResults = function (backbutton) {

                log('RefreshResults');

                if ($("#hawkitemlist").length > 0) {
                    HawkSearch.processing = true;
                    HawkSearch.showBlockUI();
                    var lpurl = HawkSearch.getCustomUrl();
                    var hash = HawkSearch.getHash();
                    var hawkcustom = $("#hdnhawkcustom").val();
                    var queryGuid = $("#hdnhawkquery").val();
                    var full = HawkSearch.BaseUrl + "/?" + (hash != '' ? hash + '&' : '') + "ajax=1&json=1" + (lpurl != '' ? "&lpurl=" + encodeURIComponent(lpurl) : "") + (hawkcustom != '' ? "&hawkcustom=" + encodeURIComponent(hawkcustom) : "");
                    full += '&hawkvisitorid=' + HawkSearch.lilBro.event.getVisitorId();


                    // notice we use global jQuery to be able to track global events for ajax calls
                    // used by miniprofiler and possibly other libraries
                    window.jQuery.ajax({
                        "type": "GET",
                        "data": "",
                        "async": "true",
                        "contentType": "application/json; charset=utf-8",
                        "url": full,
                        "dataType": "json",
                        "success": function (json) {
                            HawkSearch.processFacets(hash, json, queryGuid);
                        }
                    });
                };
            };

            HawkSearch.getUrl = function () {
                var url = window.location.toString();
                if (url.indexOf("?") > -1) url = url.substring(0, url.indexOf("?"));
                if (url.indexOf("#") > -1) url = url.substring(0, url.indexOf("#"));

                return url;
            };


            HawkSearch.copyValue = function (objs, name) {
                var obj = objs.find(name);
                if (obj != null && obj.length > 0) $(name).html(obj.html());
            };

            HawkSearch.copyCustomBanners = function (objs) {

                $(objs).find(".hawk-bannerZone").each(function () {
                    var name = "#" + $(this).attr("id");
                    var obj = objs.find(name);
                    if (obj != null && obj.length > 0 && obj.html().trim() != "") {
                        if ($("#hdnhawkprv").val() == "1") {
                            $(obj).prepend('<span class="hawk-customBannerTitle">' + obj.attr("title") + '</span>')
                        }
                        $(name).html(obj.html());
                    }
                    else {
                        $(name).html("");
                    }
                })
            };

            HawkSearch.processFacets = function (hash, json, queryGuid, backbutton) {
                var html = json.html;
                var location = json.location;
                if (!location == '') {
                    window.location.replace(location);
                }

                // update the page contents
                var objs = $(html);
                var obj;
                HawkSearch.copyValue(objs, "#hawktitle");
                HawkSearch.copyValue(objs, "#hawkitemlist");
                HawkSearch.copyValue(objs, "#hawktoptext");
                HawkSearch.copyValue(objs, "#hawkfacets");
                HawkSearch.copyValue(objs, "#hawkbreadcrumb");
                HawkSearch.copyValue(objs, "#hawktoppager");
                HawkSearch.copyValue(objs, "#hawkbottompager");
                HawkSearch.copyValue(objs, "#hawkbannertop");
                HawkSearch.copyValue(objs, "#hawkbannerbottom");
                HawkSearch.copyValue(objs, "#hawkfirstitem");
                HawkSearch.copyValue(objs, "#hawklastitem");
                HawkSearch.copyValue(objs, "#hawkbannerlefttop");
                HawkSearch.copyValue(objs, "#hawkbannerleftbottom");
                HawkSearch.copyValue(objs, "#hawksmartbug");
                HawkSearch.copyValue(objs, "#hdnhawktrackingid");
                HawkSearch.copyValue(objs, "#hawktabs");
                HawkSearch.copyValue(objs, '#hawkflags');
                HawkSearch.copyValue(objs, '#hawkaid');
                HawkSearch.copyValue(objs, '#hawkp');

                HawkSearch.triggerUpdateMultipleWishlist(json.multiple_wishlist)
                HawkSearch.triggerUpdateRequisitionList()

                HawkSearch.copyCustomBanners(objs);

                if (queryGuid !== undefined) {
                    $("#hdnhawkquery").val(queryGuid);
                }

                // related terms are loaded only first time
                if ($("#hawkrelated").html() == '') {
                    HawkSearch.copyValue(objs, "#hawkrelated");
                }

                obj = objs.find("#errormsg");
                if (obj != null && obj.length > 0) alert(obj.html());

                // register trackingre
                HawkSearch.regTracking();
                HawkSearch.Tracking.writeSearch();

                // register facets (sliders, etc)
                HawkSearch.regFacets();

                if ($.isFunction(HawkCompare.reload)) HawkCompare.reload();

                // clear the pager click and the loading timer & unblock the page
                HawkSearch.processing = false;
                clearTimeout(HawkSearch.loadtimer);
                HawkSearch.hideBlockUI();
                if (HawkSearch.GetRecentSearches !== undefined) {
                    HawkSearch.GetRecentSearches();
                }
                HawkSearch.BindPreviewInformation();
                HawkSearch.BindFacetTooltip();
                HawkSearch.BindBackToTop();

                if ($(window).scrollTop() > 0 && !backbutton) {
                    $('html,body').animate({ scrollTop: 0 }, 500, function () { HawkSearch.scroll = false; HawkSearch.hideBlockUI(); });
                } else {
                    HawkSearch.scroll = false; HawkSearch.hideBlockUI();
                }

            };

            /**
             * Update Multiple wishlist widget on PLP after ajax content reloading
             */
            HawkSearch.triggerUpdateMultipleWishlist = function(widgetData) {
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
            }

            /**
             * Update Requisition list widget on PLP after ajax content reloading
             */
            HawkSearch.triggerUpdateRequisitionList = function() {
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

            HawkSearch.clearAllFacets = function () {
                var keyword = $("#hdnhawkkeyword").val();
                var prv = $("#hdnhawkprv").val();
                var lp = $("#hdnhawklp").val();
                var adv = $("#hdnhawkadv").val();
                var mpp = $("#hdnhawkmpp").val();
                var sort = $("#hdnhawksortby").val();
                var it = $("#hdnhawkit").val();
                var items = $("#hdnhawkcompare").val();
                var operator = $("#hdnhawkoperator").val();
                var expand = $("#hdnhawkexpand").val();
                var hawkb = $("#hdnhawkb").val();
                var defaultmpp = $("#hdnhawkdefaultmpp").val();
                var keywordfield = $("#hdnhawkkeywordfield").val();
                var hawkflags = $('#hdnhawkflags').val();
                var aid = $("#hdnhawkaid").val();
                var qs = '';

                if (keyword && keyword !== "") qs += (qs === "" ? "" : "&") + keywordfield + "=" + encodeURIComponent(keyword);
                if (prv && prv !== "") qs += (qs === "" ? "" : "&") + "prv=" + encodeURIComponent(prv);
                if (lp && lp !== "") qs += (qs === "" ? "" : "&") + "lp=" + encodeURIComponent(lp);
                if (adv && adv !== "") qs += (qs === "" ? "" : "&") + "adv=" + encodeURIComponent(adv);
                if (mpp && mpp !== "" && mpp !== defaultmpp) qs += (qs === "" ? "" : "&") + "mpp=" + encodeURIComponent(mpp);
                if (sort && sort !== "") qs += (qs === "" ? "" : "&") + "sort=" + encodeURIComponent(sort);
                if (it && it !== "") qs += (qs === "" ? "" : "&") + "it=" + encodeURIComponent(it);
                if (items && items !== "") qs += (qs === "" ? "" : "&") + "items=" + encodeURIComponent(items);
                if (operator && operator !== "") qs += (qs === "" ? "" : "&") + "operator=" + encodeURIComponent(operator);
                if (expand && expand !== "") qs += (qs === "" ? "" : "&") + "expand=" + encodeURIComponent(expand);
                if (hawkb && hawkb !== "") qs += (qs === "" ? "" : "&") + "hawkb=" + encodeURIComponent(hawkb);
                if (hawkflags && hawkflags !== "") qs += (qs === "" ? "" : "&") + "hawkflags=" + encodeURIComponent(hawkflags);
                if (aid && aid !== "") qs += (qs === "" ? "" : "&") + "hawkaid=" + encodeURIComponent(aid);

                if (HawkSearchLoader.disableAjax) {
                    var url = window.location.toString();
                    if (url.indexOf("?") > -1) url = url.substring(0, url.indexOf("?"));
                    if (url.indexOf("#") > -1) url = url.substring(0, url.indexOf("#"));
                    window.location = url + '?' + qs;
                } else {
                    if (qs) {
                        window.history.pushState({}, {}, "?" + qs);
                        HawkSearch.refreshResults();
                    } else {
                        window.history.pushState({}, {}, window.location.pathname);
                        HawkSearch.refreshResults();
                    }

                }
            };

            HawkSearch.getHashOrQueryVariable = function (variable) {
                var query = HawkSearch.getHash();
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0].toLowerCase() == variable.toLowerCase()) {
                        return pair[1];
                    }
                }
                return HawkSearch.getQueryVariable(window.location.search.substring(1), variable);
            };

            HawkSearch.getQueryVariable = function (url, variable) {
                if (variable === undefined || variable === null) {
                    return "";
                }

                var query = url;
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0].toLowerCase() == variable.toLowerCase()) {
                        return pair[1];
                    }
                }
                return "";
            };

            HawkSearch.getRecommenderUrl = function () {
                if (HawkSearch.RecommenderUrl === undefined || HawkSearch.RecommenderUrl === "") {
                    return null;
                }
                else {
                    return HawkSearch.RecommenderUrl;
                }
            }

            HawkSearch.link = function (event, id, i, pk, mlt) {
                if (event.currentTarget === undefined || event.currentTarget.href === undefined) {
                    return true;
                }

                if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) {
                    HawkSearch.Tracking.writeClick(event, i, mlt, pk, id);
                }
                else if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSql) {
                    HawkSearch.Tracking.writeClick(event, i, mlt, pk, id);
                    HawkSearch.Tracking.V1.link(event, id, i, pk, mlt);
                }
                else {
                    HawkSearch.Tracking.V1.link(event, id, i, pk, mlt);
                }

                return true;
            };

            HawkSearch.bannerLink = function (el, id) {
                if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) {
                    HawkSearch.Tracking.writeBannerClick(el, id);
                }
                else if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSql) {
                    HawkSearch.Tracking.writeBannerClick(el, id);
                    HawkSearch.Tracking.V1.bannerLink(el, id);
                }
                else {
                    HawkSearch.Tracking.V1.bannerLink(el, id);
                }

                return true;
            };

            // HawkSearch Suggest initialize
            HawkSearch.suggestInit = function (queryField, settings) {
                $.fn.hawksearchSuggest = function (settings) {
                    settings = $.extend({
                        isAutoWidth: false,
                        isInstatSearch: false,
                        value: $('#hdnhawkkeyword').val()
                    }, settings);

                    return this.each(function () {
                        var suggestQueryField = $(this);
                        var opts = optionsHandler(suggestQueryField, settings);
                    });

                    // configures options and settings for hawk search suggest
                    function optionsHandler(suggestQueryField, settings) {
                        var suggestQueryFieldNode = suggestQueryField[0];

                        // for some reason, Firefox 1.0 doesn't allow us to set autocomplete to off
                        // this way, so you should manually set autocomplete="off" in the input tag
                        // if you can -- we'll try to set it here in case you forget
                        suggestQueryFieldNode.autocomplete = "off";

                        $(suggestQueryField).val(settings.value);
                        HawkSearch.SuggesterGlobal.defaultKeyword[$(suggestQueryField).attr('id')] = settings.value;
                        suggestQueryField.on("keyup", keypressHandler);

                        suggestQueryField.on("focus", function (e) {
                            HawkSearch.SuggesterGlobal.focus = true;
                            this.value = '';
                        });

                        if (settings.hiddenDivName) {
                            HawkSearch.SuggesterGlobal.divName = settings.hiddenDivName;
                        } else {
                            HawkSearch.SuggesterGlobal.divName = "querydiv";
                        };

                        // This is the function that monitors the queryField, and calls the lookup functions when the queryField value changes.
                        function suggestLookup(suggestQueryField, settings) {
                            var val = suggestQueryField.val();
                            if ((HawkSearch.SuggesterGlobal.lastVal != val || HawkSearch.SuggesterGlobal.lastVal != "") && HawkSearch.SuggesterGlobal.focus && HawkSearch.SuggesterGlobal.searching == false) {

                                HawkSearch.SuggesterGlobal.lastVal = val;
                                suggestDoRemoteQuery(escape(val));
                            }
                            return true;
                        };

                        function suggestDoRemoteQuery(val) {
                            HawkSearch.SuggesterGlobal.searching = true;

                            var req = settings.lookupUrlPrefix;
                            var visitorId = HawkSearch.lilBro.event.getVisitorId();
                            var keywordField = $("#hdnhawkkeywordfield").val();
                            var kw = $("#" + keywordField).val();

                            var hawkb = HawkSearch.GetQueryStringValue["hawkb"];
                            if (hawkb !== undefined) {
                                req = req + '&hawkb=' + hawkb;
                            }

                            var hawkcustom = HawkSearch.VisitorTarget;
                            if (hawkcustom !== undefined) {
                                req = req + '&hawkcustom=' + hawkcustom;
                            }

                            jQuery.ajax({
                                type: "GET",
                                contentType: "application/json; charset=utf-8",
                                url: req + '&q=' + escape(val) + '&hawkvisitorid=' + visitorId,
                                data: "",
                                dataType: "jsonp",
                                success: function (autoSuggestResult) {
                                    showQueryDiv(autoSuggestResult);
                                    HawkSearch.SuggesterGlobal.searching = false;
                                },
                                error: function () {
                                    //try { hideSuggest(); } catch (error) { };
                                    HawkSearch.SuggesterGlobal.searching = false;
                                }
                            });
                        };

                        // Get the <DIV> we're using to display the lookup results, and create the <DIV> if it doesn't already exist.
                        function getSuggestDiv(divId) {
                            if (!HawkSearch.SuggesterGlobal.globalDiv) {
                                // if the div doesn't exist on the page already, create it
                                if (!document.getElementById(divId)) {
                                    var newNode = document.createElement("div");
                                    newNode.setAttribute("id", divId);
                                    newNode.setAttribute("class", "hawk-searchQuery");
                                    document.body.appendChild(newNode);
                                }

                                // set the globalDiv reference
                                HawkSearch.SuggesterGlobal.globalDiv = document.getElementById(divId);
                                HawkSearch.SuggesterGlobal.queryDiv = $("#" + divId);
                            }

                            if (suggestQueryField && (suggestQueryField.offset().left != HawkSearch.SuggesterGlobal.storedOffset)) {
                                // figure out where the top corner of the div should be, based on the
                                // bottom left corner of the input field
                                var x = suggestQueryField.offset().left,
                                    y = suggestQueryField.offset().top + suggestQueryField.outerHeight(),
                                    fieldID = suggestQueryField.attr("id");

                                HawkSearch.SuggesterGlobal.storedOffset = x;

                                // add some formatting to the div, if we haven't already
                                if (!HawkSearch.SuggesterGlobal.divFormatted) {
                                    // set positioning and apply identifier class using ID of corresponding search field
                                    HawkSearch.SuggesterGlobal.queryDiv.removeAttr("style").css({
                                        "left": x,
                                        "top": y
                                    }).attr("class", "hawk-searchQuery hawk-searchQuery-" + fieldID);

                                    // check to see if 'isAutoWidth' is enabled
                                    // if enabled apply width based on search field width
                                    if (settings && settings.isAutoWidth) {
                                        var queryWidth = suggestQueryField.outerWidth();
                                        var minValue = 250;
                                        if (queryWidth < minValue) {
                                            queryWidth = minValue;
                                        }
                                        HawkSearch.SuggesterGlobal.queryDiv.css("width", queryWidth);
                                    }

                                    //HawkSearch.SuggesterGlobal.divFormatted = true;
                                };
                            };

                            return HawkSearch.SuggesterGlobal.queryDiv;
                        };

                        function suggestIsAbove() {

                            if (settings.isAbove) {
                                var queryHeight = HawkSearch.SuggesterGlobal.queryDiv.outerHeight(true);
                                var y = suggestQueryField.offset().top - queryHeight;

                                HawkSearch.SuggesterGlobal.queryDiv.css({
                                    "top": y
                                });

                                if (!HawkSearch.SuggesterGlobal.queryDiv.hasClass("hawk-queryAbove")) {
                                    HawkSearch.SuggesterGlobal.queryDiv.addClass("hawk-queryAbove");
                                }
                            };

                        };

                        // This is the key handler function, for when a user presses the up arrow, down arrow, tab key, or enter key from the input field.
                        function keypressHandler(e) {
                            var suggestDiv = getSuggestDiv(HawkSearch.SuggesterGlobal.divName),
                                divNode = suggestDiv[0];

                            // don't do anything if the div is hidden
                            if (suggestDiv.is(":hidden")) {
                                //return true;
                            }

                            // make sure we have a valid event variable
                            if (!e && window.event) {
                                e = window.event;
                            }

                            var key;
                            if (window.event) {
                                key = e.keyCode; // IE
                            } else {
                                key = e.which;
                            }

                            // if this key isn't one of the ones we care about, just return
                            var KEYUP = 38;
                            var KEYDOWN = 40;
                            var KEYENTER = 13;
                            var KEYTAB = 9;

                            if ((key != KEYUP) && (key != KEYDOWN) && (key != KEYENTER) && (key != KEYTAB)) {
                                clearTimeout(settings.timeout);
                                settings.timeout = setTimeout(function () {
                                suggestLookup(suggestQueryField, settings, e);
                                return true;
                                }, 200);
                            };

                            // get the span that's currently selected, and perform an appropriate action
                            var selectedIndex = getSelectedItem(suggestDiv);
                            //var selSpan = HawkSearch.suggest.setSelectedSpan(div, selNum);
                            var selectedItem;

                            if (key == KEYENTER) {
                                if (selectedIndex >= 0) {
                                    var selectedItem = setSelectedItem(suggestDiv, selectedIndex);
                                    _selectResult(selectedItem);
                                    e.cancelBubble = true;
                                    if (window.event) {
                                        return false;
                                    } else {
                                        e.preventDefault();
                                    };
                                } else {
                                    hideSuggest(e);
                                    return true;
                                };
                            } else if (key == KEYTAB) {
                                if ((selectedIndex + 1) < suggestDiv.find(".hawk-sqItem").length) {
                                    e.cancelBubble = true;
                                    e.preventDefault();
                                    selectedItem = setSelectedItem(suggestDiv, selectedIndex + 1);
                                } else {
                                    hideSuggest(e)
                                };
                            } else {
                                if (key == KEYUP) {
                                    selectedItem = setSelectedItem(suggestDiv, selectedIndex - 1);
                                } else if (key == KEYDOWN) {
                                    selectedItem = setSelectedItem(suggestDiv, selectedIndex + 1);
                                };
                            };


                            //showSuggest();
                            return true;
                        };

                        // displays query div and query results
                        function showQueryDiv(autoSuggestResult) {
                            var suggestDiv = getSuggestDiv(HawkSearch.SuggesterGlobal.divName),
                                divNode = suggestDiv[0];

                            if (autoSuggestResult === null ||
                                (
                                    autoSuggestResult.Count === 0 &&
                                    autoSuggestResult.ContentCount === 0 &&
                                    (autoSuggestResult.Categories == null || autoSuggestResult.Categories.length === 0) &&
                                    (autoSuggestResult.Popular == null || autoSuggestResult.Popular.length === 0)
                                )) {
                                showSuggest(false);
                                return;
                            }

                            // remove any results that are already there
                            while (divNode.childNodes.length > 0)
                                divNode.removeChild(divNode.childNodes[0]);

                            var categories = autoSuggestResult.Categories || [];
                            var popular = autoSuggestResult.Popular || [];
                            var products = autoSuggestResult.Products || [];
                            var content = autoSuggestResult.Content || [];

                            showTerms(suggestDiv, popular, "Popular Searches", HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.popular);
                            showTerms(suggestDiv, categories, "Top Categories", HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.category);

                            var productsTitle = (products.length == 1 ? "Top Match" : "Top " + products.length + " Matches");
                            showProducts(suggestDiv, products, productsTitle);

                            var contentTitle = (content.length == 1 ? "Top Content Match" : "Top " + content.length + " Content Matches");
                            showContent(suggestDiv, content, contentTitle);

                            if (categories.length > 0 || popular.length > 0 || products.length > 0 || content.length > 0) {
                                showFooter(suggestDiv, autoSuggestResult.Count, autoSuggestResult.ContentCount, autoSuggestResult.SearchWebsiteUrl, autoSuggestResult.KeywordField);
                                showSuggest(true);
                            }
                        };

                        // controls the visibility of the result lookup based on the "show" parameter
                        function showSuggest(show) {
                            var suggestDisplay = getSuggestDiv(HawkSearch.SuggesterGlobal.divName);
                            if (show === false) {
                                suggestDisplay.hide();
                                $("body").off("click", hideSuggest);
                            } else {
                                suggestDisplay.show();
                                $("body").on("click", hideSuggest);
                            };
                        };

                        // We originally used showSuggest as the function that was called by the onBlur
                        // event of the field, but it turns out that Firefox will pass an event as the first
                        // parameter of the function, which would cause the div to always be visible.
                        function hideSuggest(e) {
                            var updatedDisplay = false;
                            if (!updatedDisplay && $(e.target).closest(".hawk-searchQuery").length <= 0) {
                                showSuggest(false);
                                updatedDisplay = true;
                            };
                        };

                        function isEven(num) {
                            if (num !== false && num !== true && !isNaN(num)) {
                                return num % 2 == 0;
                            } else return false;
                        };

                        function showTerms(suggestDiv, terms, title, type) {
                            if (terms.length >= 1) {
                                //suggestDiv.empty();
                                suggestDivNode = suggestDiv[0];

                                // create and append suggest header to suggest container
                                var suggestHeader = document.createElement("div");
                                suggestHeader.className = "hawk-sqHeader";
                                suggestHeader.innerHTML = title;
                                suggestDivNode.appendChild(suggestHeader);

                                // set up and append suggest content to suggest container
                                var suggestContent = document.createElement("ul");
                                suggestContent.className = "hawk-sqContent";
                                suggestDivNode.appendChild(suggestContent);

                                // loop through suggest options
                                var resultItems = "";
                                for (var i = 0; i < terms.length; i++) {
                                    var term = terms[i];
                                    if (term.Value == null) continue;

                                    var resultItem = document.createElement("li");

                                    resultItem.setAttribute('data-url', term.Url);
                                    resultItem.setAttribute("data-autoCompleteType", type);
                                    // check for odd/even alternative styling
                                    if (isEven(i)) {
                                        resultItem.className = "hawk-sqItem term";
                                    } else {
                                        resultItem.className = "hawk-sqItem hawk-sqItemAlt term";
                                    };

                                    var resultItemContent = document.createElement("h1");
                                    resultItemContent.className = "hawk-sqItemName";
                                    resultItemContent.innerHTML = term.Value

                                    resultItem.appendChild(resultItemContent);

                                    // append results of suggest options to the suggest content container
                                    suggestContent.appendChild(resultItem);
                                };

                                // find all newly added suggest options
                                var suggestItems = suggestDiv.find(".hawk-sqContent .hawk-sqItem");

                                // pass suggestItems to 'suggestItemHandler' to handle events
                                suggestItemHandler(suggestItems);

                                // check to see if query div should show above field
                                suggestIsAbove();
                            };
                        };

                        function showProducts(suggestDiv, products, title) {

                            if (products.length >= 1) {

                                //suggestDiv.empty();
                                suggestDivNode = suggestDiv[0];

                                // create and append suggest header to suggest container
                                var suggestHeader = document.createElement("div");
                                suggestHeader.className = "hawk-sqHeader";
                                suggestHeader.innerHTML = title;
                                suggestDivNode.appendChild(suggestHeader);

                                // set up and append suggest content to suggest container
                                var suggestContent = document.createElement("ul");
                                suggestContent.className = "hawk-sqContent";
                                suggestDivNode.appendChild(suggestContent);

                                // loop through suggest options
                                for (var i = 0; i < products.length; i++) {
                                    var product = products[i];

                                    var resultItem = document.createElement("li");

                                    // check for odd/even alternative styling
                                    if (isEven(i)) {
                                        resultItem.className = "hawk-sqItem";
                                    } else {
                                        resultItem.className = "hawk-sqItem hawk-sqItemAlt";
                                    };

                                    resultItem.setAttribute('data-url', product.Url);
                                    resultItem.setAttribute("data-autoCompleteType", HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.product);
                                    resultItem.innerHTML = product.Html;

                                    // append results of suggest options to the suggest content container
                                    suggestContent.appendChild(resultItem);
                                };

                                // find all newly added suggest options
                                var suggestItems = suggestDiv.find(".hawk-sqContent .hawk-sqItem");

                                // pass suggestItems to 'suggestItemHandler' to handle events
                                suggestItemHandler(suggestItems);
                                ;
                            };
                        };

                        function showFooter(suggestDiv, count, contentCount, url, keywordfield) {
                            // creating the footer container
                            var footerContainer = document.createElement("div");
                            footerContainer.className = "hawk-sqFooter";

                            //creating the footer link
                            var footerLink = document.createElement("a");
                            footerLink.href = "javascript:void(0);";
                            footerLink.setAttribute("onclick", "window.location='" + url + "?" + keywordfield + "=" + encodeURIComponent($(queryField).val()) + HawkSearch.preserveUrlParams() + "'");
                            footerLink.innerHTML = "View All Matches";

                            if (count > 0) {
                                //creating the footer count
                                var footerCount = document.createElement("div");
                                footerCount.style.marginTop = "3px";
                                footerCount.style.fontSize = ".85em";
                                footerCount.style.fontWeight = "bold";
                                footerCount.innerHTML = count + " result(s)";
                                footerContainer.appendChild(footerCount);
                            }

                            //appending link and count to container
                            footerContainer.appendChild(footerLink);

                            //appending container to suggestDiv
                            suggestDiv.append(footerContainer);

                            // check to see if query div should show above field
                            suggestIsAbove();
                        };


                        function showContent(suggestDiv, content, title) {
                            if (content.length >= 1) {
                                //suggestDiv.empty();
                                suggestDivNode = suggestDiv[0];

                                // create and append suggest header to suggest container
                                var suggestHeader = document.createElement("div");
                                suggestHeader.className = "hawk-sqHeader";
                                suggestHeader.innerHTML = title;
                                suggestDivNode.appendChild(suggestHeader);


                                // set up and append suggest content to suggest container
                                var suggestContent = document.createElement("ul");
                                suggestContent.className = "hawk-sqContent";
                                suggestDivNode.appendChild(suggestContent);

                                // loop through suggest options
                                for (var i = 0; i < content.length; i++) {
                                    var product = content[i];

                                    var resultItem = document.createElement("li");

                                    // check for odd/even alternative styling
                                    if (isEven(i)) {
                                        resultItem.className = "hawk-sqItem term";
                                    } else {
                                        resultItem.className = "hawk-sqItem hawk-sqItemAlt term";
                                    };
                                    resultItem.setAttribute('data-url', product.Url);
                                    resultItem.setAttribute("data-autoCompleteType", HawkSearch.LilBro.Schema.AutoCompleteClick.AutoCompleteType.content);
                                    resultItem.innerHTML = product.Html

                                    // append results of suggest options to the suggest content container
                                    suggestContent.appendChild(resultItem);
                                };

                                // find all newly added suggest options
                                var suggestItems = suggestDiv.find(".hawk-sqContent .hawk-sqItem");

                                // pass suggestItems to 'suggestItemHandler' to handle events
                                suggestItemHandler(suggestItems);
                            };
                        };


                        // sets up events for suggest items
                        function suggestItemHandler(suggestItems) {
                            // bind mouseenter/mouseleave to suggest options
                            // toggles active state on mouseenter

                            suggestItems.on("mouseenter mouseleave", function (e) {
                                var sqItem = $(e.currentTarget);
                                if (e.type === "mouseenter") {
                                    highlightResult(sqItem);
                                } else {
                                    unhighlightResult(sqItem);
                                }
                            });

                            // bind 'mousedown' event to suggest options to go to url
                            // using 'mousedown' instead of 'click' due to 'blur' event blocking the 'click' event from firing
                            suggestItems.off('click').on("click", SuggestedItemClick);
                        };

                        function SuggestedItemClick(e) {
                            e.preventDefault();
                            var suggest_type = $(e.target).closest("li").attr("data-autoCompleteType");
                            var name = $(e.target).text().replace(/\u00bb/g, "&raquo;");
                            if (name === "") {
                                name = $(e.target).parents(".hawk-sqActive").find("div.hawk-sqItemContent h1").text();
                            }
                            var itemUrl = $(e.currentTarget).data("url");
                            var keyword = $("#" + $("#hdnhawkkeywordfield").val()).val();

                            if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2) {
                                HawkSearch.Tracking.writeAutoCompleteClick(keyword, e, suggest_type, name, itemUrl);
                            }
                            else if (HawkSearch.Tracking.CurrentVersion() == HawkSearch.Tracking.Version.v2AndSQL) {
                                HawkSearch.Tracking.writeAutoCompleteClick(keyword, e, suggest_type, name, itemUrl);
                                HawkSearch.Tracking.V1.autosuggestClick(keyword, name, itemUrl, suggest_type);
                            }
                            else {
                                HawkSearch.Tracking.V1.autosuggestClick(keyword, name, itemUrl, suggest_type);
                            }

                            window.location = itemUrl;
                        };

                        // This is called whenever the user clicks one of the lookup results.
                        // It puts the value of the result in the queryField and hides the lookup div.
                        function selectResult(item) {
                            _selectResult(item);
                        };
                        // This actually fills the field with the selected result and hides the div
                        function _selectResult(item) {
                            itemUrl = item.data("url");
                            window.location = itemUrl;
                        };


                        // This is called when a user mouses over a lookup result
                        function highlightResult(item) {
                            $(HawkSearch.SuggesterGlobal.globalDiv).find(".hawk-sqItem").removeClass("hawk-sqActive");
                            _highlightResult(item);
                        };
                        // This actually highlights the selected result
                        function _highlightResult(item) {
                            if (item == null) return;
                            item.addClass("hawk-sqActive");
                        };


                        // This is called when a user mouses away from a lookup result
                        function unhighlightResult(item) {
                            _unhighlightResult(item);
                        };
                        // This actually unhighlights the selected result
                        function _unhighlightResult(item) {
                            item.removeClass("hawk-sqActive");
                        };


                        // Get the number of the result that's currently selected/highlighted
                        // (the first result is 0, the second is 1, etc.)
                        function getSelectedItem(suggestDiv) {
                            var count = -1;
                            var sqItems = suggestDiv.find(".hawk-sqItem");

                            if (sqItems) {
                                if (sqItems.filter(".hawk-sqActive").length == 1) {
                                    count = sqItems.index(sqItems.filter(".hawk-sqActive"));
                                };
                            }
                            return count
                        };


                        // Select and highlight the result at the given position
                        function setSelectedItem(suggestDiv, selectedIndex) {
                            var count = -1;
                            var selectedItem = null;
                            var first = null;
                            var sqItems = suggestDiv.find(".hawk-sqItem");

                            if (sqItems) {
                                for (var i = 0; i < sqItems.length; i++) {
                                    if (first == null) {
                                        first = sqItems.eq(i);
                                    };

                                    if (++count == selectedIndex) {
                                        _highlightResult(sqItems.eq(i));
                                        selectedItem = sqItems.eq(i);
                                    } else {
                                        _unhighlightResult(sqItems.eq(i));
                                    }
                                };
                            };

                            // handle if nothing is select yet to select first
                            // or loop through results if at the end/beginning.
                            if (selectedItem == null && (selectedIndex < 0)) {
                                selectedItem = sqItems.eq(-1);
                                _highlightResult(selectedItem);
                            } else if (selectedItem == null) {
                                selectedItem = first;
                                _highlightResult(selectedItem);
                            };

                            return selectedItem;
                        };
                    };
                };

                $(queryField).hawksearchSuggest(settings);
            };


            HawkSearch.preserveUrlParams = function () {
                var prv = HawkSearch.GetQueryStringValue["prv"] + '';
                var adv = HawkSearch.GetQueryStringValue["adv"] + '';
                var hawkflags = HawkSearch.GetQueryStringValue["hawkflags"] + '';
                var aid = HawkSearch.GetQueryStringValue["hawkaid"] + '';
                var ret = '';

                if (prv != "undefined" && prv != '') ret += '&prv=' + escape(prv);
                if (adv != "undefined" && adv != '') ret += '&adv=' + escape(adv);
                if (hawkflags != "undefined" && hawkflags != '') ret += '&hawkflags=' + escape(hawkflags);
                if (aid != "undefined" && aid != '') ret += '&hawkaid=' + escape(aid);

                return ret;
            };


            //Recent Searches

            HawkSearch.clearRelatedSearches = function () {
                $.cookie("recent-searches", "", { expires: -1 });
                $(".hawk-recentSearches .hawk-navGroupContent > ul").empty();
                $(".hawk-recentSearches").hide();
            };

            HawkSearch.GetRecentSearches = function () {
                var recentSearchesStr = $.cookie("recent-searches");
                var recentSearches = [];
                if (recentSearchesStr != null) {
                    var rsObjeArr = recentSearchesStr.split(",");
                    $(rsObjeArr).each(function () {
                        var obj = this.split("|");
                        if (obj.length > 1) {
                            var srch = {};
                            srch.keyword = obj[0];
                            srch.count = obj[1];
                            recentSearches.push(srch);
                        }
                    });
                }

                var keyword = HawkSearch.RecentSearchesKeyword;
                var count = HawkSearch.RecentSearchesCount;
                if (keyword !== "" && count > 0) {
                    var exists = false;
                    for (var i = 0; i < recentSearches.length; i++) {
                        if (recentSearches[i].keyword == encodeURIComponent(keyword)) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        var search = new Object();
                        search.keyword = encodeURIComponent(keyword);
                        search.count = count;
                        recentSearches.unshift(search);
                    }
                }
                if (recentSearches.length == 0) {
                    $(".hawk-recentSearches").hide();
                }
                var maxRecentSearchesCount = HawkSearch.RecentSearchesRecentSearchesCount;
                var numberOrSearches = Math.min(recentSearches.length, maxRecentSearchesCount);
                for (var j = 0; j < numberOrSearches; j++) {
                    var k = recentSearches[j].keyword;
                    var c = recentSearches[j].count;
                    $(".hawk-recentSearches .hawk-navGroupContent > ul").append("<li><a href='" + HawkSearch.RecentSearchesUrl + "?" + $("#hdnhawkkeywordfield").val() + "=" + k + "' rel='nofolow'>" + decodeURIComponent(k) + "<span class='count'> (" + c + ")</span></a></li>");
                }

                $(".hawk-recentSearches .hawk-navGroupContent > ul li a").click(function () {
                    window.location = $(this).attr("href");
                });
                var tempArray = [];
                $(recentSearches).each(function () {
                    tempArray.push(this.keyword + "|" + this.count);
                });
                recentSearchesStr = tempArray.join(",");
                $.cookie("recent-searches", recentSearchesStr, { expires: 365 });
            };

            HawkSearch.getTipPlacementFunction = function (defaultPosition, width, height) {
                return function (tip, element) {
                    var position, top, bottom, left, right;

                    var $element = $(element);
                    var boundTop = $(document).scrollTop();
                    var boundLeft = $(document).scrollLeft();
                    var boundRight = boundLeft + $(window).width();
                    var boundBottom = boundTop + $(window).height();

                    var pos = $.extend({}, $element.offset(), {
                        width: element.offsetWidth,
                        height: element.offsetHeight
                    });

                    var isWithinBounds = function (elPos) {
                        return boundTop < elPos.top && boundLeft < elPos.left && boundRight > (elPos.left + width) && boundBottom > (elPos.top + height);
                    };

                    var testTop = function () {
                        if (top === false) return false;
                        top = isWithinBounds({
                            top: pos.top - height,
                            left: pos.left + pos.width / 2 - width / 2
                        });
                        return top ? "top" : false;
                    };

                    var testBottom = function () {
                        if (bottom === false) return false;
                        bottom = isWithinBounds({
                            top: pos.top + pos.height,
                            left: pos.left + pos.width / 2 - width / 2
                        });
                        return bottom ? "bottom" : false;
                    };

                    var testLeft = function () {
                        if (left === false) return false;
                        left = isWithinBounds({
                            top: pos.top + pos.height / 2 - height / 2,
                            left: pos.left - width
                        });
                        return left ? "left" : false;
                    };

                    var testRight = function () {
                        if (right === false) return false;
                        right = isWithinBounds({
                            top: pos.top + pos.height / 2 - height / 2,
                            left: pos.left + pos.width
                        });
                        return right ? "right" : false;
                    };

                    switch (defaultPosition) {
                        case "top":
                            if (position = testTop()) return position;
                        case "bottom":
                            if (position = testBottom()) return position;
                        case "left":
                            if (position = testLeft()) return position;
                        case "right":
                            if (position = testRight()) return position;
                        default:
                            if (position = testTop()) return position;
                            if (position = testBottom()) return position;
                            if (position = testLeft()) return position;
                            if (position = testRight()) return position;
                            return defaultPosition;
                    }
                }
            };


            HawkSearch.Popover = function (element, direction, content) {
                var eml = $(element).webuiPopover({
                    html: true,
                    trigger: 'hover',
                    content: '<div class="hawk-detail-content">' + content + '<div>',
                    placement: direction,
                    //container:$(element).parent(),
                    onShow: function ($element) {
                        HawkSearch.PrefixClasses($element, 'hawk-', '.hawk-detail-content');
                        var hdnItemPinned = $(element).parents(".hawk-itemWrapper").find(".hdn-itemPinned");
                        $($element).on("click", ".onoffswitch-label", function () {
                            var checkBox = $($element).find(".onoffswitch-checkbox");
                            checkBox.prop("checked", !checkBox.prop("checked"));
                            checkBox.toggleClass("toggle-item-pin");
                            var isPinned = $(checkBox).prop("checked");
                            var primaryKey = $(checkBox).attr("primary-key");
                            if (isPinned) {
                                HawkSearch.addToTop(checkBox, primaryKey);
                                var hdnItemPinned = $(checkBox).parents(".hawk-itemWrapper").find(".hdn-itemPinned");
                                hdnItemPinned.val(isPinned);
                            } else {
                                HawkSearch.unpinItem(checkBox, primaryKey);
                                var hdnItemPinned = $(checkBox).parents(".hawk-itemWrapper").find(".hdn-itemPinned");
                                hdnItemPinned.val(isPinned);
                            }

                            $(checkBox).parents(".hawk-itemWrapper").find(".hdn-itemPinned").val(isPinned);

                            $("#hawkitemlist").sortable("option", "disabled", true);
                            $(".hawk-preview-info").addClass("hawk-no-sortable");
                        })
                    },
                    onHide: function ($element) {
                        $($element).off("click", ".onoffswitch-label");
                        HawkSearch.PrefixClasses($element, 'hawk-', '.hawk-detail-content');
                    }
                });
            }

            HawkSearch.PrefixClasses = function (element, prefix, selector) {
                if ((selector === undefined) || !($(element).is(selector))) {
                    var classes = $(element).attr("class");
                    if (classes !== undefined) {
                        var classSplit = classes.split(" ");
                        var length = classSplit.length
                        for (i = 0; i < length; i++) {
                            if (classSplit.indexOf(prefix + classSplit[i]) == -1) {
                                if (classSplit[i].substring(0, prefix.length) != prefix) {
                                    classSplit.push(prefix + classSplit[i]);
                                }
                            }
                        }
                        $(element).attr("class", classSplit.join(" "));
                    }
                    $(element).children().each(function () {
                        HawkSearch.PrefixClasses($(this), prefix, selector);
                    });
                }
            }

            HawkSearch.PopoverAction = function (element, action) {
                $(element).webuiPopover(action)
            }

            HawkSearch.BindPreviewInformation = function () {

                $(".hawk-preview-info").each(function () {
                    var content = $(this).parent().find(".hawk-preview-info-content").html();
                    HawkSearch.Popover($(this), HawkSearch.getTipPlacementFunction('top', 230, 200), content);
                });


                $("#hawkitemlist").sortable({
                    items: '.grid_3.hawk-itemPinned',
                    placeholder: "grid_3 hawk-itemWrapper-placeholder",
                    appendTo: "#hawkitemlist",
                    handle: ".hawk-preview-info",
                    cursor: "move",
                    start: function (e, ui) {
                        $(this).find(".popover").webuiPopover("hide");
                        ui.placeholder.hide();
                        var wrapper = ui.item.find(".hawk-itemWrapper");
                        var height = wrapper.outerHeight() - 4;
                        var width = wrapper.width() - 2;
                        ui.placeholder.height(height).width(width);
                        ui.placeholder.show();


                    },
                    update: function (e, ui) {
                        var docIdList = $(this).sortable('toArray', { attribute: 'data-hawk-id' }).toString();
                        HawkSearch.updatePinOrder(docIdList);
                    }
                });

            };

            HawkSearch.BindFacetTooltip = function () {
                $(".hawk-facet-tooltip").each(function () {
                    $(this).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    var content = $(this).parent().find(".hawk-facet-tooltip-content").html();
                    HawkSearch.Popover($(this), 'right', content);
                });
            }

            HawkSearch.BindBackToTop = function () {
                $(window).scroll(function () {
                    var divBackToTop = $("#hawk-backToTop");
                    if ($(window).scrollTop() > 0) {
                        if (!divBackToTop.is(":visible")) {
                            divBackToTop.fadeIn({ duration: 200, queue: false });
                        }
                    }
                    else {
                        if (divBackToTop.is(":visible")) {
                            divBackToTop.fadeOut({ duration: 200, queue: false });
                        }
                    }
                });
                $("#hawk-backToTop").hover(function () {
                    $(this).toggleClass("hover");
                });
                $("#hawk-backToTop").on("click", function () {
                    $('html,body').animate({ scrollTop: 0 }, 500);
                });
            }

            HawkSearch.SetFacetScrollPosition = function () {
                var menuYloc = $(".hawk-facetScollingContainer").offset().top - $(".hawk-facetScollingContainer").position().top;
                var footerHeight = $(".footer").outerHeight();
                var footerOffsetTop = $(".footer").offset().top;


                var menuHeight = $(".hawk-facetScollingContainer").outerHeight();
                var winHeight = $(window).height();
                var offset = 0;
                var docScroll = $(document).scrollTop();
                var diff = menuHeight - winHeight;
                if (winHeight < menuHeight) {
                    offset = docScroll - diff - menuYloc;
                    if (docScroll < diff) {
                        offset = 0;
                    }

                } else {
                    offset = docScroll - menuYloc + 10;
                }

                if (offset < 0) {
                    offset = 0;
                }

                if (offset + menuHeight + menuYloc >= footerOffsetTop) {
                    offset = footerOffsetTop - menuHeight - menuYloc - 20;
                }

                $(".hawk-facetScollingContainer").animate({ top: offset }, { duration: 500, queue: false });
            }

            HawkSearch.FacetContainerScrollable = function () {
                $(window).scroll(function () {
                    HawkSearch.SetFacetScrollPosition();

                });

            }

            // exposes custom jQuery events to the body
            HawkSearch.ExposeEvents = function (type, args) {
                var callback = $.Event('hawk' + type, args);
                $('body').trigger(callback);

                // if prevent default block execution
                return !callback.isDefaultPrevented();
            }

            HawkSearch.Tracking.setReady($);

            if (HawkSearch.getHashOrQueryVariable("hawkRegVisitor") !== "") {
                parent.postMessage(HawkSearch.lilBro.event.getVisitorId(), "*");
            }

            HawkSearch.Recommender.ToggleRecPreview();
        }(window.HawkSearch = window.HawkSearch || {}, jQuery));

        (function (HawkCompare, $) {
            HawkCompare.process = function () {
                var itemIds = $("#hdnhawkcompare").val();
                if (itemIds === "") return;
                //alert('Compare feature is not available on demo site');
                var itemIds = $("#hdnhawkcompare").val();
                if (itemIds === "") return;

                var url = HawkSearch.BaseUrl + "?fn=compare&Items=" + itemIds;
                $.get(url, function (data) {
                    var html = data;

                    if (!alertify.compareAlert) {
                        //setting defaults
                        alertify.defaults.transition = "slide";
                        alertify.defaults.theme.ok = "btn btn-primary";
                        alertify.defaults.theme.cancel = "btn btn-danger";
                        alertify.defaults.theme.input = "form-control";
                        alertify.defaults.glossary.title = 'Compare';

                        //define a new dialog
                        alertify.dialog('compareAlert', function (data) {
                            return {
                                main: function (message) {
                                    this.message = message;
                                },
                                setup: function () {
                                    return {
                                        buttons: [{ text: "Close", key: 27 }],
                                        options: {
                                            maximizable: false,
                                            resizable: false,
                                            movable: false,
                                        }
                                    };
                                },
                                prepare: function () {
                                    this.setContent(this.message);
                                },
                                hooks: {
                                    onshow: function () {
                                        this.elements.dialog.style.maxWidth = 'none';
                                        this.elements.dialog.style.width = '80%';
                                    }
                                }
                            }
                        });
                    }
                    //launch it.
                    alertify.compareAlert(data);

                    //HawkSearch.showDialog("Compare Items", html);
                    $(".item.span3 .product-shop .product-name").matchHeights();
                });
            };

            HawkCompare.addItem = function (itemVal) {
                var index = HawkCompare.countItems();
                window['hawktocompare'][index] = itemVal;
                if (HawkCompare.countItems() != 0) {
                    $(".hawk-subControls.clearfix").css("display", "block");
                }
            };

            HawkCompare.getImage = function (itemVal) {
                // sets up query and cache
                var compareQuery = HawkSearch.BaseUrl + "/default.aspx?fn=ajax&F=GetItemImageToCompare&ItemId=" + itemVal;
                var cacheResp = window[compareQuery];
                // check for cache; process and output ajax query
                if (cacheResp) {
                    HawkCompare.addImage(cacheResp.Image);
                } else {
                    $.ajax({
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        url: compareQuery,
                        dataType: 'jsonp',
                        data: "",
                        async: false,
                        success: function (json) {
                            window[compareQuery] = json;
                            HawkCompare.addImage(json.Image);
                        }
                    });
                };
            };

            HawkCompare.addImage = function (htmlLi) {
                $(".hawk-compareList>ul").each(function () {
                    $(this).find("li").each(function () {
                        if ($(this).html() == "" || $(this).html() == "&nbsp;") {
                            $(this).html(htmlLi);
                            return false;
                        }
                        return true;
                    });
                });
            };

            HawkCompare.countItems = function () {
                return window['hawktocompare'].length;
            };

            HawkCompare.reload = function () {
                $.each(window['hawktocompare'], function (i, value) {
                    HawkCompare.getImage(value);
                    $("#chkItemCompare" + value).attr("checked", true);
                });
                if (HawkCompare.localReload !== undefined) {
                    HawkCompare.localReload();
                }

            };

            HawkCompare.removeItem = function (itemVal) {
                $(".hawk-compareList>ul").each(function () {
                    var cItem = $(this).find("a#" + itemVal).parent();
                    cItem.parent().append("<li>&nbsp;</li>");
                    cItem.remove();
                });
                $("#chkItemCompare" + itemVal).attr("checked", false);

                var index = window['hawktocompare'].indexOf(itemVal);
                window['hawktocompare'].splice(index, 1);

                if (HawkCompare.countItems() == 0) {
                    $(".hawk-subControls.clearfix").css("display", "none");
                }

            };

        }(window.HawkCompare = window.HawkCompare || {}, jQuery));

        // END Namespaced HawkSearch block.

        loadJQueryPlugins($);

        window.onpopstate = function (e) {
            if (e.state) {
                log("onhashchagne event handler");
                HawkSearch.refreshResults(true);
            }
        }

        HawkSearch.loadRecommender = function () {
            $(".hawk-recommendation").empty();
            HawkSearch.showRecsBlockUI();
            var recommender = new HawkSearch.Recommender(HawkSearch.jQuery);
        }

        $(document).ready(function () {
            // initialize auto-suggest



            if (HawkSearch.initAutoSuggest !== undefined) {
                HawkSearch.initAutoSuggest();
            }

            HawkSearch.loadRecommender();

            $("#divSmartBug").delegate(".bugExplain", "click", function () {
                $("#hdnhawkadv").val($(this).attr("href"));
                HawkSearch.refreshUrl(null, true);
                return false;
            });

            if (!$("#hawkitemlist").length) {
                HawkSearch.regSmartBug();
                return;
            }
            // load items to compare
            var items = decodeURIComponent(HawkSearch.getHashOrQueryVariable("items"));
            if (items != "") {
                window['hawktocompare'] = items.split(",");
                if ($.isFunction(window.HawkCompare.reload)) HawkCompare.reload();
            } else {
                window['hawktocompare'] = new Array();
            }

            HawkSearch.regFacets();

            // bind the click event to the anchor tags
            $("#hawkfacets").on("click", ".slider-clear, .hawk-facetFilters a", function (event) {

                // clear the current page
                $("#hdnhawkpg").val("");
                var options = $(this).data().options;
                var ul = $(this).parents("ul.hawk-facetFilters");
                if (ul.hasClass("singlefacet")) {
                    ul.find(".hawkFacet-active a").each(function () {
                        var opt = $(this).data().options;
                        if (options.value !== opt.value) {
                            $(this).parent().removeClass("hawkFacet-active");
                        }
                    });
                }

                if (typeof (options.hash) !== "undefined") {
                    if (HawkSearchLoader.disableAjax) {
                        window.location = $(this).attr("href");
                    } else {
                        window.history.pushState({}, {}, "?" + options.hash);
                    }
                } else {
                    HawkSearch.refreshUrl
                        (event);
                }

                return false;
            });

            if (!HawkSearchLoader.disableAjax) {
                var newHash = window.location.search.substring(1);
                if (newHash === "" || (window.location.search.substring(1) !== "" && window.location.href.indexOf("#") > -1)) newHash = HawkSearch.getHash();
                if (window.location.search.substring(1) !== newHash) {
                    window.history.pushState({}, {}, "?" + newHash);
                }
            }

            // hawk pagination
            $("#hawkitemlist, #hawktoppager, #hawkbottompager").on("click", ".hawk-pageLink", function (e) {
                e.preventDefault();
                if ($(this).hasClass("disabled") || $("#hdnhawkpg").val() === $(this).attr("page")) return false;

                $("#hdnhawkpg").val($(this).attr("page"));
                HawkSearch.refreshUrl();
                return false;
            });

            // hawk sorting
            $("#hawkitemlist, #hawktoppager, #hawkbottompager").on("change", ".hawksortby", function (e) {
                // clear the current page
                $("#hdnhawkpg").val("");

                $("#hdnhawksortby").val($(this).val());
                $(".hawksortby").val($(this).val());

                HawkSearch.refreshUrl(e);
                return false;
            });

            // hawk change per page
            $("#hawkitemlist, #hawktoppager, #hawkbottompager").on("change", ".hawkmpp", function (event) {
                // clear the current page
                $("#hdnhawkpg").val("");

                $("#hdnhawkmpp").val($(this).val());
                $(".hawkmpp").val($(this).val());

                HawkSearch.refreshUrl(event);
                return false;
            });

            var hawkmpp = $(".hawkmpp");
            if (hawkmpp.length > 0 && hawkmpp.eq(0).val() !== "" && $("#hdnhawkmpp").val() === "") {
                $("#hdnhawkmpp").val(hawkmpp.eq(0).val());
                hawkmpp.val($("#hdnhawkmpp").val());
            }

            $("#hawkfacets").on("click", ".hawk-selectedGroup a", function (e) {
                e.preventDefault();
                if (HawkSearchLoader.disableAjax) {
                    window.location = $(this).attr("href");
                } else {
                    var options = $(this).data().options;
                    if (window.location.hash == options.hash) {
                        window.history.pushState({}, {}, window.location.pathname);
                        HawkSearch.refreshResults();;
                    } else {
                        window.history.pushState({}, {}, "?" + options.hash);
                        HawkSearch.refreshResults();
                    }

                }
                return false;
            });

            $("#hawkitemlist, #hawktoppager, #hawkbottompager").on("click", ".btnCompareItems", function () {
                if (HawkCompare.countItems() < 2) {
                    alert('You should select at least 2 items');
                    return false;
                } else {
                    $("#hdnhawkcompare").val(window['hawktocompare'].join(","));
                    HawkCompare.process();
                }
                return true;
            });

            $("#hawkitemlist").on("change", "input.ckbItemCompare", function () {
                if ($(this).is(':checked')) {
                    if (HawkCompare.countItems() >= 5) {
                        alert('You can compare up to 5 items');
                        $(this).attr('checked', false);
                        return false;
                    } else {
                        HawkCompare.getImage($(this).val());
                        HawkCompare.addItem($(this).val());
                    }
                } else {
                    HawkCompare.removeItem($(this).val());
                }
                return true;
            });

            $("#hawkfacets").on("click", ".hawk-searchWithinButton", function (event) {
                $("#hdnhawkpg").val("");
                HawkSearch.refreshUrl(event);
            });

            //initial load
            if ($("#hawkitemlist").html() == '' || (!HawkSearchLoader.disableAjax && window.location.hash)) {
                HawkSearch.refreshResults();
            }
            else {
                HawkSearch.Tracking.writeSearch();
                HawkSearch.regTracking();
            }

            if (HawkSearch.GetRecentSearches !== undefined) {
                HawkSearch.GetRecentSearches();
            }

            $(window).on("debouncedresize", function (event) {
                $("#hawkitemlist .itemWrapper").css("min-height", 0);
                $("#hawkbannertop .itemWrapper").css("min-height", 0);
                HawkSearch.normalizeHeights();
                log("resize");
            });

            HawkSearch.BindPreviewInformation();
            HawkSearch.BindFacetTooltip();

            if ($(".hawk-facetScollingContainer").length) {
                HawkSearch.FacetContainerScrollable();
            }

            HawkSearch.BindBackToTop();

        });
    }

    /**
     * Custom jQuery Plugins Below
     */
    function loadJQueryPlugins($) {
        //requireJS, these are not the plugins you are looking for
        //TRUST ME. THIS IS GOOD. PLEASE DON'T REMOVE THIS.
        var define = undefined;

        /*! jQuery UI - v1.10.4 - 2015-07-10
       * http://jqueryui.com
       * Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.sortable.js, jquery.ui.slider.js
       * Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

        if (HawkSearch.loadPlugins.jQueryUI == true) {
            (function (e, t) { function i(t, i) { var n, a, o, r = t.nodeName.toLowerCase(); return "area" === r ? (n = t.parentNode, a = n.name, t.href && a && "map" === n.nodeName.toLowerCase() ? (o = e("img[usemap=#" + a + "]")[0], !!o && s(o)) : !1) : (/input|select|textarea|button|object/.test(r) ? !t.disabled : "a" === r ? t.href || i : i) && s(t) } function s(t) { return e.expr.filters.visible(t) && !e(t).parents().addBack().filter(function () { return "hidden" === e.css(this, "visibility") }).length } var n = 0, a = /^ui-id-\d+$/; e.ui = e.ui || {}, e.extend(e.ui, { version: "1.10.4", keyCode: { BACKSPACE: 8, COMMA: 188, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, LEFT: 37, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108, NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SPACE: 32, TAB: 9, UP: 38 } }), e.fn.extend({ focus: function (t) { return function (i, s) { return "number" == typeof i ? this.each(function () { var t = this; setTimeout(function () { e(t).focus(), s && s.call(t) }, i) }) : t.apply(this, arguments) } }(e.fn.focus), scrollParent: function () { var t; return t = e.ui.ie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position")) ? this.parents().filter(function () { return /(relative|absolute|fixed)/.test(e.css(this, "position")) && /(auto|scroll)/.test(e.css(this, "overflow") + e.css(this, "overflow-y") + e.css(this, "overflow-x")) }).eq(0) : this.parents().filter(function () { return /(auto|scroll)/.test(e.css(this, "overflow") + e.css(this, "overflow-y") + e.css(this, "overflow-x")) }).eq(0), /fixed/.test(this.css("position")) || !t.length ? e(document) : t }, zIndex: function (i) { if (i !== t) return this.css("zIndex", i); if (this.length) for (var s, n, a = e(this[0]); a.length && a[0] !== document;) { if (s = a.css("position"), ("absolute" === s || "relative" === s || "fixed" === s) && (n = parseInt(a.css("zIndex"), 10), !isNaN(n) && 0 !== n)) return n; a = a.parent() } return 0 }, uniqueId: function () { return this.each(function () { this.id || (this.id = "ui-id-" + ++n) }) }, removeUniqueId: function () { return this.each(function () { a.test(this.id) && e(this).removeAttr("id") }) } }), e.extend(e.expr[":"], { data: e.expr.createPseudo ? e.expr.createPseudo(function (t) { return function (i) { return !!e.data(i, t) } }) : function (t, i, s) { return !!e.data(t, s[3]) }, focusable: function (t) { return i(t, !isNaN(e.attr(t, "tabindex"))) }, tabbable: function (t) { var s = e.attr(t, "tabindex"), n = isNaN(s); return (n || s >= 0) && i(t, !n) } }), e("<a>").outerWidth(1).jquery || e.each(["Width", "Height"], function (i, s) { function n(t, i, s, n) { return e.each(a, function () { i -= parseFloat(e.css(t, "padding" + this)) || 0, s && (i -= parseFloat(e.css(t, "border" + this + "Width")) || 0), n && (i -= parseFloat(e.css(t, "margin" + this)) || 0) }), i } var a = "Width" === s ? ["Left", "Right"] : ["Top", "Bottom"], o = s.toLowerCase(), r = { innerWidth: e.fn.innerWidth, innerHeight: e.fn.innerHeight, outerWidth: e.fn.outerWidth, outerHeight: e.fn.outerHeight }; e.fn["inner" + s] = function (i) { return i === t ? r["inner" + s].call(this) : this.each(function () { e(this).css(o, n(this, i) + "px") }) }, e.fn["outer" + s] = function (t, i) { return "number" != typeof t ? r["outer" + s].call(this, t) : this.each(function () { e(this).css(o, n(this, t, !0, i) + "px") }) } }), e.fn.addBack || (e.fn.addBack = function (e) { return this.add(null == e ? this.prevObject : this.prevObject.filter(e)) }), e("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (e.fn.removeData = function (t) { return function (i) { return arguments.length ? t.call(this, e.camelCase(i)) : t.call(this) } }(e.fn.removeData)), e.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()), e.support.selectstart = "onselectstart" in document.createElement("div"), e.fn.extend({ disableSelection: function () { return this.bind((e.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function (e) { e.preventDefault() }) }, enableSelection: function () { return this.unbind(".ui-disableSelection") } }), e.extend(e.ui, { plugin: { add: function (t, i, s) { var n, a = e.ui[t].prototype; for (n in s) a.plugins[n] = a.plugins[n] || [], a.plugins[n].push([i, s[n]]) }, call: function (e, t, i) { var s, n = e.plugins[t]; if (n && e.element[0].parentNode && 11 !== e.element[0].parentNode.nodeType) for (s = 0; n.length > s; s++) e.options[n[s][0]] && n[s][1].apply(e.element, i) } }, hasScroll: function (t, i) { if ("hidden" === e(t).css("overflow")) return !1; var s = i && "left" === i ? "scrollLeft" : "scrollTop", n = !1; return t[s] > 0 ? !0 : (t[s] = 1, n = t[s] > 0, t[s] = 0, n) } }) })(jQuery); (function (e, t) { var i = 0, s = Array.prototype.slice, n = e.cleanData; e.cleanData = function (t) { for (var i, s = 0; null != (i = t[s]); s++) try { e(i).triggerHandler("remove") } catch (a) { } n(t) }, e.widget = function (i, s, n) { var a, o, r, h, l = {}, u = i.split(".")[0]; i = i.split(".")[1], a = u + "-" + i, n || (n = s, s = e.Widget), e.expr[":"][a.toLowerCase()] = function (t) { return !!e.data(t, a) }, e[u] = e[u] || {}, o = e[u][i], r = e[u][i] = function (e, i) { return this._createWidget ? (arguments.length && this._createWidget(e, i), t) : new r(e, i) }, e.extend(r, o, { version: n.version, _proto: e.extend({}, n), _childConstructors: [] }), h = new s, h.options = e.widget.extend({}, h.options), e.each(n, function (i, n) { return e.isFunction(n) ? (l[i] = function () { var e = function () { return s.prototype[i].apply(this, arguments) }, t = function (e) { return s.prototype[i].apply(this, e) }; return function () { var i, s = this._super, a = this._superApply; return this._super = e, this._superApply = t, i = n.apply(this, arguments), this._super = s, this._superApply = a, i } }(), t) : (l[i] = n, t) }), r.prototype = e.widget.extend(h, { widgetEventPrefix: o ? h.widgetEventPrefix || i : i }, l, { constructor: r, namespace: u, widgetName: i, widgetFullName: a }), o ? (e.each(o._childConstructors, function (t, i) { var s = i.prototype; e.widget(s.namespace + "." + s.widgetName, r, i._proto) }), delete o._childConstructors) : s._childConstructors.push(r), e.widget.bridge(i, r) }, e.widget.extend = function (i) { for (var n, a, o = s.call(arguments, 1), r = 0, h = o.length; h > r; r++) for (n in o[r]) a = o[r][n], o[r].hasOwnProperty(n) && a !== t && (i[n] = e.isPlainObject(a) ? e.isPlainObject(i[n]) ? e.widget.extend({}, i[n], a) : e.widget.extend({}, a) : a); return i }, e.widget.bridge = function (i, n) { var a = n.prototype.widgetFullName || i; e.fn[i] = function (o) { var r = "string" == typeof o, h = s.call(arguments, 1), l = this; return o = !r && h.length ? e.widget.extend.apply(null, [o].concat(h)) : o, r ? this.each(function () { var s, n = e.data(this, a); return n ? e.isFunction(n[o]) && "_" !== o.charAt(0) ? (s = n[o].apply(n, h), s !== n && s !== t ? (l = s && s.jquery ? l.pushStack(s.get()) : s, !1) : t) : e.error("no such method '" + o + "' for " + i + " widget instance") : e.error("cannot call methods on " + i + " prior to initialization; " + "attempted to call method '" + o + "'") }) : this.each(function () { var t = e.data(this, a); t ? t.option(o || {})._init() : e.data(this, a, new n(o, this)) }), l } }, e.Widget = function () { }, e.Widget._childConstructors = [], e.Widget.prototype = { widgetName: "widget", widgetEventPrefix: "", defaultElement: "<div>", options: { disabled: !1, create: null }, _createWidget: function (t, s) { s = e(s || this.defaultElement || this)[0], this.element = e(s), this.uuid = i++ , this.eventNamespace = "." + this.widgetName + this.uuid, this.options = e.widget.extend({}, this.options, this._getCreateOptions(), t), this.bindings = e(), this.hoverable = e(), this.focusable = e(), s !== this && (e.data(s, this.widgetFullName, this), this._on(!0, this.element, { remove: function (e) { e.target === s && this.destroy() } }), this.document = e(s.style ? s.ownerDocument : s.document || s), this.window = e(this.document[0].defaultView || this.document[0].parentWindow)), this._create(), this._trigger("create", null, this._getCreateEventData()), this._init() }, _getCreateOptions: e.noop, _getCreateEventData: e.noop, _create: e.noop, _init: e.noop, destroy: function () { this._destroy(), this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)), this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled"), this.bindings.unbind(this.eventNamespace), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus") }, _destroy: e.noop, widget: function () { return this.element }, option: function (i, s) { var n, a, o, r = i; if (0 === arguments.length) return e.widget.extend({}, this.options); if ("string" == typeof i) if (r = {}, n = i.split("."), i = n.shift(), n.length) { for (a = r[i] = e.widget.extend({}, this.options[i]), o = 0; n.length - 1 > o; o++) a[n[o]] = a[n[o]] || {}, a = a[n[o]]; if (i = n.pop(), 1 === arguments.length) return a[i] === t ? null : a[i]; a[i] = s } else { if (1 === arguments.length) return this.options[i] === t ? null : this.options[i]; r[i] = s } return this._setOptions(r), this }, _setOptions: function (e) { var t; for (t in e) this._setOption(t, e[t]); return this }, _setOption: function (e, t) { return this.options[e] = t, "disabled" === e && (this.widget().toggleClass(this.widgetFullName + "-disabled ui-state-disabled", !!t).attr("aria-disabled", t), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus")), this }, enable: function () { return this._setOption("disabled", !1) }, disable: function () { return this._setOption("disabled", !0) }, _on: function (i, s, n) { var a, o = this; "boolean" != typeof i && (n = s, s = i, i = !1), n ? (s = a = e(s), this.bindings = this.bindings.add(s)) : (n = s, s = this.element, a = this.widget()), e.each(n, function (n, r) { function h() { return i || o.options.disabled !== !0 && !e(this).hasClass("ui-state-disabled") ? ("string" == typeof r ? o[r] : r).apply(o, arguments) : t } "string" != typeof r && (h.guid = r.guid = r.guid || h.guid || e.guid++); var l = n.match(/^(\w+)\s*(.*)$/), u = l[1] + o.eventNamespace, d = l[2]; d ? a.delegate(d, u, h) : s.bind(u, h) }) }, _off: function (e, t) { t = (t || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, e.unbind(t).undelegate(t) }, _delay: function (e, t) { function i() { return ("string" == typeof e ? s[e] : e).apply(s, arguments) } var s = this; return setTimeout(i, t || 0) }, _hoverable: function (t) { this.hoverable = this.hoverable.add(t), this._on(t, { mouseenter: function (t) { e(t.currentTarget).addClass("ui-state-hover") }, mouseleave: function (t) { e(t.currentTarget).removeClass("ui-state-hover") } }) }, _focusable: function (t) { this.focusable = this.focusable.add(t), this._on(t, { focusin: function (t) { e(t.currentTarget).addClass("ui-state-focus") }, focusout: function (t) { e(t.currentTarget).removeClass("ui-state-focus") } }) }, _trigger: function (t, i, s) { var n, a, o = this.options[t]; if (s = s || {}, i = e.Event(i), i.type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), i.target = this.element[0], a = i.originalEvent) for (n in a) n in i || (i[n] = a[n]); return this.element.trigger(i, s), !(e.isFunction(o) && o.apply(this.element[0], [i].concat(s)) === !1 || i.isDefaultPrevented()) } }, e.each({ show: "fadeIn", hide: "fadeOut" }, function (t, i) { e.Widget.prototype["_" + t] = function (s, n, a) { "string" == typeof n && (n = { effect: n }); var o, r = n ? n === !0 || "number" == typeof n ? i : n.effect || i : t; n = n || {}, "number" == typeof n && (n = { duration: n }), o = !e.isEmptyObject(n), n.complete = a, n.delay && s.delay(n.delay), o && e.effects && e.effects.effect[r] ? s[t](n) : r !== t && s[r] ? s[r](n.duration, n.easing, a) : s.queue(function (i) { e(this)[t](), a && a.call(s[0]), i() }) } }) })(jQuery); (function (e) { var t = !1; e(document).mouseup(function () { t = !1 }), e.widget("ui.mouse", { version: "1.10.4", options: { cancel: "input,textarea,button,select,option", distance: 1, delay: 0 }, _mouseInit: function () { var t = this; this.element.bind("mousedown." + this.widgetName, function (e) { return t._mouseDown(e) }).bind("click." + this.widgetName, function (i) { return !0 === e.data(i.target, t.widgetName + ".preventClickEvent") ? (e.removeData(i.target, t.widgetName + ".preventClickEvent"), i.stopImmediatePropagation(), !1) : undefined }), this.started = !1 }, _mouseDestroy: function () { this.element.unbind("." + this.widgetName), this._mouseMoveDelegate && e(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate) }, _mouseDown: function (i) { if (!t) { this._mouseStarted && this._mouseUp(i), this._mouseDownEvent = i; var s = this, n = 1 === i.which, a = "string" == typeof this.options.cancel && i.target.nodeName ? e(i.target).closest(this.options.cancel).length : !1; return n && !a && this._mouseCapture(i) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function () { s.mouseDelayMet = !0 }, this.options.delay)), this._mouseDistanceMet(i) && this._mouseDelayMet(i) && (this._mouseStarted = this._mouseStart(i) !== !1, !this._mouseStarted) ? (i.preventDefault(), !0) : (!0 === e.data(i.target, this.widgetName + ".preventClickEvent") && e.removeData(i.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function (e) { return s._mouseMove(e) }, this._mouseUpDelegate = function (e) { return s._mouseUp(e) }, e(document).bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate), i.preventDefault(), t = !0, !0)) : !0 } }, _mouseMove: function (t) { return e.ui.ie && (!document.documentMode || 9 > document.documentMode) && !t.button ? this._mouseUp(t) : this._mouseStarted ? (this._mouseDrag(t), t.preventDefault()) : (this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, t) !== !1, this._mouseStarted ? this._mouseDrag(t) : this._mouseUp(t)), !this._mouseStarted) }, _mouseUp: function (t) { return e(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, t.target === this._mouseDownEvent.target && e.data(t.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(t)), !1 }, _mouseDistanceMet: function (e) { return Math.max(Math.abs(this._mouseDownEvent.pageX - e.pageX), Math.abs(this._mouseDownEvent.pageY - e.pageY)) >= this.options.distance }, _mouseDelayMet: function () { return this.mouseDelayMet }, _mouseStart: function () { }, _mouseDrag: function () { }, _mouseStop: function () { }, _mouseCapture: function () { return !0 } }) })(jQuery); (function (e) { function t(e, t, i) { return e > t && t + i > e } function i(e) { return /left|right/.test(e.css("float")) || /inline|table-cell/.test(e.css("display")) } e.widget("ui.sortable", e.ui.mouse, { version: "1.10.4", widgetEventPrefix: "sort", ready: !1, options: { appendTo: "parent", axis: !1, connectWith: !1, containment: !1, cursor: "auto", cursorAt: !1, dropOnEmpty: !0, forcePlaceholderSize: !1, forceHelperSize: !1, grid: !1, handle: !1, helper: "original", items: "> *", opacity: !1, placeholder: !1, revert: !1, scroll: !0, scrollSensitivity: 20, scrollSpeed: 20, scope: "default", tolerance: "intersect", zIndex: 1e3, activate: null, beforeStop: null, change: null, deactivate: null, out: null, over: null, receive: null, remove: null, sort: null, start: null, stop: null, update: null }, _create: function () { var e = this.options; this.containerCache = {}, this.element.addClass("ui-sortable"), this.refresh(), this.floating = this.items.length ? "x" === e.axis || i(this.items[0].item) : !1, this.offset = this.element.offset(), this._mouseInit(), this.ready = !0 }, _destroy: function () { this.element.removeClass("ui-sortable ui-sortable-disabled"), this._mouseDestroy(); for (var e = this.items.length - 1; e >= 0; e--) this.items[e].item.removeData(this.widgetName + "-item"); return this }, _setOption: function (t, i) { "disabled" === t ? (this.options[t] = i, this.widget().toggleClass("ui-sortable-disabled", !!i)) : e.Widget.prototype._setOption.apply(this, arguments) }, _mouseCapture: function (t, i) { var s = null, n = !1, a = this; return this.reverting ? !1 : this.options.disabled || "static" === this.options.type ? !1 : (this._refreshItems(t), e(t.target).parents().each(function () { return e.data(this, a.widgetName + "-item") === a ? (s = e(this), !1) : undefined }), e.data(t.target, a.widgetName + "-item") === a && (s = e(t.target)), s ? !this.options.handle || i || (e(this.options.handle, s).find("*").addBack().each(function () { this === t.target && (n = !0) }), n) ? (this.currentItem = s, this._removeCurrentsFromItems(), !0) : !1 : !1) }, _mouseStart: function (t, i, s) { var n, a, o = this.options; if (this.currentContainer = this, this.refreshPositions(), this.helper = this._createHelper(t), this._cacheHelperProportions(), this._cacheMargins(), this.scrollParent = this.helper.scrollParent(), this.offset = this.currentItem.offset(), this.offset = { top: this.offset.top - this.margins.top, left: this.offset.left - this.margins.left }, e.extend(this.offset, { click: { left: t.pageX - this.offset.left, top: t.pageY - this.offset.top }, parent: this._getParentOffset(), relative: this._getRelativeOffset() }), this.helper.css("position", "absolute"), this.cssPosition = this.helper.css("position"), this.originalPosition = this._generatePosition(t), this.originalPageX = t.pageX, this.originalPageY = t.pageY, o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt), this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] }, this.helper[0] !== this.currentItem[0] && this.currentItem.hide(), this._createPlaceholder(), o.containment && this._setContainment(), o.cursor && "auto" !== o.cursor && (a = this.document.find("body"), this.storedCursor = a.css("cursor"), a.css("cursor", o.cursor), this.storedStylesheet = e("<style>*{ cursor: " + o.cursor + " !important; }</style>").appendTo(a)), o.opacity && (this.helper.css("opacity") && (this._storedOpacity = this.helper.css("opacity")), this.helper.css("opacity", o.opacity)), o.zIndex && (this.helper.css("zIndex") && (this._storedZIndex = this.helper.css("zIndex")), this.helper.css("zIndex", o.zIndex)), this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this._trigger("start", t, this._uiHash()), this._preserveHelperProportions || this._cacheHelperProportions(), !s) for (n = this.containers.length - 1; n >= 0; n--) this.containers[n]._trigger("activate", t, this._uiHash(this)); return e.ui.ddmanager && (e.ui.ddmanager.current = this), e.ui.ddmanager && !o.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this.dragging = !0, this.helper.addClass("ui-sortable-helper"), this._mouseDrag(t), !0 }, _mouseDrag: function (t) { var i, s, n, a, o = this.options, r = !1; for (this.position = this._generatePosition(t), this.positionAbs = this._convertPositionTo("absolute"), this.lastPositionAbs || (this.lastPositionAbs = this.positionAbs), this.options.scroll && (this.scrollParent[0] !== document && "HTML" !== this.scrollParent[0].tagName ? (this.overflowOffset.top + this.scrollParent[0].offsetHeight - t.pageY < o.scrollSensitivity ? this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop + o.scrollSpeed : t.pageY - this.overflowOffset.top < o.scrollSensitivity && (this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop - o.scrollSpeed), this.overflowOffset.left + this.scrollParent[0].offsetWidth - t.pageX < o.scrollSensitivity ? this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft + o.scrollSpeed : t.pageX - this.overflowOffset.left < o.scrollSensitivity && (this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft - o.scrollSpeed)) : (t.pageY - e(document).scrollTop() < o.scrollSensitivity ? r = e(document).scrollTop(e(document).scrollTop() - o.scrollSpeed) : e(window).height() - (t.pageY - e(document).scrollTop()) < o.scrollSensitivity && (r = e(document).scrollTop(e(document).scrollTop() + o.scrollSpeed)), t.pageX - e(document).scrollLeft() < o.scrollSensitivity ? r = e(document).scrollLeft(e(document).scrollLeft() - o.scrollSpeed) : e(window).width() - (t.pageX - e(document).scrollLeft()) < o.scrollSensitivity && (r = e(document).scrollLeft(e(document).scrollLeft() + o.scrollSpeed))), r !== !1 && e.ui.ddmanager && !o.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t)), this.positionAbs = this._convertPositionTo("absolute"), this.options.axis && "y" === this.options.axis || (this.helper[0].style.left = this.position.left + "px"), this.options.axis && "x" === this.options.axis || (this.helper[0].style.top = this.position.top + "px"), i = this.items.length - 1; i >= 0; i--) if (s = this.items[i], n = s.item[0], a = this._intersectsWithPointer(s), a && s.instance === this.currentContainer && n !== this.currentItem[0] && this.placeholder[1 === a ? "next" : "prev"]()[0] !== n && !e.contains(this.placeholder[0], n) && ("semi-dynamic" === this.options.type ? !e.contains(this.element[0], n) : !0)) { if (this.direction = 1 === a ? "down" : "up", "pointer" !== this.options.tolerance && !this._intersectsWithSides(s)) break; this._rearrange(t, s), this._trigger("change", t, this._uiHash()); break } return this._contactContainers(t), e.ui.ddmanager && e.ui.ddmanager.drag(this, t), this._trigger("sort", t, this._uiHash()), this.lastPositionAbs = this.positionAbs, !1 }, _mouseStop: function (t, i) { if (t) { if (e.ui.ddmanager && !this.options.dropBehaviour && e.ui.ddmanager.drop(this, t), this.options.revert) { var s = this, n = this.placeholder.offset(), a = this.options.axis, o = {}; a && "x" !== a || (o.left = n.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollLeft)), a && "y" !== a || (o.top = n.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === document.body ? 0 : this.offsetParent[0].scrollTop)), this.reverting = !0, e(this.helper).animate(o, parseInt(this.options.revert, 10) || 500, function () { s._clear(t) }) } else this._clear(t, i); return !1 } }, cancel: function () { if (this.dragging) { this._mouseUp({ target: null }), "original" === this.options.helper ? this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") : this.currentItem.show(); for (var t = this.containers.length - 1; t >= 0; t--) this.containers[t]._trigger("deactivate", null, this._uiHash(this)), this.containers[t].containerCache.over && (this.containers[t]._trigger("out", null, this._uiHash(this)), this.containers[t].containerCache.over = 0) } return this.placeholder && (this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]), "original" !== this.options.helper && this.helper && this.helper[0].parentNode && this.helper.remove(), e.extend(this, { helper: null, dragging: !1, reverting: !1, _noFinalSort: null }), this.domPosition.prev ? e(this.domPosition.prev).after(this.currentItem) : e(this.domPosition.parent).prepend(this.currentItem)), this }, serialize: function (t) { var i = this._getItemsAsjQuery(t && t.connected), s = []; return t = t || {}, e(i).each(function () { var i = (e(t.item || this).attr(t.attribute || "id") || "").match(t.expression || /(.+)[\-=_](.+)/); i && s.push((t.key || i[1] + "[]") + "=" + (t.key && t.expression ? i[1] : i[2])) }), !s.length && t.key && s.push(t.key + "="), s.join("&") }, toArray: function (t) { var i = this._getItemsAsjQuery(t && t.connected), s = []; return t = t || {}, i.each(function () { s.push(e(t.item || this).attr(t.attribute || "id") || "") }), s }, _intersectsWith: function (e) { var t = this.positionAbs.left, i = t + this.helperProportions.width, s = this.positionAbs.top, n = s + this.helperProportions.height, a = e.left, o = a + e.width, r = e.top, h = r + e.height, l = this.offset.click.top, u = this.offset.click.left, d = "x" === this.options.axis || s + l > r && h > s + l, c = "y" === this.options.axis || t + u > a && o > t + u, p = d && c; return "pointer" === this.options.tolerance || this.options.forcePointerForContainers || "pointer" !== this.options.tolerance && this.helperProportions[this.floating ? "width" : "height"] > e[this.floating ? "width" : "height"] ? p : t + this.helperProportions.width / 2 > a && o > i - this.helperProportions.width / 2 && s + this.helperProportions.height / 2 > r && h > n - this.helperProportions.height / 2 }, _intersectsWithPointer: function (e) { var i = "x" === this.options.axis || t(this.positionAbs.top + this.offset.click.top, e.top, e.height), s = "y" === this.options.axis || t(this.positionAbs.left + this.offset.click.left, e.left, e.width), n = i && s, a = this._getDragVerticalDirection(), o = this._getDragHorizontalDirection(); return n ? this.floating ? o && "right" === o || "down" === a ? 2 : 1 : a && ("down" === a ? 2 : 1) : !1 }, _intersectsWithSides: function (e) { var i = t(this.positionAbs.top + this.offset.click.top, e.top + e.height / 2, e.height), s = t(this.positionAbs.left + this.offset.click.left, e.left + e.width / 2, e.width), n = this._getDragVerticalDirection(), a = this._getDragHorizontalDirection(); return this.floating && a ? "right" === a && s || "left" === a && !s : n && ("down" === n && i || "up" === n && !i) }, _getDragVerticalDirection: function () { var e = this.positionAbs.top - this.lastPositionAbs.top; return 0 !== e && (e > 0 ? "down" : "up") }, _getDragHorizontalDirection: function () { var e = this.positionAbs.left - this.lastPositionAbs.left; return 0 !== e && (e > 0 ? "right" : "left") }, refresh: function (e) { return this._refreshItems(e), this.refreshPositions(), this }, _connectWith: function () { var e = this.options; return e.connectWith.constructor === String ? [e.connectWith] : e.connectWith }, _getItemsAsjQuery: function (t) { function i() { r.push(this) } var s, n, a, o, r = [], h = [], l = this._connectWith(); if (l && t) for (s = l.length - 1; s >= 0; s--) for (a = e(l[s]), n = a.length - 1; n >= 0; n--) o = e.data(a[n], this.widgetFullName), o && o !== this && !o.options.disabled && h.push([e.isFunction(o.options.items) ? o.options.items.call(o.element) : e(o.options.items, o.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), o]); for (h.push([e.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : e(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]), s = h.length - 1; s >= 0; s--) h[s][0].each(i); return e(r) }, _removeCurrentsFromItems: function () { var t = this.currentItem.find(":data(" + this.widgetName + "-item)"); this.items = e.grep(this.items, function (e) { for (var i = 0; t.length > i; i++) if (t[i] === e.item[0]) return !1; return !0 }) }, _refreshItems: function (t) { this.items = [], this.containers = [this]; var i, s, n, a, o, r, h, l, u = this.items, d = [[e.isFunction(this.options.items) ? this.options.items.call(this.element[0], t, { item: this.currentItem }) : e(this.options.items, this.element), this]], c = this._connectWith(); if (c && this.ready) for (i = c.length - 1; i >= 0; i--) for (n = e(c[i]), s = n.length - 1; s >= 0; s--) a = e.data(n[s], this.widgetFullName), a && a !== this && !a.options.disabled && (d.push([e.isFunction(a.options.items) ? a.options.items.call(a.element[0], t, { item: this.currentItem }) : e(a.options.items, a.element), a]), this.containers.push(a)); for (i = d.length - 1; i >= 0; i--) for (o = d[i][1], r = d[i][0], s = 0, l = r.length; l > s; s++) h = e(r[s]), h.data(this.widgetName + "-item", o), u.push({ item: h, instance: o, width: 0, height: 0, left: 0, top: 0 }) }, refreshPositions: function (t) { this.offsetParent && this.helper && (this.offset.parent = this._getParentOffset()); var i, s, n, a; for (i = this.items.length - 1; i >= 0; i--) s = this.items[i], s.instance !== this.currentContainer && this.currentContainer && s.item[0] !== this.currentItem[0] || (n = this.options.toleranceElement ? e(this.options.toleranceElement, s.item) : s.item, t || (s.width = n.outerWidth(), s.height = n.outerHeight()), a = n.offset(), s.left = a.left, s.top = a.top); if (this.options.custom && this.options.custom.refreshContainers) this.options.custom.refreshContainers.call(this); else for (i = this.containers.length - 1; i >= 0; i--) a = this.containers[i].element.offset(), this.containers[i].containerCache.left = a.left, this.containers[i].containerCache.top = a.top, this.containers[i].containerCache.width = this.containers[i].element.outerWidth(), this.containers[i].containerCache.height = this.containers[i].element.outerHeight(); return this }, _createPlaceholder: function (t) { t = t || this; var i, s = t.options; s.placeholder && s.placeholder.constructor !== String || (i = s.placeholder, s.placeholder = { element: function () { var s = t.currentItem[0].nodeName.toLowerCase(), n = e("<" + s + ">", t.document[0]).addClass(i || t.currentItem[0].className + " ui-sortable-placeholder").removeClass("ui-sortable-helper"); return "tr" === s ? t.currentItem.children().each(function () { e("<td>&#160;</td>", t.document[0]).attr("colspan", e(this).attr("colspan") || 1).appendTo(n) }) : "img" === s && n.attr("src", t.currentItem.attr("src")), i || n.css("visibility", "hidden"), n }, update: function (e, n) { (!i || s.forcePlaceholderSize) && (n.height() || n.height(t.currentItem.innerHeight() - parseInt(t.currentItem.css("paddingTop") || 0, 10) - parseInt(t.currentItem.css("paddingBottom") || 0, 10)), n.width() || n.width(t.currentItem.innerWidth() - parseInt(t.currentItem.css("paddingLeft") || 0, 10) - parseInt(t.currentItem.css("paddingRight") || 0, 10))) } }), t.placeholder = e(s.placeholder.element.call(t.element, t.currentItem)), t.currentItem.after(t.placeholder), s.placeholder.update(t, t.placeholder) }, _contactContainers: function (s) { var n, a, o, r, h, l, u, d, c, p, f = null, m = null; for (n = this.containers.length - 1; n >= 0; n--) if (!e.contains(this.currentItem[0], this.containers[n].element[0])) if (this._intersectsWith(this.containers[n].containerCache)) { if (f && e.contains(this.containers[n].element[0], f.element[0])) continue; f = this.containers[n], m = n } else this.containers[n].containerCache.over && (this.containers[n]._trigger("out", s, this._uiHash(this)), this.containers[n].containerCache.over = 0); if (f) if (1 === this.containers.length) this.containers[m].containerCache.over || (this.containers[m]._trigger("over", s, this._uiHash(this)), this.containers[m].containerCache.over = 1); else { for (o = 1e4, r = null, p = f.floating || i(this.currentItem), h = p ? "left" : "top", l = p ? "width" : "height", u = this.positionAbs[h] + this.offset.click[h], a = this.items.length - 1; a >= 0; a--) e.contains(this.containers[m].element[0], this.items[a].item[0]) && this.items[a].item[0] !== this.currentItem[0] && (!p || t(this.positionAbs.top + this.offset.click.top, this.items[a].top, this.items[a].height)) && (d = this.items[a].item.offset()[h], c = !1, Math.abs(d - u) > Math.abs(d + this.items[a][l] - u) && (c = !0, d += this.items[a][l]), o > Math.abs(d - u) && (o = Math.abs(d - u), r = this.items[a], this.direction = c ? "up" : "down")); if (!r && !this.options.dropOnEmpty) return; if (this.currentContainer === this.containers[m]) return; r ? this._rearrange(s, r, null, !0) : this._rearrange(s, null, this.containers[m].element, !0), this._trigger("change", s, this._uiHash()), this.containers[m]._trigger("change", s, this._uiHash(this)), this.currentContainer = this.containers[m], this.options.placeholder.update(this.currentContainer, this.placeholder), this.containers[m]._trigger("over", s, this._uiHash(this)), this.containers[m].containerCache.over = 1 } }, _createHelper: function (t) { var i = this.options, s = e.isFunction(i.helper) ? e(i.helper.apply(this.element[0], [t, this.currentItem])) : "clone" === i.helper ? this.currentItem.clone() : this.currentItem; return s.parents("body").length || e("parent" !== i.appendTo ? i.appendTo : this.currentItem[0].parentNode)[0].appendChild(s[0]), s[0] === this.currentItem[0] && (this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") }), (!s[0].style.width || i.forceHelperSize) && s.width(this.currentItem.width()), (!s[0].style.height || i.forceHelperSize) && s.height(this.currentItem.height()), s }, _adjustOffsetFromHelper: function (t) { "string" == typeof t && (t = t.split(" ")), e.isArray(t) && (t = { left: +t[0], top: +t[1] || 0 }), "left" in t && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top) }, _getParentOffset: function () { this.offsetParent = this.helper.offsetParent(); var t = this.offsetParent.offset(); return "absolute" === this.cssPosition && this.scrollParent[0] !== document && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), (this.offsetParent[0] === document.body || this.offsetParent[0].tagName && "html" === this.offsetParent[0].tagName.toLowerCase() && e.ui.ie) && (t = { top: 0, left: 0 }), { top: t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0), left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0) } }, _getRelativeOffset: function () { if ("relative" === this.cssPosition) { var e = this.currentItem.position(); return { top: e.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(), left: e.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft() } } return { top: 0, left: 0 } }, _cacheMargins: function () { this.margins = { left: parseInt(this.currentItem.css("marginLeft"), 10) || 0, top: parseInt(this.currentItem.css("marginTop"), 10) || 0 } }, _cacheHelperProportions: function () { this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() } }, _setContainment: function () { var t, i, s, n = this.options; "parent" === n.containment && (n.containment = this.helper[0].parentNode), ("document" === n.containment || "window" === n.containment) && (this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, e("document" === n.containment ? document : window).width() - this.helperProportions.width - this.margins.left, (e("document" === n.containment ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top]), /^(document|window|parent)$/.test(n.containment) || (t = e(n.containment)[0], i = e(n.containment).offset(), s = "hidden" !== e(t).css("overflow"), this.containment = [i.left + (parseInt(e(t).css("borderLeftWidth"), 10) || 0) + (parseInt(e(t).css("paddingLeft"), 10) || 0) - this.margins.left, i.top + (parseInt(e(t).css("borderTopWidth"), 10) || 0) + (parseInt(e(t).css("paddingTop"), 10) || 0) - this.margins.top, i.left + (s ? Math.max(t.scrollWidth, t.offsetWidth) : t.offsetWidth) - (parseInt(e(t).css("borderLeftWidth"), 10) || 0) - (parseInt(e(t).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, i.top + (s ? Math.max(t.scrollHeight, t.offsetHeight) : t.offsetHeight) - (parseInt(e(t).css("borderTopWidth"), 10) || 0) - (parseInt(e(t).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top]) }, _convertPositionTo: function (t, i) { i || (i = this.position); var s = "absolute" === t ? 1 : -1, n = "absolute" !== this.cssPosition || this.scrollParent[0] !== document && e.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent, a = /(html|body)/i.test(n[0].tagName); return { top: i.top + this.offset.relative.top * s + this.offset.parent.top * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : a ? 0 : n.scrollTop()) * s, left: i.left + this.offset.relative.left * s + this.offset.parent.left * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : a ? 0 : n.scrollLeft()) * s } }, _generatePosition: function (t) { var i, s, n = this.options, a = t.pageX, o = t.pageY, r = "absolute" !== this.cssPosition || this.scrollParent[0] !== document && e.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent, h = /(html|body)/i.test(r[0].tagName); return "relative" !== this.cssPosition || this.scrollParent[0] !== document && this.scrollParent[0] !== this.offsetParent[0] || (this.offset.relative = this._getRelativeOffset()), this.originalPosition && (this.containment && (t.pageX - this.offset.click.left < this.containment[0] && (a = this.containment[0] + this.offset.click.left), t.pageY - this.offset.click.top < this.containment[1] && (o = this.containment[1] + this.offset.click.top), t.pageX - this.offset.click.left > this.containment[2] && (a = this.containment[2] + this.offset.click.left), t.pageY - this.offset.click.top > this.containment[3] && (o = this.containment[3] + this.offset.click.top)), n.grid && (i = this.originalPageY + Math.round((o - this.originalPageY) / n.grid[1]) * n.grid[1], o = this.containment ? i - this.offset.click.top >= this.containment[1] && i - this.offset.click.top <= this.containment[3] ? i : i - this.offset.click.top >= this.containment[1] ? i - n.grid[1] : i + n.grid[1] : i, s = this.originalPageX + Math.round((a - this.originalPageX) / n.grid[0]) * n.grid[0], a = this.containment ? s - this.offset.click.left >= this.containment[0] && s - this.offset.click.left <= this.containment[2] ? s : s - this.offset.click.left >= this.containment[0] ? s - n.grid[0] : s + n.grid[0] : s)), { top: o - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : h ? 0 : r.scrollTop()), left: a - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : h ? 0 : r.scrollLeft()) } }, _rearrange: function (e, t, i, s) { i ? i[0].appendChild(this.placeholder[0]) : t.item[0].parentNode.insertBefore(this.placeholder[0], "down" === this.direction ? t.item[0] : t.item[0].nextSibling), this.counter = this.counter ? ++this.counter : 1; var n = this.counter; this._delay(function () { n === this.counter && this.refreshPositions(!s) }) }, _clear: function (e, t) { function i(e, t, i) { return function (s) { i._trigger(e, s, t._uiHash(t)) } } this.reverting = !1; var s, n = []; if (!this._noFinalSort && this.currentItem.parent().length && this.placeholder.before(this.currentItem), this._noFinalSort = null, this.helper[0] === this.currentItem[0]) { for (s in this._storedCSS) ("auto" === this._storedCSS[s] || "static" === this._storedCSS[s]) && (this._storedCSS[s] = ""); this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper") } else this.currentItem.show(); for (this.fromOutside && !t && n.push(function (e) { this._trigger("receive", e, this._uiHash(this.fromOutside)) }), !this.fromOutside && this.domPosition.prev === this.currentItem.prev().not(".ui-sortable-helper")[0] && this.domPosition.parent === this.currentItem.parent()[0] || t || n.push(function (e) { this._trigger("update", e, this._uiHash()) }), this !== this.currentContainer && (t || (n.push(function (e) { this._trigger("remove", e, this._uiHash()) }), n.push(function (e) { return function (t) { e._trigger("receive", t, this._uiHash(this)) } }.call(this, this.currentContainer)), n.push(function (e) { return function (t) { e._trigger("update", t, this._uiHash(this)) } }.call(this, this.currentContainer)))), s = this.containers.length - 1; s >= 0; s--) t || n.push(i("deactivate", this, this.containers[s])), this.containers[s].containerCache.over && (n.push(i("out", this, this.containers[s])), this.containers[s].containerCache.over = 0); if (this.storedCursor && (this.document.find("body").css("cursor", this.storedCursor), this.storedStylesheet.remove()), this._storedOpacity && this.helper.css("opacity", this._storedOpacity), this._storedZIndex && this.helper.css("zIndex", "auto" === this._storedZIndex ? "" : this._storedZIndex), this.dragging = !1, this.cancelHelperRemoval) { if (!t) { for (this._trigger("beforeStop", e, this._uiHash()), s = 0; n.length > s; s++) n[s].call(this, e); this._trigger("stop", e, this._uiHash()) } return this.fromOutside = !1, !1 } if (t || this._trigger("beforeStop", e, this._uiHash()), this.placeholder[0].parentNode.removeChild(this.placeholder[0]), this.helper[0] !== this.currentItem[0] && this.helper.remove(), this.helper = null, !t) { for (s = 0; n.length > s; s++) n[s].call(this, e); this._trigger("stop", e, this._uiHash()) } return this.fromOutside = !1, !0 }, _trigger: function () { e.Widget.prototype._trigger.apply(this, arguments) === !1 && this.cancel() }, _uiHash: function (t) { var i = t || this; return { helper: i.helper, placeholder: i.placeholder || e([]), position: i.position, originalPosition: i.originalPosition, offset: i.positionAbs, item: i.currentItem, sender: t ? t.element : null } } }) })(jQuery); (function (e) { var t = 5; e.widget("ui.slider", e.ui.mouse, { version: "1.10.4", widgetEventPrefix: "slide", options: { animate: !1, distance: 0, max: 100, min: 0, orientation: "horizontal", range: !1, step: 1, value: 0, values: null, change: null, slide: null, start: null, stop: null }, _create: function () { this._keySliding = !1, this._mouseSliding = !1, this._animateOff = !0, this._handleIndex = null, this._detectOrientation(), this._mouseInit(), this.element.addClass("ui-slider ui-slider-" + this.orientation + " ui-widget" + " ui-widget-content" + " ui-corner-all"), this._refresh(), this._setOption("disabled", this.options.disabled), this._animateOff = !1 }, _refresh: function () { this._createRange(), this._createHandles(), this._setupEvents(), this._refreshValue() }, _createHandles: function () { var t, i, s = this.options, n = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"), a = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>", o = []; for (i = s.values && s.values.length || 1, n.length > i && (n.slice(i).remove(), n = n.slice(0, i)), t = n.length; i > t; t++) o.push(a); this.handles = n.add(e(o.join("")).appendTo(this.element)), this.handle = this.handles.eq(0), this.handles.each(function (t) { e(this).data("ui-slider-handle-index", t) }) }, _createRange: function () { var t = this.options, i = ""; t.range ? (t.range === !0 && (t.values ? t.values.length && 2 !== t.values.length ? t.values = [t.values[0], t.values[0]] : e.isArray(t.values) && (t.values = t.values.slice(0)) : t.values = [this._valueMin(), this._valueMin()]), this.range && this.range.length ? this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({ left: "", bottom: "" }) : (this.range = e("<div></div>").appendTo(this.element), i = "ui-slider-range ui-widget-header ui-corner-all"), this.range.addClass(i + ("min" === t.range || "max" === t.range ? " ui-slider-range-" + t.range : ""))) : (this.range && this.range.remove(), this.range = null) }, _setupEvents: function () { var e = this.handles.add(this.range).filter("a"); this._off(e), this._on(e, this._handleEvents), this._hoverable(e), this._focusable(e) }, _destroy: function () { this.handles.remove(), this.range && this.range.remove(), this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"), this._mouseDestroy() }, _mouseCapture: function (t) { var i, s, n, a, o, r, h, l, u = this, d = this.options; return d.disabled ? !1 : (this.elementSize = { width: this.element.outerWidth(), height: this.element.outerHeight() }, this.elementOffset = this.element.offset(), i = { x: t.pageX, y: t.pageY }, s = this._normValueFromMouse(i), n = this._valueMax() - this._valueMin() + 1, this.handles.each(function (t) { var i = Math.abs(s - u.values(t)); (n > i || n === i && (t === u._lastChangedValue || u.values(t) === d.min)) && (n = i, a = e(this), o = t) }), r = this._start(t, o), r === !1 ? !1 : (this._mouseSliding = !0, this._handleIndex = o, a.addClass("ui-state-active").focus(), h = a.offset(), l = !e(t.target).parents().addBack().is(".ui-slider-handle"), this._clickOffset = l ? { left: 0, top: 0 } : { left: t.pageX - h.left - a.width() / 2, top: t.pageY - h.top - a.height() / 2 - (parseInt(a.css("borderTopWidth"), 10) || 0) - (parseInt(a.css("borderBottomWidth"), 10) || 0) + (parseInt(a.css("marginTop"), 10) || 0) }, this.handles.hasClass("ui-state-hover") || this._slide(t, o, s), this._animateOff = !0, !0)) }, _mouseStart: function () { return !0 }, _mouseDrag: function (e) { var t = { x: e.pageX, y: e.pageY }, i = this._normValueFromMouse(t); return this._slide(e, this._handleIndex, i), !1 }, _mouseStop: function (e) { return this.handles.removeClass("ui-state-active"), this._mouseSliding = !1, this._stop(e, this._handleIndex), this._change(e, this._handleIndex), this._handleIndex = null, this._clickOffset = null, this._animateOff = !1, !1 }, _detectOrientation: function () { this.orientation = "vertical" === this.options.orientation ? "vertical" : "horizontal" }, _normValueFromMouse: function (e) { var t, i, s, n, a; return "horizontal" === this.orientation ? (t = this.elementSize.width, i = e.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0)) : (t = this.elementSize.height, i = e.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0)), s = i / t, s > 1 && (s = 1), 0 > s && (s = 0), "vertical" === this.orientation && (s = 1 - s), n = this._valueMax() - this._valueMin(), a = this._valueMin() + s * n, this._trimAlignValue(a) }, _start: function (e, t) { var i = { handle: this.handles[t], value: this.value() }; return this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()), this._trigger("start", e, i) }, _slide: function (e, t, i) { var s, n, a; this.options.values && this.options.values.length ? (s = this.values(t ? 0 : 1), 2 === this.options.values.length && this.options.range === !0 && (0 === t && i > s || 1 === t && s > i) && (i = s), i !== this.values(t) && (n = this.values(), n[t] = i, a = this._trigger("slide", e, { handle: this.handles[t], value: i, values: n }), s = this.values(t ? 0 : 1), a !== !1 && this.values(t, i))) : i !== this.value() && (a = this._trigger("slide", e, { handle: this.handles[t], value: i }), a !== !1 && this.value(i)) }, _stop: function (e, t) { var i = { handle: this.handles[t], value: this.value() }; this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()), this._trigger("stop", e, i) }, _change: function (e, t) { if (!this._keySliding && !this._mouseSliding) { var i = { handle: this.handles[t], value: this.value() }; this.options.values && this.options.values.length && (i.value = this.values(t), i.values = this.values()), this._lastChangedValue = t, this._trigger("change", e, i) } }, value: function (e) { return arguments.length ? (this.options.value = this._trimAlignValue(e), this._refreshValue(), this._change(null, 0), undefined) : this._value() }, values: function (t, i) { var s, n, a; if (arguments.length > 1) return this.options.values[t] = this._trimAlignValue(i), this._refreshValue(), this._change(null, t), undefined; if (!arguments.length) return this._values(); if (!e.isArray(arguments[0])) return this.options.values && this.options.values.length ? this._values(t) : this.value(); for (s = this.options.values, n = arguments[0], a = 0; s.length > a; a += 1) s[a] = this._trimAlignValue(n[a]), this._change(null, a); this._refreshValue() }, _setOption: function (t, i) { var s, n = 0; switch ("range" === t && this.options.range === !0 && ("min" === i ? (this.options.value = this._values(0), this.options.values = null) : "max" === i && (this.options.value = this._values(this.options.values.length - 1), this.options.values = null)), e.isArray(this.options.values) && (n = this.options.values.length), e.Widget.prototype._setOption.apply(this, arguments), t) { case "orientation": this._detectOrientation(), this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-" + this.orientation), this._refreshValue(); break; case "value": this._animateOff = !0, this._refreshValue(), this._change(null, 0), this._animateOff = !1; break; case "values": for (this._animateOff = !0, this._refreshValue(), s = 0; n > s; s += 1) this._change(null, s); this._animateOff = !1; break; case "min": case "max": this._animateOff = !0, this._refreshValue(), this._animateOff = !1; break; case "range": this._animateOff = !0, this._refresh(), this._animateOff = !1 } }, _value: function () { var e = this.options.value; return e = this._trimAlignValue(e) }, _values: function (e) { var t, i, s; if (arguments.length) return t = this.options.values[e], t = this._trimAlignValue(t); if (this.options.values && this.options.values.length) { for (i = this.options.values.slice(), s = 0; i.length > s; s += 1) i[s] = this._trimAlignValue(i[s]); return i } return [] }, _trimAlignValue: function (e) { if (this._valueMin() >= e) return this._valueMin(); if (e >= this._valueMax()) return this._valueMax(); var t = this.options.step > 0 ? this.options.step : 1, i = (e - this._valueMin()) % t, s = e - i; return 2 * Math.abs(i) >= t && (s += i > 0 ? t : -t), parseFloat(s.toFixed(5)) }, _valueMin: function () { return this.options.min }, _valueMax: function () { return this.options.max }, _refreshValue: function () { var t, i, s, n, a, o = this.options.range, r = this.options, h = this, l = this._animateOff ? !1 : r.animate, u = {}; this.options.values && this.options.values.length ? this.handles.each(function (s) { i = 100 * ((h.values(s) - h._valueMin()) / (h._valueMax() - h._valueMin())), u["horizontal" === h.orientation ? "left" : "bottom"] = i + "%", e(this).stop(1, 1)[l ? "animate" : "css"](u, r.animate), h.options.range === !0 && ("horizontal" === h.orientation ? (0 === s && h.range.stop(1, 1)[l ? "animate" : "css"]({ left: i + "%" }, r.animate), 1 === s && h.range[l ? "animate" : "css"]({ width: i - t + "%" }, { queue: !1, duration: r.animate })) : (0 === s && h.range.stop(1, 1)[l ? "animate" : "css"]({ bottom: i + "%" }, r.animate), 1 === s && h.range[l ? "animate" : "css"]({ height: i - t + "%" }, { queue: !1, duration: r.animate }))), t = i }) : (s = this.value(), n = this._valueMin(), a = this._valueMax(), i = a !== n ? 100 * ((s - n) / (a - n)) : 0, u["horizontal" === this.orientation ? "left" : "bottom"] = i + "%", this.handle.stop(1, 1)[l ? "animate" : "css"](u, r.animate), "min" === o && "horizontal" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ width: i + "%" }, r.animate), "max" === o && "horizontal" === this.orientation && this.range[l ? "animate" : "css"]({ width: 100 - i + "%" }, { queue: !1, duration: r.animate }), "min" === o && "vertical" === this.orientation && this.range.stop(1, 1)[l ? "animate" : "css"]({ height: i + "%" }, r.animate), "max" === o && "vertical" === this.orientation && this.range[l ? "animate" : "css"]({ height: 100 - i + "%" }, { queue: !1, duration: r.animate })) }, _handleEvents: { keydown: function (i) { var s, n, a, o, r = e(i.target).data("ui-slider-handle-index"); switch (i.keyCode) { case e.ui.keyCode.HOME: case e.ui.keyCode.END: case e.ui.keyCode.PAGE_UP: case e.ui.keyCode.PAGE_DOWN: case e.ui.keyCode.UP: case e.ui.keyCode.RIGHT: case e.ui.keyCode.DOWN: case e.ui.keyCode.LEFT: if (i.preventDefault(), !this._keySliding && (this._keySliding = !0, e(i.target).addClass("ui-state-active"), s = this._start(i, r), s === !1)) return } switch (o = this.options.step, n = a = this.options.values && this.options.values.length ? this.values(r) : this.value(), i.keyCode) { case e.ui.keyCode.HOME: a = this._valueMin(); break; case e.ui.keyCode.END: a = this._valueMax(); break; case e.ui.keyCode.PAGE_UP: a = this._trimAlignValue(n + (this._valueMax() - this._valueMin()) / t); break; case e.ui.keyCode.PAGE_DOWN: a = this._trimAlignValue(n - (this._valueMax() - this._valueMin()) / t); break; case e.ui.keyCode.UP: case e.ui.keyCode.RIGHT: if (n === this._valueMax()) return; a = this._trimAlignValue(n + o); break; case e.ui.keyCode.DOWN: case e.ui.keyCode.LEFT: if (n === this._valueMin()) return; a = this._trimAlignValue(n - o) } this._slide(i, r, a) }, click: function (e) { e.preventDefault() }, keyup: function (t) { var i = e(t.target).data("ui-slider-handle-index"); this._keySliding && (this._keySliding = !1, this._stop(t, i), this._change(t, i), e(t.target).removeClass("ui-state-active")) } } }) })(jQuery);
        }


        /*! nouislider - 9.0.0 - 2016-09-29 21:44:02 */
        if (HawkSearch.loadPlugins.slider == true) {
            !function (a) { "function" == typeof define && define.amd ? define([], a) : "object" == typeof exports ? module.exports = a() : window.noUiSlider = a() }(function () { "use strict"; function a(a, b) { var c = document.createElement("div"); return j(c, b), a.appendChild(c), c } function b(a) { return a.filter(function (a) { return !this[a] && (this[a] = !0) }, {}) } function c(a, b) { return Math.round(a / b) * b } function d(a, b) { var c = a.getBoundingClientRect(), d = a.ownerDocument, e = d.documentElement, f = m(); return /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (f.x = 0), b ? c.top + f.y - e.clientTop : c.left + f.x - e.clientLeft } function e(a) { return "number" == typeof a && !isNaN(a) && isFinite(a) } function f(a, b, c) { c > 0 && (j(a, b), setTimeout(function () { k(a, b) }, c)) } function g(a) { return Math.max(Math.min(a, 100), 0) } function h(a) { return Array.isArray(a) ? a : [a] } function i(a) { a = String(a); var b = a.split("."); return b.length > 1 ? b[1].length : 0 } function j(a, b) { a.classList ? a.classList.add(b) : a.className += " " + b } function k(a, b) { a.classList ? a.classList.remove(b) : a.className = a.className.replace(new RegExp("(^|\\b)" + b.split(" ").join("|") + "(\\b|$)", "gi"), " ") } function l(a, b) { return a.classList ? a.classList.contains(b) : new RegExp("\\b" + b + "\\b").test(a.className) } function m() { var a = void 0 !== window.pageXOffset, b = "CSS1Compat" === (document.compatMode || ""), c = a ? window.pageXOffset : b ? document.documentElement.scrollLeft : document.body.scrollLeft, d = a ? window.pageYOffset : b ? document.documentElement.scrollTop : document.body.scrollTop; return { x: c, y: d } } function n() { return window.navigator.pointerEnabled ? { start: "pointerdown", move: "pointermove", end: "pointerup" } : window.navigator.msPointerEnabled ? { start: "MSPointerDown", move: "MSPointerMove", end: "MSPointerUp" } : { start: "mousedown touchstart", move: "mousemove touchmove", end: "mouseup touchend" } } function o(a, b) { return 100 / (b - a) } function p(a, b) { return 100 * b / (a[1] - a[0]) } function q(a, b) { return p(a, a[0] < 0 ? b + Math.abs(a[0]) : b - a[0]) } function r(a, b) { return b * (a[1] - a[0]) / 100 + a[0] } function s(a, b) { for (var c = 1; a >= b[c];) c += 1; return c } function t(a, b, c) { if (c >= a.slice(-1)[0]) return 100; var d, e, f, g, h = s(c, a); return d = a[h - 1], e = a[h], f = b[h - 1], g = b[h], f + q([d, e], c) / o(f, g) } function u(a, b, c) { if (c >= 100) return a.slice(-1)[0]; var d, e, f, g, h = s(c, b); return d = a[h - 1], e = a[h], f = b[h - 1], g = b[h], r([d, e], (c - f) * o(f, g)) } function v(a, b, d, e) { if (100 === e) return e; var f, g, h = s(e, a); return d ? (f = a[h - 1], g = a[h], e - f > (g - f) / 2 ? g : f) : b[h - 1] ? a[h - 1] + c(e - a[h - 1], b[h - 1]) : e } function w(a, b, c) { var d; if ("number" == typeof b && (b = [b]), "[object Array]" !== Object.prototype.toString.call(b)) throw new Error("noUiSlider: 'range' contains invalid value."); if (d = "min" === a ? 0 : "max" === a ? 100 : parseFloat(a), !e(d) || !e(b[0])) throw new Error("noUiSlider: 'range' value isn't numeric."); c.xPct.push(d), c.xVal.push(b[0]), d ? c.xSteps.push(!isNaN(b[1]) && b[1]) : isNaN(b[1]) || (c.xSteps[0] = b[1]), c.xHighestCompleteStep.push(0) } function x(a, b, c) { if (!b) return !0; c.xSteps[a] = p([c.xVal[a], c.xVal[a + 1]], b) / o(c.xPct[a], c.xPct[a + 1]); var d = (c.xVal[a + 1] - c.xVal[a]) / c.xNumSteps[a], e = Math.ceil(Number(d.toFixed(3)) - 1), f = c.xVal[a] + c.xNumSteps[a] * e; c.xHighestCompleteStep[a] = f } function y(a, b, c, d) { this.xPct = [], this.xVal = [], this.xSteps = [d || !1], this.xNumSteps = [!1], this.xHighestCompleteStep = [], this.snap = b, this.direction = c; var e, f = []; for (e in a) a.hasOwnProperty(e) && f.push([a[e], e]); for (f.length && "object" == typeof f[0][0] ? f.sort(function (a, b) { return a[0][0] - b[0][0] }) : f.sort(function (a, b) { return a[0] - b[0] }), e = 0; e < f.length; e++) w(f[e][1], f[e][0], this); for (this.xNumSteps = this.xSteps.slice(0), e = 0; e < this.xNumSteps.length; e++) x(e, this.xNumSteps[e], this) } function z(a, b) { if (!e(b)) throw new Error("noUiSlider: 'step' is not numeric."); a.singleStep = b } function A(a, b) { if ("object" != typeof b || Array.isArray(b)) throw new Error("noUiSlider: 'range' is not an object."); if (void 0 === b.min || void 0 === b.max) throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'."); if (b.min === b.max) throw new Error("noUiSlider: 'range' 'min' and 'max' cannot be equal."); a.spectrum = new y(b, a.snap, a.dir, a.singleStep) } function B(a, b) { if (b = h(b), !Array.isArray(b) || !b.length) throw new Error("noUiSlider: 'start' option is incorrect."); a.handles = b.length, a.start = b } function C(a, b) { if (a.snap = b, "boolean" != typeof b) throw new Error("noUiSlider: 'snap' option must be a boolean.") } function D(a, b) { if (a.animate = b, "boolean" != typeof b) throw new Error("noUiSlider: 'animate' option must be a boolean.") } function E(a, b) { if (a.animationDuration = b, "number" != typeof b) throw new Error("noUiSlider: 'animationDuration' option must be a number.") } function F(a, b) { var c, d = [!1]; if (b === !0 || b === !1) { for (c = 1; c < a.handles; c++) d.push(b); d.push(!1) } else { if (!Array.isArray(b) || !b.length || b.length !== a.handles + 1) throw new Error("noUiSlider: 'connect' option doesn't match handle count."); d = b } a.connect = d } function G(a, b) { switch (b) { case "horizontal": a.ort = 0; break; case "vertical": a.ort = 1; break; default: throw new Error("noUiSlider: 'orientation' option is invalid.") } } function H(a, b) { if (!e(b)) throw new Error("noUiSlider: 'margin' option must be numeric."); if (0 !== b && (a.margin = a.spectrum.getMargin(b), !a.margin)) throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.") } function I(a, b) { if (!e(b)) throw new Error("noUiSlider: 'limit' option must be numeric."); if (a.limit = a.spectrum.getMargin(b), !a.limit || a.handles < 2) throw new Error("noUiSlider: 'limit' option is only supported on linear sliders with 2 or more handles.") } function J(a, b) { switch (b) { case "ltr": a.dir = 0; break; case "rtl": a.dir = 1; break; default: throw new Error("noUiSlider: 'direction' option was not recognized.") } } function K(a, b) { if ("string" != typeof b) throw new Error("noUiSlider: 'behaviour' must be a string containing options."); var c = b.indexOf("tap") >= 0, d = b.indexOf("drag") >= 0, e = b.indexOf("fixed") >= 0, f = b.indexOf("snap") >= 0, g = b.indexOf("hover") >= 0; if (e) { if (2 !== a.handles) throw new Error("noUiSlider: 'fixed' behaviour must be used with 2 handles"); H(a, a.start[1] - a.start[0]) } a.events = { tap: c || f, drag: d, fixed: e, snap: f, hover: g } } function L(a, b) { if (b !== !1) if (b === !0) { a.tooltips = []; for (var c = 0; c < a.handles; c++) a.tooltips.push(!0) } else { if (a.tooltips = h(b), a.tooltips.length !== a.handles) throw new Error("noUiSlider: must pass a formatter for all handles."); a.tooltips.forEach(function (a) { if ("boolean" != typeof a && ("object" != typeof a || "function" != typeof a.to)) throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.") }) } } function M(a, b) { if (a.format = b, "function" == typeof b.to && "function" == typeof b.from) return !0; throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.") } function N(a, b) { if (void 0 !== b && "string" != typeof b && b !== !1) throw new Error("noUiSlider: 'cssPrefix' must be a string or `false`."); a.cssPrefix = b } function O(a, b) { if (void 0 !== b && "object" != typeof b) throw new Error("noUiSlider: 'cssClasses' must be an object."); if ("string" == typeof a.cssPrefix) { a.cssClasses = {}; for (var c in b) b.hasOwnProperty(c) && (a.cssClasses[c] = a.cssPrefix + b[c]) } else a.cssClasses = b } function P(a, b) { if (b !== !0 && b !== !1) throw new Error("noUiSlider: 'useRequestAnimationFrame' option should be true (default) or false."); a.useRequestAnimationFrame = b } function Q(a) { var b, c = { margin: 0, limit: 0, animate: !0, animationDuration: 300, format: T }; b = { step: { r: !1, t: z }, start: { r: !0, t: B }, connect: { r: !0, t: F }, direction: { r: !0, t: J }, snap: { r: !1, t: C }, animate: { r: !1, t: D }, animationDuration: { r: !1, t: E }, range: { r: !0, t: A }, orientation: { r: !1, t: G }, margin: { r: !1, t: H }, limit: { r: !1, t: I }, behaviour: { r: !0, t: K }, format: { r: !1, t: M }, tooltips: { r: !1, t: L }, cssPrefix: { r: !1, t: N }, cssClasses: { r: !1, t: O }, useRequestAnimationFrame: { r: !1, t: P } }; var d = { connect: !1, direction: "ltr", behaviour: "tap", orientation: "horizontal", cssPrefix: "noUi-", cssClasses: { target: "target", base: "base", origin: "origin", handle: "handle", horizontal: "horizontal", vertical: "vertical", background: "background", connect: "connect", ltr: "ltr", rtl: "rtl", draggable: "draggable", drag: "state-drag", tap: "state-tap", active: "active", tooltip: "tooltip", pips: "pips", pipsHorizontal: "pips-horizontal", pipsVertical: "pips-vertical", marker: "marker", markerHorizontal: "marker-horizontal", markerVertical: "marker-vertical", markerNormal: "marker-normal", markerLarge: "marker-large", markerSub: "marker-sub", value: "value", valueHorizontal: "value-horizontal", valueVertical: "value-vertical", valueNormal: "value-normal", valueLarge: "value-large", valueSub: "value-sub" }, useRequestAnimationFrame: !0 }; Object.keys(b).forEach(function (e) { if (void 0 === a[e] && void 0 === d[e]) { if (b[e].r) throw new Error("noUiSlider: '" + e + "' is required."); return !0 } b[e].t(c, void 0 === a[e] ? d[e] : a[e]) }), c.pips = a.pips; var e = [["left", "top"], ["right", "bottom"]]; return c.style = e[c.dir][c.ort], c.styleOposite = e[c.dir ? 0 : 1][c.ort], c } function R(c, e, i) { function o(b, c) { var d = a(b, e.cssClasses.origin), f = a(d, e.cssClasses.handle); return f.setAttribute("data-handle", c), d } function p(b, c) { return !!c && a(b, e.cssClasses.connect) } function q(a, b) { ba = [], ca = [], ca.push(p(b, a[0])); for (var c = 0; c < e.handles; c++) ba.push(o(b, c)), ha[c] = c, ca.push(p(b, a[c + 1])) } function r(b) { j(b, e.cssClasses.target), 0 === e.dir ? j(b, e.cssClasses.ltr) : j(b, e.cssClasses.rtl), 0 === e.ort ? j(b, e.cssClasses.horizontal) : j(b, e.cssClasses.vertical), aa = a(b, e.cssClasses.base) } function s(b, c) { return !!e.tooltips[c] && a(b.firstChild, e.cssClasses.tooltip) } function t() { var a = ba.map(s); Z("update", function (b, c, d) { if (a[c]) { var f = b[c]; e.tooltips[c] !== !0 && (f = e.tooltips[c].to(d[c])), a[c].innerHTML = f } }) } function u(a, b, c) { if ("range" === a || "steps" === a) return ia.xVal; if ("count" === a) { var d, e = 100 / (b - 1), f = 0; for (b = []; (d = f++ * e) <= 100;) b.push(d); a = "positions" } return "positions" === a ? b.map(function (a) { return ia.fromStepping(c ? ia.getStep(a) : a) }) : "values" === a ? c ? b.map(function (a) { return ia.fromStepping(ia.getStep(ia.toStepping(a))) }) : b : void 0 } function v(a, c, d) { function e(a, b) { return (a + b).toFixed(7) / 1 } var f = {}, g = ia.xVal[0], h = ia.xVal[ia.xVal.length - 1], i = !1, j = !1, k = 0; return d = b(d.slice().sort(function (a, b) { return a - b })), d[0] !== g && (d.unshift(g), i = !0), d[d.length - 1] !== h && (d.push(h), j = !0), d.forEach(function (b, g) { var h, l, m, n, o, p, q, r, s, t, u = b, v = d[g + 1]; if ("steps" === c && (h = ia.xNumSteps[g]), h || (h = v - u), u !== !1 && void 0 !== v) for (h = Math.max(h, 1e-7), l = u; l <= v; l = e(l, h)) { for (n = ia.toStepping(l), o = n - k, r = o / a, s = Math.round(r), t = o / s, m = 1; m <= s; m += 1) p = k + m * t, f[p.toFixed(5)] = ["x", 0]; q = d.indexOf(l) > -1 ? 1 : "steps" === c ? 2 : 0, !g && i && (q = 0), l === v && j || (f[n.toFixed(5)] = [l, q]), k = n } }), f } function w(a, b, c) { function d(a, b) { var c = b === e.cssClasses.value, d = c ? m : n, f = c ? k : l; return b + " " + d[e.ort] + " " + f[a] } function f(a, b, c) { return 'class="' + d(c[1], b) + '" style="' + e.style + ": " + a + '%"' } function g(a, d) { d[1] = d[1] && b ? b(d[0], d[1]) : d[1], i += "<div " + f(a, e.cssClasses.marker, d) + "></div>", d[1] && (i += "<div " + f(a, e.cssClasses.value, d) + ">" + c.to(d[0]) + "</div>") } var h = document.createElement("div"), i = "", k = [e.cssClasses.valueNormal, e.cssClasses.valueLarge, e.cssClasses.valueSub], l = [e.cssClasses.markerNormal, e.cssClasses.markerLarge, e.cssClasses.markerSub], m = [e.cssClasses.valueHorizontal, e.cssClasses.valueVertical], n = [e.cssClasses.markerHorizontal, e.cssClasses.markerVertical]; return j(h, e.cssClasses.pips), j(h, 0 === e.ort ? e.cssClasses.pipsHorizontal : e.cssClasses.pipsVertical), Object.keys(a).forEach(function (b) { g(b, a[b]) }), h.innerHTML = i, h } function x(a) { var b = a.mode, c = a.density || 1, d = a.filter || !1, e = a.values || !1, f = a.stepped || !1, g = u(b, e, f), h = v(c, b, g), i = a.format || { to: Math.round }; return fa.appendChild(w(h, d, i)) } function y() { var a = aa.getBoundingClientRect(), b = "offset" + ["Width", "Height"][e.ort]; return 0 === e.ort ? a.width || aa[b] : a.height || aa[b] } function z(a, b, c, d) { var f = function (b) { return !fa.hasAttribute("disabled") && (!l(fa, e.cssClasses.tap) && (b = A(b, d.pageOffset), !(a === ea.start && void 0 !== b.buttons && b.buttons > 1) && ((!d.hover || !b.buttons) && (b.calcPoint = b.points[e.ort], void c(b, d))))) }, g = []; return a.split(" ").forEach(function (a) { b.addEventListener(a, f, !1), g.push([a, f]) }), g } function A(a, b) { a.preventDefault(); var c, d, e = 0 === a.type.indexOf("touch"), f = 0 === a.type.indexOf("mouse"), g = 0 === a.type.indexOf("pointer"), h = a; if (0 === a.type.indexOf("MSPointer") && (g = !0), e) { if (h.touches.length > 1) return !1; c = a.changedTouches[0].pageX, d = a.changedTouches[0].pageY } return b = b || m(), (f || g) && (c = a.clientX + b.x, d = a.clientY + b.y), h.pageOffset = b, h.points = [c, d], h.cursor = f || g, h } function B(a) { var b = a - d(aa, e.ort), c = 100 * b / y(); return e.dir ? 100 - c : c } function C(a) { var b = 100, c = !1; return ba.forEach(function (d, e) { if (!d.hasAttribute("disabled")) { var f = Math.abs(ga[e] - a); f < b && (c = e, b = f) } }), c } function D(a, b, c, d) { var e = c.slice(), f = [!a, a], g = [a, !a]; d = d.slice(), a && d.reverse(), d.length > 1 ? d.forEach(function (a, c) { var d = M(e, a, e[a] + b, f[c], g[c]); d === !1 ? b = 0 : (b = d - e[a], e[a] = d) }) : f = g = [!0]; var h = !1; d.forEach(function (a, d) { h = R(a, c[a] + b, f[d], g[d]) || h }), h && d.forEach(function (a) { E("update", a), E("slide", a) }) } function E(a, b, c) { Object.keys(ka).forEach(function (d) { var f = d.split(".")[0]; a === f && ka[d].forEach(function (a) { a.call(da, ja.map(e.format.to), b, ja.slice(), c || !1, ga.slice()) }) }) } function F(a, b) { "mouseout" === a.type && "HTML" === a.target.nodeName && null === a.relatedTarget && H(a, b) } function G(a, b) { if (navigator.appVersion.indexOf("MSIE 9") === -1 && 0 === a.buttons && 0 !== b.buttonsProperty) return H(a, b); var c = (e.dir ? -1 : 1) * (a.calcPoint - b.startCalcPoint), d = 100 * c / b.baseSize; D(c > 0, d, b.locations, b.handleNumbers) } function H(a, b) { var c = aa.querySelector("." + e.cssClasses.active); null !== c && k(c, e.cssClasses.active), a.cursor && (document.body.style.cursor = "", document.body.removeEventListener("selectstart", document.body.noUiListener)), document.documentElement.noUiListeners.forEach(function (a) { document.documentElement.removeEventListener(a[0], a[1]) }), k(fa, e.cssClasses.drag), P(), b.handleNumbers.forEach(function (a) { E("set", a), E("change", a), E("end", a) }) } function I(a, b) { if (1 === b.handleNumbers.length) { var c = ba[b.handleNumbers[0]]; if (c.hasAttribute("disabled")) return !1; j(c.children[0], e.cssClasses.active) } a.preventDefault(), a.stopPropagation(); var d = z(ea.move, document.documentElement, G, { startCalcPoint: a.calcPoint, baseSize: y(), pageOffset: a.pageOffset, handleNumbers: b.handleNumbers, buttonsProperty: a.buttons, locations: ga.slice() }), f = z(ea.end, document.documentElement, H, { handleNumbers: b.handleNumbers }), g = z("mouseout", document.documentElement, F, { handleNumbers: b.handleNumbers }); if (document.documentElement.noUiListeners = d.concat(f, g), a.cursor) { document.body.style.cursor = getComputedStyle(a.target).cursor, ba.length > 1 && j(fa, e.cssClasses.drag); var h = function () { return !1 }; document.body.noUiListener = h, document.body.addEventListener("selectstart", h, !1) } b.handleNumbers.forEach(function (a) { E("start", a) }) } function J(a) { a.stopPropagation(); var b = B(a.calcPoint), c = C(b); return c !== !1 && (e.events.snap || f(fa, e.cssClasses.tap, e.animationDuration), R(c, b, !0, !0), P(), E("slide", c, !0), E("set", c, !0), E("change", c, !0), E("update", c, !0), void (e.events.snap && I(a, { handleNumbers: [c] }))) } function K(a) { var b = B(a.calcPoint), c = ia.getStep(b), d = ia.fromStepping(c); Object.keys(ka).forEach(function (a) { "hover" === a.split(".")[0] && ka[a].forEach(function (a) { a.call(da, d) }) }) } function L(a) { a.fixed || ba.forEach(function (a, b) { z(ea.start, a.children[0], I, { handleNumbers: [b] }) }), a.tap && z(ea.start, aa, J, {}), a.hover && z(ea.move, aa, K, { hover: !0 }), a.drag && ca.forEach(function (b, c) { if (b !== !1 && 0 !== c && c !== ca.length - 1) { var d = ba[c - 1], f = ba[c], g = [b]; j(b, e.cssClasses.draggable), a.fixed && (g.push(d.children[0]), g.push(f.children[0])), g.forEach(function (a) { z(ea.start, a, I, { handles: [d, f], handleNumbers: [c - 1, c] }) }) } }) } function M(a, b, c, d, f) { return ba.length > 1 && (d && b > 0 && (c = Math.max(c, a[b - 1] + e.margin)), f && b < ba.length - 1 && (c = Math.min(c, a[b + 1] - e.margin))), ba.length > 1 && e.limit && (d && b > 0 && (c = Math.min(c, a[b - 1] + e.limit)), f && b < ba.length - 1 && (c = Math.max(c, a[b + 1] - e.limit))), c = ia.getStep(c), c = g(c), c !== a[b] && c } function N(a) { return a + "%" } function O(a, b) { ga[a] = b, ja[a] = ia.fromStepping(b); var c = function () { ba[a].style[e.style] = N(b), S(a), S(a + 1) }; window.requestAnimationFrame && e.useRequestAnimationFrame ? window.requestAnimationFrame(c) : c() } function P() { ha.forEach(function (a) { var b = ga[a] > 50 ? -1 : 1, c = 3 + (ba.length + b * a); ba[a].childNodes[0].style.zIndex = c }) } function R(a, b, c, d) { return b = M(ga, a, b, c, d), b !== !1 && (O(a, b), !0) } function S(a) { if (ca[a]) { var b = 0, c = 100; 0 !== a && (b = ga[a - 1]), a !== ca.length - 1 && (c = ga[a]), ca[a].style[e.style] = N(b), ca[a].style[e.styleOposite] = N(100 - c) } } function T(a, b) { null !== a && a !== !1 && ("number" == typeof a && (a = String(a)), a = e.format.from(a), a === !1 || isNaN(a) || R(b, ia.toStepping(a), !1, !1)) } function U(a, b) { var c = h(a), d = void 0 === ga[0]; b = void 0 === b || !!b, c.forEach(T), e.animate && !d && f(fa, e.cssClasses.tap, e.animationDuration), ha.forEach(function (a) { R(a, ga[a], !0, !1) }), P(), ha.forEach(function (a) { E("update", a), null !== c[a] && b && E("set", a) }) } function V(a) { U(e.start, a) } function W() { var a = ja.map(e.format.to); return 1 === a.length ? a[0] : a } function X() { for (var a in e.cssClasses) e.cssClasses.hasOwnProperty(a) && k(fa, e.cssClasses[a]); for (; fa.firstChild;) fa.removeChild(fa.firstChild); delete fa.noUiSlider } function Y() { return ga.map(function (a, b) { var c = ia.getNearbySteps(a), d = ja[b], e = c.thisStep.step, f = null; e !== !1 && d + e > c.stepAfter.startValue && (e = c.stepAfter.startValue - d), f = d > c.thisStep.startValue ? c.thisStep.step : c.stepBefore.step !== !1 && d - c.stepBefore.highestStep, 100 === a ? e = null : 0 === a && (f = null); var g = ia.countStepDecimals(); return null !== e && e !== !1 && (e = Number(e.toFixed(g))), null !== f && f !== !1 && (f = Number(f.toFixed(g))), [f, e] }) } function Z(a, b) { ka[a] = ka[a] || [], ka[a].push(b), "update" === a.split(".")[0] && ba.forEach(function (a, b) { E("update", b) }) } function $(a) { var b = a && a.split(".")[0], c = b && a.substring(b.length); Object.keys(ka).forEach(function (a) { var d = a.split(".")[0], e = a.substring(d.length); b && b !== d || c && c !== e || delete ka[a] }) } function _(a, b) { var c = W(), d = ["margin", "limit", "range", "animate", "snap", "step", "format"]; d.forEach(function (b) { void 0 !== a[b] && (i[b] = a[b]) }); var f = Q(i); d.forEach(function (b) { void 0 !== a[b] && (e[b] = f[b]) }), f.spectrum.direction = ia.direction, ia = f.spectrum, e.margin = f.margin, e.limit = f.limit, ga = [], U(a.start || c, b) } var aa, ba, ca, da, ea = n(), fa = c, ga = [], ha = [], ia = e.spectrum, ja = [], ka = {}; if (fa.noUiSlider) throw new Error("Slider was already initialized."); return r(fa), q(e.connect, aa), da = { destroy: X, steps: Y, on: Z, off: $, get: W, set: U, reset: V, __moveHandles: function (a, b, c) { D(a, b, ga, c) }, options: i, updateOptions: _, target: fa, pips: x }, L(e.events), U(e.start), e.pips && x(e.pips), e.tooltips && t(), da } function S(a, b) { if (!a.nodeName) throw new Error("noUiSlider.create requires a single element."); var c = Q(b, a), d = R(a, c, b); return a.noUiSlider = d, d } y.prototype.getMargin = function (a) { var b = this.xNumSteps[0]; if (b && a % b) throw new Error("noUiSlider: 'limit' and 'margin' must be divisible by step."); return 2 === this.xPct.length && p(this.xVal, a) }, y.prototype.toStepping = function (a) { return a = t(this.xVal, this.xPct, a) }, y.prototype.fromStepping = function (a) { return u(this.xVal, this.xPct, a) }, y.prototype.getStep = function (a) { return a = v(this.xPct, this.xSteps, this.snap, a) }, y.prototype.getNearbySteps = function (a) { var b = s(a, this.xPct); return { stepBefore: { startValue: this.xVal[b - 2], step: this.xNumSteps[b - 2], highestStep: this.xHighestCompleteStep[b - 2] }, thisStep: { startValue: this.xVal[b - 1], step: this.xNumSteps[b - 1], highestStep: this.xHighestCompleteStep[b - 1] }, stepAfter: { startValue: this.xVal[b - 0], step: this.xNumSteps[b - 0], highestStep: this.xHighestCompleteStep[b - 0] } } }, y.prototype.countStepDecimals = function () { var a = this.xNumSteps.map(i); return Math.max.apply(null, a) }, y.prototype.convert = function (a) { return this.getStep(this.toStepping(a)) }; var T = { to: function (a) { return void 0 !== a && a.toFixed(2) }, from: Number }; return { create: S } });
        }

        /* wNumb.js*/
        if (HawkSearch.loadPlugins.wNumb == true) {
            !function () { "use strict"; function b(a) { return a.split("").reverse().join("") } function c(a, b) { return a.substring(0, b.length) === b } function d(a, b) { return a.slice(-1 * b.length) === b } function e(a, b, c) { if ((a[b] || a[c]) && a[b] === a[c]) throw new Error(b) } function f(a) { return "number" == typeof a && isFinite(a) } function g(a, b) { var c = Math.pow(10, b); return (Math.round(a * c) / c).toFixed(b) } function h(a, c, d, e, h, i, j, k, l, m, n, o) { var q, r, s, p = o, t = "", u = ""; return i && (o = i(o)), !!f(o) && (a !== !1 && 0 === parseFloat(o.toFixed(a)) && (o = 0), o < 0 && (q = !0, o = Math.abs(o)), a !== !1 && (o = g(o, a)), o = o.toString(), o.indexOf(".") !== -1 ? (r = o.split("."), s = r[0], d && (t = d + r[1])) : s = o, c && (s = b(s).match(/.{1,3}/g), s = b(s.join(b(c)))), q && k && (u += k), e && (u += e), q && l && (u += l), u += s, u += t, h && (u += h), m && (u = m(u, p)), u) } function i(a, b, e, g, h, i, j, k, l, m, n, o) { var q, r = ""; return n && (o = n(o)), !(!o || "string" != typeof o) && (k && c(o, k) && (o = o.replace(k, ""), q = !0), g && c(o, g) && (o = o.replace(g, "")), l && c(o, l) && (o = o.replace(l, ""), q = !0), h && d(o, h) && (o = o.slice(0, -1 * h.length)), b && (o = o.split(b).join("")), e && (o = o.replace(e, ".")), q && (r += "-"), r += o, r = r.replace(/[^0-9\.\-.]/g, ""), "" !== r && (r = Number(r), j && (r = j(r)), !!f(r) && r)) } function j(b) { var c, d, f, g = {}; for (c = 0; c < a.length; c += 1) if (d = a[c], f = b[d], void 0 === f) "negative" !== d || g.negativeBefore ? "mark" === d && "." !== g.thousand ? g[d] = "." : g[d] = !1 : g[d] = "-"; else if ("decimals" === d) { if (!(f >= 0 && f < 8)) throw new Error(d); g[d] = f } else if ("encoder" === d || "decoder" === d || "edit" === d || "undo" === d) { if ("function" != typeof f) throw new Error(d); g[d] = f } else { if ("string" != typeof f) throw new Error(d); g[d] = f } return e(g, "mark", "thousand"), e(g, "prefix", "negative"), e(g, "prefix", "negativeBefore"), g } function k(b, c, d) { var e, f = []; for (e = 0; e < a.length; e += 1) f.push(b[a[e]]); return f.push(d), c.apply("", f) } function l(a) { return this instanceof l ? void ("object" == typeof a && (a = j(a), this.to = function (b) { return k(a, h, b) }, this.from = function (b) { return k(a, i, b) })) : new l(a) } var a = ["decimals", "thousand", "mark", "prefix", "postfix", "encoder", "decoder", "negativeBefore", "negative", "edit", "undo"]; window.wNumb = l }();
        }

        /*!
		 * jQuery blockUI plugin
		 * Version 2.66.0-2013.10.09
		 * Requires jQuery v1.7 or later
		 *
		 * Examples at: http://malsup.com/jquery/block/
		 * Copyright (c) 2007-2013 M. Alsup
		 * Dual licensed under the MIT and GPL licenses:
		 * http://www.opensource.org/licenses/mit-license.php
		 * http://www.gnu.org/licenses/gpl.html
		 *
		 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
		 */
        if (HawkSearch.loadPlugins.blockUI == true) {

            (function () {
                function p(b) {
                    function p(c, a) {
                        var f, h, e = c == window, g = a && void 0 !== a.message ? a.message : void 0; a = b.extend({}, b.blockUI.defaults, a || {}); if (!a.ignoreIfBlocked || !b(c).data("blockUI.isBlocked")) {
                            a.overlayCSS = b.extend({}, b.blockUI.defaults.overlayCSS, a.overlayCSS || {}); f = b.extend({}, b.blockUI.defaults.css, a.css || {}); a.onOverlayClick && (a.overlayCSS.cursor = "pointer"); h = b.extend({}, b.blockUI.defaults.themedCSS, a.themedCSS || {}); g = void 0 === g ? a.message : g; e && l && s(window, { fadeOut: 0 }); if (g && "string" != typeof g &&
                                (g.parentNode || g.jquery)) {
                                var k = g.jquery ? g[0] : g, d = {}; b(c).data("blockUI.history", d); d.el = k; d.parent = k.parentNode; d.display = k.style.display; d.position = k.style.position; d.parent && d.parent.removeChild(k)
                            } b(c).data("blockUI.onUnblock", a.onUnblock); var d = a.baseZ, m; m = t || a.forceIframe ? b('<iframe class="blockUI" style="z-index:' + d++ + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + a.iframeSrc + '"></iframe>') : b('<div class="blockUI" style="display:none"></div>');
                            k = a.theme ? b('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + d++ + ';display:none"></div>') : b('<div class="blockUI blockOverlay" style="z-index:' + d++ + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'); a.theme && e ? (d = '<div class="blockUI ' + a.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (d + 10) + ';display:none;position:fixed">', a.title && (d += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' +
                                (a.title || "&nbsp;") + "</div>"), d += '<div class="ui-widget-content ui-dialog-content"></div></div>') : a.theme ? (d = '<div class="blockUI ' + a.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (d + 10) + ';display:none;position:absolute">', a.title && (d += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (a.title || "&nbsp;") + "</div>"), d += '<div class="ui-widget-content ui-dialog-content"></div>', d += "</div>") : d = e ? '<div class="blockUI ' + a.blockMsgClass + ' blockPage" style="z-index:' +
                                (d + 10) + ';display:none;position:fixed"></div>' : '<div class="blockUI ' + a.blockMsgClass + ' blockElement" style="z-index:' + (d + 10) + ';display:none;position:absolute"></div>'; d = b(d); g && (a.theme ? (d.css(h), d.addClass("ui-widget-content")) : d.css(f)); a.theme || k.css(a.overlayCSS); k.css("position", e ? "fixed" : "absolute"); (t || a.forceIframe) && m.css("opacity", 0); f = [m, k, d]; var r = e ? b("body") : b(c); b.each(f, function () { this.appendTo(r) }); a.theme && a.draggable && b.fn.draggable && d.draggable({ handle: ".ui-dialog-titlebar", cancel: "li" });
                            h = A && (!b.support.boxModel || 0 < b("object,embed", e ? null : c).length); if (v || h) {
                                e && a.allowBodyStretch && b.support.boxModel && b("html,body").css("height", "100%"); if ((v || !b.support.boxModel) && !e) {
                                    h = parseInt(b.css(c, "borderTopWidth"), 10) || 0; var q = parseInt(b.css(c, "borderLeftWidth"), 10) || 0, w = h ? "(0 - " + h + ")" : 0, x = q ? "(0 - " + q + ")" : 0
                                } b.each(f, function (b, c) {
                                    var d = c[0].style; d.position = "absolute"; if (2 > b) e ? d.setExpression("height", "Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:" +
                                        a.quirksmodeOffsetHack + ') + "px"') : d.setExpression("height", 'this.parentNode.offsetHeight + "px"'), e ? d.setExpression("width", 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"') : d.setExpression("width", 'this.parentNode.offsetWidth + "px"'), x && d.setExpression("left", x), w && d.setExpression("top", w); else if (a.centerY) e && d.setExpression("top", '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'),
                                        d.marginTop = 0; else if (!a.centerY && e) {
                                        var f = "((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + " + (a.css && a.css.top ? parseInt(a.css.top, 10) : 0) + ') + "px"'; d.setExpression("top", f)
                                    }
                                })
                            } g && (a.theme ? d.find(".ui-widget-content").append(g) : d.append(g), (g.jquery || g.nodeType) && b(g).show()); (t || a.forceIframe) && a.showOverlay && m.show(); if (a.fadeIn) f = a.onBlock ? a.onBlock : u, m = a.showOverlay && !g ? f : u, f = g ? f : u, a.showOverlay && k._fadeIn(a.fadeIn, m), g && d._fadeIn(a.fadeIn,
                                f); else if (a.showOverlay && k.show(), g && d.show(), a.onBlock) a.onBlock(); y(1, c, a); e ? (l = d[0], n = b(a.focusableElements, l), a.focusInput && setTimeout(z, 20)) : B(d[0], a.centerX, a.centerY); a.timeout && (g = setTimeout(function () { e ? b.unblockUI(a) : b(c).unblock(a) }, a.timeout), b(c).data("blockUI.timeout", g))
                        }
                    } function s(c, a) {
                        var f, h = c == window, e = b(c), g = e.data("blockUI.history"), k = e.data("blockUI.timeout"); k && (clearTimeout(k), e.removeData("blockUI.timeout")); a = b.extend({}, b.blockUI.defaults, a || {}); y(0, c, a); null === a.onUnblock &&
                        (a.onUnblock = e.data("blockUI.onUnblock"), e.removeData("blockUI.onUnblock")); var d; d = h ? b("body").children().filter(".blockUI").add("body > .blockUI") : e.find(">.blockUI"); a.cursorReset && (1 < d.length && (d[1].style.cursor = a.cursorReset), 2 < d.length && (d[2].style.cursor = a.cursorReset)); h && (l = n = null); a.fadeOut ? (f = d.length, d.stop().fadeOut(a.fadeOut, function () { 0 === --f && r(d, g, a, c) })) : r(d, g, a, c)
                    } function r(c, a, f, h) {
                        var e = b(h); if (!e.data("blockUI.isBlocked")) {
                            c.each(function (a, b) { this.parentNode && this.parentNode.removeChild(this) });
                            a && a.el && (a.el.style.display = a.display, a.el.style.position = a.position, a.parent && a.parent.appendChild(a.el), e.removeData("blockUI.history")); e.data("blockUI.static") && e.css("position", "static"); if ("function" == typeof f.onUnblock) f.onUnblock(h, f); c = b(document.body); a = c.width(); f = c[0].style.width; c.width(a - 1).width(a); c[0].style.width = f
                        }
                    } function y(c, a, f) {
                        var h = a == window; a = b(a); if (c || (!h || l) && (h || a.data("blockUI.isBlocked"))) a.data("blockUI.isBlocked", c), h && f.bindEvents && (!c || f.showOverlay) && (c ? b(document).bind("mousedown mouseup keydown keypress keyup touchstart touchend touchmove",
                            f, q) : b(document).unbind("mousedown mouseup keydown keypress keyup touchstart touchend touchmove", q))
                    } function q(c) {
                        if ("keydown" === c.type && c.keyCode && 9 == c.keyCode && l && c.data.constrainTabKey) { var a = n, f = c.shiftKey && c.target === a[0]; if (!c.shiftKey && c.target === a[a.length - 1] || f) return setTimeout(function () { z(f) }, 10), !1 } var a = c.data, h = b(c.target); if (h.hasClass("blockOverlay") && a.onOverlayClick) a.onOverlayClick(c); return 0 < h.parents("div." + a.blockMsgClass).length ? !0 : 0 === h.parents().children().filter("div.blockUI").length
                    }
                    function z(b) {
                        n && (b = n[!0 === b ? n.length - 1 : 0]) && b.focus()
                    } function B(c, a, f) {
                        var h = c.parentNode, e = c.style, g = (h.offsetWidth - c.offsetWidth) / 2 - (parseInt(b.css(h, "borderLeftWidth"), 10) || 0); c = (h.offsetHeight - c.offsetHeight) / 2 - (parseInt(b.css(h, "borderTopWidth"), 10) || 0); a && (e.left = 0 < g ? g + "px" : "0"); f && (e.top = 0 < c ? c + "px" : "0")
                    } b.fn._fadeIn = b.fn.fadeIn; var u = b.noop || function () { }, t = /MSIE/.test(navigator.userAgent), v = /MSIE 6.0/.test(navigator.userAgent) && !/MSIE 8.0/.test(navigator.userAgent), A = b.isFunction(document.createElement("div").style.setExpression);
                    b.blockUI = function (b) {
                        p(window, b)
                    }; b.unblockUI = function (b) {
                        s(window, b)
                    }; b.growlUI = function (c, a, f, h) {
                        var e = b('<div class="growlUI"></div>'); c && e.append("<h1>" + c + "</h1>"); a && e.append("<h2>" + a + "</h2>"); void 0 === f && (f = 3E3); var g = function (a) {
                            a = a || {}; b.blockUI({ message: e, fadeIn: "undefined" !== typeof a.fadeIn ? a.fadeIn : 700, fadeOut: "undefined" !== typeof a.fadeOut ? a.fadeOut : 1E3, timeout: "undefined" !== typeof a.timeout ? a.timeout : f, centerY: !1, showOverlay: !1, onUnblock: h, css: b.blockUI.defaults.growlCSS })
                        }; g(); e.css("opacity");
                        e.mouseover(function () { g({ fadeIn: 0, timeout: 3E4 }); var a = b(".blockMsg"); a.stop(); a.fadeTo(300, 1) }).mouseout(function () { b(".blockMsg").fadeOut(1E3) })
                    }; b.fn.block = function (c) {
                        if (this[0] === window) return b.blockUI(c), this; var a = b.extend({}, b.blockUI.defaults, c || {}); this.each(function () { var c = b(this); a.ignoreIfBlocked && c.data("blockUI.isBlocked") || c.unblock({ fadeOut: 0 }) }); return this.each(function () {
                            "static" == b.css(this, "position") && (this.style.position = "relative", b(this).data("blockUI.static", !0)); this.style.zoom =
                                1; p(this, c)
                        })
                    }; b.fn.unblock = function (c) {
                        return this[0] === window ? (b.unblockUI(c), this) : this.each(function () { s(this, c) })
                    }; b.blockUI.version = 2.66; b.blockUI.defaults = {
                        message: "<h1>Please wait...</h1>", title: null, draggable: !0, theme: !1, css: {
                            padding: 0, margin: 0, width: "30%", top: "40%", left: "35%", textAlign: "center", color: "#000", border: "3px solid #aaa", backgroundColor: "#fff", cursor: "wait"
                        }, themedCSS: {
                            width: "30%", top: "40%", left: "35%"
                        }, overlayCSS: {
                            backgroundColor: "#000", opacity: 0.6, cursor: "wait"
                        }, cursorReset: "default",
                        growlCSS: {
                            width: "350px", top: "10px", left: "", right: "10px", border: "none", padding: "5px", opacity: 0.6, cursor: "default", color: "#fff", backgroundColor: "#000", "-webkit-border-radius": "10px", "-moz-border-radius": "10px", "border-radius": "10px"
                        }, iframeSrc: /^https/i.test(window.location.href || "") ? "javascript:false" : "about:blank", forceIframe: !1, baseZ: 1E3, centerX: !0, centerY: !0, allowBodyStretch: !0, bindEvents: !0, constrainTabKey: !0, fadeIn: 200, fadeOut: 400, timeout: 0, showOverlay: !0, focusInput: !0, focusableElements: ":input:enabled:visible",
                        onBlock: null, onUnblock: null, onOverlayClick: null, quirksmodeOffsetHack: 4, blockMsgClass: "blockMsg", ignoreIfBlocked: !1
                    }; var l = null, n = []
                } "function" === typeof define && define.amd && define.amd.jQuery ? define(["jquery"], p) : p(jQuery)
            })();
        }

        /*
		 * Match Heights jQuery Plugin
		 *
		 * Version 1.7.2 (Updated 7/31/2013)
		 * Copyright (c) 2010-2013 Mike Avello
		 * Dual licensed under the MIT and GPL licenses:
		 * http://www.opensource.org/licenses/mit-license.php
		 * http://www.gnu.org/licenses/gpl.html
		 *
		 */
        if (HawkSearch.loadPlugins.matchHeights == true) {
            (function (d) { d.fn.matchHeights = function (a) { a = jQuery.extend(this, { minHeight: null, maxHeight: null, extension: 0, overflow: null, includeMargin: !1 }, a); var e = a.extension, b = a.minHeight ? a.minHeight : 0; this.each(function () { b = Math.max(b, d(this).outerHeight()) }); a.maxHeight && b > a.maxHeight && (b = a.maxHeight); return this.each(function () { var c = d(this), f = c.innerHeight() - c.height() + (c.outerHeight(a.includeMargin) - c.innerHeight()); a.overflow ? c.css({ height: b - f + e, overflow: a.overflow }) : c.css({ "min-height": b - f + e }) }) } })(jQuery);
        }

        /*!
         * imagesLoaded v4.1.1
         * JavaScript is all like "You images are done yet or what?"
         * MIT License
         */
        if (HawkSearch.loadPlugins.imagesLoaded == true) {
            !function (a, b) { "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", b) : "object" == typeof module && module.exports ? module.exports = b() : a.EvEmitter = b() }("undefined" != typeof window ? window : this, function () { function a() { } var b = a.prototype; return b.on = function (a, b) { if (a && b) { var c = this._events = this._events || {}, d = c[a] = c[a] || []; return d.indexOf(b) == -1 && d.push(b), this } }, b.once = function (a, b) { if (a && b) { this.on(a, b); var c = this._onceEvents = this._onceEvents || {}, d = c[a] = c[a] || {}; return d[b] = !0, this } }, b.off = function (a, b) { var c = this._events && this._events[a]; if (c && c.length) { var d = c.indexOf(b); return d != -1 && c.splice(d, 1), this } }, b.emitEvent = function (a, b) { var c = this._events && this._events[a]; if (c && c.length) { var d = 0, e = c[d]; b = b || []; for (var f = this._onceEvents && this._onceEvents[a]; e;) { var g = f && f[e]; g && (this.off(a, e), delete f[e]), e.apply(this, b), d += g ? 0 : 1, e = c[d] } return this } }, a }), function (a, b) { "use strict"; "function" == typeof define && define.amd ? define(["ev-emitter/ev-emitter"], function (c) { return b(a, c) }) : "object" == typeof module && module.exports ? module.exports = b(a, require("ev-emitter")) : a.imagesLoaded = b(a, a.EvEmitter) }(window, function (b, c) { function f(a, b) { for (var c in b) a[c] = b[c]; return a } function g(a) { var b = []; if (Array.isArray(a)) b = a; else if ("number" == typeof a.length) for (var c = 0; c < a.length; c++) b.push(a[c]); else b.push(a); return b } function h(a, b, c) { return this instanceof h ? ("string" == typeof a && (a = document.querySelectorAll(a)), this.elements = g(a), this.options = f({}, this.options), "function" == typeof b ? c = b : f(this.options, b), c && this.on("always", c), this.getImages(), d && (this.jqDeferred = new d.Deferred), void setTimeout(function () { this.check() }.bind(this))) : new h(a, b, c) } function j(a) { this.img = a } function k(a, b) { this.url = a, this.element = b, this.img = new Image } var d = d, e = b.console; h.prototype = Object.create(c.prototype), h.prototype.options = {}, h.prototype.getImages = function () { this.images = [], this.elements.forEach(this.addElementImages, this) }, h.prototype.addElementImages = function (a) { "IMG" == a.nodeName && this.addImage(a), this.options.background === !0 && this.addElementBackgroundImages(a); var b = a.nodeType; if (b && i[b]) { for (var c = a.querySelectorAll("img"), d = 0; d < c.length; d++) { var e = c[d]; this.addImage(e) } if ("string" == typeof this.options.background) { var f = a.querySelectorAll(this.options.background); for (d = 0; d < f.length; d++) { var g = f[d]; this.addElementBackgroundImages(g) } } } }; var i = { 1: !0, 9: !0, 11: !0 }; return h.prototype.addElementBackgroundImages = function (a) { var b = getComputedStyle(a); if (b) for (var c = /url\((['"])?(.*?)\1\)/gi, d = c.exec(b.backgroundImage); null !== d;) { var e = d && d[2]; e && this.addBackground(e, a), d = c.exec(b.backgroundImage) } }, h.prototype.addImage = function (a) { var b = new j(a); this.images.push(b) }, h.prototype.addBackground = function (a, b) { var c = new k(a, b); this.images.push(c) }, h.prototype.check = function () { function b(b, c, d) { setTimeout(function () { a.progress(b, c, d) }) } var a = this; return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function (a) { a.once("progress", b), a.check() }) : void this.complete() }, h.prototype.progress = function (a, b, c) { this.progressedCount++ , this.hasAnyBroken = this.hasAnyBroken || !a.isLoaded, this.emitEvent("progress", [this, a, b]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, a), this.progressedCount == this.images.length && this.complete(), this.options.debug && e && e.log("progress: " + c, a, b) }, h.prototype.complete = function () { var a = this.hasAnyBroken ? "fail" : "done"; if (this.isComplete = !0, this.emitEvent(a, [this]), this.emitEvent("always", [this]), this.jqDeferred) { var b = this.hasAnyBroken ? "reject" : "resolve"; this.jqDeferred[b](this) } }, j.prototype = Object.create(c.prototype), j.prototype.check = function () { var a = this.getIsImageComplete(); return a ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image, this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void (this.proxyImage.src = this.img.src)) }, j.prototype.getIsImageComplete = function () { return this.img.complete && void 0 !== this.img.naturalWidth }, j.prototype.confirm = function (a, b) { this.isLoaded = a, this.emitEvent("progress", [this, this.img, b]) }, j.prototype.handleEvent = function (a) { var b = "on" + a.type; this[b] && this[b](a) }, j.prototype.onload = function () { this.confirm(!0, "onload"), this.unbindEvents() }, j.prototype.onerror = function () { this.confirm(!1, "onerror"), this.unbindEvents() }, j.prototype.unbindEvents = function () { this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this) }, k.prototype = Object.create(j.prototype), k.prototype.check = function () { this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url; var a = this.getIsImageComplete(); a && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents()) }, k.prototype.unbindEvents = function () { this.img.removeEventListener("load", this), this.img.removeEventListener("error", this) }, k.prototype.confirm = function (a, b) { this.isLoaded = a, this.emitEvent("progress", [this, this.element, b]) }, h.makeJQueryPlugin = function (a) { a = a || d, a && (d = a, d.fn.imagesLoaded = function (a, b) { var c = new h(this, a, b); return c.jqDeferred.promise(d(this)) }) }, h.makeJQueryPlugin(), h });
        }

        /*
        * jQuery cookie
        */
        if (HawkSearch.loadPlugins.jQueryCookie == true) {
            HawkSearch.jQuery.cookie = function (name, value, options) {
                if (typeof value != 'undefined') { // name and value given, set cookie
                    options = options || {
                    };
                    if (value === null) {
                        value = '';
                        options.expires = -1;
                    }
                    var expires = '';
                    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                        var date;
                        if (typeof options.expires == 'number') {
                            date = new Date();
                            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                        } else {
                            date = options.expires;
                        }
                        expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
                    }
                    // CAUTION: Needed to parenthesize options.path and options.domain
                    // in the following expressions, otherwise they evaluate to undefined
                    // in the packed version for some reason...
                    var path = options.path ? '; path=' + (options.path) : '';
                    var domain = options.domain ? '; domain=' + (options.domain) : '';
                    var secure = options.secure ? '; secure' : '';
                    document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
                } else { // only name given, get cookie
                    var cookieValue = null;
                    if (document.cookie && document.cookie != '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {

                            var cookie = cookies[i].trim();
                            // Does this cookie string begin with the name we want?
                            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }
            };
        }



        // register indexOf() method if browser does not natively support it
        // this algorithm is exactly as specified in ECMA-262 standard, 5th edition, assuming Object, TypeError, Number, Math.floor, Math.abs, and Math.max have their original value.
        // see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf for more details
        if (HawkSearch.loadPlugins.indexOf == true) {
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
                    "use strict";
                    if (this == null) {
                        throw new TypeError();
                    }
                    var t = Object(this);
                    var len = t.length >>> 0;
                    if (len === 0) {
                        return -1;
                    }
                    var n = 0;
                    if (arguments.length > 0) {
                        n = Number(arguments[1]);
                        if (n != n) { // shortcut for verifying if it's NaN
                            n = 0;
                        } else if (n != 0 && n != Infinity && n != -Infinity) {
                            n = (n > 0 || -1) * Math.floor(Math.abs(n));
                        }
                    }
                    if (n >= len) {
                        return -1;
                    }
                    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
                    for (; k < len; k++) {
                        if (k in t && t[k] === searchElement) {
                            return k;
                        }
                    }
                    return -1;
                }
            };
        }

        /*
         * WebUI-Popover
         * Version: 1.2.1
         *
         */
        if (HawkSearch.loadPlugins.webUIPopover == true) {
            !function (a, b, c) { "use strict"; !function (a) { "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a(require("jquery")) : a(HawkSearch.jQuery) }(function (d) { function v(a, b) { return this.$element = d(a), b && ("string" !== d.type(b.delay) && "number" !== d.type(b.delay) || (b.delay = { show: b.delay, hide: b.delay })), this.options = d.extend({}, h, b), this._defaults = h, this._name = e, this._targetclick = !1, this.init(), j.push(this.$element), this } var e = "webuiPopover", f = "webui-popover", g = "webui.popover", h = { placement: "auto", container: null, width: "auto", height: "auto", trigger: "click", style: "", selector: !1, delay: { show: null, hide: 300 }, async: { type: "GET", before: null, success: null, error: null }, cache: !0, multi: !1, arrow: !0, title: "", content: "", closeable: !1, padding: !0, url: "", type: "html", direction: "", animation: null, template: '<div class="webui-popover"><div class="webui-arrow"></div><div class="webui-popover-inner"><a href="#" class="close"></a><h3 class="webui-popover-title"></h3><div class="webui-popover-content"><i class="icon-refresh"></i> <p>&nbsp;</p></div></div></div>', backdrop: !1, dismissible: !0, onShow: null, onHide: null, abortXHR: !0, autoHide: !1, offsetTop: 0, offsetLeft: 0, iframeOptions: { frameborder: "0", allowtransparency: "true", id: "", name: "", scrolling: "", onload: "", height: "", width: "" }, hideEmpty: !1 }, i = f + "-rtl", j = [], k = d('<div class="webui-popover-backdrop"></div>'), l = 0, m = !1, n = -2e3, o = d(b), p = function (a, b) { return isNaN(a) ? b || 0 : Number(a) }, q = function (a) { return a.data("plugin_" + e) }, r = function () { for (var a = null, b = 0; b < j.length; b++) a = q(j[b]), a && a.hide(!0); o.trigger("hiddenAll." + g) }, s = function (a) { for (var b = null, c = 0; c < j.length; c++) b = q(j[c]), b && b.id !== a.id && b.hide(!0); o.trigger("hiddenAll." + g) }, t = "ontouchstart" in b.documentElement && /Mobi/.test(navigator.userAgent), u = function (a) { var b = { x: 0, y: 0 }; if ("touchstart" === a.type || "touchmove" === a.type || "touchend" === a.type || "touchcancel" === a.type) { var c = a.originalEvent.touches[0] || a.originalEvent.changedTouches[0]; b.x = c.pageX, b.y = c.pageY } else "mousedown" !== a.type && "mouseup" !== a.type && "click" !== a.type || (b.x = a.pageX, b.y = a.pageY); return b }; v.prototype = { init: function () { if (this.$element[0] instanceof b.constructor && !this.options.selector) throw new Error("`selector` option must be specified when initializing " + this.type + " on the window.document object!"); "manual" !== this.getTrigger() && ("click" === this.getTrigger() || t ? this.$element.off("click touchend", this.options.selector).on("click touchend", this.options.selector, d.proxy(this.toggle, this)) : "hover" === this.getTrigger() && this.$element.off("mouseenter mouseleave click", this.options.selector).on("mouseenter", this.options.selector, d.proxy(this.mouseenterHandler, this)).on("mouseleave", this.options.selector, d.proxy(this.mouseleaveHandler, this))), this._poped = !1, this._inited = !0, this._opened = !1, this._idSeed = l, this.id = e + this._idSeed, this.options.container = d(this.options.container || b.body).first(), this.options.backdrop && k.appendTo(this.options.container).hide(), l++ , "sticky" === this.getTrigger() && this.show(), this.options.selector && (this._options = d.extend({}, this.options, { selector: "" })) }, destroy: function () { for (var a = -1, b = 0; b < j.length; b++) if (j[b] === this.$element) { a = b; break } j.splice(a, 1), this.hide(), this.$element.data("plugin_" + e, null), "click" === this.getTrigger() ? this.$element.off("click") : "hover" === this.getTrigger() && this.$element.off("mouseenter mouseleave"), this.$target && this.$target.remove() }, getDelegateOptions: function () { var a = {}; return this._options && d.each(this._options, function (b, c) { h[b] !== c && (a[b] = c) }), a }, hide: function (a, b) { if ((a || "sticky" !== this.getTrigger()) && this._opened) { b && (b.preventDefault(), b.stopPropagation()), this.xhr && this.options.abortXHR === !0 && (this.xhr.abort(), this.xhr = null); var c = d.Event("hide." + g); if (this.$element.trigger(c, [this.$target]), this.$target) { this.$target.removeClass("in").addClass(this.getHideAnimation()); var e = this; setTimeout(function () { e.$target.hide(), e.getCache() || e.$target.remove() }, e.getHideDelay()) } this.options.backdrop && k.hide(), this._opened = !1, this.$element.trigger("hidden." + g, [this.$target]), this.options.onHide && this.options.onHide(this.$target) } }, resetAutoHide: function () { var a = this, b = a.getAutoHide(); b && (a.autoHideHandler && clearTimeout(a.autoHideHandler), a.autoHideHandler = setTimeout(function () { a.hide() }, b)) }, delegate: function (a) { var b = d(a).data("plugin_" + e); return b || (b = new v(a, this.getDelegateOptions()), d(a).data("plugin_" + e, b)), b }, toggle: function (a) { var b = this; a && (a.preventDefault(), a.stopPropagation(), this.options.selector && (b = this.delegate(a.currentTarget))), b[b.getTarget().hasClass("in") ? "hide" : "show"]() }, hideAll: function () { r() }, hideOthers: function () { s(this) }, show: function () { if (!this._opened) { var a = this.getTarget().removeClass().addClass(f).addClass(this._customTargetClass); if (this.options.multi || this.hideOthers(), !this.getCache() || !this._poped || "" === this.content) { if (this.content = "", this.setTitle(this.getTitle()), this.options.closeable || a.find(".close").off("click").remove(), this.isAsync() ? this.setContentASync(this.options.content) : this.setContent(this.getContent()), this.canEmptyHide() && "" === this.content) return; a.show() } this.displayContent(), this.options.onShow && this.options.onShow(a), this.bindBodyEvents(), this.options.backdrop && k.show(), this._opened = !0, this.resetAutoHide() } }, displayContent: function () { var a = this.getElementPosition(), b = this.getTarget().removeClass().addClass(f).addClass(this._customTargetClass), c = this.getContentElement(), e = b[0].offsetWidth, h = b[0].offsetHeight, j = "bottom", k = d.Event("show." + g); if (this.canEmptyHide()) { var l = c.children().html(); if (null !== l && 0 === l.trim().length) return } this.$element.trigger(k, [b]); var m = this.$element.data("width") || this.options.width; "" === m && (m = this._defaults.width), "auto" !== m && b.width(m); var o = this.$element.data("height") || this.options.height; "" === o && (o = this._defaults.height), "auto" !== o && c.height(o), this.options.style && this.$target.addClass(f + "-" + this.options.style), "rtl" !== this.options.direction || c.hasClass(i) || c.addClass(i), this.options.arrow || b.find(".webui-arrow").remove(), b.detach().css({ top: n, left: n, display: "block" }), this.getAnimation() && b.addClass(this.getAnimation()), b.appendTo(this.options.container), j = this.getPlacement(a), this.$element.trigger("added." + g), this.initTargetEvents(), this.options.padding || ("auto" !== this.options.height && c.css("height", c.outerHeight()), this.$target.addClass("webui-no-padding")), e = b[0].offsetWidth, h = b[0].offsetHeight; var p = this.getTargetPositin(a, j, e, h); if (this.$target.css(p.position).addClass(j).addClass("in"), "iframe" === this.options.type) { var q = b.find("iframe"), r = b.width(), s = q.parent().height(); "" !== this.options.iframeOptions.width && "auto" !== this.options.iframeOptions.width && (r = this.options.iframeOptions.width), "" !== this.options.iframeOptions.height && "auto" !== this.options.iframeOptions.height && (s = this.options.iframeOptions.height), q.width(r).height(s) } if (this.options.arrow || this.$target.css({ margin: 0 }), this.options.arrow) { var t = this.$target.find(".webui-arrow"); t.removeAttr("style"), "left" === j || "right" === j ? t.css({ top: this.$target.height() / 2 }) : "top" !== j && "bottom" !== j || t.css({ left: this.$target.width() / 2 }), p.arrowOffset && (p.arrowOffset.left === -1 || p.arrowOffset.top === -1 ? t.hide() : t.css(p.arrowOffset)) } this._poped = !0, this.$element.trigger("shown." + g, [this.$target]) }, isTargetLoaded: function () { return 0 === this.getTarget().find("i.glyphicon-refresh").length }, getTriggerElement: function () { return this.$element }, getTarget: function () { if (!this.$target) { var a = e + this._idSeed; this.$target = d(this.options.template).attr("id", a), this._customTargetClass = this.$target.attr("class") !== f ? this.$target.attr("class") : null, this.getTriggerElement().attr("data-target", a) } return this.$target.data("trigger-element") || this.$target.data("trigger-element", this.getTriggerElement()), this.$target }, removeTarget: function () { this.$target.remove(), this.$target = null, this.$contentElement = null }, getTitleElement: function () { return this.getTarget().find("." + f + "-title") }, getContentElement: function () { return this.$contentElement || (this.$contentElement = this.getTarget().find("." + f + "-content")), this.$contentElement }, getTitle: function () { return this.$element.attr("data-title") || this.options.title || this.$element.attr("title") }, getUrl: function () { return this.$element.attr("data-url") || this.options.url }, getAutoHide: function () { return this.$element.attr("data-auto-hide") || this.options.autoHide }, getOffsetTop: function () { return p(this.$element.attr("data-offset-top")) || this.options.offsetTop }, getOffsetLeft: function () { return p(this.$element.attr("data-offset-left")) || this.options.offsetLeft }, getCache: function () { var a = this.$element.attr("data-cache"); if ("undefined" != typeof a) switch (a.toLowerCase()) { case "true": case "yes": case "1": return !0; case "false": case "no": case "0": return !1 } return this.options.cache }, getTrigger: function () { return this.$element.attr("data-trigger") || this.options.trigger }, getDelayShow: function () { var a = this.$element.attr("data-delay-show"); return "undefined" != typeof a ? a : 0 === this.options.delay.show ? 0 : this.options.delay.show || 100 }, getHideDelay: function () { var a = this.$element.attr("data-delay-hide"); return "undefined" != typeof a ? a : 0 === this.options.delay.hide ? 0 : this.options.delay.hide || 100 }, getAnimation: function () { var a = this.$element.attr("data-animation"); return a || this.options.animation }, getHideAnimation: function () { var a = this.getAnimation(); return a ? a + "-out" : "out" }, setTitle: function (a) { var b = this.getTitleElement(); a ? ("rtl" !== this.options.direction || b.hasClass(i) || b.addClass(i), b.html(a)) : b.remove() }, hasContent: function () { return this.getContent() }, canEmptyHide: function () { return this.options.hideEmpty && "html" === this.options.type }, getIframe: function () { var a = d("<iframe></iframe>").attr("src", this.getUrl()), b = this; return d.each(this._defaults.iframeOptions, function (c) { "undefined" != typeof b.options.iframeOptions[c] && a.attr(c, b.options.iframeOptions[c]) }), a }, getContent: function () { if (this.getUrl()) switch (this.options.type) { case "iframe": this.content = this.getIframe(); break; case "html": try { this.content = d(this.getUrl()), this.content.is(":visible") || this.content.show() } catch (a) { throw new Error("Unable to get popover content. Invalid selector specified.") } } else if (!this.content) { var a = ""; if (a = d.isFunction(this.options.content) ? this.options.content.apply(this.$element[0], [this]) : this.options.content, this.content = this.$element.attr("data-content") || a, !this.content) { var b = this.$element.next(); b && b.hasClass(f + "-content") && (this.content = b) } } return this.content }, setContent: function (a) { var b = this.getTarget(), c = this.getContentElement(); "string" == typeof a ? c.html(a) : a instanceof d && (c.html(""), this.options.cache ? a.removeClass(f + "-content").appendTo(c) : a.clone(!0, !0).removeClass(f + "-content").appendTo(c)), this.$target = b }, isAsync: function () { return "async" === this.options.type }, setContentASync: function (a) { var b = this; this.xhr || (this.xhr = d.ajax({ url: this.getUrl(), type: this.options.async.type, cache: this.getCache(), beforeSend: function (a) { b.options.async.before && b.options.async.before(b, a) }, success: function (c) { b.bindBodyEvents(), a && d.isFunction(a) ? b.content = a.apply(b.$element[0], [c]) : b.content = c, b.setContent(b.content); var e = b.getContentElement(); e.removeAttr("style"), b.displayContent(), b.options.async.success && b.options.async.success(b, c) }, complete: function () { b.xhr = null }, error: function (a, c) { b.options.async.error && b.options.async.error(b, a, c) } })) }, bindBodyEvents: function () { m || (this.options.dismissible && "click" === this.getTrigger() ? (o.off("keyup.webui-popover").on("keyup.webui-popover", d.proxy(this.escapeHandler, this)), o.off("click.webui-popover touchend.webui-popover").on("click.webui-popover touchend.webui-popover", d.proxy(this.bodyClickHandler, this))) : "hover" === this.getTrigger() && o.off("touchend.webui-popover").on("touchend.webui-popover", d.proxy(this.bodyClickHandler, this))) }, mouseenterHandler: function (a) { var b = this; a && this.options.selector && (b = this.delegate(a.currentTarget)), b._timeout && clearTimeout(b._timeout), b._enterTimeout = setTimeout(function () { b.getTarget().is(":visible") || b.show() }, this.getDelayShow()) }, mouseleaveHandler: function () { var a = this; clearTimeout(a._enterTimeout), a._timeout = setTimeout(function () { a.hide() }, this.getHideDelay()) }, escapeHandler: function (a) { 27 === a.keyCode && this.hideAll() }, bodyClickHandler: function (a) { m = !0; for (var b = !0, c = 0; c < j.length; c++) { var d = q(j[c]); if (d && d._opened) { var e = d.getTarget().offset(), f = e.left, g = e.top, h = e.left + d.getTarget().width(), i = e.top + d.getTarget().height(), k = u(a), l = k.x >= f && k.x <= h && k.y >= g && k.y <= i; if (l) { b = !1; break } } } b && r() }, initTargetEvents: function () { "hover" === this.getTrigger() && this.$target.off("mouseenter mouseleave").on("mouseenter", d.proxy(this.mouseenterHandler, this)).on("mouseleave", d.proxy(this.mouseleaveHandler, this)), this.$target.find(".close").off("click").on("click", d.proxy(this.hide, this, !0)) }, getPlacement: function (a) { var b, c = this.options.container, d = c.innerWidth(), e = c.innerHeight(), f = c.scrollTop(), g = c.scrollLeft(), h = Math.max(0, a.left - g), i = Math.max(0, a.top - f); b = "function" == typeof this.options.placement ? this.options.placement.call(this, this.getTarget()[0], this.$element[0]) : this.$element.data("placement") || this.options.placement; var j = "horizontal" === b, k = "vertical" === b, l = "auto" === b || j || k; return l ? b = h < d / 3 ? i < e / 3 ? j ? "right-bottom" : "bottom-right" : i < 2 * e / 3 ? k ? i <= e / 2 ? "bottom-right" : "top-right" : "right" : j ? "right-top" : "top-right" : h < 2 * d / 3 ? i < e / 3 ? j ? h <= d / 2 ? "right-bottom" : "left-bottom" : "bottom" : i < 2 * e / 3 ? j ? h <= d / 2 ? "right" : "left" : i <= e / 2 ? "bottom" : "top" : j ? h <= d / 2 ? "right-top" : "left-top" : "top" : i < e / 3 ? j ? "left-bottom" : "bottom-left" : i < 2 * e / 3 ? k ? i <= e / 2 ? "bottom-left" : "top-left" : "left" : j ? "left-top" : "top-left" : "auto-top" === b ? b = h < d / 3 ? "top-right" : h < 2 * d / 3 ? "top" : "top-left" : "auto-bottom" === b ? b = h < d / 3 ? "bottom-right" : h < 2 * d / 3 ? "bottom" : "bottom-left" : "auto-left" === b ? b = i < e / 3 ? "left-top" : i < 2 * e / 3 ? "left" : "left-bottom" : "auto-right" === b && (b = i < e / 3 ? "right-bottom" : i < 2 * e / 3 ? "right" : "right-top"), b }, getElementPosition: function () { var a = this.$element[0].getBoundingClientRect(), c = this.options.container, e = c.css("position"); if (c.is(b.body) || "static" === e) return d.extend({}, this.$element.offset(), { width: this.$element[0].offsetWidth || a.width, height: this.$element[0].offsetHeight || a.height }); if ("fixed" === e) { var f = c[0].getBoundingClientRect(); return { top: a.top - f.top + c.scrollTop(), left: a.left - f.left + c.scrollLeft(), width: a.width, height: a.height } } return "relative" === e ? { top: this.$element.offset().top - c.offset().top, left: this.$element.offset().left - c.offset().left, width: this.$element[0].offsetWidth || a.width, height: this.$element[0].offsetHeight || a.height } : void 0 }, getTargetPositin: function (a, c, d, e) { var f = a, g = this.options.container, h = this.$element.outerWidth(), i = this.$element.outerHeight(), j = b.documentElement.scrollTop + g.scrollTop(), k = b.documentElement.scrollLeft + g.scrollLeft(), l = {}, m = null, o = this.options.arrow ? 20 : 0, p = 10, q = h < o + p ? o : 0, r = i < o + p ? o : 0, s = 0, t = b.documentElement.clientHeight + j, u = b.documentElement.clientWidth + k, v = f.left + f.width / 2 - q > 0, w = f.left + f.width / 2 + q < u, x = f.top + f.height / 2 - r > 0, y = f.top + f.height / 2 + r < t; switch (c) { case "bottom": l = { top: f.top + f.height, left: f.left + f.width / 2 - d / 2 }; break; case "top": l = { top: f.top - e, left: f.left + f.width / 2 - d / 2 }; break; case "left": l = { top: f.top + f.height / 2 - e / 2, left: f.left - d }; break; case "right": l = { top: f.top + f.height / 2 - e / 2, left: f.left + f.width }; break; case "top-right": l = { top: f.top - e, left: v ? f.left - q : p }, m = { left: v ? Math.min(h, d) / 2 + q : n }; break; case "top-left": s = w ? q : -p, l = { top: f.top - e, left: f.left - d + f.width + s }, m = { left: w ? d - Math.min(h, d) / 2 - q : n }; break; case "bottom-right": l = { top: f.top + f.height, left: v ? f.left - q : p }, m = { left: v ? Math.min(h, d) / 2 + q : n }; break; case "bottom-left": s = w ? q : -p, l = { top: f.top + f.height, left: f.left - d + f.width + s }, m = { left: w ? d - Math.min(h, d) / 2 - q : n }; break; case "right-top": s = y ? r : -p, l = { top: f.top - e + f.height + s, left: f.left + f.width }, m = { top: y ? e - Math.min(i, e) / 2 - r : n }; break; case "right-bottom": l = { top: x ? f.top - r : p, left: f.left + f.width }, m = { top: x ? Math.min(i, e) / 2 + r : n }; break; case "left-top": s = y ? r : -p, l = { top: f.top - e + f.height + s, left: f.left - d }, m = { top: y ? e - Math.min(i, e) / 2 - r : n }; break; case "left-bottom": l = { top: x ? f.top - r : p, left: f.left - d }, m = { top: x ? Math.min(i, e) / 2 + r : n } } return l.top += this.getOffsetTop(), l.left += this.getOffsetLeft(), { position: l, arrowOffset: m } } }, d.fn[e] = function (a, b) { var c = [], f = this.each(function () { var f = d.data(this, "plugin_" + e); f ? "destroy" === a ? f.destroy() : "string" == typeof a && c.push(f[a]()) : (a ? "string" == typeof a ? "destroy" !== a && (b || (f = new v(this, null), c.push(f[a]()))) : "object" == typeof a && (f = new v(this, a)) : f = new v(this, null), d.data(this, "plugin_" + e, f)) }); return c.length ? c : f }; var w = function () { var a = function () { r() }, b = function (a, b) { b = b || {}, d(a).webuiPopover(b) }, f = function (a) { var b = !0; return d(a).each(function (a) { b = b && d(a).data("plugin_" + e) !== c }), b }, g = function (a, b) { b ? d(a).webuiPopover(b).webuiPopover("show") : d(a).webuiPopover("show") }, h = function (a) { d(a).webuiPopover("hide") }, i = function (a, b) { var c = d(a).data("plugin_" + e); if (c) { var f = c.getCache(); c.options.cache = !1, c.options.content = b, c._opened ? (c._opened = !1, c.show()) : c.isAsync() ? c.setContentASync(b) : c.setContent(b), c.options.cache = f } }; return { show: g, hide: h, create: b, isCreated: f, hideAll: a, updateContent: i } }(); a.WebuiPopovers = w }) }(window, document);
        }
        /*
         * debouncedresize: special jQuery event that happens once after a window resize
         *
         * latest version and complete README available on Github:
         * https://github.com/louisremi/jquery-smartresize
         *
         * Copyright 2012 @louis_remi
         * Licensed under the MIT license.
         *
         * This saved you an hour of work?
         * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
         */
        if (HawkSearch.loadPlugins.debounce == true) {
            (function ($) {

                var $event = $.event,
                    $special,
                    resizeTimeout;

                $special = $event.special.debouncedresize = {
                    setup: function () {
                        $(this).on("resize", $special.handler);
                    },
                    teardown: function () {
                        $(this).off("resize", $special.handler);
                    },
                    handler: function (event, execAsap) {
                        // Save the context
                        var context = this,
                            args = arguments,
                            dispatch = function () {
                                // set correct event type
                                event.type = "debouncedresize";
                                $event.dispatch.apply(context, args);
                            };

                        if (resizeTimeout) {
                            clearTimeout(resizeTimeout);
                        }

                        execAsap ?
                            dispatch() :
                            resizeTimeout = setTimeout(dispatch, $special.threshold);
                    },
                    threshold: 150
                };

            })(jQuery);
        }

        /*
             _ _      _       _
         ___| (_) ___| | __  (_)___
        / __| | |/ __| |/ /  | / __|
        \__ \ | | (__|   < _ | \__ \
        |___/_|_|\___|_|\_(_)/ |___/
                           |__/

         Version: 1.4.1
          Author: Ken Wheeler
         Website: http://kenwheeler.github.io
            Docs: http://kenwheeler.github.io/hawkslick
            Repo: http://github.com/kenwheeler/hawkslick
          Issues: http://github.com/kenwheeler/hawkslick/issues

         */
        if (HawkSearch.loadPlugins.hawkslick == true) {
            !function (a) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], a) : "undefined" != typeof exports ? module.exports = a(require("jquery")) : a(jQuery) }(function (a) {
                "use strict"; var b = window.hawkslick || {
                }; b = function () { function c(c, d) { var f, g, h, e = this; if (e.defaults = { accessibility: !0, adaptiveHeight: !1, appendArrows: a(c), appendDots: a(c), arrows: !0, asNavFor: null, prevArrow: '<button type="button" data-role="none" class="hawkslick-prev">Previous</button>', nextArrow: '<button type="button" data-role="none" class="hawkslick-next">Next</button>', autoplay: !1, autoplaySpeed: 3e3, centerMode: !1, centerPadding: "50px", cssEase: "ease", customPaging: function (a, b) { return '<button type="button" data-role="none">' + (b + 1) + "</button>" }, dots: !1, dotsClass: "hawkslick-dots", draggable: !0, easing: "linear", edgeFriction: .35, fade: !1, focusOnSelect: !1, infinite: !0, initialSlide: 0, lazyLoad: "ondemand", mobileFirst: !1, pauseOnHover: !0, pauseOnDotsHover: !1, respondTo: "window", responsive: null, rtl: !1, slide: "", slidesToShow: 1, slidesToScroll: 1, speed: 500, swipe: !0, swipeToSlide: !1, touchMove: !0, touchThreshold: 5, useCSS: !0, variableWidth: !1, vertical: !1, waitForAnimate: !0 }, e.initials = { animating: !1, dragging: !1, autoPlayTimer: null, currentDirection: 0, currentLeft: null, currentSlide: 0, direction: 1, $dots: null, listWidth: null, listHeight: null, loadIndex: 0, $nextArrow: null, $prevArrow: null, slideCount: null, slideWidth: null, $slideTrack: null, $slides: null, sliding: !1, slideOffset: 0, swipeLeft: null, $list: null, touchObject: {}, transformsEnabled: !1 }, a.extend(e, e.initials), e.activeBreakpoint = null, e.animType = null, e.animProp = null, e.breakpoints = [], e.breakpointSettings = [], e.cssTransitions = !1, e.hidden = "hidden", e.paused = !1, e.positionProp = null, e.respondTo = null, e.shouldClick = !0, e.$slider = a(c), e.$slidesCache = null, e.transformType = null, e.transitionType = null, e.visibilityChange = "visibilitychange", e.windowWidth = 0, e.windowTimer = null, f = a(c).data("hawkslick") || {}, e.options = a.extend({}, e.defaults, f, d), e.currentSlide = e.options.initialSlide, e.originalSettings = e.options, g = e.options.responsive || null, g && g.length > -1) { e.respondTo = e.options.respondTo || "window"; for (h in g) g.hasOwnProperty(h) && (e.breakpoints.push(g[h].breakpoint), e.breakpointSettings[g[h].breakpoint] = g[h].settings); e.breakpoints.sort(function (a, b) { return e.options.mobileFirst === !0 ? a - b : b - a }) } "undefined" != typeof document.mozHidden ? (e.hidden = "mozHidden", e.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (e.hidden = "msHidden", e.visibilityChange = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (e.hidden = "webkitHidden", e.visibilityChange = "webkitvisibilitychange"), e.autoPlay = a.proxy(e.autoPlay, e), e.autoPlayClear = a.proxy(e.autoPlayClear, e), e.changeSlide = a.proxy(e.changeSlide, e), e.clickHandler = a.proxy(e.clickHandler, e), e.selectHandler = a.proxy(e.selectHandler, e), e.setPosition = a.proxy(e.setPosition, e), e.swipeHandler = a.proxy(e.swipeHandler, e), e.dragHandler = a.proxy(e.dragHandler, e), e.keyHandler = a.proxy(e.keyHandler, e), e.autoPlayIterator = a.proxy(e.autoPlayIterator, e), e.instanceUid = b++ , e.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, e.init(), e.checkResponsive(!0) } var b = 0; return c }(), b.prototype.addSlide = b.prototype.hawkslickAdd = function (b, c, d) { var e = this; if ("boolean" == typeof c) d = c, c = null; else if (0 > c || c >= e.slideCount) return !1; e.unload(), "number" == typeof c ? 0 === c && 0 === e.$slides.length ? a(b).appendTo(e.$slideTrack) : d ? a(b).insertBefore(e.$slides.eq(c)) : a(b).insertAfter(e.$slides.eq(c)) : d === !0 ? a(b).prependTo(e.$slideTrack) : a(b).appendTo(e.$slideTrack), e.$slides = e.$slideTrack.children(this.options.slide), e.$slideTrack.children(this.options.slide).detach(), e.$slideTrack.append(e.$slides), e.$slides.each(function (b, c) { a(c).attr("data-hawkslick-index", b) }), e.$slidesCache = e.$slides, e.reinit() }, b.prototype.animateHeight = function () { var a = this; if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) { var b = a.$slides.eq(a.currentSlide).outerHeight(!0); a.$list.animate({ height: b }, a.options.speed) } }, b.prototype.animateSlide = function (b, c) { var d = {}, e = this; e.animateHeight(), e.options.rtl === !0 && e.options.vertical === !1 && (b = -b), e.transformsEnabled === !1 ? e.options.vertical === !1 ? e.$slideTrack.animate({ left: b }, e.options.speed, e.options.easing, c) : e.$slideTrack.animate({ top: b }, e.options.speed, e.options.easing, c) : e.cssTransitions === !1 ? (e.options.rtl === !0 && (e.currentLeft = -e.currentLeft), a({ animStart: e.currentLeft }).animate({ animStart: b }, { duration: e.options.speed, easing: e.options.easing, step: function (a) { a = Math.ceil(a), e.options.vertical === !1 ? (d[e.animType] = "translate(" + a + "px, 0px)", e.$slideTrack.css(d)) : (d[e.animType] = "translate(0px," + a + "px)", e.$slideTrack.css(d)) }, complete: function () { c && c.call() } })) : (e.applyTransition(), b = Math.ceil(b), d[e.animType] = e.options.vertical === !1 ? "translate3d(" + b + "px, 0px, 0px)" : "translate3d(0px," + b + "px, 0px)", e.$slideTrack.css(d), c && setTimeout(function () { e.disableTransition(), c.call() }, e.options.speed)) }, b.prototype.asNavFor = function (b) { var c = this, d = null !== c.options.asNavFor ? a(c.options.asNavFor).hawkslick("gethawkslick") : null; null !== d && d.slideHandler(b, !0) }, b.prototype.applyTransition = function (a) { var b = this, c = {}; c[b.transitionType] = b.options.fade === !1 ? b.transformType + " " + b.options.speed + "ms " + b.options.cssEase : "opacity " + b.options.speed + "ms " + b.options.cssEase, b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c) }, b.prototype.autoPlay = function () { var a = this; a.autoPlayTimer && clearInterval(a.autoPlayTimer), a.slideCount > a.options.slidesToShow && a.paused !== !0 && (a.autoPlayTimer = setInterval(a.autoPlayIterator, a.options.autoplaySpeed)) }, b.prototype.autoPlayClear = function () { var a = this; a.autoPlayTimer && clearInterval(a.autoPlayTimer) }, b.prototype.autoPlayIterator = function () { var a = this; a.options.infinite === !1 ? 1 === a.direction ? (a.currentSlide + 1 === a.slideCount - 1 && (a.direction = 0), a.slideHandler(a.currentSlide + a.options.slidesToScroll)) : (0 === a.currentSlide - 1 && (a.direction = 1), a.slideHandler(a.currentSlide - a.options.slidesToScroll)) : a.slideHandler(a.currentSlide + a.options.slidesToScroll) }, b.prototype.buildArrows = function () { var b = this; b.options.arrows === !0 && b.slideCount > b.options.slidesToShow && (b.$prevArrow = a(b.options.prevArrow), b.$nextArrow = a(b.options.nextArrow), b.htmlExpr.test(b.options.prevArrow) && b.$prevArrow.appendTo(b.options.appendArrows), b.htmlExpr.test(b.options.nextArrow) && b.$nextArrow.appendTo(b.options.appendArrows), b.options.infinite !== !0 && b.$prevArrow.addClass("hawkslick-disabled")) }, b.prototype.buildDots = function () { var c, d, b = this; if (b.options.dots === !0 && b.slideCount > b.options.slidesToShow) { for (d = '<ul class="' + b.options.dotsClass + '">', c = 0; c <= b.getDotCount(); c += 1) d += "<li>" + b.options.customPaging.call(this, b, c) + "</li>"; d += "</ul>", b.$dots = a(d).appendTo(b.options.appendDots), b.$dots.find("li").first().addClass("hawkslick-active") } }, b.prototype.buildOut = function () { var b = this; b.$slides = b.$slider.children(b.options.slide + ":not(.hawkslick-cloned)").addClass("hawkslick-slide"), b.slideCount = b.$slides.length, b.$slides.each(function (b, c) { a(c).attr("data-hawkslick-index", b) }), b.$slidesCache = b.$slides, b.$slider.addClass("hawkslick-slider"), b.$slideTrack = 0 === b.slideCount ? a('<div class="hawkslick-track"/>').appendTo(b.$slider) : b.$slides.wrapAll('<div class="hawkslick-track"/>').parent(), b.$list = b.$slideTrack.wrap('<div class="hawkslick-list"/>').parent(), b.$slideTrack.css("opacity", 0), (b.options.centerMode === !0 || b.options.swipeToSlide === !0) && (b.options.slidesToScroll = 1), a("img[data-lazy]", b.$slider).not("[src]").addClass("hawkslick-loading"), b.setupInfinite(), b.buildArrows(), b.buildDots(), b.updateDots(), b.options.accessibility === !0 && b.$list.prop("tabIndex", 0), b.setSlideClasses("number" == typeof this.currentSlide ? this.currentSlide : 0), b.options.draggable === !0 && b.$list.addClass("draggable") }, b.prototype.checkResponsive = function (b) { var d, e, f, c = this, g = c.$slider.width(), h = window.innerWidth || a(window).width(); if ("window" === c.respondTo ? f = h : "slider" === c.respondTo ? f = g : "min" === c.respondTo && (f = Math.min(h, g)), c.originalSettings.responsive && c.originalSettings.responsive.length > -1 && null !== c.originalSettings.responsive) { e = null; for (d in c.breakpoints) c.breakpoints.hasOwnProperty(d) && (c.originalSettings.mobileFirst === !1 ? f < c.breakpoints[d] && (e = c.breakpoints[d]) : f > c.breakpoints[d] && (e = c.breakpoints[d])); null !== e ? null !== c.activeBreakpoint ? e !== c.activeBreakpoint && (c.activeBreakpoint = e, "unhawkslick" === c.breakpointSettings[e] ? c.unhawkslick() : (c.options = a.extend({}, c.originalSettings, c.breakpointSettings[e]), b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh())) : (c.activeBreakpoint = e, "unhawkslick" === c.breakpointSettings[e] ? c.unhawkslick() : (c.options = a.extend({}, c.originalSettings, c.breakpointSettings[e]), b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh())) : null !== c.activeBreakpoint && (c.activeBreakpoint = null, c.options = c.originalSettings, b === !0 && (c.currentSlide = c.options.initialSlide), c.refresh()) } }, b.prototype.changeSlide = function (b, c) { var f, g, h, d = this, e = a(b.target); switch (e.is("a") && b.preventDefault(), h = 0 !== d.slideCount % d.options.slidesToScroll, f = h ? 0 : (d.slideCount - d.currentSlide) % d.options.slidesToScroll, b.data.message) { case "previous": g = 0 === f ? d.options.slidesToScroll : d.options.slidesToShow - f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide - g, !1, c); break; case "next": g = 0 === f ? d.options.slidesToScroll : f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide + g, !1, c); break; case "index": var i = 0 === b.data.index ? 0 : b.data.index || a(b.target).parent().index() * d.options.slidesToScroll; d.slideHandler(d.checkNavigable(i), !1, c); break; default: return } }, b.prototype.checkNavigable = function (a) { var c, d, b = this; if (c = b.getNavigableIndexes(), d = 0, a > c[c.length - 1]) a = c[c.length - 1]; else for (var e in c) { if (a < c[e]) { a = d; break } d = c[e] } return a }, b.prototype.clickHandler = function (a) { var b = this; b.shouldClick === !1 && (a.stopImmediatePropagation(), a.stopPropagation(), a.preventDefault()) }, b.prototype.destroy = function () { var b = this; b.autoPlayClear(), b.touchObject = {}, a(".hawkslick-cloned", b.$slider).remove(), b.$dots && b.$dots.remove(), b.$prevArrow && "object" != typeof b.options.prevArrow && b.$prevArrow.remove(), b.$nextArrow && "object" != typeof b.options.nextArrow && b.$nextArrow.remove(), b.$slides.removeClass("hawkslick-slide hawkslick-active hawkslick-center hawkslick-visible").removeAttr("data-hawkslick-index").css({ position: "", left: "", top: "", zIndex: "", opacity: "", width: "" }), b.$slider.removeClass("hawkslick-slider"), b.$slider.removeClass("hawkslick-initialized"), b.$list.off(".hawkslick"), a(window).off(".hawkslick-" + b.instanceUid), a(document).off(".hawkslick-" + b.instanceUid), b.$slider.html(b.$slides) }, b.prototype.disableTransition = function (a) { var b = this, c = {}; c[b.transitionType] = "", b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c) }, b.prototype.fadeSlide = function (a, b) { var c = this; c.cssTransitions === !1 ? (c.$slides.eq(a).css({ zIndex: 1e3 }), c.$slides.eq(a).animate({ opacity: 1 }, c.options.speed, c.options.easing, b)) : (c.applyTransition(a), c.$slides.eq(a).css({ opacity: 1, zIndex: 1e3 }), b && setTimeout(function () { c.disableTransition(a), b.call() }, c.options.speed)) }, b.prototype.filterSlides = b.prototype.hawkslickFilter = function (a) { var b = this; null !== a && (b.unload(), b.$slideTrack.children(this.options.slide).detach(), b.$slidesCache.filter(a).appendTo(b.$slideTrack), b.reinit()) }, b.prototype.getCurrent = b.prototype.hawkslickCurrentSlide = function () { var a = this; return a.currentSlide }, b.prototype.getDotCount = function () { var a = this, b = 0, c = 0, d = 0; if (a.options.infinite === !0) d = Math.ceil(a.slideCount / a.options.slidesToScroll); else if (a.options.centerMode === !0) d = a.slideCount; else for (; b < a.slideCount;)++d, b = c + a.options.slidesToShow, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow; return d - 1 }, b.prototype.getLeft = function (a) { var c, d, f, b = this, e = 0; return b.slideOffset = 0, d = b.$slides.first().outerHeight(), b.options.infinite === !0 ? (b.slideCount > b.options.slidesToShow && (b.slideOffset = -1 * b.slideWidth * b.options.slidesToShow, e = -1 * d * b.options.slidesToShow), 0 !== b.slideCount % b.options.slidesToScroll && a + b.options.slidesToScroll > b.slideCount && b.slideCount > b.options.slidesToShow && (a > b.slideCount ? (b.slideOffset = -1 * (b.options.slidesToShow - (a - b.slideCount)) * b.slideWidth, e = -1 * (b.options.slidesToShow - (a - b.slideCount)) * d) : (b.slideOffset = -1 * b.slideCount % b.options.slidesToScroll * b.slideWidth, e = -1 * b.slideCount % b.options.slidesToScroll * d))) : a + b.options.slidesToShow > b.slideCount && (b.slideOffset = (a + b.options.slidesToShow - b.slideCount) * b.slideWidth, e = (a + b.options.slidesToShow - b.slideCount) * d), b.slideCount <= b.options.slidesToShow && (b.slideOffset = 0, e = 0), b.options.centerMode === !0 && b.options.infinite === !0 ? b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2) - b.slideWidth : b.options.centerMode === !0 && (b.slideOffset = 0, b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2)), c = b.options.vertical === !1 ? -1 * a * b.slideWidth + b.slideOffset : -1 * a * d + e, b.options.variableWidth === !0 && (f = b.slideCount <= b.options.slidesToShow || b.options.infinite === !1 ? b.$slideTrack.children(".hawkslick-slide").eq(a) : b.$slideTrack.children(".hawkslick-slide").eq(a + b.options.slidesToShow), c = f[0] ? -1 * f[0].offsetLeft : 0, b.options.centerMode === !0 && (f = b.options.infinite === !1 ? b.$slideTrack.children(".hawkslick-slide").eq(a) : b.$slideTrack.children(".hawkslick-slide").eq(a + b.options.slidesToShow + 1), c = f[0] ? -1 * f[0].offsetLeft : 0, c += (b.$list.width() - f.outerWidth()) / 2)), c }, b.prototype.getOption = b.prototype.hawkslickGetOption = function (a) { var b = this; return b.options[a] }, b.prototype.getNavigableIndexes = function () { var e, a = this, b = 0, c = 0, d = []; for (a.options.infinite === !1 ? (e = a.slideCount - a.options.slidesToShow + 1, a.options.centerMode === !0 && (e = a.slideCount)) : (b = -1 * a.slideCount, c = -1 * a.slideCount, e = 2 * a.slideCount); e > b;) d.push(b), b = c + a.options.slidesToScroll, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow; return d }, b.prototype.gethawkslick = function () { return this }, b.prototype.getSlideCount = function () { var c, d, e, b = this; return e = b.options.centerMode === !0 ? b.slideWidth * Math.floor(b.options.slidesToShow / 2) : 0, b.options.swipeToSlide === !0 ? (b.$slideTrack.find(".hawkslick-slide").each(function (c, f) { return f.offsetLeft - e + a(f).outerWidth() / 2 > -1 * b.swipeLeft ? (d = f, !1) : void 0 }), c = Math.abs(a(d).attr("data-hawkslick-index") - b.currentSlide) || 1) : b.options.slidesToScroll }, b.prototype.goTo = b.prototype.hawkslickGoTo = function (a, b) { var c = this; c.changeSlide({ data: { message: "index", index: parseInt(a) } }, b) }, b.prototype.init = function () { var b = this; a(b.$slider).hasClass("hawkslick-initialized") || (a(b.$slider).addClass("hawkslick-initialized"), b.buildOut(), b.setProps(), b.startLoad(), b.loadSlider(), b.initializeEvents(), b.updateArrows(), b.updateDots()), b.$slider.trigger("init", [b]) }, b.prototype.initArrowEvents = function () { var a = this; a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.on("click.hawkslick", { message: "previous" }, a.changeSlide), a.$nextArrow.on("click.hawkslick", { message: "next" }, a.changeSlide)) }, b.prototype.initDotEvents = function () { var b = this; b.options.dots === !0 && b.slideCount > b.options.slidesToShow && a("li", b.$dots).on("click.hawkslick", { message: "index" }, b.changeSlide), b.options.dots === !0 && b.options.pauseOnDotsHover === !0 && b.options.autoplay === !0 && a("li", b.$dots).on("mouseenter.hawkslick", function () { b.paused = !0, b.autoPlayClear() }).on("mouseleave.hawkslick", function () { b.paused = !1, b.autoPlay() }) }, b.prototype.initializeEvents = function () { var b = this; b.initArrowEvents(), b.initDotEvents(), b.$list.on("touchstart.hawkslick mousedown.hawkslick", { action: "start" }, b.swipeHandler), b.$list.on("touchmove.hawkslick mousemove.hawkslick", { action: "move" }, b.swipeHandler), b.$list.on("touchend.hawkslick mouseup.hawkslick", { action: "end" }, b.swipeHandler), b.$list.on("touchcancel.hawkslick mouseleave.hawkslick", { action: "end" }, b.swipeHandler), b.$list.on("click.hawkslick", b.clickHandler), b.options.autoplay === !0 && (a(document).on(b.visibilityChange, function () { b.visibility() }), b.options.pauseOnHover === !0 && (b.$list.on("mouseenter.hawkslick", function () { b.paused = !0, b.autoPlayClear() }), b.$list.on("mouseleave.hawkslick", function () { b.paused = !1, b.autoPlay() }))), b.options.accessibility === !0 && b.$list.on("keydown.hawkslick", b.keyHandler), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.hawkslick", b.selectHandler), a(window).on("orientationchange.hawkslick.hawkslick-" + b.instanceUid, function () { b.checkResponsive(), b.setPosition() }), a(window).on("resize.hawkslick.hawkslick-" + b.instanceUid, function () { a(window).width() !== b.windowWidth && (clearTimeout(b.windowDelay), b.windowDelay = window.setTimeout(function () { b.windowWidth = a(window).width(), b.checkResponsive(), b.setPosition() }, 50)) }), a("*[draggable!=true]", b.$slideTrack).on("dragstart", function (a) { a.preventDefault() }), a(window).on("load.hawkslick.hawkslick-" + b.instanceUid, b.setPosition), a(document).on("ready.hawkslick.hawkslick-" + b.instanceUid, b.setPosition) }, b.prototype.initUI = function () { var a = this; a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.show(), a.$nextArrow.show()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.show(), a.options.autoplay === !0 && a.autoPlay() }, b.prototype.keyHandler = function (a) { var b = this; 37 === a.keyCode && b.options.accessibility === !0 ? b.changeSlide({ data: { message: "previous" } }) : 39 === a.keyCode && b.options.accessibility === !0 && b.changeSlide({ data: { message: "next" } }) }, b.prototype.lazyLoad = function () { function g(b) { a("img[data-lazy]", b).each(function () { var b = a(this), c = a(this).attr("data-lazy"); b.load(function () { b.animate({ opacity: 1 }, 200) }).css({ opacity: 0 }).attr("src", c).removeAttr("data-lazy").removeClass("hawkslick-loading") }) } var c, d, e, f, b = this; b.options.centerMode === !0 ? b.options.infinite === !0 ? (e = b.currentSlide + (b.options.slidesToShow / 2 + 1), f = e + b.options.slidesToShow + 2) : (e = Math.max(0, b.currentSlide - (b.options.slidesToShow / 2 + 1)), f = 2 + (b.options.slidesToShow / 2 + 1) + b.currentSlide) : (e = b.options.infinite ? b.options.slidesToShow + b.currentSlide : b.currentSlide, f = e + b.options.slidesToShow, b.options.fade === !0 && (e > 0 && e-- , f <= b.slideCount && f++)), c = b.$slider.find(".hawkslick-slide").slice(e, f), g(c), b.slideCount <= b.options.slidesToShow ? (d = b.$slider.find(".hawkslick-slide"), g(d)) : b.currentSlide >= b.slideCount - b.options.slidesToShow ? (d = b.$slider.find(".hawkslick-cloned").slice(0, b.options.slidesToShow), g(d)) : 0 === b.currentSlide && (d = b.$slider.find(".hawkslick-cloned").slice(-1 * b.options.slidesToShow), g(d)) }, b.prototype.loadSlider = function () { var a = this; a.setPosition(), a.$slideTrack.css({ opacity: 1 }), a.$slider.removeClass("hawkslick-loading"), a.initUI(), "progressive" === a.options.lazyLoad && a.progressiveLazyLoad() }, b.prototype.next = b.prototype.hawkslickNext = function () { var a = this; a.changeSlide({ data: { message: "next" } }) }, b.prototype.pause = b.prototype.hawkslickPause = function () { var a = this; a.autoPlayClear(), a.paused = !0 }, b.prototype.play = b.prototype.hawkslickPlay = function () { var a = this; a.paused = !1, a.autoPlay() }, b.prototype.postSlide = function (a) { var b = this; b.$slider.trigger("afterChange", [b, a]), b.animating = !1, b.setPosition(), b.swipeLeft = null, b.options.autoplay === !0 && b.paused === !1 && b.autoPlay() }, b.prototype.prev = b.prototype.hawkslickPrev = function () { var a = this; a.changeSlide({ data: { message: "previous" } }) }, b.prototype.progressiveLazyLoad = function () { var c, d, b = this; c = a("img[data-lazy]", b.$slider).length, c > 0 && (d = a("img[data-lazy]", b.$slider).first(), d.attr("src", d.attr("data-lazy")).removeClass("hawkslick-loading").load(function () { d.removeAttr("data-lazy"), b.progressiveLazyLoad() }).error(function () { d.removeAttr("data-lazy"), b.progressiveLazyLoad() })) }, b.prototype.refresh = function () { var b = this, c = b.currentSlide; b.destroy(), a.extend(b, b.initials), b.init(), b.changeSlide({ data: { message: "index", index: c } }, !0) }, b.prototype.reinit = function () { var b = this; b.$slides = b.$slideTrack.children(b.options.slide).addClass("hawkslick-slide"), b.slideCount = b.$slides.length, b.currentSlide >= b.slideCount && 0 !== b.currentSlide && (b.currentSlide = b.currentSlide - b.options.slidesToScroll), b.slideCount <= b.options.slidesToShow && (b.currentSlide = 0), b.setProps(), b.setupInfinite(), b.buildArrows(), b.updateArrows(), b.initArrowEvents(), b.buildDots(), b.updateDots(), b.initDotEvents(), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.hawkslick", b.selectHandler), b.setSlideClasses(0), b.setPosition(), b.$slider.trigger("reInit", [b]) }, b.prototype.removeSlide = b.prototype.hawkslickRemove = function (a, b, c) { var d = this; return "boolean" == typeof a ? (b = a, a = b === !0 ? 0 : d.slideCount - 1) : a = b === !0 ? --a : a, d.slideCount < 1 || 0 > a || a > d.slideCount - 1 ? !1 : (d.unload(), c === !0 ? d.$slideTrack.children().remove() : d.$slideTrack.children(this.options.slide).eq(a).remove(), d.$slides = d.$slideTrack.children(this.options.slide), d.$slideTrack.children(this.options.slide).detach(), d.$slideTrack.append(d.$slides), d.$slidesCache = d.$slides, d.reinit(), void 0) }, b.prototype.setCSS = function (a) { var d, e, b = this, c = {}; b.options.rtl === !0 && (a = -a), d = "left" == b.positionProp ? Math.ceil(a) + "px" : "0px", e = "top" == b.positionProp ? Math.ceil(a) + "px" : "0px", c[b.positionProp] = a, b.transformsEnabled === !1 ? b.$slideTrack.css(c) : (c = {}, b.cssTransitions === !1 ? (c[b.animType] = "translate(" + d + ", " + e + ")", b.$slideTrack.css(c)) : (c[b.animType] = "translate3d(" + d + ", " + e + ", 0px)", b.$slideTrack.css(c))) }, b.prototype.setDimensions = function () { var a = this; if (a.options.vertical === !1 ? a.options.centerMode === !0 && a.$list.css({ padding: "0px " + a.options.centerPadding }) : (a.$list.height(a.$slides.first().outerHeight(!0) * a.options.slidesToShow), a.options.centerMode === !0 && a.$list.css({ padding: a.options.centerPadding + " 0px" })), a.listWidth = a.$list.width(), a.listHeight = a.$list.height(), a.options.vertical === !1 && a.options.variableWidth === !1) a.slideWidth = Math.ceil(a.listWidth / a.options.slidesToShow), a.$slideTrack.width(Math.ceil(a.slideWidth * a.$slideTrack.children(".hawkslick-slide").length)); else if (a.options.variableWidth === !0) { var b = 0; a.slideWidth = Math.ceil(a.listWidth / a.options.slidesToShow), a.$slideTrack.children(".hawkslick-slide").each(function () { b += a.listWidth }), a.$slideTrack.width(Math.ceil(b) + 1) } else a.slideWidth = Math.ceil(a.listWidth), a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0) * a.$slideTrack.children(".hawkslick-slide").length)); var c = a.$slides.first().outerWidth(!0) - a.$slides.first().width(); a.options.variableWidth === !1 && a.$slideTrack.children(".hawkslick-slide").width(a.slideWidth - c) }, b.prototype.setFade = function () { var c, b = this; b.$slides.each(function (d, e) { c = -1 * b.slideWidth * d, b.options.rtl === !0 ? a(e).css({ position: "relative", right: c, top: 0, zIndex: 800, opacity: 0 }) : a(e).css({ position: "relative", left: c, top: 0, zIndex: 800, opacity: 0 }) }), b.$slides.eq(b.currentSlide).css({ zIndex: 900, opacity: 1 }) }, b.prototype.setHeight = function () { var a = this; if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) { var b = a.$slides.eq(a.currentSlide).outerHeight(!0); a.$list.css("height", b) } }, b.prototype.setOption = b.prototype.hawkslickSetOption = function (a, b, c) { var d = this; d.options[a] = b, c === !0 && (d.unload(), d.reinit()) }, b.prototype.setPosition = function () { var a = this; a.setDimensions(), a.setHeight(), a.options.fade === !1 ? a.setCSS(a.getLeft(a.currentSlide)) : a.setFade(), a.$slider.trigger("setPosition", [a]) }, b.prototype.setProps = function () { var a = this, b = document.body.style; a.positionProp = a.options.vertical === !0 ? "top" : "left", "top" === a.positionProp ? a.$slider.addClass("hawkslick-vertical") : a.$slider.removeClass("hawkslick-vertical"), (void 0 !== b.WebkitTransition || void 0 !== b.MozTransition || void 0 !== b.msTransition) && a.options.useCSS === !0 && (a.cssTransitions = !0), void 0 !== b.OTransform && (a.animType = "OTransform", a.transformType = "-o-transform", a.transitionType = "OTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), void 0 !== b.MozTransform && (a.animType = "MozTransform", a.transformType = "-moz-transform", a.transitionType = "MozTransition", void 0 === b.perspectiveProperty && void 0 === b.MozPerspective && (a.animType = !1)), void 0 !== b.webkitTransform && (a.animType = "webkitTransform", a.transformType = "-webkit-transform", a.transitionType = "webkitTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), void 0 !== b.msTransform && (a.animType = "msTransform", a.transformType = "-ms-transform", a.transitionType = "msTransition", void 0 === b.msTransform && (a.animType = !1)), void 0 !== b.transform && a.animType !== !1 && (a.animType = "transform", a.transformType = "transform", a.transitionType = "transition"), a.transformsEnabled = null !== a.animType && a.animType !== !1 }, b.prototype.setSlideClasses = function (a) { var c, d, e, f, b = this; b.$slider.find(".hawkslick-slide").removeClass("hawkslick-active").removeClass("hawkslick-center"), d = b.$slider.find(".hawkslick-slide"), b.options.centerMode === !0 ? (c = Math.floor(b.options.slidesToShow / 2), b.options.infinite === !0 && (a >= c && a <= b.slideCount - 1 - c ? b.$slides.slice(a - c, a + c + 1).addClass("hawkslick-active") : (e = b.options.slidesToShow + a, d.slice(e - c + 1, e + c + 2).addClass("hawkslick-active")), 0 === a ? d.eq(d.length - 1 - b.options.slidesToShow).addClass("hawkslick-center") : a === b.slideCount - 1 && d.eq(b.options.slidesToShow).addClass("hawkslick-center")), b.$slides.eq(a).addClass("hawkslick-center")) : a >= 0 && a <= b.slideCount - b.options.slidesToShow ? b.$slides.slice(a, a + b.options.slidesToShow).addClass("hawkslick-active") : d.length <= b.options.slidesToShow ? d.addClass("hawkslick-active") : (f = b.slideCount % b.options.slidesToShow, e = b.options.infinite === !0 ? b.options.slidesToShow + a : a, b.options.slidesToShow == b.options.slidesToScroll && b.slideCount - a < b.options.slidesToShow ? d.slice(e - (b.options.slidesToShow - f), e + f).addClass("hawkslick-active") : d.slice(e, e + b.options.slidesToShow).addClass("hawkslick-active")), "ondemand" === b.options.lazyLoad && b.lazyLoad() }, b.prototype.setupInfinite = function () { var c, d, e, b = this; if (b.options.fade === !0 && (b.options.centerMode = !1), b.options.infinite === !0 && b.options.fade === !1 && (d = null, b.slideCount > b.options.slidesToShow)) { for (e = b.options.centerMode === !0 ? b.options.slidesToShow + 1 : b.options.slidesToShow, c = b.slideCount; c > b.slideCount - e; c -= 1) d = c - 1, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-hawkslick-index", d - b.slideCount).prependTo(b.$slideTrack).addClass("hawkslick-cloned"); for (c = 0; e > c; c += 1) d = c, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-hawkslick-index", d + b.slideCount).appendTo(b.$slideTrack).addClass("hawkslick-cloned"); b.$slideTrack.find(".hawkslick-cloned").find("[id]").each(function () { a(this).attr("id", "") }) } }, b.prototype.selectHandler = function (b) { var c = this, d = parseInt(a(b.target).parents(".hawkslick-slide").attr("data-hawkslick-index")); return d || (d = 0), c.slideCount <= c.options.slidesToShow ? (c.$slider.find(".hawkslick-slide").removeClass("hawkslick-active"), c.$slides.eq(d).addClass("hawkslick-active"), c.options.centerMode === !0 && (c.$slider.find(".hawkslick-slide").removeClass("hawkslick-center"), c.$slides.eq(d).addClass("hawkslick-center")), c.asNavFor(d), void 0) : (c.slideHandler(d), void 0) }, b.prototype.slideHandler = function (a, b, c) { var d, e, f, g, h = null, i = this; return b = b || !1, i.animating === !0 && i.options.waitForAnimate === !0 || i.options.fade === !0 && i.currentSlide === a || i.slideCount <= i.options.slidesToShow ? void 0 : (b === !1 && i.asNavFor(a), d = a, h = i.getLeft(d), g = i.getLeft(i.currentSlide), i.currentLeft = null === i.swipeLeft ? g : i.swipeLeft, i.options.infinite === !1 && i.options.centerMode === !1 && (0 > a || a > i.getDotCount() * i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, c !== !0 ? i.animateSlide(g, function () { i.postSlide(d) }) : i.postSlide(d)), void 0) : i.options.infinite === !1 && i.options.centerMode === !0 && (0 > a || a > i.slideCount - i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, c !== !0 ? i.animateSlide(g, function () { i.postSlide(d) }) : i.postSlide(d)), void 0) : (i.options.autoplay === !0 && clearInterval(i.autoPlayTimer), e = 0 > d ? 0 !== i.slideCount % i.options.slidesToScroll ? i.slideCount - i.slideCount % i.options.slidesToScroll : i.slideCount + d : d >= i.slideCount ? 0 !== i.slideCount % i.options.slidesToScroll ? 0 : d - i.slideCount : d, i.animating = !0, i.$slider.trigger("beforeChange", [i, i.currentSlide, e]), f = i.currentSlide, i.currentSlide = e, i.setSlideClasses(i.currentSlide), i.updateDots(), i.updateArrows(), i.options.fade === !0 ? (c !== !0 ? i.fadeSlide(e, function () { i.postSlide(e) }) : i.postSlide(e), i.animateHeight(), void 0) : (c !== !0 ? i.animateSlide(h, function () { i.postSlide(e) }) : i.postSlide(e), void 0))) }, b.prototype.startLoad = function () { var a = this; a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.hide(), a.$nextArrow.hide()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.hide(), a.$slider.addClass("hawkslick-loading") }, b.prototype.swipeDirection = function () { var a, b, c, d, e = this; return a = e.touchObject.startX - e.touchObject.curX, b = e.touchObject.startY - e.touchObject.curY, c = Math.atan2(b, a), d = Math.round(180 * c / Math.PI), 0 > d && (d = 360 - Math.abs(d)), 45 >= d && d >= 0 ? e.options.rtl === !1 ? "left" : "right" : 360 >= d && d >= 315 ? e.options.rtl === !1 ? "left" : "right" : d >= 135 && 225 >= d ? e.options.rtl === !1 ? "right" : "left" : "vertical" }, b.prototype.swipeEnd = function () { var c, b = this; if (b.dragging = !1, b.shouldClick = b.touchObject.swipeLength > 10 ? !1 : !0, void 0 === b.touchObject.curX) return !1; if (b.touchObject.edgeHit === !0 && b.$slider.trigger("edge", [b, b.swipeDirection()]), b.touchObject.swipeLength >= b.touchObject.minSwipe) switch (b.swipeDirection()) { case "left": c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide + b.getSlideCount()) : b.currentSlide + b.getSlideCount(), b.slideHandler(c), b.currentDirection = 0, b.touchObject = {}, b.$slider.trigger("swipe", [b, "left"]); break; case "right": c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide - b.getSlideCount()) : b.currentSlide - b.getSlideCount(), b.slideHandler(c), b.currentDirection = 1, b.touchObject = {}, b.$slider.trigger("swipe", [b, "right"]) } else b.touchObject.startX !== b.touchObject.curX && (b.slideHandler(b.currentSlide), b.touchObject = {}) }, b.prototype.swipeHandler = function (a) { var b = this; if (!(b.options.swipe === !1 || "ontouchend" in document && b.options.swipe === !1 || b.options.draggable === !1 && -1 !== a.type.indexOf("mouse"))) switch (b.touchObject.fingerCount = a.originalEvent && void 0 !== a.originalEvent.touches ? a.originalEvent.touches.length : 1, b.touchObject.minSwipe = b.listWidth / b.options.touchThreshold, a.data.action) { case "start": b.swipeStart(a); break; case "move": b.swipeMove(a); break; case "end": b.swipeEnd(a) } }, b.prototype.swipeMove = function (a) { var d, e, f, g, h, b = this; return h = void 0 !== a.originalEvent ? a.originalEvent.touches : null, !b.dragging || h && 1 !== h.length ? !1 : (d = b.getLeft(b.currentSlide), b.touchObject.curX = void 0 !== h ? h[0].pageX : a.clientX, b.touchObject.curY = void 0 !== h ? h[0].pageY : a.clientY, b.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(b.touchObject.curX - b.touchObject.startX, 2))), e = b.swipeDirection(), "vertical" !== e ? (void 0 !== a.originalEvent && b.touchObject.swipeLength > 4 && a.preventDefault(), g = (b.options.rtl === !1 ? 1 : -1) * (b.touchObject.curX > b.touchObject.startX ? 1 : -1), f = b.touchObject.swipeLength, b.touchObject.edgeHit = !1, b.options.infinite === !1 && (0 === b.currentSlide && "right" === e || b.currentSlide >= b.getDotCount() && "left" === e) && (f = b.touchObject.swipeLength * b.options.edgeFriction, b.touchObject.edgeHit = !0), b.swipeLeft = b.options.vertical === !1 ? d + f * g : d + f * (b.$list.height() / b.listWidth) * g, b.options.fade === !0 || b.options.touchMove === !1 ? !1 : b.animating === !0 ? (b.swipeLeft = null, !1) : (b.setCSS(b.swipeLeft), void 0)) : void 0) }, b.prototype.swipeStart = function (a) { var c, b = this; return 1 !== b.touchObject.fingerCount || b.slideCount <= b.options.slidesToShow ? (b.touchObject = {}, !1) : (void 0 !== a.originalEvent && void 0 !== a.originalEvent.touches && (c = a.originalEvent.touches[0]), b.touchObject.startX = b.touchObject.curX = void 0 !== c ? c.pageX : a.clientX, b.touchObject.startY = b.touchObject.curY = void 0 !== c ? c.pageY : a.clientY, b.dragging = !0, void 0) }, b.prototype.unfilterSlides = b.prototype.hawkslickUnfilter = function () { var a = this; null !== a.$slidesCache && (a.unload(), a.$slideTrack.children(this.options.slide).detach(), a.$slidesCache.appendTo(a.$slideTrack), a.reinit()) }, b.prototype.unload = function () { var b = this; a(".hawkslick-cloned", b.$slider).remove(), b.$dots && b.$dots.remove(), b.$prevArrow && "object" != typeof b.options.prevArrow && b.$prevArrow.remove(), b.$nextArrow && "object" != typeof b.options.nextArrow && b.$nextArrow.remove(), b.$slides.removeClass("hawkslick-slide hawkslick-active hawkslick-visible").css("width", "") }, b.prototype.unhawkslick = function () { var a = this; a.destroy() }, b.prototype.updateArrows = function () {
                    var b, a = this; b = Math.floor(a.options.slidesToShow / 2), a.options.arrows === !0 && a.options.infinite !== !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.removeClass("hawkslick-disabled"), a.$nextArrow.removeClass("hawkslick-disabled"), 0 === a.currentSlide ? (a.$prevArrow.addClass("hawkslick-disabled"), a.$nextArrow.removeClass("hawkslick-disabled")) : a.currentSlide >= a.slideCount - a.options.slidesToShow && a.options.centerMode === !1 ? (a.$nextArrow.addClass("hawkslick-disabled"), a.$prevArrow.removeClass("hawkslick-disabled")) : a.currentSlide >= a.slideCount - 1 && a.options.centerMode === !0 && (a.$nextArrow.addClass("hawkslick-disabled"), a.$prevArrow.removeClass("hawkslick-disabled")))
                }, b.prototype.updateDots = function () { var a = this; null !== a.$dots && (a.$dots.find("li").removeClass("hawkslick-active"), a.$dots.find("li").eq(Math.floor(a.currentSlide / a.options.slidesToScroll)).addClass("hawkslick-active")) }, b.prototype.visibility = function () { var a = this; document[a.hidden] ? (a.paused = !0, a.autoPlayClear()) : (a.paused = !1, a.autoPlay()) }, a.fn.hawkslick = function () { var g, a = this, c = arguments[0], d = Array.prototype.slice.call(arguments, 1), e = a.length, f = 0; for (f; e > f; f++) if ("object" == typeof c || "undefined" == typeof c ? a[f].hawkslick = new b(a[f], c) : g = a[f].hawkslick[c].apply(a[f].hawkslick, d), "undefined" != typeof g) return g; return a }, a(function () { a("[data-hawkslick]").hawkslick() })
            });
        }

        /*
         *
         * Copyright (c) 2006-2011 Sam Collett (http://www.texotela.co.uk)
         * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
         * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
         *
         * Version 1.3
        * demo: http://www.texotela.co.uk/code/jquery/numeric/
         *
         */
        if (HawkSearch.loadPlugins.numeric == true) {
            (function (e) { e.fn.numeric = function (t, n) { if (typeof t === "boolean") { t = { decimal: t } } t = t || {}; if (typeof t.negative == "undefined") t.negative = true; var r = t.decimal === false ? "" : t.decimal || "."; var i = t.negative === true ? true : false; var n = typeof n == "function" ? n : function () { }; return this.data("numeric.decimal", r).data("numeric.negative", i).data("numeric.callback", n).keypress(e.fn.numeric.keypress).keyup(e.fn.numeric.keyup).blur(e.fn.numeric.blur) }; e.fn.numeric.keypress = function (t) { var n = e.data(this, "numeric.decimal"); var r = e.data(this, "numeric.negative"); var i = t.charCode ? t.charCode : t.keyCode ? t.keyCode : 0; if (i == 13 && this.nodeName.toLowerCase() == "input") { return true } else if (i == 13) { return false } var s = false; if (t.ctrlKey && i == 97 || t.ctrlKey && i == 65) return true; if (t.ctrlKey && i == 120 || t.ctrlKey && i == 88) return true; if (t.ctrlKey && i == 99 || t.ctrlKey && i == 67) return true; if (t.ctrlKey && i == 122 || t.ctrlKey && i == 90) return true; if (t.ctrlKey && i == 118 || t.ctrlKey && i == 86 || t.shiftKey && i == 45) return true; if (i < 48 || i > 57) { if (this.value.indexOf("-") != 0 && r && i == 45 && (this.value.length == 0 || e.fn.getSelectionStart(this) == 0)) return true; if (n && i == n.charCodeAt(0) && this.value.indexOf(n) != -1) { s = false } if (i != 8 && i != 9 && i != 13 && i != 35 && i != 36 && i != 37 && i != 39 && i != 46) { s = false } else { if (typeof t.charCode != "undefined") { if (t.keyCode == t.which && t.which != 0) { s = true; if (t.which == 46) s = false } else if (t.keyCode != 0 && t.charCode == 0 && t.which == 0) { s = true } } } if (n && i == n.charCodeAt(0)) { if (this.value.indexOf(n) == -1) { s = true } else { s = false } } } else { s = true } return s }; e.fn.numeric.keyup = function (t) { var n = this.value; if (n.length > 0) { var r = e.fn.getSelectionStart(this); var i = e.data(this, "numeric.decimal"); var s = e.data(this, "numeric.negative"); if (i != "") { var o = n.indexOf(i); if (o == 0) { this.value = "0" + n } if (o == 1 && n.charAt(0) == "-") { this.value = "-0" + n.substring(1) } n = this.value } var u = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "-", i]; var a = n.length; for (var f = a - 1; f >= 0; f--) { var l = n.charAt(f); if (f != 0 && l == "-") { n = n.substring(0, f) + n.substring(f + 1) } else if (f == 0 && !s && l == "-") { n = n.substring(1) } var c = false; for (var h = 0; h < u.length; h++) { if (l == u[h]) { c = true; break } } if (!c || l == " ") { n = n.substring(0, f) + n.substring(f + 1) } } var p = n.indexOf(i); if (p > 0) { for (var f = a - 1; f > p; f--) { var l = n.charAt(f); if (l == i) { n = n.substring(0, f) + n.substring(f + 1) } } } this.value = n; e.fn.setSelection(this, r) } }; e.fn.numeric.blur = function () { var t = e.data(this, "numeric.decimal"); var n = e.data(this, "numeric.callback"); var r = this.value; if (r != "") { var i = new RegExp("^\\d+$|\\d*" + t + "\\d+"); if (!i.exec(r)) { n.apply(this) } } }; e.fn.removeNumeric = function () { return this.data("numeric.decimal", null).data("numeric.negative", null).data("numeric.callback", null).unbind("keypress", e.fn.numeric.keypress).unbind("blur", e.fn.numeric.blur) }; e.fn.getSelectionStart = function (e) { if (e.createTextRange) { var t = document.selection.createRange().duplicate(); t.moveEnd("character", e.value.length); if (t.text == "") return e.value.length; return e.value.lastIndexOf(t.text) } else return e.selectionStart }; e.fn.setSelection = function (e, t) { if (typeof t == "number") t = [t, t]; if (t && t.constructor == Array && t.length == 2) { if (e.createTextRange) { var n = e.createTextRange(); n.collapse(true); n.moveStart("character", t[0]); n.moveEnd("character", t[1]); n.select() } else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(t[0], t[1]) } } } })(jQuery)
        }
        /*! waitForImages jQuery Plugin 2013-07-20 */
        if (HawkSearch.loadPlugins.waitForImages == true) {
            !function (a) { var b = "waitForImages"; a.waitForImages = { hasImageProperties: ["backgroundImage", "listStyleImage", "borderImage", "borderCornerImage", "cursor"] }, a.expr[":"].uncached = function (b) { if (!a(b).is('img[src!=""]')) return !1; var c = new Image; return c.src = b.src, !c.complete }, a.fn.waitForImages = function (c, d, e) { var f = 0, g = 0; if (a.isPlainObject(arguments[0]) && (e = arguments[0].waitForAll, d = arguments[0].each, c = arguments[0].finished), c = c || a.noop, d = d || a.noop, e = !!e, !a.isFunction(c) || !a.isFunction(d)) throw new TypeError("An invalid callback was supplied."); return this.each(function () { var h = a(this), i = [], j = a.waitForImages.hasImageProperties || [], k = /url\(\s*(['"]?)(.*?)\1\s*\)/g; e ? h.find("*").addBack().each(function () { var b = a(this); b.is("img:uncached") && i.push({ src: b.attr("src"), element: b[0] }), a.each(j, function (a, c) { var d, e = b.css(c); if (!e) return !0; for (; d = k.exec(e);) i.push({ src: d[2], element: b[0] }) }) }) : h.find("img:uncached").each(function () { i.push({ src: this.src, element: this }) }), f = i.length, g = 0, 0 === f && c.call(h[0]), a.each(i, function (e, i) { var j = new Image; a(j).on("load." + b + " error." + b, function (a) { return g++ , d.call(i.element, g, f, "load" == a.type), g == f ? (c.call(h[0]), !1) : void 0 }), j.src = i.src }) }) } }(jQuery);
        }

        !function (a, b) { "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b() }(this, function () {
            "use strict"; function a() {
                return Dc.apply(null, arguments)
            } function b(a) {
                Dc = a
            } function c(a) {
                return "[object Array]" === Object.prototype.toString.call(a)
            } function d(a) {
                return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a)
            } function e(a, b) {
                var c, d = []; for (c = 0; c < a.length; ++c) d.push(b(a[c], c)); return d
            } function f(a, b) {
                return Object.prototype.hasOwnProperty.call(a, b)
            } function g(a, b) {
                for (var c in b) f(b, c) && (a[c] = b[c]); return f(b, "toString") && (a.toString = b.toString), f(b, "valueOf") && (a.valueOf = b.valueOf), a
            } function h(a, b, c, d) {
                return za(a, b, c, d, !0).utc()
            } function i() {
                return { empty: !1, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: !1, invalidMonth: null, invalidFormat: !1, userInvalidated: !1, iso: !1 }
            } function j(a) {
                return null == a._pf && (a._pf = i()), a._pf
            } function k(a) {
                if (null == a._isValid) { var b = j(a); a._isValid = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.nullInput && !b.invalidFormat && !b.userInvalidated, a._strict && (a._isValid = a._isValid && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour) } return a._isValid
            } function l(a) {
                var b = h(0 / 0); return null != a ? g(j(b), a) : j(b).userInvalidated = !0, b
            } function m(a, b) {
                var c, d, e; if ("undefined" != typeof b._isAMomentObject && (a._isAMomentObject = b._isAMomentObject), "undefined" != typeof b._i && (a._i = b._i), "undefined" != typeof b._f && (a._f = b._f), "undefined" != typeof b._l && (a._l = b._l), "undefined" != typeof b._strict && (a._strict = b._strict), "undefined" != typeof b._tzm && (a._tzm = b._tzm), "undefined" != typeof b._isUTC && (a._isUTC = b._isUTC), "undefined" != typeof b._offset && (a._offset = b._offset), "undefined" != typeof b._pf && (a._pf = j(b)), "undefined" != typeof b._locale && (a._locale = b._locale), Fc.length > 0) for (c in Fc) d = Fc[c], e = b[d], "undefined" != typeof e && (a[d] = e); return a
            } function n(b) {
                m(this, b), this._d = new Date(+b._d), Gc === !1 && (Gc = !0, a.updateOffset(this), Gc = !1)
            } function o(a) {
                return a instanceof n || null != a && null != a._isAMomentObject
            } function p(a) {
                var b = +a, c = 0; return 0 !== b && isFinite(b) && (c = b >= 0 ? Math.floor(b) : Math.ceil(b)), c
            } function q(a, b, c) {
                var d, e = Math.min(a.length, b.length), f = Math.abs(a.length - b.length), g = 0; for (d = 0; e > d; d++) (c && a[d] !== b[d] || !c && p(a[d]) !== p(b[d])) && g++; return g + f
            } function r() {
            } function s(a) {
                return a ? a.toLowerCase().replace("_", "-") : a
            } function t(a) {
                for (var b, c, d, e, f = 0; f < a.length;) { for (e = s(a[f]).split("-"), b = e.length, c = s(a[f + 1]), c = c ? c.split("-") : null; b > 0;) { if (d = u(e.slice(0, b).join("-"))) return d; if (c && c.length >= b && q(e, c, !0) >= b - 1) break; b-- } f++ } return null
            } function u(a) {
                var b = null; if (!Hc[a] && "undefined" != typeof module && module && module.exports) try { b = Ec._abbr, require("./locale/" + a), v(b) } catch (c) { } return Hc[a]
            } function v(a, b) {
                var c; return a && (c = "undefined" == typeof b ? x(a) : w(a, b), c && (Ec = c)), Ec._abbr
            } function w(a, b) {
                return null !== b ? (b.abbr = a, Hc[a] || (Hc[a] = new r), Hc[a].set(b), v(a), Hc[a]) : (delete Hc[a], null)
            } function x(a) {
                var b; if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return Ec; if (!c(a)) { if (b = u(a)) return b; a = [a] } return t(a)
            } function y(a, b) {
                var c = a.toLowerCase(); Ic[c] = Ic[c + "s"] = Ic[b] = a
            } function z(a) {
                return "string" == typeof a ? Ic[a] || Ic[a.toLowerCase()] : void 0
            } function A(a) {
                var b, c, d = {}; for (c in a) f(a, c) && (b = z(c), b && (d[b] = a[c])); return d
            } function B(b, c) {
                return function (d) { return null != d ? (D(this, b, d), a.updateOffset(this, c), this) : C(this, b) }
            } function C(a, b) {
                return a._d["get" + (a._isUTC ? "UTC" : "") + b]()
            } function D(a, b, c) {
                return a._d["set" + (a._isUTC ? "UTC" : "") + b](c)
            } function E(a, b) {
                var c; if ("object" == typeof a) for (c in a) this.set(c, a[c]); else if (a = z(a), "function" == typeof this[a]) return this[a](b); return this
            } function F(a, b, c) {
                for (var d = "" + Math.abs(a), e = a >= 0; d.length < b;) d = "0" + d; return (e ? c ? "+" : "" : "-") + d
            } function G(a, b, c, d) {
                var e = d; "string" == typeof d && (e = function () { return this[d]() }), a && (Mc[a] = e), b && (Mc[b[0]] = function () { return F(e.apply(this, arguments), b[1], b[2]) }), c && (Mc[c] = function () { return this.localeData().ordinal(e.apply(this, arguments), a) })
            } function H(a) {
                return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "")
            } function I(a) {
                var b, c, d = a.match(Jc); for (b = 0, c = d.length; c > b; b++) Mc[d[b]] ? d[b] = Mc[d[b]] : d[b] = H(d[b]); return function (e) { var f = ""; for (b = 0; c > b; b++) f += d[b] instanceof Function ? d[b].call(e, a) : d[b]; return f }
            } function J(a, b) {
                return a.isValid() ? (b = K(b, a.localeData()), Lc[b] || (Lc[b] = I(b)), Lc[b](a)) : a.localeData().invalidDate()
            } function K(a, b) {
                function c(a) { return b.longDateFormat(a) || a } var d = 5; for (Kc.lastIndex = 0; d >= 0 && Kc.test(a);) a = a.replace(Kc, c), Kc.lastIndex = 0, d -= 1; return a
            } function L(a, b, c) {
                _c[a] = "function" == typeof b ? b : function (a) { return a && c ? c : b }
            } function M(a, b) {
                return f(_c, a) ? _c[a](b._strict, b._locale) : new RegExp(N(a))
            } function N(a) {
                return a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (a, b, c, d, e) { return b || c || d || e }).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
            } function O(a, b) {
                var c, d = b; for ("string" == typeof a && (a = [a]), "number" == typeof b && (d = function (a, c) { c[b] = p(a) }), c = 0; c < a.length; c++) ad[a[c]] = d
            } function P(a, b) {
                O(a, function (a, c, d, e) { d._w = d._w || {}, b(a, d._w, d, e) })
            } function Q(a, b, c) {
                null != b && f(ad, a) && ad[a](b, c._a, c, a)
            } function R(a, b) {
                return new Date(Date.UTC(a, b + 1, 0)).getUTCDate()
            } function S(a) {
                return this._months[a.month()]
            } function T(a) {
                return this._monthsShort[a.month()]
            } function U(a, b, c) {
                var d, e, f; for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; 12 > d; d++) { if (e = h([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d; if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d; if (!c && this._monthsParse[d].test(a)) return d }
            } function V(a, b) {
                var c; return "string" == typeof b && (b = a.localeData().monthsParse(b), "number" != typeof b) ? a : (c = Math.min(a.date(), R(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a)
            } function W(b) {
                return null != b ? (V(this, b), a.updateOffset(this, !0), this) : C(this, "Month")
            } function X() {
                return R(this.year(), this.month())
            } function Y(a) {
                var b, c = a._a; return c && -2 === j(a).overflow && (b = c[cd] < 0 || c[cd] > 11 ? cd : c[dd] < 1 || c[dd] > R(c[bd], c[cd]) ? dd : c[ed] < 0 || c[ed] > 24 || 24 === c[ed] && (0 !== c[fd] || 0 !== c[gd] || 0 !== c[hd]) ? ed : c[fd] < 0 || c[fd] > 59 ? fd : c[gd] < 0 || c[gd] > 59 ? gd : c[hd] < 0 || c[hd] > 999 ? hd : -1, j(a)._overflowDayOfYear && (bd > b || b > dd) && (b = dd), j(a).overflow = b), a
            } function Z(b) {
                a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b)
            } function $(a, b) {
                var c = !0, d = a + "\n" + (new Error).stack; return g(function () { return c && (Z(d), c = !1), b.apply(this, arguments) }, b)
            } function _(a, b) {
                kd[a] || (Z(b), kd[a] = !0)
            } function aa(a) {
                var b, c, d = a._i, e = ld.exec(d); if (e) { for (j(a).iso = !0, b = 0, c = md.length; c > b; b++) if (md[b][1].exec(d)) { a._f = md[b][0] + (e[6] || " "); break } for (b = 0, c = nd.length; c > b; b++) if (nd[b][1].exec(d)) { a._f += nd[b][0]; break } d.match(Yc) && (a._f += "Z"), ta(a) } else a._isValid = !1
            } function ba(b) {
                var c = od.exec(b._i); return null !== c ? void (b._d = new Date(+c[1])) : (aa(b), void (b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b))))
            } function ca(a, b, c, d, e, f, g) {
                var h = new Date(a, b, c, d, e, f, g); return 1970 > a && h.setFullYear(a), h
            } function da(a) {
                var b = new Date(Date.UTC.apply(null, arguments)); return 1970 > a && b.setUTCFullYear(a), b
            } function ea(a) {
                return fa(a) ? 366 : 365
            } function fa(a) {
                return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0
            } function ga() {
                return fa(this.year())
            } function ha(a, b, c) {
                var d, e = c - b, f = c - a.day(); return f > e && (f -= 7), e - 7 > f && (f += 7), d = Aa(a).add(f, "d"), { week: Math.ceil(d.dayOfYear() / 7), year: d.year() }
            } function ia(a) {
                return ha(a, this._week.dow, this._week.doy).week
            } function ja() {
                return this._week.dow
            } function ka() {
                return this._week.doy
            } function la(a) {
                var b = this.localeData().week(this); return null == a ? b : this.add(7 * (a - b), "d")
            } function ma(a) {
                var b = ha(this, 1, 4).week; return null == a ? b : this.add(7 * (a - b), "d")
            } function na(a, b, c, d, e) {
                var f, g, h = da(a, 0, 1).getUTCDay(); return h = 0 === h ? 7 : h, c = null != c ? c : e, f = e - h + (h > d ? 7 : 0) - (e > h ? 7 : 0), g = 7 * (b - 1) + (c - e) + f + 1, { year: g > 0 ? a : a - 1, dayOfYear: g > 0 ? g : ea(a - 1) + g }
            } function oa(a) {
                var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1; return null == a ? b : this.add(a - b, "d")
            } function pa(a, b, c) {
                return null != a ? a : null != b ? b : c
            } function qa(a) {
                var b = new Date; return a._useUTC ? [b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()] : [b.getFullYear(), b.getMonth(), b.getDate()]
            } function ra(a) {
                var b, c, d, e, f = []; if (!a._d) { for (d = qa(a), a._w && null == a._a[dd] && null == a._a[cd] && sa(a), a._dayOfYear && (e = pa(a._a[bd], d[bd]), a._dayOfYear > ea(e) && (j(a)._overflowDayOfYear = !0), c = da(e, 0, a._dayOfYear), a._a[cd] = c.getUTCMonth(), a._a[dd] = c.getUTCDate()), b = 0; 3 > b && null == a._a[b]; ++b) a._a[b] = f[b] = d[b]; for (; 7 > b; b++) a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b]; 24 === a._a[ed] && 0 === a._a[fd] && 0 === a._a[gd] && 0 === a._a[hd] && (a._nextDay = !0, a._a[ed] = 0), a._d = (a._useUTC ? da : ca).apply(null, f), null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[ed] = 24) }
            } function sa(a) {
                var b, c, d, e, f, g, h; b = a._w, null != b.GG || null != b.W || null != b.E ? (f = 1, g = 4, c = pa(b.GG, a._a[bd], ha(Aa(), 1, 4).year), d = pa(b.W, 1), e = pa(b.E, 1)) : (f = a._locale._week.dow, g = a._locale._week.doy, c = pa(b.gg, a._a[bd], ha(Aa(), f, g).year), d = pa(b.w, 1), null != b.d ? (e = b.d, f > e && ++d) : e = null != b.e ? b.e + f : f), h = na(c, d, e, g, f), a._a[bd] = h.year, a._dayOfYear = h.dayOfYear
            } function ta(b) {
                if (b._f === a.ISO_8601) return void aa(b); b._a = [], j(b).empty = !0; var c, d, e, f, g, h = "" + b._i, i = h.length, k = 0; for (e = K(b._f, b._locale).match(Jc) || [], c = 0; c < e.length; c++) f = e[c], d = (h.match(M(f, b)) || [])[0], d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && j(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), k += d.length), Mc[f] ? (d ? j(b).empty = !1 : j(b).unusedTokens.push(f), Q(f, d, b)) : b._strict && !d && j(b).unusedTokens.push(f); j(b).charsLeftOver = i - k, h.length > 0 && j(b).unusedInput.push(h), j(b).bigHour === !0 && b._a[ed] <= 12 && b._a[ed] > 0 && (j(b).bigHour = void 0), b._a[ed] = ua(b._locale, b._a[ed], b._meridiem), ra(b), Y(b)
            } function ua(a, b, c) {
                var d; return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && 12 > b && (b += 12), d || 12 !== b || (b = 0), b) : b
            } function va(a) {
                var b, c, d, e, f; if (0 === a._f.length) return j(a).invalidFormat = !0, void (a._d = new Date(0 / 0)); for (e = 0; e < a._f.length; e++) f = 0, b = m({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], ta(b), k(b) && (f += j(b).charsLeftOver, f += 10 * j(b).unusedTokens.length, j(b).score = f, (null == d || d > f) && (d = f, c = b)); g(a, c || b)
            } function wa(a) {
                if (!a._d) { var b = A(a._i); a._a = [b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], ra(a) }
            } function xa(a) {
                var b, e = a._i, f = a._f; return a._locale = a._locale || x(a._l), null === e || void 0 === f && "" === e ? l({ nullInput: !0 }) : ("string" == typeof e && (a._i = e = a._locale.preparse(e)), o(e) ? new n(Y(e)) : (c(f) ? va(a) : f ? ta(a) : d(e) ? a._d = e : ya(a), b = new n(Y(a)), b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b))
            } function ya(b) {
                var f = b._i; void 0 === f ? b._d = new Date : d(f) ? b._d = new Date(+f) : "string" == typeof f ? ba(b) : c(f) ? (b._a = e(f.slice(0), function (a) { return parseInt(a, 10) }), ra(b)) : "object" == typeof f ? wa(b) : "number" == typeof f ? b._d = new Date(f) : a.createFromInputFallback(b)
            } function za(a, b, c, d, e) {
                var f = {}; return "boolean" == typeof c && (d = c, c = void 0), f._isAMomentObject = !0, f._useUTC = f._isUTC = e, f._l = c, f._i = a, f._f = b, f._strict = d, xa(f)
            } function Aa(a, b, c, d) {
                return za(a, b, c, d, !1)
            } function Ba(a, b) {
                var d, e; if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return Aa(); for (d = b[0], e = 1; e < b.length; ++e) b[e][a](d) && (d = b[e]); return d
            } function Ca() {
                var a = [].slice.call(arguments, 0); return Ba("isBefore", a)
            } function Da() {
                var a = [].slice.call(arguments, 0); return Ba("isAfter", a)
            } function Ea(a) {
                var b = A(a), c = b.year || 0, d = b.quarter || 0, e = b.month || 0, f = b.week || 0, g = b.day || 0, h = b.hour || 0, i = b.minute || 0, j = b.second || 0, k = b.millisecond || 0; this._milliseconds = +k + 1e3 * j + 6e4 * i + 36e5 * h, this._days = +g + 7 * f, this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = x(), this._bubble()
            } function Fa(a) {
                return a instanceof Ea
            } function Ga(a, b) {
                G(a, 0, 0, function () { var a = this.utcOffset(), c = "+"; return 0 > a && (a = -a, c = "-"), c + F(~~(a / 60), 2) + b + F(~~a % 60, 2) })
            } function Ha(a) {
                var b = (a || "").match(Yc) || [], c = b[b.length - 1] || [], d = (c + "").match(td) || ["-", 0, 0], e = +(60 * d[1]) + p(d[2]); return "+" === d[0] ? e : -e
            } function Ia(b, c) {
                var e, f; return c._isUTC ? (e = c.clone(), f = (o(b) || d(b) ? +b : +Aa(b)) - +e, e._d.setTime(+e._d + f), a.updateOffset(e, !1), e) : Aa(b).local(); return c._isUTC ? Aa(b).zone(c._offset || 0) : Aa(b).local()
            } function Ja(a) {
                return 15 * -Math.round(a._d.getTimezoneOffset() / 15)
            } function Ka(b, c) {
                var d, e = this._offset || 0; return null != b ? ("string" == typeof b && (b = Ha(b)), Math.abs(b) < 16 && (b = 60 * b), !this._isUTC && c && (d = Ja(this)), this._offset = b, this._isUTC = !0, null != d && this.add(d, "m"), e !== b && (!c || this._changeInProgress ? $a(this, Va(b - e, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this) : this._isUTC ? e : Ja(this)
            } function La(a, b) {
                return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset()
            } function Ma(a) {
                return this.utcOffset(0, a)
            } function Na(a) {
                return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Ja(this), "m")), this
            } function Oa() {
                return this._tzm ? this.utcOffset(this._tzm) : "string" == typeof this._i && this.utcOffset(Ha(this._i)), this
            } function Pa(a) {
                return a = a ? Aa(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0
            } function Qa() {
                return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset()
            } function Ra() {
                if (this._a) { var a = this._isUTC ? h(this._a) : Aa(this._a); return this.isValid() && q(this._a, a.toArray()) > 0 } return !1
            } function Sa() {
                return !this._isUTC
            } function Ta() {
                return this._isUTC
            } function Ua() {
                return this._isUTC && 0 === this._offset
            } function Va(a, b) {
                var c, d, e, g = a, h = null; return Fa(a) ? g = { ms: a._milliseconds, d: a._days, M: a._months } : "number" == typeof a ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = ud.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: 0, d: p(h[dd]) * c, h: p(h[ed]) * c, m: p(h[fd]) * c, s: p(h[gd]) * c, ms: p(h[hd]) * c }) : (h = vd.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: Wa(h[2], c), M: Wa(h[3], c), d: Wa(h[4], c), h: Wa(h[5], c), m: Wa(h[6], c), s: Wa(h[7], c), w: Wa(h[8], c) }) : null == g ? g = {} : "object" == typeof g && ("from" in g || "to" in g) && (e = Ya(Aa(g.from), Aa(g.to)), g = {}, g.ms = e.milliseconds, g.M = e.months), d = new Ea(g), Fa(a) && f(a, "_locale") && (d._locale = a._locale), d
            } function Wa(a, b) {
                var c = a && parseFloat(a.replace(",", ".")); return (isNaN(c) ? 0 : c) * b
            } function Xa(a, b) {
                var c = { milliseconds: 0, months: 0 }; return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c
            } function Ya(a, b) {
                var c; return b = Ia(b, a), a.isBefore(b) ? c = Xa(a, b) : (c = Xa(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c
            } function Za(a, b) {
                return function (c, d) { var e, f; return null === d || isNaN(+d) || (_(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period)."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = Va(c, d), $a(this, e, a), this }
            } function $a(b, c, d, e) {
                var f = c._milliseconds, g = c._days, h = c._months; e = null == e ? !0 : e, f && b._d.setTime(+b._d + f * d), g && D(b, "Date", C(b, "Date") + g * d), h && V(b, C(b, "Month") + h * d), e && a.updateOffset(b, g || h)
            } function _a(a) {
                var b = a || Aa(), c = Ia(b, this).startOf("day"), d = this.diff(c, "days", !0), e = -6 > d ? "sameElse" : -1 > d ? "lastWeek" : 0 > d ? "lastDay" : 1 > d ? "sameDay" : 2 > d ? "nextDay" : 7 > d ? "nextWeek" : "sameElse"; return this.format(this.localeData().calendar(e, this, Aa(b)))
            } function ab() {
                return new n(this)
            } function bb(a, b) {
                var c; return b = z("undefined" != typeof b ? b : "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +this > +a) : (c = o(a) ? +a : +Aa(a), c < +this.clone().startOf(b))
            } function cb(a, b) {
                var c; return b = z("undefined" != typeof b ? b : "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +a > +this) : (c = o(a) ? +a : +Aa(a), +this.clone().endOf(b) < c)
            } function db(a, b, c) {
                return this.isAfter(a, c) && this.isBefore(b, c)
            } function eb(a, b) {
                var c; return b = z(b || "millisecond"), "millisecond" === b ? (a = o(a) ? a : Aa(a), +this === +a) : (c = +Aa(a), +this.clone().startOf(b) <= c && c <= +this.clone().endOf(b))
            } function fb(a) {
                return 0 > a ? Math.ceil(a) : Math.floor(a)
            } function gb(a, b, c) {
                var d, e, f = Ia(a, this), g = 6e4 * (f.utcOffset() - this.utcOffset()); return b = z(b), "year" === b || "month" === b || "quarter" === b ? (e = hb(this, f), "quarter" === b ? e /= 3 : "year" === b && (e /= 12)) : (d = this - f, e = "second" === b ? d / 1e3 : "minute" === b ? d / 6e4 : "hour" === b ? d / 36e5 : "day" === b ? (d - g) / 864e5 : "week" === b ? (d - g) / 6048e5 : d), c ? e : fb(e)
            } function hb(a, b) {
                var c, d, e = 12 * (b.year() - a.year()) + (b.month() - a.month()), f = a.clone().add(e, "months"); return 0 > b - f ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d)
            } function ib() {
                return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
            } function jb() {
                var a = this.clone().utc(); return 0 < a.year() && a.year() <= 9999 ? "function" == typeof Date.prototype.toISOString ? this.toDate().toISOString() : J(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : J(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")
            } function kb(b) {
                var c = J(this, b || a.defaultFormat); return this.localeData().postformat(c)
            } function lb(a, b) {
                return this.isValid() ? Va({ to: this, from: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()
            } function mb(a) {
                return this.from(Aa(), a)
            } function nb(a, b) {
                return this.isValid() ? Va({ from: this, to: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate()
            } function ob(a) {
                return this.to(Aa(), a)
            } function pb(a) {
                var b; return void 0 === a ? this._locale._abbr : (b = x(a), null != b && (this._locale = b), this)
            } function qb() {
                return this._locale
            } function rb(a) {
                switch (a = z(a)) { case "year": this.month(0); case "quarter": case "month": this.date(1); case "week": case "isoWeek": case "day": this.hours(0); case "hour": this.minutes(0); case "minute": this.seconds(0); case "second": this.milliseconds(0) } return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this
            } function sb(a) {
                return a = z(a), void 0 === a || "millisecond" === a ? this : this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms")
            } function tb() {
                return +this._d - 6e4 * (this._offset || 0)
            } function ub() {
                return Math.floor(+this / 1e3)
            } function vb() {
                return this._offset ? new Date(+this) : this._d
            } function wb() {
                var a = this; return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()]
            } function xb() {
                return k(this)
            } function yb() {
                return g({}, j(this))
            } function zb() {
                return j(this).overflow
            } function Ab(a, b) {
                G(0, [a, a.length], 0, b)
            } function Bb(a, b, c) {
                return ha(Aa([a, 11, 31 + b - c]), b, c).week
            } function Cb(a) {
                var b = ha(this, this.localeData()._week.dow, this.localeData()._week.doy).year; return null == a ? b : this.add(a - b, "y")
            } function Db(a) {
                var b = ha(this, 1, 4).year; return null == a ? b : this.add(a - b, "y")
            } function Eb() {
                return Bb(this.year(), 1, 4)
            } function Fb() {
                var a = this.localeData()._week; return Bb(this.year(), a.dow, a.doy)
            } function Gb(a) {
                return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3)
            } function Hb(a, b) {
                if ("string" == typeof a) if (isNaN(a)) { if (a = b.weekdaysParse(a), "number" != typeof a) return null } else a = parseInt(a, 10); return a
            } function Ib(a) {
                return this._weekdays[a.day()]
            } function Jb(a) {
                return this._weekdaysShort[a.day()]
            } function Kb(a) {
                return this._weekdaysMin[a.day()]
            } function Lb(a) {
                var b, c, d; for (this._weekdaysParse || (this._weekdaysParse = []), b = 0; 7 > b; b++) if (this._weekdaysParse[b] || (c = Aa([2e3, 1]).day(b), d = "^" + this.weekdays(c, "") + "|^" + this.weekdaysShort(c, "") + "|^" + this.weekdaysMin(c, ""), this._weekdaysParse[b] = new RegExp(d.replace(".", ""), "i")), this._weekdaysParse[b].test(a)) return b
            } function Mb(a) {
                var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return null != a ? (a = Hb(a, this.localeData()), this.add(a - b, "d")) : b
            } function Nb(a) {
                var b = (this.day() + 7 - this.localeData()._week.dow) % 7; return null == a ? b : this.add(a - b, "d")
            } function Ob(a) {
                return null == a ? this.day() || 7 : this.day(this.day() % 7 ? a : a - 7)
            } function Pb(a, b) {
                G(a, 0, 0, function () { return this.localeData().meridiem(this.hours(), this.minutes(), b) })
            } function Qb(a, b) {
                return b._meridiemParse
            } function Rb(a) {
                return "p" === (a + "").toLowerCase().charAt(0)
            } function Sb(a, b, c) {
                return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM"
            } function Tb(a) {
                G(0, [a, 3], 0, "millisecond")
            } function Ub() {
                return this._isUTC ? "UTC" : ""
            } function Vb() {
                return this._isUTC ? "Coordinated Universal Time" : ""
            } function Wb(a) {
                return Aa(1e3 * a)
            } function Xb() {
                return Aa.apply(null, arguments).parseZone()
            } function Yb(a, b, c) {
                var d = this._calendar[a]; return "function" == typeof d ? d.call(b, c) : d
            } function Zb(a) {
                var b = this._longDateFormat[a]; return !b && this._longDateFormat[a.toUpperCase()] && (b = this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (a) { return a.slice(1) }), this._longDateFormat[a] = b), b
            } function $b() {
                return this._invalidDate
            } function _b(a) {
                return this._ordinal.replace("%d", a)
            } function ac(a) {
                return a
            } function bc(a, b, c, d) {
                var e = this._relativeTime[c]; return "function" == typeof e ? e(a, b, c, d) : e.replace(/%d/i, a)
            } function cc(a, b) {
                var c = this._relativeTime[a > 0 ? "future" : "past"]; return "function" == typeof c ? c(b) : c.replace(/%s/i, b)
            } function dc(a) {
                var b, c; for (c in a) b = a[c], "function" == typeof b ? this[c] = b : this["_" + c] = b; this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source)
            } function ec(a, b, c, d) {
                var e = x(), f = h().set(d, b); return e[c](f, a)
            } function fc(a, b, c, d, e) {
                if ("number" == typeof a && (b = a, a = void 0), a = a || "", null != b) return ec(a, b, c, e); var f, g = []; for (f = 0; d > f; f++) g[f] = ec(a, f, c, e); return g
            } function gc(a, b) {
                return fc(a, b, "months", 12, "month")
            } function hc(a, b) {
                return fc(a, b, "monthsShort", 12, "month")
            } function ic(a, b) {
                return fc(a, b, "weekdays", 7, "day")
            } function jc(a, b) {
                return fc(a, b, "weekdaysShort", 7, "day")
            } function kc(a, b) {
                return fc(a, b, "weekdaysMin", 7, "day")
            } function lc() {
                var a = this._data; return this._milliseconds = Rd(this._milliseconds), this._days = Rd(this._days), this._months = Rd(this._months), a.milliseconds = Rd(a.milliseconds), a.seconds = Rd(a.seconds), a.minutes = Rd(a.minutes), a.hours = Rd(a.hours), a.months = Rd(a.months), a.years = Rd(a.years), this
            } function mc(a, b, c, d) {
                var e = Va(b, c); return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble()
            } function nc(a, b) {
                return mc(this, a, b, 1)
            } function oc(a, b) {
                return mc(this, a, b, -1)
            } function pc() {
                var a, b, c, d = this._milliseconds, e = this._days, f = this._months, g = this._data, h = 0; return g.milliseconds = d % 1e3, a = fb(d / 1e3), g.seconds = a % 60, b = fb(a / 60), g.minutes = b % 60, c = fb(b / 60), g.hours = c % 24, e += fb(c / 24), h = fb(qc(e)), e -= fb(rc(h)), f += fb(e / 30), e %= 30, h += fb(f / 12), f %= 12, g.days = e, g.months = f, g.years = h, this
            } function qc(a) {
                return 400 * a / 146097
            } function rc(a) {
                return 146097 * a / 400
            } function sc(a) {
                var b, c, d = this._milliseconds; if (a = z(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + 12 * qc(b), "month" === a ? c : c / 12; switch (b = this._days + Math.round(rc(this._months / 12)), a) { case "week": return b / 7 + d / 6048e5; case "day": return b + d / 864e5; case "hour": return 24 * b + d / 36e5; case "minute": return 1440 * b + d / 6e4; case "second": return 86400 * b + d / 1e3; case "millisecond": return Math.floor(864e5 * b) + d; default: throw new Error("Unknown unit " + a) }
            } function tc() {
                return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * p(this._months / 12)
            } function uc(a) {
                return function () { return this.as(a) }
            } function vc(a) {
                return a = z(a), this[a + "s"]()
            } function wc(a) {
                return function () { return this._data[a] }
            } function xc() {
                return fb(this.days() / 7)
            } function yc(a, b, c, d, e) {
                return e.relativeTime(b || 1, !!c, a, d)
            } function zc(a, b, c) {
                var d = Va(a).abs(), e = fe(d.as("s")), f = fe(d.as("m")), g = fe(d.as("h")), h = fe(d.as("d")), i = fe(d.as("M")), j = fe(d.as("y")), k = e < ge.s && ["s", e] || 1 === f && ["m"] || f < ge.m && ["mm", f] || 1 === g && ["h"] || g < ge.h && ["hh", g] || 1 === h && ["d"] || h < ge.d && ["dd", h] || 1 === i && ["M"] || i < ge.M && ["MM", i] || 1 === j && ["y"] || ["yy", j]; return k[2] = b, k[3] = +a > 0, k[4] = c, yc.apply(null, k)
            } function Ac(a, b) {
                return void 0 === ge[a] ? !1 : void 0 === b ? ge[a] : (ge[a] = b, !0)
            } function Bc(a) {
                var b = this.localeData(), c = zc(this, !a, b); return a && (c = b.pastFuture(+this, c)), b.postformat(c)
            } function Cc() {
                var a = he(this.years()), b = he(this.months()), c = he(this.days()), d = he(this.hours()), e = he(this.minutes()), f = he(this.seconds() + this.milliseconds() / 1e3), g = this.asSeconds(); return g ? (0 > g ? "-" : "") + "P" + (a ? a + "Y" : "") + (b ? b + "M" : "") + (c ? c + "D" : "") + (d || e || f ? "T" : "") + (d ? d + "H" : "") + (e ? e + "M" : "") + (f ? f + "S" : "") : "P0D"
            } var Dc, Ec, Fc = a.momentProperties = [], Gc = !1, Hc = {}, Ic = {}, Jc = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g, Kc = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, Lc = {}, Mc = {}, Nc = /\d/, Oc = /\d\d/, Pc = /\d{3}/, Qc = /\d{4}/, Rc = /[+-]?\d{6}/, Sc = /\d\d?/, Tc = /\d{1,3}/, Uc = /\d{1,4}/, Vc = /[+-]?\d{1,6}/, Wc = /\d+/, Xc = /[+-]?\d+/, Yc = /Z|[+-]\d\d:?\d\d/gi, Zc = /[+-]?\d+(\.\d{1,3})?/, $c = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, _c = {}, ad = {}, bd = 0, cd = 1, dd = 2, ed = 3, fd = 4, gd = 5, hd = 6; G("M", ["MM", 2], "Mo", function () { return this.month() + 1 }), G("MMM", 0, 0, function (a) { return this.localeData().monthsShort(this, a) }), G("MMMM", 0, 0, function (a) { return this.localeData().months(this, a) }), y("month", "M"), L("M", Sc), L("MM", Sc, Oc), L("MMM", $c), L("MMMM", $c), O(["M", "MM"], function (a, b) { b[cd] = p(a) - 1 }), O(["MMM", "MMMM"], function (a, b, c, d) { var e = c._locale.monthsParse(a, d, c._strict); null != e ? b[cd] = e : j(c).invalidMonth = a }); var id = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), jd = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), kd = {
            }; a.suppressDeprecationWarnings = !1; var ld = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, md = [["YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/], ["YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/], ["GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/], ["GGGG-[W]WW", /\d{4}-W\d{2}/], ["YYYY-DDD", /\d{4}-\d{3}/]], nd = [["HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]], od = /^\/?Date\((\-?\d+)/i; a.createFromInputFallback = $("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function (a) { a._d = new Date(a._i + (a._useUTC ? " UTC" : "")) }), G(0, ["YY", 2], 0, function () { return this.year() % 100 }), G(0, ["YYYY", 4], 0, "year"), G(0, ["YYYYY", 5], 0, "year"), G(0, ["YYYYYY", 6, !0], 0, "year"), y("year", "y"), L("Y", Xc), L("YY", Sc, Oc), L("YYYY", Uc, Qc), L("YYYYY", Vc, Rc), L("YYYYYY", Vc, Rc), O(["YYYY", "YYYYY", "YYYYYY"], bd), O("YY", function (b, c) { c[bd] = a.parseTwoDigitYear(b) }), a.parseTwoDigitYear = function (a) {
                return p(a) + (p(a) > 68 ? 1900 : 2e3)
            }; var pd = B("FullYear", !1); G("w", ["ww", 2], "wo", "week"), G("W", ["WW", 2], "Wo", "isoWeek"), y("week", "w"), y("isoWeek", "W"), L("w", Sc), L("ww", Sc, Oc), L("W", Sc), L("WW", Sc, Oc), P(["w", "ww", "W", "WW"], function (a, b, c, d) { b[d.substr(0, 1)] = p(a) }); var qd = {
                dow: 0, doy: 6
            }; G("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), y("dayOfYear", "DDD"), L("DDD", Tc), L("DDDD", Pc), O(["DDD", "DDDD"], function (a, b, c) { c._dayOfYear = p(a) }), a.ISO_8601 = function () {
            }; var rd = $("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function () { var a = Aa.apply(null, arguments); return this > a ? this : a }), sd = $("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function () { var a = Aa.apply(null, arguments); return a > this ? this : a }); Ga("Z", ":"), Ga("ZZ", ""), L("Z", Yc), L("ZZ", Yc), O(["Z", "ZZ"], function (a, b, c) { c._useUTC = !0, c._tzm = Ha(a) }); var td = /([\+\-]|\d\d)/gi; a.updateOffset = function () {
            }; var ud = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, vd = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/; Va.fn = Ea.prototype; var wd = Za(1, "add"), xd = Za(-1, "subtract"); a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ"; var yd = $("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (a) { return void 0 === a ? this.localeData() : this.locale(a) }); G(0, ["gg", 2], 0, function () { return this.weekYear() % 100 }), G(0, ["GG", 2], 0, function () { return this.isoWeekYear() % 100 }), Ab("gggg", "weekYear"), Ab("ggggg", "weekYear"), Ab("GGGG", "isoWeekYear"), Ab("GGGGG", "isoWeekYear"), y("weekYear", "gg"), y("isoWeekYear", "GG"), L("G", Xc), L("g", Xc), L("GG", Sc, Oc), L("gg", Sc, Oc), L("GGGG", Uc, Qc), L("gggg", Uc, Qc), L("GGGGG", Vc, Rc), L("ggggg", Vc, Rc), P(["gggg", "ggggg", "GGGG", "GGGGG"], function (a, b, c, d) { b[d.substr(0, 2)] = p(a) }), P(["gg", "GG"], function (b, c, d, e) { c[e] = a.parseTwoDigitYear(b) }), G("Q", 0, 0, "quarter"), y("quarter", "Q"), L("Q", Nc), O("Q", function (a, b) { b[cd] = 3 * (p(a) - 1) }), G("D", ["DD", 2], "Do", "date"), y("date", "D"), L("D", Sc), L("DD", Sc, Oc), L("Do", function (a, b) { return a ? b._ordinalParse : b._ordinalParseLenient }), O(["D", "DD"], dd), O("Do", function (a, b) { b[dd] = p(a.match(Sc)[0], 10) }); var zd = B("Date", !0); G("d", 0, "do", "day"), G("dd", 0, 0, function (a) { return this.localeData().weekdaysMin(this, a) }), G("ddd", 0, 0, function (a) { return this.localeData().weekdaysShort(this, a) }), G("dddd", 0, 0, function (a) { return this.localeData().weekdays(this, a) }), G("e", 0, 0, "weekday"), G("E", 0, 0, "isoWeekday"), y("day", "d"), y("weekday", "e"), y("isoWeekday", "E"), L("d", Sc), L("e", Sc), L("E", Sc), L("dd", $c), L("ddd", $c), L("dddd", $c), P(["dd", "ddd", "dddd"], function (a, b, c) { var d = c._locale.weekdaysParse(a); null != d ? b.d = d : j(c).invalidWeekday = a }), P(["d", "e", "E"], function (a, b, c, d) { b[d] = p(a) }); var Ad = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), Bd = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), Cd = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"); G("H", ["HH", 2], 0, "hour"), G("h", ["hh", 2], 0, function () { return this.hours() % 12 || 12 }), Pb("a", !0), Pb("A", !1), y("hour", "h"), L("a", Qb), L("A", Qb), L("H", Sc), L("h", Sc), L("HH", Sc, Oc), L("hh", Sc, Oc), O(["H", "HH"], ed), O(["a", "A"], function (a, b, c) { c._isPm = c._locale.isPM(a), c._meridiem = a }), O(["h", "hh"], function (a, b, c) { b[ed] = p(a), j(c).bigHour = !0 }); var Dd = /[ap]\.?m?\.?/i, Ed = B("Hours", !0); G("m", ["mm", 2], 0, "minute"), y("minute", "m"), L("m", Sc), L("mm", Sc, Oc), O(["m", "mm"], fd); var Fd = B("Minutes", !1); G("s", ["ss", 2], 0, "second"), y("second", "s"), L("s", Sc), L("ss", Sc, Oc), O(["s", "ss"], gd); var Gd = B("Seconds", !1); G("S", 0, 0, function () { return ~~(this.millisecond() / 100) }), G(0, ["SS", 2], 0, function () { return ~~(this.millisecond() / 10) }), Tb("SSS"), Tb("SSSS"), y("millisecond", "ms"), L("S", Tc, Nc), L("SS", Tc, Oc), L("SSS", Tc, Pc), L("SSSS", Wc), O(["S", "SS", "SSS", "SSSS"], function (a, b) { b[hd] = p(1e3 * ("0." + a)) }); var Hd = B("Milliseconds", !1); G("z", 0, 0, "zoneAbbr"), G("zz", 0, 0, "zoneName"); var Id = n.prototype; Id.add = wd, Id.calendar = _a, Id.clone = ab, Id.diff = gb, Id.endOf = sb, Id.format = kb, Id.from = lb, Id.fromNow = mb, Id.to = nb, Id.toNow = ob, Id.get = E, Id.invalidAt = zb, Id.isAfter = bb, Id.isBefore = cb, Id.isBetween = db, Id.isSame = eb, Id.isValid = xb, Id.lang = yd, Id.locale = pb, Id.localeData = qb, Id.max = sd, Id.min = rd, Id.parsingFlags = yb, Id.set = E, Id.startOf = rb, Id.subtract = xd, Id.toArray = wb, Id.toDate = vb, Id.toISOString = jb, Id.toJSON = jb, Id.toString = ib, Id.unix = ub, Id.valueOf = tb, Id.year = pd, Id.isLeapYear = ga, Id.weekYear = Cb, Id.isoWeekYear = Db, Id.quarter = Id.quarters = Gb, Id.month = W, Id.daysInMonth = X, Id.week = Id.weeks = la, Id.isoWeek = Id.isoWeeks = ma, Id.weeksInYear = Fb, Id.isoWeeksInYear = Eb, Id.date = zd, Id.day = Id.days = Mb, Id.weekday = Nb, Id.isoWeekday = Ob, Id.dayOfYear = oa, Id.hour = Id.hours = Ed, Id.minute = Id.minutes = Fd, Id.second = Id.seconds = Gd, Id.millisecond = Id.milliseconds = Hd, Id.utcOffset = Ka, Id.utc = Ma, Id.local = Na, Id.parseZone = Oa, Id.hasAlignedHourOffset = Pa, Id.isDST = Qa, Id.isDSTShifted = Ra, Id.isLocal = Sa, Id.isUtcOffset = Ta, Id.isUtc = Ua, Id.isUTC = Ua, Id.zoneAbbr = Ub, Id.zoneName = Vb, Id.dates = $("dates accessor is deprecated. Use date instead.", zd), Id.months = $("months accessor is deprecated. Use month instead", W), Id.years = $("years accessor is deprecated. Use year instead", pd), Id.zone = $("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779", La); var Jd = Id, Kd = { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" }, Ld = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY LT", LLLL: "dddd, MMMM D, YYYY LT" }, Md = "Invalid date", Nd = "%d", Od = /\d{1,2}/, Pd = {
                future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour",
                hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years"
            }, Qd = r.prototype; Qd._calendar = Kd, Qd.calendar = Yb, Qd._longDateFormat = Ld, Qd.longDateFormat = Zb, Qd._invalidDate = Md, Qd.invalidDate = $b, Qd._ordinal = Nd, Qd.ordinal = _b, Qd._ordinalParse = Od, Qd.preparse = ac, Qd.postformat = ac, Qd._relativeTime = Pd, Qd.relativeTime = bc, Qd.pastFuture = cc, Qd.set = dc, Qd.months = S, Qd._months = id, Qd.monthsShort = T, Qd._monthsShort = jd, Qd.monthsParse = U, Qd.week = ia, Qd._week = qd, Qd.firstDayOfYear = ka, Qd.firstDayOfWeek = ja, Qd.weekdays = Ib, Qd._weekdays = Ad, Qd.weekdaysMin = Kb, Qd._weekdaysMin = Cd, Qd.weekdaysShort = Jb, Qd._weekdaysShort = Bd, Qd.weekdaysParse = Lb, Qd.isPM = Rb, Qd._meridiemParse = Dd, Qd.meridiem = Sb, v("en", { ordinalParse: /\d{1,2}(th|st|nd|rd)/, ordinal: function (a) { var b = a % 10, c = 1 === p(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th"; return a + c } }), a.lang = $("moment.lang is deprecated. Use moment.locale instead.", v), a.langData = $("moment.langData is deprecated. Use moment.localeData instead.", x); var Rd = Math.abs, Sd = uc("ms"), Td = uc("s"), Ud = uc("m"), Vd = uc("h"), Wd = uc("d"), Xd = uc("w"), Yd = uc("M"), Zd = uc("y"), $d = wc("milliseconds"), _d = wc("seconds"), ae = wc("minutes"), be = wc("hours"), ce = wc("days"), de = wc("months"), ee = wc("years"), fe = Math.round, ge = { s: 45, m: 45, h: 22, d: 26, M: 11 }, he = Math.abs, ie = Ea.prototype; ie.abs = lc, ie.add = nc, ie.subtract = oc, ie.as = sc, ie.asMilliseconds = Sd, ie.asSeconds = Td, ie.asMinutes = Ud, ie.asHours = Vd, ie.asDays = Wd, ie.asWeeks = Xd, ie.asMonths = Yd, ie.asYears = Zd, ie.valueOf = tc, ie._bubble = pc, ie.get = vc, ie.milliseconds = $d, ie.seconds = _d, ie.minutes = ae, ie.hours = be, ie.days = ce, ie.weeks = xc, ie.months = de, ie.years = ee, ie.humanize = Bc, ie.toISOString = Cc, ie.toString = Cc, ie.toJSON = Cc, ie.locale = pb, ie.localeData = qb, ie.toIsoString = $("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", Cc), ie.lang = yd, G("X", 0, 0, "unix"), G("x", 0, 0, "valueOf"), L("x", Xc), L("X", Zc), O("X", function (a, b, c) { c._d = new Date(1e3 * parseFloat(a, 10)) }), O("x", function (a, b, c) { c._d = new Date(p(a)) }), a.version = "2.10.3", b(Aa), a.fn = Jd, a.min = Ca, a.max = Da, a.utc = h, a.unix = Wb, a.months = gc, a.isDate = d, a.locale = v, a.invalid = l, a.duration = Va, a.isMoment = o, a.weekdays = ic, a.parseZone = Xb, a.localeData = x, a.isDuration = Fa, a.monthsShort = hc, a.weekdaysMin = kc, a.defineLocale = w, a.weekdaysShort = jc, a.normalizeUnits = z, a.relativeTimeThreshold = Ac; var je = a; return je
        });


        /*
         The MIT License (MIT)

         Copyright (c) 2015 Jonathan Peterson

         Permission is hereby granted, free of charge, to any person obtaining a copy
         of this software and associated documentation files (the "Software"), to deal
         in the Software without restriction, including without limitation the rights
         to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         copies of the Software, and to permit persons to whom the Software is
         furnished to do so, subject to the following conditions:

         The above copyright notice and this permission notice shall be included in
         all copies or substantial portions of the Software.

         THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
         THE SOFTWARE.
         */
        !function (e) { "use strict"; if ("function" == typeof define && define.amd) define(["jquery", "moment"], e); else if ("object" == typeof exports) e(require("jquery"), require("moment")); else { if ("undefined" == typeof jQuery) throw "bootstrap-datetimepicker requires jQuery to be loaded first"; if ("undefined" == typeof moment) throw "bootstrap-datetimepicker requires Moment.js to be loaded first"; e(jQuery, moment) } }(function (e, t) { "use strict"; if (!t) throw new Error("bootstrap-datetimepicker requires Moment.js to be loaded first"); var a = function (a, n) { var r, i, o, s, d, p = {}, l = t().startOf("d"), c = l.clone(), u = !0, f = !1, m = !1, h = 0, g = [{ clsName: "days", navFnc: "M", navStep: 1 }, { clsName: "months", navFnc: "y", navStep: 1 }, { clsName: "years", navFnc: "y", navStep: 10 }], y = ["days", "months", "years"], w = ["top", "bottom", "auto"], b = ["left", "right", "auto"], v = ["default", "top", "bottom"], k = { up: 38, 38: "up", down: 40, 40: "down", left: 37, 37: "left", right: 39, 39: "right", tab: 9, 9: "tab", escape: 27, 27: "escape", enter: 13, 13: "enter", pageUp: 33, 33: "pageUp", pageDown: 34, 34: "pageDown", shift: 16, 16: "shift", control: 17, 17: "control", space: 32, 32: "space", t: 84, 84: "t", "delete": 46, 46: "delete" }, C = {}, x = function (e) { if ("string" != typeof e || e.length > 1) throw new TypeError("isEnabled expects a single character string parameter"); switch (e) { case "y": return -1 !== o.indexOf("Y"); case "M": return -1 !== o.indexOf("M"); case "d": return -1 !== o.toLowerCase().indexOf("d"); case "h": case "H": return -1 !== o.toLowerCase().indexOf("h"); case "m": return -1 !== o.indexOf("m"); case "s": return -1 !== o.indexOf("s"); default: return !1 } }, D = function () { return x("h") || x("m") || x("s") }, T = function () { return x("y") || x("M") || x("d") }, M = function () { var t = e("<thead>").append(e("<tr>").append(e("<th>").addClass("prev").attr("data-action", "previous").append(e("<span>").addClass(n.icons.previous))).append(e("<th>").addClass("picker-switch").attr("data-action", "pickerSwitch").attr("colspan", n.calendarWeeks ? "6" : "5")).append(e("<th>").addClass("next").attr("data-action", "next").append(e("<span>").addClass(n.icons.next)))), a = e("<tbody>").append(e("<tr>").append(e("<td>").attr("colspan", n.calendarWeeks ? "8" : "7"))); return [e("<div>").addClass("datepicker-days").append(e("<table>").addClass("table-condensed").append(t).append(e("<tbody>"))), e("<div>").addClass("datepicker-months").append(e("<table>").addClass("table-condensed").append(t.clone()).append(a.clone())), e("<div>").addClass("datepicker-years").append(e("<table>").addClass("table-condensed").append(t.clone()).append(a.clone()))] }, O = function () { var t = e("<tr>"), a = e("<tr>"), r = e("<tr>"); return x("h") && (t.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "incrementHours").append(e("<span>").addClass(n.icons.up)))), a.append(e("<td>").append(e("<span>").addClass("timepicker-hour").attr("data-time-component", "hours").attr("data-action", "showHours"))), r.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "decrementHours").append(e("<span>").addClass(n.icons.down))))), x("m") && (x("h") && (t.append(e("<td>").addClass("separator")), a.append(e("<td>").addClass("separator").html(":")), r.append(e("<td>").addClass("separator"))), t.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "incrementMinutes").append(e("<span>").addClass(n.icons.up)))), a.append(e("<td>").append(e("<span>").addClass("timepicker-minute").attr("data-time-component", "minutes").attr("data-action", "showMinutes"))), r.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "decrementMinutes").append(e("<span>").addClass(n.icons.down))))), x("s") && (x("m") && (t.append(e("<td>").addClass("separator")), a.append(e("<td>").addClass("separator").html(":")), r.append(e("<td>").addClass("separator"))), t.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "incrementSeconds").append(e("<span>").addClass(n.icons.up)))), a.append(e("<td>").append(e("<span>").addClass("timepicker-second").attr("data-time-component", "seconds").attr("data-action", "showSeconds"))), r.append(e("<td>").append(e("<a>").attr({ href: "#", tabindex: "-1" }).addClass("btn").attr("data-action", "decrementSeconds").append(e("<span>").addClass(n.icons.down))))), i || (t.append(e("<td>").addClass("separator")), a.append(e("<td>").append(e("<button>").addClass("btn btn-primary").attr("data-action", "togglePeriod"))), r.append(e("<td>").addClass("separator"))), e("<div>").addClass("timepicker-picker").append(e("<table>").addClass("table-condensed").append([t, a, r])) }, E = function () { var t = e("<div>").addClass("timepicker-hours").append(e("<table>").addClass("table-condensed")), a = e("<div>").addClass("timepicker-minutes").append(e("<table>").addClass("table-condensed")), n = e("<div>").addClass("timepicker-seconds").append(e("<table>").addClass("table-condensed")), r = [O()]; return x("h") && r.push(t), x("m") && r.push(a), x("s") && r.push(n), r }, P = function () { var t = []; return n.showTodayButton && t.push(e("<td>").append(e("<a>").attr("data-action", "today").append(e("<span>").addClass(n.icons.today)))), !n.sideBySide && T() && D() && t.push(e("<td>").append(e("<a>").attr("data-action", "togglePicker").append(e("<span>").addClass(n.icons.time)))), n.showClear && t.push(e("<td>").append(e("<a>").attr("data-action", "clear").append(e("<span>").addClass(n.icons.clear)))), n.showClose && t.push(e("<td>").append(e("<a>").attr("data-action", "close").append(e("<span>").addClass(n.icons.close)))), e("<table>").addClass("table-condensed").append(e("<tbody>").append(e("<tr>").append(t))) }, S = function () { var t = e("<div>").addClass("bootstrap-datetimepicker-widget dropdown-menu"), a = e("<div>").addClass("datepicker").append(M()), r = e("<div>").addClass("timepicker").append(E()), o = e("<ul>").addClass("list-unstyled"), s = e("<li>").addClass("picker-switch" + (n.collapse ? " accordion-toggle" : "")).append(P()); return n.inline && t.removeClass("dropdown-menu"), i && t.addClass("usetwentyfour"), n.sideBySide && T() && D() ? (t.addClass("timepicker-sbs"), t.append(e("<div>").addClass("row").append(a.addClass("col-sm-6")).append(r.addClass("col-sm-6"))), t.append(s), t) : ("top" === n.toolbarPlacement && o.append(s), T() && o.append(e("<li>").addClass(n.collapse && D() ? "collapse in" : "").append(a)), "default" === n.toolbarPlacement && o.append(s), D() && o.append(e("<li>").addClass(n.collapse && T() ? "collapse" : "").append(r)), "bottom" === n.toolbarPlacement && o.append(s), t.append(o)) }, B = function () { var t, r = {}; return t = a.is("input") || n.inline ? a.data() : a.find("input").data(), t.dateOptions && t.dateOptions instanceof Object && (r = e.extend(!0, r, t.dateOptions)), e.each(n, function (e) { var a = "date" + e.charAt(0).toUpperCase() + e.slice(1); void 0 !== t[a] && (r[e] = t[a]) }), r }, j = function () { var t, r = (f || a).position(), i = (f || a).offset(), o = n.widgetPositioning.vertical, s = n.widgetPositioning.horizontal; if (n.widgetParent) t = n.widgetParent.append(m); else if (a.is("input")) t = a.parent().append(m); else { if (n.inline) return void (t = a.append(m)); t = a, a.children().first().after(m) } if ("auto" === o && (o = i.top + 1.5 * m.height() >= e(window).height() + e(window).scrollTop() && m.height() + a.outerHeight() < i.top ? "top" : "bottom"), "auto" === s && (s = t.width() < i.left + m.outerWidth() / 2 && i.left + m.outerWidth() > e(window).width() ? "right" : "left"), "top" === o ? m.addClass("top").removeClass("bottom") : m.addClass("bottom").removeClass("top"), "right" === s ? m.addClass("pull-right") : m.removeClass("pull-right"), "relative" !== t.css("position") && (t = t.parents().filter(function () { return "relative" === e(this).css("position") }).first()), 0 === t.length) throw new Error("datetimepicker component should be placed within a relative positioned container"); var d = e(a).parents().filter(function () { return "fixed" === e(this).css("position") }).length > 0; if ("fixed" === m.css("position") && d) { var i = a.offset(), p = i.left, l = jQuery(window).height() - (jQuery(a).offset().top - jQuery(window).scrollTop()); m.css({ bottom: l, left: p }) } else m.css({ top: "top" === o ? "auto" : r.top + a.outerHeight(), bottom: "top" === o ? r.top + a.outerHeight() : "auto", left: "left" === s ? t.css("padding-left") : "auto", right: "left" === s ? "auto" : t.width() - a.outerWidth() }) }, H = function (e) { "dp.change" === e.type && (e.date && e.date.isSame(e.oldDate) || !e.date && !e.oldDate) || a.trigger(e) }, I = function (e) { m && (e && (d = Math.max(h, Math.min(2, d + e))), m.find(".datepicker > div").hide().filter(".datepicker-" + g[d].clsName).show()) }, F = function () { var t = e("<tr>"), a = c.clone().startOf("w"); for (n.calendarWeeks === !0 && t.append(e("<th>").addClass("cw").text("#")); a.isBefore(c.clone().endOf("w"));) t.append(e("<th>").addClass("dow").text(a.format("dd"))), a.add(1, "d"); m.find(".datepicker-days thead").append(t) }, L = function (e) { return n.disabledDates[e.format("YYYY-MM-DD")] === !0 }, Y = function (e) { return n.enabledDates[e.format("YYYY-MM-DD")] === !0 }, W = function (e, t) { return e.isValid() ? n.disabledDates && L(e) && "M" !== t ? !1 : n.enabledDates && !Y(e) && "M" !== t ? !1 : n.minDate && e.isBefore(n.minDate, t) ? !1 : n.maxDate && e.isAfter(n.maxDate, t) ? !1 : "d" === t && -1 !== n.daysOfWeekDisabled.indexOf(e.day()) ? !1 : !0 : !1 }, q = function () { for (var t = [], a = c.clone().startOf("y").hour(12); a.isSame(c, "y");) t.push(e("<span>").attr("data-action", "selectMonth").addClass("month").text(a.format("MMM"))), a.add(1, "M"); m.find(".datepicker-months td").empty().append(t) }, z = function () { var t = m.find(".datepicker-months"), a = t.find("th"), n = t.find("tbody").find("span"); t.find(".disabled").removeClass("disabled"), W(c.clone().subtract(1, "y"), "y") || a.eq(0).addClass("disabled"), a.eq(1).text(c.year()), W(c.clone().add(1, "y"), "y") || a.eq(2).addClass("disabled"), n.removeClass("active"), l.isSame(c, "y") && n.eq(l.month()).addClass("active"), n.each(function (t) { W(c.clone().month(t), "M") || e(this).addClass("disabled") }) }, A = function () { var e = m.find(".datepicker-years"), t = e.find("th"), a = c.clone().subtract(5, "y"), r = c.clone().add(6, "y"), i = ""; for (e.find(".disabled").removeClass("disabled"), n.minDate && n.minDate.isAfter(a, "y") && t.eq(0).addClass("disabled"), t.eq(1).text(a.year() + "-" + r.year()), n.maxDate && n.maxDate.isBefore(r, "y") && t.eq(2).addClass("disabled"); !a.isAfter(r, "y");) i += '<span data-action="selectYear" class="year' + (a.isSame(l, "y") ? " active" : "") + (W(a, "y") ? "" : " disabled") + '">' + a.year() + "</span>", a.add(1, "y"); e.find("td").html(i) }, V = function () { var a, r, i, o = m.find(".datepicker-days"), s = o.find("th"), d = []; if (T()) { for (o.find(".disabled").removeClass("disabled"), s.eq(1).text(c.format(n.dayViewHeaderFormat)), W(c.clone().subtract(1, "M"), "M") || s.eq(0).addClass("disabled"), W(c.clone().add(1, "M"), "M") || s.eq(2).addClass("disabled"), a = c.clone().startOf("M").startOf("week"); !c.clone().endOf("M").endOf("w").isBefore(a, "d");) 0 === a.weekday() && (r = e("<tr>"), n.calendarWeeks && r.append('<td class="cw">' + a.week() + "</td>"), d.push(r)), i = "", a.isBefore(c, "M") && (i += " old"), a.isAfter(c, "M") && (i += " new"), a.isSame(l, "d") && !u && (i += " active"), W(a, "d") || (i += " disabled"), a.isSame(t(), "d") && (i += " today"), (0 === a.day() || 6 === a.day()) && (i += " weekend"), r.append('<td data-action="selectDay" class="day' + i + '">' + a.date() + "</td>"), a.add(1, "d"); o.find("tbody").empty().append(d), z(), A() } }, N = function () { var t = m.find(".timepicker-hours table"), a = c.clone().startOf("d"), n = [], r = e("<tr>"); for (c.hour() > 11 && !i && a.hour(12); a.isSame(c, "d") && (i || c.hour() < 12 && a.hour() < 12 || c.hour() > 11);) a.hour() % 4 === 0 && (r = e("<tr>"), n.push(r)), r.append('<td data-action="selectHour" class="hour' + (W(a, "h") ? "" : " disabled") + '">' + a.format(i ? "HH" : "hh") + "</td>"), a.add(1, "h"); t.empty().append(n) }, Q = function () { for (var t = m.find(".timepicker-minutes table"), a = c.clone().startOf("h"), r = [], i = e("<tr>"), o = 1 === n.stepping ? 5 : n.stepping; c.isSame(a, "h");) a.minute() % (4 * o) === 0 && (i = e("<tr>"), r.push(i)), i.append('<td data-action="selectMinute" class="minute' + (W(a, "m") ? "" : " disabled") + '">' + a.format("mm") + "</td>"), a.add(o, "m"); t.empty().append(r) }, R = function () { for (var t = m.find(".timepicker-seconds table"), a = c.clone().startOf("m"), n = [], r = e("<tr>"); c.isSame(a, "m");) a.second() % 20 === 0 && (r = e("<tr>"), n.push(r)), r.append('<td data-action="selectSecond" class="second' + (W(a, "s") ? "" : " disabled") + '">' + a.format("ss") + "</td>"), a.add(5, "s"); t.empty().append(n) }, U = function () { var e = m.find(".timepicker span[data-time-component]"); i || m.find(".timepicker [data-action=togglePeriod]").text(l.format("A")), e.filter("[data-time-component=hours]").text(l.format(i ? "HH" : "hh")), e.filter("[data-time-component=minutes]").text(l.format("mm")), e.filter("[data-time-component=seconds]").text(l.format("ss")), N(), Q(), R() }, G = function () { m && (V(), U()) }, J = function (e) { var t = u ? null : l; return e ? (e = e.clone().locale(n.locale), 1 !== n.stepping && e.minutes(Math.round(e.minutes() / n.stepping) * n.stepping % 60).seconds(0), void (W(e) ? (l = e, c = l.clone(), r.val(l.format(o)), a.data("date", l.format(o)), G(), u = !1, H({ type: "dp.change", date: l.clone(), oldDate: t })) : (n.keepInvalid || r.val(u ? "" : l.format(o)), H({ type: "dp.error", date: e })))) : (u = !0, r.val(""), a.data("date", ""), H({ type: "dp.change", date: null, oldDate: t }), void G()) }, K = function () { var t = !1; return m ? (m.find(".collapse").each(function () { var a = e(this).data("collapse"); return a && a.transitioning ? (t = !0, !1) : !0 }), t ? p : (f && f.hasClass("btn") && f.toggleClass("active"), m.hide(), e(window).off("resize", j), m.off("click", "[data-action]"), m.off("mousedown", !1), m.remove(), m = !1, H({ type: "dp.hide", date: l.clone() }), p)) : p }, X = function () { J(null) }, Z = { next: function () { c.add(g[d].navStep, g[d].navFnc), V() }, previous: function () { c.subtract(g[d].navStep, g[d].navFnc), V() }, pickerSwitch: function () { I(1) }, selectMonth: function (t) { var a = e(t.target).closest("tbody").find("span").index(e(t.target)); c.month(a), d === h ? (J(l.clone().year(c.year()).month(c.month())), n.inline || K()) : (I(-1), V()) }, selectYear: function (t) { var a = parseInt(e(t.target).text(), 10) || 0; c.year(a), d === h ? (J(l.clone().year(c.year())), n.inline || K()) : (I(-1), V()) }, selectDay: function (t) { var a = c.clone(); e(t.target).is(".old") && a.subtract(1, "M"), e(t.target).is(".new") && a.add(1, "M"), J(a.date(parseInt(e(t.target).text(), 10))), D() || n.keepOpen || n.inline || K() }, incrementHours: function () { J(l.clone().add(1, "h")) }, incrementMinutes: function () { J(l.clone().add(n.stepping, "m")) }, incrementSeconds: function () { J(l.clone().add(1, "s")) }, decrementHours: function () { J(l.clone().subtract(1, "h")) }, decrementMinutes: function () { J(l.clone().subtract(n.stepping, "m")) }, decrementSeconds: function () { J(l.clone().subtract(1, "s")) }, togglePeriod: function () { J(l.clone().add(l.hours() >= 12 ? -12 : 12, "h")) }, togglePicker: function (t) { var a, r = e(t.target), i = r.closest("ul"), o = i.find(".in"), s = i.find(".collapse:not(.in)"); if (o && o.length) { if (a = o.data("collapse"), a && a.transitioning) return; o.collapse ? (o.collapse("hide"), s.collapse("show")) : (o.removeClass("in"), s.addClass("in")), r.is("span") ? r.toggleClass(n.icons.time + " " + n.icons.date) : r.find("span").toggleClass(n.icons.time + " " + n.icons.date) } }, showPicker: function () { m.find(".timepicker > div:not(.timepicker-picker)").hide(), m.find(".timepicker .timepicker-picker").show() }, showHours: function () { m.find(".timepicker .timepicker-picker").hide(), m.find(".timepicker .timepicker-hours").show() }, showMinutes: function () { m.find(".timepicker .timepicker-picker").hide(), m.find(".timepicker .timepicker-minutes").show() }, showSeconds: function () { m.find(".timepicker .timepicker-picker").hide(), m.find(".timepicker .timepicker-seconds").show() }, selectHour: function (t) { var a = parseInt(e(t.target).text(), 10); i || (l.hours() >= 12 ? 12 !== a && (a += 12) : 12 === a && (a = 0)), J(l.clone().hours(a)), Z.showPicker.call(p) }, selectMinute: function (t) { J(l.clone().minutes(parseInt(e(t.target).text(), 10))), Z.showPicker.call(p) }, selectSecond: function (t) { J(l.clone().seconds(parseInt(e(t.target).text(), 10))), Z.showPicker.call(p) }, clear: X, today: function () { J(t()) }, close: K }, $ = function (t) { return e(t.currentTarget).is(".disabled") ? !1 : (Z[e(t.currentTarget).data("action")].apply(p, arguments), !1) }, _ = function () { var a, i = { year: function (e) { return e.month(0).date(1).hours(0).seconds(0).minutes(0) }, month: function (e) { return e.date(1).hours(0).seconds(0).minutes(0) }, day: function (e) { return e.hours(0).seconds(0).minutes(0) }, hour: function (e) { return e.seconds(0).minutes(0) }, minute: function (e) { return e.seconds(0) } }; return r.prop("disabled") || !n.ignoreReadonly && r.prop("readonly") || m ? p : (n.useCurrent && u && (r.is("input") && 0 === r.val().trim().length || n.inline) && (a = t(), "string" == typeof n.useCurrent && (a = i[n.useCurrent](a)), J(a)), m = S(), F(), q(), m.find(".timepicker-hours").hide(), m.find(".timepicker-minutes").hide(), m.find(".timepicker-seconds").hide(), G(), I(), e(window).on("resize", j), m.on("click", "[data-action]", $), m.on("mousedown", !1), f && f.hasClass("btn") && f.toggleClass("active"), m.show(), j(), r.is(":focus") || r.focus(), H({ type: "dp.show" }), p) }, et = function () { return m ? K() : _() }, tt = function (e) { return e = t.isMoment(e) || e instanceof Date ? t(e) : t(e, s, n.useStrict), e.locale(n.locale), e }, at = function (e) { var t, a, r, i, o = null, s = [], d = {}, l = e.which, c = "p"; C[l] = c; for (t in C) C.hasOwnProperty(t) && C[t] === c && (s.push(t), parseInt(t, 10) !== l && (d[t] = !0)); for (t in n.keyBinds) if (n.keyBinds.hasOwnProperty(t) && "function" == typeof n.keyBinds[t] && (r = t.split(" "), r.length === s.length && k[l] === r[r.length - 1])) { for (i = !0, a = r.length - 2; a >= 0; a--) if (!(k[r[a]] in d)) { i = !1; break } if (i) { o = n.keyBinds[t]; break } } o && (o.call(p, m), e.stopPropagation(), e.preventDefault()) }, nt = function (e) { C[e.which] = "r", e.stopPropagation(), e.preventDefault() }, rt = function (t) { var a = e(t.target).val().trim(), n = a ? tt(a) : null; return J(n), t.stopImmediatePropagation(), !1 }, it = function () { r.on({ change: rt, blur: n.debug ? "" : K, keydown: at, keyup: nt }), a.is("input") ? r.on({ focus: _ }) : f && (f.on("click", et), f.on("mousedown", !1)) }, ot = function () { r.off({ change: rt, blur: K, keydown: at, keyup: nt }), a.is("input") ? r.off({ focus: _ }) : f && (f.off("click", et), f.off("mousedown", !1)) }, st = function (t) { var a = {}; return e.each(t, function () { var e = tt(this); e.isValid() && (a[e.format("YYYY-MM-DD")] = !0) }), Object.keys(a).length ? a : !1 }, dt = function () { var e = n.format || "L LT"; o = e.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (e) { var t = l.localeData().longDateFormat(e) || e; return t.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (e) { return l.localeData().longDateFormat(e) || e }) }), s = n.extraFormats ? n.extraFormats.slice() : [], s.indexOf(e) < 0 && s.indexOf(o) < 0 && s.push(o), i = o.toLowerCase().indexOf("a") < 1 && o.indexOf("h") < 1, x("y") && (h = 2), x("M") && (h = 1), x("d") && (h = 0), d = Math.max(h, d), u || J(l) }; if (p.destroy = function () { K(), ot(), a.removeData("DateTimePicker"), a.removeData("date") }, p.toggle = et, p.show = _, p.hide = K, p.disable = function () { return K(), f && f.hasClass("btn") && f.addClass("disabled"), r.prop("disabled", !0), p }, p.enable = function () { return f && f.hasClass("btn") && f.removeClass("disabled"), r.prop("disabled", !1), p }, p.ignoreReadonly = function (e) { if (0 === arguments.length) return n.ignoreReadonly; if ("boolean" != typeof e) throw new TypeError("ignoreReadonly () expects a boolean parameter"); return n.ignoreReadonly = e, p }, p.options = function (t) { if (0 === arguments.length) return e.extend(!0, {}, n); if (!(t instanceof Object)) throw new TypeError("options() options parameter should be an object"); return e.extend(!0, n, t), e.each(n, function (e, t) { if (void 0 === p[e]) throw new TypeError("option " + e + " is not recognized!"); p[e](t) }), p }, p.date = function (e) { if (0 === arguments.length) return u ? null : l.clone(); if (!(null === e || "string" == typeof e || t.isMoment(e) || e instanceof Date)) throw new TypeError("date() parameter must be one of [null, string, moment or Date]"); return J(null === e ? null : tt(e)), p }, p.format = function (e) { if (0 === arguments.length) return n.format; if ("string" != typeof e && ("boolean" != typeof e || e !== !1)) throw new TypeError("format() expects a sting or boolean:false parameter " + e); return n.format = e, o && dt(), p }, p.dayViewHeaderFormat = function (e) { if (0 === arguments.length) return n.dayViewHeaderFormat; if ("string" != typeof e) throw new TypeError("dayViewHeaderFormat() expects a string parameter"); return n.dayViewHeaderFormat = e, p }, p.extraFormats = function (e) { if (0 === arguments.length) return n.extraFormats; if (e !== !1 && !(e instanceof Array)) throw new TypeError("extraFormats() expects an array or false parameter"); return n.extraFormats = e, s && dt(), p }, p.disabledDates = function (t) { if (0 === arguments.length) return n.disabledDates ? e.extend({}, n.disabledDates) : n.disabledDates; if (!t) return n.disabledDates = !1, G(), p; if (!(t instanceof Array)) throw new TypeError("disabledDates() expects an array parameter"); return n.disabledDates = st(t), n.enabledDates = !1, G(), p }, p.enabledDates = function (t) { if (0 === arguments.length) return n.enabledDates ? e.extend({}, n.enabledDates) : n.enabledDates; if (!t) return n.enabledDates = !1, G(), p; if (!(t instanceof Array)) throw new TypeError("enabledDates() expects an array parameter"); return n.enabledDates = st(t), n.disabledDates = !1, G(), p }, p.daysOfWeekDisabled = function (e) { if (0 === arguments.length) return n.daysOfWeekDisabled.splice(0); if (!(e instanceof Array)) throw new TypeError("daysOfWeekDisabled() expects an array parameter"); return n.daysOfWeekDisabled = e.reduce(function (e, t) { return t = parseInt(t, 10), t > 6 || 0 > t || isNaN(t) ? e : (-1 === e.indexOf(t) && e.push(t), e) }, []).sort(), G(), p }, p.maxDate = function (e) { if (0 === arguments.length) return n.maxDate ? n.maxDate.clone() : n.maxDate; if ("boolean" == typeof e && e === !1) return n.maxDate = !1, G(), p; "string" == typeof e && ("now" === e || "moment" === e) && (e = t()); var a = tt(e); if (!a.isValid()) throw new TypeError("maxDate() Could not parse date parameter: " + e); if (n.minDate && a.isBefore(n.minDate)) throw new TypeError("maxDate() date parameter is before options.minDate: " + a.format(o)); return n.maxDate = a, n.maxDate.isBefore(e) && J(n.maxDate), c.isAfter(a) && (c = a.clone()), G(), p }, p.minDate = function (e) { if (0 === arguments.length) return n.minDate ? n.minDate.clone() : n.minDate; if ("boolean" == typeof e && e === !1) return n.minDate = !1, G(), p; "string" == typeof e && ("now" === e || "moment" === e) && (e = t()); var a = tt(e); if (!a.isValid()) throw new TypeError("minDate() Could not parse date parameter: " + e); if (n.maxDate && a.isAfter(n.maxDate)) throw new TypeError("minDate() date parameter is after options.maxDate: " + a.format(o)); return n.minDate = a, n.minDate.isAfter(e) && J(n.minDate), c.isBefore(a) && (c = a.clone()), G(), p }, p.defaultDate = function (e) { if (0 === arguments.length) return n.defaultDate ? n.defaultDate.clone() : n.defaultDate; if (!e) return n.defaultDate = !1, p; "string" == typeof e && ("now" === e || "moment" === e) && (e = t()); var a = tt(e); if (!a.isValid()) throw new TypeError("defaultDate() Could not parse date parameter: " + e); if (!W(a)) throw new TypeError("defaultDate() date passed is invalid according to component setup validations"); return n.defaultDate = a, n.defaultDate && "" === r.val().trim() && void 0 === r.attr("placeholder") && J(n.defaultDate), p }, p.locale = function (e) { if (0 === arguments.length) return n.locale; if (!t.localeData(e)) throw new TypeError("locale() locale " + e + " is not loaded from moment locales!"); return n.locale = e, l.locale(n.locale), c.locale(n.locale), o && dt(), m && (K(), _()), p }, p.stepping = function (e) { return 0 === arguments.length ? n.stepping : (e = parseInt(e, 10), (isNaN(e) || 1 > e) && (e = 1), n.stepping = e, p) }, p.useCurrent = function (e) { var t = ["year", "month", "day", "hour", "minute"]; if (0 === arguments.length) return n.useCurrent; if ("boolean" != typeof e && "string" != typeof e) throw new TypeError("useCurrent() expects a boolean or string parameter"); if ("string" == typeof e && -1 === t.indexOf(e.toLowerCase())) throw new TypeError("useCurrent() expects a string parameter of " + t.join(", ")); return n.useCurrent = e, p }, p.collapse = function (e) { if (0 === arguments.length) return n.collapse; if ("boolean" != typeof e) throw new TypeError("collapse() expects a boolean parameter"); return n.collapse === e ? p : (n.collapse = e, m && (K(), _()), p) }, p.icons = function (t) { if (0 === arguments.length) return e.extend({}, n.icons); if (!(t instanceof Object)) throw new TypeError("icons() expects parameter to be an Object"); return e.extend(n.icons, t), m && (K(), _()), p }, p.useStrict = function (e) { if (0 === arguments.length) return n.useStrict; if ("boolean" != typeof e) throw new TypeError("useStrict() expects a boolean parameter"); return n.useStrict = e, p }, p.sideBySide = function (e) { if (0 === arguments.length) return n.sideBySide; if ("boolean" != typeof e) throw new TypeError("sideBySide() expects a boolean parameter"); return n.sideBySide = e, m && (K(), _()), p }, p.viewMode = function (e) { if (0 === arguments.length) return n.viewMode; if ("string" != typeof e) throw new TypeError("viewMode() expects a string parameter"); if (-1 === y.indexOf(e)) throw new TypeError("viewMode() parameter must be one of (" + y.join(", ") + ") value"); return n.viewMode = e, d = Math.max(y.indexOf(e), h), I(), p }, p.toolbarPlacement = function (e) { if (0 === arguments.length) return n.toolbarPlacement; if ("string" != typeof e) throw new TypeError("toolbarPlacement() expects a string parameter"); if (-1 === v.indexOf(e)) throw new TypeError("toolbarPlacement() parameter must be one of (" + v.join(", ") + ") value"); return n.toolbarPlacement = e, m && (K(), _()), p }, p.widgetPositioning = function (t) { if (0 === arguments.length) return e.extend({}, n.widgetPositioning); if ("[object Object]" !== {}.toString.call(t)) throw new TypeError("widgetPositioning() expects an object variable"); if (t.horizontal) { if ("string" != typeof t.horizontal) throw new TypeError("widgetPositioning() horizontal variable must be a string"); if (t.horizontal = t.horizontal.toLowerCase(), -1 === b.indexOf(t.horizontal)) throw new TypeError("widgetPositioning() expects horizontal parameter to be one of (" + b.join(", ") + ")"); n.widgetPositioning.horizontal = t.horizontal } if (t.vertical) { if ("string" != typeof t.vertical) throw new TypeError("widgetPositioning() vertical variable must be a string"); if (t.vertical = t.vertical.toLowerCase(), -1 === w.indexOf(t.vertical)) throw new TypeError("widgetPositioning() expects vertical parameter to be one of (" + w.join(", ") + ")"); n.widgetPositioning.vertical = t.vertical } return G(), p }, p.calendarWeeks = function (e) { if (0 === arguments.length) return n.calendarWeeks; if ("boolean" != typeof e) throw new TypeError("calendarWeeks() expects parameter to be a boolean value"); return n.calendarWeeks = e, G(), p }, p.showTodayButton = function (e) { if (0 === arguments.length) return n.showTodayButton; if ("boolean" != typeof e) throw new TypeError("showTodayButton() expects a boolean parameter"); return n.showTodayButton = e, m && (K(), _()), p }, p.showClear = function (e) { if (0 === arguments.length) return n.showClear; if ("boolean" != typeof e) throw new TypeError("showClear() expects a boolean parameter"); return n.showClear = e, m && (K(), _()), p }, p.widgetParent = function (t) { if (0 === arguments.length) return n.widgetParent; if ("string" == typeof t && (t = e(t)), null !== t && "string" != typeof t && !(t instanceof e)) throw new TypeError("widgetParent() expects a string or a jQuery object parameter"); return n.widgetParent = t, m && (K(), _()), p }, p.keepOpen = function (e) { if (0 === arguments.length) return n.keepOpen; if ("boolean" != typeof e) throw new TypeError("keepOpen() expects a boolean parameter"); return n.keepOpen = e, p }, p.inline = function (e) { if (0 === arguments.length) return n.inline; if ("boolean" != typeof e) throw new TypeError("inline() expects a boolean parameter"); return n.inline = e, p }, p.clear = function () { return X(), p }, p.keyBinds = function (e) { return n.keyBinds = e, p }, p.debug = function (e) { if ("boolean" != typeof e) throw new TypeError("debug() expects a boolean parameter"); return n.debug = e, p }, p.showClose = function (e) { if (0 === arguments.length) return n.showClose; if ("boolean" != typeof e) throw new TypeError("showClose() expects a boolean parameter"); return n.showClose = e, p }, p.keepInvalid = function (e) { if (0 === arguments.length) return n.keepInvalid; if ("boolean" != typeof e) throw new TypeError("keepInvalid() expects a boolean parameter"); return n.keepInvalid = e, p }, p.datepickerInput = function (e) { if (0 === arguments.length) return n.datepickerInput; if ("string" != typeof e) throw new TypeError("datepickerInput() expects a string parameter"); return n.datepickerInput = e, p }, a.is("input")) r = a; else if (r = a.find(n.datepickerInput), 0 === r.size()) r = a.find("input"); else if (!r.is("input")) throw new Error('CSS class "' + n.datepickerInput + '" cannot be applied to non input element'); if (a.hasClass("input-group") && (f = a.find(0 === a.find(".datepickerbutton").size() ? '[class^="input-group-"]' : ".datepickerbutton")), !n.inline && !r.is("input")) throw new Error("Could not initialize DateTimePicker without an input element"); return e.extend(!0, n, B()), p.options(n), dt(), it(), r.prop("disabled") && p.disable(), r.is("input") && 0 !== r.val().trim().length ? J(tt(r.val().trim())) : n.defaultDate && void 0 === r.attr("placeholder") && J(n.defaultDate), n.inline && _(), p }; e.fn.datetimepicker = function (t) { return this.each(function () { var n = e(this); n.data("DateTimePicker") || (t = e.extend(!0, {}, e.fn.datetimepicker.defaults, t), n.data("DateTimePicker", a(n, t))) }) }, e.fn.datetimepicker.defaults = { format: !1, dayViewHeaderFormat: "MMMM YYYY", extraFormats: !1, stepping: 1, minDate: !1, maxDate: !1, useCurrent: !0, collapse: !0, locale: t.locale(), defaultDate: !1, disabledDates: !1, enabledDates: !1, icons: { time: "glyphicon glyphicon-time", date: "glyphicon glyphicon-calendar", up: "glyphicon glyphicon-chevron-up", down: "glyphicon glyphicon-chevron-down", previous: "glyphicon glyphicon-chevron-left", next: "glyphicon glyphicon-chevron-right", today: "glyphicon glyphicon-screenshot", clear: "glyphicon glyphicon-trash", close: "glyphicon glyphicon-remove" }, useStrict: !1, sideBySide: !1, daysOfWeekDisabled: [], calendarWeeks: !1, viewMode: "days", toolbarPlacement: "default", showTodayButton: !1, showClear: !1, showClose: !1, widgetPositioning: { horizontal: "auto", vertical: "auto" }, widgetParent: null, ignoreReadonly: !1, keepOpen: !1, inline: !1, keepInvalid: !1, datepickerInput: ".datepickerinput", keyBinds: { up: function (e) { if (e) { var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().subtract(7, "d") : a.clone().add(1, "m")) } }, down: function (e) { if (!e) return void this.show(); var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().add(7, "d") : a.clone().subtract(1, "m")) }, "control up": function (e) { if (e) { var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().subtract(1, "y") : a.clone().add(1, "h")) } }, "control down": function (e) { if (e) { var a = this.date() || t(); this.date(e.find(".datepicker").is(":visible") ? a.clone().add(1, "y") : a.clone().subtract(1, "h")) } }, left: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().subtract(1, "d")) } }, right: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().add(1, "d")) } }, pageUp: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().subtract(1, "M")) } }, pageDown: function (e) { if (e) { var a = this.date() || t(); e.find(".datepicker").is(":visible") && this.date(a.clone().add(1, "M")) } }, enter: function () { this.hide() }, escape: function () { this.hide() }, "control space": function (e) { e.find(".timepicker").is(":visible") && e.find('.btn[data-action="togglePeriod"]').click() }, t: function () { this.date(t()) }, "delete": function () { this.clear() } }, debug: !1 } });

        /*!
        * Datepicker for Bootstrap v1.6.0 (https://github.com/eternicode/bootstrap-datepicker)
        *
        * Copyright 2012 Stefan Petre
        * Improvements by Andrew Rowls
        * Licensed under the Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
        */
        !function (a) { "function" == typeof define && define.amd ? define(["jquery"], a) : a("object" == typeof exports ? require("jquery") : jQuery) }(function (a, b) {
            function c() { return new Date(Date.UTC.apply(Date, arguments)) } function d() { var a = new Date; return c(a.getFullYear(), a.getMonth(), a.getDate()) } function e(a, b) { return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate() } function f(a) { return function () { return this[a].apply(this, arguments) } } function g(a) { return a && !isNaN(a.getTime()) } function h(b, c) { function d(a, b) { return b.toLowerCase() } var e, f = a(b).data(), g = {}, h = new RegExp("^" + c.toLowerCase() + "([A-Z])"); c = new RegExp("^" + c.toLowerCase()); for (var i in f) c.test(i) && (e = i.replace(h, d), g[e] = f[i]); return g } function i(b) { var c = {}; if (q[b] || (b = b.split("-")[0], q[b])) { var d = q[b]; return a.each(p, function (a, b) { b in d && (c[b] = d[b]) }), c } } var j = function () { var b = { get: function (a) { return this.slice(a)[0] }, contains: function (a) { for (var b = a && a.valueOf(), c = 0, d = this.length; d > c; c++) if (this[c].valueOf() === b) return c; return -1 }, remove: function (a) { this.splice(a, 1) }, replace: function (b) { b && (a.isArray(b) || (b = [b]), this.clear(), this.push.apply(this, b)) }, clear: function () { this.length = 0 }, copy: function () { var a = new j; return a.replace(this), a } }; return function () { var c = []; return c.push.apply(c, arguments), a.extend(c, b), c } }(), k = function (b, c) { a(b).data("datepicker", this), this._process_options(c), this.dates = new j, this.viewDate = this.o.defaultViewDate, this.focusDate = null, this.element = a(b), this.isInline = !1, this.isInput = this.element.is("input"), this.component = this.element.hasClass("date") ? this.element.find(".add-on, .input-group-addon, .btn") : !1, this.hasInput = this.component && this.element.find("input").length, this.component && 0 === this.component.length && (this.component = !1), this.picker = a(r.template), this._check_template(this.o.templates.leftArrow) && this.picker.find(".prev").html(this.o.templates.leftArrow), this._check_template(this.o.templates.rightArrow) && this.picker.find(".next").html(this.o.templates.rightArrow), this._buildEvents(), this._attachEvents(), this.isInline ? this.picker.addClass("datepicker-inline").appendTo(this.element) : this.picker.addClass("datepicker-dropdown dropdown-menu"), this.o.rtl && this.picker.addClass("datepicker-rtl"), this.viewMode = this.o.startView, this.o.calendarWeeks && this.picker.find("thead .datepicker-title, tfoot .today, tfoot .clear").attr("colspan", function (a, b) { return parseInt(b) + 1 }), this._allow_update = !1, this.setStartDate(this._o.startDate), this.setEndDate(this._o.endDate), this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled), this.setDaysOfWeekHighlighted(this.o.daysOfWeekHighlighted), this.setDatesDisabled(this.o.datesDisabled), this.fillDow(), this.fillMonths(), this._allow_update = !0, this.update(), this.showMode(), this.isInline && this.show() }; k.prototype = { constructor: k, _resolveViewName: function (a, c) { return 0 === a || "days" === a || "month" === a ? 0 : 1 === a || "months" === a || "year" === a ? 1 : 2 === a || "years" === a || "decade" === a ? 2 : 3 === a || "decades" === a || "century" === a ? 3 : 4 === a || "centuries" === a || "millennium" === a ? 4 : c === b ? !1 : c }, _check_template: function (c) { try { if (c === b || "" === c) return !1; if ((c.match(/[<>]/g) || []).length <= 0) return !0; var d = a(c); return d.length > 0 } catch (e) { return !1 } }, _process_options: function (b) { this._o = a.extend({}, this._o, b); var e = this.o = a.extend({}, this._o), f = e.language; q[f] || (f = f.split("-")[0], q[f] || (f = o.language)), e.language = f, e.startView = this._resolveViewName(e.startView, 0), e.minViewMode = this._resolveViewName(e.minViewMode, 0), e.maxViewMode = this._resolveViewName(e.maxViewMode, 4), e.startView = Math.min(e.startView, e.maxViewMode), e.startView = Math.max(e.startView, e.minViewMode), e.multidate !== !0 && (e.multidate = Number(e.multidate) || !1, e.multidate !== !1 && (e.multidate = Math.max(0, e.multidate))), e.multidateSeparator = String(e.multidateSeparator), e.weekStart %= 7, e.weekEnd = (e.weekStart + 6) % 7; var g = r.parseFormat(e.format); if (e.startDate !== -(1 / 0) && (e.startDate ? e.startDate instanceof Date ? e.startDate = this._local_to_utc(this._zero_time(e.startDate)) : e.startDate = r.parseDate(e.startDate, g, e.language, e.assumeNearbyYear) : e.startDate = -(1 / 0)), e.endDate !== 1 / 0 && (e.endDate ? e.endDate instanceof Date ? e.endDate = this._local_to_utc(this._zero_time(e.endDate)) : e.endDate = r.parseDate(e.endDate, g, e.language, e.assumeNearbyYear) : e.endDate = 1 / 0), e.daysOfWeekDisabled = e.daysOfWeekDisabled || [], a.isArray(e.daysOfWeekDisabled) || (e.daysOfWeekDisabled = e.daysOfWeekDisabled.split(/[,\s]*/)), e.daysOfWeekDisabled = a.map(e.daysOfWeekDisabled, function (a) { return parseInt(a, 10) }), e.daysOfWeekHighlighted = e.daysOfWeekHighlighted || [], a.isArray(e.daysOfWeekHighlighted) || (e.daysOfWeekHighlighted = e.daysOfWeekHighlighted.split(/[,\s]*/)), e.daysOfWeekHighlighted = a.map(e.daysOfWeekHighlighted, function (a) { return parseInt(a, 10) }), e.datesDisabled = e.datesDisabled || [], !a.isArray(e.datesDisabled)) { var h = []; h.push(r.parseDate(e.datesDisabled, g, e.language, e.assumeNearbyYear)), e.datesDisabled = h } e.datesDisabled = a.map(e.datesDisabled, function (a) { return r.parseDate(a, g, e.language, e.assumeNearbyYear) }); var i = String(e.orientation).toLowerCase().split(/\s+/g), j = e.orientation.toLowerCase(); if (i = a.grep(i, function (a) { return /^auto|left|right|top|bottom$/.test(a) }), e.orientation = { x: "auto", y: "auto" }, j && "auto" !== j) if (1 === i.length) switch (i[0]) { case "top": case "bottom": e.orientation.y = i[0]; break; case "left": case "right": e.orientation.x = i[0] } else j = a.grep(i, function (a) { return /^left|right$/.test(a) }), e.orientation.x = j[0] || "auto", j = a.grep(i, function (a) { return /^top|bottom$/.test(a) }), e.orientation.y = j[0] || "auto"; else; if (e.defaultViewDate) { var k = e.defaultViewDate.year || (new Date).getFullYear(), l = e.defaultViewDate.month || 0, m = e.defaultViewDate.day || 1; e.defaultViewDate = c(k, l, m) } else e.defaultViewDate = d() }, _events: [], _secondaryEvents: [], _applyEvents: function (a) { for (var c, d, e, f = 0; f < a.length; f++) c = a[f][0], 2 === a[f].length ? (d = b, e = a[f][1]) : 3 === a[f].length && (d = a[f][1], e = a[f][2]), c.on(e, d) }, _unapplyEvents: function (a) { for (var c, d, e, f = 0; f < a.length; f++) c = a[f][0], 2 === a[f].length ? (e = b, d = a[f][1]) : 3 === a[f].length && (e = a[f][1], d = a[f][2]), c.off(d, e) }, _buildEvents: function () { var b = { keyup: a.proxy(function (b) { -1 === a.inArray(b.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) && this.update() }, this), keydown: a.proxy(this.keydown, this), paste: a.proxy(this.paste, this) }; this.o.showOnFocus === !0 && (b.focus = a.proxy(this.show, this)), this.isInput ? this._events = [[this.element, b]] : this.component && this.hasInput ? this._events = [[this.element.find("input"), b], [this.component, { click: a.proxy(this.show, this) }]] : this.element.is("div") ? this.isInline = !0 : this._events = [[this.element, { click: a.proxy(this.show, this) }]], this._events.push([this.element, "*", { blur: a.proxy(function (a) { this._focused_from = a.target }, this) }], [this.element, { blur: a.proxy(function (a) { this._focused_from = a.target }, this) }]), this.o.immediateUpdates && this._events.push([this.element, { "changeYear changeMonth": a.proxy(function (a) { this.update(a.date) }, this) }]), this._secondaryEvents = [[this.picker, { click: a.proxy(this.click, this) }], [a(window), { resize: a.proxy(this.place, this) }], [a(document), { mousedown: a.proxy(function (a) { this.element.is(a.target) || this.element.find(a.target).length || this.picker.is(a.target) || this.picker.find(a.target).length || this.picker.hasClass("datepicker-inline") || this.hide() }, this) }]] }, _attachEvents: function () { this._detachEvents(), this._applyEvents(this._events) }, _detachEvents: function () { this._unapplyEvents(this._events) }, _attachSecondaryEvents: function () { this._detachSecondaryEvents(), this._applyEvents(this._secondaryEvents) }, _detachSecondaryEvents: function () { this._unapplyEvents(this._secondaryEvents) }, _trigger: function (b, c) { var d = c || this.dates.get(-1), e = this._utc_to_local(d); this.element.trigger({ type: b, date: e, dates: a.map(this.dates, this._utc_to_local), format: a.proxy(function (a, b) { 0 === arguments.length ? (a = this.dates.length - 1, b = this.o.format) : "string" == typeof a && (b = a, a = this.dates.length - 1), b = b || this.o.format; var c = this.dates.get(a); return r.formatDate(c, b, this.o.language) }, this) }) }, show: function () { var b = this.component ? this.element.find("input") : this.element; if (!b.attr("readonly") || this.o.enableOnReadonly !== !1) return this.isInline || this.picker.appendTo(this.o.container), this.place(), this.picker.show(), this._attachSecondaryEvents(), this._trigger("show"), (window.navigator.msMaxTouchPoints || "ontouchstart" in document) && this.o.disableTouchKeyboard && a(this.element).blur(), this }, hide: function () { return this.isInline ? this : this.picker.is(":visible") ? (this.focusDate = null, this.picker.hide().detach(), this._detachSecondaryEvents(), this.viewMode = this.o.startView, this.showMode(), this.o.forceParse && (this.isInput && this.element.val() || this.hasInput && this.element.find("input").val()) && this.setValue(), this._trigger("hide"), this) : this }, destroy: function () { return this.hide(), this._detachEvents(), this._detachSecondaryEvents(), this.picker.remove(), delete this.element.data().datepicker, this.isInput || delete this.element.data().date, this }, paste: function (b) { var c; if (b.originalEvent.clipboardData && b.originalEvent.clipboardData.types && -1 !== a.inArray("text/plain", b.originalEvent.clipboardData.types)) c = b.originalEvent.clipboardData.getData("text/plain"); else { if (!window.clipboardData) return; c = window.clipboardData.getData("Text") } this.setDate(c), this.update(), b.preventDefault() }, _utc_to_local: function (a) { return a && new Date(a.getTime() + 6e4 * a.getTimezoneOffset()) }, _local_to_utc: function (a) { return a && new Date(a.getTime() - 6e4 * a.getTimezoneOffset()) }, _zero_time: function (a) { return a && new Date(a.getFullYear(), a.getMonth(), a.getDate()) }, _zero_utc_time: function (a) { return a && new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())) }, getDates: function () { return a.map(this.dates, this._utc_to_local) }, getUTCDates: function () { return a.map(this.dates, function (a) { return new Date(a) }) }, getDate: function () { return this._utc_to_local(this.getUTCDate()) }, getUTCDate: function () { var a = this.dates.get(-1); return "undefined" != typeof a ? new Date(a) : null }, clearDates: function () { var a; this.isInput ? a = this.element : this.component && (a = this.element.find("input")), a && a.val(""), this.update(), this._trigger("changeDate"), this.o.autoclose && this.hide() }, setDates: function () { var b = a.isArray(arguments[0]) ? arguments[0] : arguments; return this.update.apply(this, b), this._trigger("changeDate"), this.setValue(), this }, setUTCDates: function () { var b = a.isArray(arguments[0]) ? arguments[0] : arguments; return this.update.apply(this, a.map(b, this._utc_to_local)), this._trigger("changeDate"), this.setValue(), this }, setDate: f("setDates"), setUTCDate: f("setUTCDates"), remove: f("destroy"), setValue: function () { var a = this.getFormattedDate(); return this.isInput ? this.element.val(a) : this.component && this.element.find("input").val(a), this }, getFormattedDate: function (c) { c === b && (c = this.o.format); var d = this.o.language; return a.map(this.dates, function (a) { return r.formatDate(a, c, d) }).join(this.o.multidateSeparator) }, getStartDate: function () { return this.o.startDate }, setStartDate: function (a) { return this._process_options({ startDate: a }), this.update(), this.updateNavArrows(), this }, getEndDate: function () { return this.o.endDate }, setEndDate: function (a) { return this._process_options({ endDate: a }), this.update(), this.updateNavArrows(), this }, setDaysOfWeekDisabled: function (a) { return this._process_options({ daysOfWeekDisabled: a }), this.update(), this.updateNavArrows(), this }, setDaysOfWeekHighlighted: function (a) { return this._process_options({ daysOfWeekHighlighted: a }), this.update(), this }, setDatesDisabled: function (a) { this._process_options({ datesDisabled: a }), this.update(), this.updateNavArrows() }, place: function () { if (this.isInline) return this; var b = this.picker.outerWidth(), c = this.picker.outerHeight(), d = 10, e = a(this.o.container), f = e.width(), g = "body" === this.o.container ? a(document).scrollTop() : e.scrollTop(), h = e.offset(), i = []; this.element.parents().each(function () { var b = a(this).css("z-index"); "auto" !== b && 0 !== b && i.push(parseInt(b)) }); var j = Math.max.apply(Math, i) + this.o.zIndexOffset, k = this.component ? this.component.parent().offset() : this.element.offset(), l = this.component ? this.component.outerHeight(!0) : this.element.outerHeight(!1), m = this.component ? this.component.outerWidth(!0) : this.element.outerWidth(!1), n = k.left - h.left, o = k.top - h.top; "body" !== this.o.container && (o += g), this.picker.removeClass("datepicker-orient-top datepicker-orient-bottom datepicker-orient-right datepicker-orient-left"), "auto" !== this.o.orientation.x ? (this.picker.addClass("datepicker-orient-" + this.o.orientation.x), "right" === this.o.orientation.x && (n -= b - m)) : k.left < 0 ? (this.picker.addClass("datepicker-orient-left"), n -= k.left - d) : n + b > f ? (this.picker.addClass("datepicker-orient-right"), n += m - b) : this.picker.addClass("datepicker-orient-left"); var p, q = this.o.orientation.y; if ("auto" === q && (p = -g + o - c, q = 0 > p ? "bottom" : "top"), this.picker.addClass("datepicker-orient-" + q), "top" === q ? o -= c + parseInt(this.picker.css("padding-top")) : o += l, this.o.rtl) { var r = f - (n + m); this.picker.css({ top: o, right: r, zIndex: j }) } else this.picker.css({ top: o, left: n, zIndex: j }); return this }, _allow_update: !0, update: function () { if (!this._allow_update) return this; var b = this.dates.copy(), c = [], d = !1; return arguments.length ? (a.each(arguments, a.proxy(function (a, b) { b instanceof Date && (b = this._local_to_utc(b)), c.push(b) }, this)), d = !0) : (c = this.isInput ? this.element.val() : this.element.data("date") || this.element.find("input").val(), c = c && this.o.multidate ? c.split(this.o.multidateSeparator) : [c], delete this.element.data().date), c = a.map(c, a.proxy(function (a) { return r.parseDate(a, this.o.format, this.o.language, this.o.assumeNearbyYear) }, this)), c = a.grep(c, a.proxy(function (a) { return !this.dateWithinRange(a) || !a }, this), !0), this.dates.replace(c), this.dates.length ? this.viewDate = new Date(this.dates.get(-1)) : this.viewDate < this.o.startDate ? this.viewDate = new Date(this.o.startDate) : this.viewDate > this.o.endDate ? this.viewDate = new Date(this.o.endDate) : this.viewDate = this.o.defaultViewDate, d ? this.setValue() : c.length && String(b) !== String(this.dates) && this._trigger("changeDate"), !this.dates.length && b.length && this._trigger("clearDate"), this.fill(), this.element.change(), this }, fillDow: function () { var b = this.o.weekStart, c = "<tr>"; for (this.o.calendarWeeks && (this.picker.find(".datepicker-days .datepicker-switch").attr("colspan", function (a, b) { return parseInt(b) + 1 }), c += '<th class="cw">&#160;</th>'); b < this.o.weekStart + 7;) c += '<th class="dow', a.inArray(b, this.o.daysOfWeekDisabled) > -1 && (c += " disabled"), c += '">' + q[this.o.language].daysMin[b++ % 7] + "</th>"; c += "</tr>", this.picker.find(".datepicker-days thead").append(c) }, fillMonths: function () { for (var a = this._utc_to_local(this.viewDate), b = "", c = 0; 12 > c;) { var d = a && a.getMonth() === c ? " focused" : ""; b += '<span class="month' + d + '">' + q[this.o.language].monthsShort[c++] + "</span>" } this.picker.find(".datepicker-months td").html(b) }, setRange: function (b) { b && b.length ? this.range = a.map(b, function (a) { return a.valueOf() }) : delete this.range, this.fill() }, getClassNames: function (b) { var c = [], d = this.viewDate.getUTCFullYear(), e = this.viewDate.getUTCMonth(), f = new Date; return b.getUTCFullYear() < d || b.getUTCFullYear() === d && b.getUTCMonth() < e ? c.push("old") : (b.getUTCFullYear() > d || b.getUTCFullYear() === d && b.getUTCMonth() > e) && c.push("new"), this.focusDate && b.valueOf() === this.focusDate.valueOf() && c.push("focused"), this.o.todayHighlight && b.getUTCFullYear() === f.getFullYear() && b.getUTCMonth() === f.getMonth() && b.getUTCDate() === f.getDate() && c.push("today"), -1 !== this.dates.contains(b) && c.push("active"), (!this.dateWithinRange(b) || this.dateIsDisabled(b)) && c.push("disabled"), -1 !== a.inArray(b.getUTCDay(), this.o.daysOfWeekHighlighted) && c.push("highlighted"), this.range && (b > this.range[0] && b < this.range[this.range.length - 1] && c.push("range"), -1 !== a.inArray(b.valueOf(), this.range) && c.push("selected"), b.valueOf() === this.range[0] && c.push("range-start"), b.valueOf() === this.range[this.range.length - 1] && c.push("range-end")), c }, _fill_yearsView: function (c, d, e, f, g, h, i, j) { var k, l, m, n, o, p, q, r, s, t, u; for (k = "", l = this.picker.find(c), m = parseInt(g / e, 10) * e, o = parseInt(h / f, 10) * f, p = parseInt(i / f, 10) * f, n = a.map(this.dates, function (a) { return parseInt(a.getUTCFullYear() / f, 10) * f }), l.find(".datepicker-switch").text(m + "-" + (m + 9 * f)), q = m - f, r = -1; 11 > r; r += 1) s = [d], t = null, -1 === r ? s.push("old") : 10 === r && s.push("new"), -1 !== a.inArray(q, n) && s.push("active"), (o > q || q > p) && s.push("disabled"), q === this.viewDate.getFullYear() && s.push("focused"), j !== a.noop && (u = j(new Date(q, 0, 1)), u === b ? u = {} : "boolean" == typeof u ? u = { enabled: u } : "string" == typeof u && (u = { classes: u }), u.enabled === !1 && s.push("disabled"), u.classes && (s = s.concat(u.classes.split(/\s+/))), u.tooltip && (t = u.tooltip)), k += '<span class="' + s.join(" ") + '"' + (t ? ' title="' + t + '"' : "") + ">" + q + "</span>", q += f; l.find("td").html(k) }, fill: function () { var d, e, f = new Date(this.viewDate), g = f.getUTCFullYear(), h = f.getUTCMonth(), i = this.o.startDate !== -(1 / 0) ? this.o.startDate.getUTCFullYear() : -(1 / 0), j = this.o.startDate !== -(1 / 0) ? this.o.startDate.getUTCMonth() : -(1 / 0), k = this.o.endDate !== 1 / 0 ? this.o.endDate.getUTCFullYear() : 1 / 0, l = this.o.endDate !== 1 / 0 ? this.o.endDate.getUTCMonth() : 1 / 0, m = q[this.o.language].today || q.en.today || "", n = q[this.o.language].clear || q.en.clear || "", o = q[this.o.language].titleFormat || q.en.titleFormat; if (!isNaN(g) && !isNaN(h)) { this.picker.find(".datepicker-days .datepicker-switch").text(r.formatDate(f, o, this.o.language)), this.picker.find("tfoot .today").text(m).toggle(this.o.todayBtn !== !1), this.picker.find("tfoot .clear").text(n).toggle(this.o.clearBtn !== !1), this.picker.find("thead .datepicker-title").text(this.o.title).toggle("" !== this.o.title), this.updateNavArrows(), this.fillMonths(); var p = c(g, h - 1, 28), s = r.getDaysInMonth(p.getUTCFullYear(), p.getUTCMonth()); p.setUTCDate(s), p.setUTCDate(s - (p.getUTCDay() - this.o.weekStart + 7) % 7); var t = new Date(p); p.getUTCFullYear() < 100 && t.setUTCFullYear(p.getUTCFullYear()), t.setUTCDate(t.getUTCDate() + 42), t = t.valueOf(); for (var u, v = []; p.valueOf() < t;) { if (p.getUTCDay() === this.o.weekStart && (v.push("<tr>"), this.o.calendarWeeks)) { var w = new Date(+p + (this.o.weekStart - p.getUTCDay() - 7) % 7 * 864e5), x = new Date(Number(w) + (11 - w.getUTCDay()) % 7 * 864e5), y = new Date(Number(y = c(x.getUTCFullYear(), 0, 1)) + (11 - y.getUTCDay()) % 7 * 864e5), z = (x - y) / 864e5 / 7 + 1; v.push('<td class="cw">' + z + "</td>") } u = this.getClassNames(p), u.push("day"), this.o.beforeShowDay !== a.noop && (e = this.o.beforeShowDay(this._utc_to_local(p)), e === b ? e = {} : "boolean" == typeof e ? e = { enabled: e } : "string" == typeof e && (e = { classes: e }), e.enabled === !1 && u.push("disabled"), e.classes && (u = u.concat(e.classes.split(/\s+/))), e.tooltip && (d = e.tooltip)), u = a.unique(u), v.push('<td class="' + u.join(" ") + '"' + (d ? ' title="' + d + '"' : "") + ">" + p.getUTCDate() + "</td>"), d = null, p.getUTCDay() === this.o.weekEnd && v.push("</tr>"), p.setUTCDate(p.getUTCDate() + 1) } this.picker.find(".datepicker-days tbody").empty().append(v.join("")); var A = q[this.o.language].monthsTitle || q.en.monthsTitle || "Months", B = this.picker.find(".datepicker-months").find(".datepicker-switch").text(this.o.maxViewMode < 2 ? A : g).end().find("span").removeClass("active"); if (a.each(this.dates, function (a, b) { b.getUTCFullYear() === g && B.eq(b.getUTCMonth()).addClass("active") }), (i > g || g > k) && B.addClass("disabled"), g === i && B.slice(0, j).addClass("disabled"), g === k && B.slice(l + 1).addClass("disabled"), this.o.beforeShowMonth !== a.noop) { var C = this; a.each(B, function (c, d) { var e = new Date(g, c, 1), f = C.o.beforeShowMonth(e); f === b ? f = {} : "boolean" == typeof f ? f = { enabled: f } : "string" == typeof f && (f = { classes: f }), f.enabled !== !1 || a(d).hasClass("disabled") || a(d).addClass("disabled"), f.classes && a(d).addClass(f.classes), f.tooltip && a(d).prop("title", f.tooltip) }) } this._fill_yearsView(".datepicker-years", "year", 10, 1, g, i, k, this.o.beforeShowYear), this._fill_yearsView(".datepicker-decades", "decade", 100, 10, g, i, k, this.o.beforeShowDecade), this._fill_yearsView(".datepicker-centuries", "century", 1e3, 100, g, i, k, this.o.beforeShowCentury) } }, updateNavArrows: function () { if (this._allow_update) { var a = new Date(this.viewDate), b = a.getUTCFullYear(), c = a.getUTCMonth(); switch (this.viewMode) { case 0: this.o.startDate !== -(1 / 0) && b <= this.o.startDate.getUTCFullYear() && c <= this.o.startDate.getUTCMonth() ? this.picker.find(".prev").css({ visibility: "hidden" }) : this.picker.find(".prev").css({ visibility: "visible" }), this.o.endDate !== 1 / 0 && b >= this.o.endDate.getUTCFullYear() && c >= this.o.endDate.getUTCMonth() ? this.picker.find(".next").css({ visibility: "hidden" }) : this.picker.find(".next").css({ visibility: "visible" }); break; case 1: case 2: case 3: case 4: this.o.startDate !== -(1 / 0) && b <= this.o.startDate.getUTCFullYear() || this.o.maxViewMode < 2 ? this.picker.find(".prev").css({ visibility: "hidden" }) : this.picker.find(".prev").css({ visibility: "visible" }), this.o.endDate !== 1 / 0 && b >= this.o.endDate.getUTCFullYear() || this.o.maxViewMode < 2 ? this.picker.find(".next").css({ visibility: "hidden" }) : this.picker.find(".next").css({ visibility: "visible" }) } } }, click: function (b) { b.preventDefault(), b.stopPropagation(); var e, f, g, h, i, j, k; e = a(b.target), e.hasClass("datepicker-switch") && this.showMode(1); var l = e.closest(".prev, .next"); l.length > 0 && (f = r.modes[this.viewMode].navStep * (l.hasClass("prev") ? -1 : 1), 0 === this.viewMode ? (this.viewDate = this.moveMonth(this.viewDate, f), this._trigger("changeMonth", this.viewDate)) : (this.viewDate = this.moveYear(this.viewDate, f), 1 === this.viewMode && this._trigger("changeYear", this.viewDate)), this.fill()), e.hasClass("today") && (this.showMode(-2), this._setDate(d(), "linked" === this.o.todayBtn ? null : "view")), e.hasClass("clear") && this.clearDates(), e.hasClass("disabled") || (e.hasClass("day") && (g = parseInt(e.text(), 10) || 1, h = this.viewDate.getUTCFullYear(), i = this.viewDate.getUTCMonth(), e.hasClass("old") && (0 === i ? (i = 11, h -= 1, j = !0, k = !0) : (i -= 1, j = !0)), e.hasClass("new") && (11 === i ? (i = 0, h += 1, j = !0, k = !0) : (i += 1, j = !0)), this._setDate(c(h, i, g)), k && this._trigger("changeYear", this.viewDate), j && this._trigger("changeMonth", this.viewDate)), e.hasClass("month") && (this.viewDate.setUTCDate(1), g = 1, i = e.parent().find("span").index(e), h = this.viewDate.getUTCFullYear(), this.viewDate.setUTCMonth(i), this._trigger("changeMonth", this.viewDate), 1 === this.o.minViewMode ? (this._setDate(c(h, i, g)), this.showMode()) : this.showMode(-1), this.fill()), (e.hasClass("year") || e.hasClass("decade") || e.hasClass("century")) && (this.viewDate.setUTCDate(1), g = 1, i = 0, h = parseInt(e.text(), 10) || 0, this.viewDate.setUTCFullYear(h), e.hasClass("year") && (this._trigger("changeYear", this.viewDate), 2 === this.o.minViewMode && this._setDate(c(h, i, g))), e.hasClass("decade") && (this._trigger("changeDecade", this.viewDate), 3 === this.o.minViewMode && this._setDate(c(h, i, g))), e.hasClass("century") && (this._trigger("changeCentury", this.viewDate), 4 === this.o.minViewMode && this._setDate(c(h, i, g))), this.showMode(-1), this.fill())), this.picker.is(":visible") && this._focused_from && a(this._focused_from).focus(), delete this._focused_from }, _toggle_multidate: function (a) { var b = this.dates.contains(a); if (a || this.dates.clear(), -1 !== b ? (this.o.multidate === !0 || this.o.multidate > 1 || this.o.toggleActive) && this.dates.remove(b) : this.o.multidate === !1 ? (this.dates.clear(), this.dates.push(a)) : this.dates.push(a), "number" == typeof this.o.multidate) for (; this.dates.length > this.o.multidate;) this.dates.remove(0) }, _setDate: function (a, b) { b && "date" !== b || this._toggle_multidate(a && new Date(a)), b && "view" !== b || (this.viewDate = a && new Date(a)), this.fill(), this.setValue(), b && "view" === b || this._trigger("changeDate"); var c; this.isInput ? c = this.element : this.component && (c = this.element.find("input")), c && c.change(), !this.o.autoclose || b && "date" !== b || this.hide() }, moveDay: function (a, b) { var c = new Date(a); return c.setUTCDate(a.getUTCDate() + b), c }, moveWeek: function (a, b) { return this.moveDay(a, 7 * b) }, moveMonth: function (a, b) { if (!g(a)) return this.o.defaultViewDate; if (!b) return a; var c, d, e = new Date(a.valueOf()), f = e.getUTCDate(), h = e.getUTCMonth(), i = Math.abs(b); if (b = b > 0 ? 1 : -1, 1 === i) d = -1 === b ? function () { return e.getUTCMonth() === h } : function () { return e.getUTCMonth() !== c }, c = h + b, e.setUTCMonth(c), (0 > c || c > 11) && (c = (c + 12) % 12); else { for (var j = 0; i > j; j++) e = this.moveMonth(e, b); c = e.getUTCMonth(), e.setUTCDate(f), d = function () { return c !== e.getUTCMonth() } } for (; d();) e.setUTCDate(--f), e.setUTCMonth(c); return e }, moveYear: function (a, b) { return this.moveMonth(a, 12 * b) }, moveAvailableDate: function (a, b, c) { do { if (a = this[c](a, b), !this.dateWithinRange(a)) return !1; c = "moveDay" } while (this.dateIsDisabled(a)); return a }, weekOfDateIsDisabled: function (b) { return -1 !== a.inArray(b.getUTCDay(), this.o.daysOfWeekDisabled) }, dateIsDisabled: function (b) { return this.weekOfDateIsDisabled(b) || a.grep(this.o.datesDisabled, function (a) { return e(b, a) }).length > 0 }, dateWithinRange: function (a) { return a >= this.o.startDate && a <= this.o.endDate }, keydown: function (a) { if (!this.picker.is(":visible")) return void ((40 === a.keyCode || 27 === a.keyCode) && (this.show(), a.stopPropagation())); var b, c, d = !1, e = this.focusDate || this.viewDate; switch (a.keyCode) { case 27: this.focusDate ? (this.focusDate = null, this.viewDate = this.dates.get(-1) || this.viewDate, this.fill()) : this.hide(), a.preventDefault(), a.stopPropagation(); break; case 37: case 38: case 39: case 40: if (!this.o.keyboardNavigation || 7 === this.o.daysOfWeekDisabled.length) break; b = 37 === a.keyCode || 38 === a.keyCode ? -1 : 1, 0 === this.viewMode ? a.ctrlKey ? (c = this.moveAvailableDate(e, b, "moveYear"), c && this._trigger("changeYear", this.viewDate)) : a.shiftKey ? (c = this.moveAvailableDate(e, b, "moveMonth"), c && this._trigger("changeMonth", this.viewDate)) : 37 === a.keyCode || 39 === a.keyCode ? c = this.moveAvailableDate(e, b, "moveDay") : this.weekOfDateIsDisabled(e) || (c = this.moveAvailableDate(e, b, "moveWeek")) : 1 === this.viewMode ? ((38 === a.keyCode || 40 === a.keyCode) && (b = 4 * b), c = this.moveAvailableDate(e, b, "moveMonth")) : 2 === this.viewMode && ((38 === a.keyCode || 40 === a.keyCode) && (b = 4 * b), c = this.moveAvailableDate(e, b, "moveYear")), c && (this.focusDate = this.viewDate = c, this.setValue(), this.fill(), a.preventDefault()); break; case 13: if (!this.o.forceParse) break; e = this.focusDate || this.dates.get(-1) || this.viewDate, this.o.keyboardNavigation && (this._toggle_multidate(e), d = !0), this.focusDate = null, this.viewDate = this.dates.get(-1) || this.viewDate, this.setValue(), this.fill(), this.picker.is(":visible") && (a.preventDefault(), a.stopPropagation(), this.o.autoclose && this.hide()); break; case 9: this.focusDate = null, this.viewDate = this.dates.get(-1) || this.viewDate, this.fill(), this.hide() } if (d) { this.dates.length ? this._trigger("changeDate") : this._trigger("clearDate"); var f; this.isInput ? f = this.element : this.component && (f = this.element.find("input")), f && f.change() } }, showMode: function (a) { a && (this.viewMode = Math.max(this.o.minViewMode, Math.min(this.o.maxViewMode, this.viewMode + a))), this.picker.children("div").hide().filter(".datepicker-" + r.modes[this.viewMode].clsName).show(), this.updateNavArrows() } }; var l = function (b, c) { a(b).data("datepicker", this), this.element = a(b), this.inputs = a.map(c.inputs, function (a) { return a.jquery ? a[0] : a }), delete c.inputs, n.call(a(this.inputs), c).on("changeDate", a.proxy(this.dateUpdated, this)), this.pickers = a.map(this.inputs, function (b) { return a(b).data("datepicker") }), this.updateDates() }; l.prototype = { updateDates: function () { this.dates = a.map(this.pickers, function (a) { return a.getUTCDate() }), this.updateRanges() }, updateRanges: function () { var b = a.map(this.dates, function (a) { return a.valueOf() }); a.each(this.pickers, function (a, c) { c.setRange(b) }) }, dateUpdated: function (b) { if (!this.updating) { this.updating = !0; var c = a(b.target).data("datepicker"); if ("undefined" != typeof c) { var d = c.getUTCDate(), e = a.inArray(b.target, this.inputs), f = e - 1, g = e + 1, h = this.inputs.length; if (-1 !== e) { if (a.each(this.pickers, function (a, b) { b.getUTCDate() || b.setUTCDate(d) }), d < this.dates[f]) for (; f >= 0 && d < this.dates[f];) this.pickers[f--].setUTCDate(d); else if (d > this.dates[g]) for (; h > g && d > this.dates[g];) this.pickers[g++].setUTCDate(d); this.updateDates(), delete this.updating } } } }, remove: function () { a.map(this.pickers, function (a) { a.remove() }), delete this.element.data().datepicker } }; var m = a.fn.datepicker, n = function (c) { var d = Array.apply(null, arguments); d.shift(); var e; if (this.each(function () { var b = a(this), f = b.data("datepicker"), g = "object" == typeof c && c; if (!f) { var j = h(this, "date"), m = a.extend({}, o, j, g), n = i(m.language), p = a.extend({}, o, n, j, g); b.hasClass("input-daterange") || p.inputs ? (a.extend(p, { inputs: p.inputs || b.find("input").toArray() }), f = new l(this, p)) : f = new k(this, p), b.data("datepicker", f) } "string" == typeof c && "function" == typeof f[c] && (e = f[c].apply(f, d)) }), e === b || e instanceof k || e instanceof l) return this; if (this.length > 1) throw new Error("Using only allowed for the collection of a single element (" + c + " function)"); return e }; a.fn.datepicker = n; var o = a.fn.datepicker.defaults = { assumeNearbyYear: !1, autoclose: !1, beforeShowDay: a.noop, beforeShowMonth: a.noop, beforeShowYear: a.noop, beforeShowDecade: a.noop, beforeShowCentury: a.noop, calendarWeeks: !1, clearBtn: !1, toggleActive: !1, daysOfWeekDisabled: [], daysOfWeekHighlighted: [], datesDisabled: [], endDate: 1 / 0, forceParse: !0, format: "mm/dd/yyyy", keyboardNavigation: !0, language: "en", minViewMode: 0, maxViewMode: 4, multidate: !1, multidateSeparator: ",", orientation: "auto", rtl: !1, startDate: -(1 / 0), startView: 0, todayBtn: !1, todayHighlight: !1, weekStart: 0, disableTouchKeyboard: !1, enableOnReadonly: !0, showOnFocus: !0, zIndexOffset: 10, container: "body", immediateUpdates: !1, title: "", templates: { leftArrow: "&laquo;", rightArrow: "&raquo;" } }, p = a.fn.datepicker.locale_opts = ["format", "rtl", "weekStart"]; a.fn.datepicker.Constructor = k; var q = a.fn.datepicker.dates = { en: { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], today: "Today", clear: "Clear", titleFormat: "MM yyyy" } }, r = {
                modes: [{ clsName: "days", navFnc: "Month", navStep: 1 }, { clsName: "months", navFnc: "FullYear", navStep: 1 }, { clsName: "years", navFnc: "FullYear", navStep: 10 }, { clsName: "decades", navFnc: "FullDecade", navStep: 100 }, { clsName: "centuries", navFnc: "FullCentury", navStep: 1e3 }], isLeapYear: function (a) { return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0 }, getDaysInMonth: function (a, b) { return [31, r.isLeapYear(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][b] }, validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g, nonpunctuation: /[^ -\/:-@\u5e74\u6708\u65e5\[-`{-~\t\n\r]+/g, parseFormat: function (a) { if ("function" == typeof a.toValue && "function" == typeof a.toDisplay) return a; var b = a.replace(this.validParts, "\x00").split("\x00"), c = a.match(this.validParts); if (!b || !b.length || !c || 0 === c.length) throw new Error("Invalid date format."); return { separators: b, parts: c } }, parseDate: function (e, f, g, h) {
                    function i(a, b) { return b === !0 && (b = 10), 100 > a && (a += 2e3, a > (new Date).getFullYear() + b && (a -= 100)), a } function j() { var a = this.slice(0, s[n].length), b = s[n].slice(0, a.length); return a.toLowerCase() === b.toLowerCase() } if (!e) return b; if (e instanceof Date) return e; if ("string" == typeof f && (f = r.parseFormat(f)), f.toValue) return f.toValue(e, f, g); var l, m, n, o, p = /([\-+]\d+)([dmwy])/, s = e.match(/([\-+]\d+)([dmwy])/g), t = { d: "moveDay", m: "moveMonth", w: "moveWeek", y: "moveYear" }, u = { yesterday: "-1d", today: "+0d", tomorrow: "+1d" }; if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(e)) { for (e = new Date, n = 0; n < s.length; n++) l = p.exec(s[n]), m = parseInt(l[1]), o = t[l[2]], e = k.prototype[o](e, m); return c(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()) } if ("undefined" != typeof u[e] && (e = u[e], s = e.match(/([\-+]\d+)([dmwy])/g), /^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(e))) { for (e = new Date, n = 0; n < s.length; n++) l = p.exec(s[n]), m = parseInt(l[1]), o = t[l[2]], e = k.prototype[o](e, m); return c(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()) } s = e && e.match(this.nonpunctuation) || [], e = new Date; var v, w, x = {}, y = ["yyyy", "yy", "M", "MM", "m", "mm", "d", "dd"], z = { yyyy: function (a, b) { return a.setUTCFullYear(h ? i(b, h) : b) }, yy: function (a, b) { return a.setUTCFullYear(h ? i(b, h) : b) }, m: function (a, b) { if (isNaN(a)) return a; for (b -= 1; 0 > b;) b += 12; for (b %= 12, a.setUTCMonth(b); a.getUTCMonth() !== b;) a.setUTCDate(a.getUTCDate() - 1); return a }, d: function (a, b) { return a.setUTCDate(b) } }; z.M = z.MM = z.mm = z.m, z.dd = z.d, e = d(); var A = f.parts.slice(); if (s.length !== A.length && (A = a(A).filter(function (b, c) { return -1 !== a.inArray(c, y) }).toArray()), s.length === A.length) {
                        var B; for (n = 0, B = A.length; B > n; n++) {
                            if (v = parseInt(s[n], 10), l = A[n], isNaN(v)) switch (l) {
                                case "MM": w = a(q[g].months).filter(j), v = a.inArray(w[0], q[g].months) + 1; break; case "M": w = a(q[g].monthsShort).filter(j), v = a.inArray(w[0], q[g].monthsShort) + 1;
                            } x[l] = v
                        } var C, D; for (n = 0; n < y.length; n++) D = y[n], D in x && !isNaN(x[D]) && (C = new Date(e), z[D](C, x[D]), isNaN(C) || (e = C))
                    } return e
                }, formatDate: function (b, c, d) { if (!b) return ""; if ("string" == typeof c && (c = r.parseFormat(c)), c.toDisplay) return c.toDisplay(b, c, d); var e = { d: b.getUTCDate(), D: q[d].daysShort[b.getUTCDay()], DD: q[d].days[b.getUTCDay()], m: b.getUTCMonth() + 1, M: q[d].monthsShort[b.getUTCMonth()], MM: q[d].months[b.getUTCMonth()], yy: b.getUTCFullYear().toString().substring(2), yyyy: b.getUTCFullYear() }; e.dd = (e.d < 10 ? "0" : "") + e.d, e.mm = (e.m < 10 ? "0" : "") + e.m, b = []; for (var f = a.extend([], c.separators), g = 0, h = c.parts.length; h >= g; g++) f.length && b.push(f.shift()), b.push(e[c.parts[g]]); return b.join("") }, headTemplate: '<thead><tr><th colspan="7" class="datepicker-title"></th></tr><tr><th class="prev">&laquo;</th><th colspan="5" class="datepicker-switch"></th><th class="next">&raquo;</th></tr></thead>', contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>', footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'
            }; r.template = '<div class="datepicker"><div class="datepicker-days"><table class=" table-condensed">' + r.headTemplate + "<tbody></tbody>" + r.footTemplate + '</table></div><div class="datepicker-months"><table class="table-condensed">' + r.headTemplate + r.contTemplate + r.footTemplate + '</table></div><div class="datepicker-years"><table class="table-condensed">' + r.headTemplate + r.contTemplate + r.footTemplate + '</table></div><div class="datepicker-decades"><table class="table-condensed">' + r.headTemplate + r.contTemplate + r.footTemplate + '</table></div><div class="datepicker-centuries"><table class="table-condensed">' + r.headTemplate + r.contTemplate + r.footTemplate + "</table></div></div>", a.fn.datepicker.DPGlobal = r, a.fn.datepicker.noConflict = function () { return a.fn.datepicker = m, this }, a.fn.datepicker.version = "1.6.0", a(document).on("focus.datepicker.data-api click.datepicker.data-api", '[data-provide="datepicker"]', function (b) { var c = a(this); c.data("datepicker") || (b.preventDefault(), n.call(c, "show")) }), a(function () { n.call(a('[data-provide="datepicker-inline"]')) })
        });

        if (HawkSearch.loadPlugins.alertify == true) {
            /*! alertifyjs - v1.8.0 - Mohammad Younes <Mohammad@alertifyjs.com> (http://alertifyjs.com) */
            !function (a) {
                "use strict"; function b(a, b) { a.className += " " + b } function c(a, b) { for (var c = a.className.split(" "), d = b.split(" "), e = 0; e < d.length; e += 1) { var f = c.indexOf(d[e]); f > -1 && c.splice(f, 1) } a.className = c.join(" ") } function d() { return "rtl" === a.getComputedStyle(document.body).direction } function e() { return document.documentElement && document.documentElement.scrollTop || document.body.scrollTop } function f() { return document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft } function g(a) { for (; a.lastChild;) a.removeChild(a.lastChild) } function h(a) { if (null === a) return a; var b; if (Array.isArray(a)) { b = []; for (var c = 0; c < a.length; c += 1) b.push(h(a[c])); return b } if (a instanceof Date) return new Date(a.getTime()); if (a instanceof RegExp) return b = new RegExp(a.source), b.global = a.global, b.ignoreCase = a.ignoreCase, b.multiline = a.multiline, b.lastIndex = a.lastIndex, b; if ("object" == typeof a) { b = {}; for (var d in a) a.hasOwnProperty(d) && (b[d] = h(a[d])); return b } return a } function i(a, b) { var c = a.elements.root; c.parentNode.removeChild(c), delete a.elements, a.settings = h(a.__settings), a.__init = b, delete a.__internal } function j(a, b) { return function () { if (arguments.length > 0) { for (var c = [], d = 0; d < arguments.length; d += 1) c.push(arguments[d]); return c.push(a), b.apply(a, c) } return b.apply(a, [null, a]) } } function k(a, b) { return { index: a, button: b, cancel: !1 } } function l(a, b) { "function" == typeof b.get(a) && b.get(a).call(b) } function m() { function a(a, b) { for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]); return a } function b(a) { var b = d[a].dialog; return b && "function" == typeof b.__init && b.__init(b), b } function c(b, c, e, f) { var g = { dialog: null, factory: c }; return void 0 !== f && (g.factory = function () { return a(new d[f].factory, new c) }), e || (g.dialog = a(new g.factory, t)), d[b] = g } var d = {}; return { defaults: o, dialog: function (d, e, f, g) { if ("function" != typeof e) return b(d); if (this.hasOwnProperty(d)) throw new Error("alertify.dialog: name already exists"); var h = c(d, e, f, g); f ? this[d] = function () { if (0 === arguments.length) return h.dialog; var b = a(new h.factory, t); return b && "function" == typeof b.__init && b.__init(b), b.main.apply(b, arguments), b.show.apply(b) } : this[d] = function () { if (h.dialog && "function" == typeof h.dialog.__init && h.dialog.__init(h.dialog), 0 === arguments.length) return h.dialog; var a = h.dialog; return a.main.apply(h.dialog, arguments), a.show.apply(h.dialog) } }, closeAll: function (a) { for (var b = p.slice(0), c = 0; c < b.length; c += 1) { var d = b[c]; (void 0 === a || a !== d) && d.close() } }, setting: function (a, c, d) { if ("notifier" === a) return u.setting(c, d); var e = b(a); return e ? e.setting(c, d) : void 0 }, set: function (a, b, c) { return this.setting(a, b, c) }, get: function (a, b) { return this.setting(a, b) }, notify: function (a, b, c, d) { return u.create(b, d).push(a, c) }, message: function (a, b, c) { return u.create(null, c).push(a, b) }, success: function (a, b, c) { return u.create("success", c).push(a, b) }, error: function (a, b, c) { return u.create("error", c).push(a, b) }, warning: function (a, b, c) { return u.create("warning", c).push(a, b) }, dismissAll: function () { u.dismissAll() } } } var n = { ENTER: 13, ESC: 27, F1: 112, F12: 123, LEFT: 37, RIGHT: 39 }, o = { autoReset: !0, basic: !1, closable: !0, closableByDimmer: !0, frameless: !1, maintainFocus: !0, maximizable: !0, modal: !0, movable: !0, moveBounded: !1, overflow: !0, padding: !0, pinnable: !0, pinned: !0, preventBodyShift: !1, resizable: !0, startMaximized: !1, transition: "pulse", notifier: { delay: 5, position: "bottom-right" }, glossary: { title: "AlertifyJS", ok: "OK", cancel: "Cancel", acccpt: "Accept", deny: "Deny", confirm: "Confirm", decline: "Decline", close: "Close", maximize: "Maximize", restore: "Restore" }, theme: { input: "ajs-input", ok: "ajs-ok", cancel: "ajs-cancel" } }, p = [], q = function () { return document.addEventListener ? function (a, b, c, d) { a.addEventListener(b, c, d === !0) } : document.attachEvent ? function (a, b, c) { a.attachEvent("on" + b, c) } : void 0 }(), r = function () { return document.removeEventListener ? function (a, b, c, d) { a.removeEventListener(b, c, d === !0) } : document.detachEvent ? function (a, b, c) { a.detachEvent("on" + b, c) } : void 0 }(), s = function () { var a, b, c = !1, d = { animation: "animationend", OAnimation: "oAnimationEnd oanimationend", msAnimation: "MSAnimationEnd", MozAnimation: "animationend", WebkitAnimation: "webkitAnimationEnd" }; for (a in d) if (void 0 !== document.documentElement.style[a]) { b = d[a], c = !0; break } return { type: b, supported: c } }(), t = function () { function m(a) { if (!a.__internal) { delete a.__init, a.__settings || (a.__settings = h(a.settings)), null === za && document.body.setAttribute("tabindex", "0"); var c; "function" == typeof a.setup ? (c = a.setup(), c.options = c.options || {}, c.focus = c.focus || {}) : c = { buttons: [], focus: { element: null, select: !1 }, options: {} }, "object" != typeof a.hooks && (a.hooks = {}); var d = []; if (Array.isArray(c.buttons)) for (var e = 0; e < c.buttons.length; e += 1) { var f = c.buttons[e], g = {}; for (var i in f) f.hasOwnProperty(i) && (g[i] = f[i]); d.push(g) } var k = a.__internal = { isOpen: !1, activeElement: document.body, timerIn: void 0, timerOut: void 0, buttons: d, focus: c.focus, options: { title: void 0, modal: void 0, basic: void 0, frameless: void 0, pinned: void 0, movable: void 0, moveBounded: void 0, resizable: void 0, autoReset: void 0, closable: void 0, closableByDimmer: void 0, maximizable: void 0, startMaximized: void 0, pinnable: void 0, transition: void 0, padding: void 0, overflow: void 0, onshow: void 0, onclose: void 0, onfocus: void 0, onmove: void 0, onmoved: void 0, onresize: void 0, onresized: void 0, onmaximize: void 0, onmaximized: void 0, onrestore: void 0, onrestored: void 0 }, resetHandler: void 0, beginMoveHandler: void 0, beginResizeHandler: void 0, bringToFrontHandler: void 0, modalClickHandler: void 0, buttonsClickHandler: void 0, commandsClickHandler: void 0, transitionInHandler: void 0, transitionOutHandler: void 0, destroy: void 0 }, l = {}; l.root = document.createElement("div"), l.root.className = Ca.base + " " + Ca.hidden + " ", l.root.innerHTML = Ba.dimmer + Ba.modal, l.dimmer = l.root.firstChild, l.modal = l.root.lastChild, l.modal.innerHTML = Ba.dialog, l.dialog = l.modal.firstChild, l.dialog.innerHTML = Ba.reset + Ba.commands + Ba.header + Ba.body + Ba.footer + Ba.resizeHandle + Ba.reset, l.reset = [], l.reset.push(l.dialog.firstChild), l.reset.push(l.dialog.lastChild), l.commands = {}, l.commands.container = l.reset[0].nextSibling, l.commands.pin = l.commands.container.firstChild, l.commands.maximize = l.commands.pin.nextSibling, l.commands.close = l.commands.maximize.nextSibling, l.header = l.commands.container.nextSibling, l.body = l.header.nextSibling, l.body.innerHTML = Ba.content, l.content = l.body.firstChild, l.footer = l.body.nextSibling, l.footer.innerHTML = Ba.buttons.auxiliary + Ba.buttons.primary, l.resizeHandle = l.footer.nextSibling, l.buttons = {}, l.buttons.auxiliary = l.footer.firstChild, l.buttons.primary = l.buttons.auxiliary.nextSibling, l.buttons.primary.innerHTML = Ba.button, l.buttonTemplate = l.buttons.primary.firstChild, l.buttons.primary.removeChild(l.buttonTemplate); for (var m = 0; m < a.__internal.buttons.length; m += 1) { var n = a.__internal.buttons[m]; ya.indexOf(n.key) < 0 && ya.push(n.key), n.element = l.buttonTemplate.cloneNode(), n.element.innerHTML = n.text, "string" == typeof n.className && "" !== n.className && b(n.element, n.className); for (var o in n.attrs) "className" !== o && n.attrs.hasOwnProperty(o) && n.element.setAttribute(o, n.attrs[o]); "auxiliary" === n.scope ? l.buttons.auxiliary.appendChild(n.element) : l.buttons.primary.appendChild(n.element) } a.elements = l, k.resetHandler = j(a, X), k.beginMoveHandler = j(a, aa), k.beginResizeHandler = j(a, ga), k.bringToFrontHandler = j(a, B), k.modalClickHandler = j(a, R), k.buttonsClickHandler = j(a, T), k.commandsClickHandler = j(a, F), k.transitionInHandler = j(a, Y), k.transitionOutHandler = j(a, Z); for (var p in k.options) void 0 !== c.options[p] ? a.set(p, c.options[p]) : v.defaults.hasOwnProperty(p) ? a.set(p, v.defaults[p]) : "title" === p && a.set(p, v.defaults.glossary[p]); "function" == typeof a.build && a.build() } document.body.appendChild(a.elements.root) } function o() { wa = f(), xa = e() } function t() { a.scrollTo(wa, xa) } function u() { for (var a = 0, d = 0; d < p.length; d += 1) { var e = p[d]; (e.isModal() || e.isMaximized()) && (a += 1) } 0 === a && document.body.className.indexOf(Ca.noOverflow) >= 0 ? (c(document.body, Ca.noOverflow), w(!1)) : a > 0 && document.body.className.indexOf(Ca.noOverflow) < 0 && (w(!0), b(document.body, Ca.noOverflow)) } function w(d) { v.defaults.preventBodyShift && document.documentElement.scrollHeight > document.documentElement.clientHeight && (d ? (Ea = xa, Da = a.getComputedStyle(document.body).top, b(document.body, Ca.fixed), document.body.style.top = -xa + "px") : (xa = Ea, document.body.style.top = Da, c(document.body, Ca.fixed), t())) } function x(a, d, e) { "string" == typeof e && c(a.elements.root, Ca.prefix + e), b(a.elements.root, Ca.prefix + d), za = a.elements.root.offsetWidth } function y(a) { a.get("modal") ? (c(a.elements.root, Ca.modeless), a.isOpen() && (pa(a), N(a), u())) : (b(a.elements.root, Ca.modeless), a.isOpen() && (oa(a), N(a), u())) } function z(a) { a.get("basic") ? b(a.elements.root, Ca.basic) : c(a.elements.root, Ca.basic) } function A(a) { a.get("frameless") ? b(a.elements.root, Ca.frameless) : c(a.elements.root, Ca.frameless) } function B(a, b) { for (var c = p.indexOf(b), d = c + 1; d < p.length; d += 1) if (p[d].isModal()) return; return document.body.lastChild !== b.elements.root && (document.body.appendChild(b.elements.root), p.splice(p.indexOf(b), 1), p.push(b), W(b)), !1 } function C(a, d, e, f) { switch (d) { case "title": a.setHeader(f); break; case "modal": y(a); break; case "basic": z(a); break; case "frameless": A(a); break; case "pinned": O(a); break; case "closable": Q(a); break; case "maximizable": P(a); break; case "pinnable": K(a); break; case "movable": ea(a); break; case "resizable": ka(a); break; case "transition": x(a, f, e); break; case "padding": f ? c(a.elements.root, Ca.noPadding) : a.elements.root.className.indexOf(Ca.noPadding) < 0 && b(a.elements.root, Ca.noPadding); break; case "overflow": f ? c(a.elements.root, Ca.noOverflow) : a.elements.root.className.indexOf(Ca.noOverflow) < 0 && b(a.elements.root, Ca.noOverflow); break; case "transition": x(a, f, e) } "function" == typeof a.hooks.onupdate && a.hooks.onupdate.call(a, d, e, f) } function D(a, b, c, d, e) { var f = { op: void 0, items: [] }; if ("undefined" == typeof e && "string" == typeof d) f.op = "get", b.hasOwnProperty(d) ? (f.found = !0, f.value = b[d]) : (f.found = !1, f.value = void 0); else { var g; if (f.op = "set", "object" == typeof d) { var h = d; for (var i in h) b.hasOwnProperty(i) ? (b[i] !== h[i] && (g = b[i], b[i] = h[i], c.call(a, i, g, h[i])), f.items.push({ key: i, value: h[i], found: !0 })) : f.items.push({ key: i, value: h[i], found: !1 }) } else { if ("string" != typeof d) throw new Error("args must be a string or object"); b.hasOwnProperty(d) ? (b[d] !== e && (g = b[d], b[d] = e, c.call(a, d, g, e)), f.items.push({ key: d, value: e, found: !0 })) : f.items.push({ key: d, value: e, found: !1 }) } } return f } function E(a) { var b; S(a, function (a) { return b = a.invokeOnClose === !0 }), !b && a.isOpen() && a.close() } function F(a, b) { var c = a.srcElement || a.target; switch (c) { case b.elements.commands.pin: b.isPinned() ? H(b) : G(b); break; case b.elements.commands.maximize: b.isMaximized() ? J(b) : I(b); break; case b.elements.commands.close: E(b) } return !1 } function G(a) { a.set("pinned", !0) } function H(a) { a.set("pinned", !1) } function I(a) { l("onmaximize", a), b(a.elements.root, Ca.maximized), a.isOpen() && u(), l("onmaximized", a) } function J(a) { l("onrestore", a), c(a.elements.root, Ca.maximized), a.isOpen() && u(), l("onrestored", a) } function K(a) { a.get("pinnable") ? b(a.elements.root, Ca.pinnable) : c(a.elements.root, Ca.pinnable) } function L(a) { var b = f(); a.elements.modal.style.marginTop = e() + "px", a.elements.modal.style.marginLeft = b + "px", a.elements.modal.style.marginRight = -b + "px" } function M(a) { var b = parseInt(a.elements.modal.style.marginTop, 10), c = parseInt(a.elements.modal.style.marginLeft, 10); if (a.elements.modal.style.marginTop = "", a.elements.modal.style.marginLeft = "", a.elements.modal.style.marginRight = "", a.isOpen()) { var d = 0, g = 0; "" !== a.elements.dialog.style.top && (d = parseInt(a.elements.dialog.style.top, 10)), a.elements.dialog.style.top = d + (b - e()) + "px", "" !== a.elements.dialog.style.left && (g = parseInt(a.elements.dialog.style.left, 10)), a.elements.dialog.style.left = g + (c - f()) + "px" } } function N(a) { a.get("modal") || a.get("pinned") ? M(a) : L(a) } function O(a) { a.get("pinned") ? (c(a.elements.root, Ca.unpinned), a.isOpen() && M(a)) : (b(a.elements.root, Ca.unpinned), a.isOpen() && !a.isModal() && L(a)) } function P(a) { a.get("maximizable") ? b(a.elements.root, Ca.maximizable) : c(a.elements.root, Ca.maximizable) } function Q(a) { a.get("closable") ? (b(a.elements.root, Ca.closable), ua(a)) : (c(a.elements.root, Ca.closable), va(a)) } function R(a, b) { var c = a.srcElement || a.target; return Fa || c !== b.elements.modal || b.get("closableByDimmer") !== !0 || E(b), Fa = !1, !1 } function S(a, b) { for (var c = 0; c < a.__internal.buttons.length; c += 1) { var d = a.__internal.buttons[c]; if (!d.element.disabled && b(d)) { var e = k(c, d); "function" == typeof a.callback && a.callback.apply(a, [e]), e.cancel === !1 && a.close(); break } } } function T(a, b) { var c = a.srcElement || a.target; S(b, function (a) { return a.element === c && (Ga = !0) }) } function U(a) { if (Ga) return void (Ga = !1); var b = p[p.length - 1], c = a.keyCode; return 0 === b.__internal.buttons.length && c === n.ESC && b.get("closable") === !0 ? (E(b), !1) : ya.indexOf(c) > -1 ? (S(b, function (a) { return a.key === c }), !1) : void 0 } function V(a) { var b = p[p.length - 1], c = a.keyCode; if (c === n.LEFT || c === n.RIGHT) { for (var d = b.__internal.buttons, e = 0; e < d.length; e += 1) if (document.activeElement === d[e].element) switch (c) { case n.LEFT: return void d[(e || d.length) - 1].element.focus(); case n.RIGHT: return void d[(e + 1) % d.length].element.focus() } } else if (c < n.F12 + 1 && c > n.F1 - 1 && ya.indexOf(c) > -1) return a.preventDefault(), a.stopPropagation(), S(b, function (a) { return a.key === c }), !1 } function W(a, b) { if (b) b.focus(); else { var c = a.__internal.focus, d = c.element; switch (typeof c.element) { case "number": a.__internal.buttons.length > c.element && (d = a.get("basic") === !0 ? a.elements.reset[0] : a.__internal.buttons[c.element].element); break; case "string": d = a.elements.body.querySelector(c.element); break; case "function": d = c.element.call(a) } "undefined" != typeof d && null !== d || 0 !== a.__internal.buttons.length || (d = a.elements.reset[0]), d && d.focus && (d.focus(), c.select && d.select && d.select()) } } function X(a, b) { if (!b) for (var c = p.length - 1; c > -1; c -= 1) if (p[c].isModal()) { b = p[c]; break } if (b && b.isModal()) { var d, e = a.srcElement || a.target, f = e === b.elements.reset[1] || 0 === b.__internal.buttons.length && e === document.body; f && (b.get("maximizable") ? d = b.elements.commands.maximize : b.get("closable") && (d = b.elements.commands.close)), void 0 === d && ("number" == typeof b.__internal.focus.element ? e === b.elements.reset[0] ? d = b.elements.buttons.auxiliary.firstChild || b.elements.buttons.primary.firstChild : f && (d = b.elements.reset[0]) : e === b.elements.reset[0] && (d = b.elements.buttons.primary.lastChild || b.elements.buttons.auxiliary.lastChild)), W(b, d) } } function Y(a, b) { clearTimeout(b.__internal.timerIn), W(b), t(), Ga = !1, l("onfocus", b), r(b.elements.dialog, s.type, b.__internal.transitionInHandler), c(b.elements.root, Ca.animationIn) } function Z(a, b) { clearTimeout(b.__internal.timerOut), r(b.elements.dialog, s.type, b.__internal.transitionOutHandler), da(b), ja(b), b.isMaximized() && !b.get("startMaximized") && J(b), v.defaults.maintainFocus && b.__internal.activeElement && (b.__internal.activeElement.focus(), b.__internal.activeElement = null), "function" == typeof b.__internal.destroy && b.__internal.destroy.apply(b) } function $(a, b) { var c = a[Ka] - Ia, d = a[La] - Ja; Na && (d -= document.body.scrollTop), b.style.left = c + "px", b.style.top = d + "px" } function _(a, b) { var c = a[Ka] - Ia, d = a[La] - Ja; Na && (d -= document.body.scrollTop), b.style.left = Math.min(Ma.maxLeft, Math.max(Ma.minLeft, c)) + "px", Na ? b.style.top = Math.min(Ma.maxTop, Math.max(Ma.minTop, d)) + "px" : b.style.top = Math.max(Ma.minTop, d) + "px" } function aa(a, c) { if (null === Pa && !c.isMaximized() && c.get("movable")) { var d, e = 0, f = 0; if ("touchstart" === a.type ? (a.preventDefault(), d = a.targetTouches[0], Ka = "clientX", La = "clientY") : 0 === a.button && (d = a), d) { var g = c.elements.dialog; if (b(g, Ca.capture), g.style.left && (e = parseInt(g.style.left, 10)), g.style.top && (f = parseInt(g.style.top, 10)), Ia = d[Ka] - e, Ja = d[La] - f, c.isModal() ? Ja += c.elements.modal.scrollTop : c.isPinned() && (Ja -= document.body.scrollTop), c.get("moveBounded")) { var h = g, i = -e, j = -f; do i += h.offsetLeft, j += h.offsetTop; while (h = h.offsetParent); Ma = { maxLeft: i, minLeft: -i, maxTop: document.documentElement.clientHeight - g.clientHeight - j, minTop: -j }, Oa = _ } else Ma = null, Oa = $; return l("onmove", c), Na = !c.isModal() && c.isPinned(), Ha = c, Oa(d, g), b(document.body, Ca.noSelection), !1 } } } function ba(a) { if (Ha) { var b; "touchmove" === a.type ? (a.preventDefault(), b = a.targetTouches[0]) : 0 === a.button && (b = a), b && Oa(b, Ha.elements.dialog) } } function ca() { if (Ha) { var a = Ha; Ha = Ma = null, c(document.body, Ca.noSelection), c(a.elements.dialog, Ca.capture), l("onmoved", a) } } function da(a) { Ha = null; var b = a.elements.dialog; b.style.left = b.style.top = "" } function ea(a) { a.get("movable") ? (b(a.elements.root, Ca.movable), a.isOpen() && qa(a)) : (da(a), c(a.elements.root, Ca.movable), a.isOpen() && ra(a)) } function fa(a, b, c) { var e = b, f = 0, g = 0; do f += e.offsetLeft, g += e.offsetTop; while (e = e.offsetParent); var h, i; c === !0 ? (h = a.pageX, i = a.pageY) : (h = a.clientX, i = a.clientY); var j = d(); if (j && (h = document.body.offsetWidth - h, isNaN(Qa) || (f = document.body.offsetWidth - f - b.offsetWidth)), b.style.height = i - g + Ta + "px", b.style.width = h - f + Ta + "px", !isNaN(Qa)) { var k = .5 * Math.abs(b.offsetWidth - Ra); j && (k *= -1), b.offsetWidth > Ra ? b.style.left = Qa + k + "px" : b.offsetWidth >= Sa && (b.style.left = Qa - k + "px") } } function ga(a, c) { if (!c.isMaximized()) { var d; if ("touchstart" === a.type ? (a.preventDefault(), d = a.targetTouches[0]) : 0 === a.button && (d = a), d) { l("onresize", c), Pa = c, Ta = c.elements.resizeHandle.offsetHeight / 2; var e = c.elements.dialog; return b(e, Ca.capture), Qa = parseInt(e.style.left, 10), e.style.height = e.offsetHeight + "px", e.style.minHeight = c.elements.header.offsetHeight + c.elements.footer.offsetHeight + "px", e.style.width = (Ra = e.offsetWidth) + "px", "none" !== e.style.maxWidth && (e.style.minWidth = (Sa = e.offsetWidth) + "px"), e.style.maxWidth = "none", b(document.body, Ca.noSelection), !1 } } } function ha(a) { if (Pa) { var b; "touchmove" === a.type ? (a.preventDefault(), b = a.targetTouches[0]) : 0 === a.button && (b = a), b && fa(b, Pa.elements.dialog, !Pa.get("modal") && !Pa.get("pinned")) } } function ia() { if (Pa) { var a = Pa; Pa = null, c(document.body, Ca.noSelection), c(a.elements.dialog, Ca.capture), Fa = !0, l("onresized", a) } } function ja(a) { Pa = null; var b = a.elements.dialog; "none" === b.style.maxWidth && (b.style.maxWidth = b.style.minWidth = b.style.width = b.style.height = b.style.minHeight = b.style.left = "", Qa = Number.Nan, Ra = Sa = Ta = 0) } function ka(a) { a.get("resizable") ? (b(a.elements.root, Ca.resizable), a.isOpen() && sa(a)) : (ja(a), c(a.elements.root, Ca.resizable), a.isOpen() && ta(a)) } function la() { for (var a = 0; a < p.length; a += 1) { var b = p[a]; b.get("autoReset") && (da(b), ja(b)) } } function ma(b) { 1 === p.length && (q(a, "resize", la), q(document.body, "keyup", U), q(document.body, "keydown", V), q(document.body, "focus", X), q(document.documentElement, "mousemove", ba), q(document.documentElement, "touchmove", ba), q(document.documentElement, "mouseup", ca), q(document.documentElement, "touchend", ca), q(document.documentElement, "mousemove", ha), q(document.documentElement, "touchmove", ha), q(document.documentElement, "mouseup", ia), q(document.documentElement, "touchend", ia)), q(b.elements.commands.container, "click", b.__internal.commandsClickHandler), q(b.elements.footer, "click", b.__internal.buttonsClickHandler), q(b.elements.reset[0], "focus", b.__internal.resetHandler), q(b.elements.reset[1], "focus", b.__internal.resetHandler), Ga = !0, q(b.elements.dialog, s.type, b.__internal.transitionInHandler), b.get("modal") || oa(b), b.get("resizable") && sa(b), b.get("movable") && qa(b) } function na(b) { 1 === p.length && (r(a, "resize", la), r(document.body, "keyup", U), r(document.body, "keydown", V), r(document.body, "focus", X), r(document.documentElement, "mousemove", ba), r(document.documentElement, "mouseup", ca), r(document.documentElement, "mousemove", ha), r(document.documentElement, "mouseup", ia)), r(b.elements.commands.container, "click", b.__internal.commandsClickHandler), r(b.elements.footer, "click", b.__internal.buttonsClickHandler), r(b.elements.reset[0], "focus", b.__internal.resetHandler), r(b.elements.reset[1], "focus", b.__internal.resetHandler), q(b.elements.dialog, s.type, b.__internal.transitionOutHandler), b.get("modal") || pa(b), b.get("movable") && ra(b), b.get("resizable") && ta(b) } function oa(a) { q(a.elements.dialog, "focus", a.__internal.bringToFrontHandler, !0) } function pa(a) { r(a.elements.dialog, "focus", a.__internal.bringToFrontHandler, !0) } function qa(a) { q(a.elements.header, "mousedown", a.__internal.beginMoveHandler), q(a.elements.header, "touchstart", a.__internal.beginMoveHandler) } function ra(a) { r(a.elements.header, "mousedown", a.__internal.beginMoveHandler), r(a.elements.header, "touchstart", a.__internal.beginMoveHandler) } function sa(a) { q(a.elements.resizeHandle, "mousedown", a.__internal.beginResizeHandler), q(a.elements.resizeHandle, "touchstart", a.__internal.beginResizeHandler) } function ta(a) { r(a.elements.resizeHandle, "mousedown", a.__internal.beginResizeHandler), r(a.elements.resizeHandle, "touchstart", a.__internal.beginResizeHandler) } function ua(a) { q(a.elements.modal, "click", a.__internal.modalClickHandler) } function va(a) { r(a.elements.modal, "click", a.__internal.modalClickHandler) } var wa, xa, ya = [], za = null, Aa = a.navigator.userAgent.indexOf("Safari") > -1 && a.navigator.userAgent.indexOf("Chrome") < 0, Ba = { dimmer: '<div class="ajs-dimmer"></div>', modal: '<div class="ajs-modal" tabindex="0"></div>', dialog: '<div class="ajs-dialog" tabindex="0"></div>', reset: '<button class="ajs-reset"></button>', commands: '<div class="ajs-commands"><button class="ajs-pin"></button><button class="ajs-maximize"></button><button class="ajs-close"></button></div>', header: '<div class="ajs-header"></div>', body: '<div class="ajs-body"></div>', content: '<div class="ajs-content"></div>', footer: '<div class="ajs-footer"></div>', buttons: { primary: '<div class="ajs-primary ajs-buttons"></div>', auxiliary: '<div class="ajs-auxiliary ajs-buttons"></div>' }, button: '<button class="ajs-button"></button>', resizeHandle: '<div class="ajs-handle"></div>' }, Ca = { animationIn: "ajs-in", animationOut: "ajs-out", base: "alertify", basic: "ajs-basic", capture: "ajs-capture", closable: "ajs-closable", fixed: "ajs-fixed", frameless: "ajs-frameless", hidden: "ajs-hidden", maximize: "ajs-maximize", maximized: "ajs-maximized", maximizable: "ajs-maximizable", modeless: "ajs-modeless", movable: "ajs-movable", noSelection: "ajs-no-selection", noOverflow: "ajs-no-overflow", noPadding: "ajs-no-padding", pin: "ajs-pin", pinnable: "ajs-pinnable", prefix: "ajs-", resizable: "ajs-resizable", restore: "ajs-restore", shake: "ajs-shake", unpinned: "ajs-unpinned" }, Da = "", Ea = 0, Fa = !1, Ga = !1, Ha = null, Ia = 0, Ja = 0, Ka = "pageX", La = "pageY", Ma = null, Na = !1, Oa = null, Pa = null, Qa = Number.Nan, Ra = 0, Sa = 0, Ta = 0; return { __init: m, isOpen: function () { return this.__internal.isOpen }, isModal: function () { return this.elements.root.className.indexOf(Ca.modeless) < 0 }, isMaximized: function () { return this.elements.root.className.indexOf(Ca.maximized) > -1 }, isPinned: function () { return this.elements.root.className.indexOf(Ca.unpinned) < 0 }, maximize: function () { return this.isMaximized() || I(this), this }, restore: function () { return this.isMaximized() && J(this), this }, pin: function () { return this.isPinned() || G(this), this }, unpin: function () { return this.isPinned() && H(this), this }, bringToFront: function () { return B(null, this), this }, moveTo: function (a, b) { if (!isNaN(a) && !isNaN(b)) { l("onmove", this); var c = this.elements.dialog, e = c, f = 0, g = 0; c.style.left && (f -= parseInt(c.style.left, 10)), c.style.top && (g -= parseInt(c.style.top, 10)); do f += e.offsetLeft, g += e.offsetTop; while (e = e.offsetParent); var h = a - f, i = b - g; d() && (h *= -1), c.style.left = h + "px", c.style.top = i + "px", l("onmoved", this) } return this }, resizeTo: function (a, b) { var c = parseFloat(a), d = parseFloat(b), e = /(\d*\.\d+|\d+)%/; if (!isNaN(c) && !isNaN(d) && this.get("resizable") === !0) { l("onresize", this), ("" + a).match(e) && (c = c / 100 * document.documentElement.clientWidth), ("" + b).match(e) && (d = d / 100 * document.documentElement.clientHeight); var f = this.elements.dialog; "none" !== f.style.maxWidth && (f.style.minWidth = (Sa = f.offsetWidth) + "px"), f.style.maxWidth = "none", f.style.minHeight = this.elements.header.offsetHeight + this.elements.footer.offsetHeight + "px", f.style.width = c + "px", f.style.height = d + "px", l("onresized", this) } return this }, setting: function (a, b) { var c = this, d = D(this, this.__internal.options, function (a, b, d) { C(c, a, b, d) }, a, b); if ("get" === d.op) return d.found ? d.value : "undefined" != typeof this.settings ? D(this, this.settings, this.settingUpdated || function () { }, a, b).value : void 0; if ("set" === d.op) { if (d.items.length > 0) for (var e = this.settingUpdated || function () { }, f = 0; f < d.items.length; f += 1) { var g = d.items[f]; g.found || "undefined" == typeof this.settings || D(this, this.settings, e, g.key, g.value) } return this } }, set: function (a, b) { return this.setting(a, b), this }, get: function (a) { return this.setting(a) }, setHeader: function (b) { return "string" == typeof b ? (g(this.elements.header), this.elements.header.innerHTML = b) : b instanceof a.HTMLElement && this.elements.header.firstChild !== b && (g(this.elements.header), this.elements.header.appendChild(b)), this }, setContent: function (b) { return "string" == typeof b ? (g(this.elements.content), this.elements.content.innerHTML = b) : b instanceof a.HTMLElement && this.elements.content.firstChild !== b && (g(this.elements.content), this.elements.content.appendChild(b)), this }, showModal: function (a) { return this.show(!0, a) }, show: function (a, d) { if (m(this), this.__internal.isOpen) { da(this), ja(this), b(this.elements.dialog, Ca.shake); var e = this; setTimeout(function () { c(e.elements.dialog, Ca.shake) }, 200) } else { if (this.__internal.isOpen = !0, p.push(this), v.defaults.maintainFocus && (this.__internal.activeElement = document.activeElement), "function" == typeof this.prepare && this.prepare(), ma(this), void 0 !== a && this.set("modal", a), o(), u(), "string" == typeof d && "" !== d && (this.__internal.className = d, b(this.elements.root, d)), this.get("startMaximized") ? this.maximize() : this.isMaximized() && J(this), N(this), c(this.elements.root, Ca.animationOut), b(this.elements.root, Ca.animationIn), clearTimeout(this.__internal.timerIn), this.__internal.timerIn = setTimeout(this.__internal.transitionInHandler, s.supported ? 1e3 : 100), Aa) { var f = this.elements.root; f.style.display = "none", setTimeout(function () { f.style.display = "block" }, 0) } za = this.elements.root.offsetWidth, c(this.elements.root, Ca.hidden), "function" == typeof this.hooks.onshow && this.hooks.onshow.call(this), l("onshow", this) } return this }, close: function () { return this.__internal.isOpen && (na(this), c(this.elements.root, Ca.animationIn), b(this.elements.root, Ca.animationOut), clearTimeout(this.__internal.timerOut), this.__internal.timerOut = setTimeout(this.__internal.transitionOutHandler, s.supported ? 1e3 : 100), b(this.elements.root, Ca.hidden), za = this.elements.modal.offsetWidth, "undefined" != typeof this.__internal.className && "" !== this.__internal.className && c(this.elements.root, this.__internal.className), "function" == typeof this.hooks.onclose && this.hooks.onclose.call(this), l("onclose", this), p.splice(p.indexOf(this), 1), this.__internal.isOpen = !1, u()), this }, closeOthers: function () { return v.closeAll(this), this }, destroy: function () { return this.__internal.isOpen ? (this.__internal.destroy = function () { i(this, m) }, this.close()) : i(this, m), this } } }(), u = function () { function d(a) { a.__internal || (a.__internal = { position: v.defaults.notifier.position, delay: v.defaults.notifier.delay }, l = document.createElement("DIV"), h(a)), l.parentNode !== document.body && document.body.appendChild(l) } function e(a) { a.__internal.pushed = !0, m.push(a) } function f(a) { m.splice(m.indexOf(a), 1), a.__internal.pushed = !1 } function h(a) { switch (l.className = n.base, a.__internal.position) { case "top-right": b(l, n.top + " " + n.right); break; case "top-left": b(l, n.top + " " + n.left); break; case "bottom-left": b(l, n.bottom + " " + n.left); break; default: case "bottom-right": b(l, n.bottom + " " + n.right) } } function i(d, h) { function i(a, b) { b.dismiss(!0) } function m(a, b) { r(b.element, s.type, m), l.removeChild(b.element) } function o(a) { return a.__internal || (a.__internal = { pushed: !1, delay: void 0, timer: void 0, clickHandler: void 0, transitionEndHandler: void 0, transitionTimeout: void 0 }, a.__internal.clickHandler = j(a, i), a.__internal.transitionEndHandler = j(a, m)), a } function p(a) { clearTimeout(a.__internal.timer), clearTimeout(a.__internal.transitionTimeout) } return o({ element: d, push: function (a, c) { if (!this.__internal.pushed) { e(this), p(this); var d, f; switch (arguments.length) { case 0: f = this.__internal.delay; break; case 1: "number" == typeof a ? f = a : (d = a, f = this.__internal.delay); break; case 2: d = a, f = c } return "undefined" != typeof d && this.setContent(d), u.__internal.position.indexOf("top") < 0 ? l.appendChild(this.element) : l.insertBefore(this.element, l.firstChild), k = this.element.offsetWidth, b(this.element, n.visible), q(this.element, "click", this.__internal.clickHandler), this.delay(f) } return this }, ondismiss: function () { }, callback: h, dismiss: function (a) { return this.__internal.pushed && (p(this), ("function" != typeof this.ondismiss || this.ondismiss.call(this) !== !1) && (r(this.element, "click", this.__internal.clickHandler), "undefined" != typeof this.element && this.element.parentNode === l && (this.__internal.transitionTimeout = setTimeout(this.__internal.transitionEndHandler, s.supported ? 1e3 : 100), c(this.element, n.visible), "function" == typeof this.callback && this.callback.call(this, a)), f(this))), this }, delay: function (a) { if (p(this), this.__internal.delay = "undefined" == typeof a || isNaN(+a) ? u.__internal.delay : +a, this.__internal.delay > 0) { var b = this; this.__internal.timer = setTimeout(function () { b.dismiss() }, 1e3 * this.__internal.delay) } return this }, setContent: function (b) { return "string" == typeof b ? (g(this.element), this.element.innerHTML = b) : b instanceof a.HTMLElement && this.element.firstChild !== b && (g(this.element), this.element.appendChild(b)), this }, dismissOthers: function () { return u.dismissAll(this), this } }) } var k, l, m = [], n = { base: "alertify-notifier", message: "ajs-message", top: "ajs-top", right: "ajs-right", bottom: "ajs-bottom", left: "ajs-left", visible: "ajs-visible", hidden: "ajs-hidden" }; return { setting: function (a, b) { if (d(this), "undefined" == typeof b) return this.__internal[a]; switch (a) { case "position": this.__internal.position = b, h(this); break; case "delay": this.__internal.delay = b } return this }, set: function (a, b) { return this.setting(a, b), this }, get: function (a) { return this.setting(a) }, create: function (a, b) { d(this); var c = document.createElement("div"); return c.className = n.message + ("string" == typeof a && "" !== a ? " ajs-" + a : ""), i(c, b) }, dismissAll: function (a) { for (var b = m.slice(0), c = 0; c < b.length; c += 1) { var d = b[c]; (void 0 === a || a !== d) && d.dismiss() } } } }(), v = new m; v.dialog("alert", function () { return { main: function (a, b, c) { var d, e, f; switch (arguments.length) { case 1: e = a; break; case 2: "function" == typeof b ? (e = a, f = b) : (d = a, e = b); break; case 3: d = a, e = b, f = c } return this.set("title", d), this.set("message", e), this.set("onok", f), this }, setup: function () { return { buttons: [{ text: v.defaults.glossary.ok, key: n.ESC, invokeOnClose: !0, className: v.defaults.theme.ok }], focus: { element: 0, select: !1 }, options: { maximizable: !1, resizable: !1 } } }, build: function () { }, prepare: function () { }, setMessage: function (a) { this.setContent(a) }, settings: { message: void 0, onok: void 0, label: void 0 }, settingUpdated: function (a, b, c) { switch (a) { case "message": this.setMessage(c); break; case "label": this.__internal.buttons[0].element && (this.__internal.buttons[0].element.innerHTML = c) } }, callback: function (a) { if ("function" == typeof this.get("onok")) { var b = this.get("onok").call(this, a); "undefined" != typeof b && (a.cancel = !b) } } } }), v.dialog("confirm", function () {
                    function a(a) { null !== c.timer && (clearInterval(c.timer), c.timer = null, a.__internal.buttons[c.index].element.innerHTML = c.text) } function b(b, d, e) { a(b), c.duration = e, c.index = d, c.text = b.__internal.buttons[d].element.innerHTML, c.timer = setInterval(j(b, c.task), 1e3), c.task(null, b) } var c = { timer: null, index: null, text: null, duration: null, task: function (b, d) { if (d.isOpen()) { if (d.__internal.buttons[c.index].element.innerHTML = c.text + " (&#8207;" + c.duration + "&#8207;) ", c.duration -= 1, -1 === c.duration) { a(d); var e = d.__internal.buttons[c.index], f = k(c.index, e); "function" == typeof d.callback && d.callback.apply(d, [f]), f.close !== !1 && d.close() } } else a(d) } }; return {
                        main: function (a, b, c, d) { var e, f, g, h; switch (arguments.length) { case 1: f = a; break; case 2: f = a, g = b; break; case 3: f = a, g = b, h = c; break; case 4: e = a, f = b, g = c, h = d } return this.set("title", e), this.set("message", f), this.set("onok", g), this.set("oncancel", h), this }, setup: function () { return { buttons: [{ text: v.defaults.glossary.ok, key: n.ENTER, className: v.defaults.theme.ok }, { text: v.defaults.glossary.cancel, key: n.ESC, invokeOnClose: !0, className: v.defaults.theme.cancel }], focus: { element: 0, select: !1 }, options: { maximizable: !1, resizable: !1 } } }, build: function () { }, prepare: function () { }, setMessage: function (a) { this.setContent(a) }, settings: { message: null, labels: null, onok: null, oncancel: null, defaultFocus: null, reverseButtons: null }, settingUpdated: function (a, b, c) {
                            switch (a) {
                                case "message": this.setMessage(c);
                                    break; case "labels": "ok" in c && this.__internal.buttons[0].element && (this.__internal.buttons[0].text = c.ok, this.__internal.buttons[0].element.innerHTML = c.ok), "cancel" in c && this.__internal.buttons[1].element && (this.__internal.buttons[1].text = c.cancel, this.__internal.buttons[1].element.innerHTML = c.cancel); break; case "reverseButtons": c === !0 ? this.elements.buttons.primary.appendChild(this.__internal.buttons[0].element) : this.elements.buttons.primary.appendChild(this.__internal.buttons[1].element); break; case "defaultFocus": this.__internal.focus.element = "ok" === c ? 0 : 1
                            }
                        }, callback: function (b) { a(this); var c; switch (b.index) { case 0: "function" == typeof this.get("onok") && (c = this.get("onok").call(this, b), "undefined" != typeof c && (b.cancel = !c)); break; case 1: "function" == typeof this.get("oncancel") && (c = this.get("oncancel").call(this, b), "undefined" != typeof c && (b.cancel = !c)) } }, autoOk: function (a) { return b(this, 0, a), this }, autoCancel: function (a) { return b(this, 1, a), this }
                    }
                }), v.dialog("prompt", function () { var b = document.createElement("INPUT"), c = document.createElement("P"); return { main: function (a, b, c, d, e) { var f, g, h, i, j; switch (arguments.length) { case 1: g = a; break; case 2: g = a, h = b; break; case 3: g = a, h = b, i = c; break; case 4: g = a, h = b, i = c, j = d; break; case 5: f = a, g = b, h = c, i = d, j = e } return this.set("title", f), this.set("message", g), this.set("value", h), this.set("onok", i), this.set("oncancel", j), this }, setup: function () { return { buttons: [{ text: v.defaults.glossary.ok, key: n.ENTER, className: v.defaults.theme.ok }, { text: v.defaults.glossary.cancel, key: n.ESC, invokeOnClose: !0, className: v.defaults.theme.cancel }], focus: { element: b, select: !0 }, options: { maximizable: !1, resizable: !1 } } }, build: function () { b.className = v.defaults.theme.input, b.setAttribute("type", "text"), b.value = this.get("value"), this.elements.content.appendChild(c), this.elements.content.appendChild(b) }, prepare: function () { }, setMessage: function (b) { "string" == typeof b ? (g(c), c.innerHTML = b) : b instanceof a.HTMLElement && c.firstChild !== b && (g(c), c.appendChild(b)) }, settings: { message: void 0, labels: void 0, onok: void 0, oncancel: void 0, value: "", type: "text", reverseButtons: void 0 }, settingUpdated: function (a, c, d) { switch (a) { case "message": this.setMessage(d); break; case "value": b.value = d; break; case "type": switch (d) { case "text": case "color": case "date": case "datetime-local": case "email": case "month": case "number": case "password": case "search": case "tel": case "time": case "week": b.type = d; break; default: b.type = "text" } break; case "labels": d.ok && this.__internal.buttons[0].element && (this.__internal.buttons[0].element.innerHTML = d.ok), d.cancel && this.__internal.buttons[1].element && (this.__internal.buttons[1].element.innerHTML = d.cancel); break; case "reverseButtons": d === !0 ? this.elements.buttons.primary.appendChild(this.__internal.buttons[0].element) : this.elements.buttons.primary.appendChild(this.__internal.buttons[1].element) } }, callback: function (a) { var c; switch (a.index) { case 0: this.settings.value = b.value, "function" == typeof this.get("onok") && (c = this.get("onok").call(this, a, this.settings.value), "undefined" != typeof c && (a.cancel = !c)); break; case 1: "function" == typeof this.get("oncancel") && (c = this.get("oncancel").call(this, a), "undefined" != typeof c && (a.cancel = !c)), a.cancel || (b.value = this.settings.value) } } } }), "object" == typeof module && "object" == typeof module.exports ? module.exports = v : "function" == typeof define && define.amd ? define([], function () { return v }) : a.alertify || (a.alertify = v)
            }("undefined" != typeof window ? window : this);
        }

        /** jquery.onoff - v0.3.5 - 2014-05-12
         * https://github.com/timmywil/jquery.onoff
         * Copyright (c) 2014 Timmy Willison; Licensed MIT */
        !function (a, b) { "function" == typeof define && define.amd ? define(["jquery"], b) : "object" == typeof exports ? b(require("jquery")) : b(a.HawkSearch.jQuery) }(this, function (a) { "use strict"; function b(c, d) { if (!(this instanceof b)) return new b(c, d); if ("input" !== c.nodeName.toLowerCase() || "checkbox" !== c.type) return a.error("OnOff should be called on checkboxes"); var e = a.data(c, b.datakey); return e ? e : (this.options = d = a.extend({}, b.defaults, d), this.elem = c, this.$elem = a(c).addClass(d.className), this.$doc = a(c.ownerDocument || document), d.namespace += a.guid++ , c.id || (c.id = "onoffswitch" + g++), this.enable(), a.data(c, b.datakey, this), void 0) } var c = "over out down up move enter leave cancel".split(" "), d = a.extend({}, a.event.mouseHooks), e = {}; if (window.PointerEvent) a.each(c, function (b, c) { a.event.fixHooks[e[c] = "pointer" + c] = d }); else { var f = d.props; d.props = f.concat(["touches", "changedTouches", "targetTouches", "altKey", "ctrlKey", "metaKey", "shiftKey"]), d.filter = function (a, b) { var c, d = f.length; if (!b.pageX && b.touches && (c = b.touches[0])) for (; d--;) a[f[d]] = c[f[d]]; return a }, a.each(c, function (b, c) { if (2 > b) e[c] = "mouse" + c; else { var f = "touch" + ("down" === c ? "start" : "up" === c ? "end" : c); a.event.fixHooks[f] = d, e[c] = f + " mouse" + c } }) } a.pointertouch = e; var g = 1, h = Array.prototype.slice; return b.datakey = "_onoff", b.defaults = { namespace: ".onoff", className: "onoffswitch-checkbox" }, b.prototype = { constructor: b, instance: function () { return this }, wrap: function () { var b = this.elem, c = this.$elem, d = this.options, e = c.parent(".onoffswitch"); e.length || (c.wrap('<div class="onoffswitch"></div>'), e = c.parent().addClass(b.className.replace(d.className, ""))), this.$con = e; var f = c.next('label[for="' + b.id + '"]'); f.length || (f = a("<label/>").attr("for", b.id).insertAfter(b)), this.$label = f.addClass("onoffswitch-label"); var g = f.find(".onoffswitch-inner"); g.length || (g = a("<div/>").addClass("onoffswitch-inner").prependTo(f)), this.$inner = g; var h = f.find(".onoffswitch-switch"); h.length || (h = a("<div/>").addClass("onoffswitch-switch").appendTo(f)), this.$switch = h }, _handleMove: function (a) { if (!this.disabled) { this.moved = !0, this.lastX = a.pageX; var b = Math.max(Math.min(this.startX - this.lastX, this.maxRight), 0); this.$switch.css("right", b), this.$inner.css("marginLeft", 100 * -(b / this.maxRight) + "%") } }, _startMove: function (b) { b.preventDefault(); var c, d; "pointerdown" === b.type ? (c = "pointermove", d = "pointerup") : "touchstart" === b.type ? (c = "touchmove", d = "touchend") : (c = "mousemove", d = "mouseup"); var e = this.elem, f = this.$elem, g = this.options.namespace, h = this.$switch, i = h[0], j = this.$inner.add(h).css("transition", "none"); this.maxRight = this.$con.width() - h.width() - a.css(i, "margin-left", !0) - a.css(i, "margin-right", !0) - a.css(i, "border-left-width", !0) - a.css(i, "border-right-width", !0); var k = e.checked; this.moved = !1, this.startX = b.pageX + (k ? 0 : this.maxRight); var l = this, m = this.$doc.on(c + g, a.proxy(this._handleMove, this)).on(d + g, function () { j.css("transition", ""), m.off(g), setTimeout(function () { if (l.moved) { var a = l.lastX > l.startX - l.maxRight / 2; e.checked !== a && (e.checked = a, f.trigger("change")) } l.$switch.css("right", ""), l.$inner.css("marginLeft", "") }) }) }, _bind: function () { this._unbind(), this.$switch.on(a.pointertouch.down, a.proxy(this._startMove, this)) }, enable: function () { this.wrap(), this._bind(), this.disabled = !1 }, _unbind: function () { this.$doc.add(this.$switch).off(this.options.namespace) }, disable: function () { this.disabled = !0, this._unbind() }, unwrap: function () { this.disable(), this.$label.remove(), this.$elem.unwrap().removeClass(this.options.className) }, isDisabled: function () { return this.disabled }, destroy: function () { this.disable(), a.removeData(this.elem, b.datakey) }, option: function (b, c) { var d, e = this.options; if (!b) return a.extend({}, e); if ("string" == typeof b) { if (1 === arguments.length) return void 0 !== e[b] ? e[b] : null; d = {}, d[b] = c } else d = b; a.each(d, a.proxy(function (a, b) { switch (a) { case "namespace": this._unbind(); break; case "className": this.$elem.removeClass(e.className) } switch (e[a] = b, a) { case "namespace": this._bind(); break; case "className": this.$elem.addClass(b) } }, this)) } }, a.fn.onoff = function (c) { var d, e, f, g; return "string" == typeof c ? (g = [], e = h.call(arguments, 1), this.each(function () { d = a.data(this, b.datakey), d ? "_" !== c.charAt(0) && "function" == typeof (f = d[c]) && void 0 !== (f = f.apply(d, e)) && g.push(f) : g.push(void 0) }), g.length ? 1 === g.length ? g[0] : g : this) : this.each(function () { new b(this, c) }) }, a.OnOff = b });

        $.expr[':'].containsNoCase = function (a, i, m) {
            var regex = /(.*?)\s\(\d+?\)/;
            var textNode = a.textContent || a.innerText || "";
            var matches = textNode.match(regex);
            if (matches == null) {
                return null;
            }

            return (matches[1]).toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
        };

        $.fn.filterThatList = function (options) {
            // if there are no passed options create an empty options object
            if (options === undefined || options === null) {
                options = {};
            }
            ;

            // set up default options
            var defaults = {
                searchTarget: $(this) // the search input
            };

            return this.each(function () {
                // merge passed options with default options to create settings
                var settings = $.extend(defaults, options);

                settings.searchTarget.change(function () {
                    // get the value of the input which is used to filter against
                    var filter = $(this).val();
                    var searchList = settings.list;
                    var isNestedFacet = settings.list.hasClass("hawk-nestedfacet");
                    //when nested facet prepare flat facet
                    if (isNestedFacet) {
                        var flatUlId = settings.list.attr("id") + "_flat";
                        if ($("#" + flatUlId).length == 0) {
                            var searchList = $(settings.list[0].cloneNode(false));
                            searchList.removeClass("hawk-navTruncateList");
                            searchList.addClass("hawk-scrollList");
                            searchList.attr("id", flatUlId);
                            searchList.appendTo(settings.list.parent());

                            $(settings.list).find("li").each(function () {
                                var pathArr = [];
                                $(this).parentsUntil("#" + settings.list.attr("id"), "li").each(function () {
                                    var text = $($($(this).children("a")).children("span").contents()[0]).text();
                                    text = text.trim();
                                    pathArr.unshift(text);
                                });

                                var li = $("<li>");
                                if ($(this).hasClass("hawkFacet-active")) {
                                    li.addClass("hawkFacet-active");
                                }

                                li.appendTo(searchList);
                                var anchor = $(this).children("a").clone();
                                if (pathArr.length > 0) {
                                    var textSpan = anchor.children("span")
                                    var spanCount = textSpan.children(".hawk-facetCount").remove()
                                    pathArr.push(textSpan.text());
                                    textSpan.html(pathArr.join(" &raquo; "));
                                    textSpan.append(spanCount);
                                }

                                anchor.appendTo(li);
                            });
                            var liHeight = searchList.children("li").first().outerHeight();
                            //set search list for max 20 elements
                            searchList.css("max-height", (liHeight * 20) + "px");
                            settings.list.hide();
                        }
                        else {
                            searchList = $("#" + flatUlId);
                            searchList.show();
                            settings.list.hide();
                        }
                    }
                    var noResults = ("<li><span>No Results Found</span></li>");

                    if (filter) {
                        searchList
                            // hide items that do not match input filter
                            .find("li:not(:containsNoCase(" + filter + "))").hide()
                            // show items that match input filter
                            .end().find("li:containsNoCase(" + filter + ")").show();

                        var items = searchList.find("li:containsNoCase(" + filter + ")");

                        // nothing matches filter
                        // add no results found
                        if (items.length == 0) {
                            var item = $(noResults);
                            searchList.prepend(item);
                            return;
                        }

                        //check if more results
                        var options = settings.list.data().options;
                        var moreItems = items.filter(function (index) {
                            return index >= options.cutoff;
                        });
                        moreItems.hide();

                        //if no more results
                        if (moreItems.length == 0) {
                            return;
                        }

                        //otherwise
                        //remove no results
                        items.find(":contains('No Results Found')").remove();

                        if (moreItems) {
                            //add more button and handle it's click event
                            var more = settings.list.find("li.hawk-navMore");
                            more.off("click").each(function () { $(this).find("span").text($(this).parent().data().options.moreText); });
                            more.show();

                            more.on("click", function (event) {
                                var moreTrigger = $(this);
                                if ($(this).hasClass("hawk-navMoreActive")) {
                                    searchList
                                        // hide items that do not match input filter
                                        .find("li:not(:containsNoCase(" + filter + "))").hide()
                                        // show items that match input filter
                                        .end().find("li:containsNoCase(" + filter + ")").show();

                                    items = searchList.find("li:containsNoCase(" + filter + ")");

                                    moreItems = items.filter(function (index) {
                                        return index >= options.cutoff;
                                    });
                                    moreItems.hide();

                                    moreTrigger.find("span").text(moreTrigger.parent().data().options.moreText);
                                    moreTrigger.removeClass("hawk-navMoreActive");
                                    window["hawkexpfacet_" + searchList.attr("id")] = null;
                                    moreTrigger.show();
                                } else {
                                    searchList
                                        // hide items that do not match input filter
                                        .find("li:not(:containsNoCase(" + filter + "))").hide()
                                        // show items that match input filter
                                        .end().find("li:containsNoCase(" + filter + ")").show();

                                    items = searchList.find("li:containsNoCase(" + filter + ")");

                                    // nothing matches filter
                                    if (items.length == 0) {
                                        var item = $(noResults);
                                        searchList.prepend(item);
                                        return;
                                    }
                                    moreTrigger.addClass("hawk-navMoreActive").find("span").text(options.lessText);
                                    moreTrigger.show();
                                    window["hawkexpfacet_" + searchList.attr("id")] = true;
                                };
                            });

                        }
                        //no filter
                    } else {
                        //remove no results option
                        settings.list.find(":contains('No Results Found')").remove();

                        // if nothing is entered display all items in list
                        if (isNestedFacet) {
                            searchList.hide();
                            settings.list.show();
                        }
                        else {
                            if (settings.list.hasClass("hawk-navTruncateList")) {
                                var wasExpanded = settings.list.find("li.hawk-navMore > span").hasClass("hawk-navMoreActive");

                                if (wasExpanded) {
                                    settings.list.find("li").show();
                                }
                                else {
                                    var options = settings.list.data().options;
                                    var items = settings.list.find("li:not(.hawk-navMore)");

                                    items.each(function (i, el) {
                                        if (i < options.cutoff) {
                                            $(this).show();
                                        } else {
                                            $(this).hide();
                                        }
                                    });


                                    //check if more results
                                    var options = settings.list.data().options;
                                    var moreItems = items.filter(function (index) {
                                        return index >= options.cutoff;
                                    });
                                    moreItems.hide();

                                    //if no more results
                                    if (moreItems.length == 0) {
                                        return;
                                    }

                                    if (moreItems) {
                                        var more = settings.list.find("li.hawk-navMore");
                                        more.off("click").find("span").text(options.moreText);
                                        more.show();

                                        more.on("click", function (event) {
                                            var moreTrigger = $(this);
                                            if ($(this).hasClass("hawk-navMoreActive")) {
                                                moreTrigger.hide();
                                                moreTrigger.removeClass("hawk-navMoreActive").find("span").text(options.moreText);
                                                window["hawkexpfacet_" + searchList.attr("id")] = null;
                                                moreTrigger.show();
                                            } else {
                                                moreTrigger.addClass("hawk-navMoreActive").find("span").text(options.lessText);
                                                window["hawkexpfacet_" + searchList.attr("id")] = true;
                                                moreTrigger.show();
                                            };
                                        });
                                    }

                                }
                            } else {
                                settings.list.find("li").show();
                            }
                        }
                    }
                }).keyup(function () {
                    //trigger above actions at every keyup
                    $(this).change();
                });

            });
        };
    }

}(window.HawkSearchLoader = window.HawkSearchLoader || {}));
