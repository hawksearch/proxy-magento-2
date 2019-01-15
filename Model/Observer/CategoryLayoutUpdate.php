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
    /**
     * @var \Magento\Framework\Registry
     */
    private $coreRegistry;

    public function __construct(\HawkSearch\Proxy\Helper\Data $helper,
                                \Magento\Framework\Registry $coreRegistry)
    {
        $this->helper = $helper;
        $this->coreRegistry = $coreRegistry;
    }

    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if( $observer->getFullActionName() == 'catalog_category_view'
            && $this->helper->getConfigurationData('hawksearch_proxy/proxy/manage_categories')) {
            $category = $this->coreRegistry->registry('current_category');
            if($category && $category->getHawkLandingPage()) {
                /** @var \Magento\Framework\View\Layout $layout */
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_category_view');
                if(in_array('catalog_category_view_type_layered', $layout->getUpdate()->getHandles())) {
                    $layout->getUpdate()->removeHandle('catalog_category_view_type_layered');
                }
            }
        }
    }
}