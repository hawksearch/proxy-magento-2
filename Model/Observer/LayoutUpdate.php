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

use HawkSearch\Proxy\Model\ConfigProvider;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class LayoutUpdate implements ObserverInterface
{
    /**
     * @var ConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * LayoutUpdate constructor.
     * @param ConfigProvider $proxyConfigProvider
     */
    public function __construct(
        ConfigProvider $proxyConfigProvider
    ) {
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @param  Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if ($observer->getFullActionName() == 'catalogsearch_result_index') {
            if ($this->proxyConfigProvider->isSearchManagementEnabled()) {
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_catalogsearch_result');
            }
        } elseif ($observer->getFullActionName() == 'catalog_category_view') {
            if ($this->proxyConfigProvider->isCategoriesManagementEnabled()) {
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_category_view');
            }
        } elseif ($observer->getFullActionName() == 'hawkproxy_landingPage_view') {
            /**
             * @var \Magento\Framework\View\Layout $layout
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
