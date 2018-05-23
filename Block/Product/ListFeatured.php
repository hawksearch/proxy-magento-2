<?php
/**
 * Copyright (c) 2017 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Block\Product;

use \Magento\Catalog\Api\CategoryRepositoryInterface;

class ListFeatured extends \Magento\Catalog\Block\Product\ListProduct
{
    private $hawkHelper;
    private $pagers = false;
    protected $_productCollection;
    private $_pricingHelper;
    private $_zone = "";

    public function setPagers($bool)
    {
        $this->pagers = $bool;
    }

    public function __construct(\Magento\Catalog\Block\Product\Context $context,
                                \Magento\Framework\Data\Helper\PostHelper $postDataHelper,
                                \Magento\Catalog\Model\Layer\Resolver $layerResolver,
                                \Magento\Catalog\Api\CategoryRepositoryInterface $categoryRepository,
                                \Magento\Framework\Url\Helper\Data $urlHelper,
                                \Magento\Framework\Pricing\Helper\Data $pricingHelper,
                                \HawkSearch\Proxy\Helper\Data $hawkHelper,
                                array $data = [])
    {
        $this->_pricingHelper = $pricingHelper;
        $this->hawkHelper = $hawkHelper;
        parent::__construct($context, $postDataHelper, $layerResolver, $categoryRepository, $urlHelper, $data);
    }

    public function setZone($zone)
    {
        $this->_zone = $zone;
    }

    public function getHawkTrackingId()
    {
        if (!empty($this->hawkHelper)) {
            return $this->hawkHelper->getResultData()->TrackingId;
        }
        return '';
    }

    public function getToolbarHtml()
    {
        return '';
    }


    protected function _getProductCollection()
    {
        if ($this->_productCollection === null) {

            $this->_productCollection = $this->hawkHelper->getFeaturedProductCollection($this->_zone);
        }

        return $this->_productCollection;
    }

    public function getProductCollection()
    {
        return $this->_getProductCollection();
    }

    public function getPagerHtml()
    {
        return "";
    }

    public function getIdentities()
    {
        $identities = [];
        if(count($this->_getProductCollection()))
        {
            foreach ($this->_getProductCollection() as $item)
            {
                $identities = array_merge($identities, $item->getIdentities());
            }
        }
        $category = $this->getLayer()->getCurrentCategory();
        if ($category) {
            $identities[] = \Magento\Catalog\Model\Product::CACHE_PRODUCT_CATEGORY_TAG . '_' . $category->getId();
        }
        return $identities;
    }

    public function getProductPrice(\Magento\Catalog\Model\Product $product)
    {
        $priceRender = $this->getPriceRender();

        $price = '';
        if ($priceRender) {
            $price = $priceRender->render(
                \Magento\Catalog\Pricing\Price\FinalPrice::PRICE_CODE,
                $product,
                [
                    'include_container' => true,
                    'display_minimal_price' => true,
                    'zone' => \Magento\Framework\Pricing\Render::ZONE_ITEM_LIST
                ]
            );
        } else {
            $priceamount = $this->_pricingHelper->currency(number_format($product->getFinalPrice(), 2), true, false);
            $price='<div class="price-box price-final_price" data-role="priceBox" data-product-id="178884">
<span class="price-container price-final_price tax weee">
        <span id="product-price-178884" data-price-amount="'.$priceamount.'" data-price-type="finalPrice" class="price-wrapper ">
        <span class="price">'.$priceamount.'</span>    </span>
        </span>

</div>';
        }

        return $price;
    }

    public function getTitle()
    {
        return $this->hawkHelper->getFeaturedZoneTitle($this->_zone);
    }

    public function toHtml($displayTitle = true)
    {
        $title = "";
        if ($displayTitle) {
            // Get the title of this section
            $title = $this->hawkHelper->getFeaturedZoneTitle($this->_zone);
            if ($title) {
                $title = "<h2>" . $title . "<h2>\n";
            }
        }
        return $title . parent::toHtml();
    }
}
