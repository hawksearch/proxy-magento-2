<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 4/6/17
 * Time: 10:05 AM
 */

namespace HawkSearch\Proxy\Model\Observer;

use HawkSearch\Proxy\Model\ConfigProvider as ProxyConfigProvider;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class CategoryLayoutUpdate implements ObserverInterface
{
    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * CategoryLayoutUpdate constructor.
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
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if ($this->proxyConfigProvider->isCategoriesManagementEnabled()) {
            if ($observer->getFullActionName() == 'catalog_category_view') {
                /**
                 * @var \Magento\Framework\View\Layout $layout
                 */
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_category_view');
            } elseif ($observer->getFullActionName() == 'hawkproxy_landingPage_view') {
                /**
                 * @var \Magento\Framework\View\Layout $layout
                 */
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('catalog_category_view')
                    ->addHandle('hawksearch_category_view')
                    ->addHandle('catalog_category_view_type_layered')
                    ->addHandle('catalog_category_view_type_layered_without_children');
            }
            return;
        }
    }
}
