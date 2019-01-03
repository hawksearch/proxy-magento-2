<?php
/**
 * Created by PhpStorm.
 * User: mageuser
 * Date: 9/14/16
 * Time: 9:44 AM
 */

namespace HawkSearch\Proxy\Block\Product;


use Magento\Framework\View\Element\Template;

class Facets extends \Magento\Framework\View\Element\Template
{
    protected $hawkHelper;
    protected $banner;
    public function __construct(Template\Context $context,
                                \HawkSearch\Proxy\Helper\Data $hawkHelper,
                                \HawkSearch\Proxy\Model\Banner $banner,
                                array $data)
    {
        $this->hawkHelper = $hawkHelper;
        $this->banner = $banner;
        parent::__construct($context, $data);
    }

    public function getFeaturedLeftTop() {
        return $this->banner->getFeaturedLeftTop();
    }
    public function getBannerLeftTop(){
        return $this->banner->getBannerLeftTop();
    }
    public function getFacets(){
        if (!$this->hawkHelper->getIsHawkManaged($this->hawkHelper->getOriginalPathInfo())) {
            $this->hawkHelper->log('page not managed, returning core pager');
            return '';
        }

        return $this->hawkHelper->getFacets();
    }
    public function getFeaturedLeftBottom() {
        return $this->banner->getFeaturedLeftBottom();
    }
    public function getBannerLeftBottom() {
        return $this->banner->getBannerLeftBottom();
    }
}