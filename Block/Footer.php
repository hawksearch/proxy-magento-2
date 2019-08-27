<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 9/27/16
 * Time: 12:43 PM
 */

namespace HawkSearch\Proxy\Block;


use HawkSearch\Proxy\Model\System\Config\Source\TrackingVersion;
use Magento\Framework\View\Element\Template;

class Footer extends \Magento\Framework\View\Element\Template
{
    private $helper;

    public function __construct(\HawkSearch\Proxy\Helper\Data $helper,
                                Template\Context $context,
                                array $data)
    {
        parent::__construct($context, $data);
        $this->helper = $helper;
    }

    public function getHawkUrl()
    {
        return $this->helper->getHawkUrl();
    }

    public function getHawkUrlWithEngine()
    {
        return $this->helper->getHawkUrlWithEngine();
    }

    public function getBaseUrl()
    {
        return $this->helper->getBaseUrl();
    }

    public function getTrackingUrl()
    {
        return rtrim($this->helper->getTrackingUrl(), "/");
    }

    public function getRecommenderUrl()
    {
        return $this->helper->getRecsUrl();
    }

    public function getTrackingKey()
    {
        return $this->helper->getOrderTackingKey();
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

    public function getRecommendationsActive()
    {
        return $this->helper->getRecommendationsActive();
    }

    public function isTrackingV2() {
        return $this->helper->getTrackingVersion() == TrackingVersion::VERSION_TWO ? true : false;
    }
}
