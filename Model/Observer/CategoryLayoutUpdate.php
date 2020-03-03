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
    private $registry;

    public function __construct(\HawkSearch\Datafeed\Helper\Data $helper,
                                \Magento\Framework\Registry $registry
    )
    {
        $this->helper = $helper;
        $this->registry = $registry;
    }

    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if($this->helper->getConfigurationData('hawksearch_proxy/proxy/manage_categories')){
            if($observer->getFullActionName() == 'catalog_category_view') {
                if(!$this->helper->getConfigurationData('hawksearch_proxy/proxy/manage_all')) {
                    $category = $this->registry->registry('current_category');
                    if (is_object($category) && $category->getId()) {
                        if(! $category->getHawkLandingPage()) {
                            return;
                        }
                    }
                }

                /** @var \Magento\Framework\View\Layout $layout */
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_category_view');
            } elseif($observer->getFullActionName() == 'hawkproxy_landingPage_view'){
                /** @var \Magento\Framework\View\Layout $layout */
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('catalog_category_view')
                    ->addHandle('hawksearch_category_view')
                    ->addHandle('catalob_category_view_type_layered')
                    ->addHandle('catalog_category_view_type_layered_without_children');
            }
            return;
        }
    }
}
