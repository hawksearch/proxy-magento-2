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

namespace HawkSearch\Proxy\Observer;

use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Catalog\Model\Category as CategoryModel;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Registry;
use Magento\Framework\View\Layout;

class LayoutUpdate implements ObserverInterface
{
    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * @var Registry
     */
    private $coreRegistry;

    /**
     * LayoutUpdate constructor.
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param ProxyHelper $proxyHelper
     */
    public function __construct(
        ProxyConfigProvider $proxyConfigProvider,
        ProxyHelper $proxyHelper,
        Registry $coreRegistry
    ) {
        $this->proxyConfigProvider = $proxyConfigProvider;
        $this->proxyHelper = $proxyHelper;
        $this->coreRegistry = $coreRegistry;
    }

    /**
     * @param Observer $observer
     * @return void
     * @throws NoSuchEntityException
     */
    public function execute(Observer $observer)
    {
        $path = null;
        $handles = [];

        /** @var Layout $layout */
        $layout = $observer->getData('layout');
        $action = $observer->getData('full_action_name');
        switch ($action) {
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'hawkproxy_index_category':
                /** @var CategoryModel $category */
                $category = $this->coreRegistry->registry('current_category');
                if ($category->getId()) {
                    $path = $this->proxyHelper->getRequestPath($category);
                }
                //skipping break here
            case 'catalogsearch_result_index':
            case 'hawkproxy_index_index':
                $handles[] = 'hawksearch_catalogsearch_result';
                break;

            case 'catalog_category_view':
                $handles[] = 'hawksearch_category_view';
                break;

            case 'hawkproxy_landingPage_view':
                $handles[] = 'catalog_category_view';
                $handles[] = 'hawksearch_category_view';
                $handles[] = 'catalog_category_view_type_layered';
                $handles[] = 'catalog_category_view_type_layered_without_children';
                break;
        }

        $isManaged = $this->proxyHelper->getIsHawkManaged($path);
        if ($isManaged) {
            $layout->getUpdate()->addHandle($handles);
        }
    }
}
