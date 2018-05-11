<?php
/**
 * Copyright (c) 2013 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

use Magento\Catalog\Api\CategoryRepositoryInterface;

class ListProduct
    extends \Magento\Catalog\Block\Product\ListProduct
{

    private $topseen = false;
    public $helper;
    private $hawkHelper;
    private $pagers = true;
    protected $_productCollection;


    public function setPagers($bool)
    {
        $this->pagers = $bool;
    }

    public function __construct(\Magento\Catalog\Block\Product\Context $context,
                                \Magento\Framework\Data\Helper\PostHelper $postDataHelper,
                                \Magento\Catalog\Model\Layer\Resolver $layerResolver,
                                CategoryRepositoryInterface $categoryRepository,
                                \Magento\Framework\Url\Helper\Data $urlHelper,
                                \Magento\Framework\Pricing\Helper\Data $pricingHelper,
                                \HawkSearch\Proxy\Helper\Data $hawkHelper,
                                \Magento\Framework\App\Response\Http $response,
                                array $data = [])
    {
        $this->_pricingHelper = $pricingHelper;
        $this->hawkHelper = $hawkHelper;
        $this->response = $response;
        parent::__construct($context, $postDataHelper, $layerResolver, $categoryRepository, $urlHelper, $data);
    }

    public function getHawkTrackingId()
    {
        if (!empty($this->helper)) {
            return $this->helper->getResultData()->TrackingId;
        }
        return '';
    }

    public function getToolbarHtml()
    {
        if ($this->hawkHelper->getLocation() != "") {
            $this->hawkHelper->log(sprintf('Redirecting to location: %s', $this->hawkHelper->getLocation()));
            return $this->_redirectUrl($this->hawkHelper->getLocation());
        }

        if (!$this->hawkHelper->getIsHawkManaged($this->_request->getOriginalPathInfo())) {
            $this->hawkHelper->log('page not managed, returning core pager');
            return parent::getToolbarHtml();
        }
        if ($this->pagers) {
            $baseUrl = $this->_storeManager->getStore()->getBaseUrl();
            if ($this->topseen) {
                return '<div id="hawkbottompager">' . str_replace($baseUrl.'/', $baseUrl, $this->hawkHelper->getResultData()->Data->BottomPager) . '</div>';
            }
            $this->topseen = true;
            return '<div id="hawktoppager">' . str_replace($baseUrl.'/', $baseUrl, $this->hawkHelper->getResultData()->Data->TopPager) . '</div>';
        } else {
            return '';
        }
    }

    public function getIdentities()
    {
        $identities = [];
        if(count($this->_getProductCollection()))
        {
            foreach ($this->_getProductCollection() as $item) {
                $identities = array_merge($identities, $item->getIdentities());
            }
        }
        $category = $this->getLayer()->getCurrentCategory();
        if ($category)
        {
            $identities[] = \Magento\Catalog\Model\Product::CACHE_PRODUCT_CATEGORY_TAG . '_' . $category->getId();
        }
        return $identities;
    }

    protected function _getProductCollection()
    {
        if ($this->_productCollection === null) {

            if ($this->hawkHelper->getConfigurationData('hawksearch_proxy/general/enabled')) {

                if ($this->hawkHelper->getLocation() != "") {
                    $this->hawkHelper->log(sprintf('Redirecting to location: %s', $this->helper->getLocation()));
                    return $this->helper->_redirectUrl($this->hawkHelper->getLocation());
                }
                $this->_productCollection = $this->hawkHelper->getProductCollection();
            } else {
                $this->hawkHelper->log('hawk not managing search');
                return parent::_getProductCollection();
            }
        }
        if($this->_productCollection == null) {
            $this->_productCollection = parent::_getProductCollection();
        }
        return $this->_productCollection;
    }

    public function getTemplateFile($template = null) {
        $this->setData('module_name', 'Magento_Catalog');
        $ret = parent::getTemplateFile($template);
        $this->setData('module_name', 'HawkSearch_Proxy');
        return $ret;
    }

    public function getProductPrice(\Magento\Catalog\Model\Product $product)
    {
        $block = $this->getLayout()->getBlock('product.price.render.default');
        if ($block) {
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
                $price = '<div class="price-box price-final_price" data-role="priceBox" data-product-id="' . $product->getId() . '">


<span class="price-container price-final_price tax weee">
        <span id="product-price-' . $product->getId() . '" data-price-amount="' . $priceamount . '" data-price-type="finalPrice" class="price-wrapper ">
        <span class="price">' . $priceamount . '</span>    </span>
        </span>

</div>';
            }

            return $price;
        }
    }
}
