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

use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use HawkSearch\Proxy\ViewModel\ProductListToolbar;
use Magento\Catalog\Block\Product\ListProduct;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\View\Element\AbstractBlock;

class ListProductBlockInitCollection implements ObserverInterface
{
    /**
     * @var ProxyHelper
     */
    private $hawkHelper;

    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var ProductListToolbar
     */
    private $productListToolbar;

    /**
     * ListProductBlockInitCollection constructor.
     * @param ProxyHelper $hawkHelper
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param RequestInterface $request
     * @param ProductListToolbar $productListToolbar
     */
    public function __construct(
        ProxyHelper $hawkHelper,
        ProxyConfigProvider $proxyConfigProvider,
        RequestInterface $request,
        ProductListToolbar $productListToolbar
    ) {
        $this->hawkHelper = $hawkHelper;
        $this->proxyConfigProvider = $proxyConfigProvider;
        $this->request = $request;
        $this->productListToolbar = $productListToolbar;
    }

    /**
     * @inheritDoc
     */
    public function execute(Observer $observer)
    {
        /** @var AbstractBlock $block */
        $block = $observer->getDataByKey('block');

        if (!($block instanceof ListProduct)) {
            return;
        }

        switch ($block->getNameInLayout()) {
            case 'search_result_list':
                $isActive = $this->proxyConfigProvider->isManageSearch();
                break;

            case 'category.products.list':
                $isActive = $this->proxyConfigProvider->isManageCategories();
                break;

            default:
                $isActive = false;
        }

        if ($isActive && $this->hawkHelper->getIsHawkManaged($this->request->getOriginalPathInfo())) {
            $block->setToolbarBlockName('hawksearch_product_list_toolbar');
            $block->setCollection($this->hawkHelper->getProductCollection());
        }
    }
}
