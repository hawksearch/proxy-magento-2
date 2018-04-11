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
    private $hawkHelper;
    private $banner;
    public function __construct(Template\Context $context,
                                \HawkSearch\Proxy\Model\Banner $banner,
                                \HawkSearch\Proxy\Helper\Data $hawkHelper,
                                array $data)
    {
        $this->hawkHelper = $hawkHelper;
        $this->banner = $banner;
        parent::__construct($context, $data);
    }

    public function getFeaturedLeftTop()
    {
        return $this->getFeaturedZone("FeaturedLeftTop");
    }
    public function getBannerLeftTop(){
        return $this->banner->getBannerLeftTop();
    }
    public function getFacets(){
        return $this->hawkHelper->getFacets();
    }
    public function getFeaturedLeftBottom()
    {
        return $this->getFeaturedZone("FeaturedLeftBottom");
    }
    public function getBannerLeftBottom()
    {
        return $this->banner->getBannerLeftBottom();
    }

    protected function getFeaturedZone($zone)
    {
        $layout = $this->getLayout();
        $block = $layout->createBlock('HawkSearch\Proxy\Block\Product\ListFeatured');
        $block->setZone($zone);
        $productCollection = $block->getLoadedProductCollection();
        if ($productCollection->count() > 0) {
            $block->setTemplate('HawkSearch_Proxy::hawksearch/proxy/left/featured.phtml');
            return $block->toHtml(false);
        }
        return "";
    }
}
