<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 9/7/16
 * Time: 12:42 PM
 */

namespace HawkSearch\Proxy\Block\Head;


use Magento\Framework\View\Element\Template;

class HawksearchJs
extends \Magento\Framework\View\Element\Template
{
    private $dataHelper;

    public function __construct(
        Template\Context $context,
        \HawkSearch\Proxy\Helper\Data $dataHelper,
        array $data)
    {
        $this->dataHelper = $dataHelper;
        parent::__construct($context, $data);
    }

    public function getTrackingUrl() {
        return $this->dataHelper->getTrackingUrl();
    }
}