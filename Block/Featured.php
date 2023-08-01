<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Block;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Catalog\Block\Product\AbstractProduct;
use Magento\Catalog\Block\Product\Context;
use Magento\Catalog\Helper\Image;
use Magento\Catalog\Helper\ImageFactory;
use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\Product\Image\NotLoadInfoImageException;
use Magento\Catalog\Model\Product\Url;
use Magento\Framework\Data\Helper\PostHelper;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\Phrase;
use Magento\Framework\Pricing\Render;

class Featured extends AbstractProduct
{
    /**
     * @var ProxyHelper
     */
    private $proxyHelper;

    /**
     * @var ImageFactory
     */
    private $imageHelperFactory;

    /**
     * @var Url
     */
    private $productUrl;

    /**
     * @var PostHelper
     */
    private $postHelper;

    /**
     * Banner constructor.
     * @param ProxyHelper $proxyHelper
     * @param ImageFactory $imageHelperFactory
     * @param Url $productUrl
     * @param PostHelper $postHelper
     * @param Context $context
     * @param array $data
     */
    public function __construct(
        ProxyHelper $proxyHelper,
        ImageFactory $imageHelperFactory,
        Url $productUrl,
        PostHelper $postHelper,
        Context $context,
        array $data = []
    )
    {
        parent::__construct($context, $data);
        $this->proxyHelper = $proxyHelper;
        $this->imageHelperFactory = $imageHelperFactory;
        $this->productUrl = $productUrl;
        $this->postHelper = $postHelper;
    }

    /**
     * @param string $zone
     */
    public function setZone(string $zone)
    {
        $this->setData('zone', $zone);
    }

    /**
     * @return string
     */
    public function getZone()
    {
        return $this->getData('zone');
    }

    /**
     * @throws InstructionException
     * @throws LocalizedException
     * @throws NotFoundException
     */
    public function getItems()
    {
        $collection = $this->proxyHelper->getFeaturedProductCollection($this->getZone());

        $items = [];
        foreach ($collection as $item) {
            $items[] = $this->getItemData($item);
        }
        return $items;
    }

    /**
     * Retrieve featured item data
     *
     * @param Product $item
     * @return array
     * @throws LocalizedException
     */
    protected function getItemData(Product $item)
    {
        return [
            'image' => $this->getImageData($item),
            'product_sku' => $item->getSku(),
            'product_id' => $item->getId(),
            'product_url' => $this->productUrl->getUrl($item),
            'product_name' => $item->getName(),
            'product_price' => $this->getProductPriceHtml(
                $item,
                'final_price',
                Render::ZONE_ITEM_LIST
            ),
            'product_is_saleable_and_visible' => $item->isSaleable() && $item->isVisibleInSiteVisibility(),
            'product_has_required_options' => $item->getTypeInstance()->hasRequiredOptions($item),
            'add_to_cart_params' => $this->postHelper->getPostData(
                $this->escapeUrl($this->getAddToCartUrl($item)), ['product' => $item->getEntityId()]
            ),
        ];
    }

    /**
     * Retrieve product image data
     *
     * @param Product $product
     * @return array
     * @SuppressWarnings(PHPMD.NPathComplexity)
     */
    protected function getImageData($product)
    {
        /** @var Image $helper */
        $helper = $this->imageHelperFactory->create()
            ->init($product, 'hawksearch_featured_sidebar_block');

        $template = 'Magento_Catalog/product/image_with_borders';

        try {
            $imagesize = $helper->getResizedImageInfo();
        } catch (NotLoadInfoImageException $exception) {
            $imagesize = [$helper->getWidth(), $helper->getHeight()];
        }

        $width = $helper->getFrame()
            ? $helper->getWidth()
            : $imagesize[0];

        $height = $helper->getFrame()
            ? $helper->getHeight()
            : $imagesize[1];

        return [
            'template' => $template,
            'src' => $helper->getUrl(),
            'width' => $width,
            'height' => $height,
            'alt' => $helper->getLabel(),
        ];
    }

    /**
     * Return HTML block content
     *
     * @param Product $product
     * @param string $priceType
     * @param string $renderZone
     * @param array $arguments
     * @return string
     * @throws LocalizedException
     */
    public function getProductPriceHtml(
        Product $product,
        $priceType,
        $renderZone = Render::ZONE_ITEM_LIST,
        array $arguments = []
    )
    {
        if (!isset($arguments['zone'])) {
            $arguments['zone'] = $renderZone;
        }

        $price = '';

        $priceRender = $this->getPriceRender();
        if ($priceRender) {
            $price = $priceRender->render($priceType, $product, $arguments);
        }

        return $price;
    }

    /**
     * Get price render block
     *
     * @return Render
     * @throws LocalizedException
     */
    private function getPriceRender()
    {
        /** @var Render $priceRender */
        $priceRender = $this->getLayout()->getBlock('product.price.render.default');
        if (!$priceRender) {
            $priceRender = $this->getLayout()->createBlock(
                Render::class,
                'product.price.render.default',
                [
                    'data' => [
                        'price_render_handle' => 'catalog_product_prices',
                    ],
                ]
            );
        }
        return $priceRender;
    }

    /**
     * Create items counter label based on featured item quantity
     *
     * @param int $count
     * @return Phrase|null
     */
    public function getCounterLabel($count)
    {
        if ($count > 1) {
            return __('%1 items', $count);
        } elseif ($count == 1) {
            return __('1 item');
        }
        return null;
    }

    /**
     * Retrieve JS UI component name
     *
     * @return string
     */
    public function getComponentName()
    {
        return $this->getNameInLayout() . ($this->getZone() ?? '');
    }
}
