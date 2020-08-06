<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Catalog\Api\CategoryRepositoryInterface;
use Magento\Catalog\Block\Product\Context;
use Magento\Catalog\Model\Layer\Resolver;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\ResourceModel\Product\Collection;
use Magento\Eav\Model\Entity\Collection\AbstractCollection;
use Magento\Framework\Data\Helper\PostHelper;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\Pricing\Helper\Data as PricingHelper;
use Magento\Framework\Url\Helper\Data as UrlHelper;

/**
 * Class ListFeatured
 * HawkSearch\Proxy\Block\Product
 */
class ListFeatured extends \Magento\Catalog\Block\Product\ListProduct
{
    /**
     * @var ProxyHelper
     */
    private $hawkHelper;

    /**
     * @var
     */
    protected $_productCollection;

    /**
     * @var PricingHelper
     */
    private $_pricingHelper;

    /**
     * @var string
     */
    private $_zone = "";

    /**
     * ListFeatured constructor.
     *
     * @param Context $context
     * @param PostHelper $postDataHelper
     * @param Resolver $layerResolver
     * @param CategoryRepositoryInterface $categoryRepository
     * @param UrlHelper $urlHelper
     * @param PricingHelper $pricingHelper
     * @param ProxyHelper $hawkHelper
     * @param array $data
     */
    public function __construct(
        Context $context,
        PostHelper $postDataHelper,
        Resolver $layerResolver,
        CategoryRepositoryInterface $categoryRepository,
        UrlHelper $urlHelper,
        PricingHelper $pricingHelper,
        ProxyHelper $hawkHelper,
        array $data = []
    ) {
        $this->_pricingHelper = $pricingHelper;
        $this->hawkHelper = $hawkHelper;
        parent::__construct($context, $postDataHelper, $layerResolver, $categoryRepository, $urlHelper, $data);
    }

    /**
     * @param string $zone
     */
    public function setZone($zone)
    {
        $this->_zone = $zone;
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getHawkTrackingId()
    {
        if (!empty($this->hawkHelper)) {
            return $this->hawkHelper->getResultData()->getTrackingId();
        }
        return '';
    }

    /**
     * @return string
     */
    public function getToolbarHtml()
    {
        return '';
    }

    /**
     * @return Collection|AbstractCollection|null
     */
    protected function _getProductCollection()
    {
        if ($this->_productCollection === null) {
            $this->_productCollection = $this->hawkHelper->getFeaturedProductCollection($this->_zone);
        }

        return $this->_productCollection;
    }

    /**
     * @return Collection|AbstractCollection|null
     */
    public function getProductCollection()
    {
        return $this->_getProductCollection();
    }

    /**
     * @return string
     */
    public function getPagerHtml()
    {
        return "";
    }

    /**
     * @return array
     */
    public function getIdentities()
    {
        $identities = [];
        if ($this->_getProductCollection()) {
            foreach ($this->_getProductCollection()->getItems() as $item) {
                $identities[] = $item->getIdentities();
            }
        }
        $identities = array_merge([], ...$identities);
        $category = $this->getLayer()->getCurrentCategory();
        if ($category) {
            $identities[] = Product::CACHE_PRODUCT_CATEGORY_TAG . '_' . $category->getId();
        }
        return $identities;
    }

    /**
     * @param  Product $product
     * @return string
     */
    public function getProductPrice(Product $product)
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
            $priceamount = $this->_pricingHelper->currency(
                number_format(
                    $product->getFinalPrice(),
                    2
                ),
                true,
                false
            );
            $price ='<div class="price-box price-final_price" data-role="priceBox" data-product-id="178884">';
            $price .= '<span class="price-container price-final_price tax weee">';
            $price .= '<span id="product-price-178884" data-price-amount="';
            $price .= $priceamount . '" data-price-type="finalPrice" class="price-wrapper ">';
            $price .= '<span class="price">' . $priceamount . '</span></span></span></div>';
        }

        return $price;
    }

    /**
     * @return mixed
     */
    public function getTitle()
    {
        return $this->hawkHelper->getFeaturedZoneTitle($this->_zone);
    }

    /**
     * @param  bool $displayTitle
     * @return string
     */
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
