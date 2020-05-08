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
    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        Template\Context $context,
        array $data
    ) {
        parent::__construct($context, $data);
        $this->helper = $helper;
    }

    public function getBaseUrl()
    {
        return $this->helper->getBaseUrl();
    }
    public function getTrackingUrl()
    {
        return $this->helper->getTrackingUrl();
    }
    public function getSearchBoxes()
    {
        $ids = $this->helper->getConfigurationData('hawksearch_proxy/proxy/search_box_ids');
        return explode(',', $ids);
    }
    public function getHiddenDivName()
    {
        return $this->helper->getConfigurationData('hawksearch_proxy/proxy/autocomplete_div_id');
    }
    public function getAutosuggestParams()
    {
        return $this->helper->getConfigurationData('hawksearch_proxy/proxy/autocomplete_query_params');
    }
}
