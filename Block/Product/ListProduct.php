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
use Magento\Catalog\Model\Product;

class ListProduct extends \Magento\Catalog\Block\Product\ListProduct
{

    private $topseen = false;
    private $hawkHelper;
    private $pagers = true;
    protected $_productCollection;
    private $pricingHelper;
    protected $response;
    /**
     * @var string
     */
    private $mode;

    public function setPagers($bool)
    {
        $this->pagers = $bool;
    }

    public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Framework\Data\Helper\PostHelper $postDataHelper,
        \Magento\Catalog\Model\Layer\Resolver $layerResolver,
        CategoryRepositoryInterface $categoryRepository,
        \Magento\Framework\Url\Helper\Data $urlHelper,
        \Magento\Framework\Pricing\Helper\Data $pricingHelper,
        \HawkSearch\Proxy\Helper\Data $hawkHelper,
        \Magento\Framework\App\Response\Http $response,
        string $mode = 'proxy',
        array $data = []
    ) {
        $this->pricingHelper = $pricingHelper;
        $this->hawkHelper = $hawkHelper;
        $this->response = $response;
        parent::__construct($context, $postDataHelper, $layerResolver, $categoryRepository, $urlHelper, $data);
        $this->mode = $mode;
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
        if ($this->hawkHelper->modeActive($this->mode)) {
            try {
                if ($this->hawkHelper->getLocation() != "") {
                    $this->hawkHelper->log(sprintf('Redirecting to location: %s', $this->hawkHelper->getLocation()));
                    $this->response->setRedirect($this->hawkHelper->getLocation());
                    $this->response->send();
                    return;
                }
            } catch (\Exception $e) {
                return parent::getToolbarHtml();
            }

            if (!$this->hawkHelper->getIsHawkManaged($this->_request->getOriginalPathInfo())) {
                $this->hawkHelper->log('page not managed, returning core pager');
                return parent::getToolbarHtml();
            }
            if ($this->pagers) {
                $baseUrl = $this->_storeManager->getStore()->getBaseUrl();
                if ($this->topseen) {
                    return '<div id="hawkbottompager">' . str_replace(
                        $baseUrl . '/',
                        $baseUrl,
                        $this->hawkHelper->getResultData()->Data->BottomPager
                    ) . '</div>';
                }
                $this->topseen = true;
                $data = $this->hawkHelper->getResultData()->Data;
                if ($this->hawkHelper->getShowTabs()) {
                    return sprintf(
                        '<div id="hawktabs">%s</div><div id="hawktoppager">%s</div>',
                        $data->Tabs,
                        $data->TopPager
                    );
                }
                return sprintf('<div id="hawktoppager">%s</div>', $data->TopPager);
            } else {
                return '';
            }
        }
        return parent::getToolbarHtml();
    }

    public function getIdentities()
    {
        $identities = [];
        if ($this->_getProductCollection() && count($this->_getProductCollection())) {
            foreach ($this->_getProductCollection() as $item) {
                $identities = array_merge($identities, $item->getIdentities());
            }
        }
        $category = $this->getLayer()->getCurrentCategory();
        if ($category) {
            $identities[] = Product::CACHE_PRODUCT_CATEGORY_TAG . '_' . $category->getId();
        }
        return $identities;
    }

    protected function _getProductCollection()
    {
        if ($this->_productCollection === null) {
            if ($this->hawkHelper->modeActive($this->mode)) {
                if ($this->hawkHelper->getLocation() != "") {
                    $this->hawkHelper->log(
                        sprintf(
                            'Redirecting to location: %s',
                            $this->hawkHelper->getLocation()
                        )
                    );
                    //return $this->helper->_redirectUrl($this->hawkHelper->getLocation());
                    $this->response->setRedirect($this->hawkHelper->getLocation());
                    $this->response->send();
                    return;
                }
                $this->_productCollection = $this->hawkHelper->getProductCollection();
            } else {
                $this->hawkHelper->log('hawk not managing search');
                return parent::_getProductCollection();
            }
        }
        return $this->_productCollection !== null ? $this->_productCollection : parent::_getProductCollection();
    }

    public function getTemplateFile($template = null)
    {
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
                $priceamount = $this->pricingHelper->currency(
                    number_format(
                        $product->getFinalPrice(),
                        2
                    ),
                    true,
                    false
                );
                $price = '<div class="price-box price-final_price" data-role="priceBox" data-product-id="';
                $price .= $product->getId().'">';
                $price .= '<span class="price-container price-final_price tax weee">';
                $price .= '<span id="product-price-' . $product->getId();
                $price .= '" data-price-amount="' . $priceamount;
                $price .= '" data-price-type="finalPrice" class="price-wrapper ">';
                $price .= '<span class="price">' . $priceamount . '</span></span></span></div>';
            }

            return $price;
        }
    }
}
