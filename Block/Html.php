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

        return $this->helper->getResultData()->Data->Facets;
    }

    public function getTopPager()
    {
        return $this->helper->getResultData()->Data->TopPager;
    }

    public function getBottomPager()
    {
        return $this->helper->getResultData()->Data->BottomPager;
    }

    public function getMetaRobots()
    {
        $results = $this->helper->getResultData();
        if (property_exists($results, 'MetaRobots')) {
            return $results->MetaRobots;
        }
        return '';
    }

    public function getHeaderTitle()
    {
        return $this->helper->getResultData()->HeaderTitle;
    }

    public function getMetaDescription()
    {
        return $this->helper->getResultData()->MetaDescription;
    }

    public function getMetaKeywords()
    {
        return $this->helper->getResultData()->MetaKeywords;
    }

    public function getRelCanonical()
    {
        return $this->helper->getResultData()->RelCanonical;
    }

    public function getTopText()
    {
        return $this->helper->getResultData()->Data->TopText;
    }

    public function getRelated()
    {
        return $this->helper->getResultData()->Data->Related;
    }

    public function getBreadCrumb()
    {
        return $this->helper->getResultData()->Data->BreadCrumb;
    }

    public function getTitle()
    {
        return $this->helper->getResultData()->Data->Title;
    }

    public function getHawkTrackingData()
    {
        return $this->helper->getTrackingDataHtml();
    }

    public function getItemList()
    {
        $layout = $this->getLayout();
        $lpurl = $this->_request->getParam('lpurl');
        if ($this->getTabbedContent() && $lpurl == '/catalogsearch/result') {
            return $layout->getBlock('hawksearch_tabbed_items')->toHtml();
        } else {
            return $layout->getBlock('hawksearch_hawkitems')->getChildHtml();
        }
    }

    public function getFeaturedZone($zone)
    {
        $layout = $this->getLayout();
        $block = $layout->createBlock('HawkSearch\Proxy\Block\Product\ListFeatured');
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
        $block = $layout->createBlock('HawkSearch\Proxy\Block\Product\ListFeatured');
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
        return $this->helper->getResultData()->TrackingId;
    }
    public function getTabs()
    {
        $resultData = $this->helper->getResultData()->Data;
        if (property_exists($resultData, 'Tabs')) {
            return $resultData->Tabs;
        }
        return null;
    }
}
