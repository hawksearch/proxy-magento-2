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

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        \HawkSearch\Proxy\Model\Banner $banner,
        Template\Context $context,
        array $data = [])
    {
        $this->banner = $banner;
        parent::__construct($context, $data);
        $this->helper = $helper;
    }
    public function getBanner() {
        return $this->banner;
    }

    protected function _beforeToHtml()
    {
        return parent::_beforeToHtml();
    }

}