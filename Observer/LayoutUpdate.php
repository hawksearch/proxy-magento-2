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

use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\View\Layout;

class LayoutUpdate implements ObserverInterface
{
    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * LayoutUpdate constructor.
     * @param ProxyConfigProvider $proxyConfigProvider
     */
    public function __construct(
        ProxyConfigProvider $proxyConfigProvider
    ) {
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        /** @var Layout $layout */
        $layout = $observer->getData('layout');
        $action = $observer->getData('full_action_name');
        if ($action == 'catalogsearch_result_index') {
            if ($this->proxyConfigProvider->isManageSearch()) {
                $layout->getUpdate()->addHandle('hawksearch_catalogsearch_result');
            }
        } elseif ($action == 'catalog_category_view') {
            if ($this->proxyConfigProvider->isManageCategories()) {
                $layout->getUpdate()->addHandle('hawksearch_category_view');
            }
        } elseif ($action == 'hawkproxy_landingPage_view') {
            $layout->getUpdate()->addHandle('catalog_category_view')
                ->addHandle('hawksearch_category_view')
                ->addHandle('catalog_category_view_type_layered')
                ->addHandle('catalog_category_view_type_layered_without_children');
        } elseif ($action == 'hawkproxy_index_index') {
            $layout->getUpdate()
                ->addHandle('hawksearch_catalogsearch_result');
        } elseif ($action == 'hawkproxy_index_category') {
            $layout->getUpdate()
                ->addHandle('hawksearch_catalogsearch_result');
        }
    }
}
