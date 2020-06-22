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

namespace HawkSearch\Proxy\Block;

use Magento\Framework\View\Element\Template;
use HawkSearch\Proxy\Block\Product\ListFeatured;

/**
 *  Html block
 */
class Html extends Template
{

    private $helper;
    private $bannerFactory;

    public function __construct(
        Template\Context $context,
        \HawkSearch\Proxy\Helper\Data $helper,
        \HawkSearch\Proxy\Block\BannerFactory $bannerFactory,
        array $data = []
    ) {
        $helper->setClientIp($context->getRequest()->getClientIp());
        $helper->setClientUa($context->getRequest()->getHeader('UserAgent'));
        $helper->setIsHawkManaged(true);
        $this->helper = $helper;
        $this->bannerFactory = $bannerFactory;

        parent::__construct($context, $data);
    }

    public function getBanner()
    {
        return $this->bannerFactory->create();
    }

    public function getFacets()
    {

        return $this->helper->getResultData()->getResponseData()->getFacets();
    }

    public function getTopPager()
    {
        return $this->helper->getResultData()->getResponseData()->getTopPager();
    }

    public function getBottomPager()
    {
        return $this->helper->getResultData()->getResponseData()->getBottomPager();
    }

    public function getMetaRobots()
    {
        return $this->helper->getResultData()->getMetaRobots() ?? '';
    }

    public function getHeaderTitle()
    {
        return $this->helper->getResultData()->getHeaderTitle();
    }

    public function getMetaDescription()
    {
        return $this->helper->getResultData()->getMetaDescription();
    }

    public function getMetaKeywords()
    {
        return $this->helper->getResultData()->getMetaKeywords();
    }

    public function getRelCanonical()
    {
        return $this->helper->getResultData()->getRelCanonical();
    }

    public function getTopText()
    {
        return $this->helper->getResultData()->getResponseData()->getTopText();
    }

    public function getRelated()
    {
        return $this->helper->getResultData()->getResponseData()->getRelated();
    }

    public function getBreadCrumb()
    {
        return $this->helper->getResultData()->getResponseData()->getBreadCrumb();
    }

    public function getTitle()
    {
        return $this->helper->getResultData()->getResponseData()->getTitle();
    }

    public function getHawkTrackingData()
    {
        return $this->helper->getTrackingDataHtml();
    }

    public function getItemList()
    {
        $layout = $this->getLayout();
        $lpurl = $this->_request->getParam('lpurl');
        if ($this->getTabbedContent() && in_array($lpurl, ['/catalogsearch/result/', '/catalogsearch/result'])
            && !$this->helper->productsOnly()) {
            return $layout->getBlock('hawksearch_tabbed_items')->toHtml();
        } else {
            return $layout->getBlock('hawksearch_hawkitems')->getChildHtml();
        }
    }

    public function getFeaturedZone($zone)
    {
        $layout = $this->getLayout();
        $block = $layout->createBlock(ListFeatured::class);
        $block->setZone($zone);
        $productCollection = $block->getLoadedProductCollection();
        if ($productCollection->count() > 0) {
            $block->setTemplate('Magento_Catalog::product/list.phtml');
            return $block->toHtml();
        }
        return "";
    }

    public function getFeaturedLeftZone($zone)
    {
        $layout = $this->getLayout();
        $block = $layout->createBlock(ListFeatured::class);
        $block->setZone($zone);
        $productCollection = $block->getLoadedProductCollection();
        if ($productCollection->count() > 0) {
            $block->setTemplate('HawkSearch_Proxy::hawksearch/proxy/left/featured.phtml');
            return $block->toHtml(false);
        }
        return "";
    }

    public function getHawksearchTrackingId()
    {
        return $this->helper->getResultData()->getTrackingId();
    }
    public function getTabs()
    {
        return $this->helper->getResultData()->getResponseData()->getTabs() ?? '';
    }
}
