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
use Magento\Catalog\Pricing\Price\FinalPrice;
use Magento\Eav\Model\Entity\Collection\AbstractCollection;
use Magento\Framework\App\Response\Http;
use Magento\Framework\Data\Helper\PostHelper;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\Pricing\Helper\Data as PricingHelper;
use Magento\Framework\Pricing\Render as PriceRenderer;
use Magento\Framework\Url\Helper\Data as UrlHelper;

class ListProduct extends \Magento\Catalog\Block\Product\ListProduct
{
    /**
     * @var bool
     */
    private $topSeen = false;

    /**
     * @var ProxyHelper
     */
    private $hawkHelper;

    /**
     * @var bool
     */
    private $pagers = true;

    /**
     * @var
     */
    protected $_productCollection;

    /**
     * @var PricingHelper
     */
    private $pricingHelper;

    /**
     * @var Http
     */
    protected $response;

    /**
     * @var string
     */
    private $mode;

    /**
     * ListProduct constructor.
     * @param Context $context
     * @param PostHelper $postDataHelper
     * @param Resolver $layerResolver
     * @param CategoryRepositoryInterface $categoryRepository
     * @param UrlHelper $urlHelper
     * @param PricingHelper $pricingHelper
     * @param ProxyHelper $hawkHelper
     * @param Http $response
     * @param string $mode
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
        Http $response,
        string $mode = 'proxy',
        array $data = []
    ) {
        $this->pricingHelper = $pricingHelper;
        $this->hawkHelper = $hawkHelper;
        $this->response = $response;
        parent::__construct($context, $postDataHelper, $layerResolver, $categoryRepository, $urlHelper, $data);
        $this->mode = $mode;
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws NoSuchEntityException
     * @throws NotFoundException
     */
    public function getToolbarHtml()
    {
        if ($this->hawkHelper->modeActive($this->mode)) {
            try {
                if ($this->hawkHelper->getLocation() != "") {
                    $this->hawkHelper->log(sprintf('Redirecting to location: %s', $this->hawkHelper->getLocation()));
                    $this->response->setRedirect($this->hawkHelper->getLocation());
                    $this->response->send();
                    return '';
                }
            } catch (\Exception $e) {
                return parent::getToolbarHtml();
            }

            if (!$this->hawkHelper->getIsHawkManaged($this->_request->getOriginalPathInfo())) {
                $this->hawkHelper->log('page not managed, returning core pager');
                return parent::getToolbarHtml();
            }
            $baseUrl = $this->_storeManager->getStore()->getBaseUrl();
            if ($this->topSeen) {
                return '<div id="hawkbottompager">' . str_replace(
                        $baseUrl . '/',
                        $baseUrl,
                        $this->hawkHelper->getResultData()->getResponseData()->getBottomPager()
                    ) . '</div>';
            }
            $this->topSeen = true;
            if ($this->hawkHelper->getShowTabs()) {
                return sprintf(
                    '<div id="hawktabs">%s</div><div id="hawktoppager">%s</div>',
                    $this->hawkHelper->getResultData()->getResponseData()->getTabs(),
                    $this->hawkHelper->getResultData()->getResponseData()->getTopPager()
                );
            }
            return sprintf(
                '<div id="hawktoppager">%s</div>',
                $this->hawkHelper->getResultData()->getResponseData()->getTopPager()
            );
        }
        return parent::getToolbarHtml();
    }

    /**
     * @return array
     * @throws InstructionException
     * @throws NoSuchEntityException
     * @throws NotFoundException
     * @throws LocalizedException
     */
    public function getIdentities()
    {
        $identities = [];
        if ($this->_getProductCollection() && count($this->_getProductCollection())) {
            foreach ($this->_getProductCollection() as $item) {
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
     * @return Collection|AbstractCollection|null|void
     * @throws InstructionException
     * @throws LocalizedException
     * @throws NoSuchEntityException
     * @throws NotFoundException
     */
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

    /**
     * @param null $template
     * @return bool|string
     */
    public function getTemplateFile($template = null)
    {
        $this->setData('module_name', 'Magento_Catalog');
        $ret = parent::getTemplateFile($template);
        $this->setData('module_name', 'HawkSearch_Proxy');
        return $ret;
    }

    /**
     * @param Product $product
     * @return string
     * @throws LocalizedException
     */
    public function getProductPrice(Product $product)
    {
        $block = $this->getLayout()->getBlock('product.price.render.default');
        $price = '';
        if ($block) {
            $priceRender = $this->getPriceRender();
            if ($priceRender) {
                $price = $priceRender->render(
                    FinalPrice::PRICE_CODE,
                    $product,
                    [
                        'include_container' => true,
                        'display_minimal_price' => true,
                        'zone' => PriceRenderer::ZONE_ITEM_LIST
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
                $price .= $product->getId() . '">';
                $price .= '<span class="price-container price-final_price tax weee">';
                $price .= '<span id="product-price-' . $product->getId();
                $price .= '" data-price-amount="' . $priceamount;
                $price .= '" data-price-type="finalPrice" class="price-wrapper ">';
                $price .= '<span class="price">' . $priceamount . '</span></span></span></div>';
            }
        }
        return $price;
    }
}
