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

class LayoutUpdate implements ObserverInterface
{
    private $helper;
    public function __construct(\HawkSearch\Proxy\Helper\Data $helper)
    {
        $this->helper = $helper;
    }

    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        if($observer->getFullActionName() == 'catalogsearch_result_index') {
            if($this->helper->isManageSearch()) {
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_catalogsearch_result');
            }
        } elseif($observer->getFullActionName() == 'catalog_category_view') {
            if($this->helper->isManageCategories()){
                $layout = $observer->getLayout();
                $layout->getUpdate()->addHandle('hawksearch_category_view');
            }
        } elseif ($observer->getFullActionName() == 'hawkproxy_landingPage_view') {
            /** @var \Magento\Framework\View\Layout $layout */
            $layout = $observer->getLayout();
            $layout->getUpdate()->addHandle('catalog_category_view')
                ->addHandle('hawksearch_category_view')
                ->addHandle('catalog_category_view_type_layered')
                ->addHandle('catalog_category_view_type_layered_without_children');
        } elseif ($observer->getFullActionName() == 'hawkproxy_index_index') {
            $layout = $observer->getLayout();
            $layout->getUpdate()
                ->addHandle('catalogsearch_result_index')
                ->addHandle('hawksearch_catalogsearch_result');
        }
    }
}