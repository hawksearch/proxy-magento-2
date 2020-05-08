<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 10/9/17
 * Time: 10:10 AM
 */

namespace HawkSearch\Proxy\Block;

use Magento\Framework\View\Element\Template;

class HawkItems extends Template
{
    private $banner;
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    /**
     * HawkItems constructor.
     *
     * @param Banner                        $banner
     * @param \HawkSearch\Proxy\Helper\Data $helper
     * @param Template\Context              $context
     * @param array                         $data
     */
    public function __construct(
        Banner $banner,
        \HawkSearch\Proxy\Helper\Data $helper,
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
}
