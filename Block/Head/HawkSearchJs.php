<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 9/7/16
 * Time: 12:42 PM
 */

namespace HawkSearch\Proxy\Block\Head;

use Magento\Framework\View\Element\Template;

class HawkSearchJs extends \Magento\Framework\View\Element\Template
{
    private $dataHelper;

    public function __construct(
        Template\Context $context,
        \HawkSearch\Proxy\Helper\Data $dataHelper,
        array $data
    ) {
        $this->dataHelper = $dataHelper;
        parent::__construct($context, $data);
    }

    public function getHawkUrl()
    {
        return $this->dataHelper->getHawkUrl();
    }
    public function getIncludeHawkCss()
    {
        return $this->dataHelper->getConfigurationData('hawksearch_proxy/proxy/hawksearch_include_css');
    }
    public function getJsPath()
    {
        if ($this->dataHelper->getConfigurationData('hawksearch_proxy/proxy/local_js')) {
            return 'HawkSearch_Proxy/js/hawksearch';
        }
        return sprintf('%s/includes/hawksearch', $this->getHawkUrl());
    }
}
