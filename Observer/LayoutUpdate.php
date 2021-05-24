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
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Exception\NoSuchEntityException;
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
     * LayoutUpdate constructor.
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param ProxyHelper $proxyHelper
     */
    public function __construct(
        ProxyConfigProvider $proxyConfigProvider,
        ProxyHelper $proxyHelper
    ) {
        $this->proxyConfigProvider = $proxyConfigProvider;
        $this->proxyHelper = $proxyHelper;
    }

    /**
     * @param Observer $observer
     * @return void
     * @throws NoSuchEntityException
     */
    public function execute(Observer $observer)
    {
        $isManaged = $this->proxyHelper->getIsHawkManaged();
        if (!$isManaged) {
            return;
        }

        /** @var Layout $layout */
        $layout = $observer->getData('layout');
        $action = $observer->getData('full_action_name');
        switch ($action) {
            case 'catalogsearch_result_index':
            case 'hawkproxy_index_index':
            case 'hawkproxy_index_category':
                $layout->getUpdate()->addHandle('hawksearch_catalogsearch_result');
                break;

            case 'catalog_category_view':
                $layout->getUpdate()->addHandle('hawksearch_category_view');
                break;

            case 'hawkproxy_landingPage_view':
                $layout->getUpdate()
                    ->addHandle('catalog_category_view')
                    ->addHandle('hawksearch_category_view')
                    ->addHandle('catalog_category_view_type_layered')
                    ->addHandle('catalog_category_view_type_layered_without_children');
                break;
        }
    }
}
