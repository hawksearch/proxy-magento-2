<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 4/6/17
 * Time: 10:05 AM
 */

namespace HawkSearch\Proxy\Model\Observer;


use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class CategoryLayoutUpdate implements ObserverInterface
{
    private $helper;
    public function __construct(\HawkSearch\Datafeed\Helper\Data $helper)
    {
        $this->helper = $helper;
    }

    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if($observer->getFullActionName() == 'catalog_category_view'
        && $this->helper->getConfigurationData('hawksearch_proxy/proxy/manage_categories')) {
            /** @var \Magento\Framework\View\Layout $layout */
            $layout = $observer->getLayout();
            $layout->getUpdate()->addHandle('hawksearch_category_view');
        }
    }
}