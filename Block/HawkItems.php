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
    public function __construct(
        Template\Context $context,
        \HawkSearch\Proxy\Model\Banner $banner,
        array $data = [])
    {
        $this->banner = $banner;
        parent::__construct($context, $data);
    }
    public function getBanner() {
        return $this->banner;
    }
}