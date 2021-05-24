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

namespace HawkSearch\Proxy\Block;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\View\Element\Template;

/**
 *  Html block
 * @method getTabbedContent() string
 * @method setTabbedContent(bool $value) string
 */
class Html extends Template
{
    /**
     * @var ProxyHelper
     */
    private $helper;

    /**
     * @var BannerFactory
     */
    private $bannerFactory;

    /**
     * Html constructor.
     * @param Template\Context $context
     * @param ProxyHelper $helper
     * @param BannerFactory $bannerFactory
     * @param array $data
     */
    public function __construct(
        Template\Context $context,
        ProxyHelper $helper,
        BannerFactory $bannerFactory,
        array $data = []
    ) {
        $this->helper = $helper;
        $this->bannerFactory = $bannerFactory;

        parent::__construct($context, $data);
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getFacets()
    {
        return $this->helper->getFacets();
    }

    /**
     * @return bool
     */
    public function isShowFacets()
    {
        return $this->helper->isShowFacets();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getTopPager()
    {
        return $this->helper->getResultData()->getResponseData()->getTopPager();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getBottomPager()
    {
        return $this->helper->getResultData()->getResponseData()->getBottomPager();
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getMetaRobots()
    {
        return $this->helper->getResultData()->getMetaRobots() ?? '';
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getHeaderTitle()
    {
        return $this->helper->getResultData()->getHeaderTitle();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getMetaDescription()
    {
        return $this->helper->getResultData()->getMetaDescription();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getMetaKeywords()
    {
        return $this->helper->getResultData()->getMetaKeywords();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getRelCanonical()
    {
        return $this->helper->getResultData()->getRelCanonical();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getTopText()
    {
        return $this->helper->getResultData()->getResponseData()->getTopText();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getRelated()
    {
        return $this->helper->getResultData()->getResponseData()->getRelated();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getBreadCrumb()
    {
        return $this->helper->getResultData()->getResponseData()->getBreadCrumb();
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getTitle()
    {
        return $this->helper->getResultData()->getResponseData()->getTitle();
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws LocalizedException
     * @throws NotFoundException
     */
    public function getHawkTrackingData()
    {
        return $this->helper->getTrackingDataHtml();
    }

    /**
     * @return string
     * @throws LocalizedException
     * @throws \Exception
     */
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

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getHawksearchTrackingId()
    {
        return $this->helper->getResultData()->getTrackingId();
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getTabs()
    {
        return $this->helper->getResultData()->getResponseData()->getTabs() ?? '';
    }
}
