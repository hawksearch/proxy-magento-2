<?php
/**
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

declare(strict_types=1);

namespace HawkSearch\Proxy\Observer;

use HawkSearch\Proxy\ViewModel\ProductListToolbar;
use Magento\Framework\DataObject;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\View\Layout;

class ModifyToolbarBlock implements ObserverInterface
{
    /**
     * @var bool
     */
    private $isTopPagerSeen = false;

    /**
     * @var ProductListToolbar
     */
    private $productListToolbar;

    /**
     * ModifyToolbarBlock constructor.
     * @param ProductListToolbar $productListToolbar
     */
    public function __construct(
        ProductListToolbar $productListToolbar
    ) {
        $this->productListToolbar = $productListToolbar;
    }

    /**
     * Display top pager (with tabs) instead of bottom pager (the default one)
     * @inheritDoc
     */
    public function execute(Observer $observer)
    {
        $elementName = $observer->getDataByKey('element_name');
        /** @var DataObject $transport */
        $transport = $observer->getDataByKey('transport');
        /** @var Layout $layout */
        $layout = $observer->getDataByKey('layout');

        if ($elementName == 'hawksearch_product_list_toolbar' && !$this->isTopPagerSeen) {
            $elementOutput = $layout->getBlock('hawksearch_product_list_toolbar_top')->toHtml();
            $this->isTopPagerSeen = true;
            $transport->setData('output', $elementOutput);
        }
    }
}
