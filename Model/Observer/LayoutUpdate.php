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

namespace HawkSearch\Proxy\Model\Observer;

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
     * @param  Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        if ($observer->getFullActionName() == 'catalogsearch_result_index') {
            if ($this->proxyConfigProvider->isManageSearch()) {
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_catalogsearch_result');
            }
        } elseif ($observer->getFullActionName() == 'catalog_category_view') {
            if ($this->proxyConfigProvider->isManageCategories()) {
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_category_view');
            }
        } elseif ($observer->getFullActionName() == 'hawkproxy_landingPage_view') {
            /**
             * @var Layout $layout
             */
            $layout = $observer->getLayout();
            $layout->getUpdate()->addHandle('catalog_category_view')
                ->addHandle('hawksearch_category_view')
                ->addHandle('catalog_category_view_type_layered')
                ->addHandle('catalog_category_view_type_layered_without_children');
        } elseif ($observer->getFullActionName() == 'hawkproxy_index_index') {
            $layout = $observer->getLayout();
            $layout->getUpdate()
                ->addHandle('hawksearch_catalogsearch_result');
        }
    }
}
