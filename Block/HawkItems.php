<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 10/9/17
 * Time: 10:10 AM
 */

namespace HawkSearch\Proxy\Block;

use HawkSearch\Proxy\Helper\Data;
use Magento\Framework\View\Element\Template;

class HawkItems extends Template
{
    private $banner;
    /**
     * @var Data
     */
    private $helper;

    /**
     * HawkItems constructor.
     *
     * @param Banner                        $banner
     * @param Data                          $helper
     * @param Template\Context              $context
     * @param array                         $data
     */
    public function __construct(
        Banner $banner,
        Data $helper,
        Template\Context $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->banner = $banner;
        $this->helper = $helper;
    }
    public function getBanner()
    {
        return $this->banner;
    }
    public function getClickTracking()
    {
        return $this->helper->getTrackingDataHtml();
    }

    /**
     * @return string
     */
    public function getTopText()
    {
        $result = $this->helper->getResultData();
        return $result->Data->TopText ?? '';
    }
}
