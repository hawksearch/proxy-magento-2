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
namespace HawkSearch\Proxy\Block;

use Magento\Framework\View\Element\Template;

/**
 *  Html block
 */
class Html
    extends Template
{

    protected $helper;
    protected $banner;

    public function __construct(Template\Context $context,
                                \HawkSearch\Proxy\Helper\Data $helper,
                                \HawkSearch\Proxy\Model\Banner $banner,
                                array $data = [])
    {
//        $helper->setUri($context->getRequest()->getParams());
//        $helper->setClientIp($context->getRequest()->getClientIp());
//        $helper->setClientUa($context->getRequest()->getHeader('UserAgent'));
//        $helper->setIsHawkManaged(true);
        $this->helper = $helper;
        $this->banner = $banner;

        parent::__construct($context, $data);
    }

    /**
     * @return \HawkSearch\Proxy\Model\Banner
     */
    public function getBanner() {
        return $this->banner;
    }

    function getFacets()
    {

        return $this->helper->getResultData()->Data->Facets;
    }

    function getTopPager()
    {
        return $this->helper->getResultData()->Data->TopPager;
    }

    function getBottomPager()
    {
        return $this->helper->getResultData()->Data->BottomPager;
    }

    function getMetaRobots()
    {
        return $this->helper->getResultData()->MetaRobots;
    }

    function getHeaderTitle()
    {
        return $this->helper->getResultData()->HeaderTitle;
    }

    function getMetaDescription()
    {
        return $this->helper->getResultData()->MetaDescription;
    }

    function getMetaKeywords()
    {
        return $this->helper->getResultData()->MetaKeywords;
    }

    function getRelCanonical()
    {
        return $this->helper->getResultData()->RelCanonical;
    }

    function getTopText()
    {
        return $this->helper->getResultData()->Data->TopText;
    }

    function getRelated()
    {
        return $this->helper->getResultData()->Data->Related;
    }

    function getBreadCrumb()
    {
        return $this->helper->getResultData()->Data->BreadCrumb;
    }

    function getTitle()
    {
        return $this->helper->getResultData()->Data->Title;
    }

    function getItemList()
    {
        $layout = $this->getLayout();
        $block = $layout->createBlock('HawkSearch\Proxy\Block\Product\ListProduct');
        $block->getLoadedProductCollection();
        $block->setTemplate('Magento_Catalog::product/list.phtml');

        return $block->toHtml();

    }

}
