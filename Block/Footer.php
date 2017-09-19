<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 9/27/16
 * Time: 12:43 PM
 */

namespace HawkSearch\Proxy\Block;


use Magento\Framework\View\Element\Template;

class Footer extends \Magento\Framework\View\Element\Template
{
    private $helper;
    private $session;
    public function __construct(Template\Context $context,
                                \HawkSearch\Proxy\Helper\Data $helper,
                                \Magento\Catalog\Model\Session $session,
                                array $data)
    {
        $this->helper = $helper;
        $this->session = $session;
        $this->session->setHawkCurrentUpdateHandle($context->getRequest()->getFullActionName());
        parent::__construct($context, $data);
        $this->helper->log(sprintf("handle: %s", $this->session->getHawkCurrentUpdateHandle()));
    }

    public function getBaseUrl(){
        return $this->helper->getBaseUrl();
    }
    public function getTrackingUrl() {
        return $this->helper->getTrackingUrl();
    }
    public function getSearchBoxes() {
        $ids = $this->helper->getConfigurationData('hawksearch_proxy/proxy/search_box_ids');
        return explode(',', $ids);
    }
    public function getHiddenDivName() {
        return $this->helper->getConfigurationData('hawksearch_proxy/proxy/autocomplete_div_id');
    }
    public function getAutosuggestParams() {
        return $this->helper->getConfigurationData('hawksearch_proxy/proxy/autocomplete_query_params');
    }
}